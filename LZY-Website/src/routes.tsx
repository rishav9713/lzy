/**
 * Every page on the site.
 *
 * Pages written in React are listed here; pages rendered from documents come
 * from the content registry. Each page is its own chunk, loaded when needed.
 * The prerender script builds one HTML file for every path `allRoutes()`
 * returns, and a test checks that each of them renders.
 */
import { documentPages, loadDocument, pageMeta } from '@/content/docs';
import examples from '@/data/generated/examples.json';
import { preloadable } from '@/lib/preload';

export const staticPages = [
  { path: '/', Component: preloadable(() => import('./pages/Home')) },
  { path: '/docs/', Component: preloadable(() => import('./pages/DocsIndex')) },
  { path: '/download/', Component: preloadable(() => import('./pages/Download')) },
  { path: '/examples/', Component: preloadable(() => import('./pages/Examples')) },
  { path: '/playground/', Component: preloadable(() => import('./pages/Playground')) },
  { path: '/use-cases/', Component: preloadable(() => import('./pages/UseCases')) },
  { path: '/community/', Component: preloadable(() => import('./pages/Community')) },
  { path: '/roadmap/', Component: preloadable(() => import('./pages/Roadmap')) },
  { path: '/releases/', Component: preloadable(() => import('./pages/Releases')) },
  { path: '/search/', Component: preloadable(() => import('./pages/SearchPage')) },
  { path: '/sitemap/', Component: preloadable(() => import('./pages/Sitemap')) },
];

export const ExamplePage = preloadable(() => import('./pages/ExamplePage'));
export const DocPage = preloadable<{ route: string }>(() => import('./pages/DocPage'));
export const NotFound = preloadable(() => import('./pages/NotFound'));

export const exampleRoutes = examples.map((example) => `/examples/${example.slug}/`);

/** Every path that gets its own HTML file. */
export function allRoutes(): string[] {
  return [
    ...staticPages.map((page) => page.path),
    ...documentPages.map((page) => page.route),
    ...exampleRoutes,
  ];
}

/**
 * Load everything the page at `pathname` needs to render without waiting:
 * its code and, for a document page, its text. Unknown paths load the 404
 * page.
 */
export async function preloadRoute(pathname: string): Promise<void> {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const page = staticPages.find((candidate) => candidate.path === path);
  if (page) {
    await page.Component.preload();
    return;
  }
  if (pageMeta(path)) {
    await Promise.all([DocPage.preload(), loadDocument(path)]);
    return;
  }
  if (exampleRoutes.includes(path)) {
    await ExamplePage.preload();
    return;
  }
  await NotFound.preload();
}
