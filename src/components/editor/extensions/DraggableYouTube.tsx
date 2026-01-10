import YouTube from '@tiptap/extension-youtube';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export const DraggableYouTube = YouTube.extend({
  addAttributes() {
    return {
      src: { default: null },
      width: { default: 640 },
      height: { default: 360 },
      allowFullscreen: { default: true },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, editor, getPos }) => {
      const aspectRatio =
        (node.attrs.height || 360) / (node.attrs.width || 640);

      const handleRemove = () => {
  const pos = getPos();

  if (typeof pos !== 'number') return;

  editor
    .chain()
    .focus()
    .deleteRange({ from: pos, to: pos + node.nodeSize })
    .run();
};

      return (
        <NodeViewWrapper className="group w-full flex justify-center my-6 relative">
          {/* Size constrained container */}
          <div
            className="relative w-full"
            style={{
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            {/* Aspect ratio box */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: `${aspectRatio * 100}%`,
              }}
            >
              <iframe
                src={node.attrs.src}
                allowFullScreen={node.attrs.allowFullscreen}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                frameBorder="0"
                className="absolute inset-0 w-full h-full rounded-lg"
              />
            </div>

            {/* Close button (same as image) */}
            <button
              type="button"
              onClick={handleRemove}
              className="
                absolute top-1 right-1 z-10
                text-white bg-black/70 text-xs px-1 py-0.5 rounded
                opacity-0 group-hover:opacity-100 transition-opacity
              "
            >
              ✕
            </button>
          </div>
        </NodeViewWrapper>
      );
    });
  },
});
