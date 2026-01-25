type TipTapNode = {
  type?: string;
  text?: string;
  content?: TipTapNode[];
};

export function extractExcerptFromBody(
  body: any,
  wordLimit = 90
): string {
  if (!body?.content || !Array.isArray(body.content)) return "";

  const words: string[] = [];

  const walk = (nodes: TipTapNode[]) => {
    for (const node of nodes) {
      if (words.length >= wordLimit) break;

      if (node.type === "text" && node.text) {
        const nodeWords = node.text.split(/\s+/);
        for (const w of nodeWords) {
          if (words.length < wordLimit) {
            words.push(w);
          }
        }
      }

      if (node.content) {
        walk(node.content);
      }
    }
  };

  walk(body.content);

  return words.join(" ") + (words.length === wordLimit ? "…" : "");
}
