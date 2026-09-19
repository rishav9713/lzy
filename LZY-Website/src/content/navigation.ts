/**
 * The site's navigation: the top bar, the documentation sidebar and the
 * footer. A test checks that every route listed here is a real page.
 */
import { links } from '@/data/site';

export interface NavLink {
  label: string;
  to: string;
  /** Shown as a small tag beside the label. */
  tag?: string;
}

export const mainNav: NavLink[] = [
  { label: 'Docs', to: '/docs/' },
  { label: 'Language', to: '/language/' },
  { label: 'Examples', to: '/examples/' },
  { label: 'Use cases', to: '/use-cases/' },
  { label: 'Playground', to: '/playground/', tag: 'Soon' },
  { label: 'Roadmap', to: '/roadmap/' },
];

export interface SidebarSection {
  title: string;
  items: NavLink[];
}

export const sidebar: SidebarSection[] = [
  {
    title: 'Getting started',
    items: [
      { label: 'Introduction', to: '/docs/introduction/' },
      { label: 'Getting started', to: '/getting-started/' },
      { label: 'Installation', to: '/install/' },
      { label: 'Hello World', to: '/docs/hello-world/' },
      { label: 'Your first project', to: '/docs/first-project/' },
    ],
  },
  {
    title: 'Learn LZY',
    items: [
      { label: 'The course', to: '/learn/' },
      { label: '1 · Your first program', to: '/learn/first-program/' },
      { label: '2 · Keeping things', to: '/learn/variables/' },
      { label: '3 · Making decisions', to: '/learn/decisions/' },
      { label: '4 · Doing things many times', to: '/learn/loops/' },
      { label: '5 · Naming a piece of work', to: '/learn/functions/' },
    ],
  },
  {
    title: 'Language guide',
    items: [
      { label: 'Syntax and layout', to: '/docs/syntax/' },
      { label: 'Names and case', to: '/docs/names/' },
      { label: 'Variables', to: '/docs/variables/' },
      { label: 'Types and values', to: '/docs/types/' },
      { label: 'Numbers', to: '/docs/numbers/' },
      { label: 'Text', to: '/docs/text/' },
      { label: 'Operators', to: '/docs/operators/' },
      { label: 'Conditions', to: '/docs/conditions/' },
      { label: 'Loops', to: '/docs/loops/' },
      { label: 'Functions', to: '/docs/functions/' },
      { label: 'Lists', to: '/docs/lists/' },
      { label: 'Maps', to: '/docs/maps/' },
      { label: 'Scope', to: '/docs/scope/' },
      { label: 'Input and output', to: '/docs/input-output/' },
      { label: 'Errors', to: '/docs/errors/' },
      { label: 'Not in LZY yet', to: '/docs/not-yet/' },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'The lzy command', to: '/docs/cli/' },
      { label: 'The REPL', to: '/docs/repl/' },
      { label: 'Safe mode and limits', to: '/docs/limits/' },
      { label: 'Debugging', to: '/debug/' },
      { label: 'Troubleshooting', to: '/troubleshooting/' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Language at a glance', to: '/language/' },
      { label: 'Built-in functions', to: '/docs/stdlib/' },
      { label: 'Keywords', to: '/docs/keywords/' },
      { label: 'Specification', to: '/docs/specification/' },
      { label: 'Formal grammar', to: '/docs/grammar/' },
      { label: 'Design decisions', to: '/docs/design-decisions/' },
    ],
  },
  {
    title: 'Development',
    items: [
      { label: 'Architecture', to: '/architecture/' },
      { label: 'Testing', to: '/docs/testing/' },
      { label: 'Contributing', to: '/contributing/' },
      { label: 'Language proposals', to: '/docs/leps/' },
      { label: 'Packages', to: '/docs/packages/', tag: 'Planned' },
    ],
  },
];

export interface FooterColumn {
  title: string;
  links: Array<NavLink & { external?: boolean }>;
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Documentation', to: '/docs/' },
      { label: 'Examples', to: '/examples/' },
      { label: 'Playground', to: '/playground/' },
      { label: 'Download', to: '/download/' },
      { label: 'Roadmap', to: '/roadmap/' },
      { label: 'Releases', to: '/releases/' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Installation', to: '/install/' },
      { label: 'The lzy command', to: '/docs/cli/' },
      { label: 'Language reference', to: '/language/' },
      { label: 'Troubleshooting', to: '/troubleshooting/' },
      { label: 'FAQ', to: '/faq/' },
      { label: 'Architecture', to: '/architecture/' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', to: links.repository, external: true },
      { label: 'Discussions', to: links.discussions, external: true },
      { label: 'Issues', to: links.issues, external: true },
      { label: 'Contributing', to: '/contributing/' },
      { label: 'Contributors', to: links.contributors, external: true },
      { label: 'Community', to: '/community/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'License', to: '/license/' },
      { label: 'Security', to: '/security/' },
      { label: 'Code of Conduct', to: '/code-of-conduct/' },
      { label: 'Privacy', to: '/privacy/' },
      { label: 'Sitemap', to: '/sitemap/' },
    ],
  },
];
