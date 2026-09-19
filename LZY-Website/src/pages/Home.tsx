import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { Decisions } from '@/components/home/Decisions';
import { ErrorsThatTeach } from '@/components/home/ErrorsThatTeach';
import { Hero } from '@/components/home/Hero';
import { Numbers } from '@/components/home/Numbers';
import { Showcase } from '@/components/home/Showcase';
import { InstallCommands } from '@/components/install/InstallCommands';
import { SectionHeading } from '@/components/PageHeader';
import { RoadmapStrip } from '@/components/roadmap/RoadmapStrip';
import { ButtonAnchor, ButtonLink } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { UseCaseCard } from '@/components/UseCaseCard';
import { CodeBlock } from '@/components/code/CodeBlock';
import { useCases } from '@/content/home';
import lzy from '@/data/generated/lzy.json';
import { asset, links, site } from '@/data/site';
import { useReveal } from '@/hooks/useReveal';
import { usePageHead } from '@/lib/head';

function Section({
  children,
  id,
  className = '',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const ref = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      className={`mx-auto max-w-[90rem] scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8 lg:py-28 ${className}`}
    >
      {children}
    </section>
  );
}

const preview = [
  'education',
  'teaching-algorithms',
  'scripting',
  'security',
  'data-processing',
  'automation',
];

const involved: Array<{
  icon: IconName;
  title: string;
  body: string;
  to: string;
  external?: boolean;
}> = [
  {
    icon: 'book',
    title: 'Read the documentation',
    body: 'A guided course, a topic-by-topic guide, and the full specification.',
    to: '/docs/',
  },
  {
    icon: 'code',
    title: 'Browse the examples',
    body: `${lzy.project.examples} programs, from FizzBuzz to a log analyser, each with its real output.`,
    to: '/examples/',
  },
  {
    icon: 'chat',
    title: 'Join the discussion',
    body: 'Ask a question, argue with a design decision, or share what you built.',
    to: links.discussions,
    external: true,
  },
  {
    icon: 'pr',
    title: 'Contribute',
    body: 'Clearer error messages, tests, examples and course levels are all wanted.',
    to: '/contributing/',
  },
];

export default function Home() {
  usePageHead({
    title: site.fullName,
    description: `${site.description} Case-insensitive, indentation-based, and strict about types, with error messages that teach.`,
    route: '/',
  });

  const versionRun = lzy.cli.runs.version.stdout.trim();

  return (
    <>
      <Hero />

      <div className="border-y border-line bg-bg-raised/60">
        <Section className="!py-14 lg:!py-16">
          <div data-reveal>
            <Numbers />
          </div>
        </Section>
      </div>

      <Section id="read-it-aloud">
        <div data-reveal>
          <SectionHeading
            eyebrow="Read it aloud"
            title={
              <>
                A program should say what it does, <span className="text-accent">in words.</span>
              </>
            }
            lead="Most languages ask a beginner to learn punctuation before ideas. LZY removes the ceremony — semicolons, braces, boilerplate — without removing the meaning."
          />
        </div>
        <div data-reveal>
          <Showcase />
        </div>
      </Section>

      <div className="relative border-y border-line bg-bg-raised/60">
        <div aria-hidden="true" className="bg-grid fade-mask-b absolute inset-0 opacity-60" />
        <Section className="relative">
          <div data-reveal>
            <SectionHeading
              eyebrow="Why LZY"
              title="Less syntax, not less understanding."
              lead="Four decisions follow from that rule, and they are the ones people notice first. Each is argued in the design decisions, including the parts that are genuinely debatable."
            />
          </div>
          <Decisions />
          <p className="mt-8 text-fg-muted" data-reveal>
            <Link
              to="/docs/design-decisions/"
              className="inline-flex items-center gap-1.5 font-medium text-accent hover:underline"
            >
              Read every design decision and the reasoning behind it
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </p>
        </Section>
      </div>

      <Section id="errors">
        <div data-reveal>
          <SectionHeading
            eyebrow="Errors that teach"
            title="Every error answers four questions."
            lead="Error messages are treated as a feature of the language, not an afterthought. LZY never shows a Python traceback to someone writing LZY."
          />
        </div>
        <ErrorsThatTeach />
      </Section>

      <div className="border-y border-line bg-bg-raised/60">
        <Section id="use-cases">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <SectionHeading
              eyebrow="Use cases"
              title="What LZY is good for — today."
              lead="LZY is general-purpose, but young. Each use is labelled honestly: available now, possible with stated limits, or planned for a named release."
            />
            <ButtonLink to="/use-cases/" variant="secondary" arrow className="mb-10">
              All use cases
            </ButtonLink>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {useCases
              .filter((useCase) => preview.includes(useCase.id))
              .map((useCase, index) => (
                <div
                  key={useCase.id}
                  data-reveal
                  style={{ ['--reveal-delay' as string]: `${(index % 3) * 70}ms` }}
                >
                  <UseCaseCard useCase={useCase} />
                </div>
              ))}
          </div>
        </Section>
      </div>

      <Section id="install">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div data-reveal>
            <SectionHeading
              eyebrow="Install"
              title="Running in under a minute."
              lead={`LZY needs Python ${lzy.project.requiresPython?.replace('>=', '')} or newer, and nothing else: the interpreter uses only the Python standard library.`}
            />
            <div className="flex flex-wrap gap-3">
              <ButtonLink to="/install/" variant="secondary" icon="download">
                Installation guide
              </ButtonLink>
              <ButtonLink to="/download/" variant="ghost">
                All downloads
              </ButtonLink>
            </div>
          </div>
          <ol className="space-y-8" data-reveal>
            <li>
              <h3 className="mb-3 flex items-center gap-3 font-display text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft font-mono text-sm text-accent">
                  1
                </span>
                Install it
              </h3>
              <InstallCommands compact />
            </li>
            <li>
              <h3 className="mb-3 flex items-center gap-3 font-display text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft font-mono text-sm text-accent">
                  2
                </span>
                Check it worked
              </h3>
              <CodeBlock code="lzy --version" language="shell" className="!my-0" />
              <CodeBlock code={versionRun} language="text" className="!mt-2 !mb-0" copy={false} />
            </li>
            <li>
              <h3 className="mb-3 flex items-center gap-3 font-display text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft font-mono text-sm text-accent">
                  3
                </span>
                Write and run a program
              </h3>
              <CodeBlock
                code={'say "Hello World"'}
                language="lzy"
                label="hello.lzy"
                className="!my-0"
              />
              <CodeBlock code="lzy hello.lzy" language="shell" className="!mt-2 !mb-0" />
            </li>
          </ol>
        </div>
      </Section>

      <div className="border-y border-line bg-bg-raised/60">
        <Section id="roadmap">
          <div className="flex flex-wrap items-end justify-between gap-6" data-reveal>
            <SectionHeading
              eyebrow="Roadmap"
              title="Where LZY is going."
              lead="Versions ship when their conditions are met, not on a date. Error handling, a formatter and a linter come next."
            />
            <ButtonLink to="/roadmap/" variant="secondary" arrow className="mb-10">
              The full roadmap
            </ButtonLink>
          </div>
          <div data-reveal>
            <RoadmapStrip />
          </div>
        </Section>
      </div>

      <Section id="community">
        <div
          data-reveal
          className="relative overflow-hidden rounded-3xl border border-line bg-[#07070a] p-6 sm:p-10"
        >
          <div aria-hidden="true" className="glow-orb -top-40 right-0 size-[30rem] opacity-50" />
          <img
            src={asset('assets/backgrounds/lzy-banner-1600.webp')}
            srcSet={`${asset('assets/backgrounds/lzy-banner-800.webp')} 800w, ${asset('assets/backgrounds/lzy-banner-1600.webp')} 1600w`}
            sizes="(min-width: 1024px) 48rem, 90vw"
            width={1600}
            height={341}
            alt={`The LZY banner: ${site.artworkLine}`}
            loading="lazy"
            decoding="async"
            className="relative mx-auto h-auto w-full max-w-3xl"
          />
          <div className="relative mt-8 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Built in the open.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-[#b4b4c0]">
              LZY is early, which makes this the best time to shape it. Design arguments are as
              welcome as patches.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <ButtonAnchor href={links.repository} icon="github" variant="primary">
                Star it on GitHub
              </ButtonAnchor>
              <ButtonLink to="/community/" variant="secondary">
                Community
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {involved.map((item, index) => {
            const body = (
              <>
                <Icon name={item.icon} className="size-6 text-accent" />
                <h3 className="mt-4 font-display text-lg font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.body}</p>
              </>
            );
            const className =
              'glow-card block h-full rounded-2xl border border-line bg-surface p-6';
            return (
              <div
                key={item.title}
                data-reveal
                style={{ ['--reveal-delay' as string]: `${index * 60}ms` }}
              >
                {item.external ? (
                  <a href={item.to} rel="noopener noreferrer" className={className}>
                    {body}
                  </a>
                ) : (
                  <Link to={item.to} className={className}>
                    {body}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}
