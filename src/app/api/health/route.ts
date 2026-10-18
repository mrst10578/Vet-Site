import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "petcare-web",
    stage: "phase1-foundation",
    clinicalDataConnected: false,
  });
}
