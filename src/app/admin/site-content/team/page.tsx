"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
};

type TeamContent = {
  joinTeamText: string;
  matchesCount: number;
  workshopsCount: number;
  teamMembers: TeamMember[];
};

export default function AdminTeamPage() {
  const { user: currentAuthUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [content, setContent] = useState<TeamContent>({
    joinTeamText: "",
    matchesCount: 0,
    workshopsCount: 0,
    teamMembers: [],
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
        const ref = doc(db, "siteContent", "team");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setContent({
            joinTeamText: data.joinTeamText || "",
            matchesCount: data.matchesCount || 0,
            workshopsCount: data.workshopsCount || 0,
            teamMembers: data.teamMembers || [],
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

      const ref = doc(db, "siteContent", "team");
      await setDoc(ref, content, { merge: true });

      setSuccessMessage("Team page content saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // Handle input changes
  const handleContentChange = (field: keyof TeamContent, value: string | number) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Team member functions
  const addTeamMember = () => {
    setContent(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { 
        id: Date.now(), // Use timestamp as temporary ID
        name: "", 
        role: "", 
        description: "", 
        image: "" 
      }]
    }));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    setContent(prev => {
      const updatedMembers = [...prev.teamMembers];
      updatedMembers[index] = {
        ...updatedMembers[index],
        [field]: value
      };
      return { ...prev, teamMembers: updatedMembers };
    });
  };

  const removeTeamMember = (index: number) => {
    setContent(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const moveTeamMemberUp = (index: number) => {
    if (index === 0) return;
    setContent(prev => {
      const updatedMembers = [...prev.teamMembers];
      const temp = updatedMembers[index];
      updatedMembers[index] = updatedMembers[index - 1];
      updatedMembers[index - 1] = temp;
      return { ...prev, teamMembers: updatedMembers };
    });
  };

  const moveTeamMemberDown = (index: number) => {
    if (index === content.teamMembers.length - 1) return;
    setContent(prev => {
      const updatedMembers = [...prev.teamMembers];
      const temp = updatedMembers[index];
      updatedMembers[index] = updatedMembers[index + 1];
      updatedMembers[index + 1] = temp;
      return { ...prev, teamMembers: updatedMembers };
    });
  };

  // Guest state when not logged in
  if (!currentAuthUser && !loading) {
    return (
      <div className="px-6 min-h-screen font-sans">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
            Team Page Management
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log in as an administrator or author to manage team page content
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          Team Page Management
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
            Edit Team Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">
              {/* Join Team Text */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                  Join Team Text
                </label>
                <textarea
                  value={content.joinTeamText}
                  onChange={(e) => handleContentChange("joinTeamText", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[200px] scrollable-description"
                  placeholder="Enter the text for the 'Join The Team' section..."
                />
              </div>

              {/* Tally Counter Stats */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 !font-sans">
                  Tally Counter Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Matches Count
                    </label>
                    <input
                      type="number"
                      value={content.matchesCount}
                      onChange={(e) => handleContentChange("matchesCount", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="Enter matches count"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Workshops Count
                    </label>
                    <input
                      type="number"
                      value={content.workshopsCount}
                      onChange={(e) => handleContentChange("workshopsCount", parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="Enter workshops count"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] !font-sans">
                    Team Members
                  </h3>
                  <button
                    onClick={addTeamMember}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors !font-sans"
                  >
                    + Add Team Member
                  </button>
                </div>

                <div className="space-y-6">
                  {content.teamMembers.map((member, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] !font-sans">
                          Team Member #{index + 1}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => moveTeamMemberUp(index)}
                            disabled={index === 0}
                            className="px-3 py-1 rounded-lg border-2 border-[#805C2C] text-[#805C2C] text-sm hover:bg-[#F0E8DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed !font-sans"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveTeamMemberDown(index)}
                            disabled={index === content.teamMembers.length - 1}
                            className="px-3 py-1 rounded-lg border-2 border-[#805C2C] text-[#805C2C] text-sm hover:bg-[#F0E8DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed !font-sans"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeTeamMember(index)}
                            className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors !font-sans"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="Enter team member name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Role
                            </label>
                            <input
                              type="text"
                              value={member.role}
                              onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="Enter team member role"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Image URL
                            </label>
                            <input
                              type="text"
                              value={member.image}
                              onChange={(e) => updateTeamMember(index, "image", e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Description
                          </label>
                          <textarea
                            value={member.description}
                            onChange={(e) => updateTeamMember(index, "description", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[180px] scrollable-description"
                            placeholder="Enter team member description"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {content.teamMembers.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#D8CDBE] rounded-lg">
                      <p className="text-[#4A3820]/70">No team members yet. Add one above.</p>
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