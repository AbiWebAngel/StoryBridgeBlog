"use client";

import { useState, useRef } from "react";
import { compressImageClient } from "@/lib/compressImage";

interface CoverUploadProps {
  value: string | null;
  articleId: string;
  position: { x: number; y: number };
  onPositionChange: (pos: { x: number; y: number }) => void;
  onChange: (url: string | null) => void;
  onUploaded?: (url: string) => void;
}

export default function CoverUpload({
  value,
  articleId,
  position,
  onPositionChange,
  onChange,
  onUploaded,
}: CoverUploadProps)
 {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null); 
  const fileDialogOpenRef = useRef(false);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    await uploadFile(e.dataTransfer.files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

 const handleBrowse = () => {
  if (fileDialogOpenRef.current) return;

  fileDialogOpenRef.current = true;
  fileInputRef.current?.click();

  // allow reopening AFTER the dialog lifecycle finishes
  setTimeout(() => {
    fileDialogOpenRef.current = false;
  }, 500);
};


 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files?.length) return;

  const file = e.target.files[0];
  e.target.value = ""; // 👈 CRITICAL: clears the input

  await uploadFile(file);
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
    const compressedFile = await compressImageClient(file);

    const formData = new FormData();
    formData.append("file", compressedFile);
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
const containerRef = useRef<HTMLDivElement>(null);

const dragging = useRef(false);

const onPointerDown = (e: React.PointerEvent) => {
  dragging.current = true;
  // capture pointer ON THE CONTAINER (not the image!)
  containerRef.current?.setPointerCapture(e.pointerId);
};

const onPointerUp = (e: React.PointerEvent) => {
  dragging.current = false;
  containerRef.current?.releasePointerCapture(e.pointerId);
};

const onPointerMove = (e: React.PointerEvent) => {
  if (!dragging.current || !containerRef.current) return;

  const rect = containerRef.current.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;

  onPositionChange({
    x: Math.min(100, Math.max(0, x)),
    y: Math.min(100, Math.max(0, y)),
  });
};
const stopClick = (e: React.MouseEvent | React.PointerEvent) => {
  e.preventDefault();
  e.stopPropagation();
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
      onClick={() => {
        if (!value) handleBrowse();
      }}
      className="cursor-pointer"
    >
      {!value ? (
        <label
          onClick={handleBrowse}
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
      ) : (
        <div className="space-y-2">
          <div
            ref={containerRef}
             onClick={stopClick}
             onPointerDown={(e) => {
                stopClick(e);
                onPointerDown(e);
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            className="
              relative w-full
              h-62.5 sm:h-87.5 lg:h-112.5
              overflow-hidden
              rounded-[20px]
              bg-black
            "
          >
            <img
              src={value}
              alt="Cover"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
              style={{
                objectPosition: `${position.x}% ${position.y}%`,
              }}
            />

            <div className="absolute inset-0 flex items-center justify-center text-white text-sm opacity-0 hover:opacity-100 transition">
              Drag image to reposition
            </div>
          </div>

          {value && !uploading && (
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBrowse}
                className="text-sm text-[#4A3820]/70 underline font-sans!"
              >
                Click to replace image
              </button>

              <button
                type="button"
                className="text-red-600 text-sm underline font-sans!"
                onClick={async () => {
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
            </div>
          )}
        </div>
      )}
    </div>

    <input
      type="file"
      ref={fileInputRef}
      accept=".png, .jpg, .jpeg, .webp, .gif, .avif"
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
  </div>
);

}
