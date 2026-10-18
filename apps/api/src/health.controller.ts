import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { DatabaseService } from "./database.service";

@Controller("health")
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async health() {
    try {
      await this.db.query("SELECT 1");
      return { status: "ok", service: "vet-site-api", dataSource: "postgres" };
    } catch {
      throw new ServiceUnavailableException("Database health check failed");
    }
  }
}
