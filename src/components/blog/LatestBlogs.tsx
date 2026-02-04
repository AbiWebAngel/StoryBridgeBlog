// components/home/LatestBlogs.tsx

import Image from "next/image";
import FavouriteHeart from "./FavouriteHeart";
import LoadingLink from "./LoadingLink";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug?: string; // optional now
}

interface LatestBlogsProps {
  articles: Article[];
  onRemoveFavourite?: (id: string) => void;
}

export default function LatestBlogs({
  articles,
  onRemoveFavourite,
}: LatestBlogsProps) {
  if (!articles || articles.length === 0) {
    return (
      <p className="text-center text-gray-600">
        No blog posts yet. Stay tuned 👀
      </p>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 flex flex-col items-center space-y-10">
      {articles.map((item) => {
        if (!item.id || !item.title) return null;

        // ✅ ID-based routing only
        const href = `/blog/${item.id}`;

        return (
          <article
            key={item.id}
            className="block w-full sm:w-[90%] md:w-[95%] lg:max-w-[1096px] mx-auto
            flex flex-col rounded-[30px] bg-[#F2ECE3] text-[#413320]
            overflow-hidden shadow-xl h-full transition-transform duration-300
            hover:scale-101"
          >
            {/* Heading */}
            <div className="flex justify-between items-start gap-4 pt-4 pb-2 px-4 sm:px-6 md:px-8">
              <LoadingLink href={href} className="flex-1 min-w-0">
                <h3 className="font-cinzel text-[22px] font-bold break-words hover:underline">
                  {item.title}
                </h3>
              </LoadingLink>

              <div className="flex-shrink-0 w-8 h-8">
                <FavouriteHeart
                  articleId={item.id}
                  title={item.title}
                  slug={item.slug} // still allowed, but not required
                  coverImage={item.coverImage}
                  excerpt={item.excerpt}
                  onUnfavourite={onRemoveFavourite}
                />
              </div>
            </div>

            {/* Body */}
            <LoadingLink href={href} className="block">
              <div className="flex flex-col lg:flex-row items-center pb-4 px-4 sm:px-6 md:px-8 gap-3 flex-1 cursor-pointer">
                {/* Image */}
                <div className="relative w-full max-w-[280px] h-[160px] sm:h-[180px] lg:h-[160px] overflow-hidden rounded-[30px] flex-shrink-0">
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    width={280}
                    height={160}
                    className="rounded-[30px] object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col justify-between lg:flex-[1_1_70%] space-y-3 h-full px-2 sm:px-4 md:px-6 font-inter">
                  <div className="overflow-hidden max-h-[230px] sm:max-h-[260px] lg:max-h-[300px] relative flex-1">
                    <div className="line-clamp-none">{item.excerpt}</div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#F2ECE3] to-transparent pointer-events-none" />
                  </div>

                  <div className="text-right mt-4">
                    <span className="font-inter text-[#CF822A] font-bold relative group inline-block pb-1 cursor-pointer">
                      <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#CF822A] after:transition-all after:duration-300 group-hover:after:w-full">
                        Click here to read more
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </LoadingLink>
          </article>
        );
      })}
    </div>
  );
}
