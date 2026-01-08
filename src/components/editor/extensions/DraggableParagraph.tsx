import Paragraph from '@tiptap/extension-paragraph';
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from '@tiptap/react';

export const DraggableParagraph = Paragraph.extend({
  addNodeView() {
    return ReactNodeViewRenderer(() => {
      return (
        // Use relative instead of flex to preserve list indentation
        <NodeViewWrapper className="relative group">
          {/* Drag handle container — now invisible but functional */}
          <div
            data-drag-handle
            role="button"
            tabIndex={0}
            aria-label="Drag paragraph"
            className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab select-none"
            style={{ width: '1.5rem' }} // reserve space for handle
            onMouseDown={(e) => e.preventDefault()}
          />

          {/* Paragraph content with left margin so it doesn't overlap handle */}
          <NodeViewContent className="flex-1 text-black" />
        </NodeViewWrapper>
      );
    });
  },
});
