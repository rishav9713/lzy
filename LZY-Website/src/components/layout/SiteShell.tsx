import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import { useSearchHotkey } from '@/hooks/useHotkey';
import { followSystemTheme } from '@/lib/theme';

import { SearchContext } from '../search/SearchContext';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

const SearchDialog = lazy(() =>
  import('../search/SearchDialog').then((module) => ({ default: module.SearchDialog })),
);

/** Scroll to the element an anchor names, once the page has rendered it. */
function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.slice(1));
  let tries = 0;
  const attempt = () => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView();
      const details = target.closest('details');
      if (details) details.open = true;
    } else if (tries++ < 30) {
      requestAnimationFrame(attempt);
    }
  };
  attempt();
}

export function SiteShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [search, setSearch] = useState<{ open: boolean; query: string }>({
    open: false,
    query: '',
  });
  const firstRender = useRef(true);

  const open = useCallback((query = '') => setSearch({ open: true, query }), []);
  const close = useCallback(() => setSearch({ open: false, query: '' }), []);
  useSearchHotkey(open);

  useEffect(() => {
    window.__lzyReady = true;
    return followSystemTheme();
  }, []);

  // On navigation: go to the top (or to the anchor), and move focus to the
  // new page's heading so screen readers announce it. The first render is
  // left to the browser, which already handles an anchor in the address.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      if (location.hash) scrollToHash(location.hash);
      return;
    }
    document.documentElement.classList.add('navigated');
    if (location.hash) {
      scrollToHash(location.hash);
      return;
    }
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>('main h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash]);

  return (
    <SearchContext.Provider value={{ open }}>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[200] -translate-y-24 rounded-lg bg-accent-strong px-4 py-2 font-medium text-on-accent transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main id="main" className="flex-1 outline-none" tabIndex={-1}>
          <div key={location.pathname} className="page-enter">
            {children}
          </div>
        </main>
        <Footer />
      </div>
      {search.open && (
        <Suspense fallback={null}>
          <SearchDialog initialQuery={search.query} onClose={close} />
        </Suspense>
      )}
    </SearchContext.Provider>
  );
}
