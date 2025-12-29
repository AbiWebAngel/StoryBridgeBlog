// src/components/editor/extensions/types.ts
import type { ImageOptions } from "@tiptap/extension-image";

export interface ImageWithRemoveOptions extends ImageOptions {
  onImageRemoved: (url: string) => void;
}
