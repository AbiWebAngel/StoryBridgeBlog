"use client";

import Image from "next/image";

const teamData = [
  {
    id: 1,
    name: "ABIGAIL",
    role: "Writer",
    description: "As a writer, I enjoy crafting meaningful content that blends creativity with clarity. Whether it's articles, stories, or blog posts, I aim to capture ideas in a way that connects with readers and keeps them engaged.",
    image: "/assets/images/team/abigail.jpg"
  },
  {
    id: 2,
    name: "Julianna",
    role: "Writer",
    description: "Writing lets me explore ideas and share them in ways that spark curiosity. From thoughtful blogs to creative stories, I aim to leave readers with something inspiring and worth remembering.",
    image: "/assets/images/team/benjamin.jpg"
  },
  {
    id: 3,
    name: "Feather",
    role: "Writer",
    description: "Each piece I write is a chance to turn thoughts into something valuable. Whether articles, blogs, or stories, I aim to capture attention and share perspectives that resonate long after reading.",
    image: "/assets/images/team/chloe.jpg"
  },
  {
    id: 4,
    name: "Nadia",
    role: "Writer",
    description: "Writing is my way of shaping ideas and sharing them with the world. I enjoy blending insight with creativity in blogs, essays, or narratives, always aiming to connect with readers in a meaningful way.",
    image: "/assets/images/team/david.jpg"
  },
  {
    id: 5,
    name: "Riddhima",
    role: "Marketer, Feedback Coordinator",
    description: "Addicted to coffee.",
    image: "/assets/images/team/eleanor.jpg"
  },
  {
    id: 6,
    name: "Nyxelle",
    role: "Blogger, Beta reader",
    description: "A teen who's obsessed with reading, always has a pen nearby, and probably thinks in stories more than actual thoughts. Writing is my favorite way to make sense of the world, and books are my go-to escape. I love learning weird facts, listening to sad music on repeat, and staying up way too late with a good story. Quiet but curious, creative but chill — just figuring things out one page at a time.",
    image: "/assets/images/team/frank.jpg"
  },
  {
    id: 7,
    name: "Tisha",
    role: "Feedback Coordinator",
    description: "Lover of literature",
    image: "/assets/images/team/grace.jpg"
  }
];

export default function OurTeam() {
  return (
    <section className="w-full bg-[#D1BDA1] py-12 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {teamData.map((member) => (
          <div
            key={member.id}
            className="flex w-full h-[280px] sm:h-[320px] rounded-l-[30px] overflow-hidden shadow-xl"
          >
            {/* Image Section - 1/4 of card with curved left side */}
            <div className="w-1/4 relative">
              <div className="rounded-l-[30px] overflow-hidden h-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Text Section - 3/4 of card with straight right side */}
            <div className="w-3/4 bg-[#EDE5D8] p-6 sm:p-8 flex flex-col">
              {/* Name and Role - Fixed at top */}
              <div className="space-y-3 sm:space-y-4 mb-4">
                {/* Name */}
                <h3 className="font-cinzel font-bold text-[28px] sm:text-[30px] text-[#000000] uppercase">
                  {member.name}
                </h3>
                
                {/* Role */}
                <p className="font-jacques-francois text-[22px] sm:text-[24px] text-[#403F3C]">
                  {member.role}
                </p>
              </div>
              
              {/* Scrollable Description */}
              <div className="flex-1 overflow-y-auto pr-2">
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