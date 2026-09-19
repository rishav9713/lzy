import { Link } from 'react-router';

import { sidebar } from '@/content/navigation';

import { Icon } from '../ui/Icon';

const order = sidebar.flatMap((section) =>
  section.items.map((item) => ({ ...item, section: section.title })),
);

/** The pages before and after this one, in sidebar order. */
export function neighbours(route: string) {
  const index = order.findIndex((item) => item.to === route);
  if (index === -1) return { previous: undefined, next: undefined };
  return { previous: order[index - 1], next: order[index + 1] };
}

export function sectionFor(route: string): string | undefined {
  return order.find((item) => item.to === route)?.section;
}

export function PrevNext({ route }: { route: string }) {
  const { previous, next } = neighbours(route);
  if (!previous && !next) return null;
  return (
    <nav aria-label="Previous and next pages" className="mt-14 grid gap-4 sm:grid-cols-2">
      {previous ? (
        <Link
          to={previous.to}
          className="glow-card group rounded-xl border border-line bg-surface p-4"
        >
          <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
            <Icon name="arrow-left" className="size-3.5" /> Previous
          </span>
          <span className="mt-1 block font-medium text-fg group-hover:text-accent">
            {previous.label}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link
          to={next.to}
          className="glow-card group rounded-xl border border-line bg-surface p-4 text-right"
        >
          <span className="flex items-center justify-end gap-1.5 text-xs text-fg-subtle">
            Next <Icon name="arrow-right" className="size-3.5" />
          </span>
          <span className="mt-1 block font-medium text-fg group-hover:text-accent">
            {next.label}
          </span>
        </Link>
      )}
    </nav>
  );
}
