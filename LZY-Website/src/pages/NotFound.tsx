import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import { Mascot } from '@/components/Logo';
import { useSearch } from '@/components/search/SearchContext';
import { Button, ButtonLink } from '@/components/ui/Button';
import { usePageHead } from '@/lib/head';
import { highlightLzyError } from '@/lib/highlight';

import { allRoutes } from '../routes';

/** How many single-character edits turn one string into another. */
function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]!;
    row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const current = row[j]!;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = current;
    }
  }
  return row[b.length]!;
}

/** The closest real page, the way LZY suggests the name you meant. */
export function closestRoute(path: string): string | null {
  const wanted = path.toLowerCase().replace(/\/?$/, '/');
  let best: { route: string; score: number } | null = null;
  for (const route of allRoutes()) {
    const score = distance(wanted, route);
    if (!best || score < best.score) best = { route, score };
  }
  if (!best) return null;
  return best.score <= Math.max(3, Math.floor(wanted.length / 3)) ? best.route : null;
}

export default function NotFound() {
  usePageHead({
    title: 'Page not found',
    description: 'There is no page at this address on the LZY website.',
    route: '/404/',
    noindex: true,
  });

  const { open } = useSearch();
  const location = useLocation();
  // The address is only known in the browser: the static 404 page is shared
  // by every missing address, so it is filled in after the page loads.
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => setPath(location.pathname), [location.pathname]);

  const suggestion = path ? closestRoute(path) : null;
  const message = [
    `Lookup error.`,
    '',
    `There is no page at ${path ? `'${path}'` : 'this address'}.`,
    '',
    'The link may be old, or the address may have a typo.',
    ...(suggestion ? ['', 'Maybe you meant:', '', `    ${suggestion}`] : []),
  ].join('\n');

  return (
    <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[auto_1fr] lg:gap-16 lg:py-24">
      <div className="relative mx-auto">
        <div aria-hidden="true" className="glow-orb inset-0 opacity-60" />
        <Mascot size={280} className="float relative h-auto w-[min(70vw,17.5rem)]" />
      </div>
      <div className="min-w-0">
        <p className="font-mono text-sm tracking-[0.18em] text-accent uppercase">Error 404</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-fg sm:text-6xl">
          This code path does not exist.
        </h1>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[var(--code-bg)]">
          <pre
            tabIndex={0}
            className="overflow-x-auto p-5 font-mono text-sm leading-6 text-[var(--code-fg)]"
            aria-label="What went wrong"
            dangerouslySetInnerHTML={{ __html: highlightLzyError(message) }}
          />
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {suggestion && (
            <ButtonLink to={suggestion} arrow>
              Go to {suggestion}
            </ButtonLink>
          )}
          <ButtonLink to="/" variant={suggestion ? 'secondary' : 'primary'} icon="arrow-left">
            Return home
          </ButtonLink>
          <Button icon="search" onClick={() => open()}>
            Search documentation
          </Button>
        </div>
      </div>
    </div>
  );
}
