import Link from "next/link";

export default function BlogPage() {
  // example posts
  const posts = ["first-post", "nextjs-tutorial", "hello-world"];

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((slug) => (
          <li key={slug}>
            <Link href={`/blog/${slug}`}>{slug.replace("-", " ")}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
