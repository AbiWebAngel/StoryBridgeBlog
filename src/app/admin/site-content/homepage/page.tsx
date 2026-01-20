"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import type { HomeContent, ProgramLink, DirectorContent } from "@/types/home";
import { extractAssetUrlsFromHome } from "@/lib/extractAssetUrls";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";



export default function AdminHomePage() {
  const { user } = useAuth();
  
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [directorUploadProgress, setDirectorUploadProgress] =
  useState<number | null>(null);

const [svgUploadProgress, setSvgUploadProgress] =
  useState<Record<number, number | null>>({});

  const [originalContent, setOriginalContent] = useState<HomeContent | null>(null);
  const [uploading, setUploading] = useState(false);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);


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
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "home");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: HomeContent = {
          director: data.director || {
            imageSrc: "",
            imageAlt: "",
            message: "",
            name: "",
            buttonText: "",
            buttonLink: ""
          },
          programLinks: data.programLinks || []
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

async function uploadAsset(
  file: File,
  folder: string,
  onProgress?: (p: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();

    form.append("file", file);
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


function validateHomeContent(content: HomeContent): string | null {
  const d = content.director;

  if (
    !isNonEmptyString(d.imageSrc) ||
    !isNonEmptyString(d.imageAlt) ||
    !isNonEmptyString(d.message) ||
    !isNonEmptyString(d.name) ||
    !isNonEmptyString(d.buttonText) ||
    !isNonEmptyString(d.buttonLink)
  ) {
    return "All Director fields must be filled.";
  }

  if (!isNonEmptyArray(content.programLinks)) {
    return "Please add at least one program link.";
  }

  for (let i = 0; i < content.programLinks.length; i++) {
    const p = content.programLinks[i];

    if (
      !isNonEmptyString(p.programName) ||
      !isNonEmptyString(p.link) ||
      !isNonEmptyString(p.svgPath)
    ) {
      return `Program link #${i + 1} has empty fields.`;
    }
  }

  return null; // ✅ valid
}


  // Save to Firestore
async function handleSave() {
  if (!user) {
    setErrorMessage("Please log in to save changes.");
    return;
  }

  // 🔎 Validate BEFORE saving
  const validationError = validateHomeContent(content);
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

    const ref = doc(db, "siteContent", "home");


  // Replace temp URLs with permanent ones
 let finalContent = content;

if (pendingAssets.length) {
  // ✅ 1. Figure out what assets are actually used
  const usedAssets = extractAssetUrlsFromHome(content);

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

    finalContent = {
      ...content,
      director: {
        ...content.director,
        imageSrc:
          replacements[content.director.imageSrc] ??
          content.director.imageSrc,
      },
      programLinks: content.programLinks.map(p => ({
        ...p,
        svgPath: replacements[p.svgPath] ?? p.svgPath,
      })),
    };

    setContent(finalContent);
  }

  // 🧹 Clear all pending assets (used or not)
  setPendingAssets([]);
}



   await setDoc(ref, {
  director: {
    imageSrc: finalContent.director.imageSrc.trim(),
    imageAlt: finalContent.director.imageAlt.trim(),
    message: finalContent.director.message.trim(),
    name: finalContent.director.name.trim(),
    buttonText: finalContent.director.buttonText.trim(),
    buttonLink: finalContent.director.buttonLink.trim(),
  },
  programLinks: finalContent.programLinks.map(p => ({
    programName: p.programName.trim(),
    link: p.link.trim(),
    svgPath: p.svgPath.trim(),
  })),
  updatedAt: new Date(),
});


     // 🧹 Delete unused R2 assets
    if (originalContent) {
      const before = new Set(extractAssetUrlsFromHome(originalContent));
      const after = new Set(extractAssetUrlsFromHome(finalContent));


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

    setSuccessMessage("Home page content saved successfully!");
    setOriginalContent(structuredClone(finalContent));

    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (err: any) {
    console.error("Save error:", err);
    setErrorMessage(err.message || "Failed to save changes.");
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


// Full-page loading screen while fetching content
if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>
      <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
        Loading home content...
      </p>
    </div>
  );
}
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
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
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
          <h2 className="text-2xl font-medium text-[#4A3820] mb-6 font-sans!">
            Edit Home Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-6">
              {/* Message From Director Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
                  Message From Director
                </h3>
                
                <div className="space-y-4">
                  {/* Director Image */}
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Director Image URL
                    </label>
                  <input
                    id="director-image-upload"
                    type="file"
                    accept=".png, .jpg, .jpeg, .webp"
                    className="hidden"
                   onChange={async (e) => {
                    if (!e.target.files?.[0]) return;

                    const previousImage = content.director.imageSrc; // 👈 capture old

                    setDirectorUploadProgress(0);
                    setSaving(true);
                    setUploading(true);

                    try {
                      const url = await uploadAsset(
                        e.target.files[0],
                        "home/director",
                        setDirectorUploadProgress
                      );

                      handleDirectorChange("imageSrc", url);

                    } catch (err) {
                      console.error("Upload error:", err);
                      setErrorMessage(
                        err instanceof Error ? err.message : "Image upload failed"
                      );
                    } finally {
                      setDirectorUploadProgress(null);
                      setSaving(false);
                      setUploading(false);
                    }
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
                    setErrorMessage("Only image files are allowed.");
                    return;
                  }

                  const previousImage = content.director.imageSrc;

                  setDirectorUploadProgress(0);
                  setSaving(true);
                  setUploading(true);

                  try {
                    const url = await uploadAsset(
                      file,
                      "home/director",
                      setDirectorUploadProgress
                    );

                    handleDirectorChange("imageSrc", url);

                  } catch (err) {
                    setErrorMessage("Drag-drop upload failed");
                  } finally {
                    setDirectorUploadProgress(null);
                    setSaving(false);
                    setUploading(false);
                  }
                }}
              >
                <label
                  htmlFor="director-image-upload"
                  className="
                    flex items-center justify-center
                    w-full px-4 py-6
                    border-2 border-dashed border-[#805C2C]
                    rounded-lg
                    bg-[#F9F5F0]
                    text-[#4A3820]
                    font-medium
                    cursor-pointer
                    hover:bg-[#F0E8DB]
                    hover:border-[#6B4C24]
                    transition-colors
                  "
                >
                  Click or drag an image here
                </label>
              </div>


                    {directorUploadProgress !== null && (
                        <div className="mt-2">
                          <div className="h-2 w-full bg-gray-200 rounded">
                            <div
                              className="h-2 bg-[#805C2C] rounded transition-all"
                              style={{ width: `${directorUploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs mt-1 text-[#4A3820]">
                            Uploading… {directorUploadProgress}%
                          </p>
                        </div>
                      )}
                      {content.director.imageSrc && (
                        <div className="mt-4">
                          <p className="text-sm mb-2 text-[#4A3820]">Preview</p>
                          <img
                            src={content.director.imageSrc}
                            alt="Director preview"
                            className="max-h-48 rounded-lg border"
                          />
                        </div>
                      )}

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
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-37.5rollable-description"
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
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Join Our Programs Links
                  </h3>
                  <button
                    onClick={addProgramLink}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Program Link
                  </button>
                </div>

                <div className="space-y-6">
                  {content.programLinks.map((programLink, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Program Link #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeProgramLink(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
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
                            id={`svg-upload-${index}`}
                            type="file"
                            accept="image/svg+xml"
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;

                              setUploading(true);
                              try {
                                setSvgUploadProgress(prev => ({ ...prev, [index]: 0 }));

                                const url = await uploadAsset(
                                  e.target.files[0],
                                  "home/program-icons",
                                  (p) =>
                                    setSvgUploadProgress(prev => ({ ...prev, [index]: p }))
                                );

                                handleProgramLinkChange(index, "svgPath", url);
                              } catch {
                                setErrorMessage("SVG upload failed");
                              } finally {
                                setSvgUploadProgress(prev => ({ ...prev, [index]: null }));
                                setUploading(false);
                              }
                            }}
                          />

                       {/* DRAG & DROP FOR SVG */}
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();

                            const file = e.dataTransfer.files?.[0];
                            if (!file) return;

                            if (file.type !== "image/svg+xml") {
                              setErrorMessage("Only SVG files allowed.");
                              return;
                            }

                            setSvgUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                            setUploading(true);

                            try {
                              const url = await uploadAsset(
                                file,
                                "home/program-icons",
                                (p) =>
                                  setSvgUploadProgress((prev) => ({ ...prev, [index]: p }))
                              );

                              handleProgramLinkChange(index, "svgPath", url);
                            } catch {
                              setErrorMessage("SVG drag-drop failed");
                            } finally {
                              setSvgUploadProgress((prev) => ({ ...prev, [index]: null }));
                              setUploading(false);
                            }
                          }}
                        >
                          <label
                            htmlFor={`svg-upload-${index}`}
                            className="
                              flex items-center justify-center
                              w-full px-4 py-4
                              border-2 border-dashed border-[#805C2C]
                              rounded-lg
                              bg-[#F9F5F0]
                              text-[#4A3820]
                              cursor-pointer
                              hover:bg-[#F0E8DB]
                              transition-colors
                            "
                          >
                            Click or drag SVG here
                          </label>
                        </div>


                          {typeof svgUploadProgress[index] === "number" && (
                          <div className="mt-2">
                            <div className="h-2 w-full bg-gray-200 rounded">
                              <div
                                className="h-2 bg-[#805C2C] rounded transition-all"
                                style={{ width: `${svgUploadProgress[index]}%` }}
                              />
                            </div>
                            <p className="text-xs mt-1 text-[#4A3820]">
                              Uploading… {svgUploadProgress[index]}%
                            </p>
                          </div>
                        )}
                          {programLink.svgPath && (
                            <img
                              src={programLink.svgPath}
                              alt="Icon preview"
                              className="h-30 mt-4"
                            />
                          )}


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
       <FloatingSaveBar
        onClick={handleSave}
        saving={saving || uploading}
        label="Save All Changes"
      />



      </div>
    </div>
  );
}