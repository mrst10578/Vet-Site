import { Controller, Get, Req } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { DatabaseService } from "./database.service";

type VisiblePatient = {
  id: string;
  name: string;
  species_label: string;
  clinic_id: string;
  clinic_name: string;
  scope: string;
};

@Controller("clinic")
export class ClinicController {
  constructor(private readonly auth: AuthService, private readonly db: DatabaseService) {}

  @Get("patients")
  async patients(@Req() request: Request) {
    const user = await this.auth.currentAccount(request);
    // Explicitly require verified clinic + verified staff + active, scoped owner grant.
    const result = await this.db.query<VisiblePatient>(
      `SELECT DISTINCT p.id,p.name,p.species_label,
        c.id AS clinic_id,c.legal_name AS clinic_name,g.scope
       FROM clinic_memberships m
       JOIN clinics c ON c.id=m.clinic_id
       JOIN clinic_access_grants g ON g.clinic_id=c.id
       JOIN pets p ON p.id=g.pet_id
       WHERE m.account_id=$1
         AND m.role IN ('veterinarian','clinic_admin')
         AND m.verified_at IS NOT NULL AND c.verified_at IS NOT NULL
         AND g.revoked_at IS NULL
         AND (g.expires_at IS NULL OR g.expires_at > now())
         AND p.archived_at IS NULL
       ORDER BY p.name ASC LIMIT 100`,
      [user.id],
    );
    return { patients: result.rows };
  }
}
