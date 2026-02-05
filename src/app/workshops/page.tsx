// app/betareading/page.tsx
import NewsletterForm from "@/components/NewsletterForm";
import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import { getBetaReadingContent } from "@/lib/getBetaReadingContent";
import EventCardWithModal, { EventData } from "@/components/EventCardWithModal";

type AdminTestimonial = {
  text: string;
  image: string;
  imageAlt: string;
};

export default async function WorkshopsPage() {


   const events: EventData[] = [
    {
      id: 1, // Changed from string to number
      title: "Finding Your Voice",
      date: new Date("2026-03-15"),
      description: "A beginner-friendly workshop focused on helping writers discover their unique tone and style through short prompts and group feedback.",
      fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
      image: { // Changed from imageUrl/imageAlt to image object
        src: "/assets/images/workshops/people1.png",
        alt: "Tech Conference 2024"
      },
      location: "San Francisco, CA",
      category: "Workshop",
      additionalInfo: [
        "Multiple tracks: AI, Web3, Cloud Computing",
        "Free swag and conference materials",
        "Networking cocktail hour each evening",
        "Career fair with top tech companies",
        "Workshops require separate registration"
      ],
      registrationLink: "/apply"
    },
    {
      id: 2,
      title: "From Idea to First Draft",
      date: new Date("2026-04-05"),
      description: "This workshop guides writers through turning vague ideas into complete first drafts. Perfect if you have many ideas but a suspicious lack of finished stories.",
      fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
      image: {
        src: "/assets/images/workshops/people2.png",
        alt: "Tech Conference 2024"
      },
      location: "San Francisco, CA",
      category: "Workshop",
      additionalInfo: [
        "Multiple tracks: AI, Web3, Cloud Computing",
        "Free swag and conference materials",
        "Networking cocktail hour each evening",
        "Career fair with top tech companies",
        "Workshops require separate registration"
      ],
      registrationLink: "/apply"
    },
    {
      id: 3,
      title: "Editing Without Fear",
      date: new Date("2026-05-07"),
      description: "A practical workshop on revising your work without getting stuck in perfectionism. You’ll learn how to edit with purpose instead of deleting everything in frustration.",
      fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
      image: {
        src: "/assets/images/workshops/people3.png",
        alt: "Tech Conference 2024"
      },
      location: "San Francisco, CA",
      category: "Workshop",
      additionalInfo: [
        "Multiple tracks: AI, Web3, Cloud Computing",
        "Free swag and conference materials",
        "Networking cocktail hour each evening",
        "Career fair with top tech companies",
        "Workshops require separate registration"
      ],
      registrationLink: "/apply"
    },
    {
      id: 4,
      title: "Writing Strong Characters",
      date: new Date("2026-05-10"),
      description: "Learn how to create believable characters with clear motivations, flaws, and growth. By the end, your characters will feel less like cardboard cutouts and more like real people.",
      fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
      image: {
        src: "/assets/images/workshops/people4.png",
        alt: "Tech Conference 2024"
      },
      location: "San Francisco, CA",
      category: "Workshop",
      additionalInfo: [
        "Multiple tracks: AI, Web3, Cloud Computing",
        "Free swag and conference materials",
        "Networking cocktail hour each evening",
        "Career fair with top tech companies",
        "Workshops require separate registration"
      ],
      registrationLink: "/apply"
    },
  ];

  // Fetch betareading content from Firestore
  const betareadingContent = await getBetaReadingContent();

  // If no content exists, show empty state
  if (!betareadingContent) {
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
      {/* What is Workshop for Section */}
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
          text={betareadingContent.whatIsBetareading.text}
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
      
      {/* Pass the data to SignUpNow component */}

          <EventCardWithModal eventData={events} />
   

      {/* Like what you read section */}
      <div className="mb-18 mt-18">
        <SectionHeading
          title="Like what you read? Check out our blog and workshops, they're completly free"
          src="/assets/headings/LikeWhatYouRead.png"
          alt="Like what you read Heading"
          width={350}
          height={100}
          maxWidth="350"
          centerAll={true}
        />
      </div>
     
     {/*Sign up section*/}
     <NewsletterForm />
    </main>
  );
}
