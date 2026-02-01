// components/mentorship/SignUpNow.tsx
import Image from "next/image";
import MentorshipButton from "./MentorshipButton.client";


// Define the interface for props
interface SignUpNowProps {
  menteeSection: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl?: string;
    image: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };
  mentorSection: {
    title: string;
    description: string;
    buttonText: string;
    buttonUrl?: string;
    image: {
      src: string;
      alt: string;
      width: number;
      height: number;
    };
  };
}

export default function SignUpNow({ 
  menteeSection, 
  mentorSection 
}: SignUpNowProps) {
  return (
    <div className="relative mb-[80px] group">
      <div className="w-full bg-[#D1BDA1] flex flex-col items-center justify-center px-4 sm:px-10 lg:px-20 py-10 gap-8 relative shadow-[0_4px_6px_rgba(0,0,0,0.25)] z-20">
        {/* Finding a Mentor Section */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
            {/* Content column */}
            <div className="lg:w-1/2">
              <h1 className="text-[24px] text-[#000000] text-left mb-4">
                {menteeSection.title}
              </h1>
              <p className="text-[16px] sm:text-[18px] text-[#403727]">
                {menteeSection.description}
              </p>
              <div className="relative mt-4">
                <MentorshipButton 
                  type="mentee"
                  buttonText={menteeSection.buttonText}
                  buttonUrl={menteeSection.buttonUrl}
                />
              </div>
            </div>
            
            {/* Image column */}
            <div className="lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Image
                  src={menteeSection.image.src}
                  alt={menteeSection.image.alt}
                  width={menteeSection.image.width}
                  height={menteeSection.image.height}
                  className="rounded-lg object-cover h-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Becoming a Mentor Section */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
            {/* Content column - order changes with lg:order-2 */}
            <div className="lg:w-1/2 lg:order-2">
              <h1 className="text-[24px] text-[#000000] text-left mb-4">
                {mentorSection.title}
              </h1>
              <p className="text-[16px] sm:text-[18px] text-[#403727]">
                {mentorSection.description}
              </p>
              <div className="relative mt-4">
                <MentorshipButton 
                  type="mentor"
                  buttonText={mentorSection.buttonText}
                   buttonUrl={mentorSection.buttonUrl}
                />
              </div>
            </div>
            
            {/* Image column - order changes with lg:order-1 */}
            <div className="lg:w-1/2 flex items-center justify-center lg:order-1">
              <div className="w-full max-w-md">
                <Image
                  src={mentorSection.image.src}
                  alt={mentorSection.image.alt}
                  width={mentorSection.image.width}
                  height={mentorSection.image.height}
                  className="rounded-lg object-cover h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}