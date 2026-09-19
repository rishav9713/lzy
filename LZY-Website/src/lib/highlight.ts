/**
 * Syntax highlighting for LZY, shell commands, EBNF and LZY error messages.
 *
 * The keyword and built-in lists are not written here: they come from the
 * interpreter via `generate_data.py`, so a new keyword or built-in is
 * highlighted the day it exists. Output is HTML made of escaped text and
 * `<span class="tok-...">` wrappers, and nothing else.
 */
import lzy from '../data/generated/lzy.json';

const KEYWORDS = new Set(lzy.keywords);
const LITERALS = new Set(['true', 'false', 'nothing']);
const BUILTINS = new Set(lzy.builtins.map((builtin) => builtin.name));

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function span(kind: string, text: string): string {
  return `<span class="tok-${kind}">${escapeHtml(text)}</span>`;
}

/** LZY names are case-insensitive, so keywords are matched after folding. */
function fold(word: string): string {
  return word.normalize('NFKC').toLowerCase();
}

const NUMBER = /^\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d[\d_]*)?/;
const NAME = /^[\p{L}_][\p{L}\p{N}_]*/u;
const OPERATOR = /^(?:==|!=|<=|>=|[<>=+\-*/%])/;
const PUNCTUATION = /^[()[\]{},:.]/;

function highlightString(text: string): string {
  // Escapes are coloured separately, so \n and \u{1F600} stand out.
  let out = '';
  let index = 0;
  while (index < text.length) {
    const escape = /^\\(?:u\{[0-9a-fA-F]*\}?|.)/.exec(text.slice(index));
    if (escape) {
      out += span('escape', escape[0]);
      index += escape[0].length;
      continue;
    }
    const plain = /^[^\\]+/.exec(text.slice(index));
    const chunk = plain ? plain[0] : text[index]!;
    out += span('string', chunk);
    index += chunk.length;
  }
  return out;
}

export function highlightLzy(code: string): string {
  let out = '';
  let index = 0;
  let previousWord = '';

  while (index < code.length) {
    const rest = code.slice(index);
    const char = rest[0]!;

    if (char === '#') {
      const end = rest.indexOf('\n');
      const comment = end === -1 ? rest : rest.slice(0, end);
      out += span('comment', comment);
      index += comment.length;
      continue;
    }

    if (char === '"' || char === "'") {
      let end = 1;
      while (end < rest.length && rest[end] !== char && rest[end] !== '\n') {
        end += rest[end] === '\\' ? 2 : 1;
      }
      const literal = rest.slice(0, Math.min(end + 1, rest.length));
      const closed = literal.endsWith(char) && literal.length > 1;
      const body = closed ? literal.slice(1, -1) : literal.slice(1);
      out += span('string', char) + highlightString(body) + (closed ? span('string', char) : '');
      index += literal.length;
      previousWord = '';
      continue;
    }

    const number = NUMBER.exec(rest);
    if (number) {
      out += span('number', number[0]);
      index += number[0].length;
      previousWord = '';
      continue;
    }

    const name = NAME.exec(rest);
    if (name) {
      const word = name[0];
      const folded = fold(word);
      const next = rest.slice(word.length).match(/^\s*(.)/)?.[1];
      let kind = 'name';
      if (LITERALS.has(folded)) kind = 'literal';
      else if (KEYWORDS.has(folded)) kind = 'keyword';
      else if (previousWord === 'function') kind = 'fn';
      else if (BUILTINS.has(folded) && next === '(') kind = 'builtin';
      else if (next === '(') kind = 'call';
      out += kind === 'name' ? escapeHtml(word) : span(kind, word);
      index += word.length;
      previousWord = folded;
      continue;
    }

    const operator = OPERATOR.exec(rest);
    if (operator) {
      out += span('op', operator[0]);
      index += operator[0].length;
      previousWord = '';
      continue;
    }

    if (PUNCTUATION.test(char)) {
      out += span('punct', char);
      index += 1;
      previousWord = '';
      continue;
    }

    out += escapeHtml(char);
    index += 1;
  }
  return out;
}

/** Commands, flags, strings and comments; enough to read a command line. */
export function highlightShell(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      const comment = /(^|\s)(#.*)$/.exec(line);
      const body = comment ? line.slice(0, comment.index + comment[1]!.length) : line;
      let out = '';
      let first = true;
      for (const part of body.split(/(\s+)/)) {
        if (part === '' || /^\s+$/.test(part)) {
          out += part;
        } else if (first) {
          out += span('cmd', part);
          first = false;
        } else if (/^--?[\w-]/.test(part)) {
          out += span('flag', part);
        } else if (/^["'].*["']$/.test(part)) {
          out += span('string', part);
        } else {
          out += escapeHtml(part);
        }
        if (part === '&&' || part === '|' || part === ';') first = true;
      }
      return out + (comment ? span('comment', comment[2]!) : '');
    })
    .join('\n');
}

/** The notation used by docs/spec/grammar.ebnf. */
export function highlightEbnf(code: string): string {
  let out = '';
  let index = 0;
  while (index < code.length) {
    const rest = code.slice(index);
    const comment = /^\(\*[\s\S]*?\*\)/.exec(rest);
    const special = /^\?[^?]*\?/.exec(rest);
    const terminal = /^("[^"\n]*"|'[^'\n]*')/.exec(rest);
    const name = /^[A-Za-z][\w ]*[A-Za-z]|^[A-Za-z]/.exec(rest);
    if (comment) {
      out += span('comment', comment[0]);
      index += comment[0].length;
    } else if (special) {
      out += span('comment', special[0]);
      index += special[0].length;
    } else if (terminal) {
      out += span('string', terminal[0]);
      index += terminal[0].length;
    } else if (/^[=|;]/.test(rest)) {
      out += span('op', rest[0]!);
      index += 1;
    } else if (/^[[\]{}(),]/.test(rest)) {
      out += span('punct', rest[0]!);
      index += 1;
    } else if (name) {
      const upper = /^[A-Z]+$/.test(name[0]);
      out += upper ? span('keyword', name[0]) : span('rule', name[0]);
      index += name[0].length;
    } else {
      out += escapeHtml(rest[0]!);
      index += 1;
    }
  }
  return out;
}

/**
 * An LZY error message, laid out the way the interpreter prints it: a header,
 * the message, the offending line with carets, a hint, and "Maybe you meant".
 */
export function highlightLzyError(text: string): string {
  const lines = text.replace(/\n$/, '').split('\n');
  let suggesting = false;
  return lines
    .map((line, index) => {
      if (index === 0 && /^[A-Z][a-z ]+(?: in .+?,)?(?: on line \d+)?\.$/.test(line)) {
        return span('err-head', line);
      }
      if (/^\s*\^+\s*$/.test(line)) return span('err-caret', line);
      if (line === 'Maybe you meant:') {
        suggesting = true;
        return span('err-label', line);
      }
      if (suggesting && line.startsWith('    ')) {
        return '    ' + highlightLzy(line.slice(4));
      }
      const next = lines[index + 1];
      if (line.startsWith('    ') && next !== undefined && /^\s*\^+\s*$/.test(next)) {
        return '    ' + highlightLzy(line.slice(4));
      }
      return escapeHtml(line);
    })
    .join('\n');
}

export type Language = 'lzy' | 'lzy-broken' | 'shell' | 'ebnf' | 'error' | 'text';

export function highlight(code: string, language: Language): string {
  switch (language) {
    case 'lzy':
    case 'lzy-broken':
      return highlightLzy(code);
    case 'shell':
      return highlightShell(code);
    case 'ebnf':
      return highlightEbnf(code);
    case 'error':
      return highlightLzyError(code);
    default:
      return escapeHtml(code);
  }
}
