import { Link } from 'react-router';

import { PageHeader, SectionHeading } from '@/components/PageHeader';
import { milestones, roadmap } from '@/components/roadmap/timeline';
import { StatusBadge } from '@/components/ui/Badge';
import { ButtonAnchor } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { links } from '@/data/site';
import { cx } from '@/lib/cx';
import { formatDate } from '@/lib/format';
import { usePageHead } from '@/lib/head';

function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function Roadmap() {
  usePageHead({
    title: 'Roadmap',
    description:
      'Where LZY is going, version by version: error handling and tooling in 0.1.0, modules and a standard library in 0.2.0, files and HTTP in 0.3.0, and what has to be true before 1.0.',
    route: '/roadmap/',
  });

  const items = milestones();

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Roadmap"
        title="What LZY plans to become"
        lead={
          <>
            {roadmap.intro.slice(0, 2).map((paragraph) => (
              <Html key={paragraph} html={paragraph + ' '} />
            ))}
          </>
        }
      >
        <ButtonAnchor href={links.file('ROADMAP.md')} icon="github">
          ROADMAP.md
        </ButtonAnchor>
      </PageHeader>

      <section className="mt-16" aria-labelledby="principles">
        <SectionHeading id="principles" eyebrow="Principles" title="Three rules shape the order" />
        <div className="grid gap-5 md:grid-cols-3">
          {roadmap.principles.map((principle) => (
            <div key={principle.lead} className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="font-display text-lg font-semibold text-fg">
                <Html html={principle.lead} />
              </h3>
              <p className="prose mt-2 text-[0.95rem]">
                <Html html={principle.html} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20" aria-labelledby="timeline">
        <SectionHeading
          id="timeline"
          eyebrow="Timeline"
          title="Version by version"
          lead="A version counts as released only when it is in the changelog. Planned versions ship when their conditions are met, not on a date."
        />
        <ol className="relative ml-4 border-l border-line sm:ml-6">
          {items.map((item) => (
            <li
              key={item.version}
              id={`v${item.version.replace(/\./g, '-')}`}
              className="relative scroll-mt-24 pb-12 pl-8 sm:pl-12"
            >
              <span
                aria-hidden="true"
                className={cx(
                  'absolute top-1 -left-[0.8rem] flex size-6 items-center justify-center rounded-full border-2 bg-bg text-xs font-bold',
                  item.state === 'done' && 'border-ok text-ok',
                  item.state === 'next' &&
                    'border-accent text-accent shadow-[0_0_0_4px_var(--accent-soft),0_0_24px_var(--glow)]',
                  item.state === 'planned' && 'border-line-strong text-fg-subtle',
                )}
              >
                {item.state === 'done' ? '✓' : item.state === 'next' ? '●' : ''}
              </span>

              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-2xl font-bold text-fg">
                  <span className="font-mono">{item.version}</span>{' '}
                  <span className="text-fg-muted">— {item.title}</span>
                </h3>
                <StatusBadge status={item.state === 'done' ? 'done' : item.state}>
                  {item.state === 'done' && item.releasedOn
                    ? `Released ${formatDate(item.releasedOn)}`
                    : undefined}
                </StatusBadge>
              </div>

              {item.plan?.goal && (
                <p className="prose mt-3 max-w-3xl text-lg">
                  <Html html={item.plan.goal} />
                </p>
              )}
              {!item.plan && (
                <p className="mt-3 max-w-3xl text-fg-muted">
                  A patch release between the planned versions.{' '}
                  <Link to={`/releases/v${item.version}/`} className="text-accent underline">
                    Read the notes
                  </Link>
                  .
                </p>
              )}

              {item.plan && item.plan.items.length > 0 && (
                <ul className="mt-5 grid max-w-4xl gap-3 md:grid-cols-2">
                  {item.plan.items.map((entry, index) => (
                    <li
                      key={index}
                      className="rounded-xl border border-line bg-surface p-4 text-[0.95rem]"
                    >
                      {entry.lead && (
                        <p className="font-medium text-fg">
                          <Html html={entry.lead} />
                        </p>
                      )}
                      {entry.html && (
                        <p className="prose mt-1 text-[0.9rem] leading-relaxed">
                          <Html html={entry.html} />
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {item.plan && item.plan.checklist.length > 0 && (
                <ul className="mt-5 max-w-3xl space-y-2">
                  {item.plan.checklist.map((entry, index) => (
                    <li key={index} className="flex gap-3 text-fg-muted">
                      <Icon
                        name={entry.done ? 'check-circle' : 'circle'}
                        className={cx(
                          'mt-0.5 size-5 shrink-0',
                          entry.done ? 'text-ok' : 'text-fg-subtle',
                        )}
                        label={entry.done ? 'Done' : 'Not yet'}
                      />
                      <Html html={entry.html} />
                    </li>
                  ))}
                </ul>
              )}

              {item.plan?.notes.map((note) => (
                <p key={note} className="prose mt-4 max-w-3xl">
                  <Html html={note} />
                </p>
              ))}

              {item.plan?.shipsWhen && (
                <p className="mt-5 max-w-3xl rounded-xl border border-dashed border-line-strong px-4 py-3 text-[0.95rem] text-fg-muted">
                  <span className="font-semibold text-fg">Ships when: </span>
                  <Html html={item.plan.shipsWhen} className="prose" />
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>

      {roadmap.notPlanned.length > 0 && (
        <section className="mt-8" aria-labelledby="not-planned">
          <SectionHeading
            id="not-planned"
            eyebrow="Saying no"
            title="Explicitly not planned"
            lead="Saying no is part of a roadmap."
          />
          <ul className="grid gap-4 md:grid-cols-2">
            {roadmap.notPlanned.map((item) => (
              <li key={item.lead} className="rounded-2xl border border-line bg-surface p-5">
                <p className="flex items-center gap-2 font-medium text-fg">
                  <StatusBadge status="not-planned" />
                  <Html html={item.lead} />
                </p>
                <p className="prose mt-2 text-[0.95rem]">
                  <Html html={item.html} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
