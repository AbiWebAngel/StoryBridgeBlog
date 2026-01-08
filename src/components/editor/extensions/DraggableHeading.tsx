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

        {/* This MUST be the <h1> or <h2> */}
        <NodeViewContent
          as="div"
          className="flex-1 text-black font-bold"
          data-level={node.attrs.level}
        />

      </NodeViewWrapper>
    ));
  },
}).configure({
  levels: [1, 2],
});

