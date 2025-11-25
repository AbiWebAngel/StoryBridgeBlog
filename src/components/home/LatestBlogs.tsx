"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { blogData } from "@/data/blogData";

const ITEMS_PER_PAGE = 2;

export default function LatestBlogs() {
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const totalPages = Math.ceil(blogData.length / ITEMS_PER_PAGE);

  const currentItems = blogData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleItemClick = (slug: string) => {
    router.push(`/blog/${slug}`);
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col items-center space-y-12">
      {currentItems.map((item) => (
        <div
          key={item.id}
          onClick={() => handleItemClick(item.slug)}
          className="flex flex-col w-full sm:w-[90%] md:w-[95%] lg:max-w-[1096px] mx-auto rounded-[30px] bg-[#F2ECE3] text-[#413320] overflow-hidden shadow-xl h-full 
            transition-transform duration-300 hover:scale-101 cursor-pointer"
        >
          {/* Heading + Heart */}
          <div className="flex justify-between items-start gap-4 pt-4 pb-2 px-4 sm:px-6 md:px-8">
            <h3 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold flex-1 min-w-0 break-words">
              {item.title}
            </h3>
            <div className="flex-shrink-0 w-8 h-8">
              <Image
                src="/assets/icons/home/heart.svg"
                alt="Favorite"
                width={32}
                height={32}
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row pb-4 px-4 sm:px-6 md:px-8 gap-3 flex-1">
            {/* Image */}
            <div className="flex justify-center items-center lg:flex-[1_1_30%]">
              <Image
                src={item.image}
                alt={item.title}
                width={280}
                height={160}
                className="rounded-[30px] object-cover"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col justify-between lg:flex-[1_1_70%] space-y-3 h-full px-2 sm:px-4 md:px-6">
              <div className="overflow-hidden max-h-[230px] sm:max-h-[260px] lg:max-h-[300px] relative flex-1">
                <div className="line-clamp-none">{item.excerpt}</div>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F2ECE3] to-transparent pointer-events-none"></div>
              </div>
              <div className="text-right mt-4">
                <span className="font-inter text-[#CF822A] font-bold relative group inline-block pb-1 cursor-pointer">
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#CF822A] after:transition-all after:duration-300 group-hover:after:w-full">
                    Click here to read more
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex flex-wrap justify-center space-x-2 sm:space-x-3 text-[#413320] font-inter font-bold">
        <span className="mr-2">Page:</span>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? "bg-[#413320] text-white"
                : "bg-[#F2ECE3] hover:bg-[#D8CBBF]"
            } transition`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}