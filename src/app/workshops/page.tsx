// app/workshops/page.tsx
import NewsletterForm from "@/components/NewsletterForm";
import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import EventCardWithModal from "@/components/workshops/EventCardWithModal";
import { getWorkshopsContent } from "@/lib/getWorkshopsContent";



export default async function WorkshopsPage() {
  // Fetch workshops content from Firestore
  const workshopsContent = await getWorkshopsContent();

  // If no content exists, show empty state
  if (!workshopsContent) {
    return (
      <main>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Workshops Coming Soon</h2>
          <p className="text-gray-600">Our Workshops page information is being prepared. Please check back later.</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* What are Workshops for Section */}
      <div className="mb-12">
        <TextSection
          heading={{
            title: "What are workshops for?",
            src: "/assets/headings/workshops/WhatAreWorkshopsFor.png",
            alt: "What are workshops for?",
            width: 450,
            height: 180,
            maxWidth: "450px",
          }}
          text={workshopsContent.whatAreWorkshops.text}
        />
      </div>

      {/* Upcoming workshops Section */}
      <div className="mb-8 mt-14">
        <SectionHeading
          title="Upcoming Workshops"
          src="/assets/headings/workshops/UpcomingWorkshops.png"
          alt="Upcoming Workshops Heading"
          width={330}
          height={100}
          maxWidth="330"
          centerAll={true}
        />
      </div>
      
      {/* Event Cards - pass the events array */}
      <EventCardWithModal eventData={workshopsContent.events} />

      {/* Like what you read section */}
      <div className="mb-18 mt-18">
        <SectionHeading
          title="Like what you read? Check out our blog and workshops, they're completely free"
          src="/assets/headings/LikeWhatYouRead.png"
          alt="Like what you read Heading"
          width={350}
          height={100}
          maxWidth="350"
          centerAll={true}
        />
      </div>
     
      {/* Newsletter Sign up section */}
      <NewsletterForm />
    </main>
  );
}