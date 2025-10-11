"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";



export default function SearchComponent() {
  const [searchText, setSearchText] = useState("");

  const labels = [
    "What to Write Wednesday",
    "Author Interview",
    "Teen writers",
    "Beta-reader",
    "Feedback",
    "StoryBridge",
    "Literacy",
    "Writing",
  ];

 return (
<div className="mt-12 mb-12 px-6 relative"> {/* Outer wrapper controls margin */}

  {/* Search Box positioned above the section */}
  <div className="relative w-80 md:w-96 mx-auto z-10">
    <div className="absolute top-[-25] right-0 md:right-[-4rem] lg:right-[-6rem] w-full md:w-96">
      <div className="relative">
        {/* Icon */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-10">
          <Image
            src="/assets/images/home/search.png"
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
          className="w-full rounded-full border-4 border-[#694D28] bg-[#C6B49C]
                     py-3 pl-16 pr-10 text-[#403727] font-bold placeholder-[#403727]
                     outline-none focus:ring-2 focus:ring-[#805D2D]/40 transition"
        />

        {/* Permanent underline */}
        <div className="absolute left-16 right-10 bottom-3 h-[2px] bg-[#403727] pointer-events-none rounded" />
      </div>
    </div>
  </div>

  {/* Section with border */}
  <section className="font-inter w-full bg-[#DDD2C3] py-12 relative overflow-hidden border-y-4 border-[#805D2D]">
    {/* Search by Labels */}
    <div className="flex flex-col items-center space-y-4 mt-20">
      <h2 className="font-inter text-lg font-bold text-[#866436]">
        Search by labels:
      </h2>

      <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
        {labels.map((label, index) => (
          <span
            key={index}
            className="cursor-pointer px-5 py-2 rounded-full border-2 border-[#805D2D] bg-[#EDE5D8]
                       text-[#3E2B12] font-medium transition-transform duration-300
                       hover:scale-110 select-none"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  </section>
</div>
    );
}
