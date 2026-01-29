"use client";

import { Suspense } from "react";
import ArticleFilters from "./ArticleFilters";

export default function ArticleFiltersSuspense(props: any) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24 text-lg font-semibold text-[#403727]">
          Loading blogs…
        </div>
      }
    >
      <ArticleFilters {...props} />
    </Suspense>
  );
}
