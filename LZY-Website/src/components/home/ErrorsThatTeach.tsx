import showcase from '@/data/generated/showcase.json';
import { highlightLzy, highlightLzyError } from '@/lib/highlight';

import { Terminal } from '../code/Terminal';

export interface ErrorParts {
  header: string;
  message: string;
  snippet: string;
  hint: string;
  suggestion: string;
}

/** Split a rendered LZY error into the four answers it gives. */
export function parseError(text: string): ErrorParts {
  const blocks = text.replace(/\n$/, '').split(/\n\n/);
  const header = blocks[0] ?? '';
  const message = (blocks[1] ?? '').replace(/\n/g, ' ');
  const snippetIndex = blocks.findIndex((block) => /^\s*\^+\s*$/m.test(block));
  const maybeIndex = blocks.findIndex((block) => block.trim() === 'Maybe you meant:');
  const hintBlocks = blocks.slice(
    snippetIndex === -1 ? 2 : snippetIndex + 1,
    maybeIndex === -1 ? blocks.length : maybeIndex,
  );
  return {
    header,
    message,
    snippet: snippetIndex === -1 ? '' : blocks[snippetIndex]!,
    hint: hintBlocks.join(' ').replace(/\n/g, ' '),
    suggestion: maybeIndex === -1 ? '' : (blocks[maybeIndex + 1] ?? '').trim(),
  };
}

export function ErrorsThatTeach() {
  const program = showcase.find((item) => item.error);
  if (!program?.error) return null;
  const parts = parseError(program.error);

  const answers = [
    { number: '1', question: 'What happened', answer: <p>{parts.message}</p> },
    {
      number: '2',
      question: 'Where',
      answer: (
        <p>
          {parts.header.replace(/\.$/, '')}, with the exact spot marked by the caret{' '}
          <code className="inline">^</code>.
        </p>
      ),
    },
    { number: '3', question: 'Why', answer: <p>{parts.hint}</p> },
    {
      number: '4',
      question: 'How to fix it',
      answer: (
        <code
          className="block w-fit rounded-md border border-white/10 bg-[var(--code-bg)] px-2.5 py-1 font-mono text-sm text-[var(--code-fg)]"
          dangerouslySetInnerHTML={{ __html: highlightLzy(parts.suggestion) }}
        />
      ),
    },
  ];

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="min-w-0">
        <Terminal title={`lzy ${program.file}`} bodyClassName="p-5">
          <pre
            tabIndex={0}
            aria-label="The program"
            className="mb-3 overflow-x-auto font-mono text-[0.8rem] leading-6 text-[var(--code-fg)]"
          >
            <code dangerouslySetInnerHTML={{ __html: highlightLzy(program.source.trimEnd()) }} />
          </pre>
          <div className="border-t border-white/10 pt-3">
            <pre
              tabIndex={0}
              className="overflow-x-auto font-mono text-[0.78rem] leading-6"
              aria-label="The error LZY prints"
              dangerouslySetInnerHTML={{ __html: highlightLzyError(program.error) }}
            />
          </div>
        </Terminal>
      </div>

      <ol className="space-y-4">
        {answers.map((item) => (
          <li
            key={item.number}
            data-reveal
            className="flex gap-4 rounded-2xl border border-line bg-surface p-5"
            style={{ ['--reveal-delay' as string]: `${Number(item.number) * 70}ms` }}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-accent-soft font-mono font-bold text-accent">
              {item.number}
            </span>
            <div className="min-w-0 text-fg-muted">
              <h3 className="mb-1 font-display text-lg font-semibold text-fg">{item.question}</h3>
              {item.answer}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
