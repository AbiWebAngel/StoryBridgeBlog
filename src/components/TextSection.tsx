import Image from "next/image";
import SectionHeading from "./SectionHeading";

interface HeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  mobileWidth?: number;       // optional mobile width
  mobileHeight?: number;      // optional mobile height
  title: string;              // 👈 NEW: real heading text for SEO
}

interface ImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface TextSectionProps {
  heading: HeadingProps;
  text: string;
  image?: ImageProps;
  responsiveCenter?: boolean; // center heading on small screens
  centerAll?: boolean;        // force center heading
}

export default function TextSection({
  heading,
  text,
  image,
  responsiveCenter = true,
  centerAll = false,
}: TextSectionProps) {
  return (
    <div className="w-full mt-6 mb-6 px-4 sm:px-6 md:px-20">
      
      {/* SEO-safe heading */}
      <SectionHeading
        {...heading}
        responsiveCenter={responsiveCenter}
        centerAll={centerAll}
      />

      {/* Paragraph */}
      <p className="mt-4 text-center lg:text-left leading-[2.2]">
        {text}
      </p>

      {/* Optional Supporting Image */}
      {image && (
        <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mt-4 mx-auto lg:mx-0">
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            quality={100}
            className="w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
