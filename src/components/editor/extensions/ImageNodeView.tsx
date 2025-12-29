import { NodeViewWrapper } from "@tiptap/react";

export default function ImageNodeView({ node, editor, getPos }: any) {
  const src = node.attrs.src;

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
    <NodeViewWrapper className="relative inline-block group">
      <img src={src} className="max-w-full rounded" />

      <button
        type="button"
        onClick={handleRemove}
        className="absolute top-1 right-1 text-white bg-black/70 text-xs px-1 py-0.5 rounded opacity-0 
                   group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </NodeViewWrapper>
  );
}
