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
import { loadImageAsBuffer } from "./loadImageAsBuffer";

type TipTapNode = any;

/* -----------------------------
   Helpers
----------------------------- */
function generateArticleFileName() {
  const now = new Date();

  const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-"); // HH-MM-SS

  return `article-${date}-${time}`;
}


function textRunsFromNode(node: TipTapNode, isHeading: boolean = false): (TextRun | ExternalHyperlink)[] {
  if (!node.text) return [];

  const marks = node.marks || [];

  const bold = marks.some((m: any) => m.type === "bold") || isHeading;
  const italic = marks.some((m: any) => m.type === "italic");
  const underline = marks.some((m: any) => m.type === "underline");
  const link = marks.find((m: any) => m.type === "link");

  const run = new TextRun({
    text: node.text,
    bold,
    italics: italic,
    underline: underline ? {} : undefined,
  });

  if (link?.attrs?.href) {
    return [
      new ExternalHyperlink({
        link: link.attrs.href,
        children: [
          new TextRun({
            text: node.text,
            style: "HyperlinkStyle",
            bold,
            italics: italic,
          }),
        ],
      }),
    ];
  }

  return [run];
}

function paragraphFromNode(node: TipTapNode): Paragraph | null {
  switch (node.type) {
    case "paragraph":
      return new Paragraph({
        style: "NormalParagraph",
        children: node.content?.flatMap(textRunsFromNode) || [],
      });

    case "heading":
      const isHeading1 = node.attrs.level === 1;
      const isHeading2 = node.attrs.level === 2;
      return new Paragraph({
        style: isHeading1 ? "Heading1" : isHeading2 ? "Heading2" : "NormalParagraph",
        children: node.content?.flatMap((child: any) => textRunsFromNode(child, isHeading1 || isHeading2)) || [],
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

async function extractParagraphs(nodes: TipTapNode[]): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  for (const node of nodes) {
    /* ---------- TEXT / HEADINGS / CODE ---------- */
    const para = paragraphFromNode(node);
    if (para) {
      paragraphs.push(para);
      continue;
    }

    /* ------------------ IMAGES ------------------ */
    if (node.type === "imageWithRemove") {
      try {
        const buffer = await loadImageAsBuffer(node.attrs.src);

        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                type: "jpg",
                transformation: {
                  width: 500,
                  height: 300,
                },
              }),
            ],
          })
        );
      } catch {
        console.warn("Skipping image:", node.attrs.src);
      }
      continue;
    }

    /* ------------------ LISTS ------------------ */
    if (node.type === "bulletList" || node.type === "orderedList") {
      for (const item of node.content || []) {
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
            size: 36, // 18px = ~13.5pt = 27 half-points, but using 36 for better visibility
          },
          paragraph: {
            spacing: { after: 200 }, // Removed the line spacing property for normal spacing
          },
        },
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          quickFormat: true,
          run: { 
            font: "Inter", 
            size: 44, // 22px = ~16.5pt = 33 half-points
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
            size: 40, // 20px = ~15pt = 30 half-points
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
            size: 36, // Match normal text size
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
            size: 36, // Match normal text size
          },
          paragraph: {
            // No line spacing specified for normal spacing
          },
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
              top: 1440,    // 1 inch
              right: 1440,  // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
            },
          },
        },
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${generateArticleFileName()}.docx`);
}