import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { extractArticleAssets } from "@/lib/articles/extractArticleAssets";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

function extractKeyFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, "");
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { articleId } = await req.json();

    if (!articleId) {
      return NextResponse.json({ error: "Missing articleId" }, { status: 400 });
    }

    const ref = adminDb.collection("articles").doc(articleId);
    const snap = await ref.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const article = snap.data()!;

    const usedAssets = extractArticleAssets({
      coverImage: article.coverImage,
      body: article.body,
    });

    const uploadedAssets: string[] = article.uploadedAssets ?? [];

    const assetUrls = Array.from(
      new Set([...usedAssets, ...uploadedAssets])
    );

    // 🔥 Delete R2 objects first
    await Promise.all(
      assetUrls.map(async (url) => {
        const key = extractKeyFromUrl(url);
        if (!key) return;

        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
            Key: key,
          })
        );
      })
    );

    // 🧹 Delete Firestore doc LAST
    // 🔥 Delete subcollections first
    await adminDb.recursiveDelete(ref);

    // (recursiveDelete already deletes the doc itself)


    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Article delete failed:", err);
    return NextResponse.json(
      { error: "Delete failed", details: err.message },
      { status: 500 }
    );
  }
}
