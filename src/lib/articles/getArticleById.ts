import { db } from "@/lib/firebase";
import { adminDb } from "@/lib/firebaseAdmin";

export async function getArticleById(id: string) {
  const ref = adminDb.collection("articles").doc(id);
  const snap = await ref.get();

  if (!snap.exists) return null;

  const data = snap.data()!;

  if (data.status !== "published") return null;

  return {
    id: snap.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    authorName: data.authorName,
    coverImage: data.coverImage,
    coverImagePosition: data.coverImagePosition,
    coverImageAlt: data.coverImageAlt,
    readTime: data.readTime,
    metaDescription: data.metaDescription,
    publishedAt: data.publishedAt?.toDate?.().toISOString() ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
  };
}
