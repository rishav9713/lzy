/**
 * Markdown to HTML, at build time.
 *
 * Every document on the website is Markdown from the repository, rendered
 * here while the site is built, so no Markdown parser is shipped to the
 * browser. The renderer is deliberately strict:
 *
 * - raw HTML in a document is escaped, never passed through;
 * - HTML comments are dropped, except `<!-- lzy:... -->` directives;
 * - relative links are resolved by the caller, which maps repository files to
 *   website pages and fails the build on a link to nothing.
 */
import { Marked, type Token, type Tokens } from 'marked';

import { escapeHtml, highlight, type Language } from '../src/lib/highlight';
import { createSlugger } from '../src/lib/slug';

export interface Heading {
  depth: number;
  text: string;
  id: string;
}

export type Segment = { kind: 'html'; html: string } | { kind: 'component'; name: string };

export interface SearchSection {
  id: string;
  heading: string;
  text: string;
}

export interface RenderedDocument {
  title: string;
  description: string;
  headings: Heading[];
  segments: Segment[];
  sections: SearchSection[];
}

export interface RenderOptions {
  /** Turns an href written in the document into the href the website uses. */
  resolveLink: (href: string) => string;
}

const COMPONENT = /^<!--\s*lzy:component\s+([\w-]+)\s*-->\s*$/;
const ACCORDION = /<!--\s*lzy:accordion\s*-->/;
const COMMENT = /^<!--[\s\S]*?-->\s*$/;
const MARKER = /\u0000component:([\w-]+)\u0000/g;

/** An LZY error message's first line, as the interpreter prints it. */
const ERROR_HEADER =
  /^(?:Syntax error|Name error|Type error|Value error|Lookup error|Limit reached|Input error)(?: in .+?,)?(?: on line \d+)?\.$/;

const COPY_ICON =
  '<svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarise(text: string, limit = 180): string {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const sentence = cut.lastIndexOf('. ');
  if (sentence > limit * 0.5) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:]$/, '') + '…';
}

interface CodeStyle {
  language: Language;
  label: string;
  variant: string;
}

/** Decide how a fenced block is shown, from its tag and the block before it. */
export function codeStyle(info: string, code: string, previous?: string): CodeStyle {
  const tag = (info.trim().split(/\s+/)[0] ?? '').toLowerCase();
  const looksLikeError = ERROR_HEADER.test(code.split('\n')[0] ?? '');
  switch (tag) {
    case 'lzy':
      return { language: 'lzy', label: 'LZY', variant: 'lzy' };
    case 'lzy-broken':
      return { language: 'lzy-broken', label: 'LZY · a mistake, on purpose', variant: 'broken' };
    case 'bash':
    case 'sh':
    case 'shell':
    case 'console':
      return { language: 'shell', label: 'Terminal', variant: 'shell' };
    case 'powershell':
    case 'ps1':
    case 'pwsh':
      return { language: 'shell', label: 'PowerShell', variant: 'shell' };
    case 'ebnf':
      return { language: 'ebnf', label: 'EBNF', variant: 'ebnf' };
    case 'python':
      return { language: 'text', label: 'Python', variant: 'text' };
    case 'toml':
      return { language: 'text', label: 'TOML', variant: 'text' };
    case 'output':
    case 'text':
    case '':
      if (previous === 'lzy-broken' || looksLikeError) {
        return { language: 'error', label: 'Error message', variant: 'error' };
      }
      if (previous === 'lzy' || tag === 'output') {
        return { language: 'text', label: 'Output', variant: 'output' };
      }
      return { language: 'text', label: 'Text', variant: 'text' };
    default:
      return { language: 'text', label: tag.toUpperCase(), variant: 'text' };
  }
}

export function codeBlockHtml(code: string, style: CodeStyle): string {
  const body = highlight(code.replace(/\n$/, ''), style.language);
  return (
    `<figure class="code-block code-block--${style.variant}">` +
    `<figcaption class="code-block__bar"><span class="code-block__label">${escapeHtml(style.label)}</span>` +
    `<button type="button" class="copy-button" data-copy aria-label="Copy ${escapeHtml(style.label)}">${COPY_ICON}<span>Copy</span></button></figcaption>` +
    `<pre class="code-block__pre" tabindex="0" aria-label="${escapeHtml(style.label)}"><code>${body}</code></pre>` +
    `</figure>`
  );
}

export function renderMarkdown(source: string, options: RenderOptions): RenderedDocument {
  const accordion = ACCORDION.test(source);
  const nextId = createSlugger();
  const headings: Heading[] = [];
  const sections: SearchSection[] = [];

  let previousCode: string | undefined;
  let tableCount = 0;

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const id = nextId(text);
        const level = Math.min(Math.max(depth, 2), 6);
        const label = plainText(inner);
        headings.push({ depth: level, text: label, id });
        return (
          `<h${level} id="${id}">${inner}` +
          `<a class="heading-anchor" href="#${id}" aria-label="Link to this section: ${escapeHtml(label)}">#</a>` +
          `</h${level}>`
        );
      },
      code({ text, lang }: Tokens.Code) {
        return codeBlockHtml(text, codeStyle(lang ?? '', text, previousCode));
      },
      html({ text }: Tokens.HTML | Tokens.Tag) {
        const component = COMPONENT.exec(text.trim());
        if (component) return `\u0000component:${component[1]}\u0000`;
        if (COMMENT.test(text.trim())) return '';
        return escapeHtml(text);
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        const target = options.resolveLink(href);
        const external = /^(?:https?:|mailto:)/.test(target);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const rel = external ? ' rel="noopener noreferrer" class="external"' : '';
        return `<a href="${escapeHtml(target)}"${titleAttr}${rel}>${inner}</a>`;
      },
      image({ href, title, text }: Tokens.Image) {
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(options.resolveLink(href))}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
      },
      table(token: Tokens.Table) {
        const cell = (item: Tokens.TableCell, tag: 'th' | 'td') => {
          const align = item.align ? ` style="text-align:${item.align}"` : '';
          const scope = tag === 'th' ? ' scope="col"' : '';
          return `<${tag}${scope}${align}>${this.parser.parseInline(item.tokens)}</${tag}>`;
        };
        const headers = token.header.map((item) => plainText(this.parser.parseInline(item.tokens)));
        // A table with no header text (| | |) is shown without a header row.
        const head = headers.some(Boolean)
          ? `<thead><tr>${token.header.map((item) => cell(item, 'th')).join('')}</tr></thead>`
          : '';
        const rows = token.rows
          .map((row) => `<tr>${row.map((item) => cell(item, 'td')).join('')}</tr>`)
          .join('');
        tableCount += 1;
        const label = headers.filter(Boolean).join(', ');
        const name = `Table ${tableCount}${label ? `: ${label}` : ''}`;
        return (
          `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(name)}">` +
          `<table>${head}<tbody>${rows}</tbody></table></div>`
        );
      },
    },
  });

  const tokens = marked.lexer(source);
  const links = tokens.links;
  const render = (token: Token): string => {
    const single = [token] as Token[] & { links: typeof links };
    single.links = links;
    return marked.parser(single);
  };

  let title = '';
  let description = '';
  let html = '';
  let detailsOpen = false;
  let current: SearchSection = { id: '', heading: '', text: '' };

  const closeDetails = () => {
    if (detailsOpen) html += '</div></details>';
    detailsOpen = false;
  };

  for (const token of tokens) {
    if (token.type === 'heading' && token.depth === 1 && !title) {
      title = plainText(marked.parseInline(token.text) as string);
      current.heading = title;
      continue;
    }

    if (token.type === 'space') {
      html += render(token);
      continue;
    }

    if (token.type === 'heading') {
      closeDetails();
      if (current.text) sections.push(current);
      const rendered = render(token);
      const heading = headings[headings.length - 1]!;
      current = { id: heading.id, heading: heading.text, text: '' };
      if (accordion && heading.depth === 3) {
        html += `<details class="faq-item" data-anchor="${heading.id}"><summary>${rendered}</summary><div class="faq-item__body">`;
        detailsOpen = true;
      } else {
        html += rendered;
      }
      previousCode = undefined;
      continue;
    }

    const rendered = render(token);
    html += rendered;

    if (token.type === 'code') {
      previousCode = (token.lang ?? '').trim().toLowerCase();
      current.text += ' ' + token.text.slice(0, 400);
    } else {
      previousCode = undefined;
      const text = plainText(rendered);
      current.text += ' ' + text;
      if (!description && title && token.type === 'paragraph') description = summarise(text);
    }
  }
  closeDetails();
  if (current.text) sections.push(current);

  const segments: Segment[] = [];
  let last = 0;
  for (const match of html.matchAll(MARKER)) {
    const before = html.slice(last, match.index);
    if (before.trim()) segments.push({ kind: 'html', html: before });
    segments.push({ kind: 'component', name: match[1]! });
    last = match.index + match[0].length;
  }
  const rest = html.slice(last);
  if (rest.trim()) segments.push({ kind: 'html', html: rest });

  return {
    title,
    description,
    headings: accordion ? headings.filter((heading) => heading.depth === 2) : headings,
    segments,
    sections: sections.map((section) => ({
      ...section,
      text: section.text.replace(/\s+/g, ' ').trim().slice(0, 1600),
    })),
  };
}

/**
 * Render Markdown fragments (a list item, a sentence) with the same link and
 * HTML rules as whole documents. Used for data pulled out of ROADMAP.md and
 * CHANGELOG.md.
 */
export function createFragmentRenderer(options: RenderOptions) {
  const marked = new Marked({
    gfm: true,
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return COMMENT.test(text.trim()) ? '' : escapeHtml(text);
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        const target = options.resolveLink(href);
        const external = /^(?:https?:|mailto:)/.test(target);
        const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
        const rel = external ? ' rel="noopener noreferrer" class="external"' : '';
        return `<a href="${escapeHtml(target)}"${titleAttr}${rel}>${inner}</a>`;
      },
      code({ text, lang }: Tokens.Code) {
        return codeBlockHtml(text, codeStyle(lang ?? '', text));
      },
    },
  });
  return {
    inline: (markdown: string) => marked.parseInline(markdown) as string,
    block: (markdown: string) => marked.parse(markdown) as string,
    lexer: (markdown: string) => marked.lexer(markdown),
  };
}

/** A plain-text document, such as LICENSE, shown exactly as written. */
export function renderPlainText(source: string, title: string, description: string) {
  return {
    title,
    description,
    headings: [] as Heading[],
    segments: [
      { kind: 'html', html: `<pre class="plain-document">${escapeHtml(source)}</pre>` },
    ] as Segment[],
    sections: [{ id: '', heading: title, text: source.replace(/\s+/g, ' ').slice(0, 1600) }],
  };
}

/** A grammar file, shown as one highlighted block. */
export function renderGrammar(source: string, title: string, description: string) {
  return {
    title,
    description,
    headings: [] as Heading[],
    segments: [
      {
        kind: 'html',
        html: codeBlockHtml(source, { language: 'ebnf', label: 'EBNF', variant: 'ebnf' }),
      },
    ] as Segment[],
    sections: [{ id: '', heading: title, text: plainText(source).slice(0, 1600) }],
  };
}
