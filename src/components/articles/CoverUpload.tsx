"use client";

import { useState, useRef } from "react";

interface CoverUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export default function CoverUpload({ value, onChange }: CoverUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------
  // DRAG & DROP
  // -------------------------
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    await uploadFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // -------------------------
  // MANUAL BROWSE
  // -------------------------
  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files?.length) return;
    await uploadFile(e.target.files[0]);
  };

  // -------------------------
  // DELETE OLD ASSET
  // -------------------------
  const deleteOldAsset = async (url: string) => {
    try {
      await fetch("/api/admin/delete-asset", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
    } catch (err) {
      console.error("Error deleting old asset:", err);
    }
  };

  // -------------------------
  // UPLOAD
  // -------------------------
  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setProgress(0);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      // Delete previous asset
      if (value) {
        deleteOldAsset(value);
      }

      onChange(data.url);
      setUploading(false);
      setProgress(100);
    } catch (err) {
      console.error("Error uploading:", err);
      setUploading(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
                   hover:border-blue-400 transition"
        onClick={handleBrowse}
      >
        {!value ? (
          <div className="text-gray-600">
            <p className="font-medium">Drag & drop your cover image here</p>
            <p className="text-sm mt-1">or click to browse</p>
          </div>
        ) : (
          <div className="space-y-2">
            <img
              src={value}
              alt="Cover"
              className="max-h-64 object-cover mx-auto rounded"
            />
            <p className="text-sm text-gray-600">
              Click to replace image
            </p>
          </div>
        )}
      </div>

      {/* HIDDEN INPUT */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* PROGRESS BAR */}
      {uploading && (
        <div className="w-full bg-gray-200 rounded h-2">
          <div
            className="bg-blue-600 h-2 rounded"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* DELETE BUTTON */}
      {value && !uploading && (
        <button
          className="text-red-600 text-sm underline"
          onClick={() => {
            deleteOldAsset(value);
            onChange(null);
          }}
        >
          Remove Cover Image
        </button>
      )}
    </div>
  );
}
