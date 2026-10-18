export const commonSpecies = [
  { code: "dog", label: "سگ" },
  { code: "cat", label: "گربه" },
  { code: "bird", label: "پرنده" },
  { code: "rabbit", label: "خرگوش" },
  { code: "rodent", label: "جونده" },
  { code: "reptile", label: "خزنده" },
  { code: "fish", label: "ماهی" },
  { code: "other", label: "گونه دیگر" },
] as const;

export type PetSpeciesInput = {
  speciesCode: string;
  customSpecies?: string;
};

export function normalizeSpecies(input: PetSpeciesInput): string {
  const code = input.speciesCode.trim().toLowerCase();
  const selected = commonSpecies.find((species) => species.code === code);
  if (selected && code !== "other") return selected.label;
  if (code !== "other") throw new Error("گونه انتخابی معتبر نیست.");
  const value = input.customSpecies?.normalize("NFC").trim() ?? "";
  if (value.length < 2 || value.length > 80) {
    throw new Error("نام گونه باید بین ۲ تا ۸۰ نویسه باشد.");
  }
  return value;
}

// A pet's species never implies an automatic vaccine protocol or medication dosage.
