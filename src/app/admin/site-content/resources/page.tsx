"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import type { WorkshopContent, WorkshopEvent } from "@/types/workshops";
import { extractAssetUrlsFromWorkshops } from "@/lib/extractAssetUrls";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";


export default function AdminWorkshopsPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");
  
  // Upload progress states for content images

  const [eventImageUploadProgress, setEventImageUploadProgress] = useState<Record<number, number | null>>({});

  const [originalContent, setOriginalContent] = useState<WorkshopContent | null>(null);
  const [uploading, setUploading] = useState(false);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);

  const [content, setContent] = useState<WorkshopContent>({
    whatAreWorkshops: {
      text: "",
    },
    events: [
      {
        id: 1,
        title: "Finding Your Voice",
        date: new Date("2026-03-15"),
        description: "A beginner-friendly workshop focused on helping writers discover their unique tone and style through short prompts and group feedback.",
        fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
        image: {
          src: "",
          alt: "Tech Conference 2024"
        },
        location: "San Francisco, CA",
        category: "Workshop",
        additionalInfo: [
          "Multiple tracks: AI, Web3, Cloud Computing",
          "Free swag and conference materials",
          "Networking cocktail hour each evening",
          "Career fair with top tech companies",
          "Workshops require separate registration"
        ],
        registrationLink: "/apply"
      },
      {
        id: 2,
        title: "From Idea to First Draft",
        date: new Date("2026-04-05"),
        description: "This workshop guides writers through turning vague ideas into complete first drafts. Perfect if you have many ideas but a suspicious lack of finished stories.",
        fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
        image: {
          src: "",
          alt: "Tech Conference 2024"
        },
        location: "San Francisco, CA",
        category: "Workshop",
        additionalInfo: [
          "Multiple tracks: AI, Web3, Cloud Computing",
          "Free swag and conference materials",
          "Networking cocktail hour each evening",
          "Career fair with top tech companies",
          "Workshops require separate registration"
        ],
        registrationLink: "/apply"
      },
      {
        id: 3,
        title: "Editing Without Fear",
        date: new Date("2026-05-07"),
        description: "A practical workshop on revising your work without getting stuck in perfectionism. You'll learn how to edit with purpose instead of deleting everything in frustration.",
        fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
        image: {
          src: "",
          alt: "Tech Conference 2024"
        },
        location: "San Francisco, CA",
        category: "Workshop",
        additionalInfo: [
          "Multiple tracks: AI, Web3, Cloud Computing",
          "Free swag and conference materials",
          "Networking cocktail hour each evening",
          "Career fair with top tech companies",
          "Workshops require separate registration"
        ],
        registrationLink: "/apply"
      },
      {
        id: 4,
        title: "Writing Strong Characters",
        date: new Date("2026-05-10"),
        description: "Learn how to create believable characters with clear motivations, flaws, and growth. By the end, your characters will feel less like cardboard cutouts and more like real people.",
        fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
        image: {
          src: "",
          alt: "Tech Conference 2024"
        },
        location: "San Francisco, CA",
        category: "Workshop",
        additionalInfo: [
          "Multiple tracks: AI, Web3, Cloud Computing",
          "Free swag and conference materials",
          "Networking cocktail hour each evening",
          "Career fair with top tech companies",
          "Workshops require separate registration"
        ],
        registrationLink: "/apply"
      },
    ],
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
        const ref = doc(db, "siteContent", "workshops");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

            const eventsWithDates = (data.events || []).map((event: any) => ({
            ...event,
            date: event.date ? (event.date.toDate ? event.date.toDate() : new Date(event.date)) : null,
        }));
          const loaded: WorkshopContent = {
            whatAreWorkshops: data.whatAreWorkshops || {
              text: "",
            },
            events: eventsWithDates || [
              {
                id: 1,
                title: "Finding Your Voice",
                date: new Date("2026-03-15"),
                description: "A beginner-friendly workshop focused on helping writers discover their unique tone and style through short prompts and group feedback.",
                fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
                image: {
                  src: "",
                  alt: "Tech Conference 2024"
                },
                location: "San Francisco, CA",
                category: "Workshop",
                additionalInfo: [
                  "Multiple tracks: AI, Web3, Cloud Computing",
                  "Free swag and conference materials",
                  "Networking cocktail hour each evening",
                  "Career fair with top tech companies",
                  "Workshops require separate registration"
                ],
                registrationLink: "/apply"
              },
              {
                id: 2,
                title: "From Idea to First Draft",
                date: new Date("2026-04-05"),
                description: "This workshop guides writers through turning vague ideas into complete first drafts. Perfect if you have many ideas but a suspicious lack of finished stories.",
                fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
                image: {
                  src: "",
                  alt: "Tech Conference 2024"
                },
                location: "San Francisco, CA",
                category: "Workshop",
                additionalInfo: [
                  "Multiple tracks: AI, Web3, Cloud Computing",
                  "Free swag and conference materials",
                  "Networking cocktail hour each evening",
                  "Career fair with top tech companies",
                  "Workshops require separate registration"
                ],
                registrationLink: "/apply"
              },
              {
                id: 3,
                title: "Editing Without Fear",
                date: new Date("2026-05-07"),
                description: "A practical workshop on revising your work without getting stuck in perfectionism. You'll learn how to edit with purpose instead of deleting everything in frustration.",
                fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
                image: {
                  src: "",
                  alt: "Tech Conference 2024"
                },
                location: "San Francisco, CA",
                category: "Workshop",
                additionalInfo: [
                  "Multiple tracks: AI, Web3, Cloud Computing",
                  "Free swag and conference materials",
                  "Networking cocktail hour each evening",
                  "Career fair with top tech companies",
                  "Workshops require separate registration"
                ],
                registrationLink: "/apply"
              },
              {
                id: 4,
                title: "Writing Strong Characters",
                date: new Date("2026-05-10"),
                description: "Learn how to create believable characters with clear motivations, flaws, and growth. By the end, your characters will feel less like cardboard cutouts and more like real people.",
                fullDescription: "Join us for our flagship technology conference featuring industry leaders, hands-on workshops, and networking opportunities. This year's theme focuses on AI innovation and sustainable tech solutions. We'll have keynote speakers from top tech companies, interactive sessions, and plenty of opportunities to network with like-minded professionals in the industry.",
                image: {
                  src: "",
                  alt: "Tech Conference 2024"
                },
                location: "San Francisco, CA",
                category: "Workshop",
                additionalInfo: [
                  "Multiple tracks: AI, Web3, Cloud Computing",
                  "Free swag and conference materials",
                  "Networking cocktail hour each evening",
                  "Career fair with top tech companies",
                  "Workshops require separate registration"
                ],
                registrationLink: "/apply"
              },
            ],
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

  function validateWorkshopsContent(content: WorkshopContent): string | null {
    // Validate "What are Workshops" section
    if (!isNonEmptyString(content.whatAreWorkshops.text)) {
      return "Description text in 'What are Workshops' section must be filled.";
    }

    // Validate each event
    for (let i = 0; i < content.events.length; i++) {
      const event = content.events[i];
      
      if (!isNonEmptyString(event.title)) {
        return `Event #${i + 1}: Title must be filled.`;
      }
      
      if (!isNonEmptyString(event.description)) {
        return `Event #${i + 1}: Description must be filled.`;
      }
      
      if (!isNonEmptyString(event.fullDescription)) {
        return `Event #${i + 1}: Full description must be filled.`;
      }
      
      if (!isNonEmptyString(event.location)) {
        return `Event #${i + 1}: Location must be filled.`;
      }
      
      if (!isNonEmptyString(event.category)) {
        return `Event #${i + 1}: Category must be filled.`;
      }
      
      if (!isNonEmptyString(event.registrationLink)) {
        return `Event #${i + 1}: Registration link must be filled.`;
      }
      
      if (!isNonEmptyString(event.image.src)) {
        return `Event #${i + 1}: Image must be uploaded.`;
      }
      
      if (!isNonEmptyString(event.image.alt)) {
        return `Event #${i + 1}: Image alt text must be filled.`;
      }
      
      if (!isNonEmptyArray(event.additionalInfo)) {
        return `Event #${i + 1}: Additional info must have at least one item.`;
      }
      
      // Validate each additional info point
      for (let j = 0; j < event.additionalInfo.length; j++) {
        if (!isNonEmptyString(event.additionalInfo[j])) {
          return `Event #${i + 1}: Additional info point #${j + 1} cannot be empty.`;
        }
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
    const validationError = validateWorkshopsContent(content);
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

      const ref = doc(db, "siteContent", "workshops");

      // Replace temp URLs with permanent ones
      let finalContent = content;

      if (pendingAssets.length) {
        // ✅ 1. Figure out what assets are actually used
        const usedAssets = extractAssetUrlsFromWorkshops(content);

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
            events: content.events.map(event => ({
              ...event,
              image: {
                ...event.image,
                src: replacements[event.image.src] ?? event.image.src,
              },
            })),
          };

          setContent(finalContent);
        }

        // 🧹 Clear all pending assets (used or not)
        setPendingAssets([]);
      }

      await setDoc(
        ref,
        {
          whatAreWorkshops: {
            text: finalContent.whatAreWorkshops.text.trim(),
          },
          events: finalContent.events.map(event => ({
            id: event.id,
            title: event.title.trim(),
            date: event.date,
            description: event.description.trim(),
            fullDescription: event.fullDescription.trim(),
            image: {
              src: event.image.src.trim(),
              alt: event.image.alt.trim(),
            },
            location: event.location.trim(),
            category: event.category.trim(),
            additionalInfo: event.additionalInfo.map(info => info.trim()),
            registrationLink: event.registrationLink.trim(),
          })),
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromWorkshops(originalContent));
        const after = new Set(extractAssetUrlsFromWorkshops(finalContent));

        const unusedAssets = [...before].filter((url) => !after.has(url));

        await Promise.all(
          unusedAssets.map((url) =>
            fetch("/api/delete-asset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url }),
            })
          )
        );
      }

      setSuccessMessage("Workshops page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Handle event changes
  const handleEventChange = (index: number, field: keyof WorkshopEvent, value: any) => {
    setContent((prev) => {
      const updatedEvents = [...prev.events];
      updatedEvents[index] = {
        ...updatedEvents[index],
        [field]: value,
      };
      return {
        ...prev,
        events: updatedEvents,
      };
    });
  };

  // Handle additional info changes
  const handleAdditionalInfoChange = (eventIndex: number, infoIndex: number, value: string) => {
    setContent((prev) => {
      const updatedEvents = [...prev.events];
      const updatedAdditionalInfo = [...updatedEvents[eventIndex].additionalInfo];
      updatedAdditionalInfo[infoIndex] = value;
      
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        additionalInfo: updatedAdditionalInfo,
      };
      
      return {
        ...prev,
        events: updatedEvents,
      };
    });
  };

  // Add new event
  const addEvent = () => {
    setContent((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id: prev.events.length + 1,
          title: "",
          date: new Date(),
          description: "",
          fullDescription: "",
          image: {
            src: "",
            alt: "",
          },
          location: "",
          category: "Workshop",
          additionalInfo: [""],
          registrationLink: "",
        },
      ],
    }));
  };

  // Remove event
  const removeEvent = (index: number) => {
    setContent((prev) => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  // Add additional info point
  const addAdditionalInfo = (eventIndex: number) => {
    setContent((prev) => {
      const updatedEvents = [...prev.events];
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        additionalInfo: [...updatedEvents[eventIndex].additionalInfo, ""],
      };
      return {
        ...prev,
        events: updatedEvents,
      };
    });
  };

  // Remove additional info point
  const removeAdditionalInfo = (eventIndex: number, infoIndex: number) => {
    setContent((prev) => {
      const updatedEvents = [...prev.events];
      updatedEvents[eventIndex] = {
        ...updatedEvents[eventIndex],
        additionalInfo: updatedEvents[eventIndex].additionalInfo.filter((_, i) => i !== infoIndex),
      };
      return {
        ...prev,
        events: updatedEvents,
      };
    });
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading site content workshops...
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

  // Render upload input for images
  const renderImageUpload = (
    label: string,
    currentSrc: string,
    onUpload: (file: File) => Promise<void>,
    uploadProgress: number | null,
    previewAlt?: string
  ) => (
    <div>
      <label className="block text-sm font-medium text-[#4A3820] mb-2">
        {label}
      </label>
      <input
        type="file"
        accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
        className="hidden"
        id={`upload-${label.replace(/\s+/g, "-")}`}
        onChange={async (e) => {
          if (!e.target.files?.[0]) return;
          await onUpload(e.target.files[0]);
        }}
      />
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
          await onUpload(file);
        }}
      >
        <label
          htmlFor={`upload-${label.replace(/\s+/g, "-")}`}
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
      {uploadProgress !== null && (
        <div className="mt-2">
          <div className="h-2 w-full bg-gray-200 rounded">
            <div
              className="h-2 bg-[#805C2C] rounded transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-[#4A3820]">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}
      {currentSrc && (
        <div className="mt-4">
          <p className="text-sm mb-2 text-[#4A3820]">Preview</p>
          <img
            src={currentSrc}
            alt={previewAlt || "Preview"}
            className="max-h-48 rounded-lg border"
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          Workshops Page Management
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
            Edit Workshops Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">
              {/* What are Workshops Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
                  What are Workshops Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Description Text
                    </label>
                    <textarea
                      value={content.whatAreWorkshops.text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          whatAreWorkshops: {
                            ...prev.whatAreWorkshops,
                            text: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-50"
                      placeholder="Enter description text about workshops..."
                    />
                  </div>
                </div>
              </div>

              {/* Events Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Upcoming Workshops
                  </h3>
                  <button
                    onClick={addEvent}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Workshop
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {content.events.map((event, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Workshop #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeEvent(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={event.title}
                            onChange={(e) => handleEventChange(index, "title", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Workshop title"
                          />
                        </div>


                    <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        value={event.date && !isNaN(event.date.getTime()) ? event.date.toISOString().split('T')[0] : ""}
                        onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                            handleEventChange(index, "date", new Date(value));
                        } else {
                            // Handle empty date - could set to null or keep as invalid Date
                            // Choose one of these options:
                            
                            // Option 1: Set to null (requires updating the type)
                            // handleEventChange(index, "date", null);
                            
                            // Option 2: Set to a default valid date
                            handleEventChange(index, "date", new Date());
                            
                            // Option 3: Set to an invalid date but handle it differently
                            // handleEventChange(index, "date", new Date(""));
                        }
                        }}
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                    />
                    </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Short Description
                          </label>
                          <textarea
                            value={event.description}
                            onChange={(e) => handleEventChange(index, "description", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-20"
                            placeholder="Brief description of the workshop"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Full Description
                          </label>
                          <textarea
                            value={event.fullDescription}
                            onChange={(e) => handleEventChange(index, "fullDescription", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-40"
                            placeholder="Detailed description of the workshop"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            value={event.location}
                            onChange={(e) => handleEventChange(index, "location", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Workshop location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Category
                          </label>
                          <input
                            type="text"
                            value={event.category}
                            onChange={(e) => handleEventChange(index, "category", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Workshop category"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Registration Link
                          </label>
                          <input
                            type="url"
                            value={event.registrationLink}
                            onChange={(e) => handleEventChange(index, "registrationLink", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="https://example.com/register"
                          />
                        </div>

                        {/* Event Image Upload */}
                        {renderImageUpload(
                          `Workshop ${index + 1} Image`,
                          event.image.src,
                          async (file) => {
                            setUploading(true);
                            try {
                              setEventImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                              const url = await uploadAsset(
                                file,
                                "workshops/events",
                                (p) => setEventImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                              );
                              handleEventChange(index, "image", {
                                ...event.image,
                                src: url,
                              });
                            } catch (err) {
                              console.error("Upload error:", err);
                            } finally {
                              setEventImageUploadProgress((prev) => ({ ...prev, [index]: null }));
                              setUploading(false);
                            }
                          },
                          eventImageUploadProgress[index] || null,
                          event.image.alt
                        )}

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Image Alt Text
                          </label>
                          <input
                            type="text"
                            value={event.image.alt}
                            onChange={(e) => handleEventChange(index, "image", {
                              ...event.image,
                              alt: e.target.value,
                            })}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="Describe the workshop image"
                          />
                        </div>

                        {/* Additional Info */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-[#4A3820]">
                              Additional Information
                            </label>
                            <button
                              type="button"
                              onClick={() => addAdditionalInfo(index)}
                              className="px-3 py-1 text-sm rounded-lg border border-[#805C2C] text-[#805C2C] hover:bg-[#F0E8DB] transition-colors font-sans!"
                            >
                              + Add Point
                            </button>
                          </div>
                          {event.additionalInfo.map((info, infoIndex) => (
                            <div key={infoIndex} className="flex items-start gap-2 mb-2">
                              <span className="mt-2 text-[#4A3820]">•</span>
                              <div className="flex-1 flex items-center gap-2">
                                <textarea
                                  value={info}
                                  onChange={(e) => handleAdditionalInfoChange(index, infoIndex, e.target.value)}
                                  className="flex-1 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-15"
                                  placeholder={`Information point ${infoIndex + 1}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeAdditionalInfo(index, infoIndex)}
                                  className="px-2 py-1 text-sm rounded-lg border border-red-500 text-red-500 hover:bg-red-50 transition-colors font-sans!"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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