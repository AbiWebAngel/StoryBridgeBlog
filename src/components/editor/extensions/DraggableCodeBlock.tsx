import CodeBlock from "@tiptap/extension-code-block";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";

export const DraggableCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(() => (
      <NodeViewWrapper className="flex items-start group">
        {/* Invisible but functional drag handle */}
        <div
          data-drag-handle
          role="button"
          tabIndex={0}
          aria-label="Drag code block"
          className="mr-2 drag-handle opacity-0 group-hover:opacity-100 cursor-grab select-none"
          onMouseDown={(e) => e.preventDefault()}
        />

        {/* Code content */}
        <NodeViewContent className="flex-1 font-mono text-black whitespace-pre" />
      </NodeViewWrapper>
    ));
  },
});
