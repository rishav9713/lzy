import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import { sidebar } from '@/content/navigation';
import { project } from '@/data/site';
import { cx } from '@/lib/cx';

export function DocSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();
  const current = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const list = useRef<HTMLElement>(null);

  // Keep the current page in view when the sidebar is long.
  useEffect(() => {
    const active = list.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (active && list.current) {
      const box = list.current.getBoundingClientRect();
      const item = active.getBoundingClientRect();
      if (item.top < box.top || item.bottom > box.bottom) {
        active.scrollIntoView({ block: 'center' });
      }
    }
  }, [current]);

  return (
    <nav ref={list} aria-label="Documentation" className="text-[0.925rem]">
      <p className="mb-5 flex items-center gap-2 font-mono text-xs text-fg-subtle">
        <span className="pulse-dot inline-block size-1.5 rounded-full bg-ok text-ok" />
        Docs for LZY {project.version}
      </p>
      {sidebar.map((section) => (
        <div key={section.title} className="mb-6">
          <h2 className="mb-2 px-3 font-display text-xs font-semibold tracking-[0.12em] text-fg-subtle uppercase">
            {section.title}
          </h2>
          <ul className="space-y-px border-l border-line">
            {section.items.map((item) => {
              const active = item.to === current;
              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      '-ml-px flex items-center justify-between gap-2 border-l py-1.5 pr-2 pl-3.5 transition-colors',
                      active
                        ? 'border-accent font-medium text-accent'
                        : 'border-transparent text-fg-muted hover:border-line-strong hover:text-fg',
                    )}
                  >
                    <span>{item.label}</span>
                    {item.tag && (
                      <span className="rounded border border-line px-1 font-mono text-[0.6rem] text-fg-subtle uppercase">
                        {item.tag}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
