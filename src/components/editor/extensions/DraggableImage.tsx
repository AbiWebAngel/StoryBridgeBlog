import { ImageWithRemove } from "./ImageWithRemove";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";

export const DraggableImage = ImageWithRemove.extend({
  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <NodeViewWrapper className="flex items-start group">
        {/* Invisible but functional drag handle */}
        <div
          data-drag-handle
          role="button"
          tabIndex={0}
          aria-label="Drag image"
          className="mr-2 drag-handle opacity-0 group-hover:opacity-100 cursor-grab select-none"
          onMouseDown={(e) => e.preventDefault()}
        />

        {/* Image content */}
        <NodeViewContent className="flex-1" />
      </NodeViewWrapper>
    ));
  },
});
