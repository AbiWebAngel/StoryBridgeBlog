"use client";

import React from "react";
import SearchComponent from "./components/home/SearchComponent";
import NewsletterForm from "./components/NewsletterForm";
import SectionHeading from "./components/SectionHeading";
import LatestBlogs from "./components/home/LatestBlogs";

export default function HomePage() {
return (
    <main>
      {/* Search Section */}
      <SearchComponent />

      {/* Latest Blogs Section */}
      <div className="mb-8">
          <SectionHeading
            src="/assets/headings/home/Blog-posts.png"
            alt="Blog Posts Heading"
            width={500}
            height={50}
            center={true}
          />
      </div>
      <LatestBlogs />
        

      {/* Newsletter */}
      <NewsletterForm />
    </main>
)
}