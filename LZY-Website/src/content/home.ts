/**
 * The words on the home page. The code and its output are not here: they
 * come from content/showcase and content/snippets, run by generate_data.py.
 */
import type { IconName } from '@/components/ui/Icon';
import type { Status } from '@/components/ui/Badge';

export const showcaseCaptions: Record<string, { title: string; body: string }> = {
  hello: {
    title: 'It says what it does',
    body: '`say` prints. A comma adds a space. There is one kind of number, so 6 / 4 is simply 1.5.',
  },
  loops: {
    title: 'The indent is the block',
    body: 'No braces, no colons, no semicolons. The shape of the code on the page is the shape of the program.',
  },
  words: {
    title: 'Real work, plainly written',
    body: 'Functions, lists and maps, with `split`, `contains` and `keys` built in.',
  },
  totals: {
    title: 'Errors that teach',
    body: 'Adding a number to text is refused, and the message explains why and suggests the fix.',
  },
};

export interface Decision {
  title: string;
  body: string;
  snippet: string;
  icon: IconName;
}

/** The four decisions from the README's design philosophy table. */
export const decisions: Decision[] = [
  {
    title: 'Case-insensitive',
    body: '`total`, `Total` and `TOTAL` are one name. A learner should not lose an afternoon to a capital letter. Your own spelling is kept for error messages.',
    snippet: 'case',
    icon: 'sparkles',
  },
  {
    title: 'Indentation, no braces',
    body: 'A line that opens a block simply ends, and the indented lines below it are the block. Spaces only, so a file looks the same in every editor.',
    snippet: 'blocks',
    icon: 'layers',
  },
  {
    title: 'One number type',
    body: '`6 / 2` is `3` and `7 / 2` is `3.5`. There is no integer-versus-float trap. Whole numbers are exact and have no size limit.',
    snippet: 'numbers',
    icon: 'hash',
  },
  {
    title: 'Strict about types',
    body: 'No truthiness and no hidden conversions. LZY would rather say “I do not know what you meant” than quietly do the wrong thing.',
    snippet: 'truthy',
    icon: 'shield',
  },
];

export interface UseCase {
  id: string;
  title: string;
  icon: IconName;
  status: Status;
  /** Which version the roadmap plans it for, when it is not available yet. */
  target?: string;
  summary: string;
  detail: string;
  /** Example programs in the repository that show it. */
  examples?: string[];
  /** Documentation that covers it. */
  docs?: { label: string; to: string };
}

/**
 * What LZY can be used for, and how honestly each one can be claimed today.
 * "Planned" versions come from ROADMAP.md.
 */
export const useCases: UseCase[] = [
  {
    id: 'education',
    title: 'Learning to program',
    icon: 'education',
    status: 'available',
    summary: 'A first language that gets out of the way.',
    detail:
      'Case-insensitive names, no punctuation to memorise, and error messages that say what happened, where, why and how to fix it. There is a guided course and a REPL for trying ideas one line at a time.',
    examples: ['hello', 'variables', 'conditions', 'loops', 'functions'],
    docs: { label: 'Start the course', to: '/learn/' },
  },
  {
    id: 'teaching-algorithms',
    title: 'Teaching algorithms',
    icon: 'code',
    status: 'available',
    summary: 'Algorithms that read like their description.',
    detail:
      'Recursion, lists, maps and closures are enough for searching, sorting, dynamic programming and classic data structures, written so the idea is on the page rather than hidden under syntax.',
    examples: ['searching', 'sorting', 'coin-change', 'primes', 'stack-and-queue'],
    docs: { label: 'Functions', to: '/docs/functions/' },
  },
  {
    id: 'scripting',
    title: 'Small scripts and calculations',
    icon: 'terminal',
    status: 'available',
    summary: 'Working something out, and printing the answer.',
    detail:
      'Anything that computes from values in the program, or from answers typed in (or piped in) through `ask`. LZY cannot yet read files or command-line arguments, so input comes line by line.',
    examples: ['calculator', 'grade-report', 'word-count'],
    docs: { label: 'Input and output', to: '/docs/input-output/' },
  },
  {
    id: 'language-design',
    title: 'Studying language design',
    icon: 'flask',
    status: 'available',
    summary: 'A small, readable interpreter with its reasoning written down.',
    detail:
      'A hand-written lexer, parser and tree-walking interpreter in plain Python, a formal grammar that mirrors the parser, and a record of every design decision and why it was made.',
    docs: { label: 'Architecture', to: '/architecture/' },
  },
  {
    id: 'security',
    title: 'Defensive security analysis',
    icon: 'shield',
    status: 'experimental',
    summary: 'Log analysis and triage, on data you paste in.',
    detail:
      'The examples count failed logins, pull addresses out of a report and assess passphrase strength. Today the data has to be written into the program or typed in; reading log files needs file access, planned for 0.3.0.',
    examples: ['log-analyser', 'ioc-extract', 'password-strength'],
    docs: { label: 'Security policy', to: '/security/' },
  },
  {
    id: 'data-processing',
    title: 'Data processing',
    icon: 'database',
    status: 'experimental',
    summary: 'Counting, grouping and reporting with lists and maps.',
    detail:
      'Splitting text, counting with maps and sorting results works today. There is no JSON (planned for 0.2.0) and no file access (0.3.0), so data must come from the program itself or from `ask`.',
    examples: ['word-count', 'grade-report'],
    docs: { label: 'Maps', to: '/docs/maps/' },
  },
  {
    id: 'prototyping',
    title: 'Prototyping logic',
    icon: 'sparkles',
    status: 'experimental',
    summary: 'Trying out rules and calculations quickly.',
    detail:
      'Good for working out the logic of something — pricing rules, scoring, validation — in a form anyone can read. Not for shipping it: LZY has no modules, error handling or packaging yet.',
    examples: ['quiz', 'todo-list'],
    docs: { label: 'What LZY does not have yet', to: '/docs/not-yet/' },
  },
  {
    id: 'cli-tools',
    title: 'Command-line tools',
    icon: 'terminal',
    status: 'planned',
    target: '0.3.0',
    summary: 'Tools that take arguments and work on files.',
    detail:
      'Interactive prompts work today through `ask`, but a program cannot read files, its command-line arguments or its environment. File and process access are planned for 0.3.0; reading arguments is not on the roadmap yet.',
    docs: { label: 'Roadmap', to: '/roadmap/' },
  },
  {
    id: 'automation',
    title: 'Automation',
    icon: 'zap',
    status: 'planned',
    target: '0.3.0',
    summary: 'Scripts that act on the system around them.',
    detail:
      'LZY deliberately has no file, network or process access yet. The roadmap adds files, processes (with arguments passed as a list, never a shell string) and HTTP in 0.3.0, each with a written security review.',
    docs: { label: 'Roadmap', to: '/roadmap/' },
  },
  {
    id: 'web',
    title: 'Web and backend',
    icon: 'globe',
    status: 'planned',
    target: '0.3.0',
    summary: 'An HTTP client first, then a small server.',
    detail:
      'Planned for 0.3.0, after modules and a standard library in 0.2.0. There is no networking of any kind today.',
    docs: { label: 'Roadmap', to: '/roadmap/' },
  },
  {
    id: 'tooling',
    title: 'Developer tooling',
    icon: 'wrench',
    status: 'planned',
    target: '0.1.0',
    summary: 'A formatter, a linter, then editor support.',
    detail:
      '`lzyfmt` and `lzylint` are planned for 0.1.0; a VS Code extension and a language server for 0.4.0. Today there is the `lzy` command, `lzy check` and the REPL.',
    docs: { label: 'The lzy command', to: '/docs/cli/' },
  },
  {
    id: 'system-utilities',
    title: 'System utilities',
    icon: 'cpu',
    status: 'planned',
    target: '0.3.0',
    summary: 'Small tools for files, processes and machines.',
    detail:
      'These need file and process access, planned for 0.3.0. LZY is an interpreted language and is not aiming to replace systems languages.',
    docs: { label: 'Roadmap', to: '/roadmap/' },
  },
];

export const statusExplained: Array<{ status: Status; text: string }> = [
  { status: 'available', text: 'Works in LZY today, is tested, and has examples.' },
  {
    status: 'experimental',
    text: 'Possible today, with real limits that are stated. Fine for learning and trying; not for production.',
  },
  {
    status: 'planned',
    text: 'Not possible yet. On the roadmap, with the version it is planned for.',
  },
];
