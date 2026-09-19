/**
 * How the example programs are grouped and described. The programs, their
 * descriptions and their output come from examples/ via generate_data.py.
 */
import examples from '@/data/generated/examples.json';

export type Example = (typeof examples)[number];

export const categories: Record<string, { label: string; blurb: string }> = {
  beginner: {
    label: 'Beginner',
    blurb: 'Hello World, variables, decisions, loops, functions, lists and maps.',
  },
  algorithms: {
    label: 'Algorithms',
    blurb: 'Classic algorithms and data structures, written to be read.',
  },
  applications: {
    label: 'Applications',
    blurb: 'Small complete programs: a calculator, a quiz, a report, a to-do list.',
  },
  security: {
    label: 'Defensive security',
    blurb: 'Analysing logs and reports you already hold. For defensive, authorised work.',
  },
};

export function categoryLabel(category: string): string {
  return categories[category]?.label ?? category.charAt(0).toUpperCase() + category.slice(1);
}

export const allExamples: Example[] = [...examples].sort(
  (a, b) => a.categoryOrder - b.categoryOrder || a.path.localeCompare(b.path),
);

/**
 * Kinds of program people look for that LZY cannot write yet, and when that
 * changes. Versions are from ROADMAP.md.
 */
export const notYetPossible: Array<{ topic: string; reason: string; version: string | null }> = [
  { topic: 'File handling', reason: 'LZY has no file access.', version: '0.3.0' },
  { topic: 'Networking and HTTP APIs', reason: 'LZY has no network access.', version: '0.3.0' },
  { topic: 'JSON', reason: 'The json library comes with the standard library.', version: '0.2.0' },
  {
    topic: 'Command-line arguments',
    reason: 'A program cannot read its arguments or environment. This is not on the roadmap yet.',
    version: null,
  },
  { topic: 'Multi-file programs', reason: 'There are no modules or imports.', version: '0.2.0' },
  { topic: 'Recovering from errors', reason: 'There is no error handling.', version: '0.1.0' },
];

/** Where each keyword is explained, for "concepts used" links. */
export const keywordDocs: Record<string, string> = {
  say: '/docs/input-output/',
  ask: '/docs/input-output/',
  if: '/docs/conditions/',
  else: '/docs/conditions/',
  and: '/docs/operators/',
  or: '/docs/operators/',
  not: '/docs/operators/',
  while: '/docs/loops/',
  for: '/docs/loops/',
  in: '/docs/loops/',
  break: '/docs/loops/',
  continue: '/docs/loops/',
  function: '/docs/functions/',
  return: '/docs/functions/',
  true: '/docs/types/',
  false: '/docs/types/',
  nothing: '/docs/types/',
};
