import Heading from "@tiptap/extension-heading";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const DraggableHeading = Heading.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2],
      HTMLAttributes: {},
      marks: ['textStyle', 'bold', 'italic', 'underline'], // ✅ allow marks
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => (
      <NodeViewWrapper as="div" className="group" data-level={node.attrs.level}>
        <NodeViewContent
          as={`h${node.attrs.level}` as any}
          className="font-inter font-bold"
        />
      </NodeViewWrapper>
    ));
  },
});
