"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";


type SearchComponentProps = {
  tags?: string[];
  showSearchBar?: boolean; // New prop to control search bar visibility
};

export default function SearchComponent({ 
  tags, 
  showSearchBar = true // Default to true for backward compatibility
}: SearchComponentProps) {
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  // Default tags if none are provided
  const defaultTags = [
    "what-to-write-wednesday",
    "author-interview",
    "teen-writers",
    "beta-reader",
    "feedback",
    "storybridge",
    "literacy",
    "writing",
  ];

  // Use provided tags or fall back to defaults
  const displayTags = tags && tags.length > 0 ? tags : defaultTags;

  const handleSubmit = () => {
    if (!searchText.trim()) return;
    router.push(`/blog?search=${encodeURIComponent(searchText)}`);
  };

  return (
    <div className={`mt-12 mb-16 relative ${showSearchBar ? "" : "pt-8"}`}>
      {/* Conditional Search Box */}
      {showSearchBar && (
        <div className="absolute -top-5.5 right-0 w-80 md:w-96 z-10">
          <div className="relative">
            {/* Icon */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              <Image
                src="/assets/icons/home/search.png"
                alt="Search"
                width={25}
                height={25}
              />
            </div>

            {/* Input */}
            <input
              type="text"
              placeholder="Start typing to search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="font-inter w-full rounded-l-full rounded-r-none border-4 border-l-[#805C2C] border-y-[#805C2C] border-r-0
                       bg-[#C6B49C] pt-3 pb-[0.6rem] pl-16 pr-10 text-[#403727] font-bold placeholder-[#403727]
                       outline-none focus:ring-2 focus:ring-[#805D2D]/40 transition"
            />

            {/* Permanent underline */}
            <div className="absolute left-16 right-2 bottom-3 h-px bg-[#403727] pointer-events-none rounded" />
          </div>
        </div>
      )}

      {/* Section with border */}
      <section className="font-inter w-full bg-[#DDD2C3] py-8 relative overflow-hidden border-y-4 border-[#805C2C]">
        {/* Search by tags */}
        <div className="flex flex-col items-center py-4 space-y-4">
          <h2 className="font-inter text-lg font-bold text-[#805C2C]">
            Search by tags:
          </h2>
          {activeTag && (
                  <button
                    onClick={() => {
                      router.push("/blog");
                      router.refresh();
                    }}
                    className="mb-6 text-sm font-inter font-semibold text-[#805C2C] underline hover:opacity-80"
                  >
                    Clear filters
                  </button>

                    )}

          <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
          {displayTags.map((tag, index) => {
            const isActive = activeTag === tag;

            return (
              <span
                key={`${tag}-${index}`}
               onClick={() => {
                if (isActive) {
                  router.push("/blog");
                  router.refresh();
                } else {
                  router.push(`/blog?tag=${encodeURIComponent(tag)}`);
                  router.refresh();
                }
              }}

                className={`cursor-pointer px-5 py-2 rounded-full border-2
                  font-medium transition-all duration-200 select-none text-base!
                  ${
                    isActive
                      ? "bg-[#805C2C] text-[#F2ECE3] border-[#805C2C] scale-105"
                      : "bg-[#F2ECE3] text-[#805C2C] border-[#805C2C] hover:scale-110"
                  }`}
              >
                {tag}
              </span>
            );
          })}

          </div>
        </div>
      </section>
    </div>
  );
}