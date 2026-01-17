"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import YouTube from "@tiptap/extension-youtube";

// 👇 import the SAME node used in the editor
import { ImageWithRemove } from "@/components/editor/extensions/ImageWithRemove";

type Props = {
  content: any;
};

export default function ArticleRenderer({ content }: Props) {
  const editor = useEditor({
    editable: false,
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      ImageWithRemove.configure({
        HTMLAttributes: {
          class: "rounded-lg my-6",
        },
      }),
      YouTube.configure({
        width: 640,
        height: 360,
        allowFullscreen: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
  });

  if (!editor) return null;

  return (
    <div className="article-content max-w-none text-[#413320]">
      <EditorContent editor={editor} />
    </div>
  );
}
