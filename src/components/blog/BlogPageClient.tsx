"use client";

import { Suspense } from "react";
import ArticleFilters from "./ArticleFilters";
import BlogFiltersWrapper from "./BlogFiltersWrapper";

export default function BlogPageClient({
  articles,
  tags,
}: {
  articles: any[];
  tags?: string[];
}) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24 text-lg font-semibold text-[#403727]">
          Loading blogs…
        </div>
      }
    >
      <ArticleFilters
        articles={articles}
        filterPanel={<BlogFiltersWrapper tags={tags} />}
      />
    </Suspense>
  );
}
