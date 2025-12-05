"use client";

import Image from "next/image";

interface TallyCounterProps {
  matchesCount: number;
  workshopsCount: number;
}

export default function TallyCounter({ 
  matchesCount, 
  workshopsCount 
}: TallyCounterProps) {
  return (
    <div className="w-full flex flex-col items-center gap-8 py-8 bg-transparent">
      <div className="relative flex items-center justify-between w-full max-w-6xl px-8">
        {/* Left Circle */}
        <div className="relative flex flex-col items-center">
          {/* Outer title arc for left circle */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[280px]">
            <div className="relative">
              <svg className="w-full h-12" viewBox="0 0 280 50">
                <path 
                  id="curve-left" 
                  d="M20,40 Q140,-20 260,40" 
                  fill="transparent"
                />
                <text className="font-bold" fontSize="14" fill="#413320">
                  <textPath href="#curve-left" startOffset="50%" textAnchor="middle">
                    Number of matches made
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
          
          {/* Circle container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Circle background */}
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            
            {/* Number */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold text-7xl text-[#413320]">
                {matchesCount}
              </span>
            </div>
          </div>
        </div>

        {/* Center Book Image */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-48 h-48">
          <Image
            src="/assets/images/team/book.png"
            alt="Book illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Right Circle */}
        <div className="relative flex flex-col items-center">
          {/* Outer title arc for right circle */}
          <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[280px]">
            <div className="relative">
              <svg className="w-full h-12" viewBox="0 0 280 50">
                <path 
                  id="curve-right" 
                  d="M20,40 Q140,-20 260,40" 
                  fill="transparent"
                />
                <text className="font-bold" fontSize="14" fill="#413320">
                  <textPath href="#curve-right" startOffset="50%" textAnchor="middle">
                    Number of workshops completed
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
          
          {/* Circle container */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Circle background */}
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            
            {/* Number */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold text-7xl text-[#413320]">
                {workshopsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}