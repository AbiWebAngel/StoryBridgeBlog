"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MessageFromDirector() {
  const router = useRouter();

  const goToTeam = () => router.push("/team");

  return (
    // Outer wrapper — holds positioning context and provides bottom margin
    <div className="relative mb-[160px]">
      {/* Director message card with shadow */}
      <div
        className="w-full bg-[#D1BDA1] flex flex-col lg:flex-row items-center justify-center px-6 sm:px-10 lg:px-16 py-10 gap-8 relative overflow-visible shadow-[0_4px_6px_rgba(0,0,0,0.25)] z-20"
      >
        {/* Director Image */}
        <div className="flex-shrink-0">
          <div className="w-[197px] h-[263px] overflow-hidden rounded-[30px] relative">
            <Image
              src="/assets/images/director.jpg"
              alt="Director"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Message */}
        <div className="text-[#403727] font-jacques-francois text-[20px] leading-[2.2] max-w-3xl relative">
          <p>
            {`"As we look to the future, we remain dedicated to fostering innovation, collaboration, and growth—ensuring that our work today lays a strong foundation for tomorrow. Thank you for being part of this journey with us. Together, we can achieve remarkable things."`}
          </p>
          <p className="mt-6 text-center text-[24px] font-semibold">
            {`– Abigail`}
          </p>
        </div>
      </div>

      {/* Rest of Team card — appears “layered below” */}
   <button
  type="button"
  onClick={goToTeam}
  onKeyDown={(e) => {
    if (e.key === "Enter") goToTeam();
  }}
  aria-label="Get To Know The Rest Of The Team"
  className="
    absolute top-full right-2 transform -translate-y-6
    w-[550px] max-w-[90%] h-[110px] bg-[#F2ECE3] 
    flex items-center justify-center cursor-pointer overflow-hidden
    shadow-[0_8px_12px_rgba(0,0,0,0.25)] z-10
    transition-all duration-500
    hover:translate-y-0 hover:shadow-[0_12px_20px_rgba(0,0,0,0.35)]
    hover:brightness-105
  "
  style={{
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  }}
>
      
          <h3 className=" font-bold text-[#403727] text-[25px] text-center pt-10 px-4 ">
              Get To Know the Rest Of the Team
          </h3>
   
      </button>
    </div>
  );
}
