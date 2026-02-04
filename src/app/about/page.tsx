import React, { Suspense } from "react";
import SectionHeading from "../../components/SectionHeading";
import TextSection from "../../components/TextSection";
import ImageSlider from "../../components/ImageSlider";
import Testimonials from "../../components/Testimonials";
import AboutSuccessMessage from "@/components/about/AboutSuccessMessage";
import { getAboutContent } from "@/lib/getAboutContent";
import type { ImageAsset } from "@/types/about";


export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await getAboutContent();

  if (!content) {
    return (
      <main className="py-16 text-center">
        <p>About content coming soon ✨</p>
      </main>
    );
  }


const bookImages: ImageAsset[] =
  content.bookImages.length > 0
    ? // normalize Firestore data in case it still contains strings
      content.bookImages.map((img) =>
        typeof img === "string" ? { src: img, alt: "" } : img
      )
    : [
        { src: "/assets/images/about/book1.png", alt: "Book 1" },
        { src: "/assets/images/about/book2.png", alt: "Book 2" },
        { src: "/assets/images/about/book3.png", alt: "Book 3" },
        { src: "/assets/images/about/book4.png", alt: "Book 4" },
      ];


  return (
    <main>
      {/* ✅ REQUIRED for useSearchParams */}
      <Suspense fallback={null}>
       <AboutSuccessMessage /> 
      </Suspense>

      <TextSection
        heading={{
          title: "Mission Statement",
          src: "/assets/headings/about/MissionStatement.png",
          alt: "Mission Statement",
          width: 340,
          height: 180,
          maxWidth: "340px",
        }}
        text={content.missionStatement}
      />

     <ImageSlider images={bookImages} />

      <div className="mt-12">
        <TextSection
          heading={{
            title:"Who we are",
            src: "/assets/headings/about/WhoWeAre.png",
            alt: "Who We Are",
            width: 210,
            height: 180,
            maxWidth: "210px",
          }}
          text={content.whoWeAre}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-4 gap-y-6 mt-8">
        <TextSection
          heading={{
             title:"What we do?",
            src: "/assets/headings/about/WhatWeDo.png",
            alt: "What We Do",
            width: 210,
            height: 200,
            maxWidth: "210px",
          }}
          text={content.whatWeDo}
          image={{
            src: "/assets/images/about/PeopleAreDoingOnline.png",
            alt: "People Are Doing Online",
            width: 400,
            height: 350,
          }}
        />

        <TextSection
          heading={{
            title:"Why it matters",
            src: "/assets/headings/about/WhyItMatters.png",
            alt: "Why It Matters",
            width: 270,
            height: 200,
            maxWidth: "270px",
          }}
          text={content.whyItMatters}
        />
      </div>

      <div className="mb-12">
        <SectionHeading
          title="Our Testimonials"
          src="/assets/headings/Testimonials.png"
          alt="Testimonials Heading"
          width={200}
          height={50}
          maxWidth="200"
          centerAll={true}
        />
      </div>

      <Testimonials testimonials={content.testimonials} />
    </main>
  );
}
