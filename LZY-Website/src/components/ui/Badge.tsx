import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import { Icon, type IconName } from './Icon';

/**
 * How ready something is. Used everywhere LZY's abilities are described, so
 * that "you can do this today" and "this is planned" never look the same.
 */
export type Status = 'available' | 'experimental' | 'planned' | 'not-planned' | 'done' | 'next';

const statusStyle: Record<Status, { label: string; icon: IconName; className: string }> = {
  available: {
    label: 'Available now',
    icon: 'check-circle',
    className: 'text-ok bg-ok-soft border-[color-mix(in_srgb,var(--ok)_30%,transparent)]',
  },
  done: {
    label: 'Released',
    icon: 'check-circle',
    className: 'text-ok bg-ok-soft border-[color-mix(in_srgb,var(--ok)_30%,transparent)]',
  },
  experimental: {
    label: 'Possible, with limits',
    icon: 'flask',
    className: 'text-warn bg-warn-soft border-[color-mix(in_srgb,var(--warn)_30%,transparent)]',
  },
  next: {
    label: 'Next',
    icon: 'sparkles',
    className:
      'text-accent bg-accent-soft border-[color-mix(in_srgb,var(--accent)_35%,transparent)]',
  },
  planned: {
    label: 'Planned',
    icon: 'circle',
    className: 'text-info bg-info-soft border-[color-mix(in_srgb,var(--info)_30%,transparent)]',
  },
  'not-planned': {
    label: 'Not planned',
    icon: 'close',
    className: 'text-fg-subtle bg-surface-2 border-line',
  },
};

export function StatusBadge({
  status,
  children,
  className,
}: {
  status: Status;
  children?: ReactNode;
  className?: string;
}) {
  const style = statusStyle[status];
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        style.className,
        className,
      )}
    >
      <Icon name={style.icon} className="size-3.5" />
      {children ?? style.label}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-fg-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}
