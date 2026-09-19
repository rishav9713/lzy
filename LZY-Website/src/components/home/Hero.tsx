import { Link } from 'react-router';
import { releases } from 'virtual:lzy-releases';

import { links, project, site } from '@/data/site';
import { useGitHubRepo } from '@/hooks/useGitHubRepo';

import { LogoMark } from '../Logo';
import { ButtonAnchor, ButtonLink } from '../ui/Button';
import { Icon } from '../ui/Icon';

/** Fixed positions, so the server and the browser draw the same particles. */
const particles = [
  { left: '8%', top: '62%', delay: '0s', duration: '9s' },
  { left: '18%', top: '30%', delay: '2.5s', duration: '11s' },
  { left: '31%', top: '74%', delay: '5s', duration: '10s' },
  { left: '47%', top: '22%', delay: '1s', duration: '12s' },
  { left: '58%', top: '68%', delay: '3.5s', duration: '9s' },
  { left: '71%', top: '40%', delay: '6s', duration: '11s' },
  { left: '83%', top: '78%', delay: '4s', duration: '10s' },
  { left: '92%', top: '26%', delay: '7s', duration: '12s' },
];

export function Hero() {
  const stats = useGitHubRepo();
  const latest = releases[0];
  const dependencies = project.runtimeDependencies.length;

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="bg-grid radial-mask absolute inset-0" />
        <div className="glow-orb top-[-10%] left-[55%] size-[38rem] opacity-60" />
        <div className="glow-orb top-[35%] left-[-12%] size-[26rem] opacity-30" />
        <div className="hero-floor" />
        {particles.map((particle, index) => (
          <span
            key={index}
            className="particle"
            style={{
              left: particle.left,
              top: particle.top,
              ['--delay' as string]: particle.delay,
              ['--duration' as string]: particle.duration,
            }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-[90rem] items-center gap-12 px-4 pt-14 pb-20 sm:px-6 sm:pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pt-24 lg:pb-28">
        <div className="order-2 lg:order-1">
          {latest && (
            <Link
              to={latest.notesRoute ?? '/releases/'}
              className="group mb-7 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 py-1 pr-3 pl-1 text-sm text-fg-muted backdrop-blur transition-colors hover:border-line-strong hover:text-fg"
            >
              <span className="rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-xs font-medium text-accent">
                v{latest.version}
              </span>
              <span>
                {latest.name ? `${latest.name} release` : 'Latest release'} · read what changed
              </span>
              <Icon
                name="arrow-right"
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          )}

          <p className="font-mono text-sm tracking-[0.18em] text-fg-subtle uppercase">
            The LZY programming language
          </p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-[clamp(2.75rem,7vw,5.25rem)] leading-[0.98] font-bold tracking-tight"
          >
            <span className="text-chrome block">Complex logic.</span>
            <span className="text-gradient block pb-1">Simple code.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-fg-muted sm:text-xl">
            {site.description}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink to="/getting-started/" size="lg" arrow>
              Get started
            </ButtonLink>
            <ButtonLink to="/docs/" variant="secondary" size="lg" icon="book">
              Documentation
            </ButtonLink>
            <ButtonAnchor href={links.repository} size="lg" icon="github">
              GitHub
              {stats && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-md border border-line px-1.5 font-mono text-xs text-fg-muted">
                  <Icon name="star" className="size-3" />
                  {stats.stars}
                </span>
              )}
            </ButtonAnchor>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-subtle">
            <li className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-ok" />
              Python {project.requiresPython?.replace('>=', '')} or newer
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-ok" />
              {dependencies === 0 ? 'No other dependencies' : `${dependencies} dependencies`}
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-ok" />
              Windows, macOS and Linux
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" className="size-4 text-ok" />
              Open source, {project.license}
            </li>
          </ul>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-[12%] rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)] blur-2xl"
            />
            <LogoMark
              size={420}
              priority
              alt="The LZY logo: a sleeping sloth in a red hexagon, over the words LZY Programming Language"
              className="float logo-glow relative h-auto w-[min(62vw,16rem)] sm:w-[20rem] lg:w-[26rem]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
