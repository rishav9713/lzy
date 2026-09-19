/**
 * Where the website is published.
 *
 * GitHub Pages serves a project site at https://<owner>.github.io/<repo>/, so
 * every link and asset needs the `/lzy/` prefix. With a custom domain the
 * site sits at the root instead. Both are set from the environment, so moving
 * to a custom domain needs no code change:
 *
 *   SITE_URL=https://lzy.example.org SITE_BASE=/ npm run build
 *
 * The deploy workflow sets both from GitHub's own Pages configuration. See
 * docs/deployment.md.
 */
export interface SiteConfig {
  /** Path prefix for every page and asset, always starting and ending in "/". */
  base: string;
  /** The absolute address of the home page, without a trailing slash. */
  siteUrl: string;
  /** The source repository. */
  repository: string;
}

export const DEFAULT_SITE_URL = 'https://rishav9713.github.io/lzy';
export const REPOSITORY = 'https://github.com/rishav9713/lzy';

export function siteConfig(env: Record<string, string | undefined> = process.env): SiteConfig {
  const siteUrl = (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const fromUrl = new URL(siteUrl + '/').pathname;
  let base = env.SITE_BASE || fromUrl;
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return { base, siteUrl, repository: REPOSITORY };
}
