import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageNodeView from "./ImageNodeView";
import type { ImageWithRemoveOptions } from "./types";

export const ImageWithRemove = Image.extend<ImageWithRemoveOptions>({
  name: "imageWithRemove",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
      resize: false,
      onImageRemoved: () => {},
    };
  },

  // ✅ ADD THIS
  addAttributes() {
    return {
      ...this.parent?.(),

      alt: {
        default: "",
        renderHTML: attributes => {
          if (!attributes.alt) return {};
          return { alt: attributes.alt };
        },
      },
    };
  },

  addStorage() {
    return {
      onImageRemoved: this.options.onImageRemoved,
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
