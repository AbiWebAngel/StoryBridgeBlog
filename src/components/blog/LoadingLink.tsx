"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoadingLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative">
      <Link
        href={href}
        className={className}
        onClick={() => {
          setLoading(true);
        }}
      >
        {children}
      </Link>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center
        bg-black/30 backdrop-blur-sm rounded-[30px] z-50">
          <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
