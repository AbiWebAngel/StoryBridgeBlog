import Image from "next/image";
import { Article } from "@/types/Article";

interface ArticleCardProps {
  article: Article;
  onDelete: () => void;
}

export default function ArticleCard({ article, onDelete }: ArticleCardProps) {
  return (
    <div className="bg-white border border-[#D8CDBE] rounded-lg shadow-md p-5 flex flex-col justify-between hover:shadow-lg transition font-sans">
      
      {/* COVER IMAGE */}
      {article.coverImage && (
        <div className="relative w-full h-48 mb-5 rounded-lg overflow-hidden border border-[#D8CDBE]">
         <Image
          src={article.coverImage}
          alt={article.coverImageAlt || article.title || "Article cover"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-lg"
          style={{
            objectFit: "cover",
            objectPosition: article.coverImagePosition
              ? `${article.coverImagePosition.x}% ${article.coverImagePosition.y}%`
              : "50% 50%",
          }}
        />
        </div>
      )}

      {/* TITLE */}
      <h3 className="text-xl font-bold text-[#4A3820] line-clamp-2 mb-3 font-sans">
        {article.title}
      </h3>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mb-4">
        {article.tags?.slice(0, 4).map((t) => (
          <span
            key={t}
            className="bg-[#F0E8DB] border border-[#D8CDBE] text-[#4A3820] text-sm px-3 py-1.5 rounded-full font-medium font-sans!"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* META DESCRIPTION - NOW EXPLICIT */}
      {article.metaDescription && (
        <p className="text-[#4A3820]/70 text-sm line-clamp-3 mb-4 font-sans">
          {article.metaDescription}
        </p>
      )}

      {/* STATUS + DATE */}
      <div className="flex items-center justify-between text-sm text-[#4A3820]/70 mb-5 pt-4 border-t border-[#D8CDBE] font-sans">
        <span className={`font-semibold ${article.status === 'published' ? 'text-green-700' : 'text-amber-700'}`}>
          {article.status?.charAt(0).toUpperCase() + article.status?.slice(1)}
        </span>
        <span className="font-medium">
          {article.updatedAt?.toDate
            ? new Date(article.updatedAt.toDate()).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
            : article.createdAt?.toDate
            ? new Date(article.createdAt.toDate()).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'No date'}
        </span>
      </div>

  
        {/* CONTROLS */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#D8CDBE] gap-3 font-sans!">
        <div className="flex gap-2">
            <a
            href={`/dashboard/articles/edit/${article.id}`}
            className="px-4 py-2.5 bg-[#4A3820] text-white font-semibold rounded-lg hover:bg-[#6B4B2B] text-base transition-colors font-sans!"
            >
            Edit
            </a>

            <a
            href={`/dashboard/articles/preview/${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[#F0E8DB] border border-[#D8CDBE] text-[#4A3820] font-semibold rounded-lg hover:bg-[#E6DDCF] transition-colors font-sans!"
            >
            Preview
            </a>
        </div>

        <button
            onClick={onDelete}
            className="px-4 py-2.5 bg-white border-2 border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors font-sans!"
        >
            Delete
        </button>
        </div>

    </div>
  );
}