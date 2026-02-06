// components/magazines/MagazineGrid.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface MagazineData {
  id: number;
  title: string;
  description: string;
  image: {
    src: string;
    alt: string;
  };
  // Removed the link property since individual magazines won't have links
}

interface MagazineGridProps {
  magazines: MagazineData[];
  viewAllLink?: string;
  onViewAllClick?: () => void;
}

export default function MagazineGrid({ 
  magazines, 
  viewAllLink, 
  onViewAllClick 
}: MagazineGridProps) {
  const [isHovered, setIsHovered] = useState<number | null>(null);

  const handleViewAllClick = () => {
    if (onViewAllClick) {
      onViewAllClick();
    } else if (viewAllLink) {
      window.location.href = viewAllLink;
    }
  };

  return (
    <section className="w-full py-8 px-4 sm:px-6 md:px-8 lg:px-12">
      {/* Desktop layout - 3 items in a row */}
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {magazines.map((magazine) => (
              <article 
                key={magazine.id} 
                className="flex flex-col items-center"
                onMouseEnter={() => setIsHovered(magazine.id)}
                onMouseLeave={() => setIsHovered(null)}
              >
                {/* Image without drop shadow, with corner radius */}
                <div className="relative mb-6 w-[308px]">
                  <div className="relative h-[236px] w-full rounded-[30px] overflow-hidden ring-1 ring-black/10">
                    <Image
                      src={magazine.image.src}
                      alt={magazine.image.alt || magazine.title}
                      fill
                      className={`object-cover transition-transform duration-300 ${
                        isHovered === magazine.id ? 'scale-105' : 'scale-100'
                      }`}
                      sizes="(max-width: 768px) 100vw, 308px"
                    />
                  </div>
                </div>

                {/* Title - Centered with constrained width */}
                <div className="w-[308px] px-2">
                  <div className="flex justify-center">
                    <h3 className="font-cinzel font-bold text-[22px] text-[#000000] uppercase mb-3 text-center break-words">
                      {magazine.title}
                    </h3>
                  </div>

                  {/* Description - black text with constrained width */}
                  <p className="font-jacques-francois text-[16px] text-[#000000] leading-[1.6] text-center break-words">
                    {magazine.description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* View All Button - centered below the grid */}
          <div className="mt-12 text-center">
            <button
              onClick={handleViewAllClick}
              className="inline-flex items-center px-8 py-3 font-jacques-francois text-[20px] bg-[#805C2C] text-white rounded-full hover:bg-[#6B4D24] transition-all duration-200"
            >
              View All
            </button>
          </div>
        </div>
      </div>

      {/* Mobile layout - vertical stack */}
      <div className="md:hidden">
        <div className="space-y-8">
          {magazines.map((magazine) => (
            <article key={magazine.id} className="flex flex-col items-center">
              {/* Image without drop shadow, with corner radius */}
              <div className="relative mb-4 w-full max-w-sm">
                <div className="relative h-48 w-full rounded-[20px] overflow-hidden">
                  <Image
                    src={magazine.image.src}
                    alt={magazine.image.alt || magazine.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
              </div>

              {/* Title - Centered with constrained width */}
              <div className="w-full max-w-sm px-4">
                <div className="flex justify-center">
                  <h3 className="font-cinzel font-bold text-[18px] text-[#000000] uppercase mb-2 text-center break-words">
                    {magazine.title}
                  </h3>
                </div>

                {/* Description - black text with constrained width */}
                <p className="font-jacques-francois text-[14px] text-[#000000] leading-[1.5] text-center break-words">
                  {magazine.description}
                </p>
              </div>
            </article>
          ))}

          {/* View All Button - centered below items */}
          <div className="mt-8 text-center">
            <button
              onClick={handleViewAllClick}
              className="inline-flex items-center px-6 py-3 font-jacques-francois text-[18px] bg-[#805C2C] text-white rounded-full hover:bg-[#6B4D24] transition-all duration-200"
            >
              View All
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}