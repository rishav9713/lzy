import { Link } from 'react-router';
import { releases, unreleased } from 'virtual:lzy-releases';

import { PageHeader } from '@/components/PageHeader';
import { Pill } from '@/components/ui/Badge';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Icon } from '@/components/ui/Icon';
import { releaseAdvisories } from '@/content/downloads';
import { links } from '@/data/site';
import { formatDate } from '@/lib/format';
import { usePageHead } from '@/lib/head';

export default function Releases() {
  usePageHead({
    title: 'Releases',
    description:
      'Every LZY release: what was added, changed, fixed and secured, with downloads and SHA-256 checksums. Read from the changelog and release notes in the repository.',
    route: '/releases/',
  });

  const pending = unreleased && unreleased.groups.length > 0 ? unreleased : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Releases"
        title="Releases and changes"
        lead="LZY uses semantic versioning. While the version starts with 0., the language may change in ways that break programs, and every such change is written down."
      >
        <ButtonLink to="/changelog/" variant="secondary" icon="file">
          Full changelog
        </ButtonLink>
        <ButtonAnchor href={links.releases} icon="github">
          GitHub Releases
        </ButtonAnchor>
      </PageHeader>

      {pending && (
        <Callout kind="note" title="Unreleased" className="mt-10">
          Changes are waiting on <code className="inline">main</code> for the next release.{' '}
          <Link to="/changelog/#unreleased" className="text-accent underline">
            See what is coming
          </Link>
          .
        </Callout>
      )}

      <ol className="mt-12 space-y-8">
        {releases.map((release) => (
          <li key={release.version}>
            <article
              aria-labelledby={`release-${release.version}`}
              className="overflow-hidden rounded-3xl border border-line bg-surface"
            >
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {release.latest && (
                      <span className="rounded-full bg-ok-soft px-2.5 py-0.5 font-mono text-xs font-medium text-ok">
                        Latest
                      </span>
                    )}
                    <Pill>
                      <Icon name="tag" className="size-3" /> v{release.version}
                    </Pill>
                    {release.date && <Pill>{formatDate(release.date)}</Pill>}
                  </div>
                  <h2
                    id={`release-${release.version}`}
                    className="mt-3 font-display text-3xl font-bold text-fg"
                  >
                    LZY {release.version}
                    {release.name && <span className="text-fg-muted"> — {release.name}</span>}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {release.notesRoute && (
                    <ButtonLink to={release.notesRoute} size="sm" variant="secondary">
                      Release notes
                    </ButtonLink>
                  )}
                  <ButtonAnchor href={release.githubUrl} size="sm" icon="github">
                    Downloads
                  </ButtonAnchor>
                </div>
              </header>

              <div className="p-6 sm:p-8">
                {releaseAdvisories[release.version] && (
                  <Callout kind="warning" className="mb-6">
                    {releaseAdvisories[release.version]}
                  </Callout>
                )}
                {release.summary.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="prose mb-3 text-[1.02rem]"
                    dangerouslySetInnerHTML={{ __html: paragraph }}
                  />
                ))}

                <div className="mt-6 flex flex-wrap gap-2">
                  {release.groups.map((group) => (
                    <a
                      key={group.name}
                      href={`#${release.version}-${group.name.toLowerCase()}`}
                      className="rounded-lg border border-line bg-bg-raised px-3 py-1.5 text-sm text-fg-muted hover:text-fg"
                    >
                      {group.name}
                      {group.count > 0 && (
                        <span className="ml-1.5 font-mono text-xs text-fg-subtle">
                          {group.count}
                        </span>
                      )}
                    </a>
                  ))}
                </div>

                <div className="mt-6 space-y-2">
                  {release.groups.map((group) => (
                    <details
                      key={group.name}
                      id={`${release.version}-${group.name.toLowerCase()}`}
                      className="group rounded-xl border border-line bg-bg-raised"
                    >
                      <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-display font-semibold text-fg">
                        {group.name}
                        <Icon
                          name="chevron-down"
                          className="size-4 text-fg-subtle transition-transform group-open:rotate-180"
                        />
                      </summary>
                      <div
                        className="prose border-t border-line px-4 py-2 text-[0.95rem]"
                        dangerouslySetInnerHTML={{ __html: group.blocks.join('') }}
                      />
                    </details>
                  ))}
                </div>

                {release.assets.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
                      Files
                    </h3>
                    <ul className="mt-2 space-y-2">
                      {release.assets.map((asset) => (
                        <li
                          key={asset.file}
                          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                        >
                          <a
                            href={asset.url}
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-mono text-accent hover:underline"
                          >
                            <Icon name="download" className="size-3.5" /> {asset.file}
                          </a>
                          <span className="font-mono text-xs break-all text-fg-subtle">
                            sha256 {asset.sha256}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );
}
