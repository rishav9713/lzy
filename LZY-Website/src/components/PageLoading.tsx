import { LogoMark } from './Logo';

/** Shown while a page's code is on its way. The sloth is, naturally, asleep. */
export function PageLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4" role="status">
      <LogoMark size={72} alt="" className="sleepy logo-glow" />
      <p className="font-mono text-sm text-fg-subtle">Loading…</p>
    </div>
  );
}
