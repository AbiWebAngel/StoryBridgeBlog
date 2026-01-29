"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import AllArticles from "./AllArticles";
import { useSearchParams } from "next/navigation";


const ITEMS_PER_PAGE = 9;

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  updatedAt: string | number | Date;
  tags: string;
}


export default function ArticleFilters({
  articles,
  filterPanel,
}: {
  articles: Article[];
  filterPanel?: ReactNode;
}) {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? ""; // only prefill for search query
  const urlTag = searchParams.get("tag") ?? "";       // used for filtering only

  const [search, setSearch] = useState(urlSearch);

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  /* ---------------- filtering pipeline ---------------- */

  const filteredAndSorted = useMemo(() => {
  const searchQ = search.trim().toLowerCase();
  const tagQ = urlTag.trim().toLowerCase();

  const filtered = articles.filter((a) => {
    const matchesTag = tagQ
      ? Array.isArray(a.tags) && a.tags.some(t => t.toLowerCase() === tagQ)
      : true;

    const matchesSearch = searchQ
      ? a.title.toLowerCase().includes(searchQ) ||
        a.excerpt.toLowerCase().includes(searchQ)
      : true;

    return matchesTag && matchesSearch;
  });


    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [articles, search, sortOrder]);

  /* ---------------- pagination ---------------- */

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);

  const paginatedArticles = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, page]);

useEffect(() => {
  setPage(1);
}, [urlSearch, urlTag]);



  /* ---------------- render ---------------- */

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto">
      
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
       
        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value as "newest" | "oldest")
          }
          className="px-4 py-2 rounded-full border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#CF822A] font-inter text-base"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="">Most popular</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search blogs…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-[280px] px-4 py-2 rounded-full border-4 border-[#805C2C] text-base text-[#403727] placeholder-[#403727] focus:outline-none focus:ring-2 focus:ring-[#805D2D]/40 font-inter font-boldP"
        />
      </div>

      {/* Row 2: filter toggle button */}
      {filterPanel}

      {/* Articles */}
      <AllArticles articles={paginatedArticles} />

      {/* Empty state */}
      {filteredAndSorted.length === 0 && (
        <p className="text-center mt-12">
          No articles match your search 🤷‍♂️
        </p>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-12">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-bold disabled:opacity-40 text-[#403727]"
          >
            ← Prev
          </button>

          <span className="text-sm font-semibold text-[#403727]">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-bold disabled:opacity-40 text-[#403727]"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}