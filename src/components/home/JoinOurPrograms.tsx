"use client";

import Image from "next/image";
import Link from "next/link";

interface ProgramLink {
  programName: string;
  link: string;
  svgPath: string; // Add this
}

interface JoinOurProgramsProps {
  programLinks: ProgramLink[];
}

export default function JoinOurPrograms({ programLinks }: JoinOurProgramsProps) {
  // Only render if there are program links
  if (!programLinks || programLinks.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 py-8 bg-transparent">
      <div className="flex flex-wrap justify-center gap-24">
        {programLinks.map((program) => (
          <Link
            key={program.programName}
            href={program.link}
            className="flex flex-col items-center w-[250px] h-[250px] bg-[#F2ECE3] rounded-[30px] p-2 hover:shadow-lg transition hover:scale-103"
          >
            <div className="w-[223px] h-[221px] relative">
              <Image
                src={program.svgPath}
                alt={program.programName}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-2 font-cinzel font-bold text-[#413320] text-[20px] text-center break-words">
              {program.programName}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}