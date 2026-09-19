import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { contentComponents } from '@/components/content';
import type { Segment } from '@/content/types';
import { copyText } from '@/hooks/useCopy';

const base = import.meta.env.BASE_URL;

/**
 * Rendered Markdown, plus any components the document asked for with an
 * `<!-- lzy:component name -->` comment.
 *
 * The HTML was produced at build time from the repository's own documents,
 * with any raw HTML in them escaped (see plugins/markdown.ts). Clicks are
 * handled here rather than per element: copy buttons copy their block, and
 * links to other pages on this site navigate without a full reload.
 */
export function DocContent({ segments, className }: { segments: Segment[]; className?: string }) {
  const navigate = useNavigate();

  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    const copy = target.closest<HTMLButtonElement>('button[data-copy]');
    if (copy) {
      const code = copy.closest('figure')?.querySelector('pre')?.textContent ?? '';
      void copyText(code).then((done) => {
        const label = copy.querySelector('span');
        if (!done || !label) return;
        copy.dataset.copied = 'true';
        label.textContent = 'Copied';
        window.setTimeout(() => {
          copy.dataset.copied = 'false';
          label.textContent = 'Copy';
        }, 1800);
      });
      return;
    }

    const link = target.closest<HTMLAnchorElement>('a[href]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target
    ) {
      return;
    }
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith(base)) {
      event.preventDefault();
      navigate('/' + href.slice(base.length));
    }
  };

  return (
    // Clicks are delegated from the real buttons and links inside, which
    // handle the keyboard themselves.
    <div className={className} onClick={onClick}>
      {segments.map((segment, index) => {
        if (segment.kind === 'html') {
          return (
            <div key={index} className="prose" dangerouslySetInnerHTML={{ __html: segment.html }} />
          );
        }
        const Component = contentComponents[segment.name];
        if (!Component) throw new Error(`Unknown content component: ${segment.name}`);
        return (
          <div key={index} className="my-8">
            <Component />
          </div>
        );
      })}
    </div>
  );
}
