/**
 * Page titles, descriptions and social-card tags.
 *
 * During prerendering each page reports its head to a collector, and the
 * prerender script writes the tags into the static HTML, so search engines
 * and link previews see them without running JavaScript. In the browser the
 * same hook updates the document when the reader navigates.
 */
import { createContext, useContext, useEffect } from 'react';

import { absoluteUrl, site } from '@/data/site';

export interface PageHead {
  title: string;
  description: string;
  /** The route, with a trailing slash. Used for the canonical address. */
  route: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

export class HeadCollector {
  head: PageHead | null = null;
  set(head: PageHead) {
    this.head = head;
  }
}

export const HeadContext = createContext<HeadCollector | null>(null);

export function documentTitle(head: PageHead): string {
  return head.route === '/' ? `${site.fullName} — ${site.tagline}` : `${head.title} — LZY`;
}

/** Every tag a page needs in its <head>, as [attribute, key, value] triples. */
function metaFor(head: PageHead) {
  const title = documentTitle(head);
  const url = absoluteUrl(head.route);
  const image = socialImageUrl();
  return {
    title,
    // A page that should not be indexed (the 404 page) has no address of its own.
    canonical: head.noindex ? null : url,
    meta: [
      ['name', 'description', head.description],
      ['name', 'robots', head.noindex ? 'noindex, follow' : 'index, follow'],
      ['property', 'og:type', head.type ?? 'website'],
      ['property', 'og:site_name', site.fullName],
      ['property', 'og:title', title],
      ['property', 'og:description', head.description],
      ...(head.noindex ? [] : [['property', 'og:url', url]]),
      ['property', 'og:image', image],
      ['property', 'og:image:width', '1200'],
      ['property', 'og:image:height', '630'],
      ['property', 'og:image:alt', `${site.fullName}: ${site.tagline}`],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', head.description],
      ['name', 'twitter:image', image],
    ] as Array<[string, string, string]>,
  };
}

/** The social card lives in public/, so its address is the site address plus its path. */
export function socialImageUrl(): string {
  return `${site.url}/assets/social/og-image.jpg`;
}

function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** The head as HTML, for the prerender script. */
export function headTags(head: PageHead): string {
  const { title, canonical, meta } = metaFor(head);
  return [
    `<title>${escapeAttribute(title)}</title>`,
    ...(canonical ? [`<link rel="canonical" href="${escapeAttribute(canonical)}" />`] : []),
    ...meta.map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`,
    ),
  ].join('\n    ');
}

function applyHead(head: PageHead) {
  const { title, canonical, meta } = metaFor(head);
  document.title = title;

  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    link?.remove();
  } else {
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.append(link);
    }
    link.href = canonical;
  }

  for (const [attribute, key, value] of meta) {
    let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, key);
      document.head.append(tag);
    }
    tag.content = value;
  }
}

export function usePageHead(head: PageHead) {
  const collector = useContext(HeadContext);
  collector?.set(head);

  const { title, description, route, type, noindex } = head;
  useEffect(() => {
    applyHead({ title, description, route, type, noindex });
  }, [title, description, route, type, noindex]);
}
