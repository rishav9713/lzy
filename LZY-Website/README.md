# The LZY website

The source of the official LZY website, published at
**https://rishav9713.github.io/lzy/**.

It is a React and TypeScript site built with Vite and Tailwind CSS. Every
page is rendered to static HTML when the site is built, so it works without
JavaScript, loads fast, and is served by GitHub Pages with no server.

## The rule this site follows

**The website never states a fact about LZY that it could read from the
repository instead.** Three mechanisms enforce that:

1. **Generated data.** [`scripts/generate_data.py`](scripts/generate_data.py)
   imports the interpreter and records its keywords, built-in functions,
   command line, safety limits, error kinds, examples and test count. The
   CLI reference, the built-in tables and the numbers on the home page are
   drawn from that, not typed in.
2. **Repository documents.** Pages such as the specification, the learning
   course, the security policy and the changelog *are* the repository's own
   Markdown files, rendered at build time. See
   [`src/content/registry.ts`](src/content/registry.ts).
3. **Tested snippets.** Every ` ```lzy ` block in any Markdown file must
   parse, every ` ```lzy-broken ` block must fail with a helpful error, and
   every ` ```output ` block must be exactly what LZY prints. The repository's
   Python test suite checks all three, including for this site's content.

## Working on it

You need Node.js 22.12 or newer, and Python 3.9 or newer with LZY installed
from this repository (`python -m pip install -e ".[dev]"` at the root).

```bash
cd LZY-Website
npm install
npm run dev          # a local site at http://localhost:5173/lzy/
npm run build        # build and prerender every page into dist/
npm run preview      # serve dist/ the way GitHub Pages will
npm run lint         # type-check and check formatting
npm test             # the website's tests
npm run check:links  # after a build: every internal link, asset and anchor
```

`npm run dev`, `build`, `test` and `lint` all run
`scripts/generate_data.py` first, so the site always matches the interpreter
you have checked out.

## Changing content

| To change | Edit |
|---|---|
| A guide page | `content/docs/*.md` |
| Getting started, install, FAQ, troubleshooting | `content/pages/*.md` |
| The specification, course, security policy, changelog | the repository file itself (`SPEC.md`, `docs/learn/`, …) |
| The sidebar, top bar and footer | `src/content/navigation.ts` |
| Which document appears at which address | `src/content/registry.ts` |
| Use cases and home page text | `src/content/home.ts` |
| Programs shown on the home page | `content/showcase/` and `content/snippets/` |

When a page shows the output of a snippet, leave the ` ```output ` block
empty and record it from the real interpreter, after reading it:

```bash
python tools/record_doc_outputs.py --write
```

A Markdown document can embed generated data with a comment such as
`<!-- lzy:component cli-reference -->`; the available names are in
[`src/components/content/index.tsx`](src/components/content/index.tsx).

## How it is built

```text
generate_data.py ──▶ src/data/generated/*.json ─┐
repository .md ────▶ plugins/lzy-content.ts ────┼──▶ vite build ──▶ prerender.mjs ──▶ dist/
src/ (React) ───────────────────────────────────┘
```

- `plugins/` renders Markdown to HTML at build time. Raw HTML in a document is
  escaped, and a link to a file that does not exist fails the build.
- `scripts/prerender.mjs` writes one HTML file per page, `404.html`,
  `sitemap.xml`, `robots.txt`, and a Content-Security-Policy that allows only
  this site's own scripts.
- `scripts/check-links.mjs` checks every link, image and `#anchor` in the
  output.

## Images

The logo, mascot and banner on the site are made from the originals in
[`../Logos/`](../Logos/) by `npm run images`, which writes WebP versions,
favicons and the social preview card into `public/assets/`.

## Deployment

The [Website workflow](../.github/workflows/deploy-pages.yml) builds and checks
the site on every pull request, and publishes it on every push to `main`.
Setting up GitHub Pages, and using a custom domain, are covered in
[docs/deployment.md](docs/deployment.md).
