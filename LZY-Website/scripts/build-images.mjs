// Build the website's images from the official artwork in ../Logos.
//
//   npm run images
//
// The originals in Logos/ are the only source. This makes the sizes the
// website needs: WebP for pages, PNG and ICO for icons, and the 1200x630 card
// shown when a link to the site is shared. The output is committed, so a
// normal build does not need to run this; run it again when the artwork
// changes.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const logos = path.resolve(here, '../../Logos');
const assets = path.resolve(here, '../public/assets');
const publicDir = path.resolve(here, '../public');

const BACKGROUND = '#08080b';

async function out(folder, name, pipeline) {
  const directory = path.join(assets, folder);
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, name);
  const info = await pipeline.toFile(file);
  console.log(
    `${path.relative(publicDir, file)}  ${info.width}x${info.height}  ${info.size} bytes`,
  );
}

/** The artwork, with its transparent margin removed. */
function trimmed(file) {
  return sharp(path.join(logos, file)).trim({ threshold: 1 });
}

async function square(file, size) {
  const buffer = await trimmed(file).toBuffer();
  return sharp(buffer).resize(size, size, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });
}

/** A Windows .ico holding PNG images, which every current browser reads. */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, data } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

function escapeXml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function socialCard() {
  const width = 1200;
  const height = 630;
  const logo = await (await square('lzy-logo.png', 440)).png().toBuffer();
  const lines = [
    { text: 'The LZY programming language', y: 214, size: 30, weight: 500, fill: '#ff5a67' },
    { text: 'Complex logic.', y: 300, size: 74, weight: 700, fill: '#f4f4f7' },
    { text: 'Simple code.', y: 384, size: 74, weight: 700, fill: '#ff3347' },
    {
      text: 'Open source · Apache-2.0 · Python 3.9+',
      y: 456,
      size: 28,
      weight: 400,
      fill: '#b4b4c0',
    },
    { text: 'github.com/rishav9713/lzy', y: 520, size: 28, weight: 500, fill: '#e4e4ea' },
  ];
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <defs>
    <radialGradient id="glow" cx="26%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#ff1f3d" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#ff1f3d" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${BACKGROUND}"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <rect x="0" y="${height - 6}" width="${width}" height="6" fill="#e0142b"/>
  ${lines
    .map(
      (line) =>
        `<text x="560" y="${line.y}" font-family="Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="${line.size}" font-weight="${line.weight}" fill="${line.fill}">${escapeXml(line.text)}</text>`,
    )
    .join('\n  ')}
</svg>`;
  return sharp(Buffer.from(svg)).composite([{ input: logo, left: 70, top: 95 }]);
}

await out('logo', 'lzy-logo-512.webp', (await square('lzy-logo.png', 512)).webp({ quality: 86 }));
await out('logo', 'lzy-logo-256.webp', (await square('lzy-logo.png', 256)).webp({ quality: 86 }));
await out('logo', 'lzy-logo-96.webp', (await square('lzy-logo.png', 96)).webp({ quality: 90 }));
await out(
  'mascot',
  'lzy-mascot-512.webp',
  (await square('lzy-mascot.png', 512)).webp({ quality: 86 }),
);
await out(
  'mascot',
  'lzy-mascot-256.webp',
  (await square('lzy-mascot.png', 256)).webp({ quality: 86 }),
);
await out(
  'backgrounds',
  'lzy-banner-1600.webp',
  trimmed('lzy-banner.png').resize({ width: 1600 }).webp({ quality: 84 }),
);
await out(
  'backgrounds',
  'lzy-banner-800.webp',
  trimmed('lzy-banner.png').resize({ width: 800 }).webp({ quality: 84 }),
);

await out('icons', 'icon-32.png', (await square('lzy-logo.png', 32)).png());
await out(
  'icons',
  'icon-192.png',
  (await square('lzy-logo.png', 192)).png({ palette: true, quality: 90 }),
);
await out(
  'icons',
  'icon-512.png',
  (await square('lzy-logo.png', 512)).png({ palette: true, quality: 90 }),
);
// iOS draws a transparent icon on black anyway; say so explicitly, with a margin.
await out(
  'icons',
  'apple-touch-icon.png',
  sharp({ create: { width: 180, height: 180, channels: 4, background: BACKGROUND } })
    .composite([
      { input: await (await square('lzy-logo.png', 156)).png().toBuffer(), left: 12, top: 12 },
    ])
    .png({ palette: true, quality: 90 }),
);

const icoImages = [];
for (const size of [16, 32, 48]) {
  icoImages.push({ size, data: await (await square('lzy-logo.png', size)).png().toBuffer() });
}
await writeFile(path.join(publicDir, 'favicon.ico'), ico(icoImages));
console.log('favicon.ico  16, 32, 48');

await out('social', 'og-image.jpg', (await socialCard()).jpeg({ quality: 88, mozjpeg: true }));
