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
| `assets/site.js` | The spacing sliders in the accessibility section, and the narration in the reader frames. Nothing else runs script, and the page reads fine without it. |
| `assets/fonts/` | Newsreader, Atkinson Hyperlegible Next, Lexend, Luciole and OpenDyslexic, self-hosted, with their licence files beside them. Copied from `App/Entzun/Fonts` in the app repo. |
| `assets/screens/` | Rendered screens from `docs/design/screens` in the app repo, except `library-mac.png`, which is rendered from `design/library-mac.html`. |
| `design/` | `library-mac.html`, the Mac library artboard from the app repo with real covers in place of the placeholders: public-domain paintings from Standard Ebooks, cropped square in `design/covers/`, and the tinted Entzun mark on the two books without a cover. Render it with headless Chrome at 1280 by 800 and a device scale of 2, then reduce it to a 256-colour palette. |
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

There is no call to action on the home page until a link exists. The comment above the price line in the hero has the markup for both cases: `Pre-order on the App Store` for a pre-order URL, or `Try the beta on TestFlight` for a TestFlight link. Put the same link in the hero, under Price, and in the footer.

The header pill on every page reads "App Store · coming soon" and links to the price section; point it at the App Store once the listing exists. Apple's own App Store badge can go in the hero in place of the plain pill; it is downloadable from Apple's marketing resources and comes with its own rules on size and clearance.

The launch price, 19.99 until 1 January 2027, is in the hero line and in the Price section. Once it ends, take it out of both and leave 24.99.

The "From the beta" section carries the class `is-placeholder`, which hides it. Remove the class once the quotes in it are real.

## Editing

The iPhone reader in the hero and in "Tap a word" is not a video or a screenshot but live HTML: the `emu` markup in `index.html`, styled in `site.css` and driven by `site.js`. It is the reader artboard from the app repo (`docs/design/artboards/Reader.dc.html`), with sizes in artboard points scaled to the frame's width, so it follows Paper and Night like the rest of the page. The markup appears twice, once per frame; change both. Without script, or with Reduce Motion, it is a still of the narrating page.

Every page shares the header and footer by copy, since there is no build step. Change them in all three files. Text lives in the HTML; the only styling in the pages is the odd inline width.
