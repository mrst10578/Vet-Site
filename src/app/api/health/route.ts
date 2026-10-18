import { NextResponse } from "next/server";

// This endpoint is a static build-status marker in Cloudflare Pages export.
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "petora-web",
    stage: "public-preview",
    clinicalDataConnected: false,
  });
}
