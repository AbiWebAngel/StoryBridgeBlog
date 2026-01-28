"use client";

import { useMemo, useState } from "react";
import AllArticles from "./AllArticles";

const ITEMS_PER_PAGE = 9;

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  category?: string;
  updatedAt: string | number | Date;
}

export default function ArticleFilters({
  articles,
}: {
  articles: Article[];
}) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);

  /* ---------------- filtering pipeline ---------------- */

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q);

      return matchesSearch;
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

  /* ---------------- render ---------------- */

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto">
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
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
          className="w-full sm:w-[280px] px-4 py-2 rounded-full border-4 border-[#805C2C] text-base text-[#403727] placeholder-[#403727] focus:outline-none focus:ring-2 focus:ring-[#805D2D]/40 font-inter"
        />
      </div>

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