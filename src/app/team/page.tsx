import TallyCounter from "@/components/team/TallyCounter";
import SectionHeading from "../../components/SectionHeading";
import OurTeam from "../../components/team/OurTeam";
import TextSectionWithButton from "../../components/team/TextSectionWithButton";


export default function TeamPage() {
  return (
      <main>

          <div className="mb-12">
              {/* Join Us Section */}
                <TextSectionWithButton
                  heading={{ 
                    src: "/assets/headings/team/JoinTheTeam.png",
                     alt: "Join The Team heading", 
                     width: 193, 
                     height: 100 ,
                     maxWidth: "270px"
                    }}
                  text="At StoryBridge, we believe stories have the power to connect people, spark imagination, 
                  and open doors to entirely new worlds. Every voice brings something unique, and every story 
                  helps build a bridge between experiences. We&apos;d love for you to be part of that journey with us. 
                  Whether you create, collaborate, or simply share your perspective, together we can shape a community 
                  where ideas travel freely and creativity thrives."
                  />
          </div>
           <div className="mb-12">
              {/* Tally Counter Section */}
               <TallyCounter matchesCount={120} workshopsCount={20} />
          </div>


          {/* Our Team Section */}
          <div className="mb-8">
                  <SectionHeading
                    src="/assets/headings/team/OurTeam.png"
                    alt="Our Team Heading"
                    width={150}
                    height={50}
                    centerAll={true}
                  />
          </div>
          <OurTeam />
      </main>
  )
}
