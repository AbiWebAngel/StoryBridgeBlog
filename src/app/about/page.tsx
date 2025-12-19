import React from "react";
import SectionHeading from "../../components/SectionHeading";
import TextSection from "../../components/TextSection";
import ImageSlider from "../../components/ImageSlider";
import Testimonials from "../../components/Testimonials";
import AboutSuccessMessage from "@/components/about/AboutSuccessMessage";
import { getAboutContent } from "@/lib/getAboutContent";

export default async function AboutPage() {
  const content = await getAboutContent();

  if (!content) {
    return (
      <main className="py-16 text-center">
        <p>About content coming soon ✨</p>
      </main>
    );
  }

  const bookImages =
    content.bookImages.length > 0
      ? content.bookImages
      : [
          "/assets/images/about/book1.png",
          "/assets/images/about/book2.png",
          "/assets/images/about/book3.png",
          "/assets/images/about/book4.png",
        ];

  return (
    <main>
      {/* ✅ Client-side success message */}
      <AboutSuccessMessage />

      <TextSection
        heading={{
          src: "/assets/headings/about/MissionStatement.png",
          alt: "Mission Statement",
          width: 360,
          height: 180,
          maxWidth: "360px",
        }}
        text={content.missionStatement}
      />

      <ImageSlider images={bookImages} />

      <div className="mt-12">
        <TextSection
          heading={{
            src: "/assets/headings/about/WhoWeAre.png",
            alt: "Who We Are",
            width: 230,
            height: 180,
            maxWidth: "230px",
          }}
          text={content.whoWeAre}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 lg:gap-x-4 gap-y-6 mt-8">
        <TextSection
          heading={{
            src: "/assets/headings/about/WhatWeDo.png",
            alt: "What We Do",
            width: 240,
            height: 200,
            maxWidth: "240px",
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
            src: "/assets/headings/about/WhyItMatters.png",
            alt: "Why It Matters",
            width: 290,
            height: 200,
            maxWidth: "290px",
          }}
          text={content.whyItMatters}
        />
      </div>

      <div className="mb-12">
        <SectionHeading
          src="/assets/headings/Testimonials.png"
          alt="Testimonials Heading"
          width={200}
          height={50}
          centerAll={true}
        />
      </div>

      <Testimonials testimonials={content.testimonials} />
    </main>
  );
}
