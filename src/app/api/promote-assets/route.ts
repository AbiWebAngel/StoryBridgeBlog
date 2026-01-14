import { NextResponse } from "next/server";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

export async function POST(req: Request) {
  const { urls } = await req.json();

  if (!Array.isArray(urls)) {
    return NextResponse.json({ error: "Invalid urls" }, { status: 400 });
  }

  const results: Record<string, string> = {};

  for (const url of urls) {
    const parsed = new URL(url);
    const oldKey = parsed.pathname.replace(/^\//, "");

    if (!oldKey.startsWith("tmp/")) {
      results[url] = url; // already permanent
      continue;
    }

    const newKey = oldKey.replace(/^tmp\/[^/]+\//, "");

    await r2.send(
      new CopyObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        CopySource: `${process.env.CLOUDFLARE_R2_BUCKET}/${oldKey}`,
        Key: newKey,
      })
    );

    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
        Key: oldKey,
      })
    );

    results[url] = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${newKey}`;
  }

  return NextResponse.json({ replacements: results });
}
