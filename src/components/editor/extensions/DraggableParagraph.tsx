import Paragraph from '@tiptap/extension-paragraph';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';

export const DraggableParagraph = Paragraph.extend({
  draggable: true,

  addNodeView() {
    return ReactNodeViewRenderer(() => {
      return (
        <NodeViewWrapper className="flex items-start group">
          {/* 🔹 handle div, picked up by DragHandle plugin */}
          <div className="mr-2 drag-handle opacity-0 group-hover:opacity-100 cursor-grab select-none text-gray-400 group-hover:text-gray-600">
            ⋮⋮
          </div>

          <NodeViewContent className="flex-1 text-black" />
        </NodeViewWrapper>
      );
    });
  },
});
