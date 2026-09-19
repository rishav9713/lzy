import { use } from 'react';

import { contentComponents } from '@/components/content';
import { Breadcrumb } from '@/components/docs/Breadcrumb';
import { DocContent } from '@/components/docs/DocContent';
import { DocsLayout } from '@/components/docs/DocsLayout';
import { PrevNext, sectionFor } from '@/components/docs/PrevNext';
import { TableOfContents } from '@/components/docs/TableOfContents';
import { Icon } from '@/components/ui/Icon';
import { loadDocument, pageMeta } from '@/content/docs';
import { links } from '@/data/site';
import { usePageHead } from '@/lib/head';

/** Where a document lives, said plainly, with a way to change it. */
function SourceNote({ source }: { source: string }) {
  const fromRepository = !source.startsWith('LZY-Website/');
  const editable = source.endsWith('.md');
  return (
    <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6 text-sm text-fg-subtle">
      {fromRepository && (
        <span className="min-w-0">
          <Icon name="file" className="mr-2 inline size-4 align-[-0.15em]" />
          This page is{' '}
          <a
            href={links.file(source)}
            rel="noopener noreferrer"
            className="font-mono break-all text-fg-muted underline decoration-line-strong underline-offset-4 hover:text-fg"
          >
            {source}
          </a>{' '}
          from the repository.
        </span>
      )}
      {editable && (
        <a
          href={links.edit(source)}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 hover:text-fg"
        >
          <Icon name="edit" className="size-4" /> Edit this page on GitHub
        </a>
      )}
      <a
        href={links.newIssue}
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 hover:text-fg"
      >
        <Icon name="bug" className="size-4" /> Report a problem with this page
      </a>
    </div>
  );
}

export default function DocPage({ route }: { route: string }) {
  const meta = pageMeta(route);
  if (!meta) throw new Error(`No page registered for ${route}`);

  usePageHead({ title: meta.title, description: meta.description, route, type: 'article' });
  const document = use(loadDocument(route));
  const Before = meta.before ? contentComponents[meta.before] : undefined;

  const article = (
    <article>
      <header className="mb-8">
        <h1 className="font-display text-4xl leading-tight font-bold tracking-tight text-fg sm:text-[2.75rem]">
          {document.title}
        </h1>
      </header>
      {Before && (
        <div className="mb-10">
          <Before />
        </div>
      )}
      <DocContent segments={document.segments} />
      <SourceNote source={document.source} />
    </article>
  );

  if (meta.layout === 'docs') {
    const section = sectionFor(route);
    return (
      <DocsLayout headings={document.headings}>
        <Breadcrumb
          items={[
            { label: 'Docs', to: '/docs/' },
            ...(section ? [{ label: section }] : []),
            { label: document.title },
          ]}
        />
        {article}
        <PrevNext route={route} />
      </DocsLayout>
    );
  }

  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-10 py-10 xl:grid-cols-[minmax(0,1fr)_14rem] xl:gap-16 lg:py-14">
        <div className="mx-auto w-full max-w-3xl min-w-0">
          <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: document.title }]} />
          {article}
        </div>
        <aside className="hidden xl:block" aria-label="On this page">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto [scrollbar-width:thin]">
            <TableOfContents headings={document.headings} />
          </div>
        </aside>
      </div>
    </div>
  );
}
