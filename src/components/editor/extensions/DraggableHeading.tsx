import Heading from "@tiptap/extension-heading";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";

export const DraggableHeading = Heading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper className="flex items-start group" as="div">
        <div
          data-drag-handle
          className="mr-2 drag-handle opacity-0 group-hover:opacity-100 cursor-grab select-none"
          onMouseDown={e => e.preventDefault()}
        />

        {/* Render proper heading element dynamically */}
        <NodeViewContent
          as={`h${node.attrs.level}` as any} 
          className="flex-1 font-bold font-inter"
          data-level={node.attrs.level}
        />
      </NodeViewWrapper>
      
    ));
  },
}).configure({
  levels: [1, 2],
});
