import { useMemo, useRef, useState, type KeyboardEvent, type UIEvent } from 'react';
import { Link } from 'react-router';

import { CodeBlock } from '@/components/code/CodeBlock';
import { CopyButton } from '@/components/code/CopyButton';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { allExamples } from '@/content/examples';
import { highlightLzy } from '@/lib/highlight';
import { usePageHead } from '@/lib/head';
import { exampleTitle } from '@/lib/search';
import { currentRuntime } from '@/playground/runtime';

const runtime = currentRuntime();

/**
 * A code editor: a transparent textarea over highlighted code. Tab inserts
 * four spaces, because LZY indents with spaces and refuses tabs. Escape then
 * Tab leaves the editor, so keyboard users are never trapped.
 */
function Editor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const highlighted = useRef<HTMLPreElement>(null);
  const escaped = useRef(false);
  const html = useMemo(() => highlightLzy(value) + '\n', [value]);
  const lines = value.split('\n').length;

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      escaped.current = true;
      return;
    }
    if (event.key === 'Tab' && !escaped.current) {
      event.preventDefault();
      const area = event.currentTarget;
      const { selectionStart, selectionEnd } = area;
      const next = `${value.slice(0, selectionStart)}    ${value.slice(selectionEnd)}`;
      onChange(next);
      requestAnimationFrame(() => {
        area.selectionStart = area.selectionEnd = selectionStart + 4;
      });
      return;
    }
    escaped.current = false;
  };

  const onScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (highlighted.current) {
      highlighted.current.scrollTop = event.currentTarget.scrollTop;
      highlighted.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  };

  return (
    <div className="relative flex min-h-[26rem] font-mono text-sm leading-6">
      <div
        aria-hidden="true"
        className="w-12 shrink-0 border-r border-white/5 py-4 pr-3 text-right text-[var(--code-muted)] select-none"
      >
        {Array.from({ length: lines }, (_, index) => (
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <div className="relative min-w-0 flex-1">
        <pre
          ref={highlighted}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-0 overflow-hidden px-4 py-4 whitespace-pre text-[var(--code-fg)]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          onScroll={onScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="LZY program. Tab inserts four spaces; press Escape then Tab to move on."
          className="absolute inset-0 m-0 h-full w-full resize-none overflow-auto bg-transparent px-4 py-4 whitespace-pre text-transparent caret-[#ff4d5e] outline-none selection:bg-[rgb(255_77_94/0.3)]"
        />
      </div>
    </div>
  );
}

export default function Playground() {
  usePageHead({
    title: 'Playground',
    description:
      'A browser playground for LZY is planned. Until it can run code in real isolation, write LZY here with syntax highlighting and run it on your own machine.',
    route: '/playground/',
  });

  const starters = allExamples.filter((example) => example.input.length === 0);
  const [chosen, setChosen] = useState(starters[0]?.slug ?? '');
  const [code, setCode] = useState(starters[0]?.source ?? 'say "Hello World"\n');
  const [attempted, setAttempted] = useState(false);

  const download = `data:text/plain;charset=utf-8,${encodeURIComponent(code)}`;

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Playground"
        title="LZY Playground"
        lead="Write LZY with highlighting, start from any example, and take it to your terminal. Running code in the browser is coming — once it can be done safely."
      >
        <StatusBadge status="planned">Browser runtime: coming soon</StatusBadge>
      </PageHeader>

      <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[var(--code-bg)] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.07] bg-[var(--code-bar)] px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <label className="flex items-center gap-2 text-xs text-[var(--code-muted)]">
            <span className="font-mono">Start from</span>
            <select
              value={chosen}
              onChange={(event) => {
                const example = starters.find((item) => item.slug === event.target.value);
                setChosen(event.target.value);
                if (example) setCode(example.source);
                setAttempted(false);
              }}
              className="rounded-md border border-white/10 bg-[#17171f] px-2 py-1 font-mono text-xs text-[#e4e4ec]"
            >
              {starters.map((example) => (
                <option key={example.slug} value={example.slug}>
                  {exampleTitle(example.slug)}
                </option>
              ))}
            </select>
          </label>
          <div className="ml-auto flex items-center gap-2">
            <CopyButton text={code} label="program" />
            <a
              href={download}
              download="program.lzy"
              className="copy-button"
              aria-label="Download the program as program.lzy"
            >
              <Icon name="download" className="size-3.5" />
              <span>Download</span>
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="min-w-0 border-b border-white/[0.07] lg:border-r lg:border-b-0">
            <Editor value={code} onChange={setCode} />
          </div>
          <div className="flex min-h-[18rem] flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5 font-mono text-xs text-[var(--code-muted)]">
              <span>Output</span>
            </div>
            <div
              className="flex flex-1 flex-col justify-center p-6 text-sm text-[#b4b4c0]"
              role="status"
            >
              {attempted || !runtime.available ? (
                <div className="mx-auto max-w-sm text-center">
                  <Icon name="lock" className="mx-auto size-8 text-[#ff6b7a]" />
                  <p className="mt-4 font-medium text-[#ececf1]">
                    Browser playground — coming soon
                  </p>
                  <p className="mt-2 leading-relaxed">{runtime.unavailableReason}</p>
                  <p className="mt-4 leading-relaxed">
                    To run this program now, save it as{' '}
                    <code className="font-mono text-[#f3d88f]">program.lzy</code> and run{' '}
                    <code className="font-mono text-[#7ee0c3]">lzy program.lzy</code>.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] bg-[var(--code-bar)] px-4 py-3">
          <p className="font-mono text-xs text-[var(--code-muted)]">
            Tab inserts four spaces · LZY indents with spaces, never tabs
          </p>
          <Button
            variant="primary"
            icon="play"
            disabled={!runtime.available}
            onClick={() => setAttempted(true)}
            ariaLabel="Run the program (not available yet)"
          >
            Run
          </Button>
        </div>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section
          aria-labelledby="run-locally"
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h2 id="run-locally" className="font-display text-xl font-semibold text-fg">
            Run it on your machine
          </h2>
          <p className="mt-2 text-fg-muted">
            LZY installs in one command and needs only Python. The REPL is the closest thing to a
            playground today: it keeps your names between lines and runs a block when you leave a
            blank line.
          </p>
          <CodeBlock code="lzy repl" language="shell" />
          <div className="flex flex-wrap gap-3">
            <ButtonLink to="/install/" icon="download">
              Install LZY
            </ButtonLink>
            <ButtonLink to="/docs/repl/" variant="secondary">
              Using the REPL
            </ButtonLink>
          </div>
        </section>
        <section
          aria-labelledby="why-not-yet"
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h2 id="why-not-yet" className="font-display text-xl font-semibold text-fg">
            Why it does not run code yet
          </h2>
          <p className="mt-2 text-fg-muted">
            A playground runs code that nobody has checked. LZY has no time limit and only partial
            memory limits today, and its security policy says it is not a sandbox. So, as the
            roadmap puts it, the playground comes “only once code runs in real isolation and never
            on the host” — rather than pretending.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-fg-muted">
            <li className="flex gap-2">
              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-ok" /> The editor, examples
              and highlighting on this page are real and work now.
            </li>
            <li className="flex gap-2">
              <Icon name="circle" className="mt-0.5 size-4 shrink-0 text-info" /> Running code in
              the browser is planned for 0.4.0, with editor support.
            </li>
          </ul>
          <Link
            to="/security/"
            className="mt-5 inline-flex items-center gap-1.5 font-medium text-accent"
          >
            Read the security policy <Icon name="arrow-right" className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
