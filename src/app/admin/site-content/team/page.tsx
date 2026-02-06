"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isPositiveNumber,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromTeam } from "@/lib/extractAssetUrls";
import type { TeamMember, TeamContent } from "@/types/team";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { compressImageClient } from "@/lib/compressImage";

export default function AdminTeamPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [originalContent, setOriginalContent] = useState<TeamContent | null>(null);
  const [teamImageUploadProgress, setTeamImageUploadProgress] = useState<Record<number, number | null>>({});
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);

 const [content, setContent] = useState<TeamContent>({
  joinTeamText: "",
  joinUrl: "", // Add this
  matchesCount: 0,
  workshopsCount: 0,
  teamMembers: [],
});

  // Upload function
  async function uploadAsset(
    file: File,
    folder: string,
    onProgress?: (p: number) => void
  ): Promise<string> {
    const compressedFile = await compressImageClient(file);
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const form = new FormData();

      form.append("file", compressedFile);
      form.append("folder", folder);
      form.append("sessionId", sessionId);
      form.append("draft", "true");

      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        console.log("Upload response status:", xhr.status);
        console.log("Upload response text:", xhr.responseText);

        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
          setPendingAssets(prev => [...prev, res.url]);
          resolve(res.url);
        } else {
          reject(
            new Error(
              `Upload failed (${xhr.status}): ${xhr.responseText || "no body"}`
            )
          );
        }
      };

      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(form);
    });
  }

  // Load Firestore data
  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "team");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
         const loaded: TeamContent = {
          joinTeamText: data.joinTeamText || "",
          joinUrl: data.joinUrl || "", // Add this
          matchesCount: data.matchesCount || 0,
          workshopsCount: data.workshopsCount || 0,
          teamMembers: (data.teamMembers || []).map((m: any) => ({
            ...m,
            image: typeof m.image === "string"
              ? { src: m.image, alt: "" }
              : m.image,
          })),
        };

          setContent(loaded);
          setOriginalContent(structuredClone(loaded));
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setErrorMessage("Failed to load content.");
      } finally {
        setLoading(false);
      }
    }

    loadContent();
  }, [user]);

  function validateContent(content: TeamContent): string | null {
    if (!isNonEmptyString(content.joinTeamText)) {
      return "Join Team text cannot be empty.";
    }

    if (!isPositiveNumber(content.matchesCount)) {
      return "Matches count must be greater than 0.";
    }

    if (!isPositiveNumber(content.workshopsCount)) {
      return "Workshops count must be greater than 0.";
    }

    if (!isNonEmptyArray(content.teamMembers)) {
      return "Please add at least one team member.";
    }

    for (let i = 0; i < content.teamMembers.length; i++) {
      const member = content.teamMembers[i];

      if (
        !isNonEmptyString(member.name) ||
        !isNonEmptyString(member.role) ||
        !isNonEmptyString(member.description) ||
        !isNonEmptyString(member.image?.src) ||
        !isNonEmptyString(member.image?.alt)
      ) {
        return `Team member #${i + 1} has empty fields.`;
      }
    }

    return null;
  }

  // Save to Firestore
  async function handleSave() {
    if (!user) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    const validationError = validateContent(content);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await user.getIdTokenResult();

      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const ref = doc(db, "siteContent", "team");

      // Replace temp URLs with permanent ones
      let finalContent = content;

      if (pendingAssets.length) {
        // ✅ 1. Figure out what assets are actually used
        const usedAssets = extractAssetUrlsFromTeam(content);

        // ✅ 2. Only promote assets that are still referenced
        const assetsToPromote = pendingAssets.filter(url =>
          usedAssets.includes(url)
        );

        if (assetsToPromote.length) {
          const res = await fetch("/api/promote-assets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ urls: assetsToPromote }),
          });

          const { replacements } = await res.json();

          // Apply replacements to team member images
          finalContent = {
            ...content,
            teamMembers: content.teamMembers.map(member => ({
              ...member,
              image: {
                src: replacements[member.image.src] ?? member.image.src,
                alt: member.image.alt
              }
            })),
          };

          setContent(finalContent);
        }

        // 🧹 Clear all pending assets (used or not)
        setPendingAssets([]);
      }

      // In the handleSave function, update the setDoc call:
      await setDoc(
        ref,
        {
          ...finalContent,
          joinTeamText: finalContent.joinTeamText.trim(),
          joinUrl: finalContent.joinUrl?.trim() || "", // Add this line
          teamMembers: finalContent.teamMembers.map(m => ({
            ...m,
            name: m.name.trim(),
            role: m.role.trim(),
            description: m.description.trim(),
            image: {
              src: m.image.src.trim(),
              alt: m.image.alt.trim(),
            },
          })),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromTeam(originalContent));
        const after = new Set(extractAssetUrlsFromTeam(finalContent));

        const unusedAssets = [...before].filter(url => !after.has(url));

        await Promise.all(
          unusedAssets.map(url =>
            fetch("/api/delete-asset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            })
          )
        );
      }

      setSuccessMessage("Team page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes.");
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
        id: Date.now(),
        name: "", 
        role: "", 
        description: "", 
        image: { src: "", alt: "" } 
      }]
    }));
  };

  const updateTeamMember = (
    index: number,
   field: keyof TeamMember | "image.src" | "image.alt",
    value: any
  ) => {
    setContent(prev => {
      const updated = [...prev.teamMembers];

      // handle nested image updates
      if (field.startsWith("image.")) {
        const [, key] = field.split(".");
        updated[index] = {
          ...updated[index],
          image: { ...updated[index].image, [key]: value },
        };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }

      return { ...prev, teamMembers: updated };
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

  // Handle team member image upload
  const handleTeamImageUpload = async (index: number, file: File) => {
    setTeamImageUploadProgress(prev => ({ ...prev, [index]: 0 }));
    setUploading(true);

    try {
      const url = await uploadAsset(
        file,
        "team/members",
        (p) => setTeamImageUploadProgress(prev => ({ ...prev, [index]: p }))
      );

      updateTeamMember(index, "image.src", url);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Image upload failed"
      );
    } finally {
      setTeamImageUploadProgress(prev => ({ ...prev, [index]: null }));
      setUploading(false);
    }
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading site content team...
        </p>
      </div>
    );
  }

  // Not admin state
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans!">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#4A3820] mb-4 font-sans!">
            Access Denied
          </h1>
          <p className="text-[#4A3820]/70 font-sans!">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
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
          <h2 className="text-2xl font-medium text-[#4A3820] mb-6 font-sans!">
            Edit Team Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">
              {/* Join Team Text */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                  Join Team Text
                </label>
                <textarea
                  value={content.joinTeamText}
                  onChange={(e) => handleContentChange("joinTeamText", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-50 scrollable-description"
                  placeholder="Enter the text for the 'Join The Team' section..."
                />
              </div>

            {/* Join Team URL */}
            <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
              <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                Join Team URL
              </label>
              <input
                type="url"
                value={content.joinUrl || ""}
                onChange={(e) => handleContentChange("joinUrl", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                placeholder="https://example.com/join-us"
              />
            </div>

              {/* Tally Counter Stats */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
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
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Team Members
                  </h3>
                  <button
                    onClick={addTeamMember}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Team Member
                  </button>
                </div>

                <div className="space-y-6">
                  {content.teamMembers.map((member, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Team Member #{index + 1}
                        </h4>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => moveTeamMemberUp(index)}
                            disabled={index === 0}
                            className="px-3 py-1 rounded-lg border-2 border-[#805C2C] text-[#805C2C] text-sm hover:bg-[#F0E8DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-sans!"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveTeamMemberDown(index)}
                            disabled={index === content.teamMembers.length - 1}
                            className="px-3 py-1 rounded-lg border-2 border-[#805C2C] text-[#805C2C] text-sm hover:bg-[#F0E8DB] transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-sans!"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeTeamMember(index)}
                            className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
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
                          
                          {/* Image Upload Section */}
                          <div>
                            <label className="block text-sm font-medium text-[#4A3820] mb-2">
                              Image
                            </label>
                            
                            <input
                              id={`team-image-upload-${index}`}
                              type="file"
                              accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
                              className="hidden"
                              onChange={async (e) => {
                                if (!e.target.files?.[0]) return;
                                await handleTeamImageUpload(index, e.target.files[0]);
                              }}
                            />
                          

                         {/* DRAG & DROP WRAPPER */}
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add("ring-2", "ring-[#805C2C]");
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("ring-2", "ring-[#805C2C]");
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove("ring-2", "ring-[#805C2C]");

                              const file = e.dataTransfer.files?.[0];
                              if (!file) return;

                              if (!file.type.startsWith("image/")) {
                                setErrorMessage("Only image files allowed.");
                                return;
                              }

                              await handleTeamImageUpload(index, file);
                            }}
                          >
                            <label
                              htmlFor={`team-image-upload-${index}`}
                              className="
                                flex items-center justify-center
                                w-full px-4 py-6
                                border-2 border-dashed border-[#805C2C]
                                rounded-lg
                                bg-white
                                text-[#4A3820]
                                font-medium
                                cursor-pointer
                                hover:bg-[#F0E8DB]
                                hover:border-[#6B4C24]
                                transition-colors
                              "
                            >
                              Click or drag a team member image here
                            </label>
                          </div>

                            {typeof teamImageUploadProgress[index] === "number" && (
                              <div className="mt-2">
                                <div className="h-2 w-full bg-gray-200 rounded">
                                  <div
                                    className="h-2 bg-[#805C2C] rounded transition-all"
                                    style={{ width: `${teamImageUploadProgress[index]}%` }}
                                  />
                                </div>
                                <p className="text-xs mt-1 text-[#4A3820]">
                                  Uploading… {teamImageUploadProgress[index]}%
                                </p>
                              </div>
                            )}

                            {member.image && (
                              <div className="mt-4">
                                <p className="text-sm mb-2 text-[#4A3820]">Preview</p>
                               <img src={member.image.src} alt={member.image.alt || `${member.name} photo`}
                                  className="max-h-48 rounded-lg border"
                                />
                              </div>
                            )}
                              {member.image?.src && (
                              <div className="mt-4 space-y-2">
                                <p className="text-sm! text-[#4A3820] font-bold">Image Alt Text</p>
                                <input
                                  type="text"
                                  value={member.image.alt}
                                  onChange={(e) => updateTeamMember(index, "image.alt", e.target.value)}
                                  className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820]"
                                  placeholder="Describe the image for accessibility"
                                />
                              </div>
                            )}

                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Description
                          </label>
                          <textarea
                            value={member.description}
                            onChange={(e) => updateTeamMember(index, "description", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-45 scrollable-description"
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
        <FloatingSaveBar
        onClick={handleSave}
        saving={saving || uploading}
        label="Save All Changes"
      />
      
      </div>
    </div>
  );
}