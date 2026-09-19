import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

/** A terminal or editor window: three dots, a title, and dark content. */
export function Terminal({
  title,
  children,
  actions,
  className,
  bodyClassName,
}: {
  title: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cx(
        'overflow-hidden rounded-2xl border border-white/10 bg-[var(--code-bg)] text-[var(--code-fg)] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8),0_0_0_1px_rgb(255_77_94/0.08)]',
        className,
      )}
    >
      <div className="flex h-10 items-center gap-3 border-b border-white/[0.07] bg-[var(--code-bar)] px-4">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="min-w-0 flex-1 truncate font-mono text-xs text-[var(--code-muted)]">
          {title}
        </div>
        {actions}
      </div>
      <div className={cx('scanlines', bodyClassName)}>{children}</div>
    </div>
  );
}
