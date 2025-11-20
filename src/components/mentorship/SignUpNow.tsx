"use client";

import Image from "next/image";


export default function SignUpNow() {


  const handleFindingMentor = () =>
    window.open(process.env.NEXT_PUBLIC_FINDING_MENTOR_FORM_URL, "_blank");

  const handleBecomingMentor = () =>
    window.open(process.env.NEXT_PUBLIC_BECOMING_MENTOR_FORM_URL, "_blank");

  return (
    <div className="relative mb-[90px] group">
      <div className="w-full bg-[#D1BDA1] flex flex-col items-center justify-center px-4 sm:px-10 lg:px-16 py-10 gap-8 relative shadow-[0_4px_6px_rgba(0,0,0,0.25)] z-20">

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-4xl">

          {/* Finding A Mentor */}
          <button
            type="button"
            onClick={handleFindingMentor}
            aria-label="Finding A Mentor"
            className="
              w-full sm:w-[350px] md:w-[400px]
              h-[60px]
              bg-[#805E2D]
              flex items-center justify-center
              cursor-pointer rounded-[30px]
              transition-all duration-300
              hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]
              hover:brightness-110
              px-2
            "
          >
            <Image
              src="/assets/headings/mentorship/FindingAMentor.png"
              alt="Finding a mentor"
              width={260}
              height={44}
              className="object-contain max-w-[85%]"
              priority
            />
          </button>

          {/* Becoming A Mentor */}
          <button
            type="button"
            onClick={handleBecomingMentor}
            aria-label="Becoming A Mentor"
            className="
              w-full sm:w-[350px] md:w-[400px]
              h-[60px]
              bg-[#805E2D]
              flex items-center justify-center
              cursor-pointer rounded-[30px]
              transition-all duration-300
              hover:scale-105 hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]
              hover:brightness-110
              px-2
            "
          >
            <Image
              src="/assets/headings/mentorship/BecomingAMentor.png"
              alt="Becoming a mentor"
              width={280}
              height={44}
              className="object-contain max-w-[85%]"
              priority
            />
          </button>
        </div>
      </div>


         {/* Remember It's Free Bar */}
        <div
            className="
                absolute top-full left-1/2 -translate-x-1/2 -translate-y-6
                w-full max-w-[350px]
                h-[95px] sm:h-[105px]
                bg-[#F2ECE3]
                flex items-center justify-center
                rounded-b-[30px]
                shadow-[0_8px_12px_rgba(0,0,0,0.25)]
                transition-all duration-300
                group-hover:shadow-[0_0_25px_rgba(255,215,150,0.8)]
                p-2 pt-12
            "
            >

        <Image
            src="/assets/headings/mentorship/RememberItsFree.png"
            alt="Remember, it's free"
            width={260}
            height={50}
            className="object-contain max-w-[85%]"
            priority
        />
        </div>
    </div>

  );
}
