# entzun.ink

The website for [Entzun](https://entzun.ink): the home page, the privacy policy and the support page with the FAQ. Static HTML and CSS, no build step, deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## Layout

| Path | What |
|---|---|
| `index.html` | Home page |
| `privacy.html` | Privacy policy. Keep in step with `App/Entzun/PrivacyPolicy.md` in the app repo: the app shows that file under About. |
| `support.html` | Support, FAQ and acknowledgements |
| `404.html` | Served by Pages for unknown paths |
| `assets/site.css` | All styles. The colour, type, spacing and radius values are the app's design tokens (`docs/design/tokens.json` in the app repo), in Paper (light) and Night (dark) via `prefers-color-scheme`. |
| `assets/site.js` | The spacing sliders in the accessibility section. Nothing else runs script. |
| `assets/fonts/` | Newsreader, Atkinson Hyperlegible Next, Lexend, Luciole and OpenDyslexic, self-hosted, with their licence files beside them. Copied from `App/Entzun/Fonts` in the app repo. |
| `assets/screens/` | Rendered screens from `docs/design/screens` in the app repo. |
| `assets/logo/` | The Entzun mark. `entzun-logo.svg` is the editable master; the flattened marks, the App Store icon, and the lockups are derived from it, and its `README.md` holds the rules and the prompt for rebuilding everything when the mark changes. |
| `assets/*.png` | `favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, and `social-card.png`, rendered from `assets/logo/` with headless Chromium. Re-render them rather than editing them. |
| `CNAME` | The custom domain, so Pages keeps it across deploys. |

## Going live

The repository is `ggalmazor/entzun-web`, and the site is set up. For the record, the pieces are:

1. Push to `main`. The workflow publishes the repository root as the site.
2. In the repository settings, under Pages, the source is **GitHub Actions** and the custom domain is `entzun.ink`. Workflow deploys ignore the `CNAME` file, so the domain lives in that setting; the file is kept only as a note.
3. At DNSimple, `entzun.ink` has `A` records for `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, the matching `AAAA` records for `2606:50c0:8000::153` to `2606:50c0:8003::153`, and a `CNAME` from `www` to `ggalmazor.github.io`.
4. **Enforce HTTPS** is ticked in the Pages settings once GitHub has issued the certificate.

## When the App Store link exists

Search the three pages for `coming soon` and `aria-disabled`. Each greyed-out pill is a `<span>`; replace it with an `<a class="pill …" href="https://apps.apple.com/app/id…">` as the comments in `index.html` show, and change the caption under the hero button. Apple's own App Store badge can go in the hero in place of the plain pill; it is downloadable from Apple's marketing resources and comes with its own rules on size and clearance.

## Editing

Every page shares the header and footer by copy, since there is no build step. Change them in all three files. Text lives in the HTML; the only styling in the pages is the odd inline width.
