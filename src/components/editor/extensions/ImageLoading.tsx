import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import React from "react";

// React component for the spinner
const LoadingSpinner = () => {
  return (
    <NodeViewWrapper className="flex items-center justify-center py-6">
      <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
    </NodeViewWrapper>
  );
};

export const ImageLoading = Node.create({
  name: "imageLoading",

  group: "block",
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      id: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "image-loading" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-loading", mergeAttributes(HTMLAttributes)];
  },

  // ✅ Correct: wrap your React component with ReactNodeViewRenderer
  addNodeView() {
    return ReactNodeViewRenderer(LoadingSpinner);
  },
});
