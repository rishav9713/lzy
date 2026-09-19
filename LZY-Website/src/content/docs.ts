/**
 * Loading rendered documents.
 *
 * Each document is its own small module, fetched when its page is opened.
 * The promise for each is kept, so React's `use()` sees the same promise on
 * every render: during prerendering that lets React wait for the text, and in
 * the browser it lets hydration wait for it without flashing a loading state.
 */
import { loaders, pages } from 'virtual:lzy-pages';

import { track } from '@/lib/preload';

import type { DocModule, PageMeta } from './types';

const loading = new Map<string, Promise<DocModule>>();

export const documentPages: PageMeta[] = pages;

const byRoute = new Map(pages.map((page) => [page.route, page]));

export function pageMeta(route: string): PageMeta | undefined {
  return byRoute.get(route);
}

export function loadDocument(route: string): Promise<DocModule> {
  let promise = loading.get(route);
  if (!promise) {
    const loader = loaders[route];
    if (!loader) return Promise.reject(new Error(`No document for ${route}`));
    promise = track(loader().then((module) => module.default));
    loading.set(route, promise);
  }
  return promise;
}
