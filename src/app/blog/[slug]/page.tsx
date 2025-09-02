import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const { slug } = useParams();

  // Type assertion: we tell TypeScript this is a string
  const postSlug = Array.isArray(slug) ? slug[0] : slug!;

  return (
    <div>
      <h1>Blog Post: {postSlug.replace("-", " ")}</h1>
      <p>Content for "{postSlug}" will go here.</p>
    </div>
  );
}
