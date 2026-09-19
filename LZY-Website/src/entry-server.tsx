/**
 * Rendering pages to HTML at build time. Used only by scripts/prerender.mjs.
 */
import { StrictMode } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';

import { documentPages } from '@/content/docs';
import { HeadCollector, HeadContext, headTags } from '@/lib/head';

import { App } from './App';
import { allRoutes, preloadRoute } from './routes';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  return Buffer.concat(chunks).toString('utf8');
}

export interface Rendered {
  html: string;
  head: string;
  /** The page asked not to be indexed (the 404 page). */
  noindex: boolean;
}

/** Render one route, e.g. "/docs/cli/", to the HTML that goes inside #root. */
export async function render(route: string): Promise<Rendered> {
  // Load the page first, so nothing suspends and the HTML is complete.
  await preloadRoute(route);
  const collector = new HeadCollector();
  const location = basename === '/' ? route : basename + route;
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <HeadContext.Provider value={collector}>
        <StaticRouter location={location} basename={basename}>
          <App />
        </StaticRouter>
      </HeadContext.Provider>
    </StrictMode>,
    {
      // React moves a large Suspense boundary out of the main HTML, to be
      // revealed by a script, so a streaming server can send the top of the
      // page sooner. A static file gains nothing from that, and would show an
      // empty page without JavaScript, so every boundary stays inline.
      progressiveChunkSize: Number.POSITIVE_INFINITY,
    },
  );
  const html = await streamToString(prelude);
  if (!collector.head) throw new Error(`${route} did not set a title and description`);
  return { html, head: headTags(collector.head), noindex: !!collector.head.noindex };
}

export const siteUrl: string = __SITE_URL__;
export const repository: string = __REPOSITORY__;
export const base: string = import.meta.env.BASE_URL;

export { allRoutes, documentPages };
