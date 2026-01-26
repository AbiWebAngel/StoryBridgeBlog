import { adminDb } from "@/lib/firebaseAdmin";
import type { Article } from "./types";

export async function getArticleBySlug(slug: string) {
    console.log("[getArticleBySlug] slug received:", slug);

  if (!slug) {
    console.error("[getArticleBySlug] Missing slug → returning null");
    return null;
  }


  try {
    console.log("[getArticleBySlug] Querying Firestore...");
    const snap = await adminDb
    .collection("articles")
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();


    console.log("[getArticleBySlug] Query results:", snap.docs.length);
    if (snap.empty) return null;
    const doc = snap.docs[0];
    const data = doc.data();


     return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    authorName: data.authorName,
    coverImage: data.coverImage,
    coverImagePosition: data.coverImagePosition,
    coverImageAlt: data.coverImageAlt,
    readTime: data.readTime,

    publishedAt: data.publishedAt?.toDate?.().toISOString() ?? null,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
  };
  } catch (err) {
    console.error("Firestore error:", err);
    return null;
  }
}
