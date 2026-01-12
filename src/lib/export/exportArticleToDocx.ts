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

const DOCX_DEBUG = true;

function log(scope: string, message: string, data?: any) {
  if (DOCX_DEBUG) {
    console.log(`[DOCX][${scope}] ${message}`, data ? data : '');
  }
}

function warn(scope: string, message: string, data?: any) {
  if (DOCX_DEBUG) {
    console.warn(`[DOCX][${scope}] ${message}`, data ? data : '');
  }
}

function error(scope: string, message: string, data?: any) {
  if (DOCX_DEBUG) {
    console.error(`[DOCX][${scope}] ${message}`, data ? data : '');
  }
}

function proxiedImageUrl(originalUrl: string) {
  return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
}


function generateArticleFileName() {
  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  
  log('Filename', `Generated filename: article-${date}-${time}`);
  return `article-${date}-${time}`;
}

function normalizeDocxColor(color?: string): string | undefined {
  if (!color) {
    log('Color', 'No color provided');
    return undefined;
  }

  // Already hex
  if (color.startsWith("#")) {
    const hexColor = color.replace("#", "").toUpperCase();
    log('Color', `Converted #${color} to ${hexColor}`);
    return hexColor;
  }

  // rgb(...) or RGB(...)
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const hexColor = [r, g, b]
      .map(v => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    
    log('Color', `Converted rgb(${r},${g},${b}) to ${hexColor}`);
    return hexColor;
  }

  log('Color', `Unsupported color format: ${color}`);
  return undefined;
}

function textRunsFromNode(
  node: TipTapNode,
  isHeading: boolean = false
): (TextRun | ExternalHyperlink)[] {
  if (!node.text) {
    log('TextRun', 'Empty text node');
    return [];
  }

  const marks = node.marks || [];
  log('TextRun', `Processing text: "${node.text.substring(0, 50)}${node.text.length > 50 ? '...' : ''}"`, {
    marks: marks.map((m: any) => m.type),
    isHeading
  });

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

  log('TextRun', 'Run properties:', {
    length: node.text.length,
    bold: runProps.bold,
    italic: runProps.italics,
    underline: runProps.underline,
    color: runProps.color
  });

  // ───────────────────────────────────────────
  // Hyperlink handling
  // ───────────────────────────────────────────
  if (linkMark?.attrs?.href) {
    log('TextRun', 'Creating hyperlink', {
      href: linkMark.attrs.href,
      textLength: node.text.length
    });
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
  log('Paragraph', `Processing ${node.type} node`);
  
  switch (node.type) {
    case "paragraph":
      const paragraphChildren = node.content?.flatMap(textRunsFromNode) || [];
      log('Paragraph', `Created paragraph with ${paragraphChildren.length} children`);
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
      
      log('Paragraph', `Created heading level ${node.attrs.level}`, {
        style: isHeading1 ? 'Heading1' : isHeading2 ? 'Heading2' : 'NormalParagraph',
        childrenCount: headingChildren.length
      });
      
      return new Paragraph({
        style: isHeading1 ? "Heading1" : isHeading2 ? "Heading2" : "NormalParagraph",
        children: headingChildren,
      });

    case "codeBlock":
      const codeText = node.content?.[0]?.text || "";
      log('Paragraph', `Created code block`, {
        length: codeText.length,
        preview: codeText.substring(0, 50) + (codeText.length > 50 ? '...' : '')
      });
      
      return new Paragraph({
        style: "CodeBlock",
        children: [
          new TextRun({
            text: codeText,
          }),
        ],
      });

    default:
      log('Paragraph', `No paragraph converter for node type: ${node.type}`);
      return null;
  }
}

/* -----------------------------
   Image helpers
----------------------------- */
async function fetchImageAsBufferAndInfo(
  url: string
): Promise<{ buffer: Uint8Array; type: "png" | "jpeg"; width: number; height: number }> {
  
  log('Image', `Fetching image: ${url.substring(0, 100)}${url.length > 100 ? '...' : ''}`);
  
  // Support data URLs
  if (url.startsWith("data:")) {
    const match = url.match(/^data:(image\/(png|jpeg|jpg|gif|webp));base64,(.*)$/);
    if (!match) {
      error('Image', 'Unsupported data URL image format');
      throw new Error("Unsupported data URL image");
    }

    const mime = match[1];
    const base64 = match[3];
    log('Image', 'Processing data URL', { mime, base64Length: base64.length });

    const binary = atob(base64);
    const len = binary.length;
    const uint8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) uint8[i] = binary.charCodeAt(i);

    const blob = new Blob([uint8], { type: mime });
    const dims = await getImageDimensions(blob);
    const type: "png" | "jpeg" = mime.includes("png") ? "png" : "jpeg";
    
    log('Image', 'Data URL image processed', {
      type,
      width: dims.width,
      height: dims.height,
      bufferSize: uint8.byteLength
    });
    
    return { buffer: uint8, type, width: dims.width, height: dims.height };
  }

  // Remote URL
  log('Image', `Fetching remote image`);
  const res = await fetch(proxiedImageUrl(url));
  if (!res.ok) {
    error('Image', `Failed to fetch image: ${res.status} ${res.statusText}`);
    throw new Error(`Failed to fetch image: ${res.status}`);
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const blob = await res.blob();

  log('Image', 'Fetch response', {
    ok: res.ok,
    status: res.status,
    contentType,
    blobSize: blob.size,
    blobType: blob.type
  });

  // If PNG or JPEG, use directly
  if (contentType.includes("png") || contentType.includes("jpeg") || contentType.includes("jpg")) {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const dims = await getImageDimensions(blob);
    const type: "png" | "jpeg" = contentType.includes("png") ? "png" : "jpeg";
    
    log('Image', 'Using direct image format', {
      type,
      width: dims.width,
      height: dims.height,
      bufferSize: uint8.byteLength
    });
    
    return { buffer: uint8, type, width: dims.width, height: dims.height };
  }

  // Convert other formats (webp/gif) to PNG
  log('Image', 'Converting to PNG', { originalType: blob.type });
  const pngBlob = await convertBlobToPng(blob);
  const arrayBuffer = await pngBlob.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const dims = await getImageDimensions(pngBlob);

  log('Image', 'PNG conversion complete', {
    originalSize: blob.size,
    pngSize: pngBlob.size,
    width: dims.width,
    height: dims.height,
    bufferSize: uint8.byteLength
  });

  return { buffer: uint8, type: "png", width: dims.width, height: dims.height };
}

function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  log('Image', 'Getting image dimensions');
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      
      log('Image', 'Dimensions retrieved', { width, height });
      resolve({ width, height });
    };
    
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      error('Image', 'Failed to get image dimensions', e);
      reject(new Error("Failed to get image dimensions"));
    };
    
    img.src = url;
  });
}

function convertBlobToPng(blob: Blob): Promise<Blob> {
  log('Image', 'Starting PNG conversion');
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
          
          log('Image', 'Canvas created for conversion', {
            width: canvas.width,
            height: canvas.height
          });
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            error('Image', 'Canvas context not available');
            throw new Error('Canvas not supported');
          }
          
          ctx.drawImage(img, 0, 0);
          
          canvas.toBlob((outBlob) => {
            URL.revokeObjectURL(url);
            
            if (!outBlob) {
              error('Image', 'PNG conversion returned null blob');
              reject(new Error('Conversion to PNG failed'));
              return;
            }
            
            log('Image', 'PNG conversion successful', {
              pngSize: outBlob.size,
              pngType: outBlob.type
            });
            
            resolve(outBlob);
          }, 'image/png');
        } catch (err) {
          URL.revokeObjectURL(url);
          error('Image', 'Canvas conversion error', err);
          reject(err);
        }
      };
      
      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        error('Image', 'Image failed to load for conversion', e);
        reject(new Error('Failed to load image for conversion'));
      };
      
      img.src = url;
    } catch (err) {
      error('Image', 'PNG conversion setup error', err);
      reject(err);
    }
  });
}

async function extractParagraphs(nodes: TipTapNode[]): Promise<Paragraph[]> {
  log('Extract', `Starting paragraph extraction from ${nodes.length} nodes`);
  const paragraphs: Paragraph[] = [];
  let imageCount = 0;
  let textCount = 0;
  let listCount = 0;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    log('Extract', `Processing node ${i + 1}/${nodes.length}:`, {
      type: node.type,
      attrs: Object.keys(node.attrs || {})
    });

    /* ---------- TEXT / HEADINGS / CODE ---------- */
    const para = paragraphFromNode(node);
    if (para) {
      paragraphs.push(para);
      textCount++;
      log('Extract', `Added ${node.type} paragraph`, { totalParagraphs: paragraphs.length });
      continue;
    }

    /* ------------------ IMAGES ------------------ */
    if (node.type === "imageWithRemove" || node.type === 'image') {
      imageCount++;
      try {
        const src = node.attrs?.src;
        if (!src) {
          warn('Extract', 'Image node missing src attribute');
          continue;
        }

        log('Extract', `Processing image ${imageCount}`, { src: src.substring(0, 100) });
        const { buffer, type, width, height } = await fetchImageAsBufferAndInfo(src);

        // Scale width to max 600 while keeping aspect ratio
        const maxWidth = 300;
        let outWidth = width;
        let outHeight = height;
        if (width > maxWidth) {
          const ratio = maxWidth / width;
          outWidth = Math.round(width * ratio);
          outHeight = Math.round(height * ratio);
          log('Extract', `Scaled image from ${width}x${height} to ${outWidth}x${outHeight}`);
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

        
        log('Extract', `Image added successfully`, {
          dimensions: `${outWidth}x${outHeight}`,
          type,
          bufferSize: buffer.byteLength
        });
      } catch (err) {
        warn('Extract', `Skipping image due to error:`, err);
      }
      continue;
    }

    /* ------------------ LISTS ------------------ */
    if (node.type === "bulletList" || node.type === "orderedList") {
      const listItems = node.content || [];
      listCount++;
      
      log('Extract', `Processing ${node.type}`, {
        itemCount: listItems.length,
        listType: node.type
      });
      
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
      
      log('Extract', `Added list with ${listItems.length} items`);
    }
  }

  log('Extract', 'Paragraph extraction complete', {
    totalParagraphs: paragraphs.length,
    images: imageCount,
    textNodes: textCount,
    lists: listCount,
    unhandledTypes: nodes.length - (imageCount + textCount + listCount)
  });
  
  return paragraphs;
}

/* -----------------------------
   Public API
----------------------------- */

export async function exportArticleToDocx(body: any) {
  const startTime = performance.now();
  log('Export', 'Starting DOCX export');
  
  if (!body?.content) {
    error('Export', 'No content to export');
    alert("Nothing to export 😅");
    return;
  }

  log('Export', 'Body structure', {
    hasContent: !!body.content,
    contentLength: body.content?.length,
    bodyKeys: Object.keys(body)
  });

  try {
    const paragraphs = await extractParagraphs(body.content);
    
    log('Export', 'Creating document structure', {
      paragraphCount: paragraphs.length,
      styles: 5,
      numbering: 2
    });
    
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

    log('Export', 'Generating blob');
    const blob = await Packer.toBlob(doc);
    
    const fileName = `${generateArticleFileName()}.docx`;
    log('Export', 'Saving file', {
      fileName,
      blobSize: blob.size,
      timeElapsed: `${(performance.now() - startTime).toFixed(2)}ms`
    });
    
    saveAs(blob, fileName);
    
    log('Export', 'Export completed successfully');
  } catch (err) {
    error('Export', 'Export failed with error:', err);
    throw err;
  }
}