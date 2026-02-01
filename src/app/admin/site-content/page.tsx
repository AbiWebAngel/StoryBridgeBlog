"use client";

import Link from "next/link";
import { FiFileText, FiUsers, FiHome, FiAward,FiNavigation } from "react-icons/fi";
import { IconType } from "react-icons";
import { useAuth, } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";


interface Option {
  label: string;
  href: string;
  icon: IconType;
}

export default function SiteContentDashboard() {
  const { user,authReady } = useAuth();
  const router = useRouter();
  const [navModalOpen, setNavModalOpen] = useState(false);
  const [donateUrl, setDonateUrl] = useState("");
  const [saving, setSaving] = useState(false);


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
    icon: FiAward,
  },
    {
    label: "Edit Donate Link",
    href: "#",            // no real navigation anymore
    icon: FiNavigation,
  },
];
const loadNavigation = async () => {
  const ref = doc(db, "siteContent", "navigation");
  const snap = await getDoc(ref);

  if (snap.exists()) {
    setDonateUrl(snap.data()?.donateUrl || "");
  }
};

const saveNavigation = async () => {
  try {
    setSaving(true);

    await setDoc(
      doc(db, "siteContent", "navigation"),
      { donateUrl },
      { merge: true }
    );

    setNavModalOpen(false);
  } catch (err) {
    alert("Failed to save navigation");
    console.error(err);
  } finally {
    setSaving(false);
  }
};

  const renderCard = (option: Option) => {
    const Icon = option.icon;

    const handleClick = (e: React.MouseEvent) => {
    if (option.label === "Edit Donate Link") {
      e.preventDefault();
      loadNavigation();
      setNavModalOpen(true);
    }
  };

    return (
      <Link
        key={option.label}
        href={option.href}
        onClick={handleClick}
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

// Show loading until Firebase has finished initializing
if (!authReady) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>

      <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
        Loading site content…
      </p>
    </div>
  );
}

// Only show login message if initialized AND user is null
if (!user) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#4A3820] text-xl font-semibold font-sans!">
        You must be logged in to access this page.
      </p>
    </div>
  );
}



  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 font-sans!">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-2 text-center font-sans!">
          Site Content Management
        </h1>

        <p className="text-xl! text-[#4A3820] font-semibold mb-8 text-center">
          Adjust the text, images, and structure of your public website pages.
        </p>

        {/* Content Management Section */}
        <div className="space-y-6">
          <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
            <h2 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
              Manage Pages
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {contentOptions.map(renderCard)}
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Modal */}
      {navModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-xl p-6 w-[90%] max-w-md">
            
            <h3 className="text-xl font-bold text-[#4A3820] mb-4 font-sans!">
              Edit Donate Link
            </h3>

            <input
              type="text"
              value={donateUrl}
              onChange={(e) => setDonateUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-[#D8CDBE] rounded mb-4"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setNavModalOpen(false)}
                className="px-4 py-2 text-[#4A3820] font-sans!"
              >
                Cancel
              </button>

              <button
                onClick={saveNavigation}
                disabled={saving}
                className="bg-[#4A3820] text-white px-4 py-2 rounded hover:bg-[#6D4F27] font-sans!"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
