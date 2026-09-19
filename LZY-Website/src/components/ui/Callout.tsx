import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import { Icon, type IconName } from './Icon';

type Kind = 'note' | 'tip' | 'warning' | 'danger';

const kinds: Record<Kind, { icon: IconName; className: string; label: string }> = {
  note: { icon: 'info', className: 'border-info/30 bg-info-soft text-info', label: 'Note' },
  tip: { icon: 'sparkles', className: 'border-ok/30 bg-ok-soft text-ok', label: 'Tip' },
  warning: { icon: 'alert', className: 'border-warn/30 bg-warn-soft text-warn', label: 'Warning' },
  danger: {
    icon: 'shield',
    className: 'border-accent/35 bg-accent-soft text-accent',
    label: 'Important',
  },
};

export function Callout({
  kind = 'note',
  title,
  children,
  className,
}: {
  kind?: Kind;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const style = kinds[kind];
  return (
    <aside
      className={cx('flex gap-3 rounded-xl border px-4 py-3.5', style.className, className)}
      aria-label={title ?? style.label}
    >
      <Icon name={style.icon} className="mt-0.5 size-5 shrink-0" />
      <div className="min-w-0 text-[0.95rem] leading-relaxed text-fg-muted">
        {title && <p className="mb-1 font-semibold text-fg">{title}</p>}
        {children}
      </div>
    </aside>
  );
}
