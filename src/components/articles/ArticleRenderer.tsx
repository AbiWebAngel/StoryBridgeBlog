"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
  content: any;
};

export default function ArticleRenderer({ content }: Props) {
  const editor = useEditor({
  editable: false,
  immediatelyRender: false, // 👈 REQUIRED for Next.js App Router
  extensions: [
    StarterKit,
    Underline,
    Image.configure({
      HTMLAttributes: {
        class: "rounded-lg my-6",
      },
    }),
    Link.configure({
      openOnClick: true,
      autolink: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
  ],
  content,
});


  if (!editor) return null;

  return (
    <div className="prose prose-lg max-w-none text-[#413320]">
      <EditorContent editor={editor} />
    </div>
  );
}
