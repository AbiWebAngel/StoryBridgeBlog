"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  category?: string;
}

export default function AllArticles({
  articles,
}: {
  articles: Article[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  /* --------------------------------
   Filtering + Search (memoized)
  --------------------------------- */
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || article.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [articles, search, category]);

  if (!articles || articles.length === 0) {
    return (
      <p className="text-center text-gray-600">
        No articles yet. Fresh ink coming soon ✍️
      </p>
    );
  }

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 max-w-[1400px] mx-auto">
      {/* --------------------------------
          Top Controls
      --------------------------------- */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        {/* Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#CF822A]"
        >
          <option value="all">All Categories</option>
          <option value="news">News</option>
          <option value="stories">Stories</option>
          <option value="guides">Guides</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-[280px] px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#CF822A]"
        />
      </div>

      {/* --------------------------------
          Articles Grid
      --------------------------------- */}
      <div className="flex flex-wrap -mx-4">
        {filteredArticles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group block px-4 mb-8 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
          >
            <article className="h-full w-full rounded-lg bg-[#F2ECE3] overflow-hidden shadow-md hover:shadow-xl transition">
              {/* Image */}
              <div className="relative w-full">
                <Image
                  src={article.coverImage || "/assets/images/placeholder.jpg"}
                  alt={article.title}
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-3 flex-1 w-full">
                <h3 className="font-cinzel text-lg font-bold text-[#413320] line-clamp-2">
                  {article.title}
                </h3>

                <p className="font-inter text-sm text-[#413320] line-clamp-3">
                  {article.excerpt}
                </p>

                <span className="mt-auto block w-full text-right font-inter text-sm font-bold text-[#CF822A] group-hover:underline">
                  Read more →
                </span>

              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* --------------------------------
          Empty State (after filtering)
      --------------------------------- */}
      {filteredArticles.length === 0 && (
        <p className="text-center mt-12">
          No articles match your search 🤷‍♂️
        </p>
      )}
    </section>
  );
}