import CodeBlock from "@tiptap/extension-code-block";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const DraggableCodeBlock = CodeBlock.extend({
  draggable: true,
  addNodeView() {
    return ReactNodeViewRenderer(() => (
      <NodeViewWrapper className="flex items-start group">
        {/* Drag handle */}
        <div className="mr-2 opacity-0 group-hover:opacity-100 cursor-grab select-none text-gray-400 group-hover:text-gray-600">
          ⋮⋮
        </div>

        {/* Editable code content */}
        <NodeViewContent className="flex-1 font-mono text-black whitespace-pre" />
      </NodeViewWrapper>
    ));
  },
});
