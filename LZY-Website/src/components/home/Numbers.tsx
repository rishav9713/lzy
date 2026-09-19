import lzy from '@/data/generated/lzy.json';
import { project } from '@/data/site';

/**
 * Figures about LZY, every one read from the source when the site was
 * built: the interpreter's own tables, the examples folder, pytest's count,
 * and the CI matrix.
 */
export function Numbers() {
  const matrix = project.ci.systems.length * project.ci.pythons.length;
  const stats = [
    { value: lzy.keywords.length, label: 'keywords', note: 'all of them plain English words' },
    { value: project.builtins, label: 'built-in functions', note: 'typed, documented and tested' },
    { value: project.examples, label: 'example programs', note: 'each with its output recorded' },
    {
      value: project.tests?.toLocaleString('en-US') ?? '—',
      label: 'tests',
      note: 'unit, regression, security and fuzzing',
    },
    {
      value: matrix,
      label: 'CI configurations',
      note: `${project.ci.systems.length} systems × ${project.ci.pythons.length} Python versions`,
    },
    {
      value: project.runtimeDependencies.length,
      label: 'runtime dependencies',
      note: 'only the Python standard library',
    },
  ];

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col bg-surface p-5 sm:p-6">
          <dt className="text-sm font-medium text-fg">{stat.label}</dt>
          <dd className="order-first font-display text-4xl font-bold tracking-tight text-fg">
            <span className="text-gradient">{stat.value}</span>
          </dd>
          <dd className="mt-1 text-xs leading-snug text-fg-subtle">{stat.note}</dd>
        </div>
      ))}
    </dl>
  );
}
