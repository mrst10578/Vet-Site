import { describe, expect, it } from "vitest";
import { normalizeSpecies } from "./species";

describe("normalizeSpecies", () => {
  it("supports common domestic species", () => {
    expect(normalizeSpecies({ speciesCode: "bird" })).toBe("پرنده");
  });
  it("supports any named species without hard-coded clinical schedules", () => {
    expect(normalizeSpecies({ speciesCode: "other", customSpecies: "ایگوانا" })).toBe("ایگوانا");
  });
  it("rejects empty or unrecognized submissions", () => {
    expect(() => normalizeSpecies({ speciesCode: "other", customSpecies: " " })).toThrow();
    expect(() => normalizeSpecies({ speciesCode: "unknown" })).toThrow();
  });
});
