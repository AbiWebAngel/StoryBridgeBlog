"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import type { BetareadingContent, Testimonial } from "@/types/betareading";
import { extractAssetUrlsFromBetareading } from "@/lib/extractAssetUrls";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";
import { compressImageClient } from "@/lib/compressImage";

export default function AdminBetareadingPage() {
  const { user, role, authReady } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");
  
  // Upload progress states for content images
  const [betaReaderImageUploadProgress, setBetaReaderImageUploadProgress] = useState<number | null>(null);
  const [becomingBetaReaderImageUploadProgress, setBecomingBetaReaderImageUploadProgress] = useState<number | null>(null);
  const [whatWeOfferImageUploadProgress, setWhatWeOfferImageUploadProgress] = useState<number | null>(null);
  const [testimonialImageUploadProgress, setTestimonialImageUploadProgress] = useState<Record<number, number | null>>({});

  const [originalContent, setOriginalContent] = useState<BetareadingContent | null>(null);
  const [uploading, setUploading] = useState(false);
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);

  const [content, setContent] = useState<BetareadingContent>({
    whatIsBetareading: {
      text: "",
    },
    whatWeOffer: {
      text: [
        "Select one of the options below. You'll be redirected to a form, answer a few questions and click submit.",
        "Your application is logged in our system so we can begin processing it.",
        "Once we receive your application, we'll find your perfect match from among our beta readers.",
        "We'll then contact you with your match and share the next steps on how to connect with your beta reader.",
    
      ],
      image: {
        src: "",
        alt: "",
        width: 350,
        height: 300,
      },
    },
    signUpNow: {
      findingBetaReadersSection: {
        title: "",
        description: "",
        buttonText: "",
        buttonUrl: "",
        image: {
          src: "",
          alt: "",
          width: 350,
          height: 320,
        },
      },
      becomingBetaReaderSection: {
        title: "",
        description: "",
        buttonText: "",
        buttonUrl: "",
        image: {
          src: "",
          alt: "",
          width: 300,
          height: 320,
        },
      },
    },
    testimonials: {
      testimonials: [
        { text: "", image: "", imageAlt: "" },
        { text: "", image: "", imageAlt: "" },
        { text: "", image: "", imageAlt: "" },
        { text: "", image: "", imageAlt: "" },
        { text: "", image: "", imageAlt: "" },
        { text: "", image: "", imageAlt: "" },
      ],
    },
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
        const ref = doc(db, "siteContent", "betareading");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: BetareadingContent = {
            whatIsBetareading: data.whatIsBetareading || {
              text: "",
            },
            whatWeOffer: data.whatWeOffer || {
              text: [
                "Select one of the options below. You'll be redirected to a form, answer a few questions and click submit.",
                "Your application is logged in our system so we can begin processing it.",
                "Once we receive your application, we'll find your perfect match from among our beta readers.",
                "We'll then contact you with your match and share the next steps on how to connect with your beta reader.",
                
              ],
              image: {
                src: "",
                alt: "",
                width: 350,
                height: 300,
              },
            },
            signUpNow: data.signUpNow || {
              findingBetaReadersSection: {
                title: "",
                description: "",
                buttonText: "",
                buttonUrl: "",
                image: {
                  src: "",
                  alt: "",
                  width: 350,
                  height: 320,
                },
              },
              becomingBetaReaderSection: {
                title: "",
                description: "",
                buttonText: "",
                buttonUrl: "",
                image: {
                  src: "",
                  alt: "",
                  width: 300,
                  height: 320,
                },
              },
            },
            testimonials: data.testimonials || {
              testimonials: [
                { text: "", image: "", imageAlt: "" },
                { text: "", image: "", imageAlt: "" },
                { text: "", image: "", imageAlt: "" },
                { text: "", image: "", imageAlt: "" },
                { text: "", image: "", imageAlt: "" },
                { text: "", image: "", imageAlt: "" },
              ],
            },
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

  function validateBetareadingContent(content: BetareadingContent): string | null {
    // Validate "What is Betareading" section
    if (!isNonEmptyString(content.whatIsBetareading.text)) {
      return "Description text in 'What is Betareading' section must be filled.";
    }

    // Validate "What We Offer" section
    if (
      !isNonEmptyString(content.whatWeOffer.image.src) ||
      !isNonEmptyString(content.whatWeOffer.image.alt) ||
      !isNonEmptyArray(content.whatWeOffer.text)
    ) {
      return "All fields in 'What We Offer' section must be filled.";
    }

    // Validate each point in What We Offer text
    for (let i = 0; i < content.whatWeOffer.text.length; i++) {
      if (!isNonEmptyString(content.whatWeOffer.text[i])) {
        return `Point #${i + 1} in 'What We Offer' cannot be empty.`;
      }
    }

    // Validate Finding Beta Readers section
    const findingBetaReaders = content.signUpNow.findingBetaReadersSection;
    if (
      !isNonEmptyString(findingBetaReaders.title) ||
      !isNonEmptyString(findingBetaReaders.description) ||
      !isNonEmptyString(findingBetaReaders.buttonText) ||
      !isNonEmptyString(findingBetaReaders.image.src) ||
      !isNonEmptyString(findingBetaReaders.image.alt)
    ) {
      return "All fields in Finding Beta Readers section must be filled.";
    }

    // Validate Becoming Beta Reader section
    const becomingBetaReader = content.signUpNow.becomingBetaReaderSection;
    if (
      !isNonEmptyString(becomingBetaReader.title) ||
      !isNonEmptyString(becomingBetaReader.description) ||
      !isNonEmptyString(becomingBetaReader.buttonText) ||
      !isNonEmptyString(becomingBetaReader.image.src) ||
      !isNonEmptyString(becomingBetaReader.image.alt)
    ) {
      return "All fields in Becoming Beta Reader section must be filled.";
    }

    // Validate Testimonials
    for (let i = 0; i < content.testimonials.testimonials.length; i++) {
      const testimonial = content.testimonials.testimonials[i];
      if (
        !isNonEmptyString(testimonial.text) ||
        !isNonEmptyString(testimonial.image) ||
        !isNonEmptyString(testimonial.imageAlt)
      ) {
        return `All fields in Testimonial #${i + 1} must be filled.`;
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
    const validationError = validateBetareadingContent(content);
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

      const ref = doc(db, "siteContent", "betareading");

      // Replace temp URLs with permanent ones
      let finalContent = content;

      if (pendingAssets.length) {
        // ✅ 1. Figure out what assets are actually used
        const usedAssets = extractAssetUrlsFromBetareading(content);

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
            whatWeOffer: {
              ...content.whatWeOffer,
              image: {
                ...content.whatWeOffer.image,
                src: replacements[content.whatWeOffer.image.src] ?? content.whatWeOffer.image.src,
              },
            },
            signUpNow: {
              ...content.signUpNow,
              findingBetaReadersSection: {
                ...content.signUpNow.findingBetaReadersSection,
                image: {
                  ...content.signUpNow.findingBetaReadersSection.image,
                  src: replacements[content.signUpNow.findingBetaReadersSection.image.src] ?? content.signUpNow.findingBetaReadersSection.image.src,
                },
              },
              becomingBetaReaderSection: {
                ...content.signUpNow.becomingBetaReaderSection,
                image: {
                  ...content.signUpNow.becomingBetaReaderSection.image,
                  src: replacements[content.signUpNow.becomingBetaReaderSection.image.src] ?? content.signUpNow.becomingBetaReaderSection.image.src,
                },
              },
            },
            testimonials: {
              ...content.testimonials,
              testimonials: content.testimonials.testimonials.map(t => ({
                ...t,
                image: replacements[t.image] ?? t.image,
              })),
            },
          };

          setContent(finalContent);
        }

        // 🧹 Clear all pending assets (used or not)
        setPendingAssets([]);
      }

      await setDoc(
        ref,
        {
          whatIsBetareading: {
            text: finalContent.whatIsBetareading.text.trim(),
          },
          whatWeOffer: {
            text: finalContent.whatWeOffer.text.map((t) => t.trim()),
            image: {
              src: finalContent.whatWeOffer.image.src.trim(),
              alt: finalContent.whatWeOffer.image.alt.trim(),
              width: finalContent.whatWeOffer.image.width,
              height: finalContent.whatWeOffer.image.height,
            },
          },
          signUpNow: {
            findingBetaReadersSection: {
              title: finalContent.signUpNow.findingBetaReadersSection.title.trim(),
              description: finalContent.signUpNow.findingBetaReadersSection.description.trim(),
              buttonText: finalContent.signUpNow.findingBetaReadersSection.buttonText.trim(),
              buttonUrl: finalContent.signUpNow.findingBetaReadersSection.buttonUrl?.trim() || "",
              image: {
                src: finalContent.signUpNow.findingBetaReadersSection.image.src.trim(),
                alt: finalContent.signUpNow.findingBetaReadersSection.image.alt.trim(),
                width: finalContent.signUpNow.findingBetaReadersSection.image.width,
                height: finalContent.signUpNow.findingBetaReadersSection.image.height,
              },
            },
            becomingBetaReaderSection: {
              title: finalContent.signUpNow.becomingBetaReaderSection.title.trim(),
              description: finalContent.signUpNow.becomingBetaReaderSection.description.trim(),
              buttonText: finalContent.signUpNow.becomingBetaReaderSection.buttonText.trim(),
              buttonUrl: finalContent.signUpNow.becomingBetaReaderSection.buttonUrl?.trim() || "",
              image: {
                src: finalContent.signUpNow.becomingBetaReaderSection.image.src.trim(),
                alt: finalContent.signUpNow.becomingBetaReaderSection.image.alt.trim(),
                width: finalContent.signUpNow.becomingBetaReaderSection.image.width,
                height: finalContent.signUpNow.becomingBetaReaderSection.image.height,
              },
            },
          },
          testimonials: {
            testimonials: finalContent.testimonials.testimonials.map((t) => ({
              text: t.text.trim(),
              image: t.image.trim(),
              imageAlt: t.imageAlt.trim(),
            })),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromBetareading(originalContent));
        const after = new Set(extractAssetUrlsFromBetareading(finalContent));

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

      setSuccessMessage("Betareading page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Handle testimonial changes
  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
    setContent((prev) => {
      const updatedTestimonials = [...prev.testimonials.testimonials];
      updatedTestimonials[index] = {
        ...updatedTestimonials[index],
        [field]: value,
      };
      return {
        ...prev,
        testimonials: {
          ...prev.testimonials,
          testimonials: updatedTestimonials,
        },
      };
    });
  };

  // Handle What We Offer text changes
  const handleWhatWeOfferTextChange = (index: number, value: string) => {
    setContent((prev) => {
      const updatedText = [...prev.whatWeOffer.text];
      updatedText[index] = value;
      return {
        ...prev,
        whatWeOffer: {
          ...prev.whatWeOffer,
          text: updatedText,
        },
      };
    });
  };

  // Add new testimonial
  const addTestimonial = () => {
    setContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: [
          ...prev.testimonials.testimonials,
          { text: "", image: "", imageAlt: "" },
        ],
      },
    }));
  };

  // Remove testimonial
  const removeTestimonial = (index: number) => {
    setContent((prev) => ({
      ...prev,
      testimonials: {
        ...prev.testimonials,
        testimonials: prev.testimonials.testimonials.filter((_, i) => i !== index),
      },
    }));
  };

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
          <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
        </div>
        <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
          Loading site content betareading...
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
          Betareading Page Management
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
            Edit Betareading Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">
              {/* What is Betareading Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
                  What is Betareading Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Description Text
                    </label>
                    <textarea
                      value={content.whatIsBetareading.text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          whatIsBetareading: {
                            ...prev.whatIsBetareading,
                            text: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-50"
                      placeholder="Enter description text..."
                    />
                  </div>
                </div>
              </div>

              {/* What We Offer Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
                  What We Offer Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Points (one per line)
                    </label>
                    {content.whatWeOffer.text.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <span className="mt-2 text-[#4A3820]">•</span>
                        <textarea
                          value={point}
                          onChange={(e) => handleWhatWeOfferTextChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-15"
                          placeholder={`Point ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Side Image */}
                  {renderImageUpload(
                    "Side Image",
                    content.whatWeOffer.image.src,
                    async (file) => {
                      const previousImage = content.whatWeOffer.image.src;
                      setWhatWeOfferImageUploadProgress(0);
                      setUploading(true);
                      try {
                        const url = await uploadAsset(
                          file,
                          "betareading/images",
                          setWhatWeOfferImageUploadProgress
                        );
                        setContent((prev) => ({
                          ...prev,
                          whatWeOffer: {
                            ...prev.whatWeOffer,
                            image: {
                              ...prev.whatWeOffer.image,
                              src: url,
                            },
                          },
                        }));
                      } catch (err) {
                        console.error("Upload error:", err);
                      } finally {
                        setWhatWeOfferImageUploadProgress(null);
                        setUploading(false);
                      }
                    },
                    whatWeOfferImageUploadProgress,
                    "What We Offer image preview"
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Side Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={content.whatWeOffer.image.alt}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          whatWeOffer: {
                            ...prev.whatWeOffer,
                            image: {
                              ...prev.whatWeOffer.image,
                              alt: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="Beta reader providing feedback on a manuscript"
                    />
                  </div>
                </div>
              </div>

              {/* Sign Up Now Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 font-sans!">
                  Sign Up Now Section
                </h3>

                {/* Finding Beta Readers Section */}
                <div className="mt-8 p-4 bg-[#F9F5F0] rounded-lg">
                  <h4 className="text-lg font-bold text-[#4A3820] mb-4 font-sans!">
                    Finding Beta Readers Section
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.findingBetaReadersSection.title}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                title: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Find Beta Readers"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Description
                      </label>
                      <textarea
                        value={content.signUpNow.findingBetaReadersSection.description}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-50"
                        placeholder="Enter finding beta readers section description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.findingBetaReadersSection.buttonText}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                buttonText: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Get Started"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={content.signUpNow.findingBetaReadersSection.buttonUrl || ""}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                buttonUrl: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="https://example.com/find-beta-readers"
                      />
                    </div>

                    {renderImageUpload(
                      "Finding Beta Readers Image",
                      content.signUpNow.findingBetaReadersSection.image.src,
                      async (file) => {
                        const previousImage = content.signUpNow.findingBetaReadersSection.image.src;
                        setBetaReaderImageUploadProgress(0);
                        setUploading(true);
                        try {
                          const url = await uploadAsset(
                            file,
                            "betareading/images",
                            setBetaReaderImageUploadProgress
                          );
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                image: {
                                  ...prev.signUpNow.findingBetaReadersSection.image,
                                  src: url,
                                },
                              },
                            },
                          }));
                        } catch (err) {
                          console.error("Upload error:", err);
                        } finally {
                          setBetaReaderImageUploadProgress(null);
                          setUploading(false);
                        }
                      },
                      betaReaderImageUploadProgress,
                      "Finding beta readers image preview"
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.findingBetaReadersSection.image.alt}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              findingBetaReadersSection: {
                                ...prev.signUpNow.findingBetaReadersSection,
                                image: {
                                  ...prev.signUpNow.findingBetaReadersSection.image,
                                  alt: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Writer receiving feedback from beta readers"
                      />
                    </div>
                  </div>
                </div>

                {/* Becoming Beta Reader Section */}
                <div className="mt-8 p-4 bg-[#F9F5F0] rounded-lg">
                  <h4 className="text-lg font-bold text-[#4A3820] mb-4 font-sans!">
                    Becoming Beta Reader Section
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.becomingBetaReaderSection.title}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                title: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Become a Beta Reader"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Description
                      </label>
                      <textarea
                        value={content.signUpNow.becomingBetaReaderSection.description}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-50"
                        placeholder="Enter becoming beta reader section description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.becomingBetaReaderSection.buttonText}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                buttonText: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Get Started"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button URL
                      </label>
                      <input
                        type="url"
                        value={content.signUpNow.becomingBetaReaderSection.buttonUrl || ""}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                buttonUrl: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="https://example.com/become-beta-reader"
                      />
                    </div>

                    {renderImageUpload(
                      "Becoming Beta Reader Image",
                      content.signUpNow.becomingBetaReaderSection.image.src,
                      async (file) => {
                        const previousImage = content.signUpNow.becomingBetaReaderSection.image.src;
                        setBecomingBetaReaderImageUploadProgress(0);
                        setUploading(true);
                        try {
                          const url = await uploadAsset(
                            file,
                            "betareading/images",
                            setBecomingBetaReaderImageUploadProgress
                          );
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                image: {
                                  ...prev.signUpNow.becomingBetaReaderSection.image,
                                  src: url,
                                },
                              },
                            },
                          }));
                        } catch (err) {
                          console.error("Upload error:", err);
                        } finally {
                          setBecomingBetaReaderImageUploadProgress(null);
                          setUploading(false);
                        }
                      },
                      becomingBetaReaderImageUploadProgress,
                      "Becoming beta reader image preview"
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.becomingBetaReaderSection.image.alt}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              becomingBetaReaderSection: {
                                ...prev.signUpNow.becomingBetaReaderSection,
                                image: {
                                  ...prev.signUpNow.becomingBetaReaderSection.image,
                                  alt: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Beta reader providing constructive feedback"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Testimonials Section
                  </h3>
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Testimonial
                  </button>
                </div>

                <div className="mt-6 space-y-6">
                  {content.testimonials.testimonials.map((testimonial, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Testimonial #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeTestimonial(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Testimonial Text
                          </label>
                          <textarea
                            value={testimonial.text}
                            onChange={(e) => handleTestimonialChange(index, "text", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-20"
                            placeholder="Enter testimonial text..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
                            className="hidden"
                            id={`testimonial-upload-${index}`}
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              setUploading(true);
                              try {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                                const url = await uploadAsset(
                                  e.target.files[0],
                                  "betareading/testimonials",
                                  (p) => setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                                );
                                handleTestimonialChange(index, "image", url);
                              } catch (err) {
                                console.error("Upload error:", err);
                              } finally {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: null }));
                                setUploading(false);
                              }
                            }}
                          />
                          <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={async (e) => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              try {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                                const url = await uploadAsset(
                                  file,
                                  "betareading/testimonials",
                                  (p) => setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                                );
                                handleTestimonialChange(index, "image", url);
                              } catch (err) {
                                console.error("Upload error:", err);
                              } finally {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: null }));
                                setUploading(false);
                              }
                            }}
                          >
                            <label
                              htmlFor={`testimonial-upload-${index}`}
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
                              Click or drag a profile image here
                            </label>
                          </div>
                          {typeof testimonialImageUploadProgress[index] === "number" && (
                            <div className="mt-2">
                              <div className="h-2 w-full bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-[#805C2C] rounded transition-all"
                                  style={{ width: `${testimonialImageUploadProgress[index]}%` }}
                                />
                              </div>
                              <p className="text-xs mt-1 text-[#4A3820]">
                                Uploading… {testimonialImageUploadProgress[index]}%
                              </p>
                            </div>
                          )}
                          {testimonial.image && (
                            <div className="mt-4">
                              <p className="text-sm mb-2 text-[#4A3820]">Preview</p>
                              <img
                                src={testimonial.image}
                                alt={testimonial.imageAlt || `Testimonial ${index + 1}`}
                                className="max-h-32 rounded-lg border mb-2"
                              />
                            </div>
                          )}
                          {testimonial.image && (
                            <div>
                              <label className="block text-sm font-medium text-[#4A3820] mb-2">
                                Image Alt Text
                              </label>
                              <input
                                type="text"
                                value={testimonial.imageAlt ?? ""}
                                onChange={(e) =>
                                  handleTestimonialChange(index, "imageAlt", e.target.value)
                                }
                                className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                                placeholder="Describe the person in the image"
                              />
                            </div>
                          )}
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