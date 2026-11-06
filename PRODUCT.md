# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: static HTML/CSS (one self-contained page or a small static site, no build step). Chosen because the content is reference material that changes when the dictionary changes, it must open anywhere (laptop, an HPC session's browser, a shared link) without a server, and it can be published as a claude.ai artifact or on GitHub Pages unchanged.

## Users

Primary: researchers who run and interpret ancient environmental DNA pipelines day to day on an HPC cluster. They need to look up what a parameter, flag or output column means, what its default is, and how it relates to the same idea in another workflow, usually mid-analysis while reading a results table or writing a config.

Other audiences (course students, the wider aeDNA community) are not confirmed targets.

## Product Purpose

A reference for the parameters used across common aeDNA workflows, organised per workflow, that makes each parameter easy to interpret by showing it on the things it acts on: reads, damaged read ends, k-mers, genomes, coverage, diagnostic sites, phylogenies. Success: a lab member can find a parameter, understand what changing it does, and explore its effect without opening the source code. The guide never recommends a threshold.

## Positioning

Built from an aeDNA dictionary (one row per parameter per tool), so it explains publicly released workflows (Holi, pathopipe) whose parameters have little documentation of their own, and it lines up shared concepts across tools (e.g. the metaDMG damage model used by both Holi and pathopipe).

## Operating Context

- Source of truth: a private aeDNA dictionary database in Notion. Fields per row: Symbol, Full name, Kind (model param, CLI flag, config key, output column, internal var), Definition, Default/range, Units/type, Aliases, Workflow (relation to wiki pipeline pages), Related, See also, Source.
- Workflows currently covered: Holi (miwipe/Holi), pathopipe (martinsikora/pathopipe), quicksand + kallisto, Unicorn (GeoGenetics/unicorn: alnfilt, refstats, taxstats), pathphynder, soibean. Only publicly released tools are covered. Stages they span: k-mer screen (KrakenUniq), mapping (bowtie2), taxon assignment (LCA, EM), authentication (metaDMG damage, Unicorn coverage), lineage/source placement on mtDNA phylogenies.
- Used alongside: pipeline output tables (metaDMG aggregate, Unicorn refstats/taxstats, Butteracid merges), Snakemake/YAML configs and Slurm jobs on HPC.

## Capabilities and Constraints

- Content is organised per workflow, with shared concepts (damage model) shown once and cross-referenced.
- Each parameter shows symbol, kind, plain-language meaning, default/range and units. No recommended filtering thresholds are shown; plates let the user explore.
- Content must stay traceable to the dictionary; when the dictionary changes, the reference is updated from it, not edited independently.
- Terminology is kept as the tools spell it, including quirks (`breath_cov`, `exp_breath`, `breath_ratio` are spelled "breath" in Unicorn output).
- Content comes from a snapshot file (`data.js`) exported from the dictionary and shipped with the page; the snapshot date is shown on the page.
- Search over symbol, alias and full name is the front door; a search hit opens the parameter's account and lights its field mark.
- Open: how the snapshot is exported (one-off export vs a script reading Notion); whether more workflows are added.

## Evidence on Hand

- The aeDNA dictionary rows (92 in the public snapshot of 2026-11-04).
- No real sample data, plots or results are part of the product yet. Figures so far are illustrative and must be labelled as such; do not present invented read counts, damage curves or posteriors as real results.
- Flagged in the source and to keep flagged: the `breath_ratio` interpretation is "to verify against data"; phynder `-B` is "not described in docs".

## Product Principles

1. The dictionary is the source of truth; the reference never states a default or threshold the dictionary does not.
2. Show the parameter on the data it acts on: a read, a k-mer, a coverage track, a tree, before explaining it in words.
3. No recommended thresholds: show what a value does and let the user decide.
4. Per workflow, with shared concepts defined once and linked rather than repeated.
5. Mark uncertainty and illustration explicitly; never smooth over an unverified interpretation.
