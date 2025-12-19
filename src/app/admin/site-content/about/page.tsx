"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";

type Testimonial = {
  text: string;
  image: string;
};

type AboutContent = {
  missionStatement: string;
  whoWeAre: string;
  whatWeDo: string;
  whyItMatters: string;
  testimonials: Testimonial[];
  bookImages: string[]; // Added this line
};

export default function AdminAboutPage() {
  const { user: currentAuthUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [content, setContent] = useState<AboutContent>({
    missionStatement: "",
    whoWeAre: "",
    whatWeDo: "",
    whyItMatters: "",
    testimonials: [],
    bookImages: [], // Added this line
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
        const ref = doc(db, "siteContent", "about");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setContent({
            missionStatement: data.missionStatement || "",
            whoWeAre: data.whoWeAre || "",
            whatWeDo: data.whatWeDo || "",
            whyItMatters: data.whyItMatters || "",
            testimonials: data.testimonials || [],
            bookImages: data.bookImages || [], // Added this line
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

      const ref = doc(db, "siteContent", "about");
      await setDoc(ref, content, { merge: true });

      setSuccessMessage("About page content saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setErrorMessage(err.message || "Failed to save changes. Please try again.");
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

  // Testimonial functions
  const addTestimonial = () => {
    setContent(prev => ({
      ...prev,
      testimonials: [...prev.testimonials, { text: "", image: "" }]
    }));
  };

  const updateTestimonial = (index: number, field: keyof Testimonial, value: string) => {
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

  // Book Images functions
  const addBookImage = () => {
    setContent(prev => ({
      ...prev,
      bookImages: [...prev.bookImages, ""]
    }));
  };

  const updateBookImage = (index: number, value: string) => {
    setContent(prev => {
      const updatedBookImages = [...prev.bookImages];
      updatedBookImages[index] = value;
      return { ...prev, bookImages: updatedBookImages };
    });
  };

  const removeBookImage = (index: number) => {
    setContent(prev => ({
      ...prev,
      bookImages: prev.bookImages.filter((_, i) => i !== index)
    }));
  };

  // Guest state when not logged in
  if (!currentAuthUser && !loading) {
    return (
      <div className="px-6 min-h-screen font-sans">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
            About Page Management
          </h1>
          <div className="space-y-6 mt-8">
            <div className="bg-[#F0E8DB] border border-[#D8CDBE] rounded-lg shadow-md p-6 sm:p-8">
              <h2 className="text-2xl font-extrabold text-[#4A3820] mb-6 text-center !font-sans">
                Please Log In
              </h2>
              <div className="text-center">
                <p className="text-lg text-[#4A3820] mb-6">
                  Log in as an administrator or author to manage about page content
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
          <h2 className="text-2xl font-medium text-[#4A3820] mb-6 !font-sans">
            Edit About Page Content
          </h2>

          {loading ? (
            <p className="text-center text-[#4A3820] py-8">Loading content...</p>
          ) : (
            <div className="space-y-6">
              {/* Mission Statement */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                  Mission Statement
                </label>
                <textarea
                  value={content.missionStatement}
                  onChange={(e) => handleContentChange("missionStatement", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[120px] scrollable-description"
                  placeholder="Enter your mission statement..."
                />
              </div>

              {/* Who We Are */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                  Who We Are
                </label>
                <textarea
                  value={content.whoWeAre}
                  onChange={(e) => handleContentChange("whoWeAre", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[150px] scrollable-description"
                  placeholder="Describe who you are..."
                />
              </div>

              {/* What We Do */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                  What We Do
                </label>
                <textarea
                  value={content.whatWeDo}
                  onChange={(e) => handleContentChange("whatWeDo", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[150px] scrollable-description"
                  placeholder="Explain what you do..."
                />
              </div>

              {/* Why It Matters */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <label className="block text-lg font-bold text-[#4A3820] mb-3 !font-sans">
                  Why It Matters
                </label>
                <textarea
                  value={content.whyItMatters}
                  onChange={(e) => handleContentChange("whyItMatters", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[150px] scrollable-description"
                  placeholder="Explain why it matters..."
                />
              </div>

              {/* Book Images Section - Added this new section */}
              <div className="bg-white rounded-lg border border-[#D8CDBE] p-5 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A3820] !font-sans">
                    Book Images (for Slider)
                  </h3>
                  <button
                    onClick={addBookImage}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors !font-sans"
                  >
                    + Add Book Image
                  </button>
                </div>

                <div className="space-y-4">
                  {content.bookImages.map((imageUrl, index) => (
                    <div key={index} className="flex items-center gap-4 border-2 border-[#D8CDBE] rounded-lg p-4 bg-[#F9F5F0]">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-[#4A3820] mb-2">
                          Book Image #{index + 1} URL
                        </label>
                        <input
                          type="text"
                          value={imageUrl}
                          onChange={(e) => updateBookImage(index, e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                          placeholder="/assets/images/about/book1.png or https://..."
                        />
                      </div>
                      <button
                        onClick={() => removeBookImage(index)}
                        className="px-3 py-2 rounded-lg border-2 border-red-500 text-red-500 text-sm hover:bg-red-50 transition-colors !font-sans whitespace-nowrap"
                      >
                        Remove
                      </button>
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
                  <h3 className="text-xl font-bold text-[#4A3820] !font-sans">
                    Testimonials
                  </h3>
                  <button
                    onClick={addTestimonial}
                    className="px-4 py-2 rounded-lg border-2 border-[#805C2C] text-[#805C2C] font-medium hover:bg-[#F0E8DB] transition-colors !font-sans"
                  >
                    + Add Testimonial
                  </button>
                </div>

                <div className="space-y-6">
                  {content.testimonials.map((testimonial, index) => (
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
                            Text
                          </label>
                          <textarea
                            value={testimonial.text}
                            onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50 min-h-[100px] scrollable-description"
                            placeholder="Enter testimonial text..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-[#4A3820] mb-2">
                            Image URL
                          </label>
                          <input
                            type="text"
                            value={testimonial.image}
                            onChange={(e) => updateTestimonial(index, "image", e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border-2 border-[#805C2C] bg-white text-[#4A3820] placeholder-[#4A3820]/60 focus:outline-none focus:ring-2 focus:ring-[#805C2C]/50"
                            placeholder="https://example.com/image.jpg"
                          />
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