"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

type ProgramLink = {
  programName: string;
  link: string;
  svgPath: string;
};

type DirectorContent = {
  imageSrc: string;
  imageAlt: string;
  message: string;
  name: string;
  buttonText: string;
  buttonLink: string;
};

type HomeContent = {
  director: DirectorContent;
  programLinks: ProgramLink[];
};

export default function AdminHomePage() {
  const { user: currentAuthUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [content, setContent] = useState<HomeContent>({
    director: {
      imageSrc: "",
      imageAlt: "",
      message: "",
      name: "",
      buttonText: "",
      buttonLink: ""
    },
    programLinks: [
      { programName: "Program 1", link: "", svgPath: "" },
      { programName: "Program 2", link: "", svgPath: "" },
      { programName: "Program 3", link: "", svgPath: "" }
    ]
  });

  // Load Firestore data
  useEffect(() => {
    async function loadContent() {
      if (!currentAuthUser) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "home");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setContent({
            director: data.director || {
              imageSrc: "",
              imageAlt: "",
              message: "",
              name: "",
              buttonText: "",
              buttonLink: ""
            },
            programLinks: data.programLinks || [
              { programName: "Program 1", link: "", svgPath: "" },
              { programName: "Program 2", link: "", svgPath: "" },
              { programName: "Program 3", link: "", svgPath: "" }
            ]
          });
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setErrorMessage("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [currentAuthUser]);

  // Save to Firestore
  async function handleSave() {
    if (!currentAuthUser) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await currentAuthUser.getIdTokenResult();
      
      // Check if user has admin or author role
      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const ref = doc(db, "siteContent", "home");
      await setDoc(ref, content, { merge: true });

      setSuccessMessage("Home page content saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Handle director input changes
  const handleDirectorChange = (field: keyof DirectorContent, value: string) => {
    setContent(prev => ({
      ...prev,
      director: {
        ...prev.director,
        [field]: value
      }
    }));
  };

  // Handle program link changes
  const handleProgramLinkChange = (index: number, field: keyof ProgramLink, value: string) => {
    setContent(prev => {
      const updatedProgramLinks = [...prev.programLinks];
      updatedProgramLinks[index] = {
        ...updatedProgramLinks[index],
        [field]: value
      };
      return { ...prev, programLinks: updatedProgramLinks };
    });
  };

  // Add new program link
  const addProgramLink = () => {
    setContent(prev => ({
      ...prev,
      programLinks: [...prev.programLinks, { programName: "", link: "", svgPath: "" }]
    }));
  };

  // Remove program link
  const removeProgramLink = (index: number) => {
    setContent(prev => ({
      ...prev,
      programLinks: prev.programLinks.filter((_, i) => i !== index)
    }));
  };

  // Guest state when not logged in
  if (!currentAuthUser && !loading) {
    return (
      <div className="px-6 min-h-screen font-sans">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
            Home Page Management
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log in as an administrator or author to manage home page content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          Home Page Management
        </h1>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Main Content Card */}
        <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-medium text-[#4A3820] mb-6 !font-sans">
            Edit Home Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-6">
              {/* Message From Director Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 !font-sans">
                  Message From Director
                </h3>
                
                <div className="space-y-4">
                  {/* Director Image */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Director Image URL
                    </label>
                    <input
                      type="text"
                      value={content.director.imageSrc}
                      onChange={(e) => handleDirectorChange("imageSrc", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="https://example.com/director-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={content.director.imageAlt}
                      onChange={(e) => handleDirectorChange("imageAlt", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="Director portrait"
                    />
                  </div>

                  {/* Director Message */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Director's Message
                    </label>
                    <textarea
                      value={content.director.message}
                      onChange={(e) => handleDirectorChange("message", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[150px] scrollable-description"
                      placeholder="Enter the director's message..."
                    />
                  </div>

                  {/* Director Name */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Director's Name
                    </label>
                    <input
                      type="text"
                      value={content.director.name}
                      onChange={(e) => handleDirectorChange("name", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="– Abigail"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={content.director.buttonText}
                      onChange={(e) => handleDirectorChange("buttonText", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="Get To Know the Rest Of the Team"
                    />
                  </div>

                  {/* Button Link */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Button Link URL
                    </label>
                    <input
                      type="text"
                      value={content.director.buttonLink}
                      onChange={(e) => handleDirectorChange("buttonLink", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="/team"
                    />
                  </div>
                </div>
              </div>

              {/* Program Links Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] !font-sans">
                    Join Our Programs Links
                  </h3>
                  <button
                    onClick={addProgramLink}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors !font-sans"
                  >
                    + Add Program Link
                  </button>
                </div>

                <div className="space-y-6">
                  {content.programLinks.map((programLink, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] !font-sans">
                          Program Link #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeProgramLink(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors !font-sans"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Program Name
                          </label>
                          <input
                            type="text"
                            value={programLink.programName}
                            onChange={(e) => handleProgramLinkChange(index, "programName", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Program Name"
                          />
                        </div>

                        {/* SVG Path input */}
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            SVG Icon Path
                          </label>
                          <input
                            type="text"
                            value={programLink.svgPath}
                            onChange={(e) => handleProgramLinkChange(index, "svgPath", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="/assets/icons/home/program-icon.svg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Program Link URL
                          </label>
                          <input
                            type="text"
                            value={programLink.link}
                            onChange={(e) => handleProgramLinkChange(index, "link", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="/program-name"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {content.programLinks.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#D8CDBE] rounded-lg">
                      <p className="text-[#4A3820]/70">No program links yet. Add one above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={saving || !currentAuthUser}
            className="px-8 py-3 rounded-lg bg-[#805C2C] text-white font-bold text-lg hover:bg-[#6B4C24] transition-colors disabled:opacity-60 disabled:cursor-not-allowed !font-sans"
          >
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>

      </div>
    </div>
  );
}