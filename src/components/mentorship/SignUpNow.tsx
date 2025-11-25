"use client";

import Image from "next/image";

export default function SignUpNow() {
  const handleFindingMentor = () =>
    window.open(process.env.NEXT_PUBLIC_FINDING_MENTOR_FORM_URL, "_blank");

  const handleBecomingMentor = () =>
    window.open(process.env.NEXT_PUBLIC_BECOMING_MENTOR_FORM_URL, "_blank");

  return (
    <div className="relative mb-[80px] group">
      <div className="w-full bg-[#D1BDA1] flex flex-col items-center justify-center px-4 sm:px-10 lg:px-20 py-10 gap-8 relative shadow-[0_4px_6px_rgba(0,0,0,0.25)] z-20">
        {/* Finding a Mentor Section */}
        <div className="w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 w-full">
            {/* Content column */}
            <div className="lg:w-1/2">
              <h1 className="text-[24px] text-[#000000] text-left mb-4">Finding a Mentor</h1>
              <p className="text-[16px] sm:text-[18px] text-[#403727]">
               The Mentorship Program gives young writers the guidance they need to grow without stumbling 
               through every mistake alone. Writing takes time, effort, and plenty of &quot;Why did I write that?&quot; 
               moments, but having a mentor means you&apos;ve got someone who&apos;s already been through the chaos and 
               can help you sharpen your voice faster. Together, you&apos;ll explore new ideas, build confidence in 
               your craft, and turn your stories into something you&apos;re proud to share.
              </p>
              <div className="relative mt-4">
                <button
                  onClick={handleFindingMentor}
                  className="bg-[#805E2D] text-white text-[18px] px-8 py-3 rounded-[30px] hover:bg-[#6B4D23] transition-colors flex items-center justify-center hover:scale-105"
                >
                  <span className="translate-y-[1.5px]">Get Started</span>
                </button>
              </div>
            </div>
            
            {/* Image column */}
            <div className="lg:w-1/2 flex items-center justify-center">
              <div className="w-full max-w-md">
                <Image
                  src="/assets/images/mentorship/image2.svg" 
                  alt="Young writer working with mentor"
                  width={350}
                  height={320}
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
              <h1 className="text-[24px] text-[#000000] text-left mb-4">Becoming a Mentor</h1>
              <p className="text-[16px] sm:text-[18px] text-[#403727]">
                Becoming a mentor means guiding young writers through the messy, magical process 
                of finding their voice. You&apos;ve already survived the late-night rewrites and plot 
                twists that made no sense, and now you get to help someone else skip the pitfalls 
                you learned the hard way. It&apos;s a chance to share your experience, encourage real 
                growth, and watch a new generation of storytellers turn their ideas into something powerful.
              </p>
              <div className="relative mt-4">
                <button
                  onClick={handleBecomingMentor}
                  className="bg-[#805E2D] text-white text-[18px] px-8 py-3 rounded-[30px] hover:bg-[#6B4D23] transition-colors flex items-center justify-center hover:scale-105"
                >
                  <span className="translate-y-[1.5px]">Get Started</span>
                </button>
              </div>
            </div>
            
            {/* Image column - order changes with lg:order-1 */}
            <div className="lg:w-1/2 flex items-center justify-center lg:order-1">
              <div className="w-full max-w-md">
                <Image
                  src="/assets/images/mentorship/image3.svg" 
                  alt="Experienced writer mentoring someone"
                  width={300}
                  height={320}
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