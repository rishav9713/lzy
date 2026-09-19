// Turn the built app into one static HTML file per page.
//
// Runs after `vite build` and `vite build --ssr`. For every route the app
// knows, it renders the page with React on the server, writes the HTML with
// the page's own title and description, and adds:
//
//   - a Content-Security-Policy that allows only this site's own scripts,
//     plus a hash for each inline script (the theme switcher);
//   - preload hints for the two fonts the first screen needs;
//   - 404.html, which GitHub Pages serves for any address it does not know;
//   - sitemap.xml and robots.txt.
//
// Every page is complete HTML, so it works without JavaScript and can be read
// by search engines; JavaScript then takes over for navigation and search.
import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const serverEntry = path.join(root, '.ssr', 'entry-server.js');

const server = await import(pathToFileURL(serverEntry).href);
const { render, allRoutes, siteUrl, repository, base } = server;

const template = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const marker of ['<!--app-csp-->', '<!--app-head-->', '<!--app-html-->']) {
  if (!template.includes(marker)) throw new Error(`index.html is missing ${marker}`);
}

function sha256(text) {
  return `'sha256-${createHash('sha256').update(text, 'utf8').digest('base64')}'`;
}

function inlineScripts(html) {
  return [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .filter((match) => !/type="application\/ld\+json"/.test(match[0]))
    .map((match) => match[1]);
}

function contentSecurityPolicy(html) {
  const hashes = [...new Set(inlineScripts(html).map(sha256))];
  const policy = [
    "default-src 'self'",
    `script-src 'self' ${hashes.join(' ')}`.trim(),
    // React writes some style attributes; nothing else is inline.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    // Live star counts, and nothing else.
    "connect-src 'self' https://api.github.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
  return `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
}

async function fontPreloads() {
  const files = await readdir(path.join(dist, 'assets'));
  const wanted = [
    /^chakra-petch-latin-700-normal-.*\.woff2$/,
    /^ibm-plex-sans-latin-400-normal-.*\.woff2$/,
  ];
  return wanted
    .map((pattern) => files.find((file) => pattern.test(file)))
    .filter(Boolean)
    .map(
      (file) =>
        `<link rel="preload" href="${base}assets/${file}" as="font" type="font/woff2" crossorigin />`,
    )
    .join('\n    ');
}

function structuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: 'LZY',
    alternateName: 'LZY Programming Language',
    description:
      'An open-source programming language built around one idea: a program should say what it does in words a person can read aloud.',
    url: `${siteUrl}/`,
    codeRepository: repository,
    programmingLanguage: 'Python',
    license: 'https://www.apache.org/licenses/LICENSE-2.0',
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

function fileFor(route) {
  if (route === '/') return path.join(dist, 'index.html');
  return path.join(dist, ...route.split('/').filter(Boolean), 'index.html');
}

const preloads = await fontPreloads();

async function page(route) {
  const { html, head } = await render(route);
  if (!html.includes('<h1')) throw new Error(`${route} rendered without a heading`);
  const extraHead = [head, preloads, route === '/' ? structuredData() : '']
    .filter(Boolean)
    .join('\n    ');
  let output = template.replace('<!--app-head-->', extraHead).replace('<!--app-html-->', html);
  output = output.replace('<!--app-csp-->', contentSecurityPolicy(output));
  return output;
}

const routes = allRoutes();
const seen = new Set();
for (const route of routes) {
  if (seen.has(route)) throw new Error(`${route} is listed twice`);
  seen.add(route);
  if (!route.startsWith('/') || !route.endsWith('/')) {
    throw new Error(`${route} should start and end with "/"`);
  }
  const target = fileFor(route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, await page(route), 'utf8');
}

// GitHub Pages serves 404.html for every unknown address, whatever its depth,
// which is why every link and asset on the site is absolute.
await writeFile(path.join(dist, '404.html'), await page('/404/'), 'utf8');

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`),
  '</urlset>',
  '',
].join('\n');
await writeFile(path.join(dist, 'sitemap.xml'), sitemap, 'utf8');

await writeFile(
  path.join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  'utf8',
);

// Deploying through GitHub Actions does not run Jekyll, but publishing this
// folder from a branch would, and Jekyll skips files starting with "_".
await writeFile(path.join(dist, '.nojekyll'), '', 'utf8');

await rm(path.join(root, '.ssr'), { recursive: true, force: true });

console.log(
  `prerender: ${routes.length} pages, 404.html, sitemap.xml and robots.txt for ${siteUrl}/`,
);
