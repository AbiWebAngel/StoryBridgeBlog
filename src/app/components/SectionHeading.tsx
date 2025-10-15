import Image from "next/image";

interface SectionHeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  responsiveCenter?: boolean; // previously "center"
  centerAll?: boolean;        // always center
}

export default function SectionHeading({
  src,
  alt,
  width,
  height,
  maxWidth,
  responsiveCenter = false,
  centerAll = false,
}: SectionHeadingProps) {
  const justifyClass = centerAll
    ? "justify-center"                     // always center
    : responsiveCenter
    ? "justify-center lg:justify-start"    // responsive center
    : "justify-start";                      // always left

  return (
    <h1 className="w-full mt-6">
      <div className={`flex w-full ${justifyClass}`}>
        <div style={{ maxWidth }}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto"
          />
        </div>
      </div>
    </h1>
  );
}
