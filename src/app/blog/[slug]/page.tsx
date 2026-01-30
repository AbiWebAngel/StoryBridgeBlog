import { getArticleBySlug } from "@/lib/articles/getArticleBySlug";
import { getArticleById } from "@/lib/articles/getArticleById";
import Image from "next/image";
import ArticleRenderer from "@/components/articles/ArticleRenderer";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import FavouriteHeart from "@/components/blog/FavouriteHeart";
import NewsletterFormAlt from "@/components/NewsletterFormAlt";
import TrackRead from "@/components/blog/TrackRead";


function looksLikeId(value: string) {
  // UUID v4
  const uuidV4 =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4.test(value);
}


export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;

  const isId = looksLikeId(slug);

  const post = isId
    ? await getArticleById(slug)
    : await getArticleBySlug(slug);

  if (!post) {
    return {
      title: "Article not found",
      description: "This article could not be found.",
    };
  }

  return {
    title: post.title,
    description: post.metaDescription || post.title,
    openGraph: {
      title: post.title,
      description: post.metaDescription || post.title,
      images: post.coverImage
        ? [
            {
              url: post.coverImage,
              alt: post.coverImageAlt || post.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.metaDescription || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}


export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const isId = looksLikeId(slug);

  const post = isId
    ? await getArticleById(slug)
    : await getArticleBySlug(slug);

  if (!post) {
    notFound();
  }

  // ✅ canonical redirect
  if (isId && post.slug) {
    redirect(`/blog/${post.slug}`);
  }


  return (
    <>
    <TrackRead articleId={post.id} />

    <div className="min-h-screen bg-[#ECE1CF] py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        
        {/* Back button - matching preview page */}
        <BackButton />


        {/* Article Card - matching preview page design */}
       <div className="relative bg-[#F2ECE3] rounded-[30px] shadow-xl p-6 sm:p-8">
        <div className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center">
          <div className="w-8 h-8">
            <FavouriteHeart
              articleId={post.id}
              title={post.title}
              slug={post.slug}
              coverImage={post.coverImage}
              excerpt={post.metaDescription}
            />
          </div>
        </div>


          {/* Article Header */}
          <h1 className="font-cinzel text-[22px] sm:text-[26px] lg:text-[30px] font-bold min-w-0 wrap-break-word text-center mb-4">
            {post.title}
          </h1>
          
          {/* Article Meta */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 font-inter mb-6 justify-center text-center">
            <span className="font-semibold">{post.authorName || "Author"}</span>
            <span className="hidden sm:inline">•</span>
            <span>
              <span>
             {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : null}
              </span>

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
            <div className="mb-8">
              <div className="relative w-full aspect-[2/1] rounded-[20px] overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt || post.title || "Article cover"}
                  fill
                  priority
                  style={{
                    objectFit: "cover",
                    objectPosition: post.coverImagePosition
                      ? `${post.coverImagePosition.x}% ${post.coverImagePosition.y}%`
                      : "50% 50%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Article Content */}
          <article className="article-content">
            <ArticleRenderer content={post.body} />
          </article>
        </div>
      </div>

        <NewsletterFormAlt />
    </div>
    </>
  );
}