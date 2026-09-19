/**
 * Search, entirely in the browser.
 *
 * The index is built from the same content the pages show: every document
 * split at its headings, every example, every built-in function, and the
 * pages written in React. It is loaded the first time search is opened, so
 * it costs nothing for a reader who never searches.
 */
import lzy from '@/data/generated/lzy.json';
import { slug } from '@/lib/slug';

export type SearchKind =
  'Guide' | 'Reference' | 'Example' | 'Built-in' | 'Page' | 'Course' | 'Project';

export interface SearchEntry {
  route: string;
  anchor: string;
  title: string;
  section: string;
  text: string;
  kind: SearchKind;
}

export interface SearchResult extends SearchEntry {
  score: number;
  snippet: string;
}

function kindForRoute(route: string): SearchKind {
  if (route.startsWith('/learn/')) return 'Course';
  if (
    [
      '/docs/stdlib/',
      '/docs/keywords/',
      '/docs/specification/',
      '/docs/grammar/',
      '/language/',
    ].includes(route) ||
    route.startsWith('/docs/cli/') ||
    route.startsWith('/docs/limits/')
  ) {
    return 'Reference';
  }
  if (route.startsWith('/docs/') || route === '/getting-started/' || route === '/install/') {
    return 'Guide';
  }
  if (
    route.startsWith('/releases/') ||
    ['/changelog/', '/security/', '/license/', '/code-of-conduct/', '/privacy/'].includes(route)
  ) {
    return 'Project';
  }
  return 'Page';
}

export interface StaticPage {
  route: string;
  title: string;
  text: string;
}

let cached: Promise<SearchEntry[]> | null = null;

export function loadIndex(): Promise<SearchEntry[]> {
  cached ??= (async () => {
    const [{ default: documents }, { default: examples }, { staticSearchPages }] =
      await Promise.all([
        import('virtual:lzy-search'),
        import('@/data/generated/examples.json'),
        import('@/content/search-pages'),
      ]);

    const entries: SearchEntry[] = [];

    for (const document of documents) {
      for (const section of document.sections) {
        entries.push({
          route: document.route,
          anchor: section.id,
          title: document.title,
          section: section.id ? section.heading : '',
          text: section.text,
          kind: kindForRoute(document.route),
        });
      }
    }

    for (const example of examples) {
      entries.push({
        route: `/examples/${example.slug}/`,
        anchor: '',
        title: exampleTitle(example.slug),
        section: example.category,
        text: `${example.description.join(' ')} ${example.source}`,
        kind: 'Example',
      });
    }

    for (const builtin of lzy.builtins) {
      entries.push({
        route: '/docs/stdlib/',
        anchor: slug(builtin.name),
        title: `${builtin.name}()`,
        section: builtin.category,
        text: builtin.summary,
        kind: 'Built-in',
      });
    }

    for (const page of staticSearchPages()) {
      entries.push({ ...page, anchor: '', section: '', kind: 'Page' });
    }

    return entries;
  })();
  return cached;
}

const TITLE_OVERRIDES: Record<string, string> = {
  fizzbuzz: 'FizzBuzz',
  'ioc-extract': 'IOC extractor',
  'lists-and-maps': 'Lists and maps',
};

/** "coin-change" -> "Coin change", with a few names that need their capitals. */
export function exampleTitle(slugText: string): string {
  const override = TITLE_OVERRIDES[slugText];
  if (override) return override;
  const words = slugText.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function terms(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^\p{L}\p{N}_.]+/u)
    .map((term) => term.replace(/^\.+|\.+$/g, ''))
    .filter(Boolean);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A short piece of text around the first match, for the result list. */
function snippetFor(text: string, words: string[]): string {
  const lower = text.toLowerCase();
  let at = -1;
  for (const word of words) {
    const found = lower.indexOf(word);
    if (found !== -1 && (at === -1 || found < at)) at = found;
  }
  if (at === -1) return text.slice(0, 140);
  const start = Math.max(0, at - 50);
  const end = Math.min(text.length, at + 110);
  return (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
}

/**
 * Every word in the query must appear somewhere in an entry. Matches in the
 * title count most, then the section heading, then the text; whole words
 * beat prefixes.
 */
export function search(index: SearchEntry[], query: string, limit = 20): SearchResult[] {
  const words = terms(query);
  if (!words.length) return [];

  const results: SearchResult[] = [];
  for (const entry of index) {
    const title = entry.title.toLowerCase();
    const section = entry.section.toLowerCase();
    const text = entry.text.toLowerCase();
    let score = 0;
    let matchedAll = true;

    for (const word of words) {
      const whole = new RegExp(
        `(^|[^\\p{L}\\p{N}_])${escapeRegExp(word)}($|[^\\p{L}\\p{N}_])`,
        'u',
      );
      let wordScore = 0;
      if (title === word || title === `${word}()`) wordScore += 60;
      if (whole.test(title)) wordScore += 24;
      else if (title.includes(word)) wordScore += 12;
      if (whole.test(section)) wordScore += 14;
      else if (section.includes(word)) wordScore += 7;
      if (whole.test(text)) wordScore += 4;
      else if (text.includes(word)) wordScore += 2;
      if (wordScore === 0) {
        matchedAll = false;
        break;
      }
      score += wordScore;
    }
    if (!matchedAll) continue;
    if (entry.kind === 'Built-in' || entry.kind === 'Reference') score += 1;
    if (!entry.anchor && entry.kind !== 'Example') score += 2;

    results.push({ ...entry, score, snippet: snippetFor(entry.text, words) });
  }

  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  // One result per section is plenty; drop exact duplicates.
  const seen = new Set<string>();
  return results
    .filter((result) => {
      const key = `${result.route}#${result.anchor}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

/** Split text around the query words, so they can be highlighted. */
export function markMatches(text: string, query: string): Array<{ text: string; match: boolean }> {
  const words = terms(query).filter((word) => word.length > 1);
  if (!words.length) return [{ text, match: false }];
  const pattern = new RegExp(`(${words.map(escapeRegExp).join('|')})`, 'gi');
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part) => ({ text: part, match: words.includes(part.toLowerCase()) }));
}
