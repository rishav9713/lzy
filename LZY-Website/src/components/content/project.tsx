/**
 * Components that summarise project documents: how to contribute, the
 * security policy, the licence, and how the interpreter is put together.
 */
import { Link } from 'react-router';

import notice from '../../../../NOTICE?raw';
import lzy from '@/data/generated/lzy.json';
import { links, project } from '@/data/site';

import { ButtonAnchor, ButtonLink } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';

const steps: Array<{ icon: IconName; title: string; detail: string }> = [
  { icon: 'fork', title: 'Fork', detail: 'Your own copy of the repository' },
  { icon: 'pr', title: 'Branch', detail: 'One change per branch' },
  { icon: 'edit', title: 'Change', detail: 'Code, tests, docs' },
  { icon: 'check', title: 'Test', detail: 'pytest, ruff, examples' },
  { icon: 'file', title: 'Commit', detail: 'type: summary' },
  { icon: 'arrow-right', title: 'Push', detail: 'To your fork' },
  { icon: 'chat', title: 'Pull request', detail: 'Say what you did not do' },
  { icon: 'eye', title: 'Review', detail: 'CI on 3 systems must pass' },
];

const commitTypes = [
  'feat',
  'fix',
  'test',
  'docs',
  'security',
  'refactor',
  'ci',
  'chore',
  'release',
];

export function ContributionFlow() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative rounded-xl border border-line bg-bg-raised p-4">
            <span className="font-mono text-xs text-fg-subtle">
              {String(index + 1).padStart(2, '0')}
            </span>
            <Icon name={step.icon} className="mt-2 size-5 text-accent" />
            <p className="mt-2 font-display font-semibold text-fg">{step.title}</p>
            <p className="text-xs text-fg-muted">{step.detail}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 text-sm text-fg-muted">
        Commit messages start with a type:{' '}
        {commitTypes.map((type, index) => (
          <span key={type}>
            <code className="inline">{type}</code>
            {index < commitTypes.length - 1 ? ' ' : ''}
          </span>
        ))}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <ButtonAnchor href={links.fork} icon="fork" variant="primary">
          Fork LZY
        </ButtonAnchor>
        <ButtonAnchor href={links.issues} icon="bug">
          Open issues
        </ButtonAnchor>
        <ButtonLink to="/docs/leps/" variant="ghost">
          Proposing a language change
        </ButtonLink>
      </div>
    </div>
  );
}

export function SecuritySummary() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-accent/35 bg-accent-soft p-5">
        <Icon name="lock" className="size-6 text-accent" />
        <h2 className="mt-3 font-display text-lg font-semibold text-fg">Found a vulnerability?</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Report it privately. Please do not open a public issue.
        </p>
        <ButtonAnchor href={links.securityAdvisory} variant="primary" size="sm" className="mt-4">
          Report privately
        </ButtonAnchor>
      </div>
      <div className="rounded-2xl border border-warn/35 bg-warn-soft p-5">
        <Icon name="alert" className="size-6 text-warn" />
        <h2 className="mt-3 font-display text-lg font-semibold text-fg">LZY is not a sandbox</h2>
        <p className="mt-1 text-sm text-fg-muted">
          There is no time limit and only partial memory limits. Do not run untrusted LZY without
          real isolation.
        </p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-5">
        <Icon name="shield" className="size-6 text-ok" />
        <h2 className="mt-3 font-display text-lg font-semibold text-fg">No route to the host</h2>
        <p className="mt-1 text-sm text-fg-muted">
          LZY {project.version} has no file, network or process access, and{' '}
          {project.runtimeDependencies.length === 0 ? 'no' : project.runtimeDependencies.length}{' '}
          runtime dependencies.
        </p>
      </div>
    </div>
  );
}

const licence = {
  permits: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
  requires: [
    'Keep the licence and copyright notice',
    'State significant changes',
    'Include the NOTICE file',
  ],
  limits: ['No trademark rights', 'No liability', 'No warranty'],
};

export function LicenseSummary() {
  const columns: Array<{ title: string; items: string[]; icon: IconName; colour: string }> = [
    { title: 'You may', items: licence.permits, icon: 'check-circle', colour: 'text-ok' },
    { title: 'You must', items: licence.requires, icon: 'info', colour: 'text-info' },
    { title: 'It does not give', items: licence.limits, icon: 'close', colour: 'text-accent' },
  ];
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="rounded-2xl border border-line bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-fg">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-fg-muted">
                  <Icon name={column.icon} className={`mt-0.5 size-4 shrink-0 ${column.colour}`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-fg-subtle">
        A plain-language summary of the Apache License 2.0, to help you find your way. It is not
        legal advice; the licence text below is what applies. Why Apache-2.0 and not MIT is{' '}
        <Link
          to="/docs/design-decisions/#d-001-licence-apache-20"
          className="text-accent underline"
        >
          recorded in the design decisions
        </Link>
        .
      </p>
      <section id="notice" aria-labelledby="notice-title" className="mt-8 scroll-mt-24">
        <h2 id="notice-title" className="font-display text-xl font-semibold text-fg">
          NOTICE
        </h2>
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-line bg-surface p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap text-fg-muted">
          {notice.trim()}
        </pre>
      </section>
      <h2 className="mt-10 font-display text-xl font-semibold text-fg">The licence</h2>
    </div>
  );
}

const pipeline: Array<{ stage: string; path: string; turns: string }> = [
  { stage: 'Source', path: 'your .lzy file', turns: 'characters' },
  { stage: 'Lexer', path: 'lzy/lexer', turns: 'tokens, indentation, folded names' },
  { stage: 'Parser', path: 'lzy/parser', turns: 'a syntax tree' },
  { stage: 'AST', path: 'lzy/ast', turns: 'nodes that each carry their place in the source' },
  {
    stage: 'Interpreter',
    path: 'lzy/interpreter',
    turns: 'a tree walk: values, scopes, built-ins',
  },
  { stage: 'Output', path: 'say, or an LZY error', turns: 'what you see' },
];

export function ArchitectureDiagram() {
  return (
    <figure className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <ol className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        {pipeline.map((step, index) => (
          <li key={step.stage} className="flex flex-col items-center gap-2 lg:flex-1 lg:flex-row">
            <div className="w-full flex-1 rounded-xl border border-line bg-bg-raised p-4 text-center">
              <p className="font-display text-lg font-semibold text-fg">{step.stage}</p>
              <p className="mt-0.5 font-mono text-xs text-accent">{step.path}</p>
              <p className="mt-2 text-xs leading-snug text-fg-muted">{step.turns}</p>
            </div>
            {index < pipeline.length - 1 && (
              <Icon
                name="arrow-right"
                className="size-5 shrink-0 rotate-90 text-accent lg:rotate-0"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-xl border border-dashed border-line-strong p-3 text-fg-muted">
          <code className="inline">lzy/errors.py</code> — every error, and how it is shown
        </div>
        <div className="rounded-xl border border-dashed border-line-strong p-3 text-fg-muted">
          <code className="inline">lzy/runtime/</code> — every safety limit, and the stack LZY runs
          on
        </div>
        <div className="rounded-xl border border-dashed border-line-strong p-3 text-fg-muted">
          <code className="inline">lzy/cli</code>, <code className="inline">lzy/repl.py</code>,{' '}
          <code className="inline">lzy/api.py</code> — the ways in
        </div>
      </div>
      <figcaption className="mt-4 text-sm text-fg-subtle">
        The pipeline every program goes through. The dashed boxes are used by every stage.
      </figcaption>
    </figure>
  );
}

export function ModuleTable() {
  const total = lzy.modules.reduce((sum, module) => sum + module.lines, 0);
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[36rem] text-sm">
        <caption className="sr-only">The files of the interpreter</caption>
        <thead className="bg-surface-2 text-left">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
              File
            </th>
            <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
              What it says it is
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-display font-semibold text-fg">
              Lines
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {lzy.modules.map((module) => (
            <tr key={module.path}>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <a
                  href={links.file(module.path)}
                  rel="noopener noreferrer"
                  className="font-mono text-[var(--accent)] hover:underline"
                >
                  {module.path}
                </a>
              </td>
              <td className="px-4 py-2.5 text-fg-muted">{module.summary.replace(/``/g, '')}</td>
              <td className="px-4 py-2.5 text-right font-mono text-fg-muted">{module.lines}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-surface-2">
          <tr>
            <th scope="row" colSpan={2} className="px-4 py-2.5 text-left font-medium text-fg">
              Total
            </th>
            <td className="px-4 py-2.5 text-right font-mono font-semibold text-fg">
              {total.toLocaleString('en-US')}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="border-t border-line bg-surface px-4 py-3 text-xs text-fg-subtle">
        Generated from the source: each file&apos;s line count and the first line of its own
        docstring.
      </p>
    </div>
  );
}

export function PlatformMatrix() {
  const systems = project.ci.systems.map((system) => system.replace('-latest', ''));
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">Systems and Python versions tested by CI</caption>
        <thead className="bg-surface-2">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-display font-semibold text-fg">
              System
            </th>
            {project.ci.pythons.map((python) => (
              <th
                key={python}
                scope="col"
                className="px-3 py-3 text-center font-mono font-medium text-fg"
              >
                {python}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {systems.map((system) => (
            <tr key={system}>
              <th scope="row" className="px-4 py-3 text-left font-medium text-fg">
                {system === 'macos' ? 'macOS' : system === 'ubuntu' ? 'Ubuntu' : 'Windows'}
              </th>
              {project.ci.pythons.map((python) => (
                <td key={python} className="px-3 py-3 text-center">
                  <Icon name="check" className="mx-auto size-4 text-ok" label="Tested" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProjectNumbers() {
  const items = [
    ['Version', project.version],
    ['Keywords', lzy.keywords.length],
    ['Built-in functions', project.builtins],
    ['Examples', project.examples],
    ['Tests', project.tests?.toLocaleString('en-US') ?? '—'],
    ['Runtime dependencies', project.runtimeDependencies.length],
  ] as const;
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="flex flex-col rounded-xl border border-line bg-surface p-4">
          <dt className="text-xs text-fg-subtle">{label}</dt>
          <dd className="order-first font-display text-2xl font-bold text-fg">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
