"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
}

export default function LatestBlogs({
  initialArticles,
}: {
  initialArticles: Article[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(
  (initialArticles?.length ?? 0) / ITEMS_PER_PAGE
);

  const currentItems = initialArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
if (!initialArticles || initialArticles.length === 0) {
  return (
    <p className="text-center text-gray-600">
      No blog posts yet. Stay tuned 👀
    </p>
  );
}

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col items-center space-y-12">
      {currentItems.map((item) => (
        <Link key={item.id} href={`/blog/${item.slug}`} className="block w-full">
          <article className="flex flex-col w-full sm:w-[90%] md:w-[95%] lg:max-w-[1096px] mx-auto rounded-[30px] bg-[#F2ECE3] text-[#413320] overflow-hidden shadow-xl h-full transition-transform duration-300 hover:scale-101">
            
            {/* Heading */}
            <div className="flex justify-between items-start gap-4 pt-4 pb-2 px-4 sm:px-6 md:px-8">
              <h3 className="font-cinzel text-[22px] font-bold flex-1 min-w-0 break-words">
                {item.title}
              </h3>
              <Image
                src="/assets/icons/home/heart.svg"
                alt="Favorite"
                width={32}
                height={32}
              />
            </div>

            {/* Body */}
            <div className="flex flex-col lg:flex-row pb-4 px-4 sm:px-6 md:px-8 gap-3">
              <Image
                src={item.coverImage}
                alt={item.title}
                width={300}
                height={160}
                className="rounded-[30px] object-cover"
              />

              <div className="flex flex-col justify-between space-y-3 font-inter">
                <div className="overflow-hidden max-h-60 relative">
                  {item.excerpt}
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F2ECE3] to-transparent" />
                </div>

                <span className="text-right text-[#CF822A] font-bold">
                  Click here to read more
                </span>
              </div>
            </div>
          </article>
        </Link>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 font-bold">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded transition ${
                currentPage === page
                  ? "bg-[#805C2C] text-white"
                  : "bg-white hover:bg-[#D8CBBF]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
