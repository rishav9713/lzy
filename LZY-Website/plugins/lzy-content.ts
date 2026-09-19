/**
 * The Vite plugin that turns repository documents into website pages.
 *
 * It provides:
 *
 * - `<file>?lzy-doc` modules: one rendered document each, loaded on demand,
 *   so a page only downloads its own text;
 * - `virtual:lzy-pages`: every document page's route, title and description,
 *   plus a loader for each, for the router, sidebar and sitemap;
 * - `virtual:lzy-search`: the text of every document, split by heading, for
 *   the search dialog (loaded only when search is opened);
 * - `virtual:lzy-roadmap` and `virtual:lzy-releases`: data read from
 *   ROADMAP.md, CHANGELOG.md and docs/releases/.
 *
 * A link from a document to a file that does not exist fails the build.
 */
import fs from 'node:fs';
import path from 'node:path';

import { normalizePath, type Plugin, type ViteDevServer } from 'vite';

import {
  contentEntries,
  pathRoutes,
  readmeAnchors,
  releaseNotes,
  type ContentEntry,
} from '../src/content/registry';
import {
  createFragmentRenderer,
  renderGrammar,
  renderMarkdown,
  renderPlainText,
  type RenderedDocument,
} from './markdown';
import {
  compareVersionsDescending,
  parseChangelog,
  parseReleaseNotes,
  parseRoadmap,
} from './project-data';

export interface LzyContentOptions {
  /** The repository root, which holds SPEC.md and the rest. */
  repoRoot: string;
  /** The website's base path, e.g. `/lzy/`. */
  base: string;
  /** The repository on GitHub, for links to files that have no page here. */
  repository: string;
}

const QUERY = '?lzy-doc';
const VIRTUAL_IDS = [
  'virtual:lzy-pages',
  'virtual:lzy-search',
  'virtual:lzy-roadmap',
  'virtual:lzy-releases',
];

export interface RenderedEntry extends RenderedDocument {
  route: string;
  source: string;
  layout: ContentEntry['layout'];
  before?: string;
}

export function createContent(options: LzyContentOptions) {
  const { repoRoot, repository } = options;
  const base = options.base.endsWith('/') ? options.base : `${options.base}/`;
  const posix = path.posix;

  const absolute = (source: string) => normalizePath(path.join(repoRoot, source));
  const withBase = (route: string) => base.replace(/\/$/, '') + route;

  function releaseEntries(): ContentEntry[] {
    const directory = path.join(repoRoot, releaseNotes.directory);
    if (!fs.existsSync(directory)) return [];
    return fs
      .readdirSync(directory)
      .map((name) => /^v(\d+\.\d+\.\d+)\.md$/.exec(name))
      .filter((match): match is RegExpExecArray => match !== null)
      .sort((a, b) => compareVersionsDescending(a[1]!, b[1]!))
      .map((match) => ({
        route: releaseNotes.route(match[1]!),
        source: `${releaseNotes.directory}/${match[0]}`,
        layout: 'page' as const,
      }));
  }

  function entries(): ContentEntry[] {
    return [...contentEntries, ...releaseEntries()];
  }

  /** The website page for a repository path, if it has one. */
  function routeFor(target: string, anchor: string): string | null {
    if (target === 'README.md') {
      const route = readmeAnchors[anchor];
      return route ?? null;
    }
    const entry = entries().find((candidate) => candidate.source === target);
    if (entry) return entry.route + (anchor ? `#${anchor}` : '');
    for (const { pattern, route } of pathRoutes) {
      const match = pattern.exec(target);
      if (match) {
        const found = route(match);
        return found.includes('#') || !anchor ? found : `${found}#${anchor}`;
      }
    }
    return null;
  }

  /** Resolve a link written in `file` (a repository path). */
  function resolverFor(file: string) {
    return (href: string): string => {
      if (/^(?:https?:|mailto:|tel:)/.test(href)) return href;
      if (href.startsWith('#')) return href;
      if (href.startsWith('/')) return withBase(href);

      const [pathPart = '', anchor = ''] = href.split('#');
      const target = posix
        .normalize(posix.join(posix.dirname(file), decodeURIComponent(pathPart)))
        .replace(/\/$/, '');
      if (target.startsWith('..')) {
        throw new Error(`${file}: the link "${href}" points outside the repository`);
      }

      const route = routeFor(target, anchor);
      if (route) return withBase(route);

      const onDisk = path.join(repoRoot, target);
      if (!fs.existsSync(onDisk)) {
        throw new Error(`${file}: the link "${href}" points at ${target}, which does not exist`);
      }
      const kind = fs.statSync(onDisk).isDirectory() ? 'tree' : 'blob';
      return `${repository}/${kind}/main/${target}${anchor ? `#${anchor}` : ''}`;
    };
  }

  const cache = new Map<string, { mtime: number; rendered: RenderedEntry }>();

  function render(entry: ContentEntry): RenderedEntry {
    const file = path.join(repoRoot, entry.source);
    const mtime = fs.statSync(file).mtimeMs;
    const cached = cache.get(entry.route);
    if (cached && cached.mtime === mtime) return cached.rendered;

    const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    let document: RenderedDocument;
    if (entry.source.endsWith('.md')) {
      document = renderMarkdown(text, { resolveLink: resolverFor(entry.source) });
    } else if (entry.source.endsWith('.ebnf')) {
      document = renderGrammar(text, entry.title ?? '', entry.description ?? '');
    } else {
      document = renderPlainText(text, entry.title ?? '', entry.description ?? '');
    }

    const rendered: RenderedEntry = {
      ...document,
      title: entry.title ?? document.title,
      description: entry.description ?? document.description,
      route: entry.route,
      source: entry.source,
      layout: entry.layout,
      ...(entry.before ? { before: entry.before } : {}),
    };
    if (!rendered.title) throw new Error(`${entry.source} has no title`);
    if (!rendered.description) throw new Error(`${entry.source} has no opening paragraph`);
    cache.set(entry.route, { mtime, rendered });
    return rendered;
  }

  function pagesModule(): string {
    const all = entries().map(render);
    const meta = all.map(({ route, source, layout, title, description, before }) => ({
      route,
      source,
      layout,
      title,
      description,
      ...(before ? { before } : {}),
    }));
    const loaders = all
      .map(
        (entry) =>
          `  ${JSON.stringify(entry.route)}: () => import(${JSON.stringify(absolute(entry.source) + QUERY)}),`,
      )
      .join('\n');
    return `export const pages = ${JSON.stringify(meta)};\nexport const loaders = {\n${loaders}\n};\n`;
  }

  function searchModule(): string {
    const documents = entries()
      .filter((entry) => !entry.hidden)
      .map(render)
      .map(({ route, title, sections }) => ({ route, title, sections }));
    return `export default ${JSON.stringify(documents)};\n`;
  }

  function roadmapModule(): string {
    const fragments = createFragmentRenderer({ resolveLink: resolverFor('ROADMAP.md') });
    const source = fs.readFileSync(path.join(repoRoot, 'ROADMAP.md'), 'utf8');
    return `export default ${JSON.stringify(parseRoadmap(source.replace(/\r\n/g, '\n'), fragments))};\n`;
  }

  function releasesModule(): string {
    const fragments = createFragmentRenderer({ resolveLink: resolverFor('CHANGELOG.md') });
    const changelog = parseChangelog(
      fs.readFileSync(path.join(repoRoot, 'CHANGELOG.md'), 'utf8').replace(/\r\n/g, '\n'),
      fragments,
    );
    const released = changelog
      .filter((entry) => /^\d+\.\d+\.\d+$/.test(entry.version))
      .sort((a, b) => compareVersionsDescending(a.version, b.version))
      .map((entry, index) => {
        const notesFile = path.join(repoRoot, releaseNotes.directory, `v${entry.version}.md`);
        const notes = fs.existsSync(notesFile)
          ? parseReleaseNotes(entry.version, fs.readFileSync(notesFile, 'utf8'))
          : { version: entry.version, name: '', assets: [] };
        return {
          ...entry,
          name: notes.name,
          latest: index === 0,
          notesRoute: fs.existsSync(notesFile) ? releaseNotes.route(entry.version) : null,
          githubUrl: `${repository}/releases/tag/v${entry.version}`,
          assets: notes.assets.map((asset) => ({
            ...asset,
            url: `${repository}/releases/download/v${entry.version}/${asset.file}`,
          })),
        };
      });
    const unreleased = changelog.find((entry) => entry.version.toLowerCase() === 'unreleased');
    return (
      `export const releases = ${JSON.stringify(released)};\n` +
      `export const unreleased = ${JSON.stringify(unreleased ?? null)};\n`
    );
  }

  function watchedFiles(): string[] {
    return [
      ...entries().map((entry) => path.join(repoRoot, entry.source)),
      path.join(repoRoot, 'ROADMAP.md'),
      path.join(repoRoot, 'CHANGELOG.md'),
    ];
  }

  return {
    entries,
    render,
    resolverFor,
    pagesModule,
    searchModule,
    roadmapModule,
    releasesModule,
    watchedFiles,
    absolute,
  };
}

export function lzyContent(options: LzyContentOptions): Plugin {
  const content = createContent(options);
  let server: ViteDevServer | undefined;

  return {
    name: 'lzy-content',
    enforce: 'pre',

    resolveId(id) {
      if (VIRTUAL_IDS.includes(id)) return `\0${id}`;
      return undefined;
    },

    load(id) {
      if (id.startsWith('\0virtual:lzy-')) {
        for (const file of content.watchedFiles()) this.addWatchFile(file);
        switch (id.slice(1)) {
          case 'virtual:lzy-pages':
            return content.pagesModule();
          case 'virtual:lzy-search':
            return content.searchModule();
          case 'virtual:lzy-roadmap':
            return content.roadmapModule();
          case 'virtual:lzy-releases':
            return content.releasesModule();
        }
      }

      if (id.endsWith(QUERY)) {
        const file = normalizePath(id.slice(0, -QUERY.length));
        const entry = content
          .entries()
          .find(
            (candidate) => content.absolute(candidate.source).toLowerCase() === file.toLowerCase(),
          );
        if (!entry) throw new Error(`${file} is not listed in src/content/registry.ts`);
        this.addWatchFile(path.join(options.repoRoot, entry.source));
        const { route, source, title, description, headings, segments } = content.render(entry);
        return `export default ${JSON.stringify({ route, source, title, description, headings, segments })};\n`;
      }
      return undefined;
    },

    configureServer(devServer) {
      server = devServer;
      devServer.watcher.add(content.watchedFiles());
    },

    handleHotUpdate({ file }) {
      const changed = normalizePath(file).toLowerCase();
      const watched = content.watchedFiles().map((item) => normalizePath(item).toLowerCase());
      if (!server || !watched.includes(changed)) return undefined;
      for (const id of VIRTUAL_IDS) {
        const module = server.moduleGraph.getModuleById(`\0${id}`);
        if (module) server.moduleGraph.invalidateModule(module);
      }
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}
