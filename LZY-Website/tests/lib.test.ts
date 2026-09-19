import { describe, expect, it } from 'vitest';

import { escapeHtml, highlightLzy, highlightLzyError, highlightShell } from '@/lib/highlight';
import { exampleTitle, markMatches, search, type SearchEntry } from '@/lib/search';
import { createSlugger, slug } from '@/lib/slug';

describe('slug', () => {
  // The same cases tools/check_docs.py produces, so repository links land here.
  it.each([
    ['## 14. What LZY does not have yet', '14-what-lzy-does-not-have-yet'],
    ['### D-001 — Licence: Apache-2.0 ✅', 'd-001-licence-apache-20'],
    ['### 7.6 `ask`', '76-ask'],
    ['### starts_with', 'startswith'],
    ['[Unreleased]', 'unreleased'],
  ])('%s -> %s', (title, expected) => {
    expect(slug(title.replace(/^#+\s*/, ''))).toBe(expected);
  });

  it('numbers repeated headings the way GitHub does', () => {
    const next = createSlugger();
    expect([next('Fixed'), next('Fixed'), next('Fixed')]).toEqual(['fixed', 'fixed-1', 'fixed-2']);
  });
});

describe('highlightLzy', () => {
  it('marks keywords whatever their case', () => {
    expect(highlightLzy('SAY "hi"')).toContain('<span class="tok-keyword">SAY</span>');
    expect(highlightLzy('Say "hi"')).toContain('<span class="tok-keyword">Say</span>');
  });

  it('marks strings, escapes, numbers and comments', () => {
    const html = highlightLzy('x = "a\\n" + 1_000 # note');
    expect(html).toContain('<span class="tok-escape">\\n</span>');
    expect(html).toContain('<span class="tok-number">1_000</span>');
    expect(html).toContain('<span class="tok-comment"># note</span>');
  });

  it('marks built-ins only when they are called', () => {
    expect(highlightLzy('length(x)')).toContain('tok-builtin');
    expect(highlightLzy('length = 3')).not.toContain('tok-builtin');
  });

  it('marks the name a function is defined with', () => {
    expect(highlightLzy('function add(a, b)')).toContain('<span class="tok-fn">add</span>');
  });

  it('escapes HTML in code instead of passing it through', () => {
    const html = highlightLzy('say "<script>alert(1)</script>"');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

describe('other highlighters', () => {
  it('shell: the first word is the command and dashes are flags', () => {
    const html = highlightShell('lzy --safe program.lzy  # run it');
    expect(html).toContain('<span class="tok-cmd">lzy</span>');
    expect(html).toContain('<span class="tok-flag">--safe</span>');
    expect(html).toContain('<span class="tok-comment"># run it</span>');
  });

  it('errors: heading, caret and suggestion are marked', () => {
    const html = highlightLzyError(
      "Type error on line 1.\n\n'+' cannot add.\n\n    say 1 + x\n          ^\n\nMaybe you meant:\n\n    1 + number(x)",
    );
    expect(html).toContain('tok-err-head');
    expect(html).toContain('tok-err-caret');
    expect(html).toContain('tok-err-label');
    expect(html).toContain('tok-builtin');
  });

  it('escapeHtml escapes every character that matters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('search', () => {
  const index: SearchEntry[] = [
    {
      route: '/docs/stdlib/',
      anchor: 'append',
      title: 'append()',
      section: 'Lists and maps',
      text: 'Add an item to the end of a list.',
      kind: 'Built-in',
    },
    {
      route: '/docs/lists/',
      anchor: '',
      title: 'Lists',
      section: '',
      text: 'A list holds values in order. Use append to add.',
      kind: 'Guide',
    },
    {
      route: '/docs/maps/',
      anchor: '',
      title: 'Maps',
      section: '',
      text: 'Keys and values.',
      kind: 'Guide',
    },
  ];

  it('puts an exact title match first', () => {
    expect(search(index, 'append')[0]?.title).toBe('append()');
  });

  it('needs every word to match', () => {
    expect(search(index, 'append keys')).toHaveLength(0);
    expect(search(index, 'list values').map((result) => result.title)).toEqual(['Lists']);
  });

  it('returns nothing for an empty query', () => {
    expect(search(index, '   ')).toEqual([]);
  });

  it('splits text around matches for highlighting', () => {
    expect(markMatches('Add an item', 'item')).toEqual([
      { text: 'Add an ', match: false },
      { text: 'item', match: true },
    ]);
  });

  it('titles examples readably', () => {
    expect(exampleTitle('coin-change')).toBe('Coin change');
    expect(exampleTitle('fizzbuzz')).toBe('FizzBuzz');
  });
});
