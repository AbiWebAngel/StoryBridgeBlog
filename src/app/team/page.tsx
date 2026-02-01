import TallyCounter from "@/components/team/TallyCounter";
import SectionHeading from "../../components/SectionHeading";
import OurTeam, { TeamMember } from "../../components/team/OurTeam";
import TextSectionWithButton from "../../components/team/TextSectionWithButton";
import { getTeamContent } from "@/lib/getTeamContent";

export default async function TeamPage() {
  // Fetch team content from Firestore
  const teamContent = await getTeamContent();
  
  // Use Firestore data
  const joinTeamText = teamContent?.joinTeamText || "";
  const matchesCount = teamContent?.matchesCount || 0;
  const workshopsCount = teamContent?.workshopsCount || 0;
  const teamData = teamContent?.teamMembers || [];

  return (
    <main>
      {/* Only show Join Us section if there's content */}

      {joinTeamText && (
        <div className="mb-12">
          <TextSectionWithButton
            heading={{ 
              title:"Join the team",
              src: "/assets/headings/team/JoinTheTeam.png",
              alt: "Join The Team heading", 
              width: 193, 
              height: 100,
              maxWidth: "270px"
            }}
            text={joinTeamText}
            // Use the joinUrl from Firestore if available, otherwise fallback to /apply
            buttonUrl={teamContent?.joinUrl || "/apply"} 
          />
        </div>
      )}
      
      {/* Only show Tally Counter if there are counts */}
      {(matchesCount > 0 || workshopsCount > 0) && (
        <div className="mb-12">
          <TallyCounter 
            matchesCount={matchesCount} 
            workshopsCount={workshopsCount} 
          />
        </div>
      )}

      {/* Only show Our Team section if there are team members */}
      {teamData.length > 0 && (
        <>
          <div className="mb-8">
            <SectionHeading
              title="Our team"
              src="/assets/headings/team/OurTeam.png"
              alt="Our Team Heading"
              width={150}
              height={50}
              centerAll={true}
            />
          </div>
          
          <OurTeam teamData={teamData} />
        </>
      )}
      
      {/* Show empty state message when no team content exists */}
      {!joinTeamText && teamData.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Team Content Coming Soon</h2>
          <p className="text-gray-600">Our team information is being prepared. Please check back later.</p>
        </div>
      )}
    </main>
  );
}