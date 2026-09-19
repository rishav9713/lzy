/**
 * Turn a heading into an anchor.
 *
 * This is the same rule as `slug()` in `tools/check_docs.py`, which the
 * repository's CI uses to validate every `file.md#anchor` link. Matching it
 * exactly means a link that passes CI also lands on the right heading here.
 */
export function slug(title: string): string {
  let text = title.trim().toLowerCase();
  text = text.replace(/[`*_~]/g, '');
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  text = text.replace(/[^\p{L}\p{N}\s-]/gu, '');
  return text.replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

/** Hands out unique anchors, adding -1, -2 ... to repeats, as GitHub does. */
export function createSlugger(): (title: string) => string {
  const seen = new Map<string, number>();
  return (title: string) => {
    const base = slug(title) || 'section';
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}
