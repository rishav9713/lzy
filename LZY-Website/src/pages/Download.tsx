import { Link } from 'react-router';
import { releases } from 'virtual:lzy-releases';

import { CodeBlock } from '@/components/code/CodeBlock';
import { CopyButton } from '@/components/code/CopyButton';
import { InstallCommands } from '@/components/install/InstallCommands';
import { PageHeader, SectionHeading } from '@/components/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Icon } from '@/components/ui/Icon';
import { channels, releaseAdvisories } from '@/content/downloads';
import { links, project } from '@/data/site';
import { formatDate } from '@/lib/format';
import { usePageHead } from '@/lib/head';

export default function Download() {
  usePageHead({
    title: 'Download',
    description: `Download LZY ${project.version}: a Python wheel and source archive from GitHub Releases, with SHA-256 checksums, for Windows, macOS and Linux.`,
    route: '/download/',
  });

  const latest = releases[0];
  const older = releases.slice(1);
  const systems = project.ci.systems.map((system) => system.replace('-latest', ''));

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <PageHeader
        eyebrow="Download"
        title={`Get LZY ${project.version}`}
        lead="LZY is a pure-Python interpreter with no dependencies. One wheel works on every operating system and processor that runs Python."
      />

      {latest && (
        <section
          className="mt-12 overflow-hidden rounded-3xl border border-line bg-surface"
          aria-labelledby="latest-release"
        >
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line bg-surface-2/60 p-6 sm:p-8">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs tracking-wide text-ok uppercase">
                <span className="pulse-dot size-2 rounded-full bg-ok text-ok" /> Latest release
              </p>
              <h2 id="latest-release" className="mt-2 font-display text-3xl font-bold text-fg">
                LZY {latest.version}
                {latest.name && <span className="text-fg-muted"> — {latest.name}</span>}
              </h2>
              {latest.date && (
                <p className="mt-1 text-fg-subtle">Released {formatDate(latest.date)}</p>
              )}
              {latest.summary[0] && (
                <p
                  className="prose mt-4 max-w-2xl"
                  dangerouslySetInnerHTML={{ __html: latest.summary[0] }}
                />
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {latest.notesRoute && (
                <ButtonLink to={latest.notesRoute} variant="secondary" icon="file">
                  Release notes
                </ButtonLink>
              )}
              <ButtonAnchor href={latest.githubUrl} icon="github">
                On GitHub
              </ButtonAnchor>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-fg">Files</h3>
            <ul className="mt-4 space-y-3">
              {latest.assets.map((asset) => (
                <li
                  key={asset.file}
                  className="flex flex-col gap-3 rounded-2xl border border-line bg-bg-raised p-4 lg:flex-row lg:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-mono text-sm font-medium break-all text-fg">
                      <Icon name="package" className="size-4 shrink-0 text-accent" />
                      {asset.file}
                    </p>
                    <p className="mt-1 text-sm text-fg-subtle">
                      {asset.file.endsWith('.whl')
                        ? 'Wheel: what pip installs. Pure Python, so it works on x86-64 and ARM alike.'
                        : 'Source archive: the same code, for building or inspecting.'}
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-mono text-xs break-all text-fg-subtle">
                      <span className="shrink-0 text-fg-muted">SHA-256</span> {asset.sha256}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <CopyButton text={asset.sha256} label="SHA-256 checksum" plain />
                    <ButtonAnchor href={asset.url} variant="primary" size="sm" icon="download">
                      Download
                    </ButtonAnchor>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-fg-subtle">
              Checksums are also published as <code className="inline">SHA256SUMS.txt</code> with
              the release. Releases are not yet signed; signing is planned for 0.9.0.
            </p>
          </div>
        </section>
      )}

      <section className="mt-20" aria-labelledby="install">
        <SectionHeading id="install" eyebrow="Install" title="Install it in one command" />
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <InstallCommands />
          <div>
            <h3 className="font-display text-lg font-semibold text-fg">Then check it worked</h3>
            <CodeBlock code="lzy --version" language="shell" />
            <p className="text-fg-muted">
              It should print <code className="inline">LZY {project.version}</code>. If it does not,
              see{' '}
              <Link to="/troubleshooting/" className="text-accent underline">
                troubleshooting
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="verify">
        <SectionHeading
          id="verify"
          eyebrow="Verify"
          title="Check what you downloaded"
          lead="Compare the file's SHA-256 checksum with the one above, or with SHA256SUMS.txt from the same release."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <h3 className="font-display font-semibold text-fg">Linux</h3>
            <CodeBlock code="sha256sum -c SHA256SUMS.txt" language="shell" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-fg">macOS</h3>
            <CodeBlock code="shasum -a 256 -c SHA256SUMS.txt" language="shell" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-fg">Windows (PowerShell)</h3>
            <CodeBlock
              code={`Get-FileHash .\\lzy_lang-${project.version}-py3-none-any.whl -Algorithm SHA256`}
              language="shell"
              label="PowerShell"
            />
          </div>
        </div>
      </section>

      <section className="mt-20" aria-labelledby="platforms">
        <SectionHeading
          id="platforms"
          eyebrow="Platforms"
          title="Where LZY runs"
          lead={`Anywhere Python ${project.requiresPython?.replace('>=', '')} or newer runs. Every change is tested on these systems and Python versions before it can merge.`}
        />
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[36rem] text-sm">
            <caption className="sr-only">
              The operating systems and Python versions CI tests
            </caption>
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-display font-semibold text-fg">
                  System
                </th>
                {project.ci.pythons.map((python) => (
                  <th
                    key={python}
                    scope="col"
                    className="px-4 py-3 text-center font-mono font-medium text-fg"
                  >
                    Python {python}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {systems.map((system) => (
                <tr key={system}>
                  <th scope="row" className="px-4 py-3 text-left font-medium text-fg capitalize">
                    {system === 'macos' ? 'macOS' : system}
                  </th>
                  {project.ci.pythons.map((python) => (
                    <td key={python} className="px-4 py-3 text-center">
                      <Icon name="check" className="mx-auto size-4 text-ok" label="Tested" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-fg-subtle">
          From the CI configuration, which uses GitHub&apos;s latest Ubuntu, macOS and Windows
          runners. See the{' '}
          <a href={links.actions} rel="noopener noreferrer" className="text-accent underline">
            current results
          </a>
          .
        </p>
      </section>

      <section className="mt-20" aria-labelledby="channels">
        <SectionHeading id="channels" eyebrow="Channels" title="Other ways to get LZY" />
        <ul className="grid gap-3 md:grid-cols-2">
          {channels.map((channel) => (
            <li key={channel.name} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-medium text-fg">{channel.name}</h3>
                <StatusBadge status={channel.status === 'available' ? 'available' : 'planned'}>
                  {channel.status === 'available' ? 'Available' : 'Not available'}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm text-fg-muted">{channel.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      {older.length > 0 && (
        <section className="mt-20" aria-labelledby="older">
          <SectionHeading id="older" eyebrow="Archive" title="Older releases" />
          <ul className="space-y-3">
            {older.map((release) => (
              <li key={release.version} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold text-fg">
                      LZY {release.version}
                      {release.name && <span className="text-fg-muted"> — {release.name}</span>}
                    </h3>
                    <p className="text-sm text-fg-subtle">{formatDate(release.date)}</p>
                  </div>
                  <div className="flex gap-2">
                    {release.notesRoute && (
                      <ButtonLink to={release.notesRoute} size="sm" variant="ghost">
                        Notes
                      </ButtonLink>
                    )}
                    <ButtonAnchor href={release.githubUrl} size="sm" icon="github">
                      Files
                    </ButtonAnchor>
                  </div>
                </div>
                {releaseAdvisories[release.version] && (
                  <Callout kind="warning" className="mt-4">
                    {releaseAdvisories[release.version]}
                  </Callout>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
