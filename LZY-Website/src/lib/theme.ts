/**
 * Light and dark themes.
 *
 * The theme lives on <html data-theme>, set by a small script in index.html
 * before the page paints, so there is no flash of the wrong theme. The choice
 * is remembered in localStorage; with no choice made, the site follows the
 * operating system, and keeps following it if the system setting changes.
 */
import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'lzy-theme';
const listeners = new Set<() => void>();

function read(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const colour = theme === 'light' ? '#f6f6f8' : '#08080b';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colour);
  listeners.forEach((listener) => listener());
}

export function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function setTheme(theme: Theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing can refuse storage; the theme still changes for this visit.
  }
  apply(theme);
}

export function followSystemTheme(): () => void {
  const query = window.matchMedia?.('(prefers-color-scheme: light)');
  if (!query) return () => {};
  const onChange = () => {
    if (storedTheme() === null) apply(query.matches ? 'light' : 'dark');
  };
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The current theme. The server always assumes dark, the default. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => 'dark');
}
