"use client";

import Link from "next/link";
import { IconType } from "react-icons";
import { FiHeart, FiUser, FiLock, FiMail, FiBook, FiUsers, FiSettings, FiFileText } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Define types for options
interface Option {
  label: string;
  href?: string;
  action?: string;
  icon: IconType;
}

export default function DashboardHome() {
  const { 
    user, 
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

  // Define options for different user roles
  const profileOptions: Option[] = [
    { label: "My Favourites", href: "/dashboard/favourites", icon: FiHeart },
    { label: "My Profile", href: "/dashboard/profile", icon: FiUser },
    { label: "Change Password", action: "forgot", icon: FiLock },
    { label: "Change Email", href: "/dashboard/email", icon: FiMail },
  ];

  const authorOptions: Option[] = [
    { label: "My Articles", href: "/dashboard/articles", icon: FiFileText },
    { label: "Write New Article", href: "/dashboard/articles/new", icon: FiBook },
    { label: "Analytics", href: "/dashboard/analytics", icon: FiUsers },
  ];

  const adminOptions: Option[] = [
    { label: " All Articles", href: "/admin/articles", icon: FiFileText },
    { label: "User Management", href: "/admin/users", icon: FiUsers },
    { label: "Site Content", href: "/admin/site-content", icon: FiFileText },
    { label: "Analytics Dashboard", href: "/admin/analytics", icon: FiUsers },
   
  ];

  // Combine options based on user role
  const getOptionsForRole = (): Option[] => {
    switch(role) {
      case "admin":
        // Admin gets all options: admin + author + profile
        return [...adminOptions, ...authorOptions, ...profileOptions];
      case "author":
        // Author gets author options + profile options
        return [...authorOptions, ...profileOptions];
      case "reader":
        // Reader only gets profile options
        return profileOptions;
      default:
        return [];
    }
  };

  const handleSwitchToRegister = () => {
    closeLoginModal();
    setTimeout(() => {
      setRegisterModalOpen(true);
    }, 300);
  };

  // useEffect(() => {
  //   // Avoid running while AuthContext is still loading
  //   if (user === null) {
  //     router.replace("/");
  //   }
  // }, [user]);

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
          <Icon
            size={28}
            className="mb-2 stroke-current text-[#4A3820] transition-colors duration-300 group-hover:text-[#6D4F27]"
          />
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
        <Icon
          size={28}
          className="mb-2 stroke-current text-[#4A3820] transition-colors duration-300 group-hover:text-[#6D4F27]"
        />
        <span className="leading-tight">{option.label}</span>
      </Link>
    );
  };

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center font-inter">
            Welcome to Your Dashboard
          </h1>

          <p className="!text-3xl text-[#4A3820] mb-8 text-center">
            Hello {greetingName}, <span className="font-semibold !text-3xl capitalize">{role || "Guest"}</span>
          </p>

          {/* Dashboard Sections based on role */}
          {user && (
            <div className="space-y-8">
              {/* Admin Tools Section - Only for admins */}
              {role === "admin" && (
                <div className="space-y-6">
                  <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                    <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-inter">
                      Admin Tools 
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                      {adminOptions.map(renderOptionCard)}
                    </div>
                  </div>
                </div>
              )}

              {/* Author Tools Section - Only for authors and admins */}
              {(role === "author" || role === "admin") && (
                <div className="space-y-6">
                  <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                    <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-inter">
                      Author Tools 
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                      {authorOptions.map(renderOptionCard)}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile Section - For all logged-in users */}
              <div className="space-y-6">
                <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                  <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-inter">
                    My Account
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    {profileOptions.map(renderOptionCard)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guest State - When user is not logged in */}
          {!user && (
            <div className="space-y-6 mt-8">
              <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-inter">
                  Please Log In
                </h2>
                <div className="text-center">
                  <p className="text-lg text-[#4A3820] mb-6">
                    Log In to access your personalized dashboard
                  </p>
                  <button
                    onClick={() => openLoginModal(false)}
                    className="px-6 py-3 bg-[#6D4F27] text-white font-medium rounded-md hover:bg-[#5A3F20] transition-colors duration-200"
                  >
                    Log In
                  </button>
                </div>
              </div>
            </div>
          )}
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