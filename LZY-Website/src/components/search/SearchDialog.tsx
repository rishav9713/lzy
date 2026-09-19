import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';

import { loadIndex, markMatches, search, type SearchEntry } from '@/lib/search';

import { Icon } from '../ui/Icon';

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {markMatches(text, query).map((part, index) =>
        part.match ? (
          <mark key={index} className="rounded-sm bg-accent-soft px-0.5 text-accent">
            {part.text}
          </mark>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </>
  );
}

/**
 * The search dialog. It follows the ARIA combobox pattern: focus stays in
 * the text field, the arrow keys move through the results, Enter opens one
 * and Escape closes the dialog.
 */
export function SearchDialog({
  initialQuery,
  onClose,
}: {
  initialQuery: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const listId = useId();

  useEffect(() => {
    input.current?.focus();
    let alive = true;
    loadIndex()
      .then((entries) => alive && setIndex(entries))
      .catch(() => alive && setFailed(true));

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const returnTo = document.activeElement as HTMLElement | null;
    return () => {
      alive = false;
      document.body.style.overflow = previousOverflow;
      returnTo?.focus?.();
    };
  }, []);

  const results = useMemo(() => (index ? search(index, query) : []), [index, query]);

  const go = (entry: SearchEntry) => {
    onClose();
    navigate(entry.route + (entry.anchor ? `#${entry.anchor}` : ''));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      const chosen = results[active];
      if (chosen) {
        event.preventDefault();
        go(chosen);
      }
    } else if (event.key === 'Tab') {
      // Keep focus inside the dialog.
      const focusable = dialog.current?.querySelectorAll<HTMLElement>('input, button, a[href]');
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  useEffect(() => {
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' });
  }, [active, listId]);

  const activeId = results[active] ? `${listId}-${active}` : undefined;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label="Search the documentation"
        onKeyDown={onKeyDown}
        className="pop-in relative flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-bg-raised shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9),0_0_0_1px_rgb(255_77_94/0.12)]"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Icon name="search" className="size-5 shrink-0 text-accent" />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            placeholder="Search documentation…"
            aria-label="Search documentation"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            className="h-14 min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-subtle"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-line px-2 py-1 font-mono text-xs text-fg-subtle hover:text-fg"
            aria-label="Close search"
          >
            Esc
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {failed && (
            <p className="px-3 py-6 text-center text-sm text-fg-muted">
              The search index could not be loaded. Check your connection and try again.
            </p>
          )}
          {!failed && !index && (
            <p className="px-3 py-6 text-center text-sm text-fg-muted" role="status">
              Loading the index…
            </p>
          )}
          {index && !query.trim() && (
            <div className="px-3 py-5 text-sm text-fg-muted">
              <p>
                Search the guide, the reference, the specification, every example and every built-in
                function.
              </p>
              <p className="mt-2 text-fg-subtle">
                Try <kbd className="font-mono text-fg">append</kbd>,{' '}
                <kbd className="font-mono text-fg">case-insensitive</kbd> or{' '}
                <kbd className="font-mono text-fg">install windows</kbd>.
              </p>
            </div>
          )}
          {index && query.trim() && results.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-fg-muted" role="status">
              Nothing matches “{query}”. Try a shorter or different word.
            </p>
          )}
          <ul id={listId} role="listbox" aria-label="Search results" className="space-y-1">
            {results.map((result, position) => (
              <li
                key={`${result.route}#${result.anchor}`}
                id={`${listId}-${position}`}
                role="option"
                aria-selected={position === active}
                onMouseMove={() => setActive(position)}
                onClick={() => go(result)}
                className={`cursor-pointer rounded-xl px-3 py-2.5 ${
                  position === active ? 'bg-accent-soft' : 'hover:bg-surface-2'
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="shrink-0 rounded border border-line px-1.5 font-mono text-[0.65rem] tracking-wide text-fg-subtle uppercase">
                    {result.kind}
                  </span>
                  <span className="truncate font-medium text-fg">
                    <Highlighted text={result.title} query={query} />
                    {result.section && (
                      <span className="text-fg-muted">
                        {' '}
                        › <Highlighted text={result.section} query={query} />
                      </span>
                    )}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                  <Highlighted text={result.snippet} query={query} />
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-center gap-4 border-t border-line px-4 py-2.5 font-mono text-[0.7rem] text-fg-subtle sm:flex">
          <span>↑ ↓ to move</span>
          <span>Enter to open</span>
          <span>Esc to close</span>
          <span className="ml-auto">{index ? `${index.length} sections indexed` : ''}</span>
        </div>
      </div>
    </div>
  );
}
