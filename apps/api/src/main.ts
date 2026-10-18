import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: false });
  app.setGlobalPrefix("v1");
  app.enableShutdownHooks();
  const port = Number(process.env.API_PORT ?? "4000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid API_PORT");
  await app.listen(port, process.env.API_HOST ?? "127.0.0.1");
}

bootstrap().catch((error: unknown) => {
  console.error("API failed to start", error);
  process.exitCode = 1;
});
