import { setTheme, useTheme } from '@/lib/theme';
import { cx } from '@/lib/cx';

import { Icon } from '../ui/Icon';

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cx(
        'inline-flex size-10 items-center justify-center rounded-xl text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="size-5" />
    </button>
  );
}
