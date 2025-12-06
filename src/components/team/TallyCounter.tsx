"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TallyCounterProps {
  matchesCount: number;
  workshopsCount: number;
}

export default function TallyCounter({
  matchesCount,
  workshopsCount,
}: TallyCounterProps) {
  const [leftTextVisible, setLeftTextVisible] = useState(false);
  const [rightTextVisible, setRightTextVisible] = useState(false);
  const [displayMatches, setDisplayMatches] = useState(0);
  const [displayWorkshops, setDisplayWorkshops] = useState(0);
  const [leftReveal, setLeftReveal] = useState(0);
  const [rightReveal, setRightReveal] = useState(0);
  const [mobileLeftReveal, setMobileLeftReveal] = useState(0);
  const [mobileRightReveal, setMobileRightReveal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth number animation
  function animateValue(
    start: number,
    end: number,
    duration: number,
    onUpdate: (v: number) => void
  ) {
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const value = Math.round(start + (end - start) * eased);

      onUpdate(value);

      if (progress < 1) requestAnimationFrame(update);
      else onUpdate(end); // final value
    }

    requestAnimationFrame(update);
  }

  // Smooth text reveal helper
  function animateReveal(setter: (v: number) => void, duration = 1200) {
    let startTime: number | null = null;
    function update(time: number) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      setter(progress * 100);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setLeftTextVisible(true);
            setRightTextVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Animate numbers
  useEffect(() => {
    if (leftTextVisible) animateValue(0, matchesCount, 2000, setDisplayMatches);
  }, [leftTextVisible, matchesCount]);

  useEffect(() => {
    if (rightTextVisible)
      animateValue(0, workshopsCount, 2000, setDisplayWorkshops);
  }, [rightTextVisible, workshopsCount]);

  // Animate desktop text reveal
  useEffect(() => {
    if (leftTextVisible) animateReveal(setLeftReveal);
  }, [leftTextVisible]);

  useEffect(() => {
    if (rightTextVisible) animateReveal(setRightReveal);
  }, [rightTextVisible]);

  // Animate mobile text reveal (with small delay)
  useEffect(() => {
    if (!leftTextVisible) return;
    const timer = setTimeout(() => animateReveal(setMobileLeftReveal), 300);
    return () => clearTimeout(timer);
  }, [leftTextVisible]);

  useEffect(() => {
    if (!rightTextVisible) return;
    const timer = setTimeout(() => animateReveal(setMobileRightReveal), 300);
    return () => clearTimeout(timer);
  }, [rightTextVisible]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center gap-8 py-8 bg-transparent"
    >
      {/* Mobile layout */}
      <div className="flex flex-col lg:hidden items-center w-full max-w-md px-4 gap-8">
        {/* Matches */}
        <div className="relative flex flex-col items-center w-full">
          <div className="relative w-full mb-6 overflow-hidden">
            <div
              className="font-inter font-bold text-xl text-center text-[#000000] whitespace-nowrap"
              style={{
                transform: `translateX(-${100 - mobileLeftReveal}%)`,
              }}
            >
              Number of matches made
            </div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold !text-5xl text-[#000000]">
                {displayMatches.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Book Image */}
        <div className="relative w-40 h-40 my-2">
          <Image
            src="/assets/images/team/book.png"
            alt="Book illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Workshops */}
        <div className="relative flex flex-col items-center w-full">
          <div className="relative w-full mb-6 overflow-hidden">
            <div
              className="font-inter font-bold text-xl text-center text-[#000000] whitespace-nowrap"
              style={{
                transform: `translateX(-${100 - mobileRightReveal}%)`,
              }}
            >
              Number of workshops completed
            </div>
          </div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold !text-5xl text-[#000000]">
                {displayWorkshops.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:flex relative items-center justify-between w-full max-w-6xl px-8">
        {/* Left circle */}
        <div className="relative flex flex-col items-center">
        <div className="absolute -top-4 md:-top-6 lg:-top-10 left-1/2 -translate-x-1/2 w-full max-w-[360px] flex justify-center">
            <svg className="w-full h-30" viewBox="0 0 360 80">
              <path id="curve-left" d="M10,60 Q180,-40 350,60" fill="transparent" />
              <text
                fontSize="23"
                fill="#000000"
                fontFamily="Inter, sans-serif"
                fontWeight="bold"
                className="reveal-mask"
                style={{ ["--reveal" as any]: `${leftReveal}%` }}
              >
                <textPath href="#curve-left" startOffset="50%" textAnchor="middle">
                  Number of matches made
                </textPath>
              </text>
            </svg>
          </div>
          <div className="relative w-64 h-64 flex items-center justify-center mt-4">
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold !text-7xl text-[#000000]">
                {displayMatches.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Center book image */}
       <div className="relative w-96 h-40 my-2">
        <Image
          src="/assets/images/team/book.png"
          alt="Book illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

        {/* Right circle */}
        <div className="relative flex flex-col items-center">
       <div className="absolute -top-4 md:-top-6 lg:-top-8 left-1/2 -translate-x-[47%] w-full max-w-[380px] flex justify-center">
  <svg className="w-full h-30" viewBox="0 0 380 80">
    <path id="curve-right" d="M10,60 Q190,-70 350,70" fill="transparent" />
    <text
      fontSize="23"
      fill="#000000"
      fontFamily="Inter, sans-serif"
      fontWeight="bold"
      className="reveal-mask"
      style={{ ["--reveal" as any]: `${rightReveal}%` }}
    >
      <textPath href="#curve-right" startOffset="50%" textAnchor="middle">
        Number of workshops completed
      </textPath>
    </text>
  </svg>
</div>

          <div className="relative w-64 h-64 flex items-center justify-center mt-4">
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold !text-7xl text-[#000000]">
                {displayWorkshops.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
