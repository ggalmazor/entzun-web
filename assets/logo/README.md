# Logo assets

The Entzun mark, "the book that speaks". The master is `entzun-logo.svg` (Guille's editable source, grouped with transforms); everything else here is derived from it and from the Entzun Design System's Logo section, which is the source of truth for the rules.

| File | Use on the site |
| --- | --- |
| `entzun-mark.svg` | SVG favicon (`<link rel="icon" type="image/svg+xml">`), documents |
| `entzun-mark-night.svg` | Dark-ground placements outside the site (the site uses `currentColor` inline instead) |
| `entzun-mark-currentcolor.svg` | The source of the inline `<svg class="mark">` in every page's header and footer. If the mark changes, replace the inline copy in `index.html`, `privacy.html`, `support.html` and `404.html` with this file's contents (keep the `class="mark"` and `aria-hidden`). |
| `entzun-lockup.svg`, `entzun-lockup-night.svg` | Press kit, documents |
| `entzun-icon.svg`, `entzun-icon-1024.png`, `entzun-icon-paper.svg` | The App Store icon; the rendered source of `../apple-touch-icon.png` and `../icon-512.png` |

Rendered from these, in `assets/`: `favicon-16.png`, `favicon-32.png` (from `entzun-mark.svg`), `apple-touch-icon.png` at 180 and `icon-512.png` (from `entzun-icon.svg`), and `social-card.png` at 1200 × 630 for Open Graph.

Rules that matter on the web: the page strokes take the ink of the ground (the inline SVG uses `currentColor`, so `.brand { color: var(--ink) }` does it in both themes); the word is always `#C2570B`, never the Night amber; 16 px is the floor and the two small favicons are PNGs for that reason; clear space is a quarter of the mark's height.

## Prompt for Claude Code

For the next change to the mark, in the `entzun-web` repository:

> The Entzun mark has changed. The new master is `assets/logo/entzun-logo.svg`. Read `assets/logo/README.md` first, then:
>
> 1. Flatten the master's groups and transforms into plain path coordinates on the 160 × 160 box and write `entzun-mark.svg` (page strokes `#1C1B19`), `entzun-mark-night.svg` (`#E6E3DD`) and `entzun-mark-currentcolor.svg`, keeping `stroke-width="15"`, round caps and joins, and the ids `page`, `bubble`, `spine`, `lines`, `word`. The `word` path is always `stroke="#C2570B"`.
> 2. Rebuild `entzun-icon.svg` (cream `#F4ECD8` on `#1F3A4A`, 1024 square, the mark at 704 px centred), `entzun-icon-paper.svg`, and the lockups (mark at 56 px, name in Newsreader 500 at 48 px with -0.02em tracking, 12 px gap).
> 3. Replace the inline `<svg class="mark">` in `index.html`, `privacy.html`, `support.html` and `404.html` with the paths from `entzun-mark-currentcolor.svg`.
> 4. Re-render the rasters with headless Chromium (Playwright is fine): `favicon-16.png`, `favicon-32.png` from the mark; `apple-touch-icon.png` (180) and `icon-512.png` from the icon; `social-card.png` (1200 × 630, mark at 280 px on paper `#FAF8F4`, name in Newsreader 120, tagline in Atkinson 34, self-hosted fonts from `assets/fonts/`).
> 5. Open each page at 1280 and 390 wide in light and dark and check the header: mark 28 px, name 26 px, 10 px gap, vertically centred in the 72 px bar.
>
> List the files you changed. Do not touch the copy or the layout.
