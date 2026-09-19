import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import { mainNav } from '@/content/navigation';
import { useDialogFocus } from '@/hooks/useDialogFocus';
import { links } from '@/data/site';
import { cx } from '@/lib/cx';

import { Wordmark } from '../Logo';
import { Icon } from '../ui/Icon';
import { isSectionActive } from './Navbar';

/** The full-screen menu on small screens. Escape, the close button or a link closes it. */
export function MobileMenu({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation();
  const panel = useRef<HTMLDivElement>(null);
  const firstPath = useRef(pathname);

  useEffect(() => {
    if (pathname !== firstPath.current) onClose();
  }, [pathname, onClose]);

  useDialogFocus(panel, onClose);

  const secondary = [
    { label: 'Getting started', to: '/getting-started/' },
    { label: 'Installation', to: '/install/' },
    { label: 'Download', to: '/download/' },
    { label: 'FAQ', to: '/faq/' },
    { label: 'Community', to: '/community/' },
    { label: 'Contributing', to: '/contributing/' },
  ];

  return (
    <div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="pop-in fixed inset-0 z-[90] flex flex-col bg-bg lg:hidden"
    >
      <div className="flex h-16 items-center justify-between border-b border-line px-4 sm:px-6">
        <Link to="/" aria-label="LZY home" onClick={onClose}>
          <Wordmark size={32} />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-surface-2"
          aria-label="Close menu"
        >
          <Icon name="close" className="size-5" />
        </button>
      </div>

      <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const active = isSectionActive(item.to, pathname);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cx(
                    'flex items-center justify-between rounded-xl px-4 py-3 font-display text-xl font-semibold',
                    active ? 'bg-accent-soft text-accent' : 'text-fg hover:bg-surface-2',
                  )}
                >
                  <span>{item.label}</span>
                  {item.tag ? (
                    <span className="rounded border border-line px-1.5 font-mono text-xs text-fg-subtle uppercase">
                      {item.tag}
                    </span>
                  ) : (
                    <Icon name="chevron-right" className="size-5 text-fg-subtle" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <ul className="mt-6 grid grid-cols-2 gap-2 border-t border-line pt-6">
          {secondary.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                onClick={onClose}
                className="block rounded-lg px-4 py-2.5 text-fg-muted hover:bg-surface-2 hover:text-fg"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex gap-3 border-t border-line p-4 sm:px-6">
        <a
          href={links.repository}
          rel="noopener noreferrer"
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface font-medium"
        >
          <Icon name="github" className="size-5" /> GitHub
        </a>
        <Link
          to="/getting-started/"
          onClick={onClose}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-accent-strong font-medium text-on-accent"
        >
          Get started
        </Link>
      </div>
    </div>
  );
}
