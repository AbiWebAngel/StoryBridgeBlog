import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import TextWithSideImage from "@/components/mentorship/TextWithSideImage";
import SignUpNow from "@/components/SignUpNow";
import Testimonials from "../../components/Testimonials";
import { getMentorshipContent } from "@/lib/getMentorshipContent";

type AdminTestimonial = {
  text: string;
  image: string;
  imageAlt: string;
};


export default async function MentorshipPage() {
  // Fetch mentorship content from Firestore
  const mentorshipContent = await getMentorshipContent();

  // If no content exists, show empty state
  if (!mentorshipContent) {
    return (
      <main>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Mentorship Content Coming Soon</h2>
          <p className="text-gray-600">Our mentorship page information is being prepared. Please check back later.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* What is Mentorship Section */}
      <div className="mb-12">
        <TextSection
          heading={{
            title:"What is mentorship for?",
            src: "/assets/headings/mentorship/WhatIsMentorship.png",
            alt: "What Is Mentorship Heading",
            width: 420,
            height: 180,
            maxWidth: "420px",
            mobileWidth: 200,
            mobileHeight: 80,
          }}
          text={mentorshipContent.whatIsMentorship.text}
        />
      </div>

      {/* How it works Section */}
      <TextWithSideImage
        heading={{
          title: "Hot it works?",
          src: "/assets/headings/mentorship/HowItWorks.png",
          alt: "How it works Heading",
          width: 230,
          height: 180,
          maxWidth: "230px",
        }}
        text={mentorshipContent.howItWorks.text}
        image={{
          src: mentorshipContent.howItWorks.image.src,
          alt: mentorshipContent.howItWorks.image.alt,
          width: mentorshipContent.howItWorks.image.width,
          height: mentorshipContent.howItWorks.image.height,
        }}
        listType="ordered"
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
        leftSection={mentorshipContent.signUpNow.menteeSection}
        rightSection={mentorshipContent.signUpNow.mentorSection}
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
      testimonials={mentorshipContent.testimonials.testimonials.map(
        (t: AdminTestimonial, index: number) => ({
          text: t.text,
          image: {
            src: t.image,
            alt: t.imageAlt || `Mentorship testimonial ${index + 1}`,
          },
        })
      )}
    />

    </main>
  );
}