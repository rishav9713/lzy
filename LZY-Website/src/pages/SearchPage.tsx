import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { PageHeader } from '@/components/PageHeader';
import { Icon } from '@/components/ui/Icon';
import { loadIndex, markMatches, search, type SearchEntry } from '@/lib/search';
import { usePageHead } from '@/lib/head';

/** A full page of results, for links such as /search/?q=append. */
export default function SearchPage() {
  usePageHead({
    title: 'Search',
    description:
      'Search the LZY documentation, the specification, the examples and the built-in functions.',
    route: '/search/',
  });

  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [index, setIndex] = useState<SearchEntry[] | null>(null);

  useEffect(() => {
    let alive = true;
    void loadIndex().then((entries) => alive && setIndex(entries));
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => (index ? search(index, query, 50) : []), [index, query]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
      <PageHeader eyebrow="Search" title="Search the documentation" />
      <form role="search" className="relative mt-8" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="search-page-input" className="sr-only">
          Search documentation
        </label>
        <Icon
          name="search"
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent"
        />
        <input
          id="search-page-input"
          type="search"
          value={query}
          onChange={(event) =>
            setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })
          }
          placeholder="Search documentation…"
          className="h-14 w-full rounded-2xl border border-line-strong bg-surface pr-4 pl-12 text-lg text-fg placeholder:text-fg-subtle focus:border-accent/60 focus:outline-none"
        />
      </form>

      <div className="mt-8" role="status" aria-live="polite">
        {!index && <p className="text-fg-muted">Loading the index…</p>}
        {index && query && (
          <p className="text-sm text-fg-subtle">
            {results.length} {results.length === 1 ? 'result' : 'results'} for “{query}”
          </p>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {results.map((result) => (
          <li key={`${result.route}#${result.anchor}`}>
            <Link
              to={result.route + (result.anchor ? `#${result.anchor}` : '')}
              className="glow-card block rounded-2xl border border-line bg-surface p-5"
            >
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="rounded border border-line px-1.5 font-mono text-[0.65rem] text-fg-subtle uppercase">
                  {result.kind}
                </span>
                <span className="font-medium text-fg">
                  {result.title}
                  {result.section && <span className="text-fg-muted"> › {result.section}</span>}
                </span>
              </p>
              <p className="mt-2 text-sm text-fg-muted">
                {markMatches(result.snippet, query).map((part, position) =>
                  part.match ? (
                    <mark key={position} className="rounded-sm bg-accent-soft px-0.5 text-accent">
                      {part.text}
                    </mark>
                  ) : (
                    <span key={position}>{part.text}</span>
                  ),
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
