import { Module } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { HealthController } from "./health.controller";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PetsController } from "./pets.controller";

@Module({
  controllers: [HealthController, AuthController, PetsController],
  providers: [DatabaseService, AuthService],
})
export class AppModule {}
