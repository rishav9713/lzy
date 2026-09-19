import { useEffect, useRef } from 'react';

/**
 * Fade an element in the first time it scrolls into view.
 *
 * The attribute is set directly on the element rather than through React
 * state, so revealing never re-renders anything. Without JavaScript, or with
 * reduced motion, the element is simply visible (see effects.css).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!('IntersectionObserver' in window)) {
      element.dataset.visible = 'true';
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = 'true';
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const targets = element.hasAttribute('data-reveal')
      ? [element]
      : Array.from(element.querySelectorAll<HTMLElement>('[data-reveal]'));
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return ref;
}
