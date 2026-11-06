# aeDNA Field Guide

An interactive reference to the parameters, flags and output columns of public ancient environmental DNA (aeDNA) workflows. Each workflow is a chapter. Each parameter is a "species account" with a live plate that shows what the parameter acts on: reads, damaged read ends, k-mers, coverage, phylogenies.

- **Full guide:** `index.html`
- **Holi guide** (Holi, Unicorn and the metaDMG damage model): `holi.html`

Chapters cover [metaDMG-cpp](https://github.com/metaDMG-dev/metaDMG-cpp), [Holi](https://github.com/miwipe/Holi), [Unicorn](https://github.com/GeoGenetics/unicorn), [pathopipe](https://github.com/martinsikora/pathopipe), [quicksand](https://github.com/mpieva/quicksand) + [kallisto](https://github.com/pachterlab/kallisto), [pathPhynder](https://github.com/ruidlpm/pathPhynder) and [soibean (vgan)](https://github.com/grenaud/vgan).

All plate data is synthetic. The guide doesn't recommend filtering thresholds. Each plate lets you see what a value does, and the choice is yours.

## Run locally
The page is plain HTML, CSS and JavaScript, with no build step and no dependencies. Fonts load from `fonts/fonts.css`, which browsers block over `file://`, so serve the folder:

```bash
python3 -m http.server
```

Then open http://localhost:8000.

## Build
`tools/bundle.py` writes:
- self-contained single-file versions to `dist/` (`python3 tools/bundle.py`, plus `--scope holi`)
- the Holi page for GitHub Pages (`python3 tools/bundle.py --scope holi --pages`)

Run it again after you edit `index.html`, `app.js` or `data.js`.

## Data
`data.js` is a snapshot (2026-11-04) of a curated aeDNA parameter dictionary. Corrections are welcome as issues.

## Licence
Code: MIT (`LICENSE`). Text and plates: CC BY 4.0 (`LICENSE-CONTENT.md`). Fonts: SIL OFL 1.1 (`fonts/OFL.txt`).
