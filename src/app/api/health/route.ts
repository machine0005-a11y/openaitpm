import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "person-moment-music-app",
    gate: "0"
  });
}
