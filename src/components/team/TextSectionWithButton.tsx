import Image from "next/image";
import SectionHeading from "../SectionHeading";
import JoinButton from "./JoinButton.client"; // client component

interface HeadingProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  maxWidth?: string;
  mobileWidth?: number;
  mobileHeight?: number;
  title: string; // 👈 NEW: real SEO text
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
  responsiveCenter?: boolean;
  centerAll?: boolean;
  buttonText?: string; // Optional button text
  buttonUrl?: string;  // Optional button URL
  onButtonClick?: () => void; // Optional click handler
  showButton?: boolean;       // Whether to show the button
}

export default function TextSectionWithButton({
  heading,
  text,
  image,
  responsiveCenter = true,
  centerAll = false,
  buttonText = "Join Us",
  buttonUrl,
  onButtonClick,
  showButton = true,
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

      {/* Button Container */}
      {showButton && (
        <div className="w-full flex justify-center mt-6 lg:mt-8">
          <JoinButton
            buttonText={buttonText}
            buttonUrl={buttonUrl}
            onButtonClick={onButtonClick}
          />
        </div>
      )}
    </div>
  );
}
