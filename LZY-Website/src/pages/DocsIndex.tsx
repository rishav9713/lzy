import { Link } from 'react-router';

import { DocsLayout } from '@/components/docs/DocsLayout';
import { PageHeader } from '@/components/PageHeader';
import { useSearch } from '@/components/search/SearchContext';
import { Icon, type IconName } from '@/components/ui/Icon';
import { pageMeta } from '@/content/docs';
import { sidebar } from '@/content/navigation';
import { project } from '@/data/site';
import { usePageHead } from '@/lib/head';

const icons: Record<string, IconName> = {
  'Getting started': 'play',
  'Learn LZY': 'education',
  'Language guide': 'book',
  Tools: 'terminal',
  Reference: 'file',
  Development: 'layers',
};

const starts: Array<{ icon: IconName; title: string; body: string; to: string }> = [
  {
    icon: 'play',
    title: 'New to programming?',
    body: 'Start the course. Five short levels, each ending with something that runs.',
    to: '/learn/',
  },
  {
    icon: 'code',
    title: 'Already program?',
    body: 'See the whole language on one page, with the ways it differs from what you know.',
    to: '/language/',
  },
  {
    icon: 'hash',
    title: 'Looking something up?',
    body: `All ${project.builtins} built-in functions, with examples and what they return.`,
    to: '/docs/stdlib/',
  },
];

export default function DocsIndex() {
  const { open } = useSearch();
  usePageHead({
    title: 'Documentation',
    description:
      'Everything about LZY: installing it, a course for beginners, a guide to every part of the language, the built-in functions, the lzy command and the full specification.',
    route: '/docs/',
  });

  return (
    <DocsLayout>
      <PageHeader
        eyebrow={`LZY ${project.version}`}
        title="Documentation"
        lead="Everything LZY can do today, explained with examples that were run to produce this page — and a clear list of what it cannot do yet."
      >
        <button
          type="button"
          onClick={() => open()}
          className="inline-flex h-11 w-full max-w-md items-center gap-3 rounded-xl border border-line bg-surface px-4 text-left text-fg-subtle transition-colors hover:border-line-strong"
        >
          <Icon name="search" className="size-4.5" />
          <span className="flex-1">Search documentation…</span>
          <kbd className="rounded border border-line px-1.5 font-mono text-xs">/</kbd>
        </button>
      </PageHeader>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {starts.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="glow-card group rounded-2xl border border-line bg-surface p-5"
          >
            <Icon name={item.icon} className="size-6 text-accent" />
            <h2 className="mt-4 font-display text-lg font-semibold text-fg">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{item.body}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
              Go
              <Icon
                name="arrow-right"
                className="size-4 transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-2">
        {sidebar.map((section) => (
          <section key={section.title} aria-labelledby={`docs-${section.title}`}>
            <h2
              id={`docs-${section.title}`}
              className="flex items-center gap-2.5 font-display text-xl font-semibold text-fg"
            >
              <Icon name={icons[section.title] ?? 'book'} className="size-5 text-accent" />
              {section.title}
            </h2>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
              {section.items.map((item) => {
                const meta = pageMeta(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group flex items-start justify-between gap-4 px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium text-fg group-hover:text-accent">
                          {item.label}
                        </span>
                        {meta && (
                          <span className="mt-0.5 line-clamp-1 block text-sm text-fg-subtle">
                            {meta.description}
                          </span>
                        )}
                      </span>
                      {item.tag ? (
                        <span className="mt-1 shrink-0 rounded border border-line px-1.5 font-mono text-[0.65rem] text-fg-subtle uppercase">
                          {item.tag}
                        </span>
                      ) : (
                        <Icon
                          name="chevron-right"
                          className="mt-1 size-4 shrink-0 text-fg-subtle"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </DocsLayout>
  );
}
