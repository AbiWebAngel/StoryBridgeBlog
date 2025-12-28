"use client";

import { useState, useEffect } from "react";

export default function FloatingSaveBar({
  onClick,
  saving,
  label,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
}) {
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      const pageHeight = document.body.offsetHeight;

      // If near bottom → show static bar instead of floating
      if (scrollPos >= pageHeight - 40) {
        setIsFloating(false);
      } else {
        setIsFloating(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Static bar when at bottom */}
      <div className="h-20">
        {!isFloating && (
          <div className="w-full bg-transparent">
            <div className="max-w-6xl mx-auto p-4 flex justify-end">
              <button
                onClick={onClick}
                disabled={saving}
                className="px-8 py-3 rounded-lg bg-[#805C2C] text-white font-bold text-lg hover:bg-[#6B4C24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed !font-sans"
              >
                {saving ? "Saving..." : label}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Save Bar */}
      <div
        className={`
          fixed bottom-0 left-0 w-full
          transition-all duration-300
          ${isFloating ? "opacity-100 bg-transparent" : "opacity-0 pointer-events-none"}
        `}
      >
        <div className="max-w-6xl mx-auto p-4 flex justify-end">
          <button
            onClick={onClick}
            disabled={saving}
            className="px-8 py-3 rounded-lg bg-[#805C2C] text-white font-bold text-lg hover:bg-[#6B4C24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed !font-sans"
          >
            {saving ? "Saving..." : label}
          </button>
        </div>
      </div>
    </>
  );
}
