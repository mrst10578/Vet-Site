import {
  BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req,
} from "@nestjs/common";
import type { Request } from "express";
import { DatabaseService } from "./database.service";
import { AuthService } from "./auth.service";

type Pet = {
  id: string;
  name: string;
  species_label: string;
  breed: string | null;
  sex: "female" | "male" | "unknown";
  birth_date: string | null;
};

const allowedSpecies: Record<string, string> = {
  dog: "سگ", cat: "گربه", bird: "پرنده", rabbit: "خرگوش",
  rodent: "جونده", reptile: "خزنده", fish: "ماهی",
};

function requiredText(value: unknown, field: string, limit: number): string {
  if (typeof value !== "string") throw new BadRequestException(`${field} must be a string`);
  const normalized = value.normalize("NFC").trim();
  if (!normalized || normalized.length > limit) throw new BadRequestException(`${field} length invalid`);
  return normalized;
}

function parsePet(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new BadRequestException("Expected pet object");
  const data = raw as Record<string, unknown>;
  const name = requiredText(data.name, "name", 120);
  const code = requiredText(data.speciesCode, "speciesCode", 30).toLowerCase();
  const species = code === "other"
    ? requiredText(data.customSpecies, "customSpecies", 80)
    : allowedSpecies[code];
  if (!species || species.length < 2) throw new BadRequestException("Unsupported species input");
  const breed = data.breed == null || data.breed === "" ? null : requiredText(data.breed, "breed", 120);
  const sex = data.sex ?? "unknown";
  if (sex !== "female" && sex !== "male" && sex !== "unknown") throw new BadRequestException("Invalid sex");
  const birthDate = data.birthDate == null || data.birthDate === "" ? null : data.birthDate;
  if (birthDate !== null) {
    if (typeof birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new BadRequestException("Invalid birthDate");
    const parsed = new Date(birthDate + "T00:00:00Z");
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== birthDate ||
        birthDate > new Date().toISOString().slice(0, 10)) throw new BadRequestException("Invalid birthDate");
  }
  return { name, species, breed, sex, birthDate };
}

@Controller("pets")
export class PetsController {
  constructor(private readonly auth: AuthService, private readonly db: DatabaseService) {}

  @Get()
  async list(@Req() request: Request) {
    const account = await this.auth.currentAccount(request);
    const result = await this.db.query<Pet>(
      `SELECT id,name,species_label,breed,sex,birth_date FROM pets
       WHERE primary_owner_id=$1 AND archived_at IS NULL ORDER BY created_at DESC LIMIT 100`,
      [account.id],
    );
    return { pets: result.rows };
  }

  @Post()
  async create(@Req() request: Request, @Body() body: unknown) {
    this.auth.assertTrustedOrigin(request);
    const account = await this.auth.currentAccount(request);
    const pet = parsePet(body);
    const result = await this.db.transaction(async (client) => {
      const inserted = await client.query<Pet>(
        `INSERT INTO pets(primary_owner_id,name,species_label,breed,sex,birth_date)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id,name,species_label,breed,sex,birth_date`,
        [account.id, pet.name, pet.species, pet.breed, pet.sex, pet.birthDate],
      );
      await client.query(
        "INSERT INTO audit_events(actor_account_id,event_type,resource_type,resource_id) VALUES ($1,'pet.create','pet',$2)",
        [account.id, inserted.rows[0].id],
      );
      return inserted.rows[0];
    });
    return { pet: result };
  }

  @Get(":id")
  async detail(@Req() request: Request, @Param("id") id: string) {
    const account = await this.auth.currentAccount(request);
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new NotFoundException("Pet not found");
    const result = await this.db.query<Pet>(
      `SELECT id,name,species_label,breed,sex,birth_date FROM pets
       WHERE id=$1 AND primary_owner_id=$2 AND archived_at IS NULL LIMIT 1`,
      [id, account.id],
    );
    if (!result.rows.length) throw new NotFoundException("Pet not found");
    return { pet: result.rows[0] };
  }
}
