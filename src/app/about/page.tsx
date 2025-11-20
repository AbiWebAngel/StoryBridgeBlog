"use client";


import React from "react";
import SectionHeading from "../../components/SectionHeading";
import TextSection from "../../components/TextSection";
import ImageSlider from "../../components/ImageSlider";
import Testimonials from "../../components/Testimonials";



export default function AboutPage() {
  
  const bookImages = [
    "/assets/images/about/book1.png",
    "/assets/images/about/book2.png",
    "/assets/images/about/book3.png",
    "/assets/images/about/book4.png",
  ];

  const testimonials = [
    {
      text: "This blog is my daily dose of inspiration—always fresh, clear, and insightful.",
      image: "/assets/images/about/test1.jpg",
    },
    {
      text: "I’ve learned more here in weeks than months of browsing random sites. Brilliant!",
      image: "/assets/images/about/test2.jpg",
    },
    {
      text: "Engaging, well-written, and reliable—this blog keeps me coming back every week.",
      image: "/assets/images/about/test3.jpg",
    },
     {
      text: "This blog is my daily dose of inspiration—always fresh, clear, and insightful.",
      image: "/assets/images/about/test4.jpg",
    },
    {
      text: "I’ve learned more here in weeks than months of browsing random sites. Brilliant!",
      image: "/assets/images/about/test5.jpg",
    },
    {
      text: "Engaging, well-written, and reliable—this blog keeps me coming back every week.",
      image: "/assets/images/about/test6.jpg",
    },
  ];

    return (
      <main>
      {/* Mission Statement */}
      <TextSection
        heading={{
          src: "/assets/headings/about/MissionStatement.png",
          alt: "Mission Statement",
          width: 360,
          height: 180,
          maxWidth: "360px",
        }}
        text="StoryBridge is a youth-led initiative bringing young writers and readers together through storytelling, literacy projects and community connection."
      />

        <ImageSlider images={bookImages} />

      <div className="mt-12">
        {/* Who We Are */}
       <TextSection
          heading={{
            src: "/assets/headings/about/WhoWeAre.png",
            alt: "Who We Are",
            width: 230,
            height: 180,
            maxWidth: "230px",
          }}
          text="Founded on the belief that stories can build bridges between people and communities,
           StoryBridge provides writers, especially teens, with resources to help them grow into their full potential!"
        />

      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-4 gap-y-6 mt-8">
        <TextSection
          heading={{
            src: "/assets/headings/about/WhatWeDo.png",
            alt: "What We Do",
            width: 240,
            height: 200,
            maxWidth: "240px",
          }}
          text="We offer beta-reading services for novelists, a mentorship program for those just starting out,
           and weekly competitions based on writing prompts to keep the creativity flowing."
          image={{
            src: "/assets/images/about/PeopleAreDoingOnline.png",
            alt: "People Are Doing Online",
            width: 400,
            height: 350,
          }}
        />

        <TextSection
          heading={{
            src: "/assets/headings/about/WhyItMatters.png",
            alt: "Why It Matters",
            width: 290,
            height: 200,
            maxWidth: "290px",
          }}
          text="Young writers are often told to wait until they “grow up” before their words can make a difference. 
          At StoryBridge, we believe the opposite: every young person already has something worth saying, and writing is one of the most powerful ways to say it.
           StoryBridge matters because it gives teen writers a place to be heard, to share, and to connect. Writing isn’t just a skill — it’s a way of understanding the world,
            building empathy, and turning ideas into action. We’re not only encouraging better stories; we’re encouraging better storytellers, nurturing leaders, 
            and supporting the authors of tomorrow, today."
        />
      </div>

      {/* Testimonial */}
     <div className="mb-12">
        <SectionHeading
          src="/assets/headings/about/Testimonials.png"
          alt="Testimonials Heading"
          width={200}
          height={50}
          centerAll={true}
      />
      </div>
      <Testimonials testimonials={testimonials} />
    </main>
  );
}
