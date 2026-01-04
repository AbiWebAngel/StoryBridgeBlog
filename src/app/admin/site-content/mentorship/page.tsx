"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import type { MentorshipContent, Testimonial } from "@/types/mentorship";
import { extractAssetUrlsFromMentorship } from "@/lib/extractAssetUrls";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";

export default function AdminMentorshipPage() {
  const { user: currentAuthUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Upload progress states for content images
  const [menteeImageUploadProgress, setMenteeImageUploadProgress] = useState<number | null>(null);
  const [mentorImageUploadProgress, setMentorImageUploadProgress] = useState<number | null>(null);
  const [howItWorksImageUploadProgress, setHowItWorksImageUploadProgress] = useState<number | null>(null);
  const [testimonialImageUploadProgress, setTestimonialImageUploadProgress] = useState<Record<number, number | null>>({});

  const [originalContent, setOriginalContent] = useState<MentorshipContent | null>(null);
  const [uploading, setUploading] = useState(false);

  const [content, setContent] = useState<MentorshipContent>({
    whatIsMentorship: {
      text: "",
    },
    howItWorks: {
      text: [
        "Select one of the options below. You'll be redirected to a form, answer a few questions and click submit.",
        "Your application is logged in our system so we can begin processing it.",
        "Once we receive your application, we'll find your perfect match from among our mentors.",
        "We'll then contact you with your match and share the next steps on how to connect with your mentor.",
        "And remember, it's completely free to join.",
      ],
      image: {
        src: "",
        alt: "",
        width: 350,
        height: 300,
      },
    },
    signUpNow: {
      menteeSection: {
        title: "",
        description: "",
        buttonText: "",
        image: {
          src: "",
          alt: "",
          width: 350,
          height: 320,
        },
      },
      mentorSection: {
        title: "",
        description: "",
        buttonText: "",
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
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
        { text: "", image: "" },
      ],
    },
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
        const ref = doc(db, "siteContent", "mentorship");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: MentorshipContent = {
            whatIsMentorship: data.whatIsMentorship || {
              text: "",
            },
            howItWorks: data.howItWorks || {
              text: [
                "Select one of the options below. You'll be redirected to a form, answer a few questions and click submit.",
                "Your application is logged in our system so we can begin processing it.",
                "Once we receive your application, we'll find your perfect match from among our mentors.",
                "We'll then contact you with your match and share the next steps on how to connect with your mentor.",
                "And remember, it's completely free to join.",
              ],
              image: {
                src: "",
                alt: "",
                width: 350,
                height: 300,
              },
            },
            signUpNow: data.signUpNow || {
              menteeSection: {
                title: "",
                description: "",
                buttonText: "",
                image: {
                  src: "",
                  alt: "",
                  width: 350,
                  height: 320,
                },
              },
              mentorSection: {
                title: "",
                description: "",
                buttonText: "",
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
                { text: "", image: "" },
                { text: "", image: "" },
                { text: "", image: "" },
                { text: "", image: "" },
                { text: "", image: "" },
                { text: "", image: "" },
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
  }, [currentAuthUser]);

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

      xhr.open("POST", "/api/upload");

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
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

  function validateMentorshipContent(content: MentorshipContent): string | null {
    // Validate "What is Mentorship" section
    if (!isNonEmptyString(content.whatIsMentorship.text)) {
      return "Description text in 'What is Mentorship' section must be filled.";
    }

    // Validate "How it Works" section
    if (
      !isNonEmptyString(content.howItWorks.image.src) ||
      !isNonEmptyString(content.howItWorks.image.alt) ||
      !isNonEmptyArray(content.howItWorks.text)
    ) {
      return "All fields in 'How it Works' section must be filled.";
    }

    // Validate each point in How it Works text
    for (let i = 0; i < content.howItWorks.text.length; i++) {
      if (!isNonEmptyString(content.howItWorks.text[i])) {
        return `Point #${i + 1} in 'How it Works' cannot be empty.`;
      }
    }

    // Validate Mentee section
    const mentee = content.signUpNow.menteeSection;
    if (
      !isNonEmptyString(mentee.title) ||
      !isNonEmptyString(mentee.description) ||
      !isNonEmptyString(mentee.buttonText) ||
      !isNonEmptyString(mentee.image.src) ||
      !isNonEmptyString(mentee.image.alt)
    ) {
      return "All fields in Mentee section must be filled.";
    }

    // Validate Mentor section
    const mentor = content.signUpNow.mentorSection;
    if (
      !isNonEmptyString(mentor.title) ||
      !isNonEmptyString(mentor.description) ||
      !isNonEmptyString(mentor.buttonText) ||
      !isNonEmptyString(mentor.image.src) ||
      !isNonEmptyString(mentor.image.alt)
    ) {
      return "All fields in Mentor section must be filled.";
    }

    // Validate Testimonials
    for (let i = 0; i < content.testimonials.testimonials.length; i++) {
      const testimonial = content.testimonials.testimonials[i];
      if (!isNonEmptyString(testimonial.text) || !isNonEmptyString(testimonial.image)) {
        return `All fields in Testimonial #${i + 1} must be filled.`;
      }
    }

    return null; // ✅ valid
  }

  // Save to Firestore
  async function handleSave() {
    if (!currentAuthUser) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    // 🔎 Validate BEFORE saving
    const validationError = validateMentorshipContent(content);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = await currentAuthUser.getIdTokenResult();

      if (token.claims.role !== "admin" && token.claims.role !== "author") {
        throw new Error("Insufficient permissions. Admin or author role required.");
      }

      const ref = doc(db, "siteContent", "mentorship");

      await setDoc(
        ref,
        {
          whatIsMentorship: {
            text: content.whatIsMentorship.text.trim(),
          },
          howItWorks: {
            text: content.howItWorks.text.map((t) => t.trim()),
            image: {
              src: content.howItWorks.image.src.trim(),
              alt: content.howItWorks.image.alt.trim(),
              width: content.howItWorks.image.width,
              height: content.howItWorks.image.height,
            },
          },
          signUpNow: {
            menteeSection: {
              title: content.signUpNow.menteeSection.title.trim(),
              description: content.signUpNow.menteeSection.description.trim(),
              buttonText: content.signUpNow.menteeSection.buttonText.trim(),
              image: {
                src: content.signUpNow.menteeSection.image.src.trim(),
                alt: content.signUpNow.menteeSection.image.alt.trim(),
                width: content.signUpNow.menteeSection.image.width,
                height: content.signUpNow.menteeSection.image.height,
              },
            },
            mentorSection: {
              title: content.signUpNow.mentorSection.title.trim(),
              description: content.signUpNow.mentorSection.description.trim(),
              buttonText: content.signUpNow.mentorSection.buttonText.trim(),
              image: {
                src: content.signUpNow.mentorSection.image.src.trim(),
                alt: content.signUpNow.mentorSection.image.alt.trim(),
                width: content.signUpNow.mentorSection.image.width,
                height: content.signUpNow.mentorSection.image.height,
              },
            },
          },
          testimonials: {
            testimonials: content.testimonials.testimonials.map((t) => ({
              text: t.text.trim(),
              image: t.image.trim(),
            })),
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromMentorship(originalContent));
        const after = new Set(extractAssetUrlsFromMentorship(content));

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

      setSuccessMessage("Mentorship page content saved successfully!");
      setOriginalContent(structuredClone(content));

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

  // Handle How It Works text changes
  const handleHowItWorksTextChange = (index: number, value: string) => {
    setContent((prev) => {
      const updatedText = [...prev.howItWorks.text];
      updatedText[index] = value;
      return {
        ...prev,
        howItWorks: {
          ...prev.howItWorks,
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
        testimonials: [...prev.testimonials.testimonials, { text: "", image: "" }],
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

  // Guest state when not logged in
  if (!currentAuthUser && !loading) {
    return (
      <div className="px-6 min-h-screen font-sans">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
            Mentorship Page Management
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log in as an administrator or author to manage mentorship page content
                </p>
              </div>
            </div>
          </div>
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
        accept="image/*"
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
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
          Mentorship Page Management
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
            Edit Mentorship Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-8">
              {/* What is Mentorship Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 !font-sans">
                  What is Mentorship Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Description Text
                    </label>
                    <textarea
                      value={content.whatIsMentorship.text}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          whatIsMentorship: {
                            ...prev.whatIsMentorship,
                            text: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[100px]"
                      placeholder="Enter description text..."
                    />
                  </div>
                </div>
              </div>

              {/* How it Works Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 !font-sans">
                  How it Works Section
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Steps (one per line)
                    </label>
                    {content.howItWorks.text.map((step, index) => (
                      <div key={index} className="flex items-start gap-2 mb-2">
                        <span className="mt-2 text-[#4A3820]">{index + 1}.</span>
                        <textarea
                          value={step}
                          onChange={(e) => handleHowItWorksTextChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[60px]"
                          placeholder={`Step ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Side Image */}
                  {renderImageUpload(
                    "Side Image",
                    content.howItWorks.image.src,
                    async (file) => {
                      const previousImage = content.howItWorks.image.src;
                      setHowItWorksImageUploadProgress(0);
                      try {
                        const url = await uploadAsset(
                          file,
                          "mentorship/images",
                          setHowItWorksImageUploadProgress
                        );
                        setContent((prev) => ({
                          ...prev,
                          howItWorks: {
                            ...prev.howItWorks,
                            image: {
                              ...prev.howItWorks.image,
                              src: url,
                            },
                          },
                        }));
                        if (previousImage && previousImage !== url) {
                          await fetch("/api/delete-asset", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url: previousImage }),
                          });
                        }
                      } catch (err) {
                        console.error("Upload error:", err);
                      } finally {
                        setHowItWorksImageUploadProgress(null);
                      }
                    },
                    howItWorksImageUploadProgress,
                    "How it Works image preview"
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#4A3820] mb-2">
                      Side Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={content.howItWorks.image.alt}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          howItWorks: {
                            ...prev.howItWorks,
                            image: {
                              ...prev.howItWorks.image,
                              alt: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                      placeholder="A Mentor guiding a mentee"
                    />
                  </div>
                </div>
              </div>

              {/* Sign Up Now Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <h3 className="text-xl font-bold text-[#4A3820] mb-6 !font-sans">
                  Sign Up Now Section
                </h3>
                

                {/* Mentee Section */}
                <div className="mt-8 p-4 bg-[#F9F5F0] rounded-lg">
                  <h4 className="text-lg font-bold text-[#4A3820] mb-4 !font-sans">
                    Mentee Section
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.menteeSection.title}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              menteeSection: {
                                ...prev.signUpNow.menteeSection,
                                title: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Finding a Mentor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Description
                      </label>
                      <textarea
                        value={content.signUpNow.menteeSection.description}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              menteeSection: {
                                ...prev.signUpNow.menteeSection,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[100px]"
                        placeholder="Enter mentee section description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.menteeSection.buttonText}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              menteeSection: {
                                ...prev.signUpNow.menteeSection,
                                buttonText: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Get Started"
                      />
                    </div>

                    {renderImageUpload(
                      "Mentee Image",
                      content.signUpNow.menteeSection.image.src,
                      async (file) => {
                        const previousImage = content.signUpNow.menteeSection.image.src;
                        setMenteeImageUploadProgress(0);
                        try {
                          const url = await uploadAsset(
                            file,
                            "mentorship/images",
                            setMenteeImageUploadProgress
                          );
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              menteeSection: {
                                ...prev.signUpNow.menteeSection,
                                image: {
                                  ...prev.signUpNow.menteeSection.image,
                                  src: url,
                                },
                              },
                            },
                          }));
                          if (previousImage && previousImage !== url) {
                            await fetch("/api/delete-asset", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: previousImage }),
                            });
                          }
                        } catch (err) {
                          console.error("Upload error:", err);
                        } finally {
                          setMenteeImageUploadProgress(null);
                        }
                      },
                      menteeImageUploadProgress,
                      "Mentee image preview"
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.menteeSection.image.alt}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              menteeSection: {
                                ...prev.signUpNow.menteeSection,
                                image: {
                                  ...prev.signUpNow.menteeSection.image,
                                  alt: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Young writer working with mentor"
                      />
                    </div>
                  </div>
                </div>

                {/* Mentor Section */}
                <div className="mt-8 p-4 bg-[#F9F5F0] rounded-lg">
                  <h4 className="text-lg font-bold text-[#4A3820] mb-4 !font-sans">
                    Mentor Section
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.mentorSection.title}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              mentorSection: {
                                ...prev.signUpNow.mentorSection,
                                title: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Becoming a Mentor"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Description
                      </label>
                      <textarea
                        value={content.signUpNow.mentorSection.description}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              mentorSection: {
                                ...prev.signUpNow.mentorSection,
                                description: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[100px]"
                        placeholder="Enter mentor section description..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.mentorSection.buttonText}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              mentorSection: {
                                ...prev.signUpNow.mentorSection,
                                buttonText: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Get Started"
                      />
                    </div>

                    {renderImageUpload(
                      "Mentor Image",
                      content.signUpNow.mentorSection.image.src,
                      async (file) => {
                        const previousImage = content.signUpNow.mentorSection.image.src;
                        setMentorImageUploadProgress(0);
                        try {
                          const url = await uploadAsset(
                            file,
                            "mentorship/images",
                            setMentorImageUploadProgress
                          );
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              mentorSection: {
                                ...prev.signUpNow.mentorSection,
                                image: {
                                  ...prev.signUpNow.mentorSection.image,
                                  src: url,
                                },
                              },
                            },
                          }));
                          if (previousImage && previousImage !== url) {
                            await fetch("/api/delete-asset", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ url: previousImage }),
                            });
                          }
                        } catch (err) {
                          console.error("Upload error:", err);
                        } finally {
                          setMentorImageUploadProgress(null);
                        }
                      },
                      mentorImageUploadProgress,
                      "Mentor image preview"
                    )}

                    <div>
                      <label className="block text-sm font-medium text-[#4A3820] mb-2">
                        Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={content.signUpNow.mentorSection.image.alt}
                        onChange={(e) =>
                          setContent((prev) => ({
                            ...prev,
                            signUpNow: {
                              ...prev.signUpNow,
                              mentorSection: {
                                ...prev.signUpNow.mentorSection,
                                image: {
                                  ...prev.signUpNow.mentorSection.image,
                                  alt: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                        className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                        placeholder="Experienced writer mentoring someone"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] !font-sans">
                    Testimonials Section
                  </h3>
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors !font-sans"
                  >
                    + Add Testimonial
                  </button>
                </div>

          

                <div className="mt-6 space-y-6">
                  {content.testimonials.testimonials.map((testimonial, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] !font-sans">
                          Testimonial #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeTestimonial(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors !font-sans"
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
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[80px]"
                            placeholder="Enter testimonial text..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Profile Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id={`testimonial-upload-${index}`}
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              setUploading(true);
                              const previousImage = testimonial.image;
                              try {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                                const url = await uploadAsset(
                                  e.target.files[0],
                                  "mentorship/testimonials",
                                  (p) => setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                                );
                                handleTestimonialChange(index, "image", url);
                                if (previousImage && previousImage !== url) {
                                  await fetch("/api/delete-asset", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ url: previousImage }),
                                  });
                                }
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
                              const previousImage = testimonial.image;
                              try {
                                setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: 0 }));
                                const url = await uploadAsset(
                                  file,
                                  "mentorship/testimonials",
                                  (p) => setTestimonialImageUploadProgress((prev) => ({ ...prev, [index]: p }))
                                );
                                handleTestimonialChange(index, "image", url);
                                if (previousImage && previousImage !== url) {
                                  await fetch("/api/delete-asset", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ url: previousImage }),
                                  });
                                }
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
                                alt={`Testimonial ${index + 1} preview`}
                                className="max-h-32 rounded-lg border"
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