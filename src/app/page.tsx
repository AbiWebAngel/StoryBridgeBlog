"use client";

import React from "react";
import SearchComponent from "../components/home/SearchComponent";
import NewsletterForm from "../components/NewsletterForm";
import SectionHeading from "../components/SectionHeading";
import LatestBlogs from "../components/home/LatestBlogs";
import JoinOurPrograms from "../components/home/JoinOurPrograms";
import MessageFromDirector from "../components/home/MessageFromDirector";

export default function HomePage() {
return (
    <main>
      {/* Search Section */}
      <SearchComponent />

      {/* Latest Blogs Section */}
      <div className="mb-8">
          <SectionHeading
            src="/assets/headings/home/BlogPosts.png"
            alt="Blog Posts Heading"
            width={500}
            height={50}
            centerAll={true}
          />
      </div>
      <LatestBlogs />
        
      {/* Join Our Programs */}
      <div className="mb-2 mt-16">
          <SectionHeading
            src="/assets/headings/home/JoinOurPrograms.png"
            alt="Join Our Programs Heading"
            width={300}
            height={50}
            centerAll={true}
          />
      </div>
      <JoinOurPrograms />

       {/* Message From Director */}
      <div className="mb-10 mt-16">
          <SectionHeading
            src="/assets/headings/home/MessageFromDirector.png"
            alt="Message From Director Heading"
            width={400}
            height={50}
            centerAll={true}
          />
      </div>
      <MessageFromDirector />

      {/* Newsletter */}
      <NewsletterForm />
    </main>
)
}