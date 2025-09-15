import Image from "next/image";

interface SectionHeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  insideColumn?: boolean; // optional, for headings inside columns
}

export default function SectionHeading({
  src,
  alt,
  width,
  height,
  maxWidth,
  insideColumn = false,
}: SectionHeadingProps) {
  return (
    <h1 className={`w-full mt-6 ${insideColumn ? "" : "px-4 sm:px-6 md:px-20"}`}>
      <div className="flex w-full justify-center lg:justify-start">
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
