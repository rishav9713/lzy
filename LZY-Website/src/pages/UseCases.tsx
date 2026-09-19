import { PageHeader, SectionHeading } from '@/components/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { UseCaseCard } from '@/components/UseCaseCard';
import { statusExplained, useCases } from '@/content/home';
import { usePageHead } from '@/lib/head';

const groups = [
  {
    status: 'available' as const,
    title: 'Available now',
    lead: 'Works today, is tested, and has examples you can run.',
  },
  {
    status: 'experimental' as const,
    title: 'Possible, with stated limits',
    lead: 'You can do this today, but a missing feature gets in the way. The limit is named on each card.',
  },
  {
    status: 'planned' as const,
    title: 'Planned',
    lead: 'Not possible in LZY yet. Each names the release the roadmap plans it for.',
  },
];

export default function UseCases() {
  usePageHead({
    title: 'Use cases',
    description:
      'What LZY can be used for today, what it can do with stated limits, and what is planned — education, algorithms, scripting, security analysis, automation and more.',
    route: '/use-cases/',
  });

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Use cases"
        title="What you can build with LZY"
        lead="LZY is a general-purpose language at version 0.0.x. That means an honest answer to “can I use it for this?” is sometimes “not yet”. Every use below says which."
      />

      <ul className="mt-10 grid gap-3 md:grid-cols-3">
        {statusExplained.map((item) => (
          <li key={item.status} className="rounded-2xl border border-line bg-surface p-5">
            <StatusBadge status={item.status} />
            <p className="mt-3 text-sm text-fg-muted">{item.text}</p>
          </li>
        ))}
      </ul>

      {groups.map((group) => {
        const items = useCases.filter((useCase) => useCase.status === group.status);
        if (!items.length) return null;
        return (
          <section key={group.status} className="mt-20" aria-labelledby={`group-${group.status}`}>
            <SectionHeading id={`group-${group.status}`} title={group.title} lead={group.lead} />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((useCase) => (
                <UseCaseCard key={useCase.id} useCase={useCase} detailed />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-20 rounded-3xl border border-line bg-surface p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-fg">Not sure LZY fits?</h2>
        <p className="mx-auto mt-3 max-w-2xl text-fg-muted">
          The list of what LZY does not have yet is short and specific. Read it before starting
          anything that matters.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/docs/not-yet/" variant="secondary">
            What LZY does not have yet
          </ButtonLink>
          <ButtonLink to="/roadmap/" arrow>
            The roadmap
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
