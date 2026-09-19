import { Link } from 'react-router';

import { Mascot } from '@/components/Logo';
import { PageHeader, SectionHeading } from '@/components/PageHeader';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { Icon, type IconName } from '@/components/ui/Icon';
import { links } from '@/data/site';
import { usePageHead } from '@/lib/head';

const channels: Array<{
  icon: IconName;
  title: string;
  body: string;
  href: string;
  action: string;
}> = [
  {
    icon: 'chat',
    title: 'GitHub Discussions',
    body: 'Questions of any size, including beginner ones. Ideas, design arguments, and things you made with LZY.',
    href: links.discussions,
    action: 'Open Discussions',
  },
  {
    icon: 'bug',
    title: 'GitHub Issues',
    body: 'Bugs, confusing error messages, and language ideas, each with its own template.',
    href: links.issues,
    action: 'Browse issues',
  },
  {
    icon: 'pr',
    title: 'Pull requests',
    body: 'Changes to the interpreter, tests, examples, documentation and this website.',
    href: links.pulls,
    action: 'See pull requests',
  },
  {
    icon: 'lock',
    title: 'Private security reports',
    body: 'Vulnerabilities go through GitHub’s private reporting, never a public issue.',
    href: links.securityAdvisory,
    action: 'Report privately',
  },
];

const ways: Array<{ title: string; body: string; to?: string; href?: string }> = [
  {
    title: 'Argue with a design decision',
    body: 'Every decision is written down with its reasoning. If one is wrong, a program that shows why is the most useful thing you can send.',
    to: '/docs/design-decisions/',
  },
  {
    title: 'Report an error message that confused you',
    body: 'Error messages are a feature of LZY. If one left you guessing, that is a bug worth reporting.',
    href: links.confusingError,
  },
  {
    title: 'Write a level of the course',
    body: 'Levels 6 to 9 of the learning course are not written yet.',
    to: '/learn/',
  },
  {
    title: 'Add a test or an example',
    body: 'A failing test is a good bug report, and an example that teaches one idea well is always welcome.',
    to: '/contributing/',
  },
];

export default function Community() {
  usePageHead({
    title: 'Community',
    description:
      'Where the LZY community talks: GitHub Discussions, Issues and pull requests. How to ask a question, report a problem, or help shape the language.',
    route: '/community/',
  });

  return (
    <div className="mx-auto max-w-[90rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <PageHeader
          eyebrow="Community"
          title="Shape LZY while it is young"
          lead="LZY is at the stage where one good argument can change the language. Everything happens in the open, on GitHub."
        >
          <ButtonAnchor href={links.discussions} variant="primary" icon="chat">
            Join the discussion
          </ButtonAnchor>
          <ButtonAnchor href={links.repository} icon="github">
            Star the repository
          </ButtonAnchor>
        </PageHeader>
        <Mascot
          size={240}
          className="float mx-auto hidden drop-shadow-[0_20px_40px_rgb(255_36_60/0.25)] lg:block"
        />
      </div>

      <section className="mt-16" aria-labelledby="channels">
        <SectionHeading id="channels" title="Where to talk" />
        <div className="grid gap-5 md:grid-cols-2">
          {channels.map((channel) => (
            <a
              key={channel.title}
              href={channel.href}
              rel="noopener noreferrer"
              className="glow-card group flex gap-4 rounded-2xl border border-line bg-surface p-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent-soft text-accent">
                <Icon name={channel.icon} className="size-6" />
              </span>
              <span>
                <span className="block font-display text-lg font-semibold text-fg">
                  {channel.title}
                </span>
                <span className="mt-1 block text-fg-muted">{channel.body}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  {channel.action} <Icon name="external" className="size-3.5" />
                </span>
              </span>
            </a>
          ))}
        </div>
        <Callout kind="note" title="Other platforms" className="mt-6">
          The channels above are LZY&apos;s official ones. If the project opens others — a chat
          server or social accounts — they will be listed on this page, so an account elsewhere that
          is not listed here is not an official LZY channel.
        </Callout>
      </section>

      <section className="mt-20" aria-labelledby="help">
        <SectionHeading
          id="help"
          title="Ways to help"
          lead="Early projects need arguments more than patches. None of these needs deep knowledge of the interpreter."
        />
        <ul className="grid gap-5 md:grid-cols-2">
          {ways.map((way) => {
            const inner = (
              <>
                <span className="block font-display text-lg font-semibold text-fg group-hover:text-accent">
                  {way.title}
                </span>
                <span className="mt-2 block text-fg-muted">{way.body}</span>
              </>
            );
            const className =
              'glow-card group block h-full rounded-2xl border border-line bg-surface p-6';
            return (
              <li key={way.title}>
                {way.to ? (
                  <Link to={way.to} className={className}>
                    {inner}
                  </Link>
                ) : (
                  <a href={way.href} rel="noopener noreferrer" className={className}>
                    {inner}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-20 grid gap-6 lg:grid-cols-2" aria-label="Community standards">
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-fg">A note on beginners</h2>
          <blockquote className="mt-3 border-l-2 border-accent pl-4 text-fg-muted italic">
            LZY exists so that people can learn to program. A question that seems obvious to you may
            be the hardest thing someone has attempted this year. Answer it, or say nothing.
          </blockquote>
          <p className="mt-3 text-sm text-fg-subtle">From the Code of Conduct.</p>
          <ButtonLink to="/code-of-conduct/" variant="secondary" className="mt-5">
            Read the Code of Conduct
          </ButtonLink>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="font-display text-xl font-semibold text-fg">Contributors</h2>
          <p className="mt-3 text-fg-muted">
            GitHub lists everyone whose work is part of LZY. Your name can be next.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonAnchor href={links.contributors} icon="users">
              Contributors
            </ButtonAnchor>
            <ButtonLink to="/contributing/" arrow>
              How to contribute
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
