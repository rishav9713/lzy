import { Link } from 'react-router';

import type { UseCase } from '@/content/home';
import { exampleTitle } from '@/lib/search';

import { StatusBadge } from './ui/Badge';
import { Icon } from './ui/Icon';
import { InlineText } from './ui/InlineText';

export function UseCaseCard({
  useCase,
  detailed = false,
}: {
  useCase: UseCase;
  detailed?: boolean;
}) {
  return (
    <article
      id={useCase.id}
      className="glow-card flex h-full scroll-mt-24 flex-col rounded-2xl border border-line bg-surface p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface-2 text-accent">
          <Icon name={useCase.icon} className="size-5" />
        </span>
        <StatusBadge status={useCase.status}>
          {useCase.status === 'planned' && useCase.target
            ? `Planned for ${useCase.target}`
            : undefined}
        </StatusBadge>
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-fg">{useCase.title}</h3>
      <p className="mt-2 font-medium text-fg-muted">{useCase.summary}</p>
      {detailed && (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-fg-muted">
          <InlineText text={useCase.detail} />
        </p>
      )}
      {detailed && useCase.examples && (
        <div className="mt-5">
          <p className="mb-2 font-mono text-xs tracking-wide text-fg-subtle uppercase">
            Examples you can run
          </p>
          <ul className="flex flex-wrap gap-2">
            {useCase.examples.map((slug) => (
              <li key={slug}>
                <Link
                  to={`/examples/${slug}/`}
                  className="inline-flex items-center rounded-lg border border-line bg-surface-2 px-2.5 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-accent/50 hover:text-accent"
                >
                  {exampleTitle(slug)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {useCase.docs && (
        <Link
          to={useCase.docs.to}
          className="group mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-accent"
        >
          {useCase.docs.label}
          <Icon
            name="arrow-right"
            className="size-4 transition-transform group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </article>
  );
}
