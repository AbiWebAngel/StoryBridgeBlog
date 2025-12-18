// 🔍 DEBUG-ENABLED VERSION
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [missionStatement, setMissionStatement] = useState("");
  const [whoWeAre, setWhoWeAre] = useState("");
  const [whatWeDo, setWhatWeDo] = useState("");
  const [whyItMatters, setWhyItMatters] = useState("");

  const [testimonials, setTestimonials] = useState<
    { text: string; image: string }[]
  >([]);

  // ❤️ Add auth debug
  useEffect(() => {
    async function debugAuth() {
      const auth = getAuth();
      const user = auth.currentUser;

      console.log("🔍 User loaded:", user);

      if (!user) {
        console.warn("⚠️ No user logged in — Firestore writes will fail");
        return;
      }

      const token = await user.getIdTokenResult(true);
      console.log("🔍 Token claims:", token.claims);

      if (!token.claims.role) {
        console.warn("⚠️ No 'role' claim found on this user");
      } else {
        console.log("✅ User role:", token.claims.role);
      }
    }

    debugAuth();
  }, []);

  

  // 🔹 Load Firestore data on mount
  useEffect(() => {
    async function loadContent() {
      console.log("🔍 Fetching about page content…");

      const ref = doc(db, "siteContent", "about");
      console.log("🔍 Firestore document path:", ref.path);

      try {
        const snap = await getDoc(ref);

        console.log("🔍 Document exists:", snap.exists());

        if (snap.exists()) {
          const data = snap.data();
          console.log("🔍 Fetched data:", data);

          setMissionStatement(data.missionStatement || "");
          setWhoWeAre(data.whoWeAre || "");
          setWhatWeDo(data.whatWeDo || "");
          setWhyItMatters(data.whyItMatters || "");
          setTestimonials(data.testimonials || []);
        }
      } catch (err) {
        console.error("❌ Error reading document:", err);
      }

      setLoading(false);
    }

    loadContent();
  }, []);

useEffect(() => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (currentUser) {
    currentUser.getIdTokenResult().then((idTokenResult) => {
      console.log("ID Token Claims:", idTokenResult.claims);
    });
  }
}, []);



  // 🔹 Save to Firestore
  async function handleSave() {
    setSaving(true);

    const auth = getAuth();
    const user = auth.currentUser;

    console.log("🔍 Attempting save by user:", user);

    if (!user) {
      console.error("❌ User is null — cannot save");
      alert("Not logged in");
      setSaving(false);
      return;
    }

    const token = await user.getIdTokenResult();
    console.log("🔍 Claims before save:", token.claims);

    const ref = doc(db, "siteContent", "about");
    console.log("🔍 Write path:", ref.path);

    try {
      await setDoc(
        ref,
        {
          missionStatement,
          whoWeAre,
          whatWeDo,
          whyItMatters,
          testimonials,
        },
        { merge: true }
      );

      console.log("✅ Saved successfully");
      alert("Saved!");
    } catch (err) {
      console.error("❌ Firestore error:", err);
      alert("Error saving — check console");
    }

    setSaving(false);
  }

  function addTestimonial() {
    setTestimonials([...testimonials, { text: "", image: "" }]);
  }

  function removeTestimonial(index: number) {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-[#4A3820] text-center">
        About Page Content
      </h1>

      {/* Mission Statement */}
      <div>
        <label className="block font-semibold mb-1">Mission Statement</label>
        <textarea
          value={missionStatement}
          onChange={(e) => setMissionStatement(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Who We Are */}
      <div>
        <label className="block font-semibold mb-1">Who We Are</label>
        <textarea
          value={whoWeAre}
          onChange={(e) => setWhoWeAre(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* What We Do */}
      <div>
        <label className="block font-semibold mb-1">What We Do</label>
        <textarea
          value={whatWeDo}
          onChange={(e) => setWhatWeDo(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Why It Matters */}
      <div>
        <label className="block font-semibold mb-1">Why It Matters</label>
        <textarea
          value={whyItMatters}
          onChange={(e) => setWhyItMatters(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Testimonials */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Testimonials</h2>

        {testimonials.map((t, index) => (
          <div key={index} className="border p-4 rounded space-y-2">
            <textarea
              value={t.text}
              onChange={(e) => {
                const arr = [...testimonials];
                arr[index].text = e.target.value;
                setTestimonials(arr);
              }}
              placeholder="Testimonial text"
              className="w-full border p-2 rounded"
            />

            <input
              type="text"
              value={t.image}
              onChange={(e) => {
                const arr = [...testimonials];
                arr[index].image = e.target.value;
                setTestimonials(arr);
              }}
              placeholder="Image URL"
              className="w-full border p-2 rounded"
            />

            <button
              onClick={() => removeTestimonial(index)}
              className="text-red-600 font-semibold"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          onClick={addTestimonial}
          className="px-4 py-2 bg-[#6D4F27] text-white rounded"
        >
          Add Testimonial
        </button>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-3 bg-[#4A3820] text-white rounded-lg w-full font-bold"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
