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

//-------------------------------------
// Upload Route
//-------------------------------------
export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const folder = (formData.get("folder") as string) || "misc";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const isSvg = file.type === "image/svg+xml";
  const MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
  const isLarge = originalBuffer.length > MAX_SIZE_BYTES;

  let body: Buffer;
  let contentType: string;
  let extension: string;

  //-------------------------------------
  // Handle SVG files (no compression)
  //-------------------------------------
  if (isSvg) {
    body = originalBuffer;
    contentType = "image/svg+xml";
    extension = "svg";
  } else {
    //-------------------------------------
    // Handle Raster Images (JPEG/PNG/WebP)
    //-------------------------------------
    let transformer = sharp(originalBuffer, { animated: true })
      .rotate(); // auto-fix orientation (important for iPhone images)

    if (isLarge) {
      transformer = transformer.resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    body = await transformer
      .webp({
        quality: isLarge ? 75 : 85, // compress more if it's a big image
      })
      .toBuffer();

    contentType = "image/webp";
    extension = "webp";
  }

  //-------------------------------------
  // Generate R2 key
  //-------------------------------------
  const key = `${folder}/${crypto.randomUUID()}.${extension}`;

  //-------------------------------------
  // Upload to Cloudflare R2
  //-------------------------------------
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  //-------------------------------------
  // Return public URL
  //-------------------------------------
  return NextResponse.json({
    url: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`,
  });
}

//-------------------------------------
// Delete Asset Helper (optional)
//-------------------------------------
export async function deleteAsset(url: string) {
  const key = url.split(".r2.dev/")[1];
  if (!key) return;

  await fetch("/api/admin/delete-asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
}
