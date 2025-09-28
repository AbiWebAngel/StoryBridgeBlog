"use client";

import "keen-slider/keen-slider.min.css";
import { useKeenSlider } from "keen-slider/react";
import Image from "next/image";

interface Testimonial {
  text: string;
  image: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials }: TestimonialCarouselProps) {
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slides: { perView: 3, spacing: 12 },
    breakpoints: {
      "(max-width: 1024px)": { slides: { perView: 2, spacing: 8 } },
      "(max-width: 768px)": { slides: { perView: 1, spacing: 6 } },
    },
  });

  const handlePrev = () => slider.current?.prev();
  const handleNext = () => slider.current?.next();

  return (
    <div className="relative p-8 bg-[#D1BDA1] overflow-hidden">
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-0 -translate-y-1/2 z-10 p-6 
                   transition-transform duration-300 ease-out
                   hover:scale-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]
                   origin-left"
      >
        <Image src="/assets/icons/about/left.svg" alt="Previous" width={24} height={24} />
      </button>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-0 -translate-y-1/2 z-10 p-6 
                   transition-transform duration-300 ease-out
                   hover:scale-125 hover:shadow-[0_0_20px_rgba(255,255,255,0.8)]
                   origin-right"
      >
        <Image src="/assets/icons/about/right.svg" alt="Next" width={24} height={24} />
      </button>

      {/* Slider */}
      <div ref={sliderRef} className="keen-slider">
        {testimonials.map((t, i) => (
          <div key={i} className="keen-slider__slide flex justify-center">
            <div
              className="flex flex-col items-center"
              style={{
                width: 325,
                height: 400,
                backgroundColor: "#EDE5D8",
                borderRadius: 16,
                padding: "16px",
                boxSizing: "border-box",
                position: "relative", // important for absolute positioning
              }}
            >
              {/* Text on top */}
              <p className="text-lg font-serif text-center">{t.text}</p>

              {/* Image fixed at the bottom */}
              <div
                style={{
                  width: 125,
                  height: 125,
                  borderRadius: 100,
                  overflow: "hidden",
                  position: "absolute",
                  bottom: 40, // distance from bottom of card
                  left: "50%",
                  transform: "translateX(-50%)", // center horizontally
                  backgroundColor: "#fff",
                }}
              >
                <Image src={t.image} alt={`Testimonial ${i}`} fill className="object-cover" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
