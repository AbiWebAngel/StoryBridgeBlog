"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function EmailPage() {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(""); // optional: handle avatar upload separately
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { firstName, lastName });

    setLoading(false);
    alert("Profile updated!");
  };

  return (
    <div>
      <h1 className="text-2xl font-cinzel mb-4">Email Settings</h1>
      <div className="flex flex-col gap-4 max-w-md">
        <input
          type="text"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
          placeholder="First Name"
          className="p-2 border rounded"
        />
        <input
          type="text"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
          placeholder="Last Name"
          className="p-2 border rounded"
        />
        {/* Avatar & password could go here later */}
        <button
          onClick={handleSave}
          className="bg-[#805C2C] text-white px-4 py-2 rounded hover:bg-[#D1BDA1]"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
