import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const source = resolve("cloudflare/petora-preview.mjs");
const destination = resolve(".deploy/petronus-worker.mjs");

const original = await readFile(source, "utf8");
const rebranded = original
  .replaceAll("Petora", "Petronus")
  .replaceAll("petora", "petronus")
  .replaceAll("پتورا", "پترونوس");

if (rebranded.includes("Petora") || rebranded.includes("پتورا")) {
  throw new Error("An obsolete brand name remains in the preview.");
}

await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, rebranded, "utf8");
console.log("Generated .deploy/petronus-worker.mjs");
