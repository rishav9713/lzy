import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { cx } from '@/lib/cx';

import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg' | 'sm';

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.98] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-strong text-on-accent shadow-[0_0_0_1px_rgb(255_77_94/0.4),0_10px_30px_-10px_var(--glow)] ' +
    'hover:bg-[var(--accent-hover)] hover:shadow-[0_0_0_1px_rgb(255_77_94/0.6),0_14px_40px_-10px_var(--glow)]',
  secondary:
    'border border-line-strong bg-surface text-fg hover:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] hover:bg-surface-2',
  ghost: 'text-fg-muted hover:text-fg hover:bg-surface-2',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4.5 text-[0.95rem]',
  lg: 'h-12 px-6 text-base',
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  /** Show an arrow that nudges right on hover. */
  arrow?: boolean;
  className?: string;
}

function Inner({ children, icon, arrow }: Pick<CommonProps, 'children' | 'icon' | 'arrow'>) {
  return (
    <>
      {icon && <Icon name={icon} className="size-4.5 shrink-0" />}
      <span>{children}</span>
      {arrow && (
        <Icon
          name="arrow-right"
          className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </>
  );
}

/** A button that goes to another page on this site. */
export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={cx(base, variants[variant], sizes[size], className)}>
      <Inner {...rest} />
    </Link>
  );
}

/** A button that leaves the site, such as a link to GitHub. */
export function ButtonAnchor({
  href,
  variant = 'secondary',
  size = 'md',
  className,
  ...rest
}: CommonProps & { href: string }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      className={cx(base, variants[variant], sizes[size], className)}
    >
      <Inner {...rest} />
    </a>
  );
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  onClick,
  disabled,
  type = 'button',
  ariaLabel,
  ...rest
}: CommonProps & {
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  ariaLabel?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cx(
        base,
        variants[variant],
        sizes[size],
        'disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100',
        className,
      )}
    >
      <Inner {...rest} />
    </button>
  );
}
