"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useCallback, useRef, useEffect, useState } from "react";
import { ImageWithRemove } from "../editor/extensions/ImageWithRemove";
import ListItem from "@tiptap/extension-list-item";
import { ListKit } from "@tiptap/extension-list";
import { DraggableParagraph } from "@/components/editor/extensions/DraggableParagraph";
import { DraggableHeading } from "@/components/editor/extensions/DraggableHeading";
import { DraggableCodeBlock } from "@/components/editor/extensions/DraggableCodeBlock";
import { DraggableImage } from "@/components/editor/extensions/DraggableImage";
import { DraggableYouTube } from '@/components/editor/extensions/DraggableYouTube';
import FileHandler from "@tiptap/extension-file-handler";
import DragHandle from '@tiptap/extension-drag-handle';
import { ImageLoading } from "@/components/editor/extensions/ImageLoading";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { TextStyleKit } from '@tiptap/extension-text-style';
import { Plugin } from 'prosemirror-state';
import type { Transaction } from 'prosemirror-state';
import Link from "@tiptap/extension-link";
import Picker from "@emoji-mart/react";
import data from '@emoji-mart/data';
import CharacterCount from '@tiptap/extension-character-count'



interface ArticleEditorProps {
  value: any;
  articleId: string;
  onChange: (json: any) => void;
  onImageUploaded?: (url: string) => void;
}

export default function ArticleEditor({ value, articleId, onChange, onImageUploaded }: ArticleEditorProps) {
  const uploadedImagesRef = useRef<Set<string>>(new Set());
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');


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
const applyYouTube = () => {
  if (!editor) return;

  const url = youtubeUrl.trim();
  if (!url) return;

  // Robust regex for most YouTube URLs
  const match = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
  );

  if (!match) {
    alert("Invalid YouTube URL. Paste a proper YouTube link.");
    return;
  }

  const videoId = match[1];
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  // Insert YouTube node with src
  editor.chain().focus().insertContent({
    type: 'youtube',
    attrs: {
      src: embedUrl,
      width: 640,
      height: 360,
      allowFullscreen: true,
    },
  }).run();

  
  console.log("YouTube node:", editor.getJSON());
  
  // Close modal, clear input, and refocus
  setYoutubeModalOpen(false);
  setYoutubeUrl('');
  editor.view.focus();
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
      Link.configure({
        openOnClick: false,      // don't navigate while editing
        autolink: true,          // auto-detect pasted URLs
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      DraggableImage,
      DraggableYouTube.configure({
      width: 640,      // default width
      height: 360,     // default height
      allowFullscreen: true,
    }),

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
      CharacterCount.configure({
      limit: null, // or set a limit if you want
    }),

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
    onSelectionUpdate: ({ editor }) => {
    setHasSelection(!editor.state.selection.empty);
  },
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

  const setLink = useCallback(() => {
  if (!editor || editor.state.selection.empty) return;

  const previousUrl = editor.getAttributes("link").href ?? "";
  setLinkUrl(previousUrl);
  setLinkModalOpen(true);
}, [editor]);

const insertYouTube = useCallback((url: string) => {
  if (!editor) return;

  // Extract the video ID from a normal YouTube URL
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (!match) return;

  const videoId = match[1];

  editor.chain().focus().insertContent({
    type: 'youtube',
    attrs: { src: `https://www.youtube.com/embed/${videoId}` },
  }).run();
}, [editor]);


const applyLink = () => {
  if (!editor) return;

  if (!linkUrl) {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  } else {
    const safeUrl =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;

    editor.chain().focus().extendMarkRange("link").setLink({ href: safeUrl }).run();
    setLinkModalOpen(false);
    editor.view.focus();

  }

  setLinkModalOpen(false);
};

const handleEmojiClick = (emojiData: any) => {
  if (!editor) return;

  const emoji = emojiData.native; // <---- THE IMPORTANT BIT

  editor
    .chain()
    .focus()
    .insertContent(emoji)
    .run();

  setEmojiOpen(false);
};




const unsetLink = useCallback(() => {
  editor?.chain().focus().unsetLink().run();
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
        <button
        onClick={setLink}
        disabled={!hasSelection}
        className="px-2 py-1 rounded bg-white disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="black"
        >
          <path d="M432.31-298.46H281.54q-75.34 0-128.44-53.1Q100-404.65 100-479.98q0-75.33 53.1-128.44 53.1-53.12 128.44-53.12h150.77v60H281.54q-50.39 0-85.96 35.58Q160-530.38 160-480q0 50.38 35.58 85.96 35.57 35.58 85.96 35.58h150.77v60ZM330-450v-60h300v60H330Zm197.69 151.54v-60h150.77q50.39 0 85.96-35.58Q800-429.62 800-480q0-50.38-35.58-85.96-35.57-35.58-85.96-35.58H527.69v-60h150.77q75.34 0 128.44 53.1Q860-555.35 860-480.02q0 75.33-53.1 128.44-53.1 53.12-128.44 53.12H527.69Z"/>
        </svg>
      </button>
      <button
      onClick={unsetLink}
      disabled={!hasSelection}
      className="px-2 py-1 rounded bg-white  disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="24px"
        viewBox="0 -960 960 960"
        width="24px"
        fill="red"
      >
        <path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z"/>
      </svg>
    </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`px-2 py-1 rounded ${editor.isActive("underline") ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>U</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H1</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-[#E6DCCB]" : "bg-white"} !font-sans`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleList('bulletList','listItem').run()} className={`px-2 py-1 rounded ${editor.isActive('list',{ type: 'bulletList'}) ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>• List</button>
        <button onClick={() => editor.chain().focus().toggleList('orderedList','listItem').run()} className={`px-2 py-1 rounded ${editor.isActive('list',{ type: 'orderedList'}) ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>1. List</button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`px-2 py-1 rounded ${editor.isActive("codeBlock") ? "bg-[#E6DCCB]":"bg-white"} !font-sans`}>{"</>"}</button>

        <button
          onClick={addImage}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="black"
          >
            <path d="M212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM270-290h423.07L561.54-465.38 449.23-319.23l-80-102.31L270-290Zm-70 90v-560 560Z"/>
          </svg>
        </button>
       <button
          onClick={() => setYoutubeModalOpen(true)}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] !font-sans"
        >
          🎬
        </button>


       <button
          onClick={() => setEmojiOpen(!emojiOpen)}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB]"
        >
          😃
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="black"
          >
            <path d="M288.08-220v-60h287.07q62.62 0 107.77-41.35 45.16-41.34 45.16-102.11 0-60.77-45.16-101.93-45.15-41.15-107.77-41.15H294.31l111.3 111.31-42.15 42.15L180-596.54 363.46-780l42.15 42.15-111.3 111.31h280.84q87.77 0 150.35 58.58t62.58 144.5q0 85.92-62.58 144.69Q662.92-220 575.15-220H288.08Z"/>
          </svg>
        </button>

        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded bg-white hover:bg-[#E6DCCB] disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="black"
          >
            <path d="M384.85-220q-87.77 0-150.35-58.77t-62.58-144.69q0-85.92 62.58-144.5t150.35-58.58h280.84l-111.3-111.31L596.54-780 780-596.54 596.54-413.08l-42.15-42.15 111.3-111.31H384.85q-62.62 0-107.77 41.15-45.16 41.16-45.16 101.93 0 60.77 45.16 102.11Q322.23-280 384.85-280h287.07v60H384.85Z"/>
          </svg>
        </button>

      </div>

      {/* Color Picker */}
      <div className="flex gap-1">
        {[
        '#E53935',
        '#059669',
        '#2563EB',
        '#413320',
        '#B26C1F',
        '#7C3AED',
        '#F97316',
        '#FBBF24',
        '#14B8A6',
        '#DB2777',
        '#F472B6',
        '#4B5563'
      ]
      .map(color => (
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

      {linkModalOpen && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded w-80 space-y-3">
          <h3 className="font-semibold !font-sans">Insert link</h3>

        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // stop form-y behavior
              applyLink();        // save link
            }

            if (e.key === "Escape") {
              e.preventDefault();
              setLinkModalOpen(false);
              editor?.view.focus();
            }
          }}
          placeholder="https://example.com"
          className="w-full border px-2 py-1 rounded !font-sans"
        />


          <div className="flex justify-end gap-2">
         <button
            onClick={() => {
              setLinkModalOpen(false);
              editor?.view.focus();
            }}
            className="!font-sans"
          >
            Cancel
          </button>

            <button
              onClick={applyLink}
              className="px-3 py-1 bg-[#E6DCCB] rounded !font-sans"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    )}
    {emojiOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="relative w-[380px] max-h-[460px] overflow-auto">
      {/* Close button */}
      <button
        onClick={() => setEmojiOpen(false)}
        className="absolute top-1 right-10 text-black text-lg transform transition-transform duration-200 hover:scale-125"
      >
        ✕
      </button>

      {/* Emoji Picker */}
     <Picker
      data={data}
      onEmojiSelect={handleEmojiClick}
      theme="light"
      lazyLoadEmojis
      emojiSize={24}         // smaller emoji size improves scroll
      perLine={8}            // how many emojis per row
      maxFrequentRows={2}    // limits frequent emojis to avoid huge rendering
      style={{
        backgroundColor: "transparent",
        boxShadow: "none",
        height: "100%",       // use full height of container
      }}
      searchDisabled={false}
    />

    </div>
  </div>
)}
{youtubeModalOpen && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-4 rounded w-80 space-y-3">
      <h3 className="font-semibold !font-sans">Insert YouTube Video</h3>

      <input
        value={youtubeUrl}
        onChange={(e) => setYoutubeUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            applyYouTube();
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            setYoutubeModalOpen(false);
            editor?.view.focus();
          }
        }}
        placeholder="https://youtube.com/watch?v=VIDEO_ID"
        className="w-full border px-2 py-1 rounded !font-sans"
      />

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setYoutubeModalOpen(false)}
          className="!font-sans"
        >
          Cancel
        </button>

        <button
          onClick={applyYouTube}
          className="px-3 py-1 bg-[#E6DCCB] rounded !font-sans"
        >
          Insert
        </button>
      </div>
    </div>
  </div>
)}




      {/* Editor */}
      <div className="relative border rounded bg-white p-4 min-h-[300px] editor-content max-w-none" style={{ borderColor: "#D8CDBE" }}>
        <EditorContent editor={editor} />
      </div>

      <div className="text-sm text-gray-600 mt-2 !font-sans">
  {(() => {
    const text = editor.getText() || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = editor.storage.characterCount.characters();
    return `${words} words - ${chars} characters`;
  })()}
</div>
    </div>
  );
}
