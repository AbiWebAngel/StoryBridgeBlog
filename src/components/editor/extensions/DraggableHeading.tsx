import Heading from "@tiptap/extension-heading";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const DraggableHeading = Heading.extend({
  draggable: true,

  addNodeView() {
    return ReactNodeViewRenderer(() => (
      <NodeViewWrapper className="flex items-start group">
        {/* Drag handle */}
        <div className="mr-2 opacity-0 group-hover:opacity-100 cursor-grab select-none text-gray-400 group-hover:text-gray-600">
          ⋮⋮
        </div>

        {/* Editable heading content */}
        <NodeViewContent className="flex-1 text-black font-bold" />
      </NodeViewWrapper>
    ));
  },
}).configure({
  levels: [1, 2], // H1–H2 only
});
