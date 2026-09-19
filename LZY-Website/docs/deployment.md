# Deploying the website

The website is published by GitHub Actions to GitHub Pages. Once Pages is
turned on, every merge to `main` rebuilds and republishes it; nothing needs to
be done by hand.

## 1. Turn on GitHub Pages

This is done once, by a repository administrator.

1. Open the repository on GitHub and go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.

That is all. There is no branch to choose: the workflow uploads the built
site itself.

The same setting can be made from the command line:

```bash
gh api -X POST repos/rishav9713/lzy/pages -f build_type=workflow
```

## 2. How a change reaches the site

1. A pull request runs the **Website** workflow
   ([`.github/workflows/deploy-pages.yml`](../../.github/workflows/deploy-pages.yml)).
   It installs LZY, generates the site's data from the interpreter,
   type-checks, runs the tests, builds and prerenders every page, checks every
   link, and audits the packages that reach the browser. Nothing is
   published from a pull request.
2. When the pull request is merged into `main`, the same workflow runs again,
   uploads the built site, and a second job publishes it to Pages.
3. The site is live at **https://rishav9713.github.io/lzy/** a minute or two
   later. The workflow run shows the address in its summary.

The workflow can also be started by hand from the **Actions** tab (**Website
→ Run workflow**), for example after changing the Pages settings.

## 3. Updating the site

Change the content (see the [website README](../README.md#changing-content)),
open a pull request, and merge it. Because the site's data comes from the
interpreter, a change to LZY itself — a new built-in function, a new example,
a new release in `CHANGELOG.md` — reaches the site the next time it is built,
without editing the website.

## 4. Using a custom domain

The site is ready for one; nothing in the code assumes the `github.io`
address.

1. Buy the domain, and at your DNS provider add a `CNAME` record pointing a
   subdomain (for example `lzy.example.org`) at `rishav9713.github.io`. For an
   apex domain, use GitHub's `A` records instead — see
   [GitHub's guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
2. In **Settings → Pages → Custom domain**, enter the domain and save. Tick
   **Enforce HTTPS** once the certificate is issued.
3. Run the **Website** workflow again.

The workflow reads the site's address and base path from GitHub's Pages
settings, so after step 2 every canonical link, the sitemap and the social
preview card use the new domain, and the site moves from `/lzy/` to `/`.

With Actions deployment, GitHub keeps the domain in the repository settings,
so **no `CNAME` file is needed**. If the site is ever published from a branch
instead, add `LZY-Website/public/CNAME` containing just the domain name.

To build for a custom domain locally:

```bash
SITE_URL=https://lzy.example.org SITE_BASE=/ npm run build
```

## 5. If a deployment fails

- **The build job fails:** open the failed step. A broken link, a failing
  test, or an ` ```output ` block that no longer matches LZY all stop the
  deployment, on purpose — the site that is already live stays as it was.
- **`configure-pages` fails with "Not Found":** Pages is not turned on yet;
  see step 1.
- **The deploy job waits for approval:** the `github-pages` environment has a
  protection rule. Approve it under the workflow run, or relax the rule in
  **Settings → Environments**.

## What gets published

Only `LZY-Website/dist/`: static HTML, CSS, JavaScript, fonts and images.
There is no server, no database, no analytics and no secrets; the site's
only request to another service is for the star count from GitHub's public
API, and it works without it. See the [privacy page](../content/pages/privacy.md).
