// markdown.js — a small, safe Markdown renderer for model replies.
//
// Safety first: ALL text is HTML-escaped before any formatting is applied, so
// a model (or a prompt-injected web page it read) can never inject markup or
// scripts into the page. Links are only kept for http(s) URLs.
//
// Supports what chat models actually emit: paragraphs, line breaks, headings,
// bullet and numbered lists, blockquotes, fenced code blocks (also unfinished
// ones, mid-stream), `inline code`, **bold**, *italic* and [links](https://…).

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function inline(text) {
  // Pull code spans out first so nothing inside them gets formatted.
  const spans = [];
  let out = escapeHtml(text).replace(/`([^`\n]+)`/g, (_, code) => {
    spans.push(code);
    return `\u0000${spans.length - 1}\u0000`;
  });
  out = out
    .replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, "$1<em>$2</em>")
    .replace(
      /\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${spans[Number(i)]}</code>`);
}

function codeBlock(lang, lines) {
  const label = lang ? escapeHtml(lang) : "code";
  return (
    `<div class="code"><div class="code__bar"><span>${label}</span>` +
    `<button class="code__copy" type="button">Copy</button></div>` +
    `<pre><code>${escapeHtml(lines.join("\n"))}</code></pre></div>`
  );
}

export function renderMarkdown(src) {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let para = [];
  let list = null; // { type: "ul" | "ol", items: [] }
  let quote = [];

  const flushPara = () => {
    if (para.length) html.push(`<p>${para.map(inline).join("<br>")}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) {
      html.push(`<${list.type}>${list.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${list.type}>`);
    }
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) html.push(`<blockquote>${quote.map(inline).join("<br>")}</blockquote>`);
    quote = [];
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced code block: ``` up to the closing ``` (or the end, while streaming).
    const fence = line.match(/^\s*```\s*([\w+#.-]*)\s*$/);
    if (fence) {
      flushAll();
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      html.push(codeBlock(fence[1], body));
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length + 2, 5); // # → h3: keep sizes calm
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const bullet = line.match(/^\s*[-*+]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushPara();
      flushQuote();
      const type = bullet ? "ul" : "ol";
      if (list && list.type !== type) flushList();
      list ??= { type, items: [] };
      list.items.push((bullet ?? numbered)[1]);
      continue;
    }

    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      flushPara();
      flushList();
      quote.push(q[1]);
      continue;
    }

    // A continuation line of a list item (indented text under a bullet).
    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1] += ` ${line.trim()}`;
      continue;
    }

    flushList();
    flushQuote();
    para.push(line);
  }
  flushAll();
  return html.join("");
}
