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
  const articleId = formData.get("articleId") as string | null;
  const assetType = (formData.get("assetType") as string) || "content";
  const folder = formData.get("folder") as string | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const originalBuffer = Buffer.from(await file.arrayBuffer());
  const isSvg = file.type === "image/svg+xml";

  const metadata = await sharp(originalBuffer).metadata();
  const tooLarge =
    (metadata.width ?? 0) > 1600 || (metadata.height ?? 0) > 1600;

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
      .webp({ quality: tooLarge ? 75 : 85 })
      .toBuffer();

    contentType = "image/webp";
    extension = "webp";
  }

  //-------------------------------------
  // Generate R2 key (AFTER extension exists)
  //-------------------------------------
  let key: string;

  if (articleId) {
    key = `articles/${articleId}/${assetType}/${crypto.randomUUID()}.${extension}`;
  } else if (folder) {
    key = `site/${folder}/${crypto.randomUUID()}.${extension}`;
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

