"use client";

import Image from "next/image";
import React from "react";
import SectionHeading from "../components/SectionHeading";
import TextSection from "../components/TextSection";
import NewsletterForm from "../components/NewsletterForm";
import ImageSlider from "../components/ImageSlider";
import {useState, FormEvent } from 'react';

export default function AboutPage() {
  
  const bookImages = [
    "/assets/images/book1.png",
    "/assets/images/book2.png",
    "/assets/images/book3.png",
    "/assets/images/book4.png",
  ];
  
    return (
      <main>
      {/* Mission Statement */}
      <TextSection
        heading={{
          src: "/assets/headings/MissionStatement.png",
          alt: "Mission Statement",
          width: 450,
          height: 180,
          maxWidth: "450px",
        }}
        text="StoryBridge is a youth-led initiative bringing young writers and readers together through storytelling, literacy projects and community connection."
      />

        <ImageSlider images={bookImages} />

      <div className="mt-12">
        {/* Who We Are */}
       <TextSection
          heading={{
            src: "/assets/headings/WhoWeAre.png",
            alt: "Who We Are",
            width: 290,
            height: 180,
            maxWidth: "290px",
          }}
          text="Founded on the belief that stories can build bridges between people and communities,
           StoryBridge provides writers, especially teens, with resources to help them grow into their full potential!"
        />

      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 mt-8 ">
        <TextSection
          heading={{
            src: "/assets/headings/WhatWeDo.png",
            alt: "What We Do",
            width: 300,
            height: 200,
            maxWidth: "300px",
          }}
          text="We offer beta-reading services for novelists, a mentorship program for those just starting out,
           and weekly competitions based on writing prompts to keep the creativity flowing."
          image={{
            src: "/assets/images/PeopleAreDoingOnline.png",
            alt: "People Are Doing Online",
            width: 400,
            height: 350,
          }}
        />

        <TextSection
          heading={{
            src: "/assets/headings/WhyItMatters.png",
            alt: "Why It Matters",
            width: 370,
            height: 200,
            maxWidth: "370px",
          }}
          text="Young writers are often told to wait until they “grow up” before their words can make a difference. 
          At StoryBridge, we believe the opposite: every young person already has something worth saying, and writing is one of the most powerful ways to say it.
           StoryBridge matters because it gives teen writers a place to be heard, to share, and to connect. Writing isn’t just a skill — it’s a way of understanding the world,
            building empathy, and turning ideas into action. We’re not only encouraging better stories; we’re encouraging better storytellers, nurturing leaders, 
            and supporting the authors of tomorrow, today."
        />
      </div>

      {/* Newsletter */}
      <NewsletterForm />
    </main>
  );
}
