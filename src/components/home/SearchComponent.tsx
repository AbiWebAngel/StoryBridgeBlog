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
<div className="mt-12 mb-16 relative">

  {/* Search Box positioned above the section */}
  
  <div className="absolute top-[-22px] right-0 w-80 md:w-96 z-10">
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
        className="font-inter w-full rounded-l-full rounded-r-none border-4 border-l-[#694D28] border-y-[#694D28] border-r-0
                   bg-[#C6B49C] pt-3 pb-[0.6rem] pl-16 pr-10 text-[#403727] font-bold placeholder-[#403727]
                   outline-none focus:ring-2 focus:ring-[#805D2D]/40 transition"
      />

      {/* Permanent underline */}
      <div className="absolute left-16 right-2 bottom-3 h-[1px] bg-[#403727] pointer-events-none rounded" />
    </div>
  </div>




  {/* Section with border */}
  <section className="font-inter w-full bg-[#DDD2C3] py-8 relative overflow-hidden border-y-4 border-[#805D2D]">
    {/* Search by Labels */}
    <div className="flex flex-col items-center py-4 space-y-4">
      <h2 className="font-inter text-lg font-bold text-[#805D2D]">
        Search by labels:
      </h2>

      <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
        {labels.map((label, index) => (
          <span
            key={index}
            className="cursor-pointer px-5 py-2 rounded-full border-2 border-[#805D2D] bg-[#F2ECE3]
                       text-[#805D2D] font-medium transition-transform duration-300
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
