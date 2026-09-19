import { useId, useState, type KeyboardEvent } from 'react';

import lzy from '@/data/generated/lzy.json';
import { links, site, wheel } from '@/data/site';
import { cx } from '@/lib/cx';

import { CodeBlock } from '../code/CodeBlock';
import { InlineText } from '../ui/InlineText';

interface Method {
  id: string;
  label: string;
  commands: string;
  note: string;
}

/**
 * The ways to install LZY, with the current version's download address.
 * Every command here has been run against a real release; none of them uses
 * a package index, because LZY is not published to PyPI.
 */
export function installMethods(): Method[] {
  return [
    {
      id: 'pipx',
      label: 'pipx',
      commands: `pipx install ${wheel.url}`,
      note: 'Recommended. pipx gives LZY its own environment and puts the `lzy` command on your PATH. It avoids the “externally managed environment” error that pip gives on recent Linux distributions and Homebrew Python.',
    },
    {
      id: 'pip',
      label: 'pip',
      commands: `python -m pip install ${wheel.url}`,
      note: 'Installs the release straight from GitHub. On macOS and Linux the command is usually `python3`; on Windows, `py` also works. Best inside a virtual environment.',
    },
    {
      id: 'source',
      label: 'From source',
      commands: `git clone ${links.repository}\ncd lzy\npython -m pip install -e .`,
      note: 'The latest code on `main`, installed so that your changes take effect straight away. This is how to set up for contributing.',
    },
    {
      id: 'no-install',
      label: 'Without installing',
      commands: `git clone ${links.repository}\ncd lzy\npython -m lzy examples/01-beginner/hello.lzy`,
      note: 'Run LZY straight from a copy of the repository. Nothing is installed; `python -m lzy` works wherever `lzy` would.',
    },
  ];
}

export function InstallCommands({ compact = false }: { compact?: boolean }) {
  const methods = installMethods();
  const [selected, setSelected] = useState(0);
  const id = useId();
  const method = methods[selected]!;

  const onKey = (event: KeyboardEvent) => {
    const next =
      event.key === 'ArrowRight'
        ? (selected + 1) % methods.length
        : event.key === 'ArrowLeft'
          ? (selected - 1 + methods.length) % methods.length
          : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Ways to install LZY"
        className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1"
        onKeyDown={onKey}
      >
        {methods.map((item, index) => (
          <button
            key={item.id}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={index === selected}
            aria-controls={`${id}-panel`}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => setSelected(index)}
            className={cx(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              index === selected
                ? 'bg-accent-strong text-on-accent'
                : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${selected}`}>
        <CodeBlock code={method.commands} language="shell" className="!mt-3 !mb-3" />
        <p className="text-sm leading-relaxed text-fg-muted">
          <InlineText text={method.note} />
        </p>
        {!compact && (
          <p className="mt-2 text-sm text-fg-subtle">
            Needs Python {lzy.project.requiresPython?.replace('>=', '')} or newer. This installs LZY{' '}
            {site.version}, the latest release.
          </p>
        )}
      </div>
    </div>
  );
}
