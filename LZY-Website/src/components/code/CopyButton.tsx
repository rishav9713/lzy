import { useCopy } from '@/hooks/useCopy';

import { Icon } from '../ui/Icon';

/** Copies `text`, then says so, both visibly and to screen readers. */
export function CopyButton({
  text,
  label = 'code',
  plain = false,
}: {
  text: string;
  label?: string;
  /** On the page rather than on a dark code panel. */
  plain?: boolean;
}) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      className={plain ? 'copy-button copy-button--plain' : 'copy-button'}
      data-copied={copied}
      onClick={() => void copy(text)}
      aria-label={copied ? 'Copied' : `Copy ${label}`}
    >
      <Icon name={copied ? 'check' : 'copy'} className="size-3.5" />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}
