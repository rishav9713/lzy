// Check every link in the built site, before it is published.
//
//   npm run check:links        (after npm run build)
//
// For every HTML file in dist/, every href, src and srcset that points into
// the site must resolve to a file that exists, and every #anchor must name an
// element on the page it points at. Links to other sites are listed but not
// fetched, so the build does not fail because someone else's site is down.
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

async function htmlFiles(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

async function exists(file) {
  try {
    return (await stat(file)).isFile();
  } catch {
    return false;
  }
}

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// The site's base path, read from the built home page's own asset links.
const home = await readFile(path.join(dist, 'index.html'), 'utf8');
const base = /<script type="module" crossorigin src="([^"]*?)assets\//.exec(home)?.[1];
if (!base) throw new Error('Could not work out the base path from dist/index.html');

const idCache = new Map();
async function idsIn(file) {
  if (!idCache.has(file)) {
    const html = await readFile(file, 'utf8');
    idCache.set(
      file,
      new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => decode(match[1]))),
    );
  }
  return idCache.get(file);
}

/** The file a site path is served from, the way GitHub Pages resolves it. */
function fileForPath(sitePath) {
  const clean = decodeURIComponent(sitePath.slice(base.length));
  if (clean === '' || clean.endsWith('/')) return path.join(dist, clean, 'index.html');
  return path.join(dist, clean);
}

const problems = [];
const external = new Map();
let checked = 0;

for (const file of await htmlFiles(dist)) {
  const html = await readFile(file, 'utf8');
  const page = '/' + path.relative(dist, file).split(path.sep).join('/');
  const references = [
    ...[...html.matchAll(/\s(?:href|src)="([^"]*)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/\ssrcset="([^"]*)"/gi)].flatMap((match) =>
      match[1].split(',').map((part) => part.trim().split(/\s+/)[0]),
    ),
  ].map(decode);

  for (const reference of references) {
    if (!reference || reference.startsWith('data:') || reference.startsWith('mailto:')) continue;
    checked += 1;

    if (/^https?:\/\//.test(reference)) {
      const host = new URL(reference).host;
      external.set(host, (external.get(host) ?? 0) + 1);
      continue;
    }

    if (reference.startsWith('#')) {
      const id = decodeURIComponent(reference.slice(1));
      if (id && !(await idsIn(file)).has(id)) problems.push(`${page}: no element with id "${id}"`);
      continue;
    }

    // React Router writes the home page as the base without its final slash.
    if (reference === base.slice(0, -1)) continue;

    if (!reference.startsWith(base)) {
      problems.push(`${page}: "${reference}" does not start with the base path ${base}`);
      continue;
    }

    const [pathPart, anchor] = reference.split('#');
    const target = fileForPath(pathPart.split('?')[0]);
    if (!(await exists(target))) {
      problems.push(`${page}: "${reference}" points at nothing`);
      continue;
    }
    if (anchor && target.endsWith('.html')) {
      const id = decodeURIComponent(anchor);
      if (!(await idsIn(target)).has(id)) problems.push(`${page}: "${reference}" has no "#${id}"`);
    }
  }
}

console.log(
  `check-links: ${checked} references in ${idCache.size ? 'the built site' : 'dist'} checked.`,
);
console.log(
  'External sites linked (not fetched): ' +
    [...external.entries()].map(([host, count]) => `${host} (${count})`).join(', '),
);

if (problems.length) {
  const unique = [...new Set(problems)];
  console.error(`\n${unique.length} broken reference(s):`);
  for (const problem of unique) console.error(`  ${problem}`);
  process.exit(1);
}
console.log('check-links: every internal link, asset and anchor resolves.');
