import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const isSvg = file.type === "image/svg+xml";

  let body: Buffer;
  let contentType: string;
  let extension: string;

  if (isSvg) {
    body = buffer;
    contentType = "image/svg+xml";
    extension = "svg";
  } else {
    body = await sharp(buffer)
      .webp({ quality: 80 }) // ✅ WebP
      .toBuffer();

    contentType = "image/webp";
    extension = "webp";
  }

  const key = `${folder}/${crypto.randomUUID()}.${extension}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return NextResponse.json({
    url: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`,
  });
}

export async function deleteAsset(url: string) {
  const key = url.split(".r2.dev/")[1];
  if (!key) return;

  await fetch("/api/admin/delete-asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}

