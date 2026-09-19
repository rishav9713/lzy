/**
 * The command-line reference, generated from the `lzy` command itself:
 * build_parser() for the commands and options, and real runs of `lzy` for
 * the outputs and exit codes.
 */
import lzy from '@/data/generated/lzy.json';

import { CodeBlock } from '../code/CodeBlock';

const cli = lzy.cli;

const commandDetail: Record<
  string,
  { syntax: string; examples: Array<{ command: string; note: string }> }
> = {
  run: {
    syntax: 'lzy [--safe] [--debug] run <file>\nlzy [--safe] [--debug] <file>',
    examples: [
      { command: 'lzy run hello.lzy', note: 'Run a program.' },
      { command: 'lzy hello.lzy', note: 'The same thing: a file name on its own means run.' },
      {
        command: 'lzy --safe program.lzy',
        note: 'Run with the tighter limits for code you do not trust.',
      },
    ],
  },
  check: {
    syntax: 'lzy [--safe] [--debug] check <file>',
    examples: [
      {
        command: `lzy check examples/01-beginner/hello.lzy`,
        note: 'Read the program and report mistakes, without running any of it.',
      },
    ],
  },
  repl: {
    syntax: 'lzy [--safe] [--debug] repl\nlzy',
    examples: [
      { command: 'lzy repl', note: 'Start an interactive session.' },
      {
        command: 'lzy',
        note: 'With no command and nothing piped in, lzy also starts the REPL.',
      },
    ],
  },
};

export function CliReference() {
  return (
    <div className="space-y-6">
      {cli.commands.map((command) => {
        const detail = commandDetail[command.name];
        return (
          <section
            key={command.name}
            id={`command-${command.name}`}
            aria-labelledby={`command-${command.name}-title`}
            className="scroll-mt-24 rounded-2xl border border-line bg-surface p-6"
          >
            <h3
              id={`command-${command.name}-title`}
              className="font-mono text-xl font-bold text-fg"
            >
              lzy {command.name}
            </h3>
            <p className="mt-1 text-fg-muted">
              {command.help.charAt(0).toUpperCase() + command.help.slice(1)}.
            </p>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-[8rem_1fr]">
              <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase sm:pt-2">
                Syntax
              </dt>
              <dd className="min-w-0">
                <CodeBlock
                  code={detail?.syntax ?? `lzy ${command.name}`}
                  language="shell"
                  className="!my-0"
                />
              </dd>
              <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
                Arguments
              </dt>
              <dd className="text-fg-muted">
                {command.arguments.length ? (
                  <ul className="space-y-1">
                    {command.arguments.map((argument) => (
                      <li key={argument.name}>
                        <code className="inline">{argument.name}</code> — {argument.help}
                      </li>
                    ))}
                  </ul>
                ) : (
                  'None'
                )}
              </dd>
              <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">Options</dt>
              <dd className="text-fg-muted">
                <code className="inline">--safe</code> and <code className="inline">--debug</code>,
                written before the command. See{' '}
                <a href="#options" className="text-accent underline">
                  options
                </a>
                .
              </dd>
              {detail && (
                <>
                  <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
                    Examples
                  </dt>
                  <dd>
                    <ul className="space-y-3">
                      {detail.examples.map((example) => (
                        <li key={example.command}>
                          <CodeBlock code={example.command} language="shell" className="!my-0" />
                          <p className="mt-1.5 text-sm text-fg-muted">{example.note}</p>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
              <dt className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
                Exit codes
              </dt>
              <dd className="text-fg-muted">
                <code className="inline">{cli.exitCodes.ok}</code> when it succeeds,{' '}
                <code className="inline">{cli.exitCodes.error}</code> when LZY reports an error.
              </dd>
            </dl>
          </section>
        );
      })}
    </div>
  );
}

export function CliOptions() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className="w-full text-sm">
        <caption className="sr-only">Options for the lzy command</caption>
        <thead className="bg-surface-2 text-left">
          <tr>
            <th scope="col" className="px-4 py-3 font-display font-semibold text-fg">
              Option
            </th>
            <th scope="col" className="px-4 py-3 font-display font-semibold text-fg">
              What it does
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {cli.options.map((option) => (
            <tr key={option.flags.join()}>
              <td className="px-4 py-3 align-top whitespace-nowrap">
                {option.flags.map((flag) => (
                  <code key={flag} className="inline mr-1.5">
                    {flag}
                  </code>
                ))}
              </td>
              <td className="px-4 py-3 text-fg-muted">
                {option.help ? option.help.charAt(0).toUpperCase() + option.help.slice(1) : ''}.
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CliHelp() {
  return <CodeBlock code={cli.help} language="text" label="lzy --help" />;
}

export function CliExitCodes() {
  const rows = [
    {
      code: cli.runs.version.exitCode,
      meaning: 'Success.',
      example: cli.runs.check,
      label: 'lzy check examples/01-beginner/hello.lzy',
    },
    {
      code: cli.runs.missingFile.exitCode,
      meaning:
        'LZY reported an error: a mistake in the program, an error while it ran, or a file it could not read.',
      example: cli.runs.missingFile,
      label: 'lzy no-such-program.lzy',
    },
    {
      code: cli.runs.badFlag.exitCode,
      meaning: 'The command line itself was wrong, such as an option LZY does not have.',
      example: cli.runs.badFlag,
      label: 'lzy --no-such-flag',
    },
  ];
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.code} className="rounded-2xl border border-line bg-surface p-5">
          <p className="flex items-baseline gap-3">
            <span className="font-mono text-2xl font-bold text-accent">{row.code}</span>
            <span className="text-fg-muted">{row.meaning}</span>
          </p>
          <CodeBlock code={row.label} language="shell" className="!mb-0" />
          <CodeBlock
            code={(row.example.stdout + row.example.stderr).trimEnd()}
            language={row.code === cli.runs.missingFile.exitCode ? 'error' : 'text'}
            label={row.example.stderr ? 'What it prints (to standard error)' : 'What it prints'}
            copy={false}
            className="!mt-2 !mb-0"
          />
        </div>
      ))}
    </div>
  );
}

export function VersionCheck() {
  return (
    <>
      <CodeBlock code="lzy --version" language="shell" />
      <CodeBlock code={cli.runs.version.stdout.trimEnd()} language="text" copy={false} />
    </>
  );
}
