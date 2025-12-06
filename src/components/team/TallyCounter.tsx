"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface TallyCounterProps {
  matchesCount: number;
  workshopsCount: number;
}

export default function TallyCounter({
  matchesCount,
  workshopsCount
}: TallyCounterProps) {
  const [leftTextVisible, setLeftTextVisible] = useState(false);
  const [rightTextVisible, setRightTextVisible] = useState(false);
  const [displayMatches, setDisplayMatches] = useState(0);
  const [displayWorkshops, setDisplayWorkshops] = useState(0);
  const [leftReveal, setLeftReveal] = useState(0);
  const [rightReveal, setRightReveal] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth count-up animation
function animateValue(
  start: number,
  end: number,
  duration: number,
  onUpdate: (v: number) => void
) {
  const startTime = performance.now();

  function update(now: number) {
    const elapsed = now - startTime;
    let progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
    const value = Math.round(start + (end - start) * eased); // use round instead of floor

    onUpdate(value);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      onUpdate(end); // ensure final value is exact
    }
  }

  requestAnimationFrame(update);
}


  // Intersection Observer for fade-in
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
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
    if (!leftTextVisible) return;
    animateValue(0, matchesCount, 2000, setDisplayMatches);
  }, [leftTextVisible, matchesCount]); 

  useEffect(() => {
    if (!rightTextVisible) return;
    animateValue(0, workshopsCount, 2000, setDisplayWorkshops);
  }, [rightTextVisible, workshopsCount]);

  // Animate left-to-right reveal of text
  useEffect(() => {
    if (!leftTextVisible) return;
    let startTime: number | null = null;
    function animate(time: number) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / 1200, 1); // 1.2s
      setLeftReveal(progress * 100);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [leftTextVisible]);

  useEffect(() => {
    if (!rightTextVisible) return;
    let startTime: number | null = null;
    function animate(time: number) {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / 1200, 1); // 1.2s
      setRightReveal(progress * 100);
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [rightTextVisible]);

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center gap-8 py-8 bg-transparent"
    >
      <div className="relative flex items-center justify-between w-full max-w-6xl px-8">
        {/* LEFT CIRCLE */}
        <div className="relative flex flex-col items-center">
          {/* Arc Text */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[360px]">
            <svg className="w-full h-30" viewBox="0 0 360 80">
              <path id="curve-left" d="M10,60 Q180,-40 350,60" fill="transparent" />
              <text
                fontSize="24"
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

          {/* Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center mt-4">
            <div className="absolute inset-0 bg-[#F2ECE3] rounded-full shadow-lg" />
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <span className="font-inter font-bold !text-7xl text-[#000000]">
                {displayMatches.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER IMAGE */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-80 h-80">
          <Image
            src="/assets/images/team/book.png"
            alt="Book illustration"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* RIGHT CIRCLE */}
        <div className="relative flex flex-col items-center">
          {/* Arc Text */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[380px]">
            <svg className="w-full h-30" viewBox="0 0 380 80">
              <path id="curve-right" d="M10,60 Q190,-40 370,60" fill="transparent" />
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

          {/* Circle */}
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
