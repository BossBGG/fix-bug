import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Force Node.js runtime (required for fs module)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Static files patterns that should be served from public folder
const STATIC_FILES = [
  "manifest.json",
  "pwa-sw.js",
  "sw-push.js",
  "firebase-messaging-sw.js",
  "env-config.js",
  "icon-wom-192x192.png",
  "icon-wom-512x512.png",
];

// Patterns for files with dynamic hashes (workbox-*.js, fallback-*.js)
const STATIC_FILE_PATTERNS = [
  /^workbox-[a-f0-9]+\.js$/,
  /^fallback-[a-f0-9]+\.js$/,
];

function isAllowedFile(filename: string): boolean {
  if (STATIC_FILES.includes(filename)) return true;
  return STATIC_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

// Content types mapping
const CONTENT_TYPES: Record<string, string> = {
  ".json": "application/json",
  ".js": "application/javascript",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const filename = pathSegments.join("/");

  // Only serve allowed static files
  if (!isAllowedFile(filename)) {
    console.log(`[Static Route] Blocked: ${filename}`);
    return new NextResponse("Not Found", { status: 404 });
  }

  console.log(`[Static Route] Serving: ${filename}`);
  console.log(`[Static Route] CWD: ${process.cwd()}`);

  // Debug: List what's in /app directory
  try {
    const appDirContents = fs.readdirSync("/app");
    console.log(`[Static Route] /app contents:`, appDirContents);

    if (fs.existsSync("/app/static-assets")) {
      const staticAssetsContents = fs.readdirSync("/app/static-assets");
      console.log(
        `[Static Route] /app/static-assets contents:`,
        staticAssetsContents
      );
    } else {
      console.log(`[Static Route] /app/static-assets does NOT exist`);
    }

    if (fs.existsSync("/app/public")) {
      const publicContents = fs.readdirSync("/app/public");
      console.log(`[Static Route] /app/public contents:`, publicContents);
    } else {
      console.log(`[Static Route] /app/public does NOT exist`);
    }
  } catch (debugErr) {
    console.error(`[Static Route] Debug error:`, debugErr);
  }

  try {
    // Try multiple paths - including standalone output paths and static-assets backup
    const possiblePaths = [
      // Primary: static-assets folder (not affected by volume mount)
      `/app/static-assets/${filename}`,
      path.join(process.cwd(), "static-assets", filename),
      // Fallback: public folder
      path.join(process.cwd(), "public", filename),
      `/app/public/${filename}`,
      // Other possible locations
      path.join(process.cwd(), ".next/standalone/public", filename),
      path.join(process.cwd(), ".next/static", filename),
      `/app/runtime-env/${filename}`,
    ];

    let fileContent: Buffer | null = null;
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        fileContent = fs.readFileSync(filePath);
        break;
      }
    }

    if (!fileContent) {
      console.error(`[Static Route] File not found in any path: ${filename}`);
      console.error(`[Static Route] Searched paths:`, possiblePaths);
      return new NextResponse(`// ${filename} not found`, {
        status: 404,
        headers: { "Content-Type": "application/javascript" },
      });
    }

    const ext = path.extname(filename);
    const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=0, must-revalidate",
    };

    // Add Service-Worker-Allowed header for service worker files
    if (filename.includes("sw")) {
      headers["Service-Worker-Allowed"] = "/";
    }

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const body = new Uint8Array(fileContent);
    return new NextResponse(body, { headers });
  } catch (error) {
    console.error(`Error serving ${filename}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
