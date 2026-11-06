---
name: aeDNA Field Guide
description: Parameters of the lab's aeDNA workflows, each drawn on a live plate beside its account.
colors:
  ground: "#f2f4ef"
  paper: "#fcfdfb"
  ink: "#18201b"
  muted: "#4f5852"
  rule: "#d3d8d0"
  rule-strong: "#98a29a"
  read: "#8aa5b8"
  read-ink: "#31536b"
  damage: "#c2421b"
  pass: "#2a6649"
  fail: "#a3352f"
  hl: "#f0d35a"
  hl-soft: "#f7e9a8"
  ch-shared: "#2f3833"
  ch-holi: "#2a6649"
  ch-patho: "#6a3a7c"
  ochre: "#855a0c"
  ch-phynder: "#2a5986"
  ch-soibean: "#96322f"
  ch-quick: "#1d6670"
  ch-unicorn: "#5a5f14"
  on-ch: "#fcfdfb"
  ground-dark: "#111512"
  paper-dark: "#181d1a"
  ink-dark: "#e3e8e2"
  muted-dark: "#a4aea6"
  rule-dark: "#2d3530"
  rule-strong-dark: "#56615a"
  read-dark: "#5f7f96"
  read-ink-dark: "#a6c2d6"
  damage-dark: "#f06d43"
  pass-dark: "#6dbf95"
  fail-dark: "#f2867d"
  hl-dark: "#b8982c"
  hl-soft-dark: "#3d3820"
  ch-shared-dark: "#46514a"
  ch-holi-dark: "#2a6649"
  ch-patho-dark: "#7b4a8e"
  ochre-dark: "#855a0c"
  ch-phynder-dark: "#33679a"
  ch-soibean-dark: "#a63b37"
  ch-quick-dark: "#1d6670"
  ch-unicorn-dark: "#5a5f14"
  on-ch-dark: "#f7f9f6"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "clamp(34px, 4.4vw, 52px)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.015em"
    fontVariation: "\"wdth\" 72"
  headline:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "32px"
    fontWeight: 750
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 82"
  masthead:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontVariation: "\"wdth\" 78"
  title:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "14px"
    fontWeight: 650
    lineHeight: 1.1
    letterSpacing: "0.01em"
    fontVariation: "\"wdth\" 85"
  body:
    fontFamily: "Source Serif 4, Iowan Old Style, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.6
  body-lead:
    fontFamily: "Source Serif 4, Iowan Old Style, Georgia, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  caption:
    fontFamily: "Source Serif 4, Iowan Old Style, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.07em"
  ui:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.3
  symbol:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "16px"
    fontWeight: 650
    lineHeight: 1.3
  value:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "\"tnum\""
  plate-text:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
  plate-glyph:
    fontFamily: "Archivo, Arial Narrow, Helvetica Neue, sans-serif"
    fontSize: "30px"
    fontWeight: 750
    fontVariation: "\"wdth\" 85"
rounded:
  focus: "2px"
  sm: "4px"
  inset: "5px"
  md: "6px"
  lg: "8px"
  pill: "999px"
  dot: "50%"
spacing:
  hair: "2px"
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "28px"
  2xl: "32px"
  section: "72px"
components:
  thumb-tab:
    backgroundColor: "{colors.ch-holi}"
    textColor: "{colors.on-ch}"
    typography: "{typography.title}"
    rounded: "6px 6px 0 0"
    padding: "8px 14px 7px"
  thumb-tab-checklist:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "6px 6px 0 0"
    padding: "8px 14px 7px"
  chapter-band:
    backgroundColor: "{colors.ch-shared}"
    textColor: "{colors.on-ch}"
    typography: "{typography.display}"
    rounded: "4px 4px 0 0"
    padding: "28px 32px 24px"
  plate:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "18px 18px 14px"
  field-mark-dot:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.dot}"
    size: "24px"
  readout-dot:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.dot}"
    size: "20px"
  field-mark-lit:
    backgroundColor: "{colors.hl-soft}"
    rounded: "{rounded.sm}"
    padding: "16px 10px 16px 8px"
  search-field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  search-results:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "6px"
  search-result-selected:
    backgroundColor: "{colors.hl-soft}"
    rounded: "{rounded.inset}"
    padding: "9px 10px"
  wf-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 8px 4px 6px"
  filter-pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 11px"
  filter-pill-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
  reset-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
  reset-button-hover:
    textColor: "{colors.ink}"
  search-clear:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.sm}"
    size: "28px"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ground}"
    rounded: "{rounded.sm}"
    padding: "10px 14px"
---

# Design System: aeDNA Field Guide

## Overview

**Creative North Star: "The Field Guide"**

The page behaves like a printed naturalist's guide adapted for a screen. Each concept is a species account: a live plate on the left, the written account on the right at reading measure, with every parameter a numbered field mark that appears both on the plate and in the list. Chapters are workflows, reached through flat, family-coloured thumb tabs that sit along the masthead like the cut edge of a book. A checklist at the back indexes every entry as a table.

The world is cool white and ink, quiet enough that the plates carry the colour. Plates are pure paper panels drawn in a strict vocabulary: reads in slate blue, damaged bases and thresholds in vermilion, numbered black dots on hairline leaders. Type is split by job, not by decoration: condensed Archivo names things, Source Serif 4 explains them, JetBrains Mono is reserved for symbols and values a user will type or compare. Density is reference density: generous reading measure, tight labels, everything one scroll from the thing it describes.

Motion is one gesture: a 280ms ease-out highlight pulse on a field mark when a search hit, deep link, or list hover points at it. Plates redraw on slider input without animation, so the reader sees the knob's effect, not a transition.

**Key Characteristics:**
- Plate left (about 55%), account right; stacks to plate-over-account below 1080px.
- Flat chapter colour on tabs, chapter bands, and chip dots only; never on plates or body text.
- Numbered field-mark dots tie the plate, the list, and the readouts together.
- Highlight yellow is the only state colour for "this is the one you asked for".
- Every plate is labelled synthetic in its caption; plate captions lead with "Plate n".
- Light and dark themes share every role; dark is a full remap, not an inversion.

## Colors

A cool, near-neutral paper world in which the only saturated colours belong to the data (reads, damage, pass/fail) and to the six chapter families.

### Primary
- **Field Ink** (`ink`): text, field-mark dots, plate curves and branches, slider and checkbox accent, pressed filter pills, focus outline. The guide's single structural colour.
- **Damage Vermilion** (`damage`): damaged bases on reads, threshold lines on plates (dashed 4 3), the "Threshold" fact label, unverified-interpretation flags, and the text caret. Vermilion means "this is where a call breaks".

### Secondary
- **Read Slate** (`read`): the fill of every read, bar, and undamaged base on a plate.
- **Read Ink** (`read-ink`): darker slate for coverage bands, covered stretches of reference, and the second source in mixture plates.
- **Verdict Green** (`pass`) and **Verdict Red** (`fail`): readout values and plate glyphs that pass or fail the current threshold; dropped tree paths in `fail`, dashed.

### Tertiary
- **Mark Yellow** (`hl`): the field-mark ring that pulses and stays lit, text selection, the 3px search focus halo (55% mix), the darker plate zone.
- **Lit Wash** (`hl-soft`): lit list entries (70% mix), lit readouts, selected search result, the found row in the checklist, the lighter plate zone.
- **Chapter families** (plus Ochre, `ochre`, a plate category accent): Shared Slate (`ch-shared`), Holi Green (`ch-holi`), pathopipe Plum (`ch-patho`), pathphynder Blue (`ch-phynder`), soibean Brick (`ch-soibean`), quicksand + kallisto Teal (`ch-quick`), Unicorn Olive (`ch-unicorn`), each carrying `on-ch` text. Used on thumb tabs, chapter bands, the 9px dot in workflow chips and checklist filters, and, as data, where a plate must distinguish categories (pathphynder blue for the walked path).

### Neutral
- **Ground** (`ground`): page background, masthead, chapter body.
- **Paper** (`paper`): plate panels, search field and results, chips, checklist table. The plate column itself is a 55% paper / ground mix.
- **Muted** (`muted`): secondary text, plate axis labels, captions, kind labels.
- **Rule** (`rule`): hairlines between accounts, list entries, plate captions, plate gridlines.
- **Rule Strong** (`rule-strong`): plate axes, input borders, unnumbered (hollow) mark rings, link underlines at rest.

Dark theme values are the `-dark` keys; they apply under `prefers-color-scheme: dark` unless `data-theme="light"`, and under `data-theme="dark"`.

### Named Rules
**The Reads and Damage Rule.** On a plate, reads are slate (`read`) and damage is vermilion (`damage`). No other pair of colours ever stands for sequence and its damage.

**The Vermilion Means a Line Rule.** Vermilion is spent only on damage, thresholds, and unverified flags. Never use it for decoration, links, or headings.

**The Family Colour Stays Flat Rule.** Chapter colours are flat fills on tabs, bands, and 9px dots. They do not tint plates, account text, or backgrounds inside a chapter.

## Typography

**Display Font:** Archivo (variable width; falls back to Arial Narrow, Helvetica Neue)
**Body Font:** Source Serif 4 (falls back to Iowan Old Style, Georgia)
**Label/Mono Font:** JetBrains Mono (falls back to ui-monospace, SFMono-Regular, Menlo), ligatures off

**Character:** Condensed grotesque for names and chrome against a sturdy text serif for explanation; the mono is a data face, not a texture. All three are self-hosted variable fonts with Greek subsets for symbols such as ε, π, θ.

### Hierarchy
- **Display** (800, clamp(34px, 4.4vw, 52px), 0.95, width 72%): chapter titles on the chapter band and the checklist head.
- **Headline** (750, 32px, 1.05, width 82%; 28px under 760px): account names.
- **Masthead** (800, 26px, 1, width 78%): the guide title only.
- **Title** (650, 14px, 1.1, width 85%): thumb tabs; counts in mono 500 12px at full `on-ch`, no opacity.
- **Body** (400, 17px, 1.6): definitions and chapter descriptions, capped at 62 to 66ch.
- **Body lead** (400, 18px, 1.55, max 64ch): the one-line identification under an account name.
- **Caption** (400, 14px, 1.45, muted): plate captions, led by "Plate n" in Archivo 750 12px, 0.08em, uppercase.
- **Label** (600, 11.5px, 0.07em, uppercase, muted): the kind of an entry and fact terms (Threshold, Default / range, Units, Also written, Reported by); checklist column heads at 650 12px.
- **UI** (600, 13px): control labels, buttons, filter pills, readout terms (12px).
- **Symbol** (mono 650, 16px): the parameter symbol heading each field mark; 14px in search results and the checklist.
- **Value** (mono 600, 15px, tabular figures): readout values, slider outputs (13px), fact values (14px).
- **Plate text** (Archivo 12.5px, muted; `ink` 600 for labels; mono 12px for symbols): all text inside a plate SVG. Text that states a result takes `pass` or `damage` fill; an inactive option is struck through in `muted`, never faded with opacity.
- **Plate glyph** (750, 30px, width 85%, `ink`): the one categorical answer a plate gives (see Verdict glyph under Components, Plate).

### Named Rules
**The Mono Is for Things You Type Rule.** JetBrains Mono sets symbols, flags, column names, defaults, thresholds, and computed values. It never sets prose, headings, or labels.

**The Struck, Not Faded Rule.** Inside a plate, text for an option that is off is drawn in `muted` with a line-through so it stays legible at full contrast; opacity fades are for shapes only.

**The Spelled-as-Shipped Rule.** Symbols are set exactly as the tool spells them, quirks included, with `overflow-wrap: anywhere` rather than hyphenation or truncation.

## Layout

A single 1320px column (`wrap`) with safe-area-aware 16px minimum gutters. The masthead is sticky: a three-part row (title and count left, search centre-right up to 520px, snapshot date right) over the thumb-tab strip, which scrolls horizontally without a scrollbar. Anchors scroll with `scroll-padding-top` of masthead height plus 24px.

Each chapter is a coloured band (28/32/24px padding) over a ruled body. Inside, accounts are spreads on a 1.12fr / 1fr grid: plate column with 28px padding and a hairline right edge, text column with 32px 36px 40px padding. The plate is sticky beside a long account on wide screens. Chapters are separated by 72px; `main` has 32px top, 96px bottom.

Field-mark entries use a 30px number column and 14px gap, 16px vertical padding, separated by hairlines. Plate controls auto-fit at 210px minimum, readouts at 160px.

Breakpoints: at 1080px spreads stack (plate on top, static, 18px padding). At 760px the search moves to its own masthead row, the snapshot moves into the count line, the "/" hint hides, chapter heads go single-column at 20px padding, plates keep a 520px minimum SVG width inside a horizontally scrolling wrapper, and the checklist table becomes stacked rows. The wrapper fades whichever edge still has content beyond it (the last 8% on that side) and scrolls a focused or pulsed mark into view with 28px clearance. The fade is a mask (its `#000` stops are mask alpha, not a paint colour).

A visually hidden skip link ("Skip to the guide") is the first focus stop and jumps to `main`.

## Elevation & Depth

Flat, ruled paper. Depth comes from the ground / paper / plate-column tonal steps and 1px hairlines, not shadow. The thumb tabs carry the only physical cue: they sit 3px low and rise to flush on hover or when current.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 12px 32px -12px rgb(0 0 0 / 0.28)`): the search results list, the only element that floats over content.
- **Focus halo** (`box-shadow: 0 0 0 3px` of `hl` at 55%): the search field when focused, with its border turning `ink`.

### Named Rules
**The One Floating Thing Rule.** Only the search results popover casts a shadow. Plates, bands, chips, and tables stay flat on hairlines.

## Shapes

Small, near-square corners: 4px on plates, chapter band tops, controls, list highlights, the clear button, and the skip link; 6px on tab tops and the search field; 8px on the results popover, with 5px on the rows inset inside it so the corners nest; 2px on the global focus outline. Pills (999px) are reserved for workflow chips and checklist filters. Circles are reserved for field-mark dots (24px in the list, 20px in readouts, 10.5px radius on the plate with a 2.6px foot dot at the end of a hairline leader) and the 9px family dots. Hairlines are 1px solid; the readouts divider is the one dashed rule.

## Components

### Thumb Tabs
Flat family-coloured tabs, the guide's chapter navigation.
- **Shape:** top corners 6px, square bottoms, 3px gaps, sitting on the masthead's bottom rule.
- **Colour:** chapter family fill with `on-ch` text; the Checklist tab is paper with a `rule-strong` border and no bottom edge.
- **States:** rest is translated down 3px; hover and `aria-current` lift to 0 over 160ms `cubic-bezier(.2,.7,.2,1)`. Reduced motion removes the transition.

### Chapter Band
The chapter opener: display title, one-paragraph description and right-aligned meta both in plain `on-ch` (no colour mix, so every family clears 4.5:1 in both themes). The meta carries account and entry counts and links to the workflow's wiki pages. Fill is the chapter colour; the body below has a hairline border on ground. The checklist head is the same shape in paper with muted text.

### Account Spread
Plate column and text column on one row, hairline between accounts. The text column holds the account name, the identification line, then the field-mark list.

### Field-Mark List
An ordered list in which each entry has a numbered ink dot, a head line (symbol in mono, full name in serif, kind label), the definition, and a fact row as a definition list. The Threshold fact comes first, its term in vermilion and value in weight 600. Entries not drawn on the plate get a hollow `rule-strong` ring instead of a number. Unverified interpretations carry a vermilion line with an inline SVG warning triangle. A source note (Archivo 500 13.5px, muted) sits under the facts when a value was updated ahead of the dictionary or needs a provenance remark. Cross-workflow entries end with "Reported by" and workflow chips.
- **States:** lit (hover/focus, or its plate mark lit) uses a 70% `hl-soft` wash, fading over 280ms; found (search or deep link) uses full `hl-soft` for 2.6s.

### Plate
A paper figure with 18px padding, 14px internal gap: SVG figure, controls, reset button, readouts, verdict, caption.
- **SVG vocabulary:** reads `read`; damage `damage`; axes `rule-strong`; gridlines `rule`; model curves `ink` 2.25px round-joined; reference dashes `muted` 5 4; threshold lines `damage` 1.5px dashed 4 3; pass/fail fills; faded shapes at 28% or 55% opacity; struck-through `muted` text for an inactive option; result text in `pass` or `damage`; a paper-filled 2px `ink` ring for a previous position; tree branches `ink` 2.5px; walked path `ch-phynder` 5px; dropped path `fail` dashed 6 4; transversions filled, transitions as paper-filled rings, conflicts in vermilion.
- **Field marks:** an `ink` dot (r 10.5) with a white numeral in Archivo 700 11px, joined to the feature by a 1px `ink` leader ending in a 2.6px dot when farther than 13px. A transparent 28px circle under each mark is its hit area. A `hl` ring behind it shows when lit and pulses once on arrival (a single 280ms ease-out, `cubic-bezier(.16,1,.3,1)`, scale 1 to 2.4, fading); under reduced motion the ring simply stays lit. The plate SVG is a labelled group with one tab stop: marks use a roving tabindex, arrow keys and Home/End move between them, Enter or Space opens the entry. Focus adds a 3px `hl` stroke to the dot.
- **Controls:** labelled range sliders (`ink` accent) with a mono output right-aligned on the label line; checkboxes and selects in the same grid. A quiet bordered "Reset to defaults" button.
- **Readouts:** a dashed-rule-topped definition list; each readout carries the matching field-mark dot, an Archivo term, and a mono value coloured pass or fail where it decides a call, with small muted qualifiers such as "illustrative".
- **Verdict:** one serif sentence, its decisive phrase in weight 650. A visually hidden polite live region repeats it once, 700ms after the controls settle.
- **Verdict glyph:** a single 30px Archivo 750 (85% width) figure inside a plate for a categorical result that is the plate's answer (the quicksand Ancientness flag, a consensus base). One per plate at most.
- **Caption:** hairline-topped, "Plate n" label then a muted sentence that states the data are synthetic.

### Search
- **Field:** 44px paper box, `rule-strong` border, 6px radius, magnifier SVG, serif 16px input, mono "/" key hint. A 28px clear button (inline SVG cross, `muted` stroke turning `ink` on hover) appears only when there is a query.
- **Focus:** border to `ink` plus the yellow focus halo.
- **Results:** popover list; each row is symbol (mono), name (serif, muted, truncated), workflow chips. Selected row in `hl-soft`.

### Chips
- **Workflow chip:** paper pill with a `rule` border, Archivo 600 12.5px, a 9px dot in the family colour.
- **Checklist filter:** same pill with a `rule-strong` border; pressed state is `ink` fill with `ground` text.

### Skip Link
An `ink` tab with `ground` text (Archivo 650 14px, 4px radius, 10px 14px padding) parked above the viewport; it drops into place on focus.

### Checklist
A paper table: uppercase label column heads on a `rule-strong` rule, sticky; symbol and range cells in mono, kind in label style, a "Plate n · account" link per row. Found rows flash `hl-soft`. Under 760px rows stack into single-column blocks.

## Do's and Don'ts

### Do:
- **Do** draw every new parameter on a plate before explaining it, with a numbered `ink` field mark that matches its list entry.
- **Do** keep reads `read`, damage and thresholds `damage`, and verdicts `pass` / `fail`.
- **Do** caption every plate "Plate n" and say in the caption that its data are synthetic or illustrative.
- **Do** put the Threshold fact first in an entry's fact row, term in vermilion.
- **Do** use `hl` / `hl-soft` for every "you are here" state: lit marks, found entries, selected results, focus halo.
- **Do** give every new chapter a family colour token with a light and a dark value and an `on-ch` contrast check (4.5:1 or better; darken the dark value rather than mixing the text).
- **Do** keep one tab stop per plate, with arrow keys moving between its marks and a 28px hit area under each.

### Don't:
- **Don't** use JetBrains Mono for prose, headings, or labels.
- **Don't** add shadows to plates, chapter bands, or chips; only the search popover floats.
- **Don't** tint plates or account text with the chapter colour.
- **Don't** animate plate redraws; the only motion is the 280ms mark pulse, the tab lift, and the list wash.
- **Don't** use vermilion for anything but damage, thresholds, and unverified flags.
- **Don't** fade plate text with opacity to mark an option off; strike it through in `muted`.
