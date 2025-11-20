import SectionHeading from "@/components/SectionHeading";
import TextSection from "@/components/TextSection";
import TextWithSideImage from "@/components/mentorship/TextWithSideImage";
import SignUpNow from "@/components/mentorship/SignUpNow";
import Image from "next/image";
import Testimonials from "../../components/Testimonials";


export default function MentorshipPage() {

  const testimonials = [
  {
    text: "Becoming a mentee here has been eye-opening. My mentor guided me through challenges I never knew I could handle.",
    image: "/assets/images/about/test1.jpg",
  },
  {
    text: "As a mentor, I get to share my experience and watch my mentees grow. It’s incredibly rewarding.",
    image: "/assets/images/about/test2.jpg",
  },
  {
    text: "Joining as a mentee helped me focus on my goals and get advice I can actually use in real life.",
    image: "/assets/images/about/test3.jpg",
  },
  {
    text: "Being a mentor on this platform is fulfilling. I can help someone’s journey while learning myself.",
    image: "/assets/images/about/test4.jpg",
  },
  {
    text: "My mentee experience has been amazing. I feel supported, challenged, and inspired every step of the way.",
    image: "/assets/images/about/test5.jpg",
  },
  {
    text: "I’ve loved mentoring here. Seeing progress and growth in mentees gives me a real sense of purpose.",
    image: "/assets/images/about/test6.jpg",
  },
];


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
              heading={{ src: "/assets/headings/mentorship/HowItWorks.png", 
                alt: "How it works Heading", 
                width: 250, 
                height: 180,
                maxWidth: "250px", 
              }}
              text={[
                "Select one of the options below. You’ll be redirected to a form, answer a few questions and click submit.",
                "Your application is logged in our system so we can begin processing it.",
                "Once we receive your application, we’ll find your perfect match from among our mentors.", 
                "We’ll then contact you with your match and share the next steps on how to connect with your mentor."
              ]}
              image={{ 
                src: "/assets/images/mentorship/image1.svg", 
                alt: "A Mentor guiding a mentee", 
                width: 300, 
                height: 300 
              }}
            />

            {/* Sign Up Now Section */}
            <div className="mb-12 mt-16">
                      <SectionHeading
                        src="/assets/headings/mentorship/SignUpNow.png"
                        alt="Sign Up Now Heading"
                        width={190}
                        height={50}
                        centerAll={true}
                      />
            </div>
            <SignUpNow />

            {/* People Celebrating Section */}
            <div className="flex justify-center mb-16">
              <Image
                src="/assets/images/mentorship/image2.svg"
                alt="People celebrating"
                width={300} 
                height={250} 
                className="object-contain"
                priority
              />
            </div>
           
           {/* Testimonial */}
            <div className="mb-12">
              <SectionHeading
                src="/assets/headings/Testimonials.png"
                alt="Testimonials Heading"
                width={200}
                height={50}
                centerAll={true}
            />
            </div>
            <Testimonials testimonials={testimonials} />      
        </main>
}
