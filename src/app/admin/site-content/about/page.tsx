"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import {
  isNonEmptyString,
  isNonEmptyArray,
} from "@/lib/contentValidation";
import { extractAssetUrlsFromAbout } from "@/lib/extractAssetUrls";
import type { Testimonial, AboutContent } from "@/types/about";
import FloatingSaveBar from "@/components/admin/FloatingSaveBar";


export default function AdminAboutPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [originalContent, setOriginalContent] = useState<AboutContent | null>(null);
  
  // Upload progress states
  const [bookImageUploadProgress, setBookImageUploadProgress] = useState<Record<number, number | null>>({});
  const [testimonialImageUploadProgress, setTestimonialImageUploadProgress] = useState<Record<number, number | null>>({});

  const [content, setContent] = useState<AboutContent>({
    missionStatement: "",
    whoWeAre: "",
    whatWeDo: "",
    whyItMatters: "",
    testimonials: [],
    bookImages: [],
  });

  // Added: sessionId and pendingAssets like home page
  const sessionId = useRef(crypto.randomUUID()).current;
  const [pendingAssets, setPendingAssets] = useState<string[]>([]);

  // Modified upload function to save to temp
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
      form.append("sessionId", sessionId); // Added
      form.append("draft", "true"); // Added

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
          setPendingAssets(prev => [...prev, res.url]); // Track pending assets
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

  // Load Firestore data (unchanged)
  useEffect(() => {
    async function loadContent() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const ref = doc(db, "siteContent", "about");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const loaded: AboutContent = {
          missionStatement: data.missionStatement || "",
          whoWeAre: data.whoWeAre || "",
          whatWeDo: data.whatWeDo || "",
          whyItMatters: data.whyItMatters || "",

          bookImages: (data.bookImages || []).map((img: any) =>
            typeof img === "string"
              ? { src: img, alt: "" }
              : { src: img.src || "", alt: img.alt || "" }
          ),

          testimonials: (data.testimonials || []).map((t: any) => ({
            text: t.text || "",
            image:
              typeof t.image === "string"
                ? { src: t.image, alt: "" }
                : { src: t.image?.src || "", alt: t.image?.alt || "" },
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

  function validateAboutContent(content: AboutContent): string | null {
    if (
      !isNonEmptyString(content.missionStatement) ||
      !isNonEmptyString(content.whoWeAre) ||
      !isNonEmptyString(content.whatWeDo) ||
      !isNonEmptyString(content.whyItMatters)
    ) {
      return "All About page text sections must be filled.";
    }

    if (!isNonEmptyArray(content.bookImages)) {
      return "Please add at least one book image.";
    }

    for (let i = 0; i < content.bookImages.length; i++) {
      if (!isNonEmptyString(content.bookImages[i].src)) {
      return `Book image #${i + 1} must have an image uploaded.`;
    }

    if (!isNonEmptyString(content.bookImages[i].alt)) {
      return `Book image #${i + 1} must have alt text.`;
    }

    }

    if (!isNonEmptyArray(content.testimonials)) {
      return "Please add at least one testimonial.";
    }

    for (let i = 0; i < content.testimonials.length; i++) {
      const t = content.testimonials[i];

    if (!isNonEmptyString(t.text)) {
      return `Testimonial #${i + 1} text is required.`;
    }

    if (!isNonEmptyString(t.image?.src)) {
      return `Testimonial #${i + 1} image is required.`;
    }

    if (!isNonEmptyString(t.image?.alt)) {
      return `Testimonial #${i + 1} image alt text is required.`;
    }

    }

    return null;
  }

  // Modified handleSave to promote assets from temp to permanent
  async function handleSave() {
    if (!user) {
      setErrorMessage("Please log in to save changes.");
      return;
    }

    const validationError = validateAboutContent(content);
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

      // Modified: Promote assets from temp to permanent like home page
      let finalContent = content;

      if (pendingAssets.length) {
        // Get assets actually used in content
        const usedAssets = extractAssetUrlsFromAbout(content);

        // Only promote assets that are still referenced
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

          // Update content with permanent URLs
          finalContent = {
            ...content,
            bookImages: content.bookImages.map(img => ({
              src: replacements[img.src] ?? img.src,
              alt: img.alt,
            })),
            testimonials: content.testimonials.map(t => ({
              text: t.text,
              image: {
                src: replacements[t.image.src] ?? t.image.src,
                alt: t.image.alt,
              },
            })),
          };

          setContent(finalContent);
        }

        // Clear all pending assets (used or not)
        setPendingAssets([]);
      }

      const ref = doc(db, "siteContent", "about");

      await setDoc(
        ref,
        {
          missionStatement: finalContent.missionStatement.trim(),
          whoWeAre: finalContent.whoWeAre.trim(),
          whatWeDo: finalContent.whatWeDo.trim(),
          whyItMatters: finalContent.whyItMatters.trim(),
         bookImages: finalContent.bookImages.map(img => ({
          src: img.src.trim(),
          alt: img.alt.trim(),
        })),

        testimonials: finalContent.testimonials.map(t => ({
          text: t.text.trim(),
          image: {
            src: t.image.src.trim(),
            alt: t.image.alt.trim(),
          },
        })),

          updatedAt: new Date(),
        },
        { merge: true }
      );

      // 🧹 Delete unused R2 assets (same as home)
      if (originalContent) {
        const before = new Set(extractAssetUrlsFromAbout(originalContent));
        const after = new Set(extractAssetUrlsFromAbout(finalContent));

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

      setSuccessMessage("About page content saved successfully!");
      setOriginalContent(structuredClone(finalContent));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  // Handle input changes for text content
  const handleContentChange = (field: keyof AboutContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Book Images functions with upload
const addBookImage = () => {
  setContent(prev => ({
    ...prev,
    bookImages: [...prev.bookImages, { src: "", alt: "" }],
  }));
};

const addTestimonial = () => {
  setContent(prev => ({
    ...prev,
    testimonials: [
      ...prev.testimonials,
      { text: "", image: { src: "", alt: "" } },
    ],
  }));
};

  const removeBookImage = (index: number) => {
    setContent(prev => ({
      ...prev,
      bookImages: prev.bookImages.filter((_, i) => i !== index)
    }));
  };

  const updateBookImageSrc = (index: number, src: string) => {
  setContent(prev => {
    const images = [...prev.bookImages];
    images[index] = { ...images[index], src };
    return { ...prev, bookImages: images };
  });
};

  // Modified: Removed immediate deletion of old images
  const handleBookImageUpload = async (index: number, file: File) => {
    const previousImage = content.bookImages[index]?.src;
    
    setBookImageUploadProgress(prev => ({ ...prev, [index]: 0 }));
    setUploading(true);

    try {
      const url = await uploadAsset(
        file,
        "about/book-images",
        (p) => setBookImageUploadProgress(prev => ({ ...prev, [index]: p }))
      );

      updateBookImageSrc(index, url);

      // Removed immediate deletion - assets will be cleaned up during save
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Image upload failed"
      );
    } finally {
      setBookImageUploadProgress(prev => ({ ...prev, [index]: null }));
      setUploading(false);
    }
  };


const updateTestimonial = (
  index: number,
  field: keyof Testimonial,
  value: any
) => {

    setContent(prev => {
      const updatedTestimonials = [...prev.testimonials];
      updatedTestimonials[index] = {
        ...updatedTestimonials[index],
        [field]: value
      };
      return { ...prev, testimonials: updatedTestimonials };
    });
  };

  const removeTestimonial = (index: number) => {
    setContent(prev => ({
      ...prev,
      testimonials: prev.testimonials.filter((_, i) => i !== index)
    }));
  };

  // Modified: Removed immediate deletion of old images
  const handleTestimonialImageUpload = async (index: number, file: File) => {
    const previousImage = content.testimonials[index]?.image?.src;
    
    setTestimonialImageUploadProgress(prev => ({ ...prev, [index]: 0 }));
    setUploading(true);

    try {
      const url = await uploadAsset(
        file,
        "about/testimonials",
        (p) => setTestimonialImageUploadProgress(prev => ({ ...prev, [index]: p }))
      );

      setContent(prev => {
      const testimonials = [...prev.testimonials];
      testimonials[index] = {
        ...testimonials[index],
        image: {
          ...testimonials[index].image,
          src: url,
        },
      };
      return { ...prev, testimonials };
    });

      // Removed immediate deletion - assets will be cleaned up during save
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Image upload failed"
      );
    } finally {
      setTestimonialImageUploadProgress(prev => ({ ...prev, [index]: null }));
      setUploading(false);
    }
  };

 if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#4A3820] text-xl font-semibold font-sans!">
          You must be logged in to access this page.
        </p>
      </div>
    );
  }

if (loading) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-48 h-2 bg-[#E0D6C7] rounded-full overflow-hidden">
        <div className="h-full w-full animate-pulse bg-[#4A3820]"></div>
      </div>
      <p className="mt-4 text-[#4A3820] font-medium text-lg font-sans!">
        Loading about content...
      </p>
    </div>
  );
}

  return (
    <div className="px-6 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center font-sans!">
          About Page Management
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
            Edit About Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-6">
              {/* Mission Statement */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                  Mission Statement
                </label>
                <textarea
                  value={content.missionStatement}
                  onChange={(e) => handleContentChange("missionStatement", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-30 scrollable-description"
                  placeholder="Enter your mission statement..."
                />
              </div>

              {/* Who We Are */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                  Who We Are
                </label>
                <textarea
                  value={content.whoWeAre}
                  onChange={(e) => handleContentChange("whoWeAre", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-37.5 scrollable-description"
                  placeholder="Describe who you are..."
                />
              </div>

              {/* What We Do */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                  What We Do
                </label>
                <textarea
                  value={content.whatWeDo}
                  onChange={(e) => handleContentChange("whatWeDo", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-37.5 scrollable-description"
                  placeholder="Explain what you do..."
                />
              </div>

              {/* Why It Matters */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 font-sans!">
                  Why It Matters
                </label>
                <textarea
                  value={content.whyItMatters}
                  onChange={(e) => handleContentChange("whyItMatters", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-37.5 scrollable-description"
                  placeholder="Explain why it matters..."
                />
              </div>

              {/* Book Images Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Book Images (for Slider)
                  </h3>
                  <button
                    onClick={addBookImage}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Book Image
                  </button>
                </div>

                <div className="space-y-6">
                  {content.bookImages.map((image, index) => (
                    <div key={index} className="border-2 border-[#D8CDBE] rounded-lg p-5 bg-[#F9F5F0]">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-[#4A3820] font-sans!">
                          Book Image #{index + 1}
                        </h4>
                        <button
                          onClick={() => removeBookImage(index)}
                          className="px-3 py-1 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors font-sans!"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* File upload input */}
                        <div>
                          <input
                            id={`book-image-upload-${index}`}
                            type="file"
                            accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              await handleBookImageUpload(index, e.target.files[0]);
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

                            await handleBookImageUpload(index, file);
                          }}
                        >
                          <label
                            htmlFor={`book-image-upload-${index}`}
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
                            Click or drag a book image here
                          </label>
                        </div>


                          {typeof bookImageUploadProgress[index] === "number" && (
                            <div className="mt-2">
                              <div className="h-2 w-full bg-gray-200 rounded">
                                <div
                                  className="h-2 bg-[#805C2C] rounded transition-all"
                                  style={{ width: `${bookImageUploadProgress[index]}%` }}
                                />
                              </div>
                              <p className="text-xs mt-1 text-[#4A3820]">
                                Uploading… {bookImageUploadProgress[index]}%
                              </p>
                            </div>
                          )}

                          {image.src && (
                            <>
                              <img
                                src={image.src}
                                alt={image.alt || "Book image"}
                                className="max-h-48 rounded-lg border mt-3"
                              />

                              <input
                                type="text"
                                value={image.alt}
                                onChange={(e) => {
                                  const alt = e.target.value;
                                  setContent(prev => {
                                    const imgs = [...prev.bookImages];
                                    imgs[index] = { ...imgs[index], alt };
                                    return { ...prev, bookImages: imgs };
                                  });
                                }}
                                placeholder="Alt text (describe the image)"
                                className="mt-3 w-full px-3 py-2 border rounded-lg"
                              />
                            </>
                          )}

                        </div>
                      </div>
                    </div>
                  ))}

                  {content.bookImages.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#D8CDBE] rounded-lg">
                      <p className="text-[#4A3820]/70">No book images yet. Add one above.</p>
                      <p className="text-sm text-[#4A3820]/60 mt-2">
                        These images will appear in the slider between Mission Statement and Who We Are
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] font-sans!">
                    Testimonials
                  </h3>
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors font-sans!"
                  >
                    + Add Testimonial
                  </button>
                </div>

                <div className="space-y-6">
                  {content.testimonials.map((testimonial, index) => (
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
                            Text
                          </label>
                          <textarea
                            value={testimonial.text}
                            onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-25 scrollable-description"
                            placeholder="Enter testimonial text..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Image
                          </label>
                          
                          <input
                            id={`testimonial-image-upload-${index}`}
                            type="file"
                            accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
                            className="hidden"
                            onChange={async (e) => {
                              if (!e.target.files?.[0]) return;
                              await handleTestimonialImageUpload(index, e.target.files[0]);
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

                            await handleTestimonialImageUpload(index, file);
                          }}
                        >
                          <label
                            htmlFor={`testimonial-image-upload-${index}`}
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
                            Click or drag a testimonial image here
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

                        {testimonial.image.src && (
                        <>
                          <img
                            src={testimonial.image.src}
                            alt={testimonial.image.alt || "Testimonial image"}
                            className="max-h-48 rounded-lg border mt-3"
                          />

                          <input
                            type="text"
                            value={testimonial.image.alt}
                            onChange={(e) =>
                              updateTestimonial(index, "image", {
                                ...testimonial.image,
                                alt: e.target.value,
                              })
                            }
                            placeholder="Alt text (e.g. 'Photo of Jane Doe, mentor')"
                            className="mt-3 w-full px-3 py-2 border rounded-lg"
                          />
                        </>
                      )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {content.testimonials.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-[#D8CDBE] rounded-lg">
                      <p className="text-[#4A3820]/70">No testimonials yet. Add one above.</p>
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