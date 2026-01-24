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

  const file = formData.get("file") as File | null;
  const articleId = formData.get("articleId") as string | null;
  const assetType = (formData.get("assetType") as string) || "content";
  const folder = formData.get("folder") as string | null;
  const sessionId = formData.get("sessionId") as string | null;
  const draft = formData.get("draft") === "true";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const isSvg = file.type === "image/svg+xml";

  //-------------------------------------
  // Metadata + checks
  //-------------------------------------
  const metadata = await sharp(originalBuffer, { animated: true }).metadata();
  const format = metadata.format; // jpeg | png | gif | webp | avif | svg
  const isGif = format === "gif";
  const isAnimated = !!metadata.pages && metadata.pages > 1;

  const tooLarge =
    (metadata.width ?? 0) > 1600 ||
    (metadata.height ?? 0) > 1600;

  const alreadyOptimized =
    (format === "webp" && !tooLarge) ||
    (format === "avif" && !tooLarge && !isAnimated);

  let body: Buffer;
  let contentType: string;
  let extension: string;

  //-------------------------------------
  // SVG: passthrough
  //-------------------------------------
  if (isSvg) {
    body = originalBuffer;
    contentType = "image/svg+xml";
    extension = "svg";

  //-------------------------------------
  // GIF → animated WebP
  //-------------------------------------
  } else if (isGif) {
    let transformer = sharp(originalBuffer, { animated: true }).rotate();

    if (tooLarge) {
      transformer = transformer.resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    body = await transformer
      .webp({
        quality: 80,
        effort: 4,
        loop: 0, // preserve infinite loop
      })
      .toBuffer();

    contentType = "image/webp";
    extension = "webp";

  //-------------------------------------
  // Already optimized (safe passthrough)
  //-------------------------------------
  } else if (alreadyOptimized) {
    body = originalBuffer;
    contentType = file.type;
    extension = format!;

  //-------------------------------------
  // Static images → AVIF
  //-------------------------------------
  } else {
    let transformer = sharp(originalBuffer).rotate();

    if (tooLarge) {
      transformer = transformer.resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    body = await transformer
      .avif({
        quality: tooLarge ? 75 : 80,
        effort: 4,
      })
      .toBuffer();

    contentType = "image/avif";
    extension = "avif";
  }

  //-------------------------------------
  // Generate R2 key
  //-------------------------------------
  let key: string;

  if (articleId) {
    key = `articles/${articleId}/${assetType}/${crypto.randomUUID()}.${extension}`;
  } else if (folder) {
    const baseFolder =
      draft && sessionId
        ? `tmp/${sessionId}/${folder}`
        : folder;

    key = `${baseFolder}/${crypto.randomUUID()}.${extension}`;
  } else {
    return NextResponse.json(
      { error: "Missing articleId or folder" },
      { status: 400 }
    );
  }

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

  return NextResponse.json({
    url: `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`,
  });
}
