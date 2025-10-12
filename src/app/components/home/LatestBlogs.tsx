"use client";

import { useState } from "react";
import Image from "next/image";

// Mock data for 10 blog articles
const blogData = [
  {
    id: 1,
    title: "Writing Motivation #1",
    image: "/assets/images/home/blog1.jpg",
    content: [
      <div key="content1" className="space-y-4 text-[18px]">
        <p>
          In honour of one of our bloggers turning 15, here are{" "}
          <span style={{ color: "#CF822A", fontWeight: 600 }}>
            15 motivational quotes
          </span>{" "}
          to start your day off sprinting (writing sprints).
        </p>

        <p>
          1. "You do not have to be fire to burn. You only need to be awake." – Unknown
        </p>

        <p>
          2. "Discipline is choosing between what you want now and what you want most." –
          Attributed to Abraham Lincoln, and Psychotherapist Augusta F. Kantra.
        </p>

        <p>
          3. "Success is not final, failure is not fatal; it's the courage to continue that counts." –
          Winston Churchill
        </p>

        <p>
          4. "Everyone has a story, a writer is the only one brave enough to tell it." – Abigail...
        </p>
      </div>,
    ],
  },
  {
    id: 2,
    title:
      "Beta reading #2: How to have a successful beta-reader/writer relationship: Building bridges",
    image: "/assets/images/home/blog2.jpg",
    content: [
      <p key="p1"><strong>Preface:</strong></p>,
      <p key="p2">
        Before I get into this weeks content, the StoryBridge team wants to congratulate you all for being here!
      </p>,
      <p key="p3">
        Why? Because it's no easy task to trust others with your creativity or be tactful and truthful in your reviews.
      </p>,
      <p key="p4">
        Yet you've decided to try, and that's half the battle. Which is why I've decided to make a simple, step-by-step guide on getting the most of your beta-reader/writer pairing. The analogy I'll be using is inspired by our namesake, hence: "Building bridges."
      </p>,
      <p key="p5"><strong>Step 1: Know your foundation</strong></p>,
      <p key="p6">
        "The whole point of a beta reader is to get into the nitty-gritty subjects—deeper than just 'what did you like and what didn't you like?'...
      </p>,
    ],
  },
  {
    id: 3,
    title: "Author Interview #3: Finding your voice in a noisy world",
    image: "/assets/images/home/blog1.jpg",
    content: [
      <div key="content3" className="space-y-4 text-[18px]">
        <p>
          This week, we sit down with{" "}
          <span style={{ color: "#CF822A", fontWeight: 600 }}>Lena Harper</span>,
          an indie author who has made waves with her debut novel,
          <em> “The Silence Between Notes.”</em>
        </p>

        <p>
          We talked about how she discovered her writing voice amidst the
          endless online advice, critique circles, and self-doubt.
        </p>

        <p>
          <strong>“Voice isn’t something you find—it’s something you allow,”</strong>{" "}
          she said. “The more you imitate others, the quieter yours becomes.”
        </p>

        <p>
          Her advice to emerging writers?{" "}
          <em>“Stop trying to sound like a writer. Start trying to sound like you.”</em>
        </p>
      </div>,
    ],
  },
  {
    id: 4,
    title: "What to Write Wednesday #4: Overcoming creative blocks",
    image: "/assets/images/home/blog2.jpg",
    content: [
      <div key="content4" className="space-y-4 text-[18px]">
        <p>
          Stuck staring at a blinking cursor? Don’t panic—every writer has been there.
          Let’s talk about some practical ways to break through that wall.
        </p>

        <p>
          <strong>1. Move, don’t mope:</strong> Take a walk, stretch, or clean your workspace.
          Your brain resets when your body moves.
        </p>

        <p>
          <strong>2. Write terribly—on purpose:</strong> Lower the stakes.
          A bad page can be edited; a blank one can’t.
        </p>

        <p>
          <strong>3. Feed your creative well:</strong> Read something outside your genre or
          listen to a podcast that inspires curiosity.
        </p>

        <p>
          Remember, the goal isn’t perfection—it’s momentum. Writing is a muscle,
          and even small reps count.
        </p>
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
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Blog Cards */}
      {currentItems.map((item) => (
        <div
          key={item.id}
          className="flex flex-col w-full sm:w-[90%] md:w-[95%] lg:w-[1096px] rounded-[30px] bg-[#EDE5D8] text-[#413320] overflow-hidden shadow-md"
        >
         {/* Heading + Heart */}
        <div className="flex justify-between items-start gap-4 pt-4 pb-2 sm:p-6">
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


          {/* Body: Image + Content */}
          <div className="flex flex-col lg:flex-row pt-0 pb-4 px-4 sm:px-6 gap-3">
            {/* Left Image */}
            <div className="flex justify-center items-center lg:flex-[1_1_40%]">
              <Image
                src={item.image}
                alt={item.title}
                width={280}
                height={160}
                className="rounded-[30px] object-cover"
              />
            </div>

            {/* Right content */}
            <div className="font-inter flex flex-col justify-between lg:flex-[1_1_60%] space-y-3">
              {item.content.map((paragraph, index) => (
               <span key={index} className="font-inter text-[16px] sm:text-[17px] lg:text-[18px]">
                 {paragraph}
               </span>
              ))}

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
                : "bg-[#EDE5D8] hover:bg-[#D8CBBF]"
            } transition`}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}
