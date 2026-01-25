import { getArticleBySlug } from "@/lib/articles/getArticleBySlug";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import Link from "next/link";

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params if Next.js gives a promise
  const resolvedParams = await params;

  console.log("[BLOG PAGE] params:", resolvedParams);
  console.log("[BLOG PAGE] slug:", resolvedParams?.slug);

  if (!resolvedParams?.slug) {
    console.error("[BLOG PAGE] Missing slug param!");
    throw new Error("Slug param missing");
  }

  const slug = resolvedParams.slug;

  console.log("[BLOG PAGE] Fetching article for slug:", slug);
  const post = await getArticleBySlug(slug);
  console.log("[BLOG PAGE] Fetched post:", post);

  if (!post) {
    return <div className="p-10 text-center">Article not found</div>;
  }

  return (
    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back button - matching preview page */}
        <Link 
          href="/blog"
          className="mb-6 flex items-center text-[#CF822A] hover:text-[#B36F24] transition font-inter font-bold group relative pb-1"
        >
          <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#B36F24] after:transition-all after:duration-300 group-hover:after:w-full">
            ← Back to Blog
          </span>
        </Link>

        {/* Article Card - matching preview page design */}
        <div className="bg-[#F2ECE3] rounded-[30px] shadow-xl p-6 sm:p-8">
          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 wrap-break-word text-center mb-4">
            {post.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
            <span className="font-semibold">{post.author || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              {post.date ? new Date(post.date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              }) : new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {post.readTime && (
              <>
                <span className="hidden sm:inline">•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8 flex justify-center">
              <Image
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                width={1200}
                height={600}
                priority
                className="w-full h-62.5 sm:h-87.5 lg:h-112.5 rounded-[20px] object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="article-content">
            <ArticleRenderer content={post.body} />
          </article>
        </div>
      </div>
    </div>
  );
}