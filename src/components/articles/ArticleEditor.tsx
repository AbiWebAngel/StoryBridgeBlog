"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { useCallback } from "react";

// -------------------------
// Upload image to R2 helper
// -------------------------
async function uploadImageToR2(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.url;
}

interface ArticleEditorProps {
  value: any;
  onChange: (json: any) => void;
}

export default function ArticleEditor({ value, onChange }: ArticleEditorProps) {
  // -------------------------
  // Editor Instance
  // -------------------------
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
    editorProps: {
    handlePaste(view, event) {
    const items = event.clipboardData?.items;
    if (!items) return false;

    (async () => {
        for (const item of items) {
        if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
            const url = await uploadImageToR2(file);
            editor?.chain().focus().setImage({ src: url }).run();
            }
        }
        }
    })();

    return false;
    },

    handleDrop(view, event, _slice, moved) {
    if (moved) return false;
    const files = event.dataTransfer?.files;
    if (!files?.length) return false;

    event.preventDefault();
    const file = files[0];
    if (!file.type.startsWith("image/")) return false;

    (async () => {
        const url = await uploadImageToR2(file);
        editor?.chain().focus().setImage({ src: url }).run();
    })();

    return true;
    }
,
    },

  });

 const addImage = useCallback(() => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = () => {
    if (!input.files?.length) return;

    const file = input.files[0];

    (async () => {
      const url = await uploadImageToR2(file);
      editor?.chain().focus().setImage({ src: url }).run();
    })();
  };

  input.click();
}, [editor]);

if (!editor) return null;



  return (
    <div className="space-y-3">
      {/* TOOLBAR */}
      <div
        className="flex flex-wrap gap-2 p-2 border rounded bg-white"
        style={{ borderColor: "#D8CDBE" }}
      >
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("bold") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("italic") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          I
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("underline") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          U
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("heading", { level: 1 }) ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          H1
        </button>

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          H2
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("bulletList") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          • List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded  ${
            editor.isActive("orderedList") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          1. List
        </button>

        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 rounded ${
            editor.isActive("codeBlock") ? "bg-[#E6DCCB]" : "bg-white"
          } !font-sans`}
        >
          {"</>"}
        </button>

        <button
          onClick={addImage}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans"
        >
          Image
        </button>

        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans"
        >
          Undo
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans"
        >
          Redo
        </button>
      </div>

      {/* EDITOR */}
      <div
        className="border rounded bg-white p-4 min-h-[300px] prose max-w-none"
        style={{ borderColor: "#D8CDBE" }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
