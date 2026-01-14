import { NodeViewWrapper } from "@tiptap/react";
import { useEffect, useState } from "react";

export default function ImageNodeView({ node, editor, getPos, updateAttributes }: any) {
  const src = node.attrs.src;
  const [alt, setAlt] = useState(node.attrs.alt || "");

  useEffect(() => {
    setAlt(node.attrs.alt || "");
  }, [node.attrs.alt]);

  const handleRemove = () => {
    const pos = getPos();

    editor
      .chain()
      .focus()
      .deleteRange({ from: pos, to: pos + node.nodeSize })
      .run();

    editor.storage.imageWithRemove?.onImageRemoved?.(src);
  };

  return (
    <NodeViewWrapper className="group w-full flex flex-col items-center relative my-6">
      <img
        src={src}
        alt={alt || ""}
        className="rounded-lg"
        style={{
          maxWidth: "300px",
          width: "100%",
          height: "auto",
          display: "block",
          margin: "0 auto",
        }}
      />

      {/* 🧠 Alt text input */}
      <input
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        onBlur={() => updateAttributes({ alt })}
        placeholder="Alt text (describe this image)"
        className="mt-2 w-full max-w-75 text-xs border rounded px-2 py-1 
                   text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-400"
      />

      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-1 right-1 text-white bg-black/70 text-xs px-1 py-0.5 rounded 
                   opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </NodeViewWrapper>
  );
}
