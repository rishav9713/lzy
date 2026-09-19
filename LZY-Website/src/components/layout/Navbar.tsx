import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { mainNav, sidebar } from '@/content/navigation';
import { links, site } from '@/data/site';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';
import { cx } from '@/lib/cx';

import { Wordmark } from '../Logo';
import { useSearch } from '../search/SearchContext';
import { Icon } from '../ui/Icon';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';

const docsRoutes = new Set(sidebar.flatMap((section) => section.items.map((item) => item.to)));

/** Whether a top-level link should show as the current section. */
export function isSectionActive(to: string, pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (to === '/docs/') {
    return path !== '/language/' && (path.startsWith('/docs/') || docsRoutes.has(path));
  }
  return path.startsWith(to);
}

function formatCount(count: number): string {
  return count >= 1000 ? `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(count);
}

export function Navbar() {
  const { pathname } = useLocation();
  const { open } = useSearch();
  const stats = useGitHubRepo();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cx(
        'glass sticky top-0 z-50 border-b transition-[border-color,box-shadow] duration-300',
        scrolled ? 'border-line shadow-[0_10px_30px_-20px_rgb(0_0_0/0.6)]' : 'border-transparent',
      )}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[90rem] items-center gap-2 px-4 sm:px-6 lg:px-8"
      >
        <Link
          to="/"
          className="mr-2 flex shrink-0 items-center rounded-lg"
          aria-label={`${site.fullName}, home`}
        >
          <Wordmark size={34} />
        </Link>

        <ul className="hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) => {
            const active = isSectionActive(item.to, pathname);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'relative inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[0.925rem] transition-colors',
                    active ? 'text-fg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
                  )}
                >
                  {item.label}
                  {item.tag && (
                    <span className="rounded border border-line px-1 font-mono text-[0.6rem] tracking-wide text-fg-subtle uppercase">
                      {item.tag}
                    </span>
                  )}
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => open()}
            className="hidden h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3 text-sm text-fg-subtle transition-colors hover:border-line-strong hover:text-fg md:inline-flex"
            aria-label="Search documentation"
          >
            <Icon name="search" className="size-4" />
            <span className="pr-6">Search docs…</span>
            <kbd className="rounded border border-line px-1.5 font-mono text-[0.7rem]">Ctrl K</kbd>
          </button>
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex size-10 items-center justify-center rounded-xl text-fg-muted hover:bg-surface-2 hover:text-fg md:hidden"
            aria-label="Search documentation"
          >
            <Icon name="search" className="size-5" />
          </button>

          <ThemeToggle />

          <a
            href={links.repository}
            rel="noopener noreferrer"
            className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg sm:inline-flex"
            aria-label={stats ? `LZY on GitHub, ${stats.stars} stars` : 'LZY on GitHub'}
          >
            <Icon name="github" className="size-5" />
            <span className="hidden xl:inline">GitHub</span>
            {stats && (
              <span className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 font-mono text-xs">
                <Icon name="star" className="size-3" />
                {formatCount(stats.stars)}
              </span>
            )}
          </a>

          <Link
            to="/getting-started/"
            className="ml-1 hidden h-10 items-center gap-1.5 rounded-xl bg-accent-strong px-4 text-sm font-medium text-on-accent shadow-[0_0_0_1px_rgb(255_77_94/0.4),0_8px_24px_-10px_var(--glow)] transition-colors hover:bg-[var(--accent-hover)] sm:inline-flex"
          >
            Get started
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-xl text-fg hover:bg-surface-2 lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name="menu" className="size-5" />
          </button>
        </div>
      </nav>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
