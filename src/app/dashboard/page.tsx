"use client";

import Link from "next/link";
import { FiHeart, FiUser, FiLock, FiMail } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "@/components/LoginModal"; // Make sure this path is correct
import { useState } from "react";

export default function DashboardHome() {
  const { 
    user, 
    loginModalOpen, 
    openLoginModal, 
    closeLoginModal, 
    forceForgot 
  } = useAuth();
  
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const firstName = user?.firstName || "Unkown";
  const greetingName = firstName === "there" ? "there" : `${firstName}`;

  const options = [
    { label: "My Favourites", href: "/dashboard/favourites", icon: FiHeart },
    { label: "Profile Settings", href: "/dashboard/profile", icon: FiUser },
    { label: "Change Password", action: "forgot", icon: FiLock },
    { label: "Change Email", href: "/dashboard/email", icon: FiMail },
  ];

  const handleSwitchToRegister = () => {
    closeLoginModal();
    // Small delay to allow close animation to complete
    setTimeout(() => {
      setRegisterModalOpen(true);
    }, 300);
  };

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center font-inter">
            Welcome to Your Dashboard
          </h1>

          <p className="!text-3xl text-[#4A3820] mb-8 text-center">
            Hello there, <span className="font-semibold !text-3xl">{greetingName}</span>
          </p>

          <div className="space-y-6">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center font-inter">
                My Account
              </h2>

              <div className="flex flex-wrap justify-center gap-4">
                {options.map((option) => {
                  const Icon = option.icon;

                  // If the option has an action (like "forgot"), render a div that triggers modal
                  if (option.action === "forgot") {
                    return (
                      <div
                        key={option.label}
                        onClick={() => openLoginModal(true)} // This opens modal with forgot mode
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

                  // Otherwise render a normal link
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
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render LoginModal directly in DashboardHome */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeLoginModal}
        onSwitchToRegister={handleSwitchToRegister}
        forceForgot={forceForgot}
      />
      
      {/* If you have a RegisterModal, add it here too */}
      {/* <RegisterModal 
        isOpen={registerModalOpen} 
        onClose={() => setRegisterModalOpen(false)}
        onSwitchToLogin={() => {
          setRegisterModalOpen(false);
          setTimeout(() => openLoginModal(false), 300);
        }}
      /> */}
    </>
  );
}