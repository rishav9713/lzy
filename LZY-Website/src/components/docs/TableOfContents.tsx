import type { Heading } from '@/content/types';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cx } from '@/lib/cx';

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const shown = headings.filter((heading) => heading.depth <= 3);
  const active = useScrollSpy(shown.map((heading) => heading.id));
  if (shown.length < 2) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <h2 className="mb-3 font-display text-xs font-semibold tracking-[0.12em] text-fg-subtle uppercase">
        On this page
      </h2>
      <ul className="space-y-1.5 border-l border-line">
        {shown.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? 'location' : undefined}
              className={cx(
                '-ml-px block border-l py-0.5 leading-snug transition-colors',
                heading.depth === 3 ? 'pl-6' : 'pl-3.5',
                active === heading.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-fg-subtle hover:text-fg',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
