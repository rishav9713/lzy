import '@testing-library/jest-dom/vitest';

import { afterEach, vi } from 'vitest';

// Some test files run in Node (the build-time Markdown and content checks);
// everything below is only for the ones that run in a simulated browser.
if (typeof window !== 'undefined') {
  const { cleanup } = await import('@testing-library/react');

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.setAttribute('data-theme', 'dark');
  });

  // jsdom does not implement these browser features the site uses.
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', NoopObserver);

  if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }

  window.scrollTo = () => {};
  Element.prototype.scrollIntoView = () => {};

  // No test should reach the real GitHub API.
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(new Response(null, { status: 503 }))),
  );
}
