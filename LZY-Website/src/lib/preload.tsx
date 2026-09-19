/**
 * Pages whose code can be loaded before React renders them.
 *
 * React.lazy always suspends the first time it renders, even if the code has
 * already arrived. When prerendering, a suspended page is written out hidden,
 * with a script to reveal it — so without JavaScript, or for a search engine
 * that does not run it, the page would look empty.
 *
 * Instead, each page's module is loaded through a promise that records its
 * own result (the `status` / `value` convention React's `use()` reads). The
 * prerender script and the browser both load the current page's code first,
 * so the first render never suspends, the HTML is complete, and hydration has
 * nothing to wait for. Later navigations suspend as usual.
 */
import { use, type ComponentType } from 'react';

type Tracked<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: unknown;
};

/** Mark a promise with its outcome, so `use()` can read it without waiting. */
export function track<T>(promise: Promise<T>): Promise<T> {
  const tracked = promise as Tracked<T>;
  if (!tracked.status) {
    tracked.status = 'pending';
    tracked.then(
      (value) => {
        tracked.status = 'fulfilled';
        tracked.value = value;
      },
      (reason: unknown) => {
        tracked.status = 'rejected';
        tracked.reason = reason;
      },
    );
  }
  return tracked;
}

export interface PreloadablePage<P extends object> {
  (props: P): React.ReactElement;
  preload: () => Promise<ComponentType<P>>;
}

export function preloadable<P extends object = Record<string, never>>(
  loader: () => Promise<{ default: ComponentType<P> }>,
): PreloadablePage<P> {
  let promise: Promise<ComponentType<P>> | null = null;
  const preload = () => (promise ??= track(loader().then((module) => module.default)));
  const Page = (props: P) => {
    const Component = use(preload());
    return <Component {...props} />;
  };
  Page.preload = preload;
  return Page;
}
