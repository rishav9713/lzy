import { useEffect } from 'react';

function typingInField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

/**
 * Open something from the keyboard: Ctrl+K or Cmd+K anywhere, or "/" when
 * the reader is not typing in a field.
 */
export function useSearchHotkey(open: () => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const modifier = event.metaKey || event.ctrlKey;
      if (modifier && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      } else if (event.key === '/' && !modifier && !event.altKey && !typingInField(event.target)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
}
