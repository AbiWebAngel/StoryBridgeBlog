"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useRef, useEffect } from "react";
import { ImageWithRemove } from "../editor/extensions/ImageWithRemove";
import ListItem from "@tiptap/extension-list-item";
import { ListKit } from "@tiptap/extension-list";
import { DraggableParagraph } from "@/components/editor/extensions/DraggableParagraph";
import { DraggableHeading } from "@/components/editor/extensions/DraggableHeading";
import { DraggableCodeBlock } from "@/components/editor/extensions/DraggableCodeBlock";
import { DraggableImage } from "@/components/editor/extensions/DraggableImage";
import FileHandler from "@tiptap/extension-file-handler";
import DragHandle from '@tiptap/extension-drag-handle';
import { ImageLoading } from "@/components/editor/extensions/ImageLoading";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Plugin } from 'prosemirror-state';
import type { EditorState, Transaction } from 'prosemirror-state';



interface ArticleEditorProps {
  value: any;
  articleId: string;
  onChange: (json: any) => void;
  onImageUploaded?: (url: string) => void;
}

export default function ArticleEditor({ value, articleId, onChange, onImageUploaded }: ArticleEditorProps) {
  const uploadedImagesRef = useRef<Set<string>>(new Set());
  
  // 🔹 Safe position helper
  const getSafePos = (pos: number | undefined, editor: ReturnType<typeof useEditor>): number => {
    if (typeof pos === "number" && Number.isFinite(pos)) return pos;
    return editor?.state.selection.from ?? 0; // fallback to 0
  };

  // 🔹 Upload image
  const uploadImageToR2 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("articleId", articleId);
    formData.append("assetType", "content");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.url;
  };

  // 🔹 Editor instance
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: false,
        codeBlock: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
     TextStyleKit,                      // always include this
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
          const handle = document.createElement("div");
          handle.className = "my-drag-handle text-gray-400 cursor-grab select-none";
          handle.textContent = "⋮⋮";
          return handle;
        },
      }),
      ImageLoading,
     FileHandler.configure({
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],

  onDrop: async (editorInstance, files, pos) => {
    const safePos = typeof pos === "number" ? pos : editorInstance.state.selection.from ?? 0;
    await handleFileInsert(editorInstance, files, safePos);
  },

  onPaste: async (editorInstance, files, pos) => {
    const safePos = typeof pos === "number" ? pos : editorInstance.state.selection.from ?? 0;
    await handleFileInsert(editorInstance, files, safePos);
  },
}),

    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
  });

  // 🔹 Insert image helper
  const handleFileInsert = async (editorInstance: typeof editor, files: File[], pos?: number) => {
    if (!editorInstance || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) return;

    const position = getSafePos(pos, editorInstance);
    const tempId = `temp-${Date.now()}`;

    editorInstance.chain().insertContentAt(position, { type: "imageLoading", attrs: { id: tempId } }).run();

    try {
      const url = await uploadImageToR2(file);
      const tr = editorInstance.state.tr;

      editorInstance.state.doc.descendants((node: ProseMirrorNode, p: number) => {
        if (node.type.name === "imageLoading" && typeof node.attrs.id === "string" && node.attrs.id === tempId) {
          tr.replaceWith(
            p,
            p + node.nodeSize,
            editorInstance.schema.nodes.imageWithRemove.create({ src: url })
          );
        }
      });

      editorInstance.view.dispatch(tr);
      uploadedImagesRef.current.add(url);
      onImageUploaded?.(url);
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const insertImage = useCallback(
    async (url: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent({ type: "imageWithRemove", attrs: { src: url } }).run();
      uploadedImagesRef.current.add(url);
      onImageUploaded?.(url);
    },
    [editor, onImageUploaded]
  );

  const addImage = useCallback(() => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.webp,.gif";

    input.onchange = async () => {
      if (!input.files?.length) return;
      await handleFileInsert(editor, [input.files[0]], editor.state.selection.from ?? 0);
    };

    input.click();
  }, [editor]);
  
useEffect(() => {
  if (!editor) return;

  editor.registerPlugin(
    new Plugin({
      appendTransaction(transactions: readonly Transaction[], oldState, newState) {
        const tr = newState.tr;
        let modified = false;

        newState.doc.descendants((node, pos) => {
          if (node.type.name === 'heading') {
            node.marks.forEach(mark => {
              if (mark.type.name === 'textStyle' && mark.attrs.color) {
                tr.removeMark(pos, pos + node.nodeSize, mark.type);
                modified = true;
              }
            });
          }
        });

        return modified ? tr : null;
      },
    })
  );
}, [editor]);

const isHeading = editor?.isActive('heading')

  if (!editor) return null;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-2 border rounded bg-white" style={{ borderColor: "#D8CDBE" }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded ${editor.isActive("bold") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded ${editor.isActive("italic") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded ${editor.isActive("underline") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>U</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleList('bulletList','listItem').run()} className={`px-2 py-1 rounded ${editor.isActive('list',{ type: 'bulletList'}) ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>• List</button>
        <button onClick={() => editor.chain().focus().toggleList('orderedList','listItem').run()} className={`px-2 py-1 rounded ${editor.isActive('list',{ type: 'orderedList'}) ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>1. List</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor.isActive("codeBlock") ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>{"</>"}</button>
        <button onClick={addImage} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Image</button>
        <button onClick={() => editor.chain().focus().undo().run()} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Undo</button>
        <button onClick={() => editor.chain().focus().redo().run()} className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans">Redo</button>
      </div>

      {/* Color Picker */}
      <div className="flex gap-1">
        {['#E53935','#059669','#2563EB','#413320','#B26C1F','#7C3AED','#F97316','#FBBF24','#14B8A6','#DB2777','#4B5563'].map(color => (
        <button
          key={color}
          onClick={() => editor?.chain().focus().setColor(color).run()}
          disabled={isHeading} // ✅ Disable on headings
          style={{
            backgroundColor: color,
            width: 24,
            height: 24,
            borderRadius: 4,
            opacity: isHeading ? 0.5 : 1, // optional: show visually disabled
            cursor: isHeading ? 'not-allowed' : 'pointer'
          }}
          className={`border ${editor?.isActive('textStyle',{ color }) ? 'border-black':'border-gray-300 mt-1'}`}
        />
        ))}
        <button onClick={() => editor.chain().focus().unsetColor().run()} className="px-2 py-1 border rounded ml-2 !font-sans">Reset</button>
      </div>

      {/* Editor */}
      <div className="relative border rounded bg-white p-4 min-h-[300px] editor-content max-w-none" style={{ borderColor: "#D8CDBE" }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
