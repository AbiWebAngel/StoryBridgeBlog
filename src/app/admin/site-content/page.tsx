"use client";

import Link from "next/link";
import { FiFileText, FiUsers, FiHome, FiAward      } from "react-icons/fi";
import { IconType } from "react-icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";

interface Option {
  label: string;
  href: string;
  icon: IconType;
}

export default function SiteContentDashboard() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
 
  // Redirect non-admins (proxy also catches this, but this prevents UI flash)
 useEffect(() => {
  if (loading) return;         // ⬅ Wait until Firebase resolves
  if (role !== "admin") {
    router.replace("/dashboard");
  }
}, [role, loading, router]);


  // Content management cards
 const contentOptions: Option[] = [
  {
    label: "Edit Homepage",
    href: "/admin/site-content/homepage",
    icon: FiHome,
  },
  {
    label: "Edit About Page",
    href: "/admin/site-content/about",
    icon: FiFileText,
  },
  {
    label: "Edit Team Page",
    href: "/admin/site-content/team",
    icon: FiUsers,
  },
  {
    label: "Edit Mentorship",
    href: "/admin/site-content/mentorship",
    icon: FiAward     , // Clear differentiation from Team
  },
];

  const renderCard = (option: Option) => {
    const Icon = option.icon;

    return (
      <Link
        key={option.label}
        href={option.href}
        className="flex flex-col items-center justify-center py-6 px-8 border border-[#D8CDBE] rounded-md bg-white/40 text-[#4A3820] hover:bg-[#E6DCCB] transition-colors duration-200 text-lg font-medium group text-center"
        style={{ minWidth: "200px", minHeight: "120px" }}
      >
        <Icon
          size={28}
          className="mb-2 stroke-current text-[#4A3820] transition-colors duration-300 group-hover:text-[#6D4F27]"
        />
        <span className="leading-tight">{option.label}</span>
      </Link>
    );
  };

if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F0E8DB]">
      {/* Loading Bar */}
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>

      <p className="mt-4 text-[#4A3820] font-medium text-lg">
        Loading dashboard…
      </p>
    </div>
  );
}

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 !font-sans">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center !font-sans">
          Site Content Management
        </h1>

        <p className="!text-xl text-[#4A3820] font-semibold mb-8 text-center">
          Adjust the text, images, and structure of your public website pages.
        </p>

        {/* Content Management Section */}
        <div className="space-y-6">
          <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
              Manage Pages
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {contentOptions.map(renderCard)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
