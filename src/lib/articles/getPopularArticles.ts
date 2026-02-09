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
  readCount: number;
}

export async function getPopularArticles(limitCount = 5): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    where("status", "==", "published"),
    orderBy("readCount", "desc"),
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
        data.metaDescription ||
        "",
      coverImage: data.coverImage,
      slug: data.slug,
      readCount: data.readCount ?? 0,
    };
  });
}
