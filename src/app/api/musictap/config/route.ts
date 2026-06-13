import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json(
    {
      spotifyClientId: process.env.SPOTIFY_CLIENT_ID || "",
      googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID || "",
      appleMusicDeveloperToken: process.env.APPLE_MUSIC_DEVELOPER_TOKEN || "",
      appleMusicStorefront: process.env.APPLE_MUSIC_STOREFRONT || "us"
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    }
  );
}
