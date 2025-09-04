"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider} from "keen-slider/react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ImageSliderProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageSlider({
  images,
  autoPlay = true,
  interval = 5000,
}: ImageSliderProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false); // track pause state

      const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
      loop: true,
      mode: "snap",
      slides: { perView: 4, spacing: 12 },
      breakpoints: {
        "(max-width: 1024px)": { slides: { perView: 2, spacing: 8 } },
        "(max-width: 768px)": { slides: { perView: 1, spacing: 4 } },
      },
      created(s) {
        s.on("dragStarted", () => setIsPaused(true));
        s.on("dragEnded", () => setIsPaused(false));
      },
    });


  // Auto-scroll logic
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      if (!isPaused) slider.current?.next(); // only advance if not paused
    }, interval);

    return () => clearInterval(timer);
  }, [slider, interval, autoPlay, isPaused]);

  // Pause on button click
  const handlePrev = () => {
    slider.current?.prev();
    setIsPaused(true);
  };

  const handleNext = () => {
    slider.current?.next();
    setIsPaused(true);
  };

  return (
    <div className="relative group ml-6 mr-8">
      {/* Slider */}
      <div ref={sliderRef} className="keen-slider">
        {images.map((src, i) => (
          <div key={i} className="keen-slider__slide flex justify-center">
            <div
               className="w-72 h-52 sm:w-80 sm:h-56 rounded-4xl overflow-hidden shadow-lg relative cursor-pointer transform transition-transform duration-300 hover:scale-105"
              onClick={() => setCurrentImage(src)}
            >
              <Image src={src} alt={`Slide ${i}`} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full
                   opacity-100 md:opacity-0 group-hover:md:opacity-100 transition"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full
                   opacity-100 md:opacity-0 group-hover:md:opacity-100 transition"
      >
        ▶
      </button>

      {/* Lightbox */}
      {currentImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setCurrentImage(null)}
        >
          <div className="relative w-[90%] h-[90%] sm:w-[85%] sm:h-[85%] lg:w-[80%] lg:h-[80%]">
            <Image src={currentImage} alt="Full Image" fill className="object-contain" />
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold"
              onClick={() => setCurrentImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
