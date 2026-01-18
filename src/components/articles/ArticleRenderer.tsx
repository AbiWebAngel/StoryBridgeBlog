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
import { DraggableParagraph } from "@/components/editor/extensions/DraggableParagraph";
import { DraggableHeading } from "@/components/editor/extensions/DraggableHeading";
import { DraggableCodeBlock } from "@/components/editor/extensions/DraggableCodeBlock";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";


// 👇 import the SAME node used in the editor
import { ImageWithRemove } from "@/components/editor/extensions/ImageWithRemove";
import { useEffect } from "react";

type Props = {
  content: any;
};

export default function ArticleRenderer({ content }: Props) {
const editor = useEditor({
  editable: false,
  immediatelyRender: false,
extensions: [
  StarterKit,
  TextStyle,
  Color, // 👈 THIS is the missing piece
  Underline,
  Link.configure({
    openOnClick: true,
    autolink: true,
    HTMLAttributes: {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableHeader,
  TableCell,
  YouTube,

  ImageWithRemove,
  DraggableParagraph,
  DraggableHeading,
  DraggableCodeBlock,
],


});


console.log("Renderer content:", content);

useEffect(() => {
  if (content) {
    console.log("Renderer content:", content);
  }
}, [content]);

useEffect(() => {
  if (!editor) return;

  console.log("Schema nodes:", Object.keys(editor.schema.nodes));
}, [editor]);

useEffect(() => {
  if (!editor || !content) return;

  editor.commands.setContent(content, {
    emitUpdate: false,
  });

  console.log("Editor JSON after setContent:", editor.getJSON());
}, [editor, content]);


  if (!editor) return null;

  return (
    <div className="article-content max-w-none text-[#413320]">
      <EditorContent editor={editor} />
    </div>
  );
}
