import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

/** The top of a page: a small label, the title, and a sentence or two. */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  className,
  center = false,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <header className={cx('relative', center && 'mx-auto max-w-3xl text-center', className)}>
      {eyebrow && (
        <p
          className={cx(
            'mb-4 inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-accent uppercase',
          )}
        >
          <span aria-hidden="true" className="h-px w-6 bg-accent/60" />
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      {lead && (
        <p className={cx('mt-5 text-lg leading-relaxed text-fg-muted', !center && 'max-w-2xl')}>
          {lead}
        </p>
      )}
      {children && (
        <div className={cx('mt-7 flex flex-wrap gap-3', center && 'justify-center')}>
          {children}
        </div>
      )}
    </header>
  );
}

/** A section on a long page: a title and an optional introduction. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  id,
  center = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  id?: string;
  center?: boolean;
}) {
  return (
    <div className={cx('mb-10', center && 'mx-auto max-w-2xl text-center')}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs tracking-[0.14em] text-accent uppercase">{eyebrow}</p>
      )}
      <h2
        id={id}
        className="font-display text-3xl leading-tight font-bold tracking-tight text-fg sm:text-4xl"
      >
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-fg-muted">{lead}</p>}
    </div>
  );
}
