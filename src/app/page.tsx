import React, { Suspense } from "react";
import SearchComponent from "../components/SearchComponent";
import NewsletterForm from "../components/NewsletterForm";
import SectionHeading from "../components/SectionHeading";
import JoinOurPrograms from "../components/home/JoinOurPrograms";
import MessageFromDirector from "../components/home/MessageFromDirector";
import { getHomeContent } from "@/lib/getHomeContent";
import { getLatestArticles } from "@/lib/articles/getLatestArticles";
import { getPopularArticles } from "@/lib/articles/getPopularArticles";
import BlogList from "@/components/blog/BlogList";


export default async function HomePage() {
  // Fetch home content from Firestore
  const homeContent = await getHomeContent();
  const latestArticles = await getLatestArticles(5);
  const popularArticles = await getPopularArticles(5);

  return (
    <main>
      {/* Search Section */}
       <Suspense fallback={null}>
        <SearchComponent tags={homeContent?.searchTags} />
      </Suspense>

      {/* Latest Blogs Section */}
      <div className="mb-10">
        <SectionHeading
          title="Check out our latest blog posts"
          src="/assets/headings/home/BlogPosts.png"
          alt="Blog Posts Heading"
          width={500}
          height={50}
          maxWidth="500"
          mobileWidth={200}
          mobileHeight={40}
          centerAll={true}
        />
      </div>
      <BlogList articles={latestArticles} />

     {/* Popular Blogs Section */}
      <div className="mb-10 mt-20">
        <SectionHeading
          title="Most popular blog posts"
          src="/assets/headings/home/MostPopularBlogPosts.png"
          alt="Most Popular Blog Posts Heading"
          width={400}
          height={50}
          maxWidth="400"
          mobileWidth={200}
          mobileHeight={40}
          centerAll={true}
        />
      </div>
      <BlogList articles={popularArticles} />
        
      {/* Only show Join Our Programs section if there are program links */}
      {homeContent?.programLinks && homeContent.programLinks.length > 0 && (
        <>
          <div className="mb-2 mt-20">
            <SectionHeading
              title="Join our programs"
              src="/assets/headings/home/JoinOurPrograms.png"
              alt="Join Our Programs Heading"
              width={300}
              height={50}
              maxWidth="300"
              centerAll={true}
            />
          </div>
          <JoinOurPrograms programLinks={homeContent.programLinks} />
        </>
      )}
      
      {/* Only show Message From Director section if there's director data */}
      {homeContent?.director && (
        <>
          <div className="mb-12 mt-20">
            <SectionHeading
              title="Message from director"
              src="/assets/headings/home/MessageFromDirector.png"
              alt="Message From Director Heading"
              width={400}
              height={50}
              maxWidth="400"
              centerAll={true}
            />
          </div>
          <MessageFromDirector 
            imageSrc={homeContent.director.imageSrc}
            imageAlt={homeContent.director.imageAlt}
            message={homeContent.director.message}
            name={homeContent.director.name}
            buttonText={homeContent.director.buttonText}
            buttonLink={homeContent.director.buttonLink}
          />
        </>
      )}

      {/* Newsletter */}
      <NewsletterForm />
      
      {/* Show empty state message when no home content exists */}
      {!homeContent && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Home Content Coming Soon</h2>
          <p className="text-gray-600">Our home page information is being prepared. Please check back later.</p>
        </div>
      )}
    </main>
  );
}