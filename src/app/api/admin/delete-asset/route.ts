import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

// Extract object key from full R2 URL
function extractKeyFromUrl(url: string): string | null {
  // Examples supported:
  // https://pub-xxx.r2.dev/folder/file.webp
  // https://mycdn.com/folder/file.webp
  // https://<bucket>.<account>.r2.cloudflarestorage.com/folder/file.webp

  try {
    const parsed = new URL(url);

    // First attempt: split on domain suffix used by public R2 buckets
    const r2Public = parsed.href.split(".r2.dev/");
    if (r2Public.length === 2) return r2Public[1];

    // Second attempt: split on cloudflarestorage.com bucket URL
    const r2Direct = parsed.href.split(".r2.cloudflarestorage.com/");
    if (r2Direct.length === 2) return r2Direct[1];

    // Third attempt: custom domains → use pathname without leading slash
    if (parsed.pathname) return parsed.pathname.replace(/^\//, "");

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid URL" },
        { status: 400 }
      );
    }

    const key = extractKeyFromUrl(url);

    if (!key) {
      return NextResponse.json(
        { error: "Could not extract R2 key from URL", url },
        { status: 400 }
      );
    }

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        Key: key,
      })
    );

    return NextResponse.json({ success: true, deleted: key });
  } catch (err: any) {
    console.error("R2 delete error:", err);
    return NextResponse.json(
      { error: "Failed to delete object", details: err.message },
      { status: 500 }
    );
  }
}
