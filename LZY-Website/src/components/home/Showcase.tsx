import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { showcaseCaptions } from '@/content/home';
import showcase from '@/data/generated/showcase.json';
import { highlightLzy, highlightLzyError, escapeHtml } from '@/lib/highlight';
import { cx } from '@/lib/cx';

import { CopyButton } from '../code/CopyButton';
import { Terminal } from '../code/Terminal';
import { InlineText } from '../ui/InlineText';

type Program = (typeof showcase)[number];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 90;

/**
 * Lines type themselves out with a CSS steps() animation: each line is
 * clipped, then unclipped one character at a time. The full code is always in
 * the page (for search engines, screen readers and anyone without
 * JavaScript); the animation only runs when motion is allowed.
 */
function TypedCode({ program, typing }: { program: Program; typing: boolean }) {
  const lines = program.source.replace(/\n$/, '').split('\n');
  let delay = 0;
  return (
    <pre
      className="typing overflow-x-auto p-5 font-mono text-[0.85rem] leading-7 sm:text-sm"
      data-typing={typing ? 'run' : 'done'}
      tabIndex={0}
      aria-label={`${program.file}, the program`}
    >
      <code>
        {lines.map((line, index) => {
          const length = Math.max(line.length, 1);
          const style = {
            ['--n' as string]: length,
            ['--d' as string]: `${length * CHAR_MS}ms`,
            ['--delay' as string]: `${delay}ms`,
          };
          delay += length * CHAR_MS + LINE_PAUSE_MS;
          return (
            <span key={index} className="flex">
              <span
                aria-hidden="true"
                className="mr-5 inline-block w-5 shrink-0 text-right text-[var(--code-muted)] select-none"
              >
                {index + 1}
              </span>
              <span
                className="type-line whitespace-pre"
                style={style}
                dangerouslySetInnerHTML={{ __html: highlightLzy(line) || ' ' }}
              />
            </span>
          );
        })}
      </code>
    </pre>
  );
}

function outputDelay(program: Program): number {
  return program.source
    .replace(/\n$/, '')
    .split('\n')
    .reduce((total, line) => total + Math.max(line.length, 1) * CHAR_MS + LINE_PAUSE_MS, 0);
}

export function Showcase() {
  const [selected, setSelected] = useState(0);
  // Whether the typing animation should run. It starts false, which is what
  // the server renders: everything visible.
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const element = root.current;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!element || reduced || !('IntersectionObserver' in window)) {
      // No animation: show everything straight away.
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setTyping(true);
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const program = showcase[selected]!;
  const caption = showcaseCaptions[program.id];
  const pending = !started;

  const choose = (index: number) => {
    setSelected(index);
    tabs.current[index]?.focus();
  };

  const onTabKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') choose((selected + 1) % showcase.length);
    else if (event.key === 'ArrowLeft') choose((selected - 1 + showcase.length) % showcase.length);
    else if (event.key === 'Home') choose(0);
    else if (event.key === 'End') choose(showcase.length - 1);
    else return;
    event.preventDefault();
  };

  const output = program.error ?? program.output;
  const outputHtml = program.error
    ? highlightLzyError(program.error)
    : escapeHtml(program.output.replace(/\n$/, ''));

  return (
    <div ref={root} className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
      <div className="lg:pt-6">
        <div
          role="tablist"
          aria-label="Example programs"
          className="flex flex-wrap gap-2"
          onKeyDown={onTabKey}
        >
          {showcase.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`showcase-tab-${item.id}`}
              aria-selected={index === selected}
              aria-controls="showcase-panel"
              tabIndex={index === selected ? 0 : -1}
              onClick={() => setSelected(index)}
              className={cx(
                'rounded-lg border px-3 py-1.5 font-mono text-sm transition-colors',
                index === selected
                  ? 'border-accent/50 bg-accent-soft text-accent'
                  : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
              )}
            >
              {item.file}
            </button>
          ))}
        </div>
        {caption && (
          <div className="mt-8" aria-live="polite">
            <h3 className="font-display text-2xl font-semibold text-fg">{caption.title}</h3>
            <p className="mt-3 text-lg leading-relaxed text-fg-muted">
              <InlineText text={caption.body} />
            </p>
          </div>
        )}
        <p className="mt-8 text-sm text-fg-subtle">
          Every program and every line of output on this page was produced by running LZY when the
          site was built.
        </p>
      </div>

      <div
        id="showcase-panel"
        role="tabpanel"
        aria-labelledby={`showcase-tab-${program.id}`}
        className="min-w-0"
        data-typing-root={pending ? 'pending' : undefined}
      >
        <Terminal
          title={program.file}
          actions={<CopyButton text={program.source} label={program.file} />}
        >
          <TypedCode key={program.id} program={program} typing={typing} />
        </Terminal>

        <Terminal
          title="Terminal"
          className="-mt-3 ml-4 sm:ml-10"
          bodyClassName="p-5 font-mono text-[0.8rem] leading-6 sm:text-[0.85rem]"
        >
          <div
            key={program.id}
            className="type-output"
            data-typing={typing ? 'run' : 'done'}
            style={{ ['--delay' as string]: `${typing ? outputDelay(program) : 0}ms` }}
          >
            <p>
              <span className="text-[#7ee0c3]">$</span> lzy {program.file}
            </p>
            <pre
              tabIndex={0}
              className={cx(
                'mt-1 overflow-x-auto whitespace-pre',
                program.error && 'text-[0.78rem]',
              )}
              aria-label={program.error ? 'The error LZY prints' : 'What LZY prints'}
              dangerouslySetInnerHTML={{ __html: outputHtml }}
            />
            {!output && <p className="text-[var(--code-muted)]">(nothing printed)</p>}
          </div>
        </Terminal>
      </div>
    </div>
  );
}
