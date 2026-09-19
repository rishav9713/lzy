import { decisions } from '@/content/home';
import snippets from '@/data/generated/snippets.json';
import { escapeHtml, highlightLzy, highlightLzyError } from '@/lib/highlight';

import { Icon } from '../ui/Icon';
import { InlineText } from '../ui/InlineText';

type Snippet = { source: string; output: string; error: string | null };

function MiniRun({ snippet }: { snippet: Snippet }) {
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-[var(--code-bg)] font-mono text-[0.78rem] leading-6">
      <pre
        tabIndex={0}
        aria-label="The program"
        className="overflow-x-auto px-4 py-3 text-[var(--code-fg)]"
      >
        <code dangerouslySetInnerHTML={{ __html: highlightLzy(snippet.source.trimEnd()) }} />
      </pre>
      <pre
        tabIndex={0}
        className="overflow-x-auto border-t border-white/10 bg-black/25 px-4 py-3 text-[var(--code-muted)]"
        aria-label={snippet.error ? 'The error LZY prints' : 'What LZY prints'}
        dangerouslySetInnerHTML={{
          __html: snippet.error
            ? highlightLzyError(snippet.error.split('\n\n').slice(0, 2).join('\n\n'))
            : escapeHtml(snippet.output.trimEnd()),
        }}
      />
    </div>
  );
}

export function Decisions() {
  const all = snippets as Record<string, Snippet>;
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {decisions.map((decision, index) => {
        const snippet = all[decision.snippet];
        return (
          <article
            key={decision.title}
            data-reveal
            style={{ ['--reveal-delay' as string]: `${index * 80}ms` }}
            className="glow-card flex flex-col rounded-2xl border border-line bg-surface p-6"
          >
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
                <Icon name={decision.icon} className="size-5" />
              </span>
              <h3 className="font-display text-xl font-semibold text-fg">{decision.title}</h3>
            </div>
            <p className="mt-4 leading-relaxed text-fg-muted">
              <InlineText text={decision.body} />
            </p>
            {snippet && <MiniRun snippet={snippet} />}
          </article>
        );
      })}
    </div>
  );
}
