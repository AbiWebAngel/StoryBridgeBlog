"use client";

import { useSearchParams } from "next/navigation";

export default function AboutSuccessMessage() {
  const searchParams = useSearchParams();
  const show = searchParams.get("updated") === "1";

  if (!show) return null;

  return (
    <div className="mx-auto mt-6 mb-8 max-w-3xl rounded-lg border border-green-400 bg-green-50 px-6 py-4 text-green-800 text-center font-medium">
      ✅ About page updated successfully
    </div>
  );
}
