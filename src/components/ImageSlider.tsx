"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider} from "keen-slider/react";
import Image from "next/image";
import { useState, useEffect } from "react";

type ImageAsset = {
  src: string;
  alt: string;
};

interface ImageSliderProps {
  images: ImageAsset[];
  autoPlay?: boolean;
  interval?: number;
}

export default function ImageSlider({
  images,
  autoPlay = true,
  interval = 5000,
}: ImageSliderProps) {
  const [currentImage, setCurrentImage] = useState<ImageAsset | null>(null);
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
       {images.map((image, i) => (
    <div key={i} className="keen-slider__slide flex justify-center p-4">
      <div
        className="relative w-64 h-48 sm:w-72 sm:h-52 rounded-4xl 
                  shadow-[3px_3px_8px_rgba(0,0,0,0.2),6px_6px_12px_rgba(130,95,48,1)] cursor-pointer 
                  transform transition-transform duration-300 hover:scale-105 bg-white/5"
        onClick={() => setCurrentImage(image)}
      >
      <div className="absolute inset-0 overflow-hidden rounded-4xl">
      <Image
      src={image.src}
      alt={image.alt || `Slide ${i + 1}`}
      fill
      priority
      sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover object-center w-full h-full scale-[1.04] translate-x-[-0.5px]"
    />

      </div>
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
           <Image
          src={currentImage.src}
          alt={currentImage.alt || "Full image"}
          fill
          className="object-contain"
        />
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
