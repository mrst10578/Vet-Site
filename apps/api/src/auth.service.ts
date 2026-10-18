import {
  BadRequestException, ForbiddenException, Injectable, ServiceUnavailableException,
  HttpException, HttpStatus, UnauthorizedException,
} from "@nestjs/common";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { DatabaseService } from "./database.service";

export type SignedInAccount = { id: string; display_name: string; phone_e164: string | null };
type Challenge = { id: string; code_hmac: string; attempts: number; expires_at: Date };

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  assertTrustedOrigin(req: Request): void {
    const expected = process.env.WEB_ORIGIN;
    if (!expected) throw new ServiceUnavailableException("WEB_ORIGIN is not configured");
    if (req.headers.origin !== expected) throw new ForbiddenException("Untrusted origin");
  }

  private phone(raw: unknown): string {
    if (typeof raw !== "string") throw new BadRequestException("Phone number required");
    const phone = raw.trim();
    if (!/^\+[1-9][0-9]{7,14}$/.test(phone)) {
      throw new BadRequestException("Expected E.164 phone number");
    }
    return phone;
  }

  private pepper(): string {
    const secret = process.env.OTP_PEPPER ?? "";
    if (secret.length < 32 || secret.includes("replace-with")) {
      throw new ServiceUnavailableException("OTP service not configured");
    }
    return secret;
  }

  private hashCode(phone: string, code: string): string {
    return createHmac("sha256", this.pepper()).update(`${phone}:${code}`).digest("hex");
  }

  private tokenHash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  private cookieToken(req: Request): string | null {
    const header = req.headers.cookie ?? "";
    const raw = header.split(";").map((part) => part.trim()).find((part) => part.startsWith("vet_session="));
    if (!raw) return null;
    const token = raw.substring("vet_session=".length);
    return /^[a-f0-9]{64}$/.test(token) ? token : null;
  }

  async requestOtp(body: unknown): Promise<{ sent: boolean }> {
    const phone = this.phone((body as { phone?: unknown } | null)?.phone);
    const endpoint = process.env.SMS_ENDPOINT_URL;
    const bearer = process.env.SMS_BEARER_TOKEN;
    if (!endpoint || !bearer) throw new ServiceUnavailableException("SMS gateway not configured");

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const codeHmac = this.hashCode(phone, code);
    const challengeId = await this.db.transaction(async (client): Promise<string> => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [phone]);
      const count = await client.query<{ attempts: string }>(
        "SELECT count(*)::text AS attempts FROM otp_challenges WHERE phone_e164 = $1 AND created_at > now() - interval '1 hour'",
        [phone],
      );
      if (Number(count.rows[0]?.attempts ?? 0) >= 5) throw new HttpException("Hourly request limit reached", HttpStatus.TOO_MANY_REQUESTS);
      const latest = await client.query<{ seconds: string }>(
        "SELECT extract(epoch from (now() - created_at))::text AS seconds FROM otp_challenges WHERE phone_e164 = $1 ORDER BY created_at DESC LIMIT 1",
        [phone],
      );
      if (latest.rows.length && Number(latest.rows[0].seconds) < 60) {
        throw new HttpException("Wait before requesting another code", HttpStatus.TOO_MANY_REQUESTS);
      }
      const result = await client.query<{ id: string }>(
        "INSERT INTO otp_challenges(phone_e164, code_hmac, expires_at) VALUES($1,$2,now() + interval '5 minutes') RETURNING id",
        [phone, codeHmac],
      );
      return result.rows[0].id;
    });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${bearer}` },
        body: JSON.stringify({ to: phone, message: `کد ورود پتورا: ${code} (اعتبار ۵ دقیقه)` }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) throw new Error("SMS gateway rejected message");
    } catch {
      await this.db.query("DELETE FROM otp_challenges WHERE id = $1", [challengeId]);
      throw new ServiceUnavailableException("SMS delivery unavailable");
    }
    return { sent: true };
  }

  async verifyOtp(body: unknown): Promise<{ sessionToken: string; accountId: string }> {
    const payload = (body ?? {}) as { phone?: unknown; code?: unknown };
    const phone = this.phone(payload.phone);
    if (typeof payload.code !== "string" || !/^[0-9]{6}$/.test(payload.code)) {
      throw new BadRequestException("Expected six-digit code");
    }
    const submitted = Buffer.from(this.hashCode(phone, payload.code), "hex");
    const sessionToken = randomBytes(32).toString("hex");
    const sessionHash = this.tokenHash(sessionToken);

    const accountId = await this.db.transaction(async (client): Promise<string | null> => {
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [phone]);
      const result = await client.query<Challenge>(
        "SELECT id, code_hmac, attempts, expires_at FROM otp_challenges WHERE phone_e164 = $1 ORDER BY created_at DESC LIMIT 1 FOR UPDATE",
        [phone],
      );
      const challenge = result.rows[0];
      if (!challenge || challenge.attempts >= 5 || new Date(challenge.expires_at).getTime() <= Date.now()) return null;
      const actual = Buffer.from(challenge.code_hmac, "hex");
      if (submitted.length !== actual.length || !timingSafeEqual(submitted, actual)) {
        await client.query("UPDATE otp_challenges SET attempts = attempts + 1 WHERE id = $1", [challenge.id]);
        return null;
      }
      await client.query("DELETE FROM otp_challenges WHERE phone_e164 = $1", [phone]);
      const account = await client.query<{ id: string }>(
        `INSERT INTO accounts(display_name,phone_e164) VALUES('کاربر پتورا',$1)
         ON CONFLICT(phone_e164) DO UPDATE SET phone_e164=EXCLUDED.phone_e164 RETURNING id`,
        [phone],
      );
      await client.query(
        "INSERT INTO sessions(account_id,token_hash,expires_at) VALUES($1,$2,now() + interval '30 days')",
        [account.rows[0].id, sessionHash],
      );
      await client.query(
        "INSERT INTO audit_events(actor_account_id,event_type,resource_type,resource_id) VALUES($1,'login','account',$1)",
        [account.rows[0].id],
      );
      return account.rows[0].id;
    });
    if (!accountId) throw new UnauthorizedException("Invalid or expired code");
    return { sessionToken, accountId };
  }

  async currentAccount(req: Request): Promise<SignedInAccount> {
    const token = this.cookieToken(req);
    if (!token) throw new UnauthorizedException("Sign-in required");
    const result = await this.db.query<SignedInAccount>(
      `SELECT a.id,a.display_name,a.phone_e164 FROM sessions s
       JOIN accounts a ON a.id=s.account_id
       WHERE s.token_hash=$1 AND s.revoked_at IS NULL AND s.expires_at > now() LIMIT 1`,
      [this.tokenHash(token)],
    );
    if (!result.rows.length) throw new UnauthorizedException("Session expired");
    return result.rows[0];
  }

  async logout(req: Request): Promise<void> {
    const token = this.cookieToken(req);
    if (token) {
      await this.db.query(
        "UPDATE sessions SET revoked_at=now() WHERE token_hash=$1 AND revoked_at IS NULL",
        [this.tokenHash(token)],
      );
    }
  }
}
