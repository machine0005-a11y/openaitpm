import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { unlockCookieName, verifyUnlock } from "@/lib/paywall";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/scene/<slug>/<file>
// Serves the PAID gallery scene images. Unlike /public assets, these live in
// src/content/idea-images/ (not statically served) and require a valid unlock
// cookie — so the locked 87% can't be fetched by guessing URLs.
const MIME: Record<string, string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png"
};

type SceneRouteProps = {
  params: Promise<{ slug: string; file: string }>;
};

export async function GET(req: NextRequest, { params }: SceneRouteProps) {
  const { slug, file } = await params;

  if (!/^[a-z0-9-]{1,80}$/i.test(slug) || !/^[a-z0-9-]{1,40}\.(webp|jpe?g|png)$/i.test(file)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(unlockCookieName(slug))?.value;
  if (!verifyUnlock(slug, token)) {
    return NextResponse.json({ error: "locked" }, { status: 403 });
  }

  try {
    const data = await readFile(join(process.cwd(), "src", "content", "idea-images", slug, file));
    const ext = file.split(".").pop()!.toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "content-type": MIME[ext] ?? "application/octet-stream",
        // Private: this asset is paid content tied to the visitor's cookie.
        "cache-control": "private, max-age=3600"
      }
    });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
