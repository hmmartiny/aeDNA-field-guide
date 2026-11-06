# aeDNA Field Guide

A static, dependency-free reference to the parameters of ancient environmental DNA workflows.
Each workflow is a chapter. Each chapter has "species accounts": dictionary entries with a live SVG plate and numbered field marks.
The data is a snapshot of a private Notion dictionary.

Private notes (artifact links, personal working rules) are in `CLAUDE.local.md`, which is git-ignored.

## Files
- `index.html`: all CSS (tokens, light/dark, chapter colours `--ch-*`) and the markup shell.
- `data.js`: the `window.AEDNA` snapshot, with rows (symbol/key, def, wf[], …) and a workflows map. 92 rows, snapshot 2026-11-04. `source` is null here, and the Notion URL comes from `private.json`.
- `app.js`: `CHAPTERS`, `ACCOUNTS` (`{title, ident, items:[[key, drawn01]]}`), `REPOS` (GitHub links per chapter), `PLATES` (`{w,h,alt,caption,controls,init?,draw(ctx,v)→{readouts,verdict}}`) and the renderer. Every row in a scoped build must sit in an account.
- `tools/bundle.py`: inlines fonts, data and JS into one page for claude.ai artifacts (no doctype/head/body).
  - `python3 tools/bundle.py` → `dist/aedna-field-guide.html`
  - `python3 tools/bundle.py --scope holi` → `dist/holi-field-guide.html` (chapters holi, unicorn, shared; no Notion link)
  - `python3 tools/bundle.py --scope holi --pages` → `holi.html` in the repo root (the GitHub Pages copy of the Holi guide). Rebuild it after editing `index.html`.
  - Add `--private` to read `private.json` (git-ignored, `{"source": "<Notion URL>"}`) and write to `dist/private/` (git-ignored). Publish artifacts from these builds.
- `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`: the design system and product record for the impeccable skill.
- `fonts/`: self-hosted Archivo, Source Serif 4 and JetBrains Mono (OFL).

Local preview: run `python3 -m http.server` in the repo root, because file:// blocks fonts.css. Then open index.html.

## Public-repo rule
Only publicly released tools and methods go in the repo. Don't add unpublished tools, internal scripts, private URLs or real sample results. `CLAUDE.local.md` records what was removed.

## Repo setup
- The repo lives in OneDrive, which marks every file executable. `core.fileMode` is set to false, so git ignores those permission bits.
- Checks: use the built-in browser on `python3 -m http.server`. Playwright and axe-core are not installed.

## Chapters
The chapters are: shared (metaDMG), Holi, Unicorn, pathopipe, quicksand + kallisto, pathphynder and soibean.

## Content rules
- No recommended filtering thresholds anywhere, including A and Zfit. Let the user explore. There is no A cutoff slider and no Zfit verdict.
- metaDMG follows metaDMG-cpp 0.5.2. Filtering applies to the `_new` columns (Zfit_new, sigmaD_new). The `_old` columns are shown for comparison only.
- Unicorn 2.5.2: alnfilt ranks alignments by ANI, not by alignment score. It applies the ANI bounds first, and `--strictbounds` drops the whole read.
- The private full guide keeps "Open in Notion". The Holi guide and the public builds have no Notion link. Chapters link to GitHub repos, not Notion pages.
- Label synthetic plate data as synthetic.

## Open items
- On phones, plate labels at the right edge can still be clipped when a mark is revealed.
