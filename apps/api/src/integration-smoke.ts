// Integration smoke: runs only against an isolated disposable PostgreSQL test database.
// No real phone numbers or SMS provider involved.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import { join, resolve } from "node:path";
import { Pool } from "pg";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";

const origin = "http://localhost:3000";
const ownerPhone = "+15550001001";
const clinicianPhone = "+15550001002";
const guestPhone = "+15550001003";
const messages: string[] = [];

async function startSmsMock(): Promise<{ url: string; close: () => Promise<void> }> {
  const server = createServer((req, res) => {
    if (req.method !== "POST" || req.headers.authorization !== "Bearer local-test") {
      res.writeHead(401).end();
      return;
    }
    let body = "";
    req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const json = JSON.parse(body) as { message: string };
        messages.push(json.message);
        res.writeHead(200, { "content-type": "application/json" }).end("{}");
      } catch { res.writeHead(400).end(); }
    });
  });
  await new Promise<void>((accept) => server.listen(0, "127.0.0.1", accept));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("SMS mock cannot bind");
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((accept, reject) => server.close((err) => err ? reject(err) : accept())) };
}

type Session = { accountId: string; cookie: string };
async function run(): Promise<void> {
  if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes("127.0.0.1")) {
    throw new Error("Refusing to run integration smoke outside local test PostgreSQL");
  }
  const db = new Pool({ connectionString: process.env.DATABASE_URL });
  const sms = await startSmsMock();
  process.env.WEB_ORIGIN = origin;
  process.env.SMS_ENDPOINT_URL = sms.url;
  process.env.SMS_BEARER_TOKEN = "local-test";
  process.env.OTP_PEPPER = "integration-only-test-pepper-with-at-least-32-characters";
  process.env.SESSION_COOKIE_SECURE = "false";
  let app: Awaited<ReturnType<typeof NestFactory.create>> | undefined;

  try {
    for (const file of ["001_initial.sql", "002_identity.sql"]) {
      const migration = await fs.readFile(resolve(process.cwd(), "../../db/migrations", file), "utf8");
      await db.query(migration);
    }
    app = await NestFactory.create(AppModule, { logger: false });
    app.setGlobalPrefix("v1");
    await app.listen(0, "127.0.0.1");
    const address = app.getHttpServer().address();
    if (!address || typeof address === "string") throw new Error("API not listening");
    const base = `http://127.0.0.1:${address.port}/v1`;

    async function req(path: string, options: RequestInit = {}, cookie?: string): Promise<Response> {
      return fetch(base + path, {
        ...options,
        headers: { origin, ...(cookie ? { cookie } : {}), ...(options.headers ?? {}) },
      });
    }

    async function signIn(phone: string): Promise<Session> {
      const start = await req("/auth/request-otp", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      assert.equal(start.status, 201, "OTP requested");
      const match = /([0-9]{6})/.exec(messages.at(-1) ?? "");
      assert.ok(match, "SMS mock captures OTP code");
      const verified = await req("/auth/verify-otp", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, code: match[1] }),
      });
      assert.equal(verified.status, 201, "OTP accepted");
      const cookie = verified.headers.get("set-cookie")?.split(";")[0];
      assert.ok(cookie?.startsWith("vet_session="), "session cookie");
      const info = (await verified.json()) as { accountId: string };
      return { accountId: info.accountId, cookie };
    }

    const noSession = await req("/pets");
    assert.equal(noSession.status, 401, "anonymous list denied");

    const owner = await signIn(ownerPhone);
    const clinician = await signIn(clinicianPhone);
    const guest = await signIn(guestPhone);

    const create = await req("/pets", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Sample Iguana", speciesCode: "other", customSpecies: "ایگوانا", sex: "unknown" }),
    }, owner.cookie);
    assert.equal(create.status, 201, "pet created");
    const payload = (await create.json()) as { pet: { id: string; species_label: string } };
    assert.equal(payload.pet.species_label, "ایگوانا");
    const petId = payload.pet.id;
    assert.equal((await req("/pets/" + petId, {}, guest.cookie)).status, 404, "IDOR denied");

    const clinicRecord = await db.query<{ id: string }>(
      "INSERT INTO clinics(legal_name, verified_at) VALUES($1,now()) RETURNING id", ["Test Clinic"],
    );
    const clinicId = clinicRecord.rows[0].id;
    await db.query(
      "INSERT INTO clinic_memberships(clinic_id,account_id,role,verified_at) VALUES($1,$2,'veterinarian',now())",
      [clinicId, clinician.accountId],
    );

    const before = await req("/clinic/patients", {}, clinician.cookie);
    assert.deepEqual(((await before.json()) as { patients: unknown[] }).patients, [], "no patient without consent");

    const grant = await req(`/pets/${petId}/grants`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ clinicId, scope: "read_summary", durationDays: 7 }),
    }, owner.cookie);
    assert.equal(grant.status, 201, "owner grant created");
    const grantId = ((await grant.json()) as { grant: { id: string } }).grant.id;

    const visible = await req("/clinic/patients", {}, clinician.cookie);
    const patients = ((await visible.json()) as { patients: Array<{ id: string }> }).patients;
    assert.equal(patients.length, 1);
    assert.equal(patients[0].id, petId);

    const forbiddenRevoke = await req(`/pets/${petId}/grants/${grantId}/revoke`, { method: "POST" }, guest.cookie);
    assert.equal(forbiddenRevoke.status, 404, "stranger cannot revoke");

    const revoke = await req(`/pets/${petId}/grants/${grantId}/revoke`, { method: "POST" }, owner.cookie);
    assert.equal(revoke.status, 201);
    const after = await req("/clinic/patients", {}, clinician.cookie);
    assert.deepEqual(((await after.json()) as { patients: unknown[] }).patients, [], "revoke takes effect immediately");

    const logout = await req("/auth/logout", { method: "POST" }, owner.cookie);
    assert.equal(logout.status, 201);
    assert.equal((await req("/auth/me", {}, owner.cookie)).status, 401, "session revocation");
    console.log("Integration smoke passed: OTP, owner scoping, multi-species, clinic consent and revoke");
  } finally {
    await app?.close();
    await db.end();
    await sms.close();
  }
}
void run().catch((error) => { console.error(error); process.exitCode = 1; });
