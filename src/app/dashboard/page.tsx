"use client";

import Link from "next/link";
import { IconType } from "react-icons";
import { FiHeart, FiUser, FiLock, FiMail, FiBook, FiUsers, FiSettings, FiFileText } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Option {
  label: string;
  href?: string;
  action?: string;
  icon: IconType;
}

export default function DashboardHome() {
  const { 
    user, 
    authReady,
    loginModalOpen, 
    openLoginModal, 
    closeLoginModal, 
    forceForgot,
    role 
  } = useAuth();
  
  const router = useRouter();
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const firstName = user?.firstName || "Unknown";
  const greetingName = firstName;

  // Options for different roles
  const profileOptions: Option[] = [
    { label: "My Favourites", href: "/dashboard/favourites", icon: FiHeart },
    { label: "My Profile", href: "/dashboard/profile", icon: FiUser },
    { label: "Change Password", action: "forgot", icon: FiLock },
    { label: "Change Email", href: "/dashboard/email", icon: FiMail },
  ];

  const authorOptions: Option[] = [
    { label: "My Articles", href: "/author/articles", icon: FiFileText },
    { label: "Write New Article", href: "/author/articles/new", icon: FiBook },
    { label: "Analytics", href: "/author/analytics", icon: FiUsers },
  ];

  const adminOptions: Option[] = [
    { label: " All Articles", href: "/admin/articles", icon: FiFileText },
    { label: "User Management", href: "/admin/users", icon: FiUsers },
    { label: "Site Content", href: "/admin/site-content", icon: FiFileText },
    { label: "Analytics Dashboard", href: "/admin/analytics", icon: FiUsers },
  ];

  const renderOptionCard = (option: Option) => {
    const Icon = option.icon;
    if (option.action === "forgot") {
      return (
        <div
          key={option.label}
          onClick={() => openLoginModal(true)}
          className="flex flex-col items-center justify-center py-6 px-8 border border-[#D8CDBE] rounded-md bg-white/40 text-[#4A3820] hover:bg-[#E6DCCB] transition-colors duration-200 text-lg font-medium group text-center cursor-pointer"
          style={{ minWidth: "200px", minHeight: "120px" }}
        >
          <Icon size={28} className="mb-2 stroke-current text-[#4A3820] transition-colors duration-300 group-hover:text-[#6D4F27]" />
          <span className="leading-tight">{option.label}</span>
        </div>
      );
    }

    return (
      <Link
        key={option.label}
        href={option.href!}
        className="flex flex-col items-center justify-center py-6 px-8 border border-[#D8CDBE] rounded-md bg-white/40 text-[#4A3820] hover:bg-[#E6DCCB] transition-colors duration-200 text-lg font-medium group text-center"
        style={{ minWidth: "200px", minHeight: "120px" }}
      >
        <Icon size={28} className="mb-2 stroke-current text-[#4A3820] transition-colors duration-300 group-hover:text-[#6D4F27]" />
        <span className="leading-tight">{option.label}</span>
      </Link>
    );
  };

  const handleSwitchToRegister = () => {
    closeLoginModal();
    setTimeout(() => setRegisterModalOpen(true), 300);
  };

  // --- NEW: Loading state like SiteContentDashboard ---
  if (!authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#4A3820] text-xl font-semibold font-sans!">You must be logged in to access this page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 font-sans!">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center font-sans!">
            Welcome to Your Dashboard
          </h1>
          <p className="text-3xl! text-[#4A3820] mb-8 text-center">
            Hello {greetingName}, <span className="font-semibold text-3xl! capitalize">{role || "Guest"}</span>
          </p>

          {/* Role-based sections */}
          <div className="space-y-8">
            {role === "admin" && (
              <div className="space-y-6">
                <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">Admin Tools</h2>
                  <div className="flex flex-wrap justify-center gap-4">{adminOptions.map(renderOptionCard)}</div>
                </div>
              </div>
            )}

            {(role === "author" || role === "admin") && (
              <div className="space-y-6">
                <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">Author Tools</h2>
                  <div className="flex flex-wrap justify-center gap-4">{authorOptions.map(renderOptionCard)}</div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">My Account</h2>
                <div className="flex flex-wrap justify-center gap-4">{profileOptions.map(renderOptionCard)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        forceForgot={forceForgot}
      />
    </>
  );
}
