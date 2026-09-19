import lzy from '@/data/generated/lzy.json';
import { escapeHtml, highlightLzy, highlightLzyError } from '@/lib/highlight';

import { Terminal } from '../code/Terminal';

/**
 * A REPL session recorded from the real REPL: each line was fed to
 * `lzy.repl.run_repl`, and what it printed after each one was captured.
 */
export function ReplSession() {
  const { transcript, banner } = lzy.repl;
  return (
    <Terminal
      title="lzy repl"
      bodyClassName="overflow-x-auto p-5 font-mono text-[0.82rem] leading-6"
    >
      <pre className="text-[var(--code-muted)]">{banner}</pre>
      <pre className="mt-4">
        {transcript.map((step, index) => (
          <span key={index} className="block">
            <span className="text-[#7ee0c3]">{step.prompt}</span>
            <span dangerouslySetInnerHTML={{ __html: highlightLzy(step.input) }} />
            {step.output && (
              <span
                className="block text-[var(--code-fg)]"
                dangerouslySetInnerHTML={{
                  __html: /error in/.test(step.output)
                    ? highlightLzyError(step.output)
                    : escapeHtml(step.output.replace(/\n$/, '')),
                }}
              />
            )}
          </span>
        ))}
      </pre>
    </Terminal>
  );
}

export function ReplHelp() {
  return (
    <Terminal
      title="lzy> help"
      bodyClassName="overflow-x-auto p-5 font-mono text-[0.82rem] leading-6"
    >
      <pre className="text-[var(--code-fg)]">{lzy.repl.help}</pre>
    </Terminal>
  );
}
