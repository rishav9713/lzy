import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';

import type { Heading } from '@/content/types';

import { Icon } from '../ui/Icon';
import { DocSidebar } from './DocSidebar';
import { TableOfContents } from './TableOfContents';

/**
 * Three columns on a wide screen: the sidebar, the page, and "On this page".
 * On a narrow screen the sidebar becomes a drawer and the contents list is
 * dropped, since the page itself is the contents.
 */
export function DocsLayout({
  headings = [],
  children,
}: {
  headings?: Heading[];
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    if (!drawer) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [drawer]);

  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawer(true)}
          aria-expanded={drawer}
          aria-controls="docs-drawer"
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-fg-muted hover:bg-surface-2 hover:text-fg"
        >
          <Icon name="list" className="size-4" /> Documentation menu
        </button>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[80] lg:hidden" id="docs-drawer">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setDrawer(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Documentation menu"
            className="pop-in absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col border-r border-line bg-bg-raised"
          >
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <span className="font-display font-semibold">Documentation</span>
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-surface-2"
                aria-label="Close documentation menu"
                autoFocus
              >
                <Icon name="close" className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <DocSidebar key={pathname} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[15.5rem_minmax(0,1fr)] xl:grid-cols-[15.5rem_minmax(0,1fr)_14rem]">
        <aside className="hidden lg:block" aria-label="Documentation sidebar">
          <div className="sticky top-16 -ml-3 max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain py-10 pr-2 pl-3 [scrollbar-width:thin]">
            <DocSidebar />
          </div>
        </aside>

        <div className="min-w-0 py-8 lg:py-10">{children}</div>

        <aside className="hidden xl:block" aria-label="On this page">
          <div className="sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto py-10 [scrollbar-width:thin]">
            <TableOfContents headings={headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
