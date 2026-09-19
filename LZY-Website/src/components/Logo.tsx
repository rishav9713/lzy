import { asset } from '@/data/site';
import { cx } from '@/lib/cx';

/** The official mark: the sleeping sloth in the hexagon. */
export function LogoMark({
  size = 36,
  className,
  priority = false,
  alt = 'LZY',
}: {
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const source =
    size <= 96 ? 'lzy-logo-96.webp' : size <= 256 ? 'lzy-logo-256.webp' : 'lzy-logo-512.webp';
  const srcSet =
    size <= 48
      ? `${asset('assets/logo/lzy-logo-96.webp')} 2x`
      : size <= 128
        ? `${asset('assets/logo/lzy-logo-256.webp')} 2x`
        : `${asset('assets/logo/lzy-logo-512.webp')} 2x`;
  return (
    <img
      src={asset(`assets/logo/${source}`)}
      srcSet={srcSet}
      width={size}
      height={size}
      alt={alt}
      className={cx('select-none', className)}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...(priority ? { fetchPriority: 'high' as const } : {})}
      draggable={false}
    />
  );
}

/** The mascot: the same sloth in sunglasses, for lighter moments. */
export function Mascot({ size = 200, className }: { size?: number; className?: string }) {
  return (
    <img
      src={asset(
        size <= 256 ? 'assets/mascot/lzy-mascot-256.webp' : 'assets/mascot/lzy-mascot-512.webp',
      )}
      srcSet={`${asset('assets/mascot/lzy-mascot-512.webp')} 2x`}
      width={size}
      height={size}
      alt="The LZY mascot: a sloth in sunglasses and a hoodie"
      className={cx('select-none', className)}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

/** The mark with the name beside it, for the navigation bar and footer. */
export function Wordmark({ className, size = 34 }: { className?: string; size?: number }) {
  return (
    <span className={cx('inline-flex items-center gap-2.5', className)}>
      <LogoMark size={size} alt="" priority />
      <span className="font-display text-xl font-bold tracking-wide text-fg">LZY</span>
    </span>
  );
}
