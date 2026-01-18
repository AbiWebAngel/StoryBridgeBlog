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
import { VerticalAlign } from "docx";

import {
  Table as DocxTable,
  TableRow as DocxTableRow,
  TableCell as DocxTableCell,
  WidthType,
} from "docx";



type TipTapNode = any;

/* -----------------------------
   Helpers
----------------------------- */
function tableFromNode(node: TipTapNode): DocxTable | null {
  if (node.type !== "table") return null;

  const rows = node.content ?? [];

  return new DocxTable({
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    rows: rows.map((rowNode: any) => {
      return new DocxTableRow({
        children: (rowNode.content ?? []).map((cellNode: any) => {
          const isHeader = cellNode.type === "tableHeader";

          const paragraphs =
            cellNode.content?.flatMap((cellContent: any) => {
              const para = paragraphFromNode(cellContent);
              return para ? [para] : [];
            }) ?? [];

          return new DocxTableCell({
            children: paragraphs.length
              ? paragraphs
              : [new Paragraph("")],
            shading: isHeader
              ? {
                  fill: "E6DCCB",
                }
              : undefined,
          });
        }),
      });
    }),
  });
}

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
  isHeading: boolean = false,
  forceBold: boolean = false
): (TextRun | ExternalHyperlink)[] {
  if (!node.text) return [];

  const marks = node.marks || [];
  const textStyleMark = marks.find((m: any) => m.type === "textStyle");
  const linkMark = marks.find((m: any) => m.type === "link");

  const hasBold =
    forceBold ||
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

  const runProps: any = {
    text: node.text,
    bold: hasBold,
    italics: hasItalic,
    underline: hasUnderline ? {} : undefined,
    color,
  };

  if (linkMark?.attrs?.href) {
    return [
      new ExternalHyperlink({
        link: linkMark.attrs.href,
        children: [
          new TextRun({
            ...runProps,
            style: "Hyperlink",
            underline: {},
          }),
        ],
      }),
    ];
  }

  return [new TextRun(runProps)];
}


function paragraphFromNode(
  node: TipTapNode,
  forceBold: boolean = false,
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
): Paragraph | null {
  switch (node.type) {
  case "paragraph":
  return new Paragraph({
    style: "NormalParagraph",
    alignment,
    spacing: forceBold
    ? { before: 0, after: 0 }
    : undefined,
    children:
      node.content?.flatMap((child: any) =>
        textRunsFromNode(child, false, forceBold)
      ) || [],
  });;

  case "heading":
  return new Paragraph({
    style:
      node.attrs.level === 1
        ? "Heading1"
        : node.attrs.level === 2
        ? "Heading2"
        : "NormalParagraph",
    alignment,
    spacing: forceBold
    ? { before: 0, after: 0 }
    : undefined,
    children:
      node.content?.flatMap((child: any) =>
        textRunsFromNode(child, true, forceBold)
      ) || [],
  });

    case "codeBlock":
      return new Paragraph({
        style: "CodeBlock",
        children: [
          new TextRun({
            text: node.content?.[0]?.text || "",
          }),
        ],
      });

    default:
      return null;
  }
}

async function paragraphsFromNode(
  node: TipTapNode,
  forceBold: boolean = false,
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType]
): Promise<Paragraph[]> {
  // Try normal paragraph / heading / codeBlock first
 const para = paragraphFromNode(node, forceBold, alignment);
  if (para) return [para];

  // IMAGE
  if (node.type === "image" || node.type === "imageWithRemove") {
    const src = node.attrs?.src;
    if (!src) return [];

    const { buffer, type, width, height } = await fetchImageAsBufferAndInfo(src);
    const maxWidth = 250;
    const ratio = width > maxWidth ? maxWidth / width : 1;
    const altText = node.attrs?.alt?.trim();

    const paras: Paragraph[] = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: buffer,
            type: type === "png" ? "png" : "jpg",
            transformation: {
              width: Math.round(width * ratio),
              height: Math.round(height * ratio),
            },
            altText: altText ? { name: altText, description: altText } : undefined,
          }),
        ],
      }),
    ];

    if (altText) {
      paras.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: altText,
              size: 28,
              color: "555555",
              font: "Inter",
            }),
          ],
        })
      );
    }

    return paras;
  }

  // YOUTUBE
  if (node.type === "youtube" || node.type === "youtubeEmbed") {
    const embedSrc = node.attrs?.src;
    if (!embedSrc) return [];

    const vidMatch = embedSrc.match(/(?:embed\/|v=|youtu\.be\/)([\w-]{11})/);
    const videoId = vidMatch ? vidMatch[1] : null;
    const watchUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : embedSrc;

    const placeholderPath = "/assets/images/articleEditor/youtube-placeholder.jpg";
    try {
      const res = await fetch(placeholderPath);
      if (!res.ok) throw new Error("placeholder fetch failed");

      const blob = await res.blob();
      const buffer = new Uint8Array(await blob.arrayBuffer());
      const dims = await getImageDimensions(blob);
      const maxWidth = 300;
      const ratio = dims.width > maxWidth ? maxWidth / dims.width : 1;

      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: buffer,
              type: "jpg",
              transformation: {
                width: Math.round(dims.width * ratio),
                height: Math.round(dims.height * ratio),
              },
            }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ExternalHyperlink({
              link: watchUrl,
              children: [
                new TextRun({
                  text: "▶ Watch on YouTube",
                  underline: {},
                  color: "2563EB",
                }),
              ],
            }),
          ],
        }),
      ];
    } catch {
      return [new Paragraph({ children: [new TextRun(watchUrl)] })];
    }
  }

  return [];
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

async function extractParagraphs(
  nodes: TipTapNode[]
): Promise<(Paragraph | DocxTable)[]> {
  const blocks: (Paragraph | DocxTable)[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

/* ------------------ TABLES ------------------ */
if (node.type === "table") {
  const rows = node.content ?? [];
  const rowsResult: DocxTableRow[] = [];

  for (const rowNode of rows) {
    const cells: DocxTableCell[] = [];

    for (const cellNode of rowNode.content ?? []) {
      const isHeader = cellNode.type === "tableHeader" || cellNode.attrs?.isHeader === true;
      const cellParagraphs: Paragraph[] = [];

      for (const cellContent of cellNode.content ?? []) {
        const paras = await paragraphsFromNode(
        cellContent,
        isHeader,
        isHeader ? AlignmentType.CENTER : undefined
      );
        cellParagraphs.push(...paras);
      }

cells.push(
  new DocxTableCell({
    verticalAlign: isHeader ? VerticalAlign.CENTER : undefined,
    shading: isHeader ? { fill: "E6DCCB" } : undefined,

    margins: isHeader
      ? {
          top: 200,
          bottom: 200,
          left: 120,
          right: 120,
        }
      : undefined,

    children:
      cellParagraphs.length > 0
        ? cellParagraphs
        : [
            new Paragraph({
              alignment: isHeader ? AlignmentType.CENTER : undefined,
            }),
          ],
  })
);



    }

    rowsResult.push(new DocxTableRow({ children: cells }));
  }

  blocks.push(
    new DocxTable({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: rowsResult,
    })
  );

  continue;
}



    /* ------------------ YOUTUBE EMBEDS ------------------ */
    if (node.type === "youtube" || node.type === "youtubeEmbed") {
      const embedSrc = node.attrs?.src;
      if (!embedSrc) continue;

      const vidMatch = embedSrc.match(
        /(?:embed\/|v=|youtu\.be\/)([\w-]{11})/
      );
      const videoId = vidMatch ? vidMatch[1] : null;
      const watchUrl = videoId
        ? `https://www.youtube.com/watch?v=${videoId}`
        : embedSrc;

      const placeholderPath =
        "/assets/images/articleEditor/youtube-placeholder.jpg";

      try {
        const res = await fetch(placeholderPath);
        if (!res.ok) throw new Error("placeholder fetch failed");

        const blob = await res.blob();
        const buffer = new Uint8Array(await blob.arrayBuffer());
        const dims = await getImageDimensions(blob);

        const maxWidth = 300;
        const ratio =
          dims.width > maxWidth ? maxWidth / dims.width : 1;

        blocks.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new ImageRun({
                data: buffer,
                type: "jpg",
                transformation: {
                  width: Math.round(dims.width * ratio),
                  height: Math.round(dims.height * ratio),
                },
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 240 },
            children: [
              new ExternalHyperlink({
                link: watchUrl,
                children: [
                  new TextRun({
                    text: watchUrl,
                    underline: {},
                    color: "2563EB",
                  }),
                ],
              }),
            ],
          })
        );
      } catch {
        blocks.push(new Paragraph({ children: [new TextRun(watchUrl)] }));
      }

      continue;
    }

    /* ---------- TEXT / HEADINGS / CODE ---------- */
    const para = paragraphFromNode(node);
    if (para) {
      blocks.push(para);
      continue;
    }

    /* ------------------ IMAGES ------------------ */
    if (node.type === "imageWithRemove" || node.type === "image") {
      try {
        const src = node.attrs?.src;
        if (!src) continue;

        const { buffer, type, width, height } =
          await fetchImageAsBufferAndInfo(src);

        const maxWidth = 600;
        const ratio = width > maxWidth ? maxWidth / width : 1;

        const altText = node.attrs?.alt?.trim();

        blocks.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 240 },
            children: [
              new ImageRun({
                data: buffer,
                type: type === "png" ? "png" : "jpg",
                transformation: {
                  width: Math.round(width * ratio),
                  height: Math.round(height * ratio),
                },
                altText: altText
                  ? { name: altText, description: altText }
                  : undefined,
              }),
            ],
          })
        );

        if (altText) {
          blocks.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 60, after: 180 },
              children: [
                new TextRun({
                  text: altText,
                  size: 28,
                  color: "555555",
                  font: "Inter",
                }),
              ],
            })
          );
        }
      } catch {
        /* skip image */
      }

      continue;
    }

    /* ------------------ LISTS ------------------ */
    if (node.type === "bulletList" || node.type === "orderedList") {
      for (const item of node.content ?? []) {
        const textNodes = item.content?.[0]?.content ?? [];

        blocks.push(
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

  return blocks;
}


/* -----------------------------
   Public API
----------------------------- */

// change signature to accept optional metadata
export async function exportArticleToDocx(
  body: any,
  opts?: {
    title?: string | null;
    metaDescription?: string | null;
    coverImage?: string | null;
    coverImageAlt?: string | null;
  }
) {
  if (!body?.content) {
    alert("Nothing to export 😅");
    return;
  }

  const { title, metaDescription, coverImage, coverImageAlt } = opts ?? {};

  try {
    const paragraphs = await extractParagraphs(body.content);

    // Prepare header blocks (title, description, cover image) — keep separately so we can place them above content
    const coverPageChildren: Paragraph[] = [];

    // 1) Title
    if (title) {
    coverPageChildren.push(
      new Paragraph({
        style: "ArticleTitle",
        children: [new TextRun({ text: title })],
      })
    );
  }

  // 2) Cover image
  if (coverImage) {
  const { buffer, type, width, height } =
    await fetchImageAsBufferAndInfo(coverImage);

  const maxWidth = 620;
  const ratio = width > maxWidth ? maxWidth / width : 1;

  coverPageChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 240 },
      children: [
        new ImageRun({
          data: buffer,
          type: type === "png" ? "png" : "jpg",
          transformation: {
            width: Math.round(width * ratio),
            height: Math.round(height * ratio),
          },
          altText: coverImageAlt
            ? { name: coverImageAlt, description: coverImageAlt }
            : undefined,
        }),
      ],
    })
  );
}
    // 3) Meta description (subtitle)
 if (metaDescription) {
  coverPageChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120 },
      children: [
        new TextRun({
          text: metaDescription,
          italics: true,
          size: 30,
          font: "Inter",
          color: "555555",
        }),
      ],
    })
  );
}



    // Build final children array: header blocks followed by content paragraphs
    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: "ArticleTitle",
            name: "Article Title",
            basedOn: "Normal",
            quickFormat: true,
          run: {
                font: "Cinzel Black",
                size: 56,
                bold: true,
                allCaps: true,
              },

            paragraph: {
              alignment: AlignmentType.CENTER,
              spacing: { after: 360 },
            },
          },
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
              bold: true,
            },
            paragraph: {
              spacing: { after: 200 },
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
              bold: true,
            },
            paragraph: {
              spacing: { after: 200 },
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
              spacing: { before: 200, after: 200 },
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
          id: "Hyperlink",
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
  children: coverPageChildren,
  properties: {
    verticalAlign: VerticalAlign.CENTER,
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
