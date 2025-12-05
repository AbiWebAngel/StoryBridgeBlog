"use client";

import Link from "next/link";
import { FiHeart, FiUser } from "react-icons/fi";

export default function DashboardHome() {
  const options = [
    { label: "Favourites", href: "/dashboard/favourites", icon: FiHeart },
    { label: "Profile Settings", href: "/dashboard/profile", icon: FiUser },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">
          Welcome to Your Dashboard
        </h1>

        <div className="space-y-6">
          <div className="bg-white border rounded-lg shadow-md overflow-hidden border-gray-200 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Dashboard Options
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {options.map((option) => {
                const Icon = option.icon;
                return (
                  <Link
                    key={option.href}
                    href={option.href}
                    className="flex flex-col items-center justify-center py-6 px-8 border border-gray-100 rounded-md
                               text-gray-900 hover:bg-gray-50 transition-colors duration-200 text-lg font-medium group text-center"
                    style={{ minWidth: "200px", minHeight: "120px" }}
                  >
                    {/* ✅ For Feather icons: use stroke-current to let text-* classes control the stroke */}
                    <Icon
                      size={28}
                      className="mb-2 stroke-current text-gray-900 transition-colors duration-300 group-hover:text-[#805E2D]"
                    />
                    <span className="leading-tight">{option.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
