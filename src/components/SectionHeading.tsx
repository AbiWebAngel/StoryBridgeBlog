"use client";
import Image from "next/image";

interface SectionHeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  responsiveCenter?: boolean; // previously "center"
  centerAll?: boolean;        // always center
  mobileWidth?: number;       // optional mobile width
  mobileHeight?: number;      // optional mobile height
}

export default function SectionHeading({
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
    ? "justify-center"                     // always center
    : responsiveCenter
    ? "justify-center lg:justify-start"    // responsive center
    : "justify-start";                      // always left

  // Check if mobile dimensions are provided
  const hasMobileDimensions = mobileWidth !== undefined && mobileHeight !== undefined;

  // Generate mobile image path by inserting "-mobile" before the file extension
  const generateMobileSrc = (originalSrc: string): string => {
    const lastDotIndex = originalSrc.lastIndexOf('.');
    if (lastDotIndex === -1) return `${originalSrc}-mobile`;
    
    const base = originalSrc.substring(0, lastDotIndex);
    const extension = originalSrc.substring(lastDotIndex);
    return `${base}-mobile${extension}`;
  };

  const mobileSrc = generateMobileSrc(src);

  return (
    <h1 className="w-full mt-6">
      <div className={`flex w-full ${justifyClass}`}>
        <div style={{ maxWidth }}>  {/* Removed w-full class to match original */}
          {hasMobileDimensions ? (
            // Mobile/Desktop switching when mobile dimensions are provided
            <>
              {/* Mobile Image */}
              <div className="block md:hidden">
                <Image
                  src={mobileSrc}
                  alt={alt}
                  width={mobileWidth!}
                  height={mobileHeight!}
                  className="w-full h-auto"
                  onError={(e) => {
                    // If mobile image fails to load, fall back to desktop image
                    const img = e.target as HTMLImageElement;
                    img.src = src;
                  }}
                />
              </div>
              
              {/* Desktop Image */}
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
            // Single desktop image when no mobile dimensions provided
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