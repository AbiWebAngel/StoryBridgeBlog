// app/resources/page.tsx
import NewsletterForm from "@/components/NewsletterForm";
import SectionHeading from "@/components/SectionHeading";
import EventCardWithModal from "@/components/workshops/EventCardWithModal";
import { getWorkshopsContent } from "@/lib/getWorkshopsContent";
import { getResourcesContent } from "@/lib/getResourcesContent"; // Add this import
import MagazineGrid from "@/components/resources/MagazineGrid";
import SummerProgramsGrid from "@/components/resources/SummerProgramsGrid";
import WritingCompetitionsGrid from "@/components/resources/WritingCompetitionGrid";


export default async function ResourcesPage() {
  // Fetch workshops content from Firestore
  const workshopsContent = await getWorkshopsContent();
  
  // Fetch resources content from Firestore
  const resourcesContent = await getResourcesContent();
  
  // If no content exists, show empty state
  if (!workshopsContent || !resourcesContent) {
    return (
      <main>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Resources Coming Soon</h2>
          <p className="text-gray-600">Our Resources page information is being prepared. Please check back later.</p>
        </div>
      </main>
    );
  }

  return (
    <main>

      {/* Literacy Magazines Section */}
      <div className="mb-6">
        <SectionHeading
          title="Literacy Magazines"
          src="/assets/headings/resources/LiteracyMagazines.png"
          alt="Literacy Magazines Heading"
          width={200}
          height={100}
          maxWidth="200"
          centerAll={true}
        />
      </div>
      
      {/* Magazine component */}
      <MagazineGrid 
        magazines={resourcesContent.magazines}
        viewAllLink="/apply"
      />

      {/* Writing Competitions Section */}
      <div className="mb-12 mt-12">
        <SectionHeading
          title="Writing Competitions"
          src="/assets/headings/resources/WritingCompetitions.png"
          alt="Writing Competitions Heading"
          width={350}
          height={100}
          maxWidth="350"
          centerAll={true}
        />
      </div>
      
      {/* Event Cards - pass the events array */}
       <WritingCompetitionsGrid 
        competitions={resourcesContent.writingCompetitions}
      />

       {/* Summer Programs Section */}
      <div className="mb-12 mt-18">
        <SectionHeading
          title="Summer Programs"
          src="/assets/headings/resources/SummerPrograms.png"
          alt="Summer Programs Heading"
          width={200}
          height={100}
          maxWidth="200"
          centerAll={true}
        />
      </div>
      
      {/* Summer Programs Grid */}
      <SummerProgramsGrid programsData={resourcesContent.summerPrograms} />

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