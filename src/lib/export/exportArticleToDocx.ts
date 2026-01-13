import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  ImageRun,
} from "docx";
import { saveAs } from "file-saver";
import { AlignmentType } from "docx";

type TipTapNode = any;

/* -----------------------------
   Helpers
----------------------------- */

function proxiedImageUrl(originalUrl: string) {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}

function generateArticleFileName() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  return `article-${date}-${time}`;
}

function normalizeDocxColor(color?: string): string | undefined {
  if (!color) {
    return undefined;
  }

  // Already hex
  if (color.startsWith("#")) {
    return color.replace("#", "").toUpperCase();
  }

  // rgb(...) or RGB(...)
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return [r, g, b]
      .map(v => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }

  return undefined;
}

function textRunsFromNode(
  node: TipTapNode,
  isHeading: boolean = false
): (TextRun | ExternalHyperlink)[] {
  if (!node.text) {
    return [];
  }

  const marks = node.marks || [];

  // ───────────────────────────────────────────
  // Detect marks
  // ───────────────────────────────────────────
  const textStyleMark = marks.find((m: any) => m.type === "textStyle");
  const linkMark = marks.find((m: any) => m.type === "link");

  const hasBold =
    marks.some((m: any) => m.type === "bold" || m.type === "strong") ||
    textStyleMark?.attrs?.fontWeight === "bold" ||
    textStyleMark?.attrs?.fontWeight === 700 ||
    isHeading;

  const hasItalic =
    marks.some((m: any) => m.type === "italic") ||
    textStyleMark?.attrs?.fontStyle === "italic";

  const hasUnderline =
    marks.some((m: any) => m.type === "underline") ||
    textStyleMark?.attrs?.textDecoration === "underline";

  const color = normalizeDocxColor(textStyleMark?.attrs?.color);

  // ───────────────────────────────────────────
  // Build TextRun props
  // ───────────────────────────────────────────
  const runProps: any = {
    text: node.text,
    bold: hasBold === true ? true : false,
    italics: hasItalic === true ? true : false,
    underline: hasUnderline ? {} : undefined,
  };

  if (color) {
    runProps.color = color;
  }

  // ───────────────────────────────────────────
  // Hyperlink handling
  // ───────────────────────────────────────────
  if (linkMark?.attrs?.href) {
    return [
      new ExternalHyperlink({
        link: linkMark.attrs.href,
        children: [new TextRun(runProps)],
      }),
    ];
  }

  return [new TextRun(runProps)];
}

function paragraphFromNode(node: TipTapNode): Paragraph | null {
  switch (node.type) {
    case "paragraph":
      const paragraphChildren = node.content?.flatMap(textRunsFromNode) || [];
      return new Paragraph({
        style: "NormalParagraph",
        children: paragraphChildren,
      });

    case "heading":
      const isHeading1 = node.attrs.level === 1;
      const isHeading2 = node.attrs.level === 2;
      const headingChildren = node.content?.flatMap((child: any) => 
        textRunsFromNode(child, isHeading1 || isHeading2)
      ) || [];
      
      return new Paragraph({
        style: isHeading1 ? "Heading1" : isHeading2 ? "Heading2" : "NormalParagraph",
        children: headingChildren,
      });

    case "codeBlock":
      const codeText = node.content?.[0]?.text || "";
      
      return new Paragraph({
        style: "CodeBlock",
        children: [
          new TextRun({
            text: codeText,
          }),
        ],
      });

    default:
      return null;
  }
}

/* -----------------------------
   Image helpers
----------------------------- */
async function fetchImageAsBufferAndInfo(
  url: string
): Promise<{ buffer: Uint8Array; type: "png" | "jpeg"; width: number; height: number }> {
  
  // Support data URLs
  if (url.startsWith("data:")) {
    const match = url.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64,(.*)$/);
    if (!match) {
      throw new Error("Unsupported data URL image");
    }

    const mime = match[1];
    const base64 = match[3];

    const binary = atob(base64);
    const len = binary.length;
    const uint8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) uint8[i] = binary.charCodeAt(i);

    const blob = new Blob([uint8], { type: mime });
    const dims = await getImageDimensions(blob);
    const type: "png" | "jpeg" = mime.includes("png") ? "png" : "jpeg";
    
    return { buffer: uint8, type, width: dims.width, height: dims.height };
  }

  // Remote URL
  const res = await fetch(proxiedImageUrl(url));
  if (!res.ok) {
    throw new Error(`Failed to fetch image: ${res.status}`);
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const blob = await res.blob();

  // If PNG or JPEG, use directly
  if (contentType.includes("png") || contentType.includes("jpeg") || contentType.includes("jpg")) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const dims = await getImageDimensions(blob);
    const type: "png" | "jpeg" = contentType.includes("png") ? "png" : "jpeg";
    
    return { buffer: uint8, type, width: dims.width, height: dims.height };
  }

  // Convert other formats (webp/gif) to PNG
  const pngBlob = await convertBlobToPng(blob);
  const arrayBuffer = await pngBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const dims = await getImageDimensions(pngBlob);

  return { buffer: uint8, type: "png", width: dims.width, height: dims.height };
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to get image dimensions"));
    };
    
    img.src = url;
  });
}

function convertBlobToPng(blob: Blob): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            throw new Error('Canvas not supported');
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((outBlob) => {
            URL.revokeObjectURL(url);
            
            if (!outBlob) {
              reject(new Error('Conversion to PNG failed'));
              return;
            }
            
            resolve(outBlob);
          }, 'image/png');
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image for conversion'));
      };
      
      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}

async function extractParagraphs(nodes: TipTapNode[]): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    /* ------------------ YOUTUBE EMBEDS ------------------ */
    if (node.type === "youtube" || node.type === "youtubeEmbed") {
      const embedSrc = node.attrs?.src;
      if (!embedSrc) {
        continue;
      }

      // Extract video id if present (embed or watch formats)
      const vidMatch = embedSrc.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/);
      const videoId = vidMatch ? vidMatch[1] : null;
      const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : embedSrc;

      // Use placeholder from public folder (served at /youtube-placeholder.jpg)
      const placeholderPath = '/assets/images/articleEditor/youtube-placeholder.jpg';
      try {
        const res = await fetch(placeholderPath);
        if (!res.ok) throw new Error(`Failed to fetch placeholder: ${res.status}`);

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        const dims = await getImageDimensions(blob);

        // Scale like other images (maxWidth same as image handling above)
        const maxWidth = 300;
        let outWidth = dims.width;
        let outHeight = dims.height;
        if (dims.width > maxWidth) {
          const ratio = maxWidth / dims.width;
          outWidth = Math.round(dims.width * ratio);
          outHeight = Math.round(dims.height * ratio);
        }

        // Add placeholder image paragraph
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240,
              after: 120,
            },
            children: [
              new ImageRun({
                data: uint8,
                type: 'jpg',
                transformation: {
                  width: outWidth,
                  height: outHeight,
                },
              }),
            ],
          })
        );

        // Add a link paragraph under the image
        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 60,
              after: 240,
            },
            children: [
              new ExternalHyperlink({
                link: watchUrl,
                children: [
                  new TextRun({
                    text: watchUrl,
                    underline: {},
                    color: '2563EB',
                  }),
                ],
              }),
            ],
          })
        );
      } catch (err) {
        // fallback: just add the link text
        paragraphs.push(
          new Paragraph({
            children: [new TextRun({ text: watchUrl })]
          })
        );
      }

      continue;
    }

    /* ---------- TEXT / HEADINGS / CODE ---------- */
    const para = paragraphFromNode(node);
    if (para) {
      paragraphs.push(para);
      continue;
    }

    /* ------------------ IMAGES ------------------ */
    if (node.type === "imageWithRemove" || node.type === 'image') {
      try {
        const src = node.attrs?.src;
        if (!src) {
          continue;
        }

        const { buffer, type, width, height } = await fetchImageAsBufferAndInfo(src);

        // Scale width to max 600 while keeping aspect ratio
        const maxWidth = 300;
        let outWidth = width;
        let outHeight = height;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          outWidth = Math.round(width * ratio);
          outHeight = Math.round(height * ratio);
        }

        paragraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 240,
              after: 240,
            },
            children: [
              new ImageRun({
                data: buffer,
                type: type === "png" ? "png" : "jpg",
                transformation: {
                  width: outWidth,
                  height: outHeight,
                },
              }),
            ],
          })
        );
      } catch (err) {
        // Skip image on error
      }
      continue;
    }

    /* ------------------ LISTS ------------------ */
    if (node.type === "bulletList" || node.type === "orderedList") {
      const listItems = node.content || [];
      
      for (const item of listItems) {
        const textNodes = item.content?.[0]?.content || [];
        
        paragraphs.push(
          new Paragraph({
            style: "ListParagraph",
            children: textNodes.flatMap(textRunsFromNode),
            numbering: {
              reference: node.type === "orderedList" ? "num" : "bullet",
              level: 0,
            },
          })
        );
      }
    }
  }
  
  return paragraphs;
}

/* -----------------------------
   Public API
----------------------------- */

export async function exportArticleToDocx(body: any) {
  if (!body?.content) {
    alert("Nothing to export 😅");
    return;
  }

  try {
    const paragraphs = await extractParagraphs(body.content);
    
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "NormalParagraph",
            name: "Normal Paragraph",
            basedOn: "Normal",
            quickFormat: true,
            run: { 
              font: "Inter", 
              size: 36,
            },
            paragraph: {
              spacing: { after: 200 },
            },
          },
          {
            id: "Heading1",
            name: "Heading 1",
            basedOn: "Normal",
            quickFormat: true,
            run: { 
              font: "Inter", 
              size: 44,
              bold: true 
            },
            paragraph: { 
              spacing: { after: 200 } 
            },
          },
          {
            id: "Heading2",
            name: "Heading 2",
            basedOn: "Normal",
            quickFormat: true,
            run: { 
              font: "Inter", 
              size: 40,
              bold: true 
            },
            paragraph: { 
              spacing: { after: 200 } 
            },
          },
          {
            id: "CodeBlock",
            name: "Code Block",
            basedOn: "Normal",
            run: { 
              font: "Courier New", 
              size: 36,
            },
            paragraph: { 
              spacing: { before: 200, after: 200 } 
            },
          },
          {
            id: "ListParagraph",
            name: "List Paragraph",
            basedOn: "Normal",
            run: { 
              font: "Inter", 
              size: 36,
            },
            paragraph: {},
          },
        ],
        characterStyles: [
          {
            id: "HyperlinkStyle",
            name: "Hyperlink",
            run: {
              color: "2563EB",
              underline: {},
            },
          },
        ],
      },

      numbering: {
        config: [
          {
            reference: "bullet",
            levels: [{ level: 0, format: "bullet", text: "•" }],
          },
          {
            reference: "num",
            levels: [{ level: 0, format: "decimal", text: "%1." }],
        },
        ],
      },

      sections: [
        {
          children: paragraphs,
          properties: {
            page: {
              margin: {
                top: 1440,
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    
    const fileName = `${generateArticleFileName()}.docx`;
    saveAs(blob, fileName);
  } catch (err) {
    throw err;
  }
}