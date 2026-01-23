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
import Link from "@tiptap/extension-link";
import CharacterCount from '@tiptap/extension-character-count';
import { exportArticleToDocx } from "@/lib/export/exportArticleToDocx";
import { Extension } from '@tiptap/core';
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import type { JSONContent } from "@tiptap/core";
import { BubbleMenu } from '@tiptap/react/menus';

interface ArticleEditorProps {
  value: JSONContent | null;
  articleId: string;
  resetToken?: number;
  onChange: (value: JSONContent) => void;
  onImageUploaded?: (url: string) => void;

  // new optional metadata props (passed from parent)
  title?: string | null;
  metaDescription?: string | null;
  coverImage?: string | null;
  coverImageAlt?: string | null;
}

export default function ArticleEditor({
  value,
  articleId,
  resetToken,
  onChange,
  onImageUploaded,
  title, // <-- new
  metaDescription, // <-- new
  coverImage, // <-- new
  coverImageAlt, // <-- new
}: ArticleEditorProps) {
  const uploadedImagesRef = useRef<Set<string>>(new Set());
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const isDraggingRef = useRef(false);

  const hasHydratedRef = useRef(false);
  const lastArticleIdRef = useRef<string | null>(null);
  const TOOLBAR_BTN_BASE =
  "px-2 py-1 rounded bg-white font-sans! transition-colors duration-150";
  const TOOLBAR_BTN_HOVER =
  "hover:bg-[#E6DCCB] disabled:opacity-50 disabled:hover:bg-white";



  const getSafePos = (pos: number | undefined, editor: ReturnType<typeof useEditor>): number => {
    if (typeof pos === "number" && Number.isFinite(pos)) return pos;
    return editor?.state.selection.from ?? 0;
  };

  const uploadImageToR2 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    if (!articleId) {
  throw new Error("Article ID is missing — upload aborted");
  }
  
  formData.append("articleId", articleId);
    formData.append("assetType", "content");

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Image upload failed");
    const data = await res.json();
    return data.url;
  };

  const pendingSaveRef = useRef<JSONContent | null>(null);
const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);


// how often we force a server commit
const COMMIT_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes (use 5 * 60 * 1000 if you prefer)

// interval handle
const commitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


const scheduleSave = (json: JSONContent) => {
  pendingSaveRef.current = json;

  if (saveTimeoutRef.current) return;

  saveTimeoutRef.current = setTimeout(() => {
    if (pendingSaveRef.current) {
      onChange(pendingSaveRef.current);
      pendingSaveRef.current = null;
    }
    saveTimeoutRef.current = null;
  }, 800); // 👈 tune this (500–1200ms works well)
};

const flushSave = useCallback(() => {
  if (!pendingSaveRef.current) return;

  onChange(pendingSaveRef.current);
  pendingSaveRef.current = null;
}, [onChange]);


  const DisableImagePaste = Extension.create({
    addProseMirrorPlugins() {
      return [
        new Plugin({
          props: {
            handlePaste(view, event) {
              const items = event.clipboardData?.items;
              if (!items) return false;

              for (const item of items) {
                if (item.type.startsWith('image/')) {
                  return true;
                }
              }
              return false;
            },
          },
        }),
      ];
    },
  });

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
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "tiptap-table",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "tiptap-table-cell",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "tiptap-table-header",
        },
      }),
      DisableImagePaste,
      TextStyleKit,
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
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      DraggableImage,
      DraggableYouTube.configure({
        width: 640,
        height: 360,
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
        limit: null,
      }),
      FileHandler.configure({
        allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
        onPaste: async (editorInstance, files, pos) => {
          const safePos =
            typeof pos === "number"
              ? pos
              : editorInstance.state.selection.from ?? 0;

          await handleFileInsert(editorInstance, files, safePos);
        },
        onDrop: async (editorInstance, files, pos) => {
          const safePos =
            typeof pos === "number"
              ? pos
              : editorInstance.state.selection.from ?? 0;

          await handleFileInsert(editorInstance, files, safePos);
        },
      }),
    ],
    onUpdate: ({ editor, transaction }) => {
    if (!transaction.docChanged) return;
    if (isDraggingRef.current) return; // 👈 key line

    scheduleSave(editor.getJSON());
  },

    onSelectionUpdate: ({ editor }) => {
      const hasSel = !editor.state.selection.empty;
      queueMicrotask(() => setHasSelection(hasSel));
    },
  });

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
      const defaultAlt =
        file.name?.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ") || "";

      editorInstance.state.doc.descendants((node: ProseMirrorNode, p: number) => {
        if (node.type.name === "imageLoading" && typeof node.attrs.id === "string" && node.attrs.id === tempId) {
          tr.replaceWith(
            p,
            p + node.nodeSize,
            editorInstance.schema.nodes.imageWithRemove.create({
              src: url,
              alt: defaultAlt,
            })
          );
        }
      });

      editorInstance.view.dispatch(tr);
      uploadedImagesRef.current.add(url);
      onImageUploaded?.(url);
      flushSave();
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  const handleExportDocx = async () => {
  if (!editor || isExporting) return;

  try {
    setIsExporting(true);
    setExportProgress(10);

    // small delay so UI paints before heavy work
    await new Promise(r => setTimeout(r, 50));
    setExportProgress(30);

    await exportArticleToDocx(editor.getJSON(), {
      title,
      metaDescription,
      coverImage,
      coverImageAlt,
      // OPTIONAL: pass a progress callback later if you want finer control
      // onProgress: setExportProgress,
    });

    setExportProgress(100);
  } catch (err) {
    console.error("DOCX export failed:", err);
  } finally {
    // let users see 100% briefly
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
    }, 400);
  }
};


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

  const applyYouTube = () => {
    if (!editor) return;

    const url = youtubeUrl.trim();
    if (!url) return;

    const match = url.match(
      /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/))([\w-]{11})/
    );

    if (!match) {
      alert("Invalid YouTube URL. Paste a proper YouTube link.");
      return;
    }

    const videoId = match[1];
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;


    editor.chain().focus().insertContent({
      type: 'youtube',
      attrs: {
        src: embedUrl,
        width: 640,
        height: 360,
        allowFullscreen: true,
      },
    }).run();

    setYoutubeModalOpen(false);
    setYoutubeUrl('');
    editor.view.focus();
  };

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

  const unsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

useEffect(() => {
  if (!editor) return;

  commitIntervalRef.current = setInterval(() => {
    flushSave();
  }, COMMIT_INTERVAL_MS);

  return () => {
    if (commitIntervalRef.current) {
      clearInterval(commitIntervalRef.current);
      commitIntervalRef.current = null;
    }
  };
}, [editor, flushSave]);


useEffect(() => {
  if (!editor) return;
  if (!value) return;
  if (hasHydratedRef.current) return;

  queueMicrotask(() => {
    editor.commands.setContent(value, { emitUpdate: false });
    hasHydratedRef.current = true;
  });
}, [editor, value]);

useEffect(() => {
  return () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    flushSave();
  };
}, [flushSave]);

  useEffect(() => {
    const closeOnClick = () => setTableMenuOpen(false);
    if (tableMenuOpen) {
      document.addEventListener("click", closeOnClick);
    }
    return () => document.removeEventListener("click", closeOnClick);
  }, [tableMenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTableMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!editor) return;
    editor.commands.clearContent(true);
  }, [resetToken]);

  useEffect(() => {
  const handleBeforeUnload = () => {
    flushSave();
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [flushSave]);


  if (!editor) return null;

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-40 bg-white">
        <div
          className="flex flex-wrap gap-2 p-2 border rounded"
          style={{ borderColor: "#D8CDBE" }}
        >
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("bold") ? "bg-[#E6DCCB]" : ""
          }`}
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("italic") ? "bg-[#E6DCCB]" : ""
          }`}

          >
            I
          </button>
          <button
            onClick={setLink}
            disabled={!hasSelection}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M432.31-298.46H281.54q-75.34 0-128.44-53.1Q100-404.65 100-479.98q0-75.33 53.1-128.44 53.1-53.12 128.44-53.12h150.77v60H281.54q-50.39 0-85.96 35.58Q160-530.38 160-480q0 50.38 35.58 85.96 35.57 35.58 85.96 35.58h150.77v60ZM330-450v-60h300v60H330Zm197.69 151.54v-60h150.77q50.39 0 85.96-35.58Q800-429.62 800-480q0-50.38-35.58-85.96-35.57-35.58-85.96-35.58H527.69v-60h150.77q75.34 0 128.44 53.1Q860-555.35 860-480.02q0 75.33-53.1 128.44-53.1 53.12-128.44 53.12H527.69Z" />
            </svg>
          </button>
          <button
            onClick={unsetLink}
            disabled={!hasSelection}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="red"
            >
              <path d="M256-213.85 213.85-256l224-224-224-224L256-746.15l224 224 224-224L746.15-704l-224 224 224 224L704-213.85l-224-224-224 224Z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
           editor.isActive("underline") ? "bg-[#E6DCCB]" : "" }`}

          >
            U
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
           className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("heading", { level: 1 }) ? "bg-[#E6DCCB]" : ""
          }`}

          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("heading", { level: 2 }) ? "bg-[#E6DCCB]" : ""
            }`}

          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleList('bulletList', 'listItem').run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("list", { type: "bulletList" }) ? "bg-[#E6DCCB]" : ""
          }`}

          >
            • List
          </button>
          <button
            onClick={() => editor.chain().focus().toggleList('orderedList', 'listItem').run()}
           className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
            editor.isActive("list", { type: "orderedList" }) ? "bg-[#E6DCCB]" : ""
          }`}

          >
            1. List
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTableMenuOpen(v => !v);
              }}
              className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
                editor.isActive("table") ? "bg-[#E6DCCB]" : ""
              }`}

            >
              ⌗ Table
            </button>

            {tableMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute z-50 mt-1 w-48 rounded border bg-white shadow"
                style={{ borderColor: "#D8CDBE" }}
              >
                <TableMenu editor={editor} close={() => setTableMenuOpen(false)} />
              </div>
            )}
          </div>

          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
           className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER} ${
              editor.isActive("codeBlock")
            ? "bg-[#E6DCCB]" : ""
            }`}

          >
            {"</>"}
          </button>
          <button
            onClick={addImage}
           className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M212.31-140Q182-140 161-161q-21-21-21-51.31v-535.38Q140-778 161-799q21-21 51.31-21h535.38Q778-820 799-799q21 21 21 51.31v535.38Q820-182 799-161q-21 21-51.31 21H212.31Zm0-60h535.38q4.62 0 8.46-3.85 3.85-3.84 3.85-8.46v-535.38q0-4.62-3.85-8.46-3.84-3.85-8.46-3.85H212.31q-4.62 0-8.46 3.85-3.85 3.84-3.85 8.46v535.38q0 4.62 3.85 8.46 3.84 3.85 8.46 3.85ZM270-290h423.07L561.54-465.38 449.23-319.23l-80-102.31L270-290Zm-70 90v-560 560Z" />
            </svg>
          </button>
          <button
            onClick={() => setYoutubeModalOpen(true)}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            🎬
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M288.08-220v-60h287.07q62.62 0 107.77-41.35 45.16-41.34 45.16-102.11 0-60.77-45.16-101.93-45.15-41.15-107.77-41.15H294.31l111.3 111.31-42.15 42.15L180-596.54 363.46-780l42.15 42.15-111.3 111.31h280.84q87.77 0 150.35 58.58t62.58 144.5q0 85.92-62.58 144.69Q662.92-220 575.15-220H288.08Z" />
            </svg>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
           className={`${TOOLBAR_BTN_BASE} ${TOOLBAR_BTN_HOVER}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="black"
            >
              <path d="M384.85-220q-87.77 0-150.35-58.77t-62.58-144.69q0-85.92 62.58-144.5t150.35-58.58h280.84l-111.3-111.31L596.54-780 780-596.54 596.54-413.08l-42.15-42.15 111.3-111.31H384.85q-62.62 0-107.77 41.15-45.16 41.16-45.16 101.93 0 60.77 45.16 102.11Q322.23-280 384.85-280h287.07v60H384.85Z" />
            </svg>
          </button>

          <div className="flex-1" />

     <button
  onClick={handleExportDocx}
  disabled={isExporting}
  className={`
    relative px-3 py-1 rounded border border-[#4A3820]
    text-[#4A3820] bg-white shadow font-sans!
    ${isExporting ? "cursor-not-allowed opacity-70" : "hover:bg-[#f9f9f9]"}
  `}
  title="Export article to DOCX"
>
  {/* Label */}
  <span className={`text-sm! ${isExporting ? "opacity-0" : "opacity-100"}`}>
    Export docx
  </span>

  {/* Spinner */}
  {isExporting && (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="
        h-4 w-4
        border-2 border-[#4A3820]/30
        border-t-[#4A3820]
        rounded-full
        animate-spin
      " />
    </span>
  )}
</button>
        </div>
      </div>

      {linkModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-80 space-y-3">
            <h3 className="font-semibold font-sans!">Insert link</h3>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkModalOpen(false);
                  editor?.view.focus();
                }
              }}
              placeholder="https://example.com"
              className="w-full border px-2 py-1 rounded font-sans!"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setLinkModalOpen(false);
                  editor?.view.focus();
                }}
                className="font-sans!"
              >
                Cancel
              </button>
              <button
                onClick={applyLink}
                className="px-3 py-1 bg-[#E6DCCB] rounded font-sans!"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {youtubeModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded w-80 space-y-3">
            <h3 className="font-semibold font-sans!">Insert YouTube Video</h3>
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
              className="w-full border px-2 py-1 rounded font-sans!"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setYoutubeModalOpen(false)}
                className="font-sans!"
              >
                Cancel
              </button>
              <button
                onClick={applyYouTube}
                className="px-3 py-1 bg-[#E6DCCB] rounded font-sans!"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative border rounded bg-white p-4 min-h-75 editor-content max-w-none" style={{ borderColor: "#D8CDBE" }}>
        <div className="tiptap-editor-wrapper py-8 scrollable-description overflow-x-auto">
          {editor && (
          <BubbleMenu
            editor={editor}
            shouldShow={({ editor, from }) => {
              if (editor.state.selection.empty) return false;
              if (editor.isActive("heading")) return false;

              if (!editor.view || !editor.view.dom) return false;
            let coords;
            try {
              coords = editor.view.coordsAtPos(from);
            } catch {
              return false;
            }

              // toolbar height ≈ 64–72px + breathing room
              const TOOLBAR_SAFE_ZONE = 120;

              return coords.top > TOOLBAR_SAFE_ZONE;
            }}
          >
              <div
                className="
                  flex items-center gap-1 p-2 bg-white border rounded shadow
                  max-w-[90vw]
                  overflow-x-auto
                  scrollbar-thin
                "
                style={{ borderColor: "#D8CDBE" }}
              >

                {[
                  "#E53935",
                  "#059669",
                  "#2563EB",
                  "#413320",
                  "#B26C1F",
                  "#7C3AED",
                  "#F97316",
                  "#FBBF24",
                  "#14B8A6",
                  "#DB2777",
                  "#F472B6",
                  "#000000",
                  "#4B5563",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                    }}
                    style={{
                      backgroundColor: color,
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                    }}
                    className={`
                      relative
                      border
                      transition-all
                      duration-150
                      ease-out
                      ${editor.isActive("textStyle", { color })
                        ? "z-10 -translate-y-2 scale-110 shadow-lg border-black"
                        : "z-0 border-gray-300 hover:-translate-y-0.5"
                      }
                    `}
                  />
                ))}
                <button
                  onClick={() => {
                    editor.chain().focus().unsetColor().run();
                  }}
                  className="ml-2 px-2 py-1 text-sm border rounded font-sans!"
                >
                  Reset
                </button>
              </div>
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-2 font-sans!">
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

function TableMenu({
  editor,
  close,
}: {
  editor: ReturnType<typeof useEditor>;
  close: () => void;
}) {
  if (!editor) return null;

  const can = editor.can();
  const inTable = editor.isActive("table");

  const Item = ({
    label,
    onClick,
    disabled = false,
  }: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <button
      onClick={() => {
        onClick();
        close();
      }}
      disabled={disabled}
      className="w-full text-left px-3 py-2 text-sm hover:bg-[#F3EEE7] disabled:opacity-50 font-sans!"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col">
      <Item
        label="Insert table (3×3)"
        disabled={inTable}
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      />

      <div className="h-px bg-[#D8CDBE] my-1" />

      <Item
        label="Add row above"
        disabled={!inTable}
        onClick={() => editor.chain().focus().addRowBefore().run()}
      />
      <Item
        label="Add row below"
        disabled={!inTable}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      />
      <Item
        label="Add column left"
        disabled={!inTable}
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      />
      <Item
        label="Add column right"
        disabled={!inTable}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      />
      <div className="h-px bg-[#D8CDBE] my-1" />

      <Item
        label="Delete row"
        disabled={!can.deleteRow()}
        onClick={() => editor.chain().focus().deleteRow().run()}
      />

      <Item
        label="Delete column"
        disabled={!can.deleteColumn()}
        onClick={() => editor.chain().focus().deleteColumn().run()}
      />
      <div className="h-px bg-[#D8CDBE] my-1" />

      <Item
        label="Merge cells"
        disabled={!can.mergeCells()}
        onClick={() => editor.chain().focus().mergeCells().run()}
      />

      <Item
        label="Split cell"
        disabled={!inTable}
        onClick={() => editor.chain().focus().splitCell().run()}
      />

      <div className="h-px bg-[#D8CDBE] my-1" />

      <Item
        label="Toggle header row"
        disabled={!inTable}
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      />
      <Item
        label="Delete table"
        disabled={!inTable}
        onClick={() => editor.chain().focus().deleteTable().run()}
      />
    </div>
  );
}