import SectionHeading from "../../components/SectionHeading";
import OurTeam from "../../components/team/OurTeam";


export default function TeamPage() {
  return (
      <main>

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
