import { Link } from 'react-router';

import { footerColumns } from '@/content/navigation';
import { links, project, site } from '@/data/site';

import { LogoMark } from '../Logo';
import { Icon } from '../ui/Icon';

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line bg-bg-raised">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
      />
      <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3" aria-label="LZY home">
              <LogoMark size={56} alt="" />
              <span>
                <span className="block font-display text-2xl font-bold text-fg">LZY</span>
                <span className="block text-sm text-fg-muted">{site.tagline}</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-fg-muted">{site.description}</p>
            <p className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs text-fg-subtle">
              <Link
                to="/releases/"
                className="rounded-md border border-line px-2 py-1 hover:border-line-strong hover:text-fg"
              >
                v{project.version}
              </Link>
              <span className="rounded-md border border-line px-2 py-1">{project.license}</span>
              <span className="rounded-md border border-line px-2 py-1">
                Python {project.requiresPython?.replace('>=', '')}+
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="font-display text-sm font-semibold tracking-wide text-fg">
                  {column.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((item) => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.to}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-accent"
                        >
                          {item.label}
                          <Icon name="external" className="size-3 opacity-60" />
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          className="text-sm text-fg-muted transition-colors hover:text-accent"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-sm text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {project.copyright?.replace(/^Copyright\s+/, '')} and the LZY contributors. Released
            under the{' '}
            <Link
              to="/license/"
              className="underline decoration-line-strong underline-offset-4 hover:text-fg"
            >
              Apache License 2.0
            </Link>
            .
          </p>
          <p className="flex items-center gap-4">
            <a
              href={links.repository}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-fg"
            >
              <Icon name="github" className="size-4" />
              rishav9713/lzy
            </a>
            <a href={links.discussions} rel="noopener noreferrer" className="hover:text-fg">
              Discussions
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
