"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getBlogPostBySlug } from "@/data/blogData";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#413320]">Post not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-[#CF822A] text-white rounded-lg hover:bg-[#B36F24] transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#413320]">Post not found</h1>
          <p className="text-[#413320] mt-2">The blog post &quot;{slug}&quot; does not exist.</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-[#CF822A] text-white rounded-lg hover:bg-[#B36F24] transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <button 
            onClick={() => router.back()}
            className="mb-6 flex items-center text-[#CF822A] hover:text-[#B36F24] transition font-inter font-bold group relative pb-1"
          >
            <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#B36F24] after:transition-all after:duration-300 group-hover:after:w-full">
              ← Back to articles
            </span>
        </button>

          {/* Article Card */}
          <div className="bg-[#F2ECE3] rounded-[30px] text-[#413320] shadow-xl p-6 sm:p-8">
          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 break-words text-[#413320] text-center mb-4">
            {post.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex items-center gap-4 text-[#413320] font-inter mb-6 justify-center">
            <span className="font-semibold">{post.author}</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>

          {/* Featured Image */}
         <div className="mb-8 flex justify-center">
            <Image
              src={post.image}
              alt={post.title}
              width={600}
              height={300}
              className="w-full md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-2/3 h-auto rounded-[30px] object-cover"
            />
          </div>
          {/* Article Content */}
          <article className="max-w-none font-inter text-[#413320]">
            {post.fullContent}
          </article>
        </div>
      </div>
    </div>
  );
}