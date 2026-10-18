import { NextResponse } from "next/server";
import { commonSpecies } from "@/lib/domain/species";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    species: commonSpecies,
    acceptsCustomSpecies: true,
    clinicalProtocolsAvailable: false,
  });
}
