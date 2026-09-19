/**
 * Every page on the website that is rendered from a document in the
 * repository.
 *
 * `source` is a path from the repository root. Many of these are the
 * repository's own documents (SPEC.md, SECURITY.md, the learning course), so
 * the website and GitHub show the same words and cannot drift apart. The rest
 * live in `LZY-Website/content/`.
 *
 * This file is read at build time by the content plugin, as well as by the
 * app, so it must stay plain data: no React, no browser APIs.
 */

export type ContentLayout = 'docs' | 'page';

export interface ContentEntry {
  /** The website path, always with a trailing slash. */
  route: string;
  /** Path from the repository root. */
  source: string;
  /** `docs` has the documentation sidebar; `page` is a plain reading page. */
  layout: ContentLayout;
  /** A component shown between the page header and the document. */
  before?: string;
  /** Used when the document has no title of its own (LICENSE, grammar). */
  title?: string;
  description?: string;
  /** Leave out of search and the sitemap. */
  hidden?: boolean;
}

const site = 'LZY-Website/content';

export const contentEntries: ContentEntry[] = [
  // Getting started
  { route: '/getting-started/', source: `${site}/pages/getting-started.md`, layout: 'docs' },
  { route: '/install/', source: `${site}/pages/install.md`, layout: 'docs' },
  { route: '/docs/introduction/', source: `${site}/docs/introduction.md`, layout: 'docs' },
  { route: '/docs/hello-world/', source: `${site}/docs/hello-world.md`, layout: 'docs' },
  { route: '/docs/first-project/', source: `${site}/docs/first-project.md`, layout: 'docs' },

  // The course, straight from docs/learn
  { route: '/learn/', source: 'docs/learn/README.md', layout: 'docs' },
  { route: '/learn/first-program/', source: 'docs/learn/01-first-program.md', layout: 'docs' },
  { route: '/learn/variables/', source: 'docs/learn/02-variables.md', layout: 'docs' },
  { route: '/learn/decisions/', source: 'docs/learn/03-decisions.md', layout: 'docs' },
  { route: '/learn/loops/', source: 'docs/learn/04-loops.md', layout: 'docs' },
  { route: '/learn/functions/', source: 'docs/learn/05-functions.md', layout: 'docs' },

  // Language guide
  { route: '/docs/syntax/', source: `${site}/docs/syntax.md`, layout: 'docs' },
  { route: '/docs/names/', source: `${site}/docs/names.md`, layout: 'docs' },
  { route: '/docs/variables/', source: `${site}/docs/variables.md`, layout: 'docs' },
  { route: '/docs/types/', source: `${site}/docs/types.md`, layout: 'docs' },
  { route: '/docs/numbers/', source: `${site}/docs/numbers.md`, layout: 'docs' },
  { route: '/docs/text/', source: `${site}/docs/text.md`, layout: 'docs' },
  { route: '/docs/operators/', source: `${site}/docs/operators.md`, layout: 'docs' },
  { route: '/docs/conditions/', source: `${site}/docs/conditions.md`, layout: 'docs' },
  { route: '/docs/loops/', source: `${site}/docs/loops.md`, layout: 'docs' },
  { route: '/docs/functions/', source: `${site}/docs/functions.md`, layout: 'docs' },
  { route: '/docs/lists/', source: `${site}/docs/lists.md`, layout: 'docs' },
  { route: '/docs/maps/', source: `${site}/docs/maps.md`, layout: 'docs' },
  { route: '/docs/scope/', source: `${site}/docs/scope.md`, layout: 'docs' },
  { route: '/docs/input-output/', source: `${site}/docs/input-output.md`, layout: 'docs' },
  { route: '/docs/errors/', source: `${site}/docs/errors.md`, layout: 'docs' },
  { route: '/docs/not-yet/', source: `${site}/docs/not-yet.md`, layout: 'docs' },

  // Tools
  { route: '/docs/cli/', source: `${site}/docs/cli.md`, layout: 'docs' },
  { route: '/docs/repl/', source: `${site}/docs/repl.md`, layout: 'docs' },
  { route: '/docs/limits/', source: `${site}/docs/limits.md`, layout: 'docs' },
  { route: '/debug/', source: `${site}/pages/debug.md`, layout: 'docs' },
  { route: '/troubleshooting/', source: `${site}/pages/troubleshooting.md`, layout: 'docs' },

  // Reference
  { route: '/language/', source: `${site}/pages/language.md`, layout: 'docs' },
  { route: '/docs/stdlib/', source: `${site}/docs/stdlib.md`, layout: 'docs' },
  { route: '/docs/keywords/', source: `${site}/docs/keywords.md`, layout: 'docs' },
  { route: '/docs/specification/', source: 'SPEC.md', layout: 'docs' },
  {
    route: '/docs/grammar/',
    source: 'docs/spec/grammar.ebnf',
    layout: 'docs',
    title: 'Formal grammar',
    description:
      'The complete LZY grammar in EBNF, written to read function-for-function like the parser.',
  },
  { route: '/docs/design-decisions/', source: 'docs/OWNER_DECISIONS.md', layout: 'docs' },

  // Development
  { route: '/architecture/', source: `${site}/pages/architecture.md`, layout: 'docs' },
  { route: '/docs/testing/', source: `${site}/docs/testing.md`, layout: 'docs' },
  {
    route: '/contributing/',
    source: 'CONTRIBUTING.md',
    layout: 'docs',
    before: 'contribution-flow',
  },
  { route: '/docs/leps/', source: 'docs/leps/README.md', layout: 'docs' },
  { route: '/docs/packages/', source: `${site}/docs/packages.md`, layout: 'docs' },

  // Project pages
  { route: '/security/', source: 'SECURITY.md', layout: 'page', before: 'security-summary' },
  { route: '/changelog/', source: 'CHANGELOG.md', layout: 'page' },
  { route: '/code-of-conduct/', source: 'CODE_OF_CONDUCT.md', layout: 'page' },
  {
    route: '/license/',
    source: 'LICENSE',
    layout: 'page',
    before: 'license-summary',
    title: 'License',
    description:
      'LZY is released under the Apache License, Version 2.0. This is the full text of the licence, exactly as it appears in the repository.',
  },
  { route: '/faq/', source: `${site}/pages/faq.md`, layout: 'page' },
  { route: '/privacy/', source: `${site}/pages/privacy.md`, layout: 'page' },
];

/** Where a release's notes live in the repository, and the page they get. */
export const releaseNotes = {
  directory: 'docs/releases',
  route: (version: string) => `/releases/v${version}/`,
};

/**
 * Repository paths that are not documents of their own but still have a
 * natural page on the website. Used when a document links to them.
 */
export const pathRoutes: Array<{ pattern: RegExp; route: (match: RegExpExecArray) => string }> = [
  { pattern: /^examples\/[^/]+\/([^/]+)\.lzy$/, route: (match) => `/examples/${match[1]}/` },
  { pattern: /^examples(?:\/[^/]+)?$/, route: () => '/examples/' },
  { pattern: /^docs\/learn$/, route: () => '/learn/' },
  { pattern: /^docs\/leps$/, route: () => '/docs/leps/' },
  { pattern: /^NOTICE$/, route: () => '/license/#notice' },
  { pattern: /^ROADMAP\.md$/, route: () => '/roadmap/' },
];

/** README.md is the home page; its install section has a page of its own. */
export const readmeAnchors: Record<string, string> = {
  '': '/',
  installing: '/install/',
  'hello-world': '/docs/hello-world/',
  'using-the-lzy-command': '/docs/cli/',
  errors: '/docs/errors/',
  roadmap: '/roadmap/',
  security: '/security/',
  contributing: '/contributing/',
  license: '/license/',
};
