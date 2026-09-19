// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { footerColumns, mainNav, sidebar } from '@/content/navigation';
import { contentEntries } from '@/content/registry';
import { useCases } from '@/content/home';
import examples from '@/data/generated/examples.json';
import lzy from '@/data/generated/lzy.json';
import { slug } from '@/lib/slug';
import { allRoutes } from '@/routes';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const routes = new Set(allRoutes());

describe('the content registry', () => {
  it.each(contentEntries.map((entry) => [entry.route, entry.source]))(
    '%s is rendered from %s, which exists',
    (_route, source) => {
      expect(fs.existsSync(path.join(repoRoot, source))).toBe(true);
    },
  );

  it('gives every page a unique route with a trailing slash', () => {
    const all = allRoutes();
    expect(new Set(all).size).toBe(all.length);
    for (const route of all) expect(route).toMatch(/^\/(.*\/)?$/);
  });
});

describe('navigation', () => {
  const internal = [
    ...mainNav.map((item) => item.to),
    ...sidebar.flatMap((section) => section.items.map((item) => item.to)),
    ...footerColumns.flatMap((column) =>
      column.links.filter((item) => !item.external).map((item) => item.to),
    ),
    ...useCases.flatMap((useCase) => (useCase.docs ? [useCase.docs.to] : [])),
  ];

  it.each([...new Set(internal)])('%s is a real page', (route) => {
    expect(routes.has(route)).toBe(true);
  });

  it('only links use cases to examples that exist', () => {
    const slugs = new Set(examples.map((example) => example.slug));
    for (const useCase of useCases) {
      for (const example of useCase.examples ?? []) expect(slugs.has(example)).toBe(true);
    }
  });
});

describe('the built-in functions page', () => {
  const page = fs.readFileSync(path.join(repoRoot, 'LZY-Website/content/docs/stdlib.md'), 'utf8');
  const anchors = new Set([...page.matchAll(/^### (.+)$/gm)].map((match) => slug(match[1]!)));

  it.each(lzy.builtins.map((builtin) => builtin.name))('documents %s', (name) => {
    expect(anchors.has(slug(name))).toBe(true);
  });
});

describe('generated data', () => {
  it('comes from the interpreter', () => {
    expect(lzy.project.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(lzy.keywords).toContain('say');
    expect(lzy.builtins.length).toBe(lzy.project.builtins);
    expect(examples.length).toBe(lzy.project.examples);
  });

  it('records a real run of the lzy command', () => {
    expect(lzy.cli.runs.version.stdout.trim()).toBe(`LZY ${lzy.project.version}`);
    expect(lzy.cli.runs.badFlag.exitCode).toBe(2);
    expect(lzy.cli.runs.missingFile.exitCode).toBe(lzy.cli.exitCodes.error);
  });
});
