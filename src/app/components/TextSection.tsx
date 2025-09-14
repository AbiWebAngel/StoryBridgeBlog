import Image from "next/image";
import SectionHeading from "./SectionHeading";

interface HeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
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
}

export default function TextSection({ heading, text, image }: TextSectionProps) {
  return (
    <div className="flex flex-col items-center md:items-start">
      {/* Heading */}
      <SectionHeading {...heading} insideColumn/>

      {/* Paragraph */}
      <p className="mt-4 text-sm sm:text-base leading-relaxed text-center md:text-left">
        {text}
      </p>

      {/* Optional Supporting Image */}
      {image && (
        <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mt-4">
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
