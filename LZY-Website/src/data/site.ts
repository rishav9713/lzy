/**
 * Facts about the project that every page uses, and the links built from
 * them. Numbers and versions come from the interpreter via generate_data.py;
 * nothing here is typed in twice.
 */
import lzy from './generated/lzy.json';

export const project = lzy.project;

export const site = {
  name: 'LZY',
  fullName: 'LZY Programming Language',
  /** The tagline, used by the specification and the documentation. */
  tagline: 'Complex Logic. Simple Code.',
  /** The shorter line on the artwork. See Logos/README.md for why there are two. */
  artworkLine: 'Code Less. Do More.',
  description:
    'LZY is an open-source programming language built around one idea: a program should say what it does in words a person can read aloud.',
  url: __SITE_URL__,
  repository: __REPOSITORY__,
  owner: 'rishav9713',
  repo: 'lzy',
  version: project.version,
} as const;

const repo = site.repository;

export const links = {
  repository: repo,
  issues: `${repo}/issues`,
  newIssue: `${repo}/issues/new/choose`,
  bugReport: `${repo}/issues/new?template=bug_report.yml`,
  confusingError: `${repo}/issues/new?template=error_message.yml`,
  languageIdea: `${repo}/issues/new?template=language_idea.yml`,
  discussions: `${repo}/discussions`,
  pulls: `${repo}/pulls`,
  releases: `${repo}/releases`,
  latestRelease: `${repo}/releases/latest`,
  contributors: `${repo}/graphs/contributors`,
  securityAdvisory: `${repo}/security/advisories/new`,
  actions: `${repo}/actions/workflows/ci.yml`,
  fork: `${repo}/fork`,
  file: (path: string) => `${repo}/blob/main/${path}`,
  folder: (path: string) => `${repo}/tree/main/${path}`,
  edit: (path: string) => `${repo}/edit/main/${path}`,
  download: (version: string, file: string) => `${repo}/releases/download/v${version}/${file}`,
} as const;

/** The wheel for the current version, which pip can install straight from its URL. */
export const wheel = {
  file: `lzy_lang-${site.version}-py3-none-any.whl`,
  get url() {
    return links.download(site.version, this.file);
  },
};

/** Join the site's base path and a route, e.g. "/docs/" -> "/lzy/docs/". */
export function withBase(route: string): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') + route;
}

/** The absolute address of a route, for canonical links and social cards. */
export function absoluteUrl(route: string): string {
  return site.url + route;
}

/** A public asset, such as "assets/logo/lzy-logo-256.webp". */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '');
}
