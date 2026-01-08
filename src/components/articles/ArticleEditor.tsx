"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useRef } from "react";
import { ImageWithRemove } from "../editor/extensions/ImageWithRemove";
import ListItem from "@tiptap/extension-list-item";
import { ListKit } from "@tiptap/extension-list";
import { DraggableParagraph } from "@/components/editor/extensions/DraggableParagraph";
import { DraggableHeading } from "@/components/editor/extensions/DraggableHeading";
import { DraggableCodeBlock } from "@/components/editor/extensions/DraggableCodeBlock";
import { DraggableImage } from "@/components/editor/extensions/DraggableImage";

import DragHandle from '@tiptap/extension-drag-handle';


async function uploadImageToR2(file: File, articleId: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("articleId", articleId);
  formData.append("assetType", "content");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.url;
}

interface ArticleEditorProps {
  value: any;
  articleId: string;
  onChange: (json: any) => void;
  onImageUploaded?: (url: string) => void;
}

export default function ArticleEditor({ value, articleId, onChange, onImageUploaded }: ArticleEditorProps) {
  // 🔹 Track uploaded images
  const uploadedImagesRef = useRef<Set<string>>(new Set());

const editor = useEditor({
  immediatelyRender: false, // SSR safe
  extensions: [
   StarterKit.configure({
      paragraph: false,
      heading: false,
      codeBlock: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
    }),

    DraggableParagraph,
    DraggableHeading,
    DraggableCodeBlock,

    ListItem,
    ListKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Underline,
    DraggableImage, 
    ImageWithRemove.configure({
      inline: false,
      allowBase64: false,
      onImageRemoved: async (url: string) => {
        try {
          await fetch("/api/delete-asset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
        } catch (err) {
          console.error("Failed to delete image:", err);
        }
      },
    }),
DragHandle.configure({
  render: () => {
    const handle = document.createElement('div')
    handle.className = 'my-drag-handle text-gray-400 cursor-grab select-none'
    handle.textContent = '⋮⋮'
    return handle
  },
}),


  ],
  content: value,
  onUpdate: ({ editor }) => onChange(editor.getJSON()),
});



  // 🔹 Insert new image without deleting others
  const insertImage = useCallback(
    async (url: string) => {
      if (!editor) return;

      editor.chain().focus().insertContent({ type: "imageWithRemove", attrs: { src: url } }).run();

      // Track this uploaded image
      uploadedImagesRef.current.add(url);

      onImageUploaded?.(url);
    },
    [editor, onImageUploaded]
  );

  // 🔹 File picker
  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png, .jpg, .jpeg, .webp, .gif";

    input.onchange = () => {
      if (!input.files?.length) return;
      const file = input.files[0];

      (async () => {
        try {
          const url = await uploadImageToR2(file, articleId);
          await insertImage(url);
        } catch (err) {
          console.error("Image picker upload failed:", err);
        }
      })();
    };

    input.click();
  }, [insertImage, articleId]);

  // 🔹 Paste handler
  const handlePaste = useCallback(
    (view: any, event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return false;

      (async () => {
        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (!file) continue;

            try {
              const url = await uploadImageToR2(file, articleId);
              await insertImage(url);
            } catch (err) {
              console.error("Image paste upload failed:", err);
            }
          }
        }
      })();

      return false;
    },
    [insertImage, articleId]
  );

  // 🔹 Drop handler
  const handleDrop = useCallback(
    (view: any, event: DragEvent, _slice: any, moved: boolean) => {
      if (moved) return false;
      const files = event.dataTransfer?.files;
      if (!files?.length) return false;

      event.preventDefault();

      (async () => {
        const file = files[0];
        if (!file.type.startsWith("image/")) return;

        try {
          const url = await uploadImageToR2(file, articleId);
          await insertImage(url);
        } catch (err) {
          console.error("Image drop upload failed:", err);
        }
      })();

      return true;
    },
    [insertImage, articleId]
  );

  if (!editor) return null;

  return (
    <div className="space-y-3">
    {/* TOOLBAR */}
      <div className="flex flex-wrap gap-2 p-2 border rounded bg-white" style={{ borderColor: "#D8CDBE" }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded ${editor.isActive("underline") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>U</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H2</button>


      {/* ListKit buttons */}
      <button
        onClick={() => editor.chain().focus().toggleList('bulletList', 'listItem').run()}
        className={`px-2 py-1 rounded ${editor.isActive('list', { type: 'bulletList' }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}
      >
        • List
      </button>

      <button
        onClick={() => editor.chain().focus().toggleList('orderedList', 'listItem').run()}
        className={`px-2 py-1 rounded ${editor.isActive('list', { type: 'orderedList' }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}
      >
        1. List
      </button>


        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor.isActive("codeBlock") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>{"</>"}</button>
        <button onClick={addImage} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Image</button>
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Redo</button>
      </div>


      {/* EDITOR */}
      <div
          className="relative border rounded bg-white p-4 min-h-[300px] editor-content max-w-none"
          style={{ borderColor: "#D8CDBE" }}
        >
  
          <EditorContent editor={editor} />

        </div>
    </div>
  );
}
