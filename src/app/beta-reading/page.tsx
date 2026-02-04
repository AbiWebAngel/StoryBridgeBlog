// app/betareading/page.tsx
import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import TextWithSideImage from "@/components/mentorship/TextWithSideImage";
import SignUpNow from "@/components/SignUpNow";
import Testimonials from "../../components/Testimonials";
import { getBetaReadingContent } from "@/lib/getBetaReadingContent";

type AdminTestimonial = {
  text: string;
  image: string;
  imageAlt: string;
};

export default async function BetaReadingPage() {
  // Fetch betareading content from Firestore
  const betareadingContent = await getBetaReadingContent();

  // If no content exists, show empty state
  if (!betareadingContent) {
    return (
      <main>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Beta Reading Content Coming Soon</h2>
          <p className="text-gray-600">Our beta reading page information is being prepared. Please check back later.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* What is Beta Reading Section */}
      <div className="mb-12">
        <TextSection
          heading={{
            title: "Beta Reading?",
            src: "/assets/headings/betareading/BetaReading.png",
            alt: "What Is BetaReading Heading",
            width: 240,
            height: 180,
            maxWidth: "230px",
          }}
          text={betareadingContent.whatIsBetareading.text}
        />
      </div>

      {/* What we offer Section */}
      <TextWithSideImage
        heading={{
          title: "What we offer:",
          src: "/assets/headings/betareading/WhatWeOffer.png",
          alt: "What we offer Heading",
          width: 240,
          height: 180,
          maxWidth: "240px",
        }}
        text={betareadingContent.whatWeOffer.text}
        image={{
          src: betareadingContent.whatWeOffer.image.src,
          alt: betareadingContent.whatWeOffer.image.alt,
          width: betareadingContent.whatWeOffer.image.width,
          height: betareadingContent.whatWeOffer.image.height,
        }}
        listType="unordered"
      />

      {/* Sign Up Now Section */}
      <div className="mb-8 mt-14">
        <SectionHeading
          title="Sign up now"
          src="/assets/headings/SignUpNow.png"
          alt="Sign Up Now Heading"
          width={190}
          height={50}
          maxWidth="190"
          centerAll={true}
        />
      </div>
      
      {/* Pass the data to SignUpNow component */}
      <SignUpNow 
        leftSection={{
          title: betareadingContent.signUpNow.findingBetaReadersSection.title,
          description: betareadingContent.signUpNow.findingBetaReadersSection.description,
          buttonText: betareadingContent.signUpNow.findingBetaReadersSection.buttonText,
          buttonUrl: betareadingContent.signUpNow.findingBetaReadersSection.buttonUrl,
          image: betareadingContent.signUpNow.findingBetaReadersSection.image,
        }}
        rightSection={{
          title: betareadingContent.signUpNow.becomingBetaReaderSection.title,
          description: betareadingContent.signUpNow.becomingBetaReaderSection.description,
          buttonText: betareadingContent.signUpNow.becomingBetaReaderSection.buttonText,
          buttonUrl: betareadingContent.signUpNow.becomingBetaReaderSection.buttonUrl,
          image: betareadingContent.signUpNow.becomingBetaReaderSection.image,
        }}
      />

      {/* Testimonials Section */}
      <div className="mb-12">
        <SectionHeading
          title="Our testimonials"
          src="/assets/headings/Testimonials.png"
          alt="Testimonials Heading"
          width={200}
          height={50}
          maxWidth="200"
          centerAll={true}
        />
      </div>
      <Testimonials
        testimonials={betareadingContent.testimonials.testimonials.map(
          (t: AdminTestimonial, index: number) => ({
            text: t.text,
            image: {
              src: t.image,
              alt: t.imageAlt || `Beta Reading testimonial ${index + 1}`,
            },
          })
        )}
      />
    </main>
  );
}