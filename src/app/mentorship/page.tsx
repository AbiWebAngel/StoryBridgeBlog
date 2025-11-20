import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import TextWithSideImage from "@/components/mentorship/TextWithSideImage";


export default function MentorshipPage() {
  return  <main>
  
            {/* What is Mentorship Section */}
            <div className="mb-12">
              <TextSection
                    heading={{
                      src: "/assets/headings/mentorship/WhatIsMentorship.png",
                      alt: "What Is Mentorship Heading",
                      width: 450,
                      height: 180,
                      maxWidth: "450px",
                    }}
                    text={`Writing isn’t a skill you develop overnight. You often have to push through countless late-night
                           writing sprints before your story stops making you cringe. 
                           Although writing demands time and dedication, a mentor can help 
                           you avoid the mistakes before you make them.`
                          }
                  />
            </div>
            
            {/* How it works Section */}
            <TextWithSideImage
              heading={{ src: "/assets/headings/mentorship/HowItWorks.png", alt: "How it works Heading", width: 250, height: 180,maxWidth: "250px", }}
              text={[
                "Select one of the options below. You’ll be redirected to a form, answer a few questions and click submit.",
                "Your application is logged in our system so we can begin processing it.",
                "Once we receive your application, we’ll find your perfect match from among our mentors.", 
                "We’ll then contact you with your match and share the next steps on how to connect with your mentor."
              ]}
              image={{ src: "/assets/images/mentorship/image1.svg", alt: "A Mentor guiding a mentee", width: 300, height: 300 }}
            />
        </main>
}
