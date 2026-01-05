"use client";

import { useState, useRef } from "react";

interface CoverUploadProps {
  value: string | null;
  articleId: string;          // 👈 ADD
  onChange: (url: string | null) => void;
  onUploaded?: (url: string) => void;
}


export default function CoverUpload({
  value,
  articleId,   // 👈 ADD
  onChange,
  onUploaded,
}: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    await uploadFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    await uploadFile(e.target.files[0]);
  };

  const deleteOldAsset = async (url: string) => {
    try {
      await fetch("/api/delete-asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error("Error deleting old asset:", err);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("articleId", articleId);
    formData.append("assetType", "cover");

    try {
      setUploading(true);
      setProgress(0);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      // Delete previous asset (best-effort)
      if (value) {
        // don't await so we don't block UI, but we do attempt it
        deleteOldAsset(value).catch((err) =>
          console.warn("Failed to delete previous cover asset", err)
        );
      }

      // Notify parent: update model and let them also record uploadedAssets
      onChange(data.url);
      onUploaded?.(data.url);

      setUploading(false);
      setProgress(100);
    } catch (err) {
      console.error("Error uploading:", err);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
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
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("ring-2", "ring-[#805C2C]");
          handleDrop(e);
        }}
        onClick={handleBrowse}
        className="cursor-pointer"
      >
        <label
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
          {!value ? (
            <span>Click or drag an image here</span>
          ) : (
            <div className="space-y-2">
             <img
  src={value}
  alt="Cover"
  className="w-full max-h-96 object-cover mx-auto rounded"
/>

              <p className="text-sm text-[#4A3820]/70">Click to replace image</p>
            </div>
          )}
        </label>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-[#805C2C] h-2 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {value && !uploading && (
        <button
          className="text-red-600 text-sm underline !font-sans"
          onClick={async () => {
            // try to delete remote asset
            try {
              await deleteOldAsset(value);
            } catch (err) {
              console.warn("Failed to delete cover on remove:", err);
            }
            onChange(null);
          }}
        >
          Remove Cover Image
        </button>
      )}
    </div>
  );
}
