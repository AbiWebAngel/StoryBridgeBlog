"use client";

import { useState, useEffect } from "react";
import SearchComponent from "@/components/SearchComponent";
import { useSearchParams } from "next/navigation";

type BlogFiltersWrapperProps = {
  tags?: string[];
};

export default function BlogFiltersWrapper({ tags }: BlogFiltersWrapperProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();

useEffect(() => {
  const hasFilters =
    searchParams.has("tag") || searchParams.has("search");

  setOpen(hasFilters);
}, [searchParams]);


  return (
    <div className="relative mb-8">
      {/* Filter button (stays constrained) */}
      <div className="flex justify-start">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 rounded-full border-2 border-[#805C2C]
                     px-6 py-2 font-bold text-[#805C2C] bg-[#F2ECE3]
                     hover:bg-[#DDD2C3] transition font-sans!"
        >
          {open ? "Close filters" : "Filter articles"}
        </button>
      </div>

      {/* Full-bleed filter panel ONLY */}
      {open && (
       <div className="relative left-1/2 -translate-x-1/2 w-[99vw] max-w-none overflow-x-clip">
          <SearchComponent
            tags={tags}
            showSearchBar={false}
          />
        </div>
      )}
    </div>
  );
}
