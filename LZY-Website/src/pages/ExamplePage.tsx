import { Link, useParams } from 'react-router';

import { CodeBlock } from '@/components/code/CodeBlock';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { Pill } from '@/components/ui/Badge';
import { ButtonAnchor } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { allExamples, categoryLabel, keywordDocs } from '@/content/examples';
import { links } from '@/data/site';
import { usePageHead } from '@/lib/head';
import { exampleTitle } from '@/lib/search';
import { slug as anchor } from '@/lib/slug';

import NotFound from './NotFound';

function DownloadButton({ name, source }: { name: string; source: string }) {
  const href = `data:text/plain;charset=utf-8,${encodeURIComponent(source)}`;
  return (
    <a
      href={href}
      download={name}
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
    >
      <Icon name="download" className="size-4" /> Download {name}
    </a>
  );
}

export default function ExamplePage() {
  const { slug } = useParams();
  const index = allExamples.findIndex((example) => example.slug === slug);
  const example = allExamples[index];

  usePageHead(
    example
      ? {
          title: `${exampleTitle(example.slug)} — LZY example`,
          description:
            `${example.description.join(' ')} A runnable LZY program, with the output it really produces.`.slice(
              0,
              300,
            ),
          route: `/examples/${example.slug}/`,
          type: 'article',
        }
      : {
          title: 'Example not found',
          description: 'There is no example with that name.',
          route: '/examples/',
          noindex: true,
        },
  );

  if (!example) return <NotFound />;

  const fileName = example.path.split('/').pop()!;
  const previous = allExamples[index - 1];
  const next = allExamples[index + 1];
  const { keywords, builtins, functions } = example.concepts;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Breadcrumb
        items={[
          { label: 'Examples', to: '/examples/' },
          { label: categoryLabel(example.category) },
          { label: exampleTitle(example.slug) },
        ]}
      />

      <header>
        <div className="flex flex-wrap items-center gap-2">
          <Pill>{categoryLabel(example.category)}</Pill>
          <Pill>{example.lines} lines</Pill>
          {example.input.length > 0 && <Pill>reads input with ask</Pill>}
        </div>
        <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-fg sm:text-5xl">
          {exampleTitle(example.slug)}
        </h1>
        <div className="mt-5 max-w-3xl space-y-3 text-lg leading-relaxed text-fg-muted">
          {example.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </header>

      <section aria-labelledby="program" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="program" className="font-display text-2xl font-semibold text-fg">
            The program
          </h2>
          <div className="flex flex-wrap gap-2">
            <DownloadButton name={fileName} source={example.source} />
            <ButtonAnchor href={links.file(example.path)} size="sm" icon="github">
              View on GitHub
            </ButtonAnchor>
          </div>
        </div>
        <CodeBlock code={example.source} language="lzy" label={example.path} />
      </section>

      {example.input.length > 0 && (
        <section aria-labelledby="input" className="mt-10">
          <h2 id="input" className="font-display text-2xl font-semibold text-fg">
            What was typed in
          </h2>
          <p className="mt-2 text-fg-muted">
            This program asks questions with <code className="inline">ask</code>. To record the
            output below, these answers were given, one per line:
          </p>
          <CodeBlock code={example.input.join('\n')} language="text" label="Answers" copy={false} />
        </section>
      )}

      <section aria-labelledby="output" className="mt-10">
        <h2 id="output" className="font-display text-2xl font-semibold text-fg">
          What it prints
        </h2>
        <p className="mt-2 text-fg-muted">
          Recorded in <code className="inline">{example.path.replace(/\.lzy$/, '.out')}</code> and
          checked by the test suite on every change.
        </p>
        <CodeBlock code={example.output} language="text" label="Output" />
      </section>

      <section
        aria-labelledby="concepts"
        className="mt-10 grid gap-6 rounded-2xl border border-line bg-surface p-6 md:grid-cols-3"
      >
        <h2 id="concepts" className="sr-only">
          What this example uses
        </h2>
        <div>
          <h3 className="font-mono text-xs tracking-wide text-fg-subtle uppercase">Keywords</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <li key={keyword}>
                <Link
                  to={keywordDocs[keyword] ?? '/docs/keywords/'}
                  className="inline-flex rounded-lg border border-line bg-bg-raised px-2 py-1 font-mono text-xs text-accent hover:border-accent/50"
                >
                  {keyword}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
            Built-in functions
          </h3>
          {builtins.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {builtins.map((name) => (
                <li key={name}>
                  <Link
                    to={`/docs/stdlib/#${anchor(name)}`}
                    className="inline-flex rounded-lg border border-line bg-bg-raised px-2 py-1 font-mono text-xs text-fg hover:border-accent/50"
                  >
                    {name}()
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-subtle">None</p>
          )}
        </div>
        <div>
          <h3 className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
            Functions it defines
          </h3>
          {functions.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {functions.map((name) => (
                <li
                  key={name}
                  className="rounded-lg border border-line bg-bg-raised px-2 py-1 font-mono text-xs text-fg"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-fg-subtle">None</p>
          )}
        </div>
      </section>

      <section aria-labelledby="run" className="mt-10">
        <h2 id="run" className="font-display text-2xl font-semibold text-fg">
          Run it yourself
        </h2>
        <p className="mt-2 text-fg-muted">
          From a copy of the repository, after{' '}
          <Link to="/install/" className="text-accent underline">
            installing LZY
          </Link>
          :
        </p>
        <CodeBlock code={`lzy ${example.path}`} language="shell" />
      </section>

      <nav aria-label="Other examples" className="mt-14 grid gap-4 sm:grid-cols-2">
        {previous ? (
          <Link
            to={`/examples/${previous.slug}/`}
            className="glow-card rounded-xl border border-line bg-surface p-4"
          >
            <span className="flex items-center gap-1.5 text-xs text-fg-subtle">
              <Icon name="arrow-left" className="size-3.5" /> Previous example
            </span>
            <span className="mt-1 block font-medium text-fg">{exampleTitle(previous.slug)}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            to={`/examples/${next.slug}/`}
            className="glow-card rounded-xl border border-line bg-surface p-4 text-right"
          >
            <span className="flex items-center justify-end gap-1.5 text-xs text-fg-subtle">
              Next example <Icon name="arrow-right" className="size-3.5" />
            </span>
            <span className="mt-1 block font-medium text-fg">{exampleTitle(next.slug)}</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
