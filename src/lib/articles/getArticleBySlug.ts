import { adminDb } from "@/lib/firebaseAdmin";

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

    return snap.docs[0].data();
  } catch (err) {
    console.error("Firestore error:", err);
    return null;
  }
}
