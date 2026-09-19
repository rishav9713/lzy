import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { PageHeader } from '@/components/PageHeader';
import { Pill } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { allExamples, categories, categoryLabel, notYetPossible } from '@/content/examples';
import { project } from '@/data/site';
import { cx } from '@/lib/cx';
import { highlightLzy } from '@/lib/highlight';
import { usePageHead } from '@/lib/head';
import { exampleTitle } from '@/lib/search';

export default function Examples() {
  usePageHead({
    title: 'Examples',
    description: `${project.examples} runnable LZY programs — beginner programs, algorithms, small applications and defensive security tools — each shown with the output it really produces.`,
    route: '/examples/',
  });

  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allExamples.filter((example) => {
      if (category !== 'all' && example.category !== category) return false;
      if (!needle) return true;
      return (
        example.slug.includes(needle) ||
        example.description.join(' ').toLowerCase().includes(needle) ||
        example.source.toLowerCase().includes(needle)
      );
    });
  }, [category, query]);

  const filters = ['all', ...Object.keys(categories)];

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Examples"
        title="Programs you can run"
        lead={`${project.examples} programs from the repository's examples folder. Each one's output below is the output LZY really prints, recorded and checked by the test suite on every change.`}
      />

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {filters.map((item) => {
            const count =
              item === 'all'
                ? allExamples.length
                : allExamples.filter((example) => example.category === item).length;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={cx(
                  'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors',
                  category === item
                    ? 'border-accent/50 bg-accent-soft text-accent'
                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {item === 'all' ? 'All' : categoryLabel(item)}
                <span className="font-mono text-xs">{count}</span>
              </button>
            );
          })}
        </div>
        <label className="relative block w-full lg:w-80">
          <span className="sr-only">Filter examples</span>
          <Icon
            name="search"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-fg-subtle"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter by name or code…"
            className="h-11 w-full rounded-xl border border-line bg-surface pr-3 pl-10 text-fg placeholder:text-fg-subtle focus:border-accent/60 focus:outline-none"
          />
        </label>
      </div>

      {category !== 'all' && categories[category] && (
        <p className="mt-5 text-fg-muted">{categories[category].blurb}</p>
      )}

      <p className="sr-only" role="status">
        {shown.length} examples shown
      </p>

      <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {shown.map((example) => {
          const preview = example.source
            .split('\n')
            .filter((line) => line.trim() && !line.trim().startsWith('#'))
            .slice(0, 6)
            .join('\n');
          return (
            <li key={example.slug}>
              <Link
                to={`/examples/${example.slug}/`}
                className="glow-card group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <Pill>{categoryLabel(example.category)}</Pill>
                    <span className="font-mono text-xs text-fg-subtle">{example.lines} lines</span>
                  </div>
                  <h2 className="mt-4 font-display text-xl font-semibold text-fg group-hover:text-accent">
                    {exampleTitle(example.slug)}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-fg-muted">
                    {example.description[0]}
                  </p>
                </div>
                <pre
                  aria-hidden="true"
                  className="mt-auto overflow-hidden border-t border-white/5 bg-[var(--code-bg)] px-5 py-4 font-mono text-[0.72rem] leading-5 text-[var(--code-fg)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
                >
                  <code dangerouslySetInnerHTML={{ __html: highlightLzy(preview) }} />
                </pre>
              </Link>
            </li>
          );
        })}
      </ul>

      {shown.length === 0 && (
        <p className="mt-10 text-center text-fg-muted">No example matches “{query}”.</p>
      )}

      <section
        className="mt-20 rounded-3xl border border-line bg-surface p-6 sm:p-8"
        aria-labelledby="not-yet"
      >
        <h2 id="not-yet" className="font-display text-2xl font-bold text-fg">
          Examples LZY cannot have yet
        </h2>
        <p className="mt-3 max-w-3xl text-fg-muted">
          Some common kinds of program need features LZY does not have. Rather than fake them, here
          is what is missing and when the roadmap plans it.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notYetPossible.map((item) => (
            <li key={item.topic} className="rounded-xl border border-line bg-bg-raised p-4">
              <p className="flex items-center justify-between gap-2 font-medium text-fg">
                {item.topic}
                <span className="font-mono text-xs text-info">
                  {item.version ? `planned ${item.version}` : 'not scheduled'}
                </span>
              </p>
              <p className="mt-1 text-sm text-fg-muted">{item.reason}</p>
            </li>
          ))}
        </ul>
        <Link
          to="/roadmap/"
          className="mt-6 inline-flex items-center gap-1.5 font-medium text-accent"
        >
          See the roadmap <Icon name="arrow-right" className="size-4" />
        </Link>
      </section>
    </div>
  );
}
