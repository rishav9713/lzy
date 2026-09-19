import { useMemo } from 'react';

import { highlight, type Language } from '@/lib/highlight';
import { cx } from '@/lib/cx';

import { CopyButton } from './CopyButton';

const defaults: Record<Language, { label: string; variant: string }> = {
  lzy: { label: 'LZY', variant: 'lzy' },
  'lzy-broken': { label: 'LZY · a mistake, on purpose', variant: 'broken' },
  shell: { label: 'Terminal', variant: 'shell' },
  ebnf: { label: 'EBNF', variant: 'ebnf' },
  error: { label: 'Error message', variant: 'error' },
  text: { label: 'Output', variant: 'output' },
};

/**
 * A highlighted, copyable block of code. It produces the same markup as code
 * rendered from Markdown, so both look and behave identically.
 */
export function CodeBlock({
  code,
  language = 'lzy',
  label,
  className,
  copy = true,
}: {
  code: string;
  language?: Language;
  /** Shown in the bar above the code, e.g. a file name. */
  label?: string;
  className?: string;
  copy?: boolean;
}) {
  const trimmed = code.replace(/\n$/, '');
  const html = useMemo(() => highlight(trimmed, language), [trimmed, language]);
  const style = defaults[language];
  const title = label ?? style.label;

  return (
    <figure className={cx('code-block', `code-block--${style.variant}`, className)}>
      <figcaption className="code-block__bar">
        <span className="code-block__label">{title}</span>
        {copy && <CopyButton text={trimmed} label={title} />}
      </figcaption>
      <pre className="code-block__pre" tabIndex={0} aria-label={title}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </figure>
  );
}
