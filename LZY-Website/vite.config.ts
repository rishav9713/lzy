/// <reference types="vitest/config" />
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import { lzyContent } from './plugins/lzy-content';
import { siteConfig } from './site.config';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..');
const { base, siteUrl, repository } = siteConfig();

/**
 * Make `npm run preview` answer the way GitHub Pages does: a folder serves
 * its index.html, and an address with no file serves 404.html with status
 * 404. Vite's own preview would serve the home page instead, which hides
 * mistakes in the 404 page.
 */
function githubPagesPreview(): Plugin {
  return {
    name: 'github-pages-preview',
    configurePreviewServer(server) {
      const dist = path.join(here, 'dist');
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith(base)) return next();
        const relative = decodeURIComponent(url.pathname.slice(base.length));
        const candidates = [path.join(dist, relative), path.join(dist, relative, 'index.html')];
        if (candidates.some((file) => fs.existsSync(file) && fs.statSync(file).isFile())) {
          return next();
        }
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        response.end(fs.readFileSync(path.join(dist, '404.html')));
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [
    lzyContent({ repoRoot, base, repository }),
    react(),
    tailwindcss(),
    githubPagesPreview(),
  ],
  resolve: {
    alias: { '@': path.join(here, 'src') },
  },
  define: {
    __SITE_URL__: JSON.stringify(siteUrl),
    __REPOSITORY__: JSON.stringify(repository),
  },
  server: {
    // Documents are read from the repository root, one level up.
    fs: { allow: [repoRoot] },
  },
  build: {
    target: 'es2022',
    manifest: true,
    // Never inline fonts as data: addresses. The site's Content-Security-Policy
    // only allows fonts from the site itself, and they cache better as files.
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? false : undefined),
    sourcemap: false,
    reportCompressedSize: false,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
