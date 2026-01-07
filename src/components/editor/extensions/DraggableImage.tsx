import { ImageWithRemove } from "./ImageWithRemove";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const DraggableImage = ImageWithRemove.extend({
  draggable: true,
  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <NodeViewWrapper className="flex items-start group">
        {/* Drag handle */}
        <div className="mr-2 opacity-0 group-hover:opacity-100 cursor-grab select-none text-gray-400 group-hover:text-gray-600">
          ⋮⋮
        </div>

        {/* Image content */}
        <NodeViewContent className="flex-1" />
      </NodeViewWrapper>
    ));
  },
});
