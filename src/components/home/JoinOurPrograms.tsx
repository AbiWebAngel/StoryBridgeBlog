"use client";

import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    name: "Mentorship Program",
    svg: "/assets/icons/home/mentorship.svg",
    href: "/mentorship",
  },
  {
    name: "Beta-Reading Program",
    svg: "/assets/icons/home/betareading.svg",
    href: "/beta-reading",
  },
  {
    name: "Workshops",
    svg: "/assets/icons/home/workshops.svg",
    href: "/workshops",
  },
];

export default function JoinOurPrograms() {
  return (
    <div className="w-full flex flex-col items-center gap-8 py-8 bg-transparent">
      <div className="flex flex-wrap justify-center gap-24">
        {programs.map((program) => (
          <Link
            key={program.name}
            href={program.href}
            className="flex flex-col items-center w-[250px] h-[250px] bg-[#F2ECE3] rounded-[30px] p-2 hover:shadow-lg transition hover:scale-103"
          >
            <div className="w-[223px] h-[221px] relative">
              <Image
                src={program.svg}
                alt={program.name}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="mt-2 font-cinzel font-bold text-[#413320] text-[28px] text-center break-words">
              {program.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}