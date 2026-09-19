import { Link } from 'react-router';

import { cx } from '@/lib/cx';

import { milestones } from './timeline';

/** The whole roadmap on one line, for the home page. */
export function RoadmapStrip() {
  const items = milestones();
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 [scrollbar-width:thin]">
      <div className="relative min-w-[56rem]">
        <div
          aria-hidden="true"
          className="absolute top-[1.1rem] right-6 left-6 h-px bg-gradient-to-r from-ok/60 via-accent/60 to-line"
        />
        <ol className="relative flex">
          {items.map((item) => (
            <li key={item.version} className="relative flex-1 px-2 text-center">
              <Link
                to={`/roadmap/#v${item.version.replace(/\./g, '-')}`}
                className="group inline-flex flex-col items-center"
              >
                <span
                  className={cx(
                    'relative z-10 flex size-9 items-center justify-center rounded-full border-2 bg-bg font-mono text-xs font-bold transition-transform group-hover:scale-110',
                    item.state === 'done' && 'border-ok text-ok',
                    item.state === 'next' &&
                      'border-accent text-accent shadow-[0_0_0_4px_var(--accent-soft),0_0_24px_var(--glow)]',
                    item.state === 'planned' && 'border-line-strong text-fg-subtle',
                  )}
                  aria-hidden="true"
                >
                  {item.state === 'done' ? '✓' : item.state === 'next' ? '●' : '○'}
                </span>
                <span className="mt-3 font-mono text-sm font-semibold text-fg">{item.version}</span>
                <span className="mt-1 max-w-[9rem] text-xs leading-snug text-fg-muted group-hover:text-fg">
                  {item.title}
                </span>
                <span
                  className={cx(
                    'mt-2 font-mono text-[0.65rem] tracking-wide uppercase',
                    item.state === 'done' && 'text-ok',
                    item.state === 'next' && 'text-accent',
                    item.state === 'planned' && 'text-fg-subtle',
                  )}
                >
                  {item.state === 'done' ? 'Released' : item.state === 'next' ? 'Next' : 'Planned'}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
