/**
 * Reference tables generated from the interpreter: built-in functions,
 * keywords, reserved words, error kinds and safety limits.
 */
import { Link } from 'react-router';

import { keywordDocs } from '@/content/examples';
import lzy from '@/data/generated/lzy.json';
import { slug } from '@/lib/slug';

function arity(min: number, max: number | null): string {
  if (max === null) return `${min} or more`;
  if (min === max) return String(min);
  return `${min} to ${max}`;
}

export function BuiltinsTable() {
  const categories = [...new Set(lzy.builtins.map((builtin) => builtin.category))];
  return (
    <div className="space-y-8">
      {categories.map((category) => (
        <section key={category} aria-labelledby={`builtins-${slug(category)}`}>
          <h2
            id={`builtins-${slug(category)}`}
            className="mb-3 font-display text-lg font-semibold text-fg"
          >
            {category}
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[34rem] text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
                    Function
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
                    Inputs
                  </th>
                  <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
                    What it gives
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-surface">
                {lzy.builtins
                  .filter((builtin) => builtin.category === category)
                  .map((builtin) => (
                    <tr key={builtin.name}>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <a
                          href={`#${slug(builtin.name)}`}
                          className="font-mono font-medium text-[var(--accent)] hover:underline"
                        >
                          {builtin.name}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-fg-muted">
                        {arity(builtin.minArgs, builtin.maxArgs)}
                      </td>
                      <td className="px-4 py-2.5 text-fg-muted">{builtin.summary}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="text-sm text-fg-subtle">
        Generated from <code className="inline">lzy/interpreter/builtins.py</code>: the names, the
        number of inputs each accepts, and each function&apos;s own one-line summary.
      </p>
    </div>
  );
}

function WordGrid({
  words,
  link,
}: {
  words: string[];
  link?: (word: string) => string | undefined;
}) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
      {words.map((word) => {
        const to = link?.(word);
        const className =
          'block rounded-lg border border-line bg-surface px-3 py-2 text-center font-mono text-sm';
        return (
          <li key={word}>
            {to ? (
              <Link to={to} className={`${className} text-[var(--accent)] hover:border-accent/50`}>
                {word}
              </Link>
            ) : (
              <span className={`${className} text-fg-muted`}>{word}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function KeywordsList() {
  return <WordGrid words={lzy.keywords} link={(word) => keywordDocs[word]} />;
}

export function ReservedWords() {
  return <WordGrid words={lzy.reserved} />;
}

export function ErrorKinds() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[30rem] text-sm">
        <caption className="sr-only">The kinds of error LZY reports</caption>
        <thead className="bg-surface-2 text-left">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
              Heading
            </th>
            <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
              What it means
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {lzy.errorKinds.map((kind) => (
            <tr key={kind.className}>
              <td className="px-4 py-2.5 font-medium whitespace-nowrap text-fg">{kind.kind}</td>
              <td className="px-4 py-2.5 text-fg-muted">{kind.doc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const limitLabels: Record<string, string> = {
  max_source_characters: 'Source file size (characters)',
  max_block_depth: 'Indentation depth',
  max_bracket_depth: 'Bracket depth',
  max_parse_depth: 'Parser nesting depth',
  max_ast_depth: 'Syntax tree depth',
  max_evaluation_depth: 'Steps held open while running',
  max_call_depth: 'Function calls waiting at once',
  python_recursion_limit: 'Python recursion limit while running',
  thread_stack_bytes: 'Stack for the program thread',
  max_output_characters: 'Characters printed by one say',
};

function formatLimit(name: string, value: number): string {
  if (name === 'thread_stack_bytes') return `${value / 1024 / 1024} MB`;
  return value.toLocaleString('en-US');
}

export function LimitsTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full min-w-[40rem] text-sm">
        <caption className="sr-only">Safety limits, by default and with --safe</caption>
        <thead className="bg-surface-2 text-left">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-display font-semibold text-fg">
              Limit
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-display font-semibold text-fg">
              Default
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-display font-semibold text-fg">
              With --safe
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {lzy.limits.map((limit) => (
            <tr key={limit.name}>
              <td className="px-4 py-3 align-top">
                <span className="block font-medium text-fg">
                  {limitLabels[limit.name] ?? limit.name}
                </span>
                <code className="mt-0.5 block font-mono text-xs text-fg-subtle">{limit.name}</code>
                <span className="mt-1 block text-fg-muted">{limit.doc}</span>
              </td>
              <td className="px-4 py-3 text-right align-top font-mono whitespace-nowrap text-fg">
                {formatLimit(limit.name, limit.default)}
              </td>
              <td
                className={`px-4 py-3 text-right align-top font-mono whitespace-nowrap ${limit.safe !== limit.default ? 'text-accent' : 'text-fg-muted'}`}
              >
                {formatLimit(limit.name, limit.safe)}
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-4 py-3 align-top">
              <span className="block font-medium text-fg">Numbers built by one range</span>
              <code className="mt-0.5 block font-mono text-xs text-fg-subtle">MAX_RANGE</code>
            </td>
            <td className="px-4 py-3 text-right font-mono text-fg">
              {lzy.rangeLimit.toLocaleString('en-US')}
            </td>
            <td className="px-4 py-3 text-right font-mono text-fg-muted">
              {lzy.rangeLimit.toLocaleString('en-US')}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="border-t border-line bg-surface px-4 py-3 text-xs text-fg-subtle">
        Generated from <code className="inline">lzy/runtime/limits.py</code>, including the
        descriptions, which are the comments in that file.
      </p>
    </div>
  );
}
