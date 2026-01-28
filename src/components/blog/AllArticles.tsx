import Image from "next/image";
import Link from "next/link";
import ArticleCardClient from "./ArticleCardClient";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  category?: string;
}

export default function AllArticles({
  articles,
}: {
  articles: Article[];
}) {
  return (
    <ul className="flex flex-wrap -mx-4">
      {articles.map((article, index) => (
        <li
          key={article.id}
          className="px-4 mb-8 w-full sm:w-1/2 lg:w-1/3 transition-transform duration-300 hover:scale-101"
        >
          <article className="group h-full w-full rounded-lg bg-[#F2ECE3] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
            <ArticleCardClient href={`/blog/${article.slug}`}>
              {/* Image */}
              <div className="relative w-full aspect-[3/2]">
                <Image
                  src={article.coverImage || "/assets/images/placeholder.jpg"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="
                    (min-width: 1280px) 25vw,
                    (min-width: 1024px) 33vw,
                    (min-width: 640px) 50vw,
                    100vw
                  "
                  priority={index === 0}
                />
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col gap-3 flex-1 w-full">
                <h3 className="font-cinzel text-lg font-bold text-[#413320] line-clamp-2 group-hover:underline">
                  {article.title}
                </h3>

                <p className="font-inter text-sm text-[#413320] line-clamp-3">
                  {article.excerpt}
                </p>

                <span className="mt-auto block w-full text-right font-inter text-sm font-bold text-[#CF822A] relative inline-block pb-1 cursor-pointer">
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#CF822A] after:transition-all after:duration-300 group-hover:after:w-full">
                    Read more →
                  </span>
                </span>
              </div>
            </ArticleCardClient>
          </article>
        </li>
      ))}
    </ul>
  );
}