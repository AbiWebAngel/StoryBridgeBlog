import { Suspense } from "react";
import { collection, getDocs, orderBy, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { extractExcerptFromBody } from "@/lib/articles/extractExcerpt";
import ArticleFilters from "@/components/blog/ArticleFilters";
import BlogFiltersWrapper from "@/components/blog/BlogFiltersWrapper";
import { getHomeContent } from "@/lib/getHomeContent";
import ArticleFiltersSuspense from "@/components/blog/ArticleFiltersSuspense";
import BlogPageClient from "@/components/blog/BlogPageClient";

export const revalidate = 300;

export const metadata = {
  title: "Latest Blog Posts | StoryBridge",
  description: "Read the latest stories, ideas, and insights from StoryBridge.",
};

const ITEMS_PER_PAGE = 9;
const PREFETCH_PAGES = 2;

const homeContent = await getHomeContent();

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
      tags: d.tags,
      coverImage: d.coverImage,
      category: d.category ?? "general",
      excerpt: extractExcerptFromBody(d.body, 100),
      updatedAt: d.updatedAt?.toDate?.() ?? d.updatedAt,
    };
  });

  return (
  <main className="min-h-screen">
    <ArticleFiltersSuspense
      articles={articles}
      filterPanel={<BlogFiltersWrapper tags={homeContent?.searchTags} />}
    />

  </main>
  );
}

function BlogLoading() {
  return (
    <div className="flex justify-center py-24 text-lg font-semibold text-[#403727]">
      Loading blogs…
    </div>
  );
}
