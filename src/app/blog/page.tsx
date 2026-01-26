import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { extractExcerptFromBody } from "@/lib/articles/extractExcerpt";
import AllArticles from "@/components/blog/AllArticles";


export const revalidate = 300; // ISR: refresh every 5 minutes

export const metadata = {
  title: "Latest Blog Posts | StoryBridge",
  description: "Read the latest stories, ideas, and insights from StoryBridge.",
};

const ITEMS_PER_PAGE = 6;
const PREFETCH_PAGES = 3;

export default async function BlogPage() {
  const q = query(
    collection(db, "articles"),
    where("status", "==", "published"),
    orderBy("updatedAt", "desc"),
    limit(ITEMS_PER_PAGE * PREFETCH_PAGES)
  );

  const snapshot = await getDocs(q);

  const articles = snapshot.docs.map((doc) => {
    const d = doc.data();

    return {
      id: doc.id,
      title: d.title,
      slug: d.slug,
      coverImage: d.coverImage,
      excerpt: extractExcerptFromBody(d.body, 100),
    };
  });

    return (
    <main className="min-h-screen flex flex-col">
      <AllArticles articles={articles} />
    </main>
  );
}
