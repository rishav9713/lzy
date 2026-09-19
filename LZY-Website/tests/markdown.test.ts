// @vitest-environment node
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { createContent } from '../plugins/lzy-content';
import { codeStyle, renderMarkdown } from '../plugins/markdown';

const noLinks = { resolveLink: (href: string) => href };

describe('renderMarkdown', () => {
  it('takes the title from the first heading and the description from the first paragraph', () => {
    const doc = renderMarkdown('# Title\n\nFirst paragraph.\n\n## Part\n\nMore.', noLinks);
    expect(doc.title).toBe('Title');
    expect(doc.description).toBe('First paragraph.');
    expect(doc.headings).toEqual([{ depth: 2, text: 'Part', id: 'part' }]);
  });

  it('escapes raw HTML instead of rendering it', () => {
    const doc = renderMarkdown(
      '# T\n\nHello <img src=x onerror=alert(1)>\n\n<script>alert(1)</script>\n',
      noLinks,
    );
    const html = doc.segments
      .map((segment) => (segment.kind === 'html' ? segment.html : ''))
      .join('');
    expect(html).not.toMatch(/<img src=x/);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('drops ordinary HTML comments and turns component directives into segments', () => {
    const doc = renderMarkdown(
      '# T\n\nIntro.\n\n<!-- a note -->\n\n<!-- lzy:component cli-help -->\n\nAfter.\n',
      noLinks,
    );
    expect(doc.segments.map((segment) => segment.kind)).toEqual(['html', 'component', 'html']);
    expect(JSON.stringify(doc.segments)).not.toContain('a note');
  });

  it('labels an untagged block after a snippet as its output', () => {
    expect(codeStyle('', '4', 'lzy').label).toBe('Output');
    expect(codeStyle('output', 'x', 'lzy-broken').label).toBe('Error message');
    expect(codeStyle('', 'Type error on line 3.', undefined).label).toBe('Error message');
  });

  it('marks external links so they open safely', () => {
    const doc = renderMarkdown('# T\n\nSee [GitHub](https://github.com).\n', noLinks);
    const html = doc.segments[0]!.kind === 'html' ? doc.segments[0]!.html : '';
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('wraps questions in an accordion when the document asks for it', () => {
    const doc = renderMarkdown(
      '# FAQ\n\nIntro.\n\n<!-- lzy:accordion -->\n\n## Group\n\n### Why?\n\nBecause.\n',
      noLinks,
    );
    const html = doc.segments
      .map((segment) => (segment.kind === 'html' ? segment.html : ''))
      .join('');
    expect(html).toContain('<details class="faq-item"');
    expect(doc.headings.map((heading) => heading.text)).toEqual(['Group']);
  });
});

describe('links between repository documents', () => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const content = createContent({
    repoRoot: path.resolve(here, '..', '..'),
    base: '/lzy/',
    repository: 'https://github.com/rishav9713/lzy',
  });
  const resolve = content.resolverFor('LZY-Website/content/docs/functions.md');

  it('turns a link to a rendered document into its page', () => {
    expect(resolve('../../../SPEC.md#10-functions')).toBe('/lzy/docs/specification/#10-functions');
    expect(resolve('scope.md')).toBe('/lzy/docs/scope/');
  });

  it('turns a link to an example into its page', () => {
    expect(resolve('../../../examples/02-algorithms/fibonacci.lzy')).toBe(
      '/lzy/examples/fibonacci/',
    );
  });

  it('sends other repository files to GitHub', () => {
    expect(resolve('../../../PROJECT_STATUS.md')).toBe(
      'https://github.com/rishav9713/lzy/blob/main/PROJECT_STATUS.md',
    );
  });

  it('keeps site routes and adds the base path', () => {
    expect(resolve('/install/')).toBe('/lzy/install/');
  });

  it('fails on a link to a file that does not exist', () => {
    expect(() => resolve('no-such-page.md')).toThrow(/does not exist/);
  });
});
