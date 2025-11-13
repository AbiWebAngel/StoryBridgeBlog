"use client";

import { useState } from "react";
import Image from "next/image";

const blogData = [
  {
    id: 1,
    title: "Writing Motivation #1",
    image: "/assets/images/home/blog1.jpg",
    content: [
      <div
        key="content1"
        className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter"
      >
        {`In honour of one of our bloggers turning 15, here are `}
        <span style={{ color: "#CF822A", fontWeight: 600 }}>
          15 motivational quotes
        </span>
        {` to start your day off sprinting (writing sprints).`}
        <br />
        <br />
        {`1. "You do not have to be fire to burn. You only need to be awake." – Unknown`}
        <br />
        {`2. "Discipline is choosing between what you want now and what you want most." – Attributed to Abraham Lincoln, and Psychotherapist Augusta F. Kantra.`}
        <br />
        {`3. "Success is not final, failure is not fatal; it's the courage to continue that counts." – Winston Churchill`}
        <br />
        {`4. "Everyone has a story, a writer is the only one brave enough to tell it." – Abigail...`}
      </div>,
    ],
  },
  {
    id: 2,
    title: `Beta reading #2: How to have a successful beta-reader/writer relationship: Building bridges`,
    image: "/assets/images/home/blog2.jpg",
    content: [
      <div
        key="content2"
        className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter"
      >
        <strong>Preface:</strong>
        <br />
        {`Before I get into this week’s content, the StoryBridge team wants to congratulate you all for being here!`}
        <br />
        {`Why? Because it's no easy task to trust others with your creativity or be tactful and truthful in your reviews.`}
        <br />
        {`Yet you've decided to try, and that's half the battle. Which is why I've decided to make a simple, step-by-step guide on getting the most of your beta-reader/writer pairing. The analogy I'll be using is inspired by our namesake, hence: "Building bridges."`}
        <br />
        <strong>Step 1: Know your foundation</strong>
        <br />
        {`"The whole point of a beta reader is to get into the nitty-gritty subjects—deeper than just 'what did you like and what didn't you like?'...`}
      </div>,
    ],
  },
  {
    id: 3,
    title: "Author Interview #3: Finding your voice in a noisy world",
    image: "/assets/images/home/blog1.jpg",
    content: [
      <div
        key="content3"
        className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter"
      >
        {`This week, we sit down with `}
        <span style={{ color: "#CF822A", fontWeight: 600 }}>Lena Harper</span>
        {`, an indie author who has made waves with her debut novel, `}
        <em>{`"The Silence Between Notes."`}</em>
        <br />
        {`We talked about how she discovered her writing voice amidst the endless online advice, critique circles, and self-doubt.`}
        <br />
        <strong>{`"Voice isn’t something you find—it’s something you allow,"`}</strong>
        {` she said. `}
        {`"The more you imitate others, the quieter yours becomes."`}
        <br />
        {`Her advice to emerging writers? `}
        <em>{`"Stop trying to sound like a writer. Start trying to sound like you."`}</em>
      </div>,
    ],
  },
  {
    id: 4,
    title: "What to Write Wednesday #4: Overcoming creative blocks",
    image: "/assets/images/home/blog2.jpg",
    content: [
      <div
        key="content4"
        className="space-y-4 text-[16px] sm:text-[17px] lg:text-[18px] font-inter"
      >
        {`Stuck staring at a blinking cursor? Don’t panic—every writer has been there.`}
        <br />
        {`Let’s talk about some practical ways to break through that wall.`}
        <br />
        <strong>{`1. Move, don’t mope:`}</strong>
        {` Take a walk, stretch, or clean your workspace. Your brain resets when your body moves.`}
        <br />
        <strong>{`2. Write terribly—on purpose:`}</strong>
        {` Lower the stakes. A bad page can be edited; a blank one can’t.`}
        <br />
        <strong>{`3. Feed your creative well:`}</strong>
        {` Read something outside your genre or listen to a podcast that inspires curiosity.`}
        <br />
        {`Remember, the goal isn’t perfection—it’s momentum. Writing is a muscle, and even small reps count.`}
      </div>,
    ],
  },
];

const ITEMS_PER_PAGE = 2;

export default function LatestBlogs() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogData.length / ITEMS_PER_PAGE);

  const currentItems = blogData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col items-center space-y-12">
      {currentItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col w-full sm:w-[90%] md:w-[95%] lg:max-w-[1096px] mx-auto rounded-[30px] bg-[#F2ECE3] text-[#413320] overflow-hidden shadow-xl h-full"
        >
          {/* Heading + Heart */}
          <div className="flex justify-between items-start gap-4 pt-4 pb-2 px-4 sm:px-6 md:px-8">
            <h3 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold flex-1 min-w-0 break-words">
              {item.title}
            </h3>
            <div className="flex-shrink-0 w-8 h-8">
              <Image
                src="/assets/icons/home/heart.svg"
                alt="Favorite"
                width={32}
                height={32}
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col lg:flex-row pt-0 pb-4 px-4 sm:px-6 md:px-8 gap-3 flex-1">
            {/* Image */}
            <div className="flex justify-center items-center lg:flex-[1_1_30%]">
              <Image
                src={item.image}
                alt={item.title}
                width={280}
                height={160}
                className="rounded-[30px] object-cover"
              />
            </div>

            {/* Text content */}
            <div className="flex flex-col justify-between lg:flex-[1_1_70%] space-y-3 h-full px-2 sm:px-4 md:px-6">
              <div className="overflow-hidden max-h-[230px] sm:max-h-[260px] lg:max-h-[300px] relative flex-1">
                <div className="line-clamp-none">{item.content}</div>
                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F2ECE3] to-transparent pointer-events-none"></div>
              </div>
              <div className="text-right mt-4">
                <a
                  href="#"
                  className="font-inter text-[#CF822A] font-bold hover:underline"
                >
                  Click here to read more
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex flex-wrap justify-center space-x-2 sm:space-x-3 text-[#413320] font-inter font-bold">
        <span className="mr-2">Page:</span>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded ${
              currentPage === page
                ? "bg-[#413320] text-white"
                : "bg-[#F2ECE3] hover:bg-[#D8CBBF]"
            } transition`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
