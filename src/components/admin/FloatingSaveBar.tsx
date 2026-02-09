// components/admin/FloatingSaveBar.tsx
"use client";

import { useState, useEffect } from "react";

export default function FloatingSaveBar({
  onClick,
  saving,
  label,
  onDockChange,
  children,
}: {
  onClick: () => void;
  saving: boolean;
  label: string;
  onDockChange?: (docked: boolean) => void;
  children?: React.ReactNode;
}) {
  const [isFloating, setIsFloating] = useState(false);
  const BAR_HEIGHT = 80; // total height of bar including padding/margin
  const DOCK_BUFFER = 8; // extra pixels to avoid flicker
  const [isDocked, setIsDocked] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight;
      const pageHeight = document.body.offsetHeight;

      // dock if near bottom (with buffer)
      const docked = scrollPos >= pageHeight - BAR_HEIGHT - DOCK_BUFFER;
      const nextFloating = !docked;

     setIsFloating(nextFloating);
     setIsDocked(docked);
    };

    

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll); // handle viewport changes
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [onDockChange]);

  useEffect(() => {
  onDockChange?.(isDocked);
}, [isDocked, onDockChange]);


  return (
    <>
      {/* Static bar when docked */}
      <div className="h-20">
        {!isFloating && (
          <div className="w-full bg-transparent">
           <div
            className="
              max-w-6xl mx-auto px-4
              h-20
              flex flex-col gap-3
              sm:flex-row sm:items-center sm:justify-between
            "
          >
              {/* LEFT: Autosave (children) */}
              <div className="flex items-center">{children}</div>

              {/* RIGHT: Save button */}
              <button
                onClick={onClick}
                disabled={saving}
                className="px-8 py-3 rounded-lg bg-[#805C2C] text-white font-bold text-lg hover:bg-[#6B4C24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-sans!"
              >
                {saving ? "Saving..." : label}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating bar */}
     <div
        className={`fixed bottom-0 z-50 transition-all duration-300
          left-0 w-full
          lg:left-64 lg:w-[calc(100%-16rem)]
          ${isFloating ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >

        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          {/* LEFT: Autosave (children) */}
          <div className="flex items-center">{children}</div>

          {/* RIGHT: Save button */}
          <button
            onClick={onClick}
            disabled={saving}
            className="px-8 py-3 rounded-lg bg-[#805C2C] text-white font-bold text-lg hover:bg-[#6B4C24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed font-sans!"
          >
            {saving ? "Saving..." : label}
          </button>
        </div>
      </div>
    </>
  );
}
