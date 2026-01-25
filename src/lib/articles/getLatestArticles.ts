import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { extractExcerptFromBody } from "@/lib/articles/extractExcerpt";

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
}

export async function getLatestArticles(limitCount = 6): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title,
      excerpt:
        extractExcerptFromBody(data.body, 90) ||
        data.metaDescription || // nice fallback
        "",
      coverImage: data.coverImage,
      slug: data.slug,
    };
  });
}
