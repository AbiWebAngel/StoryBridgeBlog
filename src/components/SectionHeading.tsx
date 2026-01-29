"use client";
import Image from "next/image";

interface SectionHeadingProps {
  title: string;              // 👈 NEW: Real SEO heading text
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  responsiveCenter?: boolean;
  centerAll?: boolean;
  mobileWidth?: number;
  mobileHeight?: number;
}

export default function SectionHeading({
  title,                      // 👈 NEW
  src,
  alt,
  width,
  height,
  maxWidth,
  responsiveCenter = false,
  centerAll = false,
  mobileWidth,
  mobileHeight,
}: SectionHeadingProps) {
  const justifyClass = centerAll
    ? "justify-center"
    : responsiveCenter
    ? "justify-center lg:justify-start"
    : "justify-start";

  const hasMobileDimensions =
    mobileWidth !== undefined && mobileHeight !== undefined;

  const generateMobileSrc = (originalSrc: string): string => {
    const lastDotIndex = originalSrc.lastIndexOf(".");
    if (lastDotIndex === -1) return `${originalSrc}-mobile`;

    const base = originalSrc.substring(0, lastDotIndex);
    const extension = originalSrc.substring(lastDotIndex);
    return `${base}-mobile${extension}`;
  };

  const mobileSrc = generateMobileSrc(src);

  return (
    <h1 className="w-full mt-6 relative">
      {/* 🔥 Hidden but SEO-friendly real text */}
      <span className="sr-only">{title}</span>

      <div className={`flex w-full ${justifyClass}`}>
        <div style={{ maxWidth }}>
          {hasMobileDimensions ? (
            <>
              <div className="block md:hidden">
                <Image
                  src={mobileSrc}
                  alt={alt}
                  width={mobileWidth!}
                  height={mobileHeight!}
                  className="w-full h-auto"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = src;
                  }}
                />
              </div>

              <div className="hidden md:block">
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className="w-full h-auto"
                />
              </div>
            </>
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="w-full h-auto"
            />
          )}
        </div>
      </div>
    </h1>
  );
}
