import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { DatabaseService } from "./database.service";

type GrantScope = "read_summary" | "read_records" | "treatment";
type Grant = {
  id: string; clinic_id: string; scope: GrantScope;
  expires_at: Date | null; revoked_at: Date | null; created_at: Date;
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(value: unknown): value is string {
  return typeof value === "string" && uuidPattern.test(value);
}

@Controller("pets/:petId/grants")
export class GrantsController {
  constructor(private readonly auth: AuthService, private readonly db: DatabaseService) {}

  private async ownerAccount(req: Request, petId: string): Promise<string> {
    if (!isUuid(petId)) throw new NotFoundException("Pet not found");
    const account = await this.auth.currentAccount(req);
    const owned = await this.db.query(
      "SELECT id FROM pets WHERE id=$1 AND primary_owner_id=$2 AND archived_at IS NULL LIMIT 1",
      [petId, account.id],
    );
    if (!owned.rowCount) throw new NotFoundException("Pet not found");
    return account.id;
  }

  @Get()
  async list(@Req() request: Request, @Param("petId") petId: string) {
    await this.ownerAccount(request, petId);
    const grants = await this.db.query<Grant>(
      `SELECT id,clinic_id,scope,expires_at,revoked_at,created_at
       FROM clinic_access_grants WHERE pet_id=$1 ORDER BY created_at DESC LIMIT 100`,
      [petId],
    );
    return { grants: grants.rows };
  }

  @Post()
  async create(@Req() request: Request, @Param("petId") petId: string, @Body() body: unknown) {
    this.auth.assertTrustedOrigin(request);
    const ownerId = await this.ownerAccount(request, petId);
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequestException("Invalid grant");
    const data = body as Record<string, unknown>;
    if (!isUuid(data.clinicId)) throw new BadRequestException("Invalid clinicId");
    const scope = data.scope;
    if (scope !== "read_summary" && scope !== "read_records" && scope !== "treatment") {
      throw new BadRequestException("Invalid scope");
    }
    // Access is time-limited. A maximum of 90 days avoids accidental indefinite sharing.
    const days = data.durationDays === undefined ? 30 : data.durationDays;
    if (typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > 90) {
      throw new BadRequestException("durationDays must be 1..90");
    }
    const clinicId = data.clinicId;
    const grant = await this.db.transaction(async (client) => {
      const clinic = await client.query(
        "SELECT id FROM clinics WHERE id=$1 AND verified_at IS NOT NULL LIMIT 1",
        [clinicId],
      );
      if (!clinic.rowCount) throw new BadRequestException("Clinic not verified");
      const added = await client.query<Grant>(
        `INSERT INTO clinic_access_grants(pet_id,clinic_id,granted_by_account_id,scope,expires_at)
         VALUES ($1,$2,$3,$4,now() + ($5::integer * interval '1 day'))
         RETURNING id,clinic_id,scope,expires_at,revoked_at,created_at`,
        [petId, clinicId, ownerId, scope, days],
      );
      await client.query(
        "INSERT INTO audit_events(actor_account_id,event_type,resource_type,resource_id) VALUES($1,'pet.grant.create','clinic_access_grant',$2)",
        [ownerId, added.rows[0].id],
      );
      return added.rows[0];
    });
    return { grant };
  }

  @Post(":grantId/revoke")
  async revoke(@Req() request: Request, @Param("petId") petId: string, @Param("grantId") grantId: string) {
    this.auth.assertTrustedOrigin(request);
    const ownerId = await this.ownerAccount(request, petId);
    if (!isUuid(grantId)) throw new NotFoundException("Grant not found");
    const changed = await this.db.transaction(async (client) => {
      const result = await client.query<Grant>(
        `UPDATE clinic_access_grants SET revoked_at=now()
         WHERE id=$1 AND pet_id=$2 AND revoked_at IS NULL
         RETURNING id,clinic_id,scope,expires_at,revoked_at,created_at`,
        [grantId, petId],
      );
      if (result.rowCount) {
        await client.query(
          "INSERT INTO audit_events(actor_account_id,event_type,resource_type,resource_id) VALUES($1,'pet.grant.revoke','clinic_access_grant',$2)",
          [ownerId, grantId],
        );
      }
      return result.rowCount;
    });
    return { revoked: Boolean(changed) };
  }
}
