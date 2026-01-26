"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ArticleCardClient({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    router.push(href);
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="relative block h-full"
    >
      {children}

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      )}
    </Link>
  );
}
