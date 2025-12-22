"use client";

import Image from "next/image";

export interface TeamMember {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
}

interface OurTeamProps {
  teamData: TeamMember[]; // Now this is required
}

export default function OurTeam({ teamData }: OurTeamProps) {
  return (
    <section className="w-full bg-[#D1BDA1] py-12 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {teamData.map((member) => (
          <div
            key={member.id}
            className="flex w-full h-[280px] sm:h-[320px] rounded-l-[30px] overflow-hidden shadow-xl"
          >
        
            {/* Image Section - 1/4 of card */}
            <div className="w-1/4 relative h-full">
              <Image
                src={member.image}
                alt={member.name}
                fill
                sizes="25vw"
                className="object-cover rounded-l-[30px]"
              />
            </div>


            {/* Text Section - 3/4 of card with straight right side */}
            <div className="w-3/4 bg-[#EDE5D8] p-6 sm:p-8 flex flex-col">
            
              <div className="space-y-3 sm:space-y-4 mb-4">
                {/* Name */}
                <h3 className="font-cinzel font-bold text-[24px]  text-[#000000] uppercase">
                  {member.name}
                </h3>
                
                {/* Role */}
                <p className="font-jacques-francois text-[#403F3C]">
                  {member.role}
                </p>
              </div>
              
              {/* Scrollable Description */}
              <div className="flex-1 overflow-y-auto pr-2 scrollable-description">
                <p className="font-jacques-francois text-[16px] sm:text-[18px] text-[#403727] leading-[2.2]">
                  {member.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}