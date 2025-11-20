import Image from "next/image";
import SectionHeading from "../SectionHeading";

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
  text: string | string[]; // Allow both string and array of strings (for lists)
  image: ImageProps; // Required for this variation
  responsiveCenter?: boolean;
  centerAll?: boolean;
  reverse?: boolean; // New prop to reverse the order on desktop
}

export default function TextSectionWithSideImage({
  heading,
  text,
  image,
  responsiveCenter = true,
  centerAll = false,
  reverse = false, // Default: text on left, image on right
}: TextSectionProps) {
  const isList = Array.isArray(text);

  return (
    <div className="w-full mt-6 mb-6 px-4 sm:px-6 md:px-20">
      {/* Heading */}
      <SectionHeading
        {...heading}
        responsiveCenter={responsiveCenter}
        centerAll={centerAll}
      />

      {/* Content Container */}
      <div className={`mt-6 flex flex-col lg:flex-row gap-8 ${reverse ? 'lg:flex-row-reverse' : ''}`}>
        {/* Text Content - 2/3 width on desktop */}
        <div className="lg:w-2/3">
          {isList ? (
            <ul className="list-disc pl-6 space-y-3 text-left lg:text-left">
              {text.map((item, index) => (
                <li key={index} className="leading-[2.2]">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center lg:text-left leading-[2.2]">
              {text}
            </p>
          )}
        </div>

        {/* Image - 1/3 width on desktop */}
        <div className="lg:w-1/3 flex justify-center md:justify-center lg:justify-start">
          <div className="max-w-xs md:max-w-sm lg:max-w-full mx-auto lg:mx-0">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              quality={100}
              className="h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}