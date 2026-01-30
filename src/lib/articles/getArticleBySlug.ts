import { adminDb } from "@/lib/firebaseAdmin";

export async function getArticleBySlug(slug: string) {
  if (!slug) {
    return null;
  }

  try {
    const snap = await adminDb
      .collection("articles")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

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
      metaDescription: data.metaDescription,
      publishedAt: data.publishedAt?.toDate?.().toISOString() ?? null,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.().toISOString() ?? null,
    };
  } catch (err) {
    console.error("Firestore error:", err);
    return null;
  }
}