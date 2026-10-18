import { NextResponse } from "next/server";
import { commonSpecies } from "@/lib/domain/species";

export function GET() {
  return NextResponse.json({
    species: commonSpecies,
    acceptsCustomSpecies: true,
    clinicalProtocolsAvailable: false,
  });
}
