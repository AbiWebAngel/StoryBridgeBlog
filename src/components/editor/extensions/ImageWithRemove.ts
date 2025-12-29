import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageNodeView from "./ImageNodeView";
import type { ImageWithRemoveOptions } from "./types";

export const ImageWithRemove = Image.extend<ImageWithRemoveOptions>({
  name: "imageWithRemove",

  addOptions() {
    return {
      // REQUIRED ImageOptions
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},

      // 🔥 THIS was the issue — must be false, not undefined
      resize: false,

      // Custom option
      onImageRemoved: () => {},
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
