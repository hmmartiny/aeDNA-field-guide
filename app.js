(() => {
"use strict";
const D = window.AEDNA;
const NS = "http://www.w3.org/2000/svg";
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- data ---------- */
const SCOPE = window.AEDNA_SCOPE || null;
let rows = D.rows;
const K = r => r.key || r.symbol;
const bySym = new Map(rows.map(r => [K(r), r]));
const used = new Set();
rows.forEach(r => {
  let s = r.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let t = s, i = 2; while (used.has(t)) t = s + "-" + i++;
  used.add(t); r.slug = t;
});
const WF_TAB = { holi: "--ch-holi", patho: "--ch-patho", phynder: "--ch-phynder", soibean: "--ch-soibean", quick: "--ch-quick", unicorn: "--ch-unicorn" };

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "html") e.innerHTML = v; else if (k === "style") e.setAttribute("style", v); else e.setAttribute(k, v === true ? "" : v);
  }
  kids.flat().forEach(k => k != null && e.append(k));
  return e;
};
const S = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) if (v != null) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
};
const T = (p, x, y, s, cls, anchor) => { const t = S("text", { x, y, class: cls, "text-anchor": anchor }, p); t.textContent = s; return t; };
const line = (p, x1, y1, x2, y2, cls) => S("line", { x1, y1, x2, y2, class: cls }, p);
const rect = (p, x, y, w, ht, cls, extra) => S("rect", Object.assign({ x, y, width: Math.max(0, w), height: Math.max(0, ht), class: cls }, extra), p);
const arrow = (p, pts) => {
  S("polyline", { points: pts.map(q => q.join(",")).join(" "), class: "ax arrowline" }, p);
  const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1), L = 7;
  S("polygon", { points: `${x2},${y2} ${x2 - L * Math.cos(a - 0.45)},${y2 - L * Math.sin(a - 0.45)} ${x2 - L * Math.cos(a + 0.45)},${y2 - L * Math.sin(a + 0.45)}`, class: "arrowhead" }, p);
};
const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const f = (v, d = 2) => Number(v).toFixed(d);
const int = v => Math.round(v).toLocaleString("en-GB");
const ok = (cond, yes, no) => `<span class="${cond ? "v-pass" : "v-fail"}">${cond ? yes : no}</span>`;

/* ---------- chapters & accounts ---------- */
const CHAPTERS = [
  { id: "shared", name: "Shared damage model", short: "Shared", tab: "--ch-shared", wf: ["holi", "patho"],
    desc: "metaDMG fits the same damage model inside Holi and pathopipe, and both report the same columns, so they are described once here.",
    accounts: ["damage-model", "damage-significance"] },
  { id: "holi", name: "Holi", short: "Holi", tab: "--ch-holi", wf: ["holi"],
    desc: "Competitive mapping, a microbial/eukaryotic split, damage from metaDMG and coverage from Unicorn, merged by Butteracid.",
    accounts: ["holi-read-path", "coverage-evenness", "damage-curve-fit"] },
  { id: "unicorn", name: "Unicorn", short: "Unicorn", tab: "--ch-unicorn", wf: ["unicorn"],
    desc: "Alignment statistics and filtering for SAM/BAM files: alnfilt picks alignments per read, refstats and taxstats report coverage, identity and complexity per reference or taxon. Holi's coverage columns come from here.",
    accounts: ["alignment-filter", "reference-filters", "taxonomy-tags", "read-complexity", "depth-and-spread"] },
  { id: "pathopipe", name: "pathopipe", short: "pathopipe", tab: "--ch-patho", wf: ["patho"],
    desc: "Ancient pathogen screening: a KrakenUniq k-mer screen, bowtie2 mapping, EM across assemblies, then damage.",
    accounts: ["mapping-funnel", "kmer-damage", "evidence-tiers"] },
  { id: "quicksand", name: "quicksand + kallisto", short: "quicksand", tab: "--ch-quick", wf: ["quick"],
    desc: "Sediment mtDNA: quicksand classifies reads into families and authenticates them, and kallisto resolves species within a family.",
    accounts: ["family-classification", "family-filters", "ancientness-flag", "species-within-family"] },
  { id: "pathphynder", name: "pathphynder", short: "pathphynder", tab: "--ch-phynder", wf: ["phynder"],
    desc: "Places a sample on a reference tree by walking the path its alleles support.",
    accounts: ["tree-walk", "phynder-inputs"] },
  { id: "soibean", name: "soibean", short: "soibean", tab: "--ch-soibean", wf: ["soibean"],
    desc: "Models a sample as several sources, each placed on the mitochondrial pangenome tree with its own abundance.",
    accounts: ["source-mixture"] }
];

/* items: [symbol, drawn] — drawn items get numbered field marks */
const ACCOUNTS = {
  "damage-model": { title: "Damage model",
    ident: "Deamination turns C into T near the 5′ end of a read (and G into A near the 3′ end). metaDMG fits that excess with a geometric decay. The plate draws it as f(i) = c + A·(1−q)<sup>i−1</sup> at position i.",
    items: [["A", 1], ["q", 1], ["c", 1], ["fwf{i} / bwf{i}", 1], ["fwdx{i} / bwdx{i}", 1]] },
  "damage-significance": { title: "Damage significance",
    ident: "A says how much damage there is, Zfit how sure the fit is, and φ how noisy the alignments are. Since metaDMG-cpp 0.5.2, dfit writes two versions of sigmaD and Zfit: _new weighs every read position by its expected damage, _old uses position 1 only. Filter on the _new columns. The bootstrap columns appear only with --nbootstrap > 1.",
    items: [["Zfit", 1], ["sigmaD", 1], ["phi", 1], ["A_b, q_b, c_b, phi_b", 0], ["*_CI_l / *_CI_h", 0], ["llh", 0]] },
  "holi-read-path": { title: "Read path",
    ident: "Holi splits mapped reads into microbial and eukaryotic sets, measures damage with metaDMG and coverage with Unicorn, then merges both tables in Butteracid.",
    items: [["--lca-assignment", 1], ["RESULT_PATH / MICROB_OUT / EUK_OUT", 1], ["--storage-friendly", 1], ["total_n_reads_from_mD", 1], ["m_alnani", 1], [".x / .y suffix", 1]] },
  "coverage-evenness": { title: "Coverage evenness",
    ident: "The same read count can spread over a reference or pile into a few places. Unicorn's coverage columns tell the two apart.",
    items: [["breath_cov", 1], ["exp_breath", 1], ["breath_ratio", 1], ["tad80", 1], ["gini / n_gini", 1], ["entropy / n_entropy", 1]] },
  "damage-curve-fit": { title: "Damage curve fit",
    ident: "Butteracid checks whether the fitted curve actually describes the observed profile, using Lin's concordance between the two. Eukaryote taxa only.",
    items: [["rho_c", 1], ["C_b, l_shift, s_shift", 1]] },
  "mapping-funnel": { title: "Mapping funnel",
    ident: "pathopipe narrows a sample from k-mer hits to species-level read assignments in stages. Each stage has one knob.",
    items: [["kmers", 1], ["max_species_per_genus", 1], ["bt2_param", 1], ["mq", 1], ["min_pmax_for_em", 1], ["em_p", 1], ["screen_summary / screen_evidence", 0]] },
  "kmer-damage": { title: "k-mer damage",
    ident: "Before any mapping, the k-mer screen looks for damage directly: a deaminated base breaks every k-mer that covers it, so classification dips at the read ends.",
    items: [["damage_rate_5prime / damage_pvalue", 1], ["plateau_classified_rate", 1], ["damage_min_read_length / damage_max_read_length", 1]] },
  "evidence-tiers": { title: "Evidence tiers",
    ident: "The screen grades each taxon by how much evidence it could gather. Only full counts as a detection; the other two tiers are leads.",
    items: [["evidence tier", 1], ["evenness_min_reads", 1], ["evenness_index", 1], ["within_genus_relative_abundance", 1], ["fit_mode", 0], ["fit_granularity", 0]] },
  "tree-walk": { title: "Tree walk",
    ident: "pathphynder walks the tree from the root along the path the sample's alleles support, and abandons a path once its conflicts pass the tolerance.",
    items: [["-t", 1], ["-c", 1], ["-q", 1], ["-m", 1], ["-r", 0]] },
  "phynder-inputs": { title: "Inputs and steps",
    ident: "What pathphynder reads, what phynder must produce first, and the order the steps run in.",
    items: [["-i", 1], ["phynder -B", 1], ["-f", 1], ["-p", 1], ["-G", 1], ["-s", 1], ["-b / -l", 1], ["-o", 1], ["-x", 1]] },
  "source-mixture": { title: "Source mixture",
    ident: "soibean treats a sample as k sources, each sitting somewhere along a branch of the mitochondrial tree with its own share of the reads, and samples that model by MCMC.",
    items: [["k", 1], ["β", 1], ["θ", 1], ["ESS", 0]] }
};

/* ---------- quicksand + kallisto ---------- */
Object.assign(ACCOUNTS, {
  "family-classification": { title: "Family classification",
    ident: "quicksand bins reads into mammalian families with KrakenUniq, then maps each family's reads with an aDNA-tuned BWA. The k-mer size decides how many k-mers survive the damaged read ends.",
    items: [["k (quicksand)", 1], ["min read length (quicksand)", 1], ["BWA params (quicksand)", 0], ["quicksand-build --include", 0]] },
  "family-filters": { title: "Family filters",
    ident: "Three filters remove noise before a family is reported: a minimum bin size, a minimum share of the library's sequences, and an evenness check on breadth.",
    items: [["bin thresholds (quicksand)", 1], ["PSF", 1], ["PEB", 1]] },
  "ancientness-flag": { title: "Ancientness flag",
    ident: "quicksand calls a family ancient from the lower bound of a 95% binomial interval on terminal C→T at each read end, against a 9.5% threshold.",
    items: [["Ancientness", 1], ["--doublestranded", 1]] },
  "species-within-family": { title: "Species within a family",
    ident: "kallisto splits a family's reads across its reference mitogenomes by EM. How much the top pick takes tells you whether the call is a species or only a genus.",
    items: [["est_counts", 1], ["abundance threshold X", 1], ["--rerun --fixed", 0], ["-k (kallisto)", 0], ["--single -l -s", 0]] }
});

if (SCOPE) {
  const keep = SCOPE.chapters.map(id => CHAPTERS.find(c => c.id === id)).filter(Boolean);
  CHAPTERS.length = 0; CHAPTERS.push(...keep);
  CHAPTERS.forEach(c => Object.assign(c, (SCOPE.rename || {})[c.id] || {}));
}
/* ---------- Unicorn ---------- */
Object.assign(ACCOUNTS, {
  "alignment-filter": { title: "Alignment filter",
    ident: "alnfilt keeps a subset of each read's alignments. It first drops alignments outside the ANI bounds, then ranks the rest by ANI (not by alignment score) and applies the mode.",
    items: [["--mode (alnfilt)", 1], ["--pct (alnfilt)", 1], ["--minani / --maxani", 1], ["--strictbounds", 1], ["mean_alnani / stdev_alnani / median_alnani", 1]] },
  "reference-filters": { title: "Reference filters",
    ident: "refstats (per reference) and taxstats (per taxid) take the same filters. Alignment-level filters remove reads first; minimum reads and length then decide whether a reference is reported.",
    items: [["--maxdust", 1], ["--minreads (unicorn)", 1], ["--minreflen", 1], ["--minmani", 1], ["num_alns / num_reads", 1], ["--minalnas", 0]] },
  "taxonomy-tags": { title: "Taxonomy tags",
    ident: "With taxonomy files, refstats tags every read with two taxids: XT for the reference itself and XR for its ancestor at the chosen rank. taxstats can then summarise by XR straight from the BAM.",
    items: [["--rank / XT / XR", 1], ["num_accessions / total_length", 0]] },
  "read-complexity": { title: "Duplicity and complexity",
    ident: "Two read-level checks: how many of the reads' k-mers are unique (duplicity), and how repetitive the reads are (dust).",
    items: [["duplicity", 1], ["-k / --ksize (unicorn)", 1], ["mdust / stdev_dust", 1]] },
  "depth-and-spread": { title: "Depth and spread",
    ident: "The basic coverage columns. Breadth, Gini, entropy and tad80 come from the same pass and are drawn on Holi's Coverage evenness plate.",
    items: [["mean_cov / num_covbases", 1], ["evenness_cov", 1], ["site_density", 1]] }
});


/* source repositories per chapter (public GitHub only) */
const REPOS = {
  pathopipe: [["pathopipe", "https://github.com/martinsikora/pathopipe"], ["metaDMG-cpp", "https://github.com/metaDMG-dev/metaDMG-cpp"]],
  shared: [["metaDMG-cpp", "https://github.com/metaDMG-dev/metaDMG-cpp"]],
  holi: [["Holi", "https://github.com/miwipe/Holi"], ["metaDMG-cpp", "https://github.com/metaDMG-dev/metaDMG-cpp"], ["unicorn", "https://github.com/GeoGenetics/unicorn"]],
  quicksand: [["quicksand", "https://github.com/mpieva/quicksand"], ["kallisto", "https://github.com/pachterlab/kallisto"]],
  pathphynder: [["pathPhynder", "https://github.com/ruidlpm/pathPhynder"]],
  unicorn: [["unicorn", "https://github.com/GeoGenetics/unicorn"]],
  soibean: [["vgan (soibean)", "https://github.com/grenaud/vgan"]]
};
let plateNo = 0;
for (const ch of CHAPTERS) for (const id of ch.accounts) {
  const a = ACCOUNTS[id]; a.id = id; a.ch = ch; a.num = {}; let n = 0;
  a.items.forEach(([sym, drawn]) => {
    const r = bySym.get(sym); if (!r) throw new Error("Missing dictionary row: " + sym);
    r.acc = a; a.num[sym] = drawn ? ++n : null;
  });
  a.plateNo = ++plateNo;
}
if (SCOPE) rows = rows.filter(r => r.acc);

/* ---------- plates ---------- */
function marker(ctx, sym, fx, fy, mx, my) {
  const n = ctx.acc.num[sym]; if (!n) return;
  const g = S("g", { class: "mark", "data-sym": sym, tabindex: -1, role: "button", "aria-label": `Field mark ${n}: ${sym}. Arrow keys move between marks.` }, ctx.marks);
  S("circle", { cx: mx, cy: my, r: 14, class: "hit" }, g);
  if (Math.hypot(mx - fx, my - fy) > 13) { line(g, fx, fy, mx, my); S("circle", { cx: fx, cy: fy, r: 2.6, class: "dotc" }, g); }
  S("circle", { cx: mx, cy: my, r: 11, class: "ring" }, g);
  S("circle", { cx: mx, cy: my, r: 10.5, class: "dotc" }, g);
  T(g, mx, my, String(n));
}

const PLATES = {};

PLATES["damage-model"] = {
  w: 600, h: 384, alt: "Eight synthetic reads with damaged bases at both ends, above a bar chart of C to T frequency by position with the fitted decay curve.",
  caption: "Synthetic reads; damage drawn at the frequency the sliders set.",
  controls: [
    { id: "A", label: "<code>A</code> amplitude", min: 0, max: 0.4, step: 0.005, value: 0.25, d: 3 },
    { id: "q", label: "<code>q</code> decay", min: 0.05, max: 0.9, step: 0.01, value: 0.35, d: 2 },
    { id: "c", label: "<code>c</code> background", min: 0, max: 0.05, step: 0.001, value: 0.01, d: 3 }
  ],
  init() { const R = rng(7); this.U = Array.from({ length: 8 }, () => Array.from({ length: 30 }, R)); this.N = Array.from({ length: 15 }, () => R() * 2 - 1); this.span = Array.from({ length: 8 }, () => { const L = 21 + Math.floor(R() * 10); return [Math.floor(R() * (31 - L)), L]; }); },
  draw(ctx, v) {
    const g = ctx.svg, fq = i => v.c + v.A * Math.pow(1 - v.q, i);
    const x0 = 75, cell = 15; let dmg = 0;
    let total = 0;
    for (let r = 0; r < 8; r++) { const [st, L] = this.span[r]; for (let k = 0; k < L; k++) {
      const j = Math.min(k, L - 1 - k), hit = this.U[r][k] < fq(j); if (hit) dmg++; total++;
      rect(g, x0 + (st + k) * cell + 0.5, 14 + r * 17, cell - 1, 12, hit ? "dmg" : "read", { rx: 1.5 });
    } }
    T(g, x0 - 8, 24, "5′→3′", "lbl", "end"); T(g, x0 - 8, 145, "reads", null, "end");
    const py0 = 345, ph = 150, ym = 0.45, y = val => py0 - clamp(val, 0, ym) / ym * ph;
    [0.1, 0.2, 0.3, 0.4].forEach(t => { line(g, x0, y(t), 525, y(t), "grid"); T(g, 531, y(t) + 4, String(t)); });
    line(g, x0, 190, x0, py0, "ax"); line(g, x0, py0, 525, py0, "ax");
    const pts = [];
    for (let i = 0; i < 15; i++) {
      const o = Math.max(0, fq(i) + this.N[i] * 0.008), bx = x0 + i * 30 + 4;
      rect(g, bx, y(o), 22, py0 - y(o), "read"); pts.push([x0 + i * 30 + 15, y(fq(i))]);
    }
    line(g, x0, y(v.c), 525, y(v.c), "dash");
    S("polyline", { points: pts.map(p => p.join(",")).join(" "), class: "curve" }, g);
    pts.forEach(p => S("circle", { cx: p[0], cy: p[1], r: 2.6, class: "inkf" }, g));
    S("path", { d: `M58 ${y(v.c)} H66 M62 ${y(v.c)} V${y(fq(0))} M58 ${y(fq(0))} H66`, class: "brk" }, g);
    [1, 5, 10, 15].forEach(i => T(g, x0 + (i - 1) * 30 + 15, py0 + 17, String(i), null, "middle"));
    T(g, 300, py0 + 36, "position from the 5′ end", null, "middle");
    const mid = (y(v.c) + y(fq(0))) / 2;
    marker(ctx, "A", 58, mid, 34, mid);
    marker(ctx, "q", pts[2][0], pts[2][1], 205, Math.min(pts[2][1] - 34, 228));
    marker(ctx, "c", 525, y(v.c), 575, y(v.c) - 18);
    const o10 = Math.max(0, fq(10) + this.N[10] * 0.008);
    marker(ctx, "fwf{i} / bwf{i}", x0 + 10 * 30 + 15, y(o10), 435, 290);
    marker(ctx, "fwdx{i} / bwdx{i}", pts[6][0], pts[6][1], 300, Math.min(pts[6][1] - 30, 262));
    return {
      readouts: [
        { sym: "A", label: "A", value: f(v.A, 3) },
        { label: "C→T at position 1", value: f(fq(0), 3) },
        { label: "Damaged bases drawn", value: `${dmg} <small>of ${total}</small>` }
      ],
      verdict: `<b>A = ${f(v.A, 3)}</b>: the fitted C→T at position 1 sits ${f(v.A, 3)} above the background c = ${f(v.c, 3)}.`
    };
  }
};

PLATES["damage-significance"] = {
  w: 600, h: 300, alt: "Zfit_new and Zfit_old on a sigma scale, A with both standard-deviation intervals, and the weight each read position gets in the effective N.",
  caption: "Formulas from metaDMG-cpp 0.5.2 (dfit_optim.cpp). Synthetic counts: every position carries the same N.",
  controls: [
    { id: "A", label: "<code>A</code> amplitude", min: 0, max: 0.1, step: 0.001, value: 0.03, d: 3 },
    { id: "q", label: "<code>q</code> decay", min: 0.05, max: 0.9, step: 0.01, value: 0.35, d: 2 },
    { id: "phi", label: "<code>phi</code> concentration", min: 2, max: 300, step: 1, value: 60, d: 0 },
    { id: "N", label: "Reads covering each position (N)", min: 5, max: 2000, step: 5, value: 100, d: 0 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, P = 15, w = i => Math.pow(1 - v.q, 2 * i);
    let Neff = 0; for (let i = 0; i < P; i++) Neff += v.N * w(i);
    Neff = Math.max(Neff, 1);
    const sd = n => Math.sqrt(v.A * (1 - v.A) * (v.phi + n) / ((v.phi + 1) * n));
    const sOld = sd(Math.max(v.N, 1)), sNew = sd(Neff), zOld = sOld ? v.A / sOld : 0, zNew = sNew ? v.A / sNew : 0;
    const zx = z => 50 + clamp(z, 0, 8) / 8 * 520;
    T(g, 50, 18, "Zfit in σ · filled = _new (filter on this), ring = _old", "lbl");
    rect(g, 50, 40, 520, 16, "ruled");
    for (let z = 0; z <= 8; z++) T(g, zx(z), 76, String(z), null, "middle");
    S("circle", { cx: zx(zOld), cy: 48, r: 6, class: "ringc" }, g);
    S("circle", { cx: zx(zNew), cy: 48, r: 7, class: "inkf" }, g);
    if (zNew > 8) T(g, 576, 52, "›", "lbl");
    marker(ctx, "Zfit", zx(zNew), 55, Math.max(zx(zNew) - 22, 24), 96);

    const ax = a => 50 + clamp(a, 0, 0.12) / 0.12 * 520;
    T(g, 50, 118, "A ± 1.96·sigmaD · upper bar = _new, lower bar = _old", "lbl");
    line(g, 50, 164, 570, 164, "ax");
    [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.12].forEach(a => { line(g, ax(a), 160, ax(a), 168, "ax"); T(g, ax(a), 186, f(a, 2), null, "middle"); });
    const bar = (s, y, cls) => S("path", { d: `M${ax(v.A - 1.96 * s)} ${y - 5} V${y + 5} M${ax(v.A - 1.96 * s)} ${y} H${ax(v.A + 1.96 * s)} M${ax(v.A + 1.96 * s)} ${y - 5} V${y + 5}`, class: cls }, g);
    bar(sNew, 134, "brk wide"); bar(sOld, 150, "brk");
    S("circle", { cx: ax(v.A), cy: 134, r: 5, class: "inkf" }, g);
    marker(ctx, "sigmaD", ax(v.A + 1.96 * sNew), 134, Math.min(ax(v.A + 1.96 * sNew) + 26, 588), 120);

    T(g, 50, 216, "weight of each position in N_eff = Σ N·(1−q)^(2|x|) · _old uses position 1 only", "lbl");
    for (let i = 0; i < P; i++) { const ht = 52 * w(i); rect(g, 50 + i * 34, 282 - ht, 24, ht, i === 0 ? "readink" : "read"); }
    line(g, 50, 282, 560, 282, "ax");
    T(g, 62, 296, "1", null, "middle"); T(g, 50 + 14 * 34 + 12, 296, "15", null, "middle");
    return {
      readouts: [
        { sym: "Zfit", label: "Zfit_new", value: `${f(zNew, 2)}σ` },
        { sym: "Zfit", label: "Zfit_old", value: `${f(zOld, 2)}σ` },
        { sym: "sigmaD", label: "sigmaD_new", value: f(sNew, 4) },
        { sym: "sigmaD", label: "sigmaD_old", value: f(sOld, 4) },
        { label: "N_eff / N", value: f(Neff / Math.max(v.N, 1), 2) },
        { sym: "phi", label: "phi", value: f(v.phi, 0) }
      ],
      verdict: `<b>Zfit_new = ${f(zNew, 2)}σ</b>. Zfit_old = ${f(zOld, 2)}σ, for comparison only. With q = ${f(v.q, 2)}, the effective N is ${f(Neff / Math.max(v.N, 1), 2)}× the position-1 count, so the new score is ${f(zNew / Math.max(zOld, 1e-9), 2)}× the old one.`
    };
  }
};

PLATES["holi-read-path"] = {
  w: 600, h: 270, alt: "Flow diagram: reads are split by getRTax or metaDMG LCA into microbial and eukaryotic outputs, measured by metaDMG and Unicorn, then merged by Butteracid.",
  caption: "Diagram of the stages. The toggles show what each flag changes.",
  controls: [
    { id: "lca", type: "check", label: "<code>--lca-assignment</code>", value: false },
    { id: "sf", type: "check", label: "<code>--storage-friendly</code>", value: false }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const box = (x, y, w, ht, cls = "ruled") => rect(g, x, y, w, ht, cls, { rx: 4 });
    box(10, 100, 80, 60, "boxdark"); T(g, 50, 126, "Reads", "onband lblw", "middle"); T(g, 50, 144, "mapped BAM", "onband", "middle");
    box(110, 85, 120, 90);
    T(g, 170, 104, "Split", "lbl", "middle");
    rect(g, 118, v.lca ? 140 : 114, 104, 22, "hlf", { rx: 3 });
    T(g, 170, 129, "getRTax", v.lca ? "mono faintt" : "mono", "middle"); T(g, 170, 155, "metaDMG LCA", v.lca ? "mono" : "mono faintt", "middle");
    box(250, 40, 120, 56); T(g, 310, 63, "MICROB_OUT", "mono", "middle"); T(g, 310, 82, "stages 2–3", null, "middle");
    box(250, 164, 120, 56); T(g, 310, 187, "EUK_OUT", "mono", "middle"); T(g, 310, 206, "stages 3–8", null, "middle");
    box(390, 85, 100, 90); line(g, 390, 130, 490, 130, "grid");
    T(g, 440, 104, "metaDMG", "lbl", "middle"); T(g, 440, 120, "damage", null, "middle");
    T(g, 440, 149, "Unicorn", "lbl", "middle"); T(g, 440, 165, "coverage", null, "middle");
    box(510, 95, 80, 70, "boxdark"); T(g, 550, 126, "Butteracid", "onband lblw", "middle"); T(g, 550, 144, "merge", "onband", "middle");
    const rl = box(110, 205, 120, 44, "ruled dashbox"); if (v.sf) rl.classList.add("faint");
    T(g, 170, 224, "stage-3 read lists", v.sf ? "faintt" : null, "middle");
    T(g, 170, 241, v.sf ? "deleted after use" : "kept", v.sf ? "lbl dmgt" : null, "middle");
    arrow(g, [[90, 130], [108, 130]]);
    arrow(g, [[230, 115], [240, 115], [240, 68], [248, 68]]);
    arrow(g, [[230, 145], [240, 145], [240, 192], [248, 192]]);
    arrow(g, [[370, 68], [380, 68], [380, 107], [388, 107]]);
    arrow(g, [[370, 192], [380, 192], [380, 152], [388, 152]]);
    arrow(g, [[490, 130], [508, 130]]);
    arrow(g, [[170, 175], [170, 203]]);
    marker(ctx, "--lca-assignment", 170, 86, 150, 34);
    marker(ctx, "RESULT_PATH / MICROB_OUT / EUK_OUT", 310, 130, 310, 130);
    marker(ctx, "--storage-friendly", 230, 227, 262, 250);
    marker(ctx, "total_n_reads_from_mD", 440, 86, 440, 50);
    marker(ctx, "m_alnani", 440, 175, 440, 214);
    marker(ctx, ".x / .y suffix", 550, 165, 550, 214);
    return { readouts: [], verdict: `Reads are split by <b>${v.lca ? "metaDMG LCA" : "getRTax"}</b>${v.lca ? "" : " (the default)"}. Intermediate read lists are <b>${v.sf ? "deleted as soon as downstream outputs exist" : "kept"}</b>.` };
  }
};

PLATES["coverage-evenness"] = {
  w: 600, h: 252, alt: "Synthetic reads piled over a 2,000 bp reference; covered stretches of the reference are drawn dark.",
  caption: "Synthetic 2,000 bp reference, 60 bp reads. Every statistic is computed from the reads drawn.",
  controls: [
    { id: "n", label: "Reads", min: 5, max: 120, step: 1, value: 30, d: 0 },
    { id: "cl", label: "Clustering", min: 0, max: 1, step: 0.05, value: 0, d: 2 }
  ],
  init() { const R = rng(11); this.P = Array.from({ length: 120 }, () => ({ u: R(), c: R(), w: R(), o: R() + R() + R() - 1.5 })); },
  draw(ctx, v) {
    const g = ctx.svg, G = 2000, L = 60, sx = 560 / G, x0 = 20;
    const depth = new Uint16Array(G), ends = [], placed = [];
    for (let k = 0; k < v.n; k++) {
      const p = this.P[k];
      const pos = Math.round(clamp(p.c < v.cl ? (p.w < 0.5 ? 520 : 1380) + p.o * 110 : p.u * (G - L), 0, G - L));
      for (let i = pos; i < pos + L; i++) depth[i]++;
      placed.push(pos);
    }
    placed.sort((a, b) => a - b);
    let over = 0;
    placed.forEach(pos => {
      let r = ends.findIndex(e => e < pos - 4); if (r < 0) { r = ends.length; ends.push(0); }
      ends[r] = pos + L;
      if (r > 22) { over++; return; }
      rect(g, x0 + pos * sx, 196 - r * 7, L * sx - 0.6, 5, "read", { rx: 1 });
    });
    rect(g, x0, 208, 560, 8, "ruledf");
    let runs = [], s = -1;
    for (let i = 0; i <= G; i++) { const c = i < G && depth[i] > 0; if (c && s < 0) s = i; if (!c && s >= 0) { runs.push([s, i]); s = -1; } }
    runs.forEach(([a, b]) => rect(g, x0 + a * sx, 208, (b - a) * sx, 8, "inkf"));
    T(g, x0, 18, "reads (60 bp)", "lbl"); if (over) T(g, 580, 18, `+${over} reads deeper than drawn`, null, "end");
    T(g, 580, 240, "synthetic reference, 2,000 bp", null, "end");
    const big = runs.reduce((m, r) => (r[1] - r[0] > m[1] - m[0] ? r : m), [0, 0]);
    const bx = x0 + (big[0] + big[1]) / 2 * sx;
    marker(ctx, "breath_cov", bx, 216, clamp(bx, 30, 360), 238);
    const cov = runs.reduce((t, [a, b]) => t + b - a, 0) / G;
    const exp = 1 - Math.exp(-v.n * L / G), ratio = cov / exp;
    const d = Array.from(depth).sort((a, b) => a - b), cut = Math.floor(G * 0.1);
    const mid = d.slice(cut, G - cut), tad = mid.reduce((a, b) => a + b, 0) / mid.length;
    const tot = d.reduce((a, b) => a + b, 0); let acc = 0; d.forEach((x, i) => acc += (i + 1) * x);
    const gini = tot ? (2 * acc) / (G * tot) - (G + 1) / G : 0;
    let H = 0; d.forEach(x => { if (x) { const p = x / tot; H -= p * Math.log(p); } });
    const nH = H / Math.log(G);
    return {
      readouts: [
        { sym: "breath_cov", label: "breath_cov", value: f(cov, 3) },
        { sym: "exp_breath", label: "exp_breath", value: f(exp, 3) },
        { sym: "breath_ratio", label: "breath_ratio", value: f(ratio, 2) },
        { sym: "tad80", label: "tad80", value: `${f(tad, 2)}×` },
        { sym: "gini / n_gini", label: "gini", value: f(gini, 2) },
        { sym: "entropy / n_entropy", label: "n_entropy", value: f(nH, 3) }
      ],
      verdict: ratio < 0.85
        ? `<b>breath_ratio = ${f(ratio, 2)}</b>: reads cover less of the reference than their number predicts. They are clustered, which the dictionary reads as suspicious (interpretation still to verify on data).`
        : `<b>breath_ratio = ${f(ratio, 2)}</b>: breadth matches what ${v.n} reads should cover, so the spread is even.`
    };
  }
};

PLATES["damage-curve-fit"] = {
  w: 600, h: 290, alt: "Observed damage bars against the fitted curve; sliders shift and flatten the observed profile.",
  caption: "Synthetic profile. rho_c and its parts are computed live from the bars and the curve.",
  controls: [
    { id: "sh", label: "Shift observed", min: 0, max: 0.08, step: 0.002, value: 0, d: 3 },
    { id: "fl", label: "Flatten observed", min: 0, max: 1, step: 0.05, value: 0, d: 2 }
  ],
  init() { const R = rng(23); this.N = Array.from({ length: 15 }, () => R() * 2 - 1); },
  draw(ctx, v) {
    const g = ctx.svg, fit = Array.from({ length: 15 }, (_, i) => 0.01 + 0.25 * Math.pow(0.65, i));
    const mf = fit.reduce((a, b) => a + b) / 15;
    const obs = fit.map((y, i) => Math.max(0, y * (1 - v.fl) + mf * v.fl + v.sh + this.N[i] * 0.006));
    const ym = 0.34, Y = val => 250 - clamp(val, 0, ym) / ym * 210, X = i => 62 + i * 34;
    [0.1, 0.2, 0.3].forEach(t => { line(g, 50, Y(t), 570, Y(t), "grid"); T(g, 44, Y(t) + 4, String(t), null, "end"); });
    line(g, 50, 250, 570, 250, "ax");
    obs.forEach((o, i) => rect(g, X(i), Y(o), 22, 250 - Y(o), "read"));
    S("polyline", { points: fit.map((y, i) => `${X(i) + 11},${Y(y)}`).join(" "), class: "curve" }, g);
    [1, 5, 10, 15].forEach(i => T(g, X(i - 1) + 11, 268, String(i), null, "middle"));
    T(g, 310, 286, "position from the 5′ end", null, "middle");
    rect(g, 360, 16, 18, 12, "read"); T(g, 384, 27, "observed fwf"); line(g, 476, 22, 496, 22, "curve"); T(g, 502, 27, "fitted fwdx");
    const n = 15, mx = obs.reduce((a, b) => a + b) / n, my = mf;
    let sxx = 0, syy = 0, sxy = 0; for (let i = 0; i < n; i++) { sxx += (obs[i] - mx) ** 2; syy += (fit[i] - my) ** 2; sxy += (obs[i] - mx) * (fit[i] - my); }
    sxx /= n; syy /= n; sxy /= n;
    const rc = 2 * sxy / (sxx + syy + (mx - my) ** 2), r = sxy / Math.sqrt(sxx * syy), cb = rc / r;
    const sxd = Math.sqrt(sxx), syd = Math.sqrt(syy), ls = (mx - my) / Math.sqrt(sxd * syd), ss = sxd / syd;
    marker(ctx, "C_b, l_shift, s_shift", X(11) + 11, (Y(obs[11]) + Y(fit[11])) / 2, X(11) + 11, Math.min(Y(obs[11]), Y(fit[11])) - 30);
    return {
      readouts: [
        { sym: "rho_c", label: "rho_c", value: f(rc, 3) },
        { sym: "C_b, l_shift, s_shift", label: "C_b", value: f(cb, 3) },
        { sym: "C_b, l_shift, s_shift", label: "l_shift", value: f(ls, 2) },
        { sym: "C_b, l_shift, s_shift", label: "s_shift", value: f(ss, 2) }
      ],
      verdict: `<b>rho_c = ${f(rc, 2)}</b>. ${rc > 0.9 ? "The curve describes the observed profile well." : rc > 0.6 ? "The fit is loose: check l_shift (offset) and s_shift (shape) to see which part fails." : "The curve does not describe the profile, even if A clears its threshold."}`
    };
  }
};

PLATES["mapping-funnel"] = {
  w: 600, h: 334, alt: "Left, k-mer counts for twelve synthetic genera on a log scale with the kmers threshold. Right, a funnel of genera extracted, assemblies mapped, reads above MAPQ and reads entering EM.",
  caption: "Synthetic sample of twelve genera; read shares per stage are illustrative.",
  controls: [
    { id: "km", label: "<code>kmers</code> threshold", min: 50, max: 5000, step: 10, value: 500, d: 0 },
    { id: "ms", label: "<code>max_species_per_genus</code>", min: 1, max: 40, step: 1, value: 20, d: 0 },
    { id: "mq", label: "<code>mq</code> MAPQ", min: 0, max: 42, step: 1, value: 20, d: 0 },
    { id: "pm", label: "<code>min_pmax_for_em</code>", min: 0.5, max: 0.99, step: 0.01, value: 0.7, d: 2 }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const K = [12400, 6100, 3800, 2100, 1450, 920, 610, 480, 350, 220, 140, 60], SP = [34, 18, 9, 25, 4, 12, 3, 7, 2, 5, 1, 3];
    const lx = val => 82 + (Math.log10(Math.max(val, 10)) - 1) / (Math.log10(20000) - 1) * 210;
    [100, 1000, 10000].forEach(t => { line(g, lx(t), 36, lx(t), 284, "grid"); T(g, lx(t), 300, t >= 1000 ? `${t / 1000}k` : String(t), null, "middle"); });
    let nG = 0, nA = 0, reads = 0;
    K.forEach((k, i) => {
      const pass = k >= v.km, y = 40 + i * 20.5;
      T(g, 14, y + 11, `genus ${i + 1}`);
      rect(g, 82, y, lx(k) - 82, 13, pass ? "readink" : "read faint");
      if (pass) { nG++; nA += Math.min(SP[i], v.ms); reads += Math.round(k * 0.9); }
    });
    line(g, lx(v.km), 30, lx(v.km), 288, "thr");
    T(g, lx(v.km) + 6, 26, `≥ ${int(v.km)}`, "lbl");
    T(g, 14, 322, "k-mers per genus, log scale");
    const mqShare = Math.exp(-v.mq / 45), emShare = clamp((1 - v.pm) / 0.5, 0, 1) * 0.85 + 0.1;
    const r2 = Math.round(reads * mqShare), r3 = Math.round(r2 * emShare);
    const bands = [["genera extracted", int(nG)], ["assemblies mapped", int(nA)], ["reads ≥ MAPQ", int(r2)], ["reads into EM", int(r3)]];
    bands.forEach(([lab, val], k) => {
      const w = 250 - k * 26, x = 470 - w / 2, y = 36 + k * 62;
      rect(g, x, y, w, 50, "band", { rx: 3 });
      T(g, 470, y + 21, lab, "onband", "middle"); T(g, 470, y + 39, val, "onband mono lblw", "middle");
    });
    const ep = [0.71, 0.18, 0.07, 0.04], cls = ["readink", "read", "ruledf2", "ruledf"]; let ex = 384;
    ep.forEach((p, i) => { rect(g, ex, 290, p * 172, 12, cls[i]); ex += p * 172; });
    T(g, 470, 322, "em_p across one genus' assemblies", null, "middle");
    marker(ctx, "kmers", lx(v.km), 34, Math.max(lx(v.km) - 20, 24), 14);
    marker(ctx, "max_species_per_genus", 470 + 112, 123, 594, 123);
    marker(ctx, "bt2_param", 470 - 112, 112, 336, 112);
    marker(ctx, "mq", 470 - 99, 185, 344, 185);
    marker(ctx, "min_pmax_for_em", 470 - 86, 247, 352, 247);
    marker(ctx, "em_p", 556, 296, 584, 296);
    return {
      readouts: [],
      verdict: `<b>${nG} of 12 genera</b> pass kmers ≥ ${int(v.km)}, giving ${int(nA)} assemblies to map with bowtie2 <code>${bySym.get("bt2_param").range.replace(/"/g, "")}</code>. ${int(r2)} reads keep MAPQ ≥ ${v.mq}; ${int(r3)} reach pmax ≥ ${f(v.pm, 2)} and enter the EM.`
    };
  }
};

PLATES["kmer-damage"] = {
  w: 600, h: 320, alt: "A read shaded by damage probability, its classified k-mer rate along the read with a plateau and the 0.5 requirement, and a read-length window ruler.",
  caption: "Illustrative model: k = 31, interior classification 0.8, decay 0.35 per base. Not the screen's own estimator.",
  controls: [
    { id: "L", label: "Read length (bp)", min: 35, max: 150, step: 1, value: 60, d: 0 },
    { id: "A", label: "Damage at the ends", min: 0, max: 0.6, step: 0.01, value: 0.3, d: 2 },
    { id: "lo", label: "<code>damage_min_read_length</code>", min: 20, max: 60, step: 1, value: 30, d: 0 },
    { id: "hi", label: "<code>damage_max_read_length</code>", min: 50, max: 150, step: 1, value: 75, d: 0 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, k = 31, p0 = 0.8, L = v.L, x0 = 30, W = 540, cw = W / L;
    const f5 = i => v.A * Math.pow(0.65, i), f3 = i => v.A * Math.pow(0.65, L - 1 - i);
    const pd = i => 1 - (1 - f5(i)) * (1 - f3(i));
    for (let i = 0; i < L; i++) { rect(g, x0 + i * cw, 18, cw - 0.4, 22, "read"); rect(g, x0 + i * cw, 18, cw - 0.4, 22, "dmg", { "fill-opacity": clamp(pd(i) * 2.2, 0, 1) }); }
    T(g, x0 - 6, 34, "5′", "lbl", "end"); T(g, x0 + W + 6, 34, "3′", "lbl");
    const nK = L - k + 1, rate = [];
    for (let j = 0; j < nK; j++) { let p = p0; for (let i = j; i < j + k; i++) p *= 1 - pd(i); rate.push(p); }
    [[0, 0], [1, 6], [nK - 1, 0]].forEach(([j, dy]) => rect(g, x0 + j * cw, 48 + dy, k * cw, 4, j === 0 || j === nK - 1 ? "dmg" : "readink", { rx: 2 }));
    T(g, x0, 76, `${nK} k-mers of 31 bp; the first and last cover the damaged ends`);
    const Y = r => 252 - r * 150, X = j => x0 + (nK > 1 ? j / (nK - 1) : 0.5) * W;
    line(g, x0, 102, x0, 252, "ax"); line(g, x0, 252, x0 + W, 252, "ax");
    [0, 0.5, 1].forEach(t => T(g, x0 - 6, Y(t) + 4, String(t), null, "end"));
    const plat = Math.max(...rate);
    line(g, x0, Y(0.5), x0 + W, Y(0.5), "thr"); T(g, x0 + W, Y(0.5) + 16, "0.5 required", "dmgt", "end");
    line(g, x0, Y(plat), x0 + W, Y(plat), "dash");
    S("polyline", { points: rate.map((r, j) => `${X(j)},${Y(r)}`).join(" "), class: "curve" }, g);
    rate.forEach((r, j) => { if (nK <= 60 || j % 2 === 0) S("circle", { cx: X(j), cy: Y(r), r: 2.4, class: "inkf" }, g); });
    T(g, x0 + W / 2, 268, "classified rate by k-mer position along the read", null, "middle");
    const bx = b => x0 + clamp(b, 0, 160) / 160 * W;
    line(g, x0, 296, x0 + W, 296, "ax");
    rect(g, bx(v.lo), 289, bx(Math.max(v.lo, v.hi)) - bx(v.lo), 14, "hlf");
    S("path", { d: `M${bx(L)} 286 l-5 -8 h10 z`, class: "inkf" }, g);
    [0, 40, 80, 120, 160].forEach(b => T(g, bx(b), 316, `${b}`, null, "middle"));
    const inWin = L >= v.lo && L <= v.hi;
    marker(ctx, "damage_rate_5prime / damage_pvalue", X(0), Y(rate[0]), X(0) + 40, Math.max(Y(rate[0]) - 34, 112));
    marker(ctx, "plateau_classified_rate", X(Math.floor(nK / 2)), Y(plat), X(Math.floor(nK / 2)) + 28, Y(plat) - 24);
    marker(ctx, "damage_min_read_length / damage_max_read_length", bx((v.lo + v.hi) / 2), 289, bx((v.lo + v.hi) / 2) + 22, 279);
    const deficit = 1 - rate[0] / plat;
    return {
      readouts: [
        { sym: "damage_rate_5prime / damage_pvalue", label: "terminal deficit", value: `${f(deficit, 2)} <small>illustrative</small>` },
        { sym: "plateau_classified_rate", label: "plateau rate", value: ok(plat >= 0.5, f(plat, 2), f(plat, 2)) },
        { sym: "damage_min_read_length / damage_max_read_length", label: "read in window", value: ok(inWin, "yes", "no") }
      ],
      verdict: `${inWin ? `A ${L} bp read sits inside the ${v.lo}–${v.hi} bp window and feeds the damage signal.` : `A ${L} bp read falls outside the ${v.lo}–${v.hi} bp window and is not used.`} ${plat >= 0.5 ? "The interior plateau clears 0.5." : "The plateau is below 0.5, so this taxon fails the screen's classification requirement."} A hit also needs damage_pvalue &lt; 0.05 and damage_rate_5prime ≤ 0.4.`
    };
  }
};

PLATES["evidence-tiers"] = {
  w: 600, h: 268, alt: "Three stacked tiers, full, coverage only and abundance only, with the current taxon's tier highlighted beside four checks.",
  caption: "Tier logic as the dictionary defines it. The in-window read count needed for a damage test is not recorded there, so it is a toggle.",
  controls: [
    { id: "n", label: "Reads for the taxon", min: 0, max: 400, step: 1, value: 120, d: 0 },
    { id: "cov", label: "<code>cov</code> (KrakenUniq)", min: 0, max: 0.2, step: 0.001, value: 0.05, d: 3 },
    { id: "dup", label: "<code>dup</code> (KrakenUniq)", min: 1, max: 20, step: 0.1, value: 2.5, d: 1 },
    { id: "wg", label: "Within-genus share", min: 0, max: 1, step: 0.01, value: 0.35, d: 2 },
    { id: "win", type: "check", label: "Enough in-window reads for a damage test", value: true }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const tier = v.n < 50 ? "abundance_only" : !v.win ? "coverage_only" : "full";
    const T3 = [["full", "abundance + coverage + damage", "detection"], ["coverage_only", "too few in-window reads for damage", "lead"], ["abundance_only", "below evenness_min_reads", "lead"]];
    let ty = 0;
    T3.forEach(([name, sub, kind], i) => {
      const y = 14 + i * 82, on = name === tier; if (on) ty = y + 34;
      rect(g, 14, y, 276, 68, on ? "boxdark" : "ruled", { rx: 4 });
      T(g, 30, y + 27, name, on ? "mono onband lblw" : "mono", null); T(g, 274, y + 27, kind, on ? "onband" : null, "end");
      T(g, 30, y + 50, sub, on ? "onband" : null);
    });
    const lam = v.dup * v.cov, even = lam < 0.1 ? v.dup < 6 : v.cov > 0.02;
    const checks = [
      ["evenness_min_reads", v.n >= 50, `${int(v.n)} reads ≥ 50`, "evenness call possible"],
      ["evenness_index", even, `λ = ${f(lam, 3)}`, lam < 0.1 ? `λ < 0.1, so dup < 6 (dup ${f(v.dup, 1)})` : `λ ≥ 0.1, so cov > 0.02 (cov ${f(v.cov, 3)})`],
      [null, v.win, "damage test", v.win ? "enough in-window reads" : "too few in-window reads"],
      ["within_genus_relative_abundance", v.wg >= 0.1, `share ${f(v.wg, 2)} ≥ 0.1`, "species hit within its genus"]
    ];
    checks.forEach(([sym, pass, l1, l2], i) => {
      const y = 30 + i * 60;
      S("circle", { cx: 324, cy: y, r: 10, class: pass ? "passf" : "failf" }, g);
      S("path", { d: pass ? `M${319} ${y} l3.5 3.5 l6 -7` : `M${320} ${y - 4} l8 8 M${328} ${y - 4} l-8 8`, class: "tick" }, g);
      T(g, 344, y + 4, l1, "lbl"); T(g, 344, y + 22, l2);
      if (sym) marker(ctx, sym, 580, y, 580, y);
    });
    marker(ctx, "evidence tier", 290, ty, 304, ty);
    return {
      readouts: [],
      verdict: `Tier <b><code>${tier}</code></b>: ${tier === "full" ? "counts as a detection." : "a lead, not a detection."} Evenness ${even ? ok(1, "passes") : ok(0, "", "fails")} and the within-genus share ${v.wg >= 0.1 ? ok(1, "passes") : ok(0, "", "fails")}.`
    };
  }
};

PLATES["tree-walk"] = {
  w: 600, h: 366, alt: "A reference tree with two candidate paths marked with supporting and conflicting SNPs, and a pileup of ten bases at one SNP.",
  caption: "Synthetic tree. Filled dots are transversions, rings are transitions; vermilion marks conflicts. Default and no-filter are not told apart here.",
  controls: [
    { id: "t", label: "<code>-t</code> tolerance", min: 0, max: 6, step: 1, value: 3, d: 0 },
    { id: "m", type: "select", label: "<code>-m</code> filtering mode", options: ["default", "no-filter", "transversions"], value: "default" },
    { id: "c", label: "<code>-c</code> read support", min: 0.5, max: 1, step: 0.05, value: 0.7, d: 2 },
    { id: "q", label: "<code>-q</code> base quality", min: 0, max: 40, step: 1, value: 20, d: 0 },
    { id: "share", label: "Share of reads showing T", min: 0.3, max: 1, step: 0.1, value: 0.7, d: 1 }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const N = { r: [300, 22], A: [170, 82], B: [430, 82], A1: [95, 146], A2: [240, 146], B1: [365, 146], B2: [500, 146], tA: [240, 210], tB: [500, 210] };
    const E = [["r", "A", "ss sv"], ["A", "A2", "sv sv ct"], ["A2", "tA", "ss ct"], ["r", "B", "ss ss ss"], ["B", "B2", "ss ss cv"], ["B2", "tB", "ss cv ct ct"], ["A", "A1", ""], ["B", "B1", ""]];
    const P = { A: [0, 1, 2], B: [3, 4, 5] }, tv = v.m === "transversions";
    const isTs = code => code[1] === "s" || code[1] === "t";
    const count = p => P[p].reduce((o, e) => { E[e][2].split(" ").filter(Boolean).forEach(s => { if (tv && isTs(s)) return; s[0] === "s" ? o.s++ : o.c++; }); return o; }, { s: 0, c: 0 });
    const cA = count("A"), cB = count("B");
    const cand = [["A", cA], ["B", cB]].filter(([, x]) => x.c <= v.t);
    const chosen = cand.length ? cand.reduce((m, x) => (x[1].s > m[1].s ? x : m))[0] : null;
    const dropped = ["A", "B"].filter(p => (p === "A" ? cA : cB).c > v.t);
    E.forEach(([a, b], i) => {
      const onP = P[chosen] && P[chosen].includes(i), dr = dropped.some(p => P[p].includes(i));
      line(g, ...N[a], ...N[b], onP ? "path" : dr ? "dropped" : "edge");
    });
    let mPos = null;
    E.forEach(([a, b, s]) => {
      const list = s.split(" ").filter(Boolean);
      list.forEach((code, k) => {
        const t = (k + 1) / (list.length + 1), x = N[a][0] + (N[b][0] - N[a][0]) * t, y = N[a][1] + (N[b][1] - N[a][1]) * t;
        const conf = code[0] === "c", ts = isTs(code);
        const c = S("circle", { cx: x, cy: y, r: 5, class: (conf ? "snpc" : "snps") + (ts ? " ts" : "") + (tv && ts ? " faint" : "") }, g);
        if (!mPos && ts && a === "r" && b === "A") mPos = [x, y];
      });
    });
    Object.entries(N).forEach(([k, [x, y]]) => S("circle", { cx: x, cy: y, r: k[0] === "t" ? 5 : 4, class: "inkf" }, g));
    T(g, 240, 230, chosen === "A" ? "placed" : "path A", chosen === "A" ? "lbl" : null, "middle");
    T(g, 500, 230, chosen === "B" ? "placed" : "path B", chosen === "B" ? "lbl" : null, "middle");
    const dLab = p => `${(p === "A" ? cA : cB).c} conflicts > ${v.t}`;
    if (dropped.includes("B")) T(g, 488, 246, dLab("B"), "dmgt", "middle");
    if (dropped.includes("A")) T(g, 240, 246, dLab("A"), "dmgt", "middle");
    if (!chosen) T(g, 300, 4, "no path within tolerance", "dmgt", "middle");
    marker(ctx, "-t", 584, 242, 584, 242);
    if (mPos) marker(ctx, "-m", mPos[0], mPos[1], mPos[0] - 34, mPos[1] - 12);
    const Q = [38, 12, 35, 30, 8, 36, 25, 33, 18, 37], order = [0, 2, 3, 5, 7, 9, 1, 4, 6, 8];
    const nT = Math.round(v.share * 10), isT = new Array(10).fill(false); order.slice(0, nT).forEach(i => isT[i] = true);
    T(g, 236, 272, "pileup at one SNP", "lbl");
    let kept = 0, keptT = 0, firstFaded = null;
    Q.forEach((q, i) => {
      const x = 20 + (i % 5) * 36, y = 280 + Math.floor(i / 5) * 32, keep = q >= v.q;
      if (keep) { kept++; if (isT[i]) keptT++; } else if (!firstFaded) firstFaded = [x + 16, y + 13];
      rect(g, x, y, 32, 26, isT[i] ? "readink" : "ruledf2", { rx: 3, class: (isT[i] ? "readink" : "ruledf2") + (keep ? "" : " faint") });
      T(g, x + 16, y + 18, isT[i] ? "T" : "C", isT[i] ? "mono onband" : "mono", "middle");
    });
    const sup = kept ? keptT / kept : 0, call = kept > 0 && sup >= v.c;
    T(g, 236, 294, `kept ${kept} of 10 bases with quality ≥ ${v.q}`);
    T(g, 236, 315, `T on ${keptT} of ${kept} = ${f(sup, 2)} ${sup >= v.c ? "≥" : "<"} ${f(v.c, 2)}`, "mono");
    T(g, 236, 336, call ? "→ call T at this SNP" : "→ no call at this SNP", call ? "lbl" : "lbl dmgt");
    marker(ctx, "-c", 214, 310, 214, 310);
    if (firstFaded) marker(ctx, "-q", firstFaded[0], firstFaded[1] - 13, firstFaded[0], 262);
    const sum = p => `${(p === "A" ? cA : cB).s} supporting, ${(p === "A" ? cA : cB).c} conflicting`;
    return {
      readouts: [],
      verdict: chosen
        ? `Placed on <b>path ${chosen}</b> (${sum(chosen)}).${chosen === "B" ? " Its support is all transitions, the pattern deamination can fake; -m transversions removes it." : ""}${dropped.length ? ` Path ${dropped[0]} was dropped (${sum(dropped[0])} &gt; -t ${v.t}).` : ""}`
        : `Both paths exceed -t ${v.t}, so the walk stops at the root.`
    };
  }
};

PLATES["phynder-inputs"] = {
  w: 610, h: 262, alt: "Flow of pathphynder inputs: tree files into phynder -B, branches.snp into the prepare step, then pileup, choose best path and add ancient to tree, with BAMs feeding the pileup and outputs at the end.",
  caption: "Diagram of the run order with each flag at the point it enters.",
  controls: [],
  draw(ctx) {
    const g = ctx.svg;
    const box = (x, y, w, ht, a, b, dark) => { rect(g, x, y, w, ht, dark ? "boxdark" : "ruled", { rx: 4 }); T(g, x + w / 2, y + (b ? ht / 2 - 3 : ht / 2 + 4), a, (dark ? "onband " : "") + "mono", "middle"); if (b) T(g, x + w / 2, y + ht / 2 + 14, b, dark ? "onband" : null, "middle"); };
    box(34, 22, 150, 48, "tree.nwk", "tree.vcf.gz");
    box(214, 22, 140, 48, "phynder -B", null, true);
    box(386, 22, 140, 48, "branches.snp");
    box(34, 108, 128, 54, "prepare", "-s prepare");
    box(178, 108, 140, 54, "1 pileup", "and filter");
    box(334, 108, 128, 54, "2 choose", "best path");
    box(478, 108, 112, 54, "3 add anc", "to tree");
    box(34, 200, 128, 42, "query BAMs");
    box(178, 200, 200, 42, "outputs named by -o");
    box(394, 200, 196, 42, "-x diagnostic reports");
    arrow(g, [[184, 46], [212, 46]]); arrow(g, [[354, 46], [384, 46]]);
    arrow(g, [[456, 70], [456, 88], [98, 88], [98, 106]]);
    arrow(g, [[162, 135], [176, 135]]); arrow(g, [[318, 135], [332, 135]]); arrow(g, [[462, 135], [476, 135]]);
    arrow(g, [[98, 200], [98, 186], [230, 186], [230, 164]]);
    arrow(g, [[534, 162], [534, 198]]); arrow(g, [[534, 180], [278, 180], [278, 198]]);
    marker(ctx, "-i", 109, 22, 109, 8);
    marker(ctx, "phynder -B", 284, 22, 284, 8);
    marker(ctx, "-f", 456, 22, 456, 8);
    marker(ctx, "-p", 34, 122, 14, 122);
    marker(ctx, "-G", 34, 150, 14, 150);
    marker(ctx, "-s", 590, 120, 600, 98);
    marker(ctx, "-b / -l", 34, 221, 14, 221);
    marker(ctx, "-o", 278, 242, 278, 256);
    marker(ctx, "-x", 492, 242, 492, 256);
    return { readouts: [], verdict: `<code>-s all</code> runs steps 1–3. Run <code>prepare</code> first, after <code>phynder -B -o branches.snp tree.nwk tree.vcf.gz</code>. Set <code>-r</code> to your mtDNA reference: the default is human Y.` };
  }
};

PLATES["source-mixture"] = {
  w: 600, h: 306, alt: "A mitochondrial tree with one to three sources placed along branches, each drawn with an area proportional to its abundance.",
  caption: "Synthetic tree. soibean infers these values by MCMC; here you set them to see what each parameter means.",
  controls: [
    { id: "k", label: "<code>k</code> sources", min: 1, max: 3, step: 1, value: 2, d: 0 },
    { id: "th", label: "<code>θ</code> of source 1", min: 0.05, max: 0.95, step: 0.01, value: 0.7, d: 2 },
    { id: "b", label: "<code>β</code> of source 1 along its branch", min: 0, max: 1, step: 0.01, value: 0.5, d: 2 }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const E = [[30, 160, 150, 90], [30, 160, 150, 230], [150, 90, 560, 50], [150, 90, 320, 120], [320, 120, 560, 100], [320, 120, 560, 150], [150, 230, 560, 200], [150, 230, 330, 255], [330, 255, 560, 235], [330, 255, 560, 280]];
    E.forEach(([x1, y1, x2, y2]) => S("path", { d: `M${x1} ${y1} V${y2} H${x2}`, class: "branch" }, g));
    const k = v.k, th = k === 1 ? [1] : k === 2 ? [v.th, 1 - v.th] : [v.th, (1 - v.th) / 2, (1 - v.th) / 2];
    const src = [[320 + v.b * 240, 100], [150 + 0.35 * 410, 200], [150 + 0.6 * 410, 50]];
    th.forEach((t, i) => {
      const [x, y] = src[i], r = 5 + 19 * Math.sqrt(t);
      S("circle", { cx: x, cy: y, r, class: i === 0 ? "srcf" : "srcf2" }, g);
      if (i === 0) T(g, x + r + 6, y - 10, `θ = ${f(t, 2)}`, "mono"); else T(g, x, y - r - 7, `θ = ${f(t, 2)}`, "mono", "middle");
    });
    T(g, 32, 24, `k = ${k} source${k > 1 ? "s" : ""}`, "lbl");
    T(g, 568, 304, "mitochondrial pangenome tree (synthetic)", null, "end");
    const [sx, sy] = src[0], r0 = 5 + 19 * Math.sqrt(th[0]);
    marker(ctx, "k", 14, 20, 14, 20);
    marker(ctx, "β", sx, sy - r0, sx - 40, 72);
    marker(ctx, "θ", sx, sy + r0, sx, 128);
    return {
      readouts: [
        { sym: "k", label: "k", value: String(k) },
        { sym: "β", label: "β, source 1", value: f(v.b, 2) },
        { sym: "θ", label: "θ", value: th.map(t => f(t, 2)).join(" · ") }
      ],
      verdict: `${k === 1 ? "One source carries all the reads." : `${k} sources share the reads ${th.map(t => f(t, 2)).join(" / ")}.`} soibean runs k = 1 upward to find the most likely k, and reports ESS for every parameter.`
    };
  }
};

PLATES["family-classification"] = {
  w: 600, h: 290, alt: "A read shaded by damage probability above bars showing, for each k from 18 to 30, the share of the read's k-mers that contain no damaged base.",
  caption: "Illustrative model: damage decays 0.35 per base from both ends. Shows why shorter k suits damaged reads; it is not KrakenUniq's classifier.",
  controls: [
    { id: "k", label: "<code>k</code> k-mer size", min: 18, max: 30, step: 1, value: 22, d: 0 },
    { id: "L", label: "Read length (bp)", min: 20, max: 120, step: 1, value: 50, d: 0 },
    { id: "A", label: "Damage at the ends", min: 0, max: 0.5, step: 0.01, value: 0.3, d: 2 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, L = v.L, x0 = 34, cw = Math.min(11, 540 / L), short = L < 35;
    const pd = i => 1 - (1 - v.A * Math.pow(0.65, i)) * (1 - v.A * Math.pow(0.65, L - 1 - i));
    for (let i = 0; i < L; i++) {
      rect(g, x0 + i * cw, 26, cw - 0.4, 18, short ? "read faint" : "read");
      if (!short) rect(g, x0 + i * cw, 26, cw - 0.4, 18, "dmg", { "fill-opacity": clamp(pd(i) * 2.2, 0, 1) });
    }
    T(g, x0, 16, short ? `${L} bp read: excluded, shorter than 35 bp` : `${L} bp read, damage shaded`, short ? "dmgt lbl" : "lbl");
    const share = k => { const n = L - k + 1; if (n < 1) return [0, 0]; let s = 0; for (let j = 0; j < n; j++) { let p = 1; for (let i = j; i < j + k; i++) p *= 1 - pd(i); s += p; } return [s / n, n, s]; };
    T(g, x0, 80, "share of the read's k-mers with no damaged base, by k", "lbl");
    const Y = r => 236 - r * 136;
    [0, 0.5, 1].forEach(t => { line(g, 56, Y(t), 580, Y(t), "grid"); T(g, 50, Y(t) + 4, String(t), null, "end"); });
    let cur = null;
    for (let k = 18; k <= 30; k++) {
      const [sh] = share(k), x = 64 + (k - 18) * 40, on = k === v.k;
      rect(g, x, Y(sh), 28, 236 - Y(sh), on ? "readink" : "read");
      T(g, x + 14, 254, String(k), on ? "lbl" : null, "middle");
      if (on) cur = [x + 14, Y(sh)];
    }
    T(g, 318, 276, "k-mer size", null, "middle");
    marker(ctx, "k (quicksand)", cur[0], cur[1], cur[0], Math.max(cur[1] - 24, 96));
    marker(ctx, "min read length (quicksand)", 14, 35, 14, 35);
    const [sh, n, s] = share(v.k);
    return {
      readouts: [
        { sym: "k (quicksand)", label: "k-mers in read", value: String(Math.max(n, 0)) },
        { label: "free of damage", value: n ? f(s, 1) : "0" },
        { label: "share", value: f(sh, 2) }
      ],
      verdict: short ? `A ${L} bp read is below the 35 bp minimum and never reaches classification.` : `At k = ${v.k}, ${f(sh * 100, 0)}% of this read's k-mers carry no damaged base. The dictionary recommends 24+ for less-damaged or Holocene material and 19–20 for highly damaged samples; quicksand uses 22.`
    };
  }
};

PLATES["family-filters"] = {
  w: 600, h: 330, alt: "Nine families from a synthetic library with their share of sequences on a log scale, their evenness of breadth, and whether each is kept.",
  caption: "Synthetic library of nine families. Bin minimums are fixed at 3 sequences and 129 unique k-mers.",
  controls: [
    { id: "psf", label: "<code>PSF</code> cutoff (%)", min: 0, max: 2, step: 0.05, value: 0.5, d: 2 },
    { id: "peb", label: "<code>PEB</code> cutoff", min: 0, max: 1, step: 0.05, value: 0.5, d: 2 },
    { id: "cap", type: "check", label: "Single-target capture library (skip PEB)", value: false }
  ],
  draw(ctx, v) {
    const g = ctx.svg;
    const F = [["Bovidae", 4200, 88000, 0.86], ["Cervidae", 1800, 41000, 0.79], ["Equidae", 950, 22000, 0.71], ["Hominidae", 210, 4100, 0.64], ["Hyaenidae", 120, 2600, 0.55], ["Ursidae", 48, 900, 0.38], ["Canidae", 30, 110, 0.45], ["Felidae", 9, 150, 0.62], ["Suidae", 2, 40, 0.2]];
    const tot = F.reduce((t, r) => t + r[1], 0);
    const px = p => 120 + (Math.log10(clamp(p, 0.01, 100)) + 2) / 4 * 180, ex = e => 330 + e * 120;
    T(g, 20, 22, "family", "lbl"); T(g, 120, 22, "PSF, % of sequences (log)", "lbl"); T(g, 330, 22, "PEB", "lbl"); T(g, 470, 22, "status", "lbl");
    let kept = [];
    F.forEach(([nm, s, km, e], i) => {
      const y = 36 + i * 28, psf = s / tot * 100;
      const bin = s >= 3 && km >= 129, okP = psf >= v.psf, okE = v.cap || e >= v.peb;
      T(g, 20, y + 12, nm);
      rect(g, 120, y + 1, px(psf) - 120, 12, bin && okP ? "readink" : "read faint");
      S("circle", { cx: ex(e), cy: y + 7, r: 5, class: v.cap ? "read faint" : (okE ? "inkf" : "failf") }, g);
      const why = !bin ? "bin too small" : !okP ? "PSF too low" : !okE ? "PEB too low" : "kept";
      T(g, 470, y + 12, why, why === "kept" ? "lbl passt" : "dmgt");
      if (why === "kept") kept.push(nm);
    });
    line(g, px(v.psf), 30, px(v.psf), 284, "thr");
    if (!v.cap) line(g, ex(v.peb), 30, ex(v.peb), 284, "thr");
    [0.01, 0.1, 1, 10, 100].forEach(p => T(g, px(p), 302, String(p), null, "middle"));
    [0, 0.5, 1].forEach(e => T(g, ex(e), 302, String(e), null, "middle"));
    marker(ctx, "bin thresholds (quicksand)", 585, 17, 585, 17);
    marker(ctx, "PSF", px(v.psf), 284, px(v.psf), 316);
    if (!v.cap) marker(ctx, "PEB", ex(v.peb), 284, ex(v.peb), 316);
    return {
      readouts: [{ label: "families kept", value: `${kept.length} <small>of 9</small>` }],
      verdict: `Kept: ${kept.length ? kept.join(", ") : "none"}.${v.cap ? " PEB is skipped, as the dictionary advises for single-target capture libraries." : ""}`
    };
  }
};

PLATES["ancientness-flag"] = {
  w: 600, h: 240, alt: "Terminal substitution frequency at the 5 prime and 3 prime ends with 95 percent intervals against the 9.5 percent threshold, and the resulting flag.",
  caption: "Wilson 95% interval on synthetic counts. The flag rules are the dictionary's.",
  controls: [
    { id: "lib", type: "select", label: "Library type", options: ["single-stranded", "double-stranded"], value: "single-stranded" },
    { id: "ds", type: "check", label: "<code>--doublestranded</code>", value: false },
    { id: "p5", label: "5′ C→T (%)", min: 0, max: 40, step: 0.5, value: 22, d: 1 },
    { id: "p3", label: "3′ damage (%)", min: 0, max: 40, step: 0.5, value: 18, d: 1 },
    { id: "n", label: "Reads scored per end", min: 10, max: 500, step: 5, value: 80, d: 0 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, X = p => 150 + clamp(p, 0, 45) / 45 * 420;
    const dsLib = v.lib === "double-stranded", mis = dsLib && !v.ds;
    const p3 = mis ? 1 : v.p3;
    const wil = (pp, n) => { const p = pp / 100, z = 1.96, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)); return [Math.max(0, (c - m) / d * 100), Math.min(100, (c + m) / d * 100)]; };
    const rowsA = [["5′ C→T", v.p5, 50], [dsLib ? (v.ds ? "3′ G→A" : "3′ C→T (scored as ss)") : "3′ C→T", p3, 112]];
    line(g, X(9.5), 24, X(9.5), 140, "thr"); T(g, X(9.5) + 4, 20, "9.5%", "dmgt");
    line(g, X(0), 30, X(0), 140, "ax");
    const lows = rowsA.map(([lab, p, y]) => {
      const [lo, hi] = wil(p, v.n);
      T(g, 32, y + 4, lab, "lbl");
      S("path", { d: `M${X(lo)} ${y - 6} V${y + 6} M${X(lo)} ${y} H${X(hi)} M${X(hi)} ${y - 6} V${y + 6}`, class: "brk wide" }, g);
      S("circle", { cx: X(p), cy: y, r: 5.5, class: "inkf" }, g);
      T(g, Math.min(X(hi) + 12, 470), y + 4, `lower ${f(lo, 1)}%`, lo > 9.5 ? "passt" : null);
      return lo;
    });
    [0, 10, 20, 30, 40].forEach(t => T(g, X(t), 160, `${t}%`, null, "middle"));
    const [l5, l3] = lows;
    const flag = l5 > 9.5 && l3 > 9.5 ? "++" : l5 > 0 && l3 > 0 && (l5 > 9.5 || l3 > 9.5) ? "+" : "-";
    T(g, 32, 212, `Ancientness ${flag}`, "big");
    marker(ctx, "Ancientness", 14, 204, 14, 204);
    marker(ctx, "--doublestranded", 14, 112, 14, 112);
    return {
      readouts: [],
      verdict: `Flag <b>${flag}</b>.${mis && l5 > 9.5 ? " This is a double-stranded library run without --doublestranded, so the 3′ end shows no C→T and the flag reads '-'. Judge it on the 5′ lower bound instead, which clears 9.5%." : ""}`
    };
  }
};

PLATES["species-within-family"] = {
  w: 600, h: 300, alt: "kallisto estimated counts across five reference species in one family, the top pick highlighted, and the abundance threshold X.",
  caption: "Synthetic family with five reference mitogenomes. X is calibrated per reference and read tier in practice; here it is a slider.",
  controls: [
    { id: "n", label: "Reads in the family bin", min: 100, max: 1000, step: 50, value: 250, d: 0 },
    { id: "d", label: "Sample's distance to the nearest reference", min: 0, max: 1, step: 0.05, value: 0.2, d: 2 },
    { id: "X", label: "<code>X</code> abundance threshold", min: 0, max: 1, step: 0.01, value: 0.5, d: 2 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, top = 0.92 - 0.62 * v.d, rest = 1 - top;
    const sh = [top, ...[0.5, 0.25, 0.15, 0.1].map(w => w * rest)];
    const bx = s => 130 + s * 380;
    sh.forEach((s, i) => {
      const y = 36 + i * 42, on = i === 0;
      T(g, 30, y + 17, `species ${"ABCDE"[i]}`, on ? "lbl" : null);
      rect(g, 130, y, 380, 24, "ruledf");
      rect(g, 130, y, bx(s) - 130, 24, on ? "readink" : "read");
      T(g, bx(s) + 6, y + 17, f(s * v.n, 1), "mono");
    });
    line(g, bx(v.X), 26, bx(v.X), 248, "thr"); T(g, bx(v.X) + 4, 262, `X = ${f(v.X, 2)}`, "dmgt");
    T(g, 30, 290, "kallisto index -k 21 · quant --single (fragment length estimated from reads)", "mono");
    marker(ctx, "est_counts", bx(sh[0]) - 4, 48, Math.min(bx(sh[0]) + 66, 588), 22);
    marker(ctx, "abundance threshold X", bx(v.X), 26, bx(v.X) - 18, 14);
    const close = top > v.X;
    return {
      readouts: [
        { label: "top share", value: f(top, 2) },
        { sym: "est_counts", label: "top est_counts", value: f(top * v.n, 1) },
        { sym: "abundance threshold X", label: "above X", value: ok(close, "yes", "no") }
      ],
      verdict: `The top pick takes <b>${f(top, 2)}</b> of the family's reads${close ? ", above X: closely related to species A" : ", below X: not closely related at this threshold"}.`
    };
  }
};

PLATES["alignment-filter"] = {
  w: 600, h: 300, alt: "Three reads, each with four alignments placed on an ANI axis; alignments outside the ANI bounds or not chosen by the mode are greyed out.",
  caption: "Synthetic reads and alignments. Order of operations from unicorn 2.5.2 (unicorn_alnfilt.c).",
  controls: [
    { id: "mode", type: "select", label: "<code>--mode</code>", options: ["ALLTOP", "RNDTOP", "PCTTOP", "ALL"], value: "ALLTOP" },
    { id: "pct", label: "<code>--pct</code>", min: 0.8, max: 1, step: 0.005, value: 0.9, d: 3 },
    { id: "lo", label: "<code>--minani</code>", min: 80, max: 100, step: 0.5, value: 90, d: 1 },
    { id: "hi", label: "<code>--maxani</code>", min: 90, max: 100, step: 0.5, value: 100, d: 1 },
    { id: "strict", type: "check", label: "<code>--strictbounds</code>", value: false }
  ],
  draw(ctx, v) {
    const g = ctx.svg, R = [[99, 99, 96.5, 91], [100, 96, 93.5, 88], [95, 92.5, 89, 86]], refs = "abcd";
    const ax = a => 110 + (clamp(a, 84, 100) - 84) / 16 * 470;
    T(g, 20, 20, "alignment ANI, %", "lbl");
    line(g, 110, 40, 580, 40, "ax");
    [84, 88, 92, 96, 100].forEach(t => T(g, ax(t), 58, String(t), null, "middle"));
    rect(g, ax(v.lo), 32, ax(Math.max(v.lo, v.hi)) - ax(v.lo), 16, "hlf");
    let keptAll = [], readsKept = 0;
    R.forEach((alns, r) => {
      const y = 92 + r * 66;
      let inb = alns.map(a => a >= v.lo && a <= v.hi);
      if (v.strict && inb.some(b => !b)) inb = inb.map(() => false);
      const max = Math.max(0, ...alns.filter((a, i) => inb[i]));
      let keep = alns.map((a, i) => inb[i] && (v.mode === "ALL" ? true : v.mode === "PCTTOP" ? a >= max * v.pct : a === max));
      if (v.mode === "RNDTOP") { const first = keep.indexOf(true); keep = keep.map((k, i) => i === first); }
      T(g, 20, y + 4, `read ${r + 1}`, "lbl");
      line(g, 110, y, 580, y, "grid");
      alns.forEach((a, i) => {
        const tie = alns.indexOf(a) !== i, x = ax(a) + (tie ? 20 : 0);
        S("circle", { cx: x, cy: y, r: 9, class: keep[i] ? "inkf" : inb[i] ? "ringc" : "ringc faint" }, g);
        T(g, x, y + 4, refs[i], keep[i] ? "onband mono" : "mono", "middle");
        if (!tie) T(g, x + (alns.indexOf(a) !== alns.lastIndexOf(a) ? 10 : 0), y + 24, alns.indexOf(a) !== alns.lastIndexOf(a) ? `${f(a, 1)} (tie)` : f(a, 1), null, "middle");
        if (keep[i]) keptAll.push(a);
      });
      if (keep.some(Boolean)) readsKept++;
      const n = keep.filter(Boolean).length;
      T(g, 580, y - 14, inb.every(b => !b) ? "read removed" : `${n} of 4 kept`, inb.every(b => !b) ? "dmgt" : null, "end");
      if (r === 0 && v.mode === "PCTTOP" && max) { line(g, ax(max * v.pct), y - 12, ax(max * v.pct), y + 12, "thr"); }
    });
    T(g, 40, 290, v.mode === "RNDTOP" ? "RNDTOP picks one tied best alignment at random; the first is shown." : v.mode === "PCTTOP" ? `PCTTOP keeps ANI ≥ ${f(v.pct, 3)} × the read's best (dashed line, read 1).` : v.mode === "ALL" ? "ALL keeps every alignment inside the bounds." : "ALLTOP keeps every alignment tied for the read's best ANI.");
    marker(ctx, "--minani / --maxani", ax((v.lo + Math.max(v.lo, v.hi)) / 2), 32, ax((v.lo + Math.max(v.lo, v.hi)) / 2) + 20, 14);
    marker(ctx, "--mode (alnfilt)", 36, 286, 20, 286);
    marker(ctx, "--pct (alnfilt)", ax(99 * v.pct), 80, Math.max(ax(99 * v.pct) - 26, 96), 70);
    marker(ctx, "--strictbounds", 74, 156, 92, 146);
    const m = keptAll.length ? keptAll.reduce((a, b) => a + b) / keptAll.length : 0;
    return {
      readouts: [
        { sym: "mean_alnani / stdev_alnani / median_alnani", label: "mean ANI of kept", value: keptAll.length ? `${f(m, 2)}%` : "—" },
        { label: "alignments kept", value: `${keptAll.length} <small>of 12</small>` },
        { label: "reads kept", value: `${readsKept} <small>of 3</small>` }
      ],
      verdict: `${keptAll.length} of 12 alignments and ${readsKept} of 3 reads pass. ${v.strict ? "With --strictbounds, any alignment outside the bounds removes its whole read." : "Without --strictbounds, only the out-of-bounds alignments are removed."}`
    };
  }
};

PLATES["reference-filters"] = {
  w: 600, h: 300, alt: "Eight synthetic references with their length, reads kept after the dust filter, mean ANI and whether each is reported.",
  caption: "Synthetic references. --minmani is a taxstats filter on mean ANI per taxid; it is shown per reference here.",
  controls: [
    { id: "dust", label: "<code>--maxdust</code>", min: 0, max: 100, step: 1, value: 100, d: 0 },
    { id: "reads", label: "<code>--minreads</code>", min: 1, max: 300, step: 1, value: 1, d: 0 },
    { id: "len", label: "<code>--minreflen</code> (bp)", min: 1, max: 20000, step: 100, value: 1, d: 0 },
    { id: "mani", label: "<code>--minmani</code> (%)", min: 0, max: 100, step: 0.5, value: 0, d: 1 }
  ],
  init() { const R = rng(53); this.D = [420, 260, 180, 120, 90, 60, 35, 12].map((n, i) => Array.from({ length: n }, () => Math.min(100, -Math.log(1 - R()) * [6, 8, 30, 10, 45, 7, 12, 20][i]))); },
  draw(ctx, v) {
    const g = ctx.svg, L = [16569, 16700, 4200, 18000, 2500, 16400, 900, 16600], A = [99.1, 97.8, 95.2, 96.6, 92.4, 98.5, 94.0, 96.9];
    T(g, 20, 22, "reference", "lbl"); T(g, 120, 22, "length", "lbl"); T(g, 200, 22, "reads after --maxdust", "lbl"); T(g, 410, 22, "mean ANI", "lbl"); T(g, 490, 22, "reported", "lbl");
    let nA = 0, nR = 0;
    this.D.forEach((dust, i) => {
      const y = 40 + i * 30, kept = dust.filter(d => d <= v.dust).length;
      const okR = kept >= v.reads, okL = L[i] >= v.len, okM = A[i] >= v.mani, ok = okR && okL && okM && kept > 0;
      T(g, 20, y + 12, `ref ${i + 1}`);
      T(g, 120, y + 12, int(L[i]), okL ? "mono" : "mono dmgt");
      rect(g, 200, y + 2, 160, 12, "ruledf");
      rect(g, 200, y + 2, 160 * kept / 420, 12, okR ? "readink" : "read");
      T(g, 366, y + 12, String(kept), "mono");
      T(g, 410, y + 12, `${f(A[i], 1)}%`, okM ? "mono" : "mono dmgt");
      T(g, 490, y + 12, ok ? "yes" : !okL ? "too short" : !okR ? "too few reads" : "low ANI", ok ? "lbl passt" : "dmgt");
      if (ok) { nA++; nR += kept; }
    });
    line(g, 200 + 160 * v.reads / 420, 34, 200 + 160 * v.reads / 420, 282, "thr");
    marker(ctx, "--maxdust", 328, 18, 344, 18);
    marker(ctx, "--minreads (unicorn)", 200 + 160 * v.reads / 420, 282, 200 + 160 * v.reads / 420, 292);
    marker(ctx, "--minreflen", 164, 16, 184, 12);
    marker(ctx, "--minmani", 474, 16, 478, 12);
    return {
      readouts: [
        { label: "references reported", value: `${nA} <small>of 8</small>` },
        { sym: "num_alns / num_reads", label: "num_reads (reported)", value: int(nR) }
      ],
      verdict: `${nA} of 8 references are reported. Lowering --maxdust removes low-complexity reads first, which can push a reference below --minreads.`
    };
  }
};

PLATES["taxonomy-tags"] = {
  w: 600, h: 250, alt: "A reference's lineage from species to domain, with the XT tag on the species and the XR tag on the rank chosen with --rank, and the resulting BAM tags.",
  caption: "Example lineage (cattle). Tags are written by refstats when --acc2tax, --names and --nodes are given.",
  controls: [{ id: "rank", type: "select", label: "<code>--rank</code>", options: ["species", "genus", "family", "order", "class", "phylum", "kingdom", "domain"], value: "genus" }],
  draw(ctx, v) {
    const g = ctx.svg, ranks = ["species", "genus", "family", "order", "class", "phylum", "kingdom", "domain"];
    const names = ["Bos taurus", "Bos", "Bovidae", "Artiodactyla", "Mammalia", "Chordata", "Metazoa", "Eukaryota"];
    const ri = ranks.indexOf(v.rank);
    ranks.forEach((r, i) => {
      const x = 20 + i * 72, on = i === ri, xt = i === 0;
      rect(g, x, 40, 66, 52, on ? "boxdark" : "ruled", { rx: 4 });
      T(g, x + 33, 60, r, on ? "onband" : null, "middle");
      T(g, x + 33, 80, names[i].length > 10 ? names[i].slice(0, 9) + "…" : names[i], on ? "onband lblw" : "lbl", "middle");
      if (i) arrow(g, [[x - 5, 66], [x - 1, 66]]);
      if (xt) T(g, x + 33, 112, "XT", "mono", "middle");
      if (on) T(g, x + 33, 112 + (xt ? 18 : 0), "XR", "mono dmgt", "middle");
    });
    T(g, 20, 168, "BAM record after refstats:", "lbl");
    rect(g, 20, 180, 560, 34, "ruled", { rx: 4 });
    T(g, 32, 202, `read_0042  …  XT:i:<taxid of Bos taurus>  XR:i:<taxid of ${names[ri]}>`, "mono");
    T(g, 20, 238, "Header line: @CO unicorn:tax-tags XR=rank_taxid rank=" + v.rank, "mono");
    marker(ctx, "--rank / XT / XR", 20 + ri * 72 + 33, 92, 20 + ri * 72 + 33 + (ri === 7 ? -22 : 22), 132);
    return { readouts: [], verdict: `taxstats run on this BAM (sorted with samtools sort -t XR) reports one row per ${v.rank}, with num_accessions and total_length for the references under it.` };
  }
};

PLATES["read-complexity"] = {
  w: 600, h: 280, alt: "Six synthetic reads split into k-mers; duplicated reads and low-complexity reads add few unique k-mers, lowering duplicity, and low-complexity reads raise the dust score.",
  caption: "Synthetic reads of 50 bp. Duplicity and dust here follow the definitions, not Unicorn's exact sdust scoring.",
  controls: [
    { id: "dup", label: "PCR duplicates among reads", min: 0, max: 0.8, step: 0.05, value: 0.2, d: 2 },
    { id: "low", label: "Low-complexity reads", min: 0, max: 0.6, step: 0.05, value: 0.1, d: 2 },
    { id: "k", label: "<code>-k</code> k-mer size", min: 11, max: 31, step: 1, value: 17, d: 0 }
  ],
  draw(ctx, v) {
    const g = ctx.svg, N = 40, L = 50, nk = L - v.k + 1;
    const nLow = Math.round(N * v.low), nDup = Math.round((N - nLow) * v.dup), nUniq = N - nLow - nDup;
    const uniq = nUniq * nk + nLow * Math.min(4, nk), obs = N * nk, dupl = uniq / obs;
    const mdust = (nLow * 82 + (N - nLow) * 4) / N;
    T(g, 20, 20, `${N} reads (first 12 drawn)`, "lbl");
    for (let i = 0; i < 12; i++) {
      const kind = i < Math.round(12 * nUniq / N) ? 0 : i < Math.round(12 * (nUniq + nDup) / N) ? 1 : 2, y = 32 + i * 14;
      rect(g, 20, y, 250, 10, kind === 0 ? "read" : kind === 1 ? "readink" : "dmg", { rx: 2 });
      if (kind === 2) T(g, 276, y + 9, "AAAAAAAAAA…", "mono");
      if (kind === 1) T(g, 276, y + 9, "duplicate", null);
    }
    rect(g, 20, 210, 250 * v.k / L, 8, "boxdark", { rx: 2 }); T(g, 20 + 250 * v.k / L + 6, 218, `one ${v.k}-mer`);
    [["unique k-mers", uniq], ["observed k-mers", obs]].forEach(([lab, val], i) => {
      const y = 60 + i * 50; T(g, 380, y - 8, lab, "lbl"); rect(g, 380, y, 200, 16, "ruledf"); rect(g, 380, y, 200 * val / obs, 16, i ? "read" : "readink"); T(g, 580, y + 30, int(val), "mono", "end");
    });
    T(g, 380, 190, `duplicity = ${f(dupl, 3)}`, "big");
    marker(ctx, "duplicity", 380, 182, 364, 182);
    marker(ctx, "-k / --ksize (unicorn)", 20 + 250 * v.k / L / 2, 218, 20 + 250 * v.k / L / 2, 246);
    marker(ctx, "mdust / stdev_dust", 270, 32 + 13 * 14 / 1.2, 300, 252);
    return {
      readouts: [
        { sym: "duplicity", label: "duplicity", value: f(dupl, 3) },
        { sym: "mdust / stdev_dust", label: "mdust (illustrative)", value: f(mdust, 1) },
        { label: "k-mers per read", value: String(nk) }
      ],
      verdict: `Duplicates and low-complexity reads add k-mers without adding new ones, so duplicity falls to ${f(dupl, 2)}. Low-complexity reads also raise the mean dust score, which is what --maxdust filters on.`
    };
  }
};

PLATES["depth-and-spread"] = {
  w: 600, h: 260, alt: "Depth along a synthetic 2,000 bp reference, with the covered bases marked, as reads are added or clustered.",
  caption: "Synthetic 2,000 bp reference, 60 bp reads. Values are computed from the depth drawn.",
  controls: [
    { id: "n", label: "Reads", min: 5, max: 200, step: 1, value: 40, d: 0 },
    { id: "cl", label: "Clustering", min: 0, max: 1, step: 0.05, value: 0.2, d: 2 }
  ],
  init() { const R = rng(61); this.P = Array.from({ length: 200 }, () => ({ u: R(), c: R(), w: R(), o: R() + R() + R() - 1.5 })); },
  draw(ctx, v) {
    const g = ctx.svg, G = 2000, L = 60, depth = new Uint16Array(G);
    for (let k = 0; k < v.n; k++) { const p = this.P[k]; const pos = Math.round(clamp(p.c < v.cl ? (p.w < 0.5 ? 520 : 1380) + p.o * 110 : p.u * (G - L), 0, G - L)); for (let i = pos; i < pos + L; i++) depth[i]++; }
    let mx = 1; depth.forEach(d => { if (d > mx) mx = d; });
    const X = i => 20 + i / G * 560, Y = d => 196 - d / mx * 150;
    let pts = `20,196`; for (let i = 0; i < G; i += 5) pts += ` ${X(i)},${Y(depth[i])}`; pts += ` 580,196`;
    S("polygon", { points: pts, class: "read" }, g);
    line(g, 20, 196, 580, 196, "ax");
    let s = -1; for (let i = 0; i <= G; i++) { const c = i < G && depth[i] > 0; if (c && s < 0) s = i; if (!c && s >= 0) { rect(g, X(s), 204, X(i) - X(s), 8, "inkf"); s = -1; } }
    T(g, 20, 20, `depth (max ${mx}×)`, "lbl"); T(g, 580, 240, "covered bases (≥ 1×)", null, "end");
    let cov = 0, sum = 0, sq = 0; depth.forEach(d => { if (d) { cov++; sum += d; sq += d * d; } });
    const meanCov = sum / G, mOn = cov ? sum / cov : 0, sdOn = cov ? Math.sqrt(Math.max(0, sq / cov - mOn * mOn)) : 0, even = mOn ? sdOn / mOn : 0;
    marker(ctx, "mean_cov / num_covbases", 300, 212, 300, 236);
    marker(ctx, "evenness_cov", 20 + 0.27 * 560, Y(depth[540]), 20 + 0.27 * 560 + 30, Math.max(Y(depth[540]) - 30, 30));
    return {
      readouts: [
        { sym: "mean_cov / num_covbases", label: "mean_cov", value: `${f(meanCov, 2)}×` },
        { sym: "mean_cov / num_covbases", label: "num_covbases", value: int(cov) },
        { sym: "site_density", label: "site_density", value: f(1000 * cov / G, 0) },
        { sym: "evenness_cov", label: "evenness_cov", value: f(even, 2) }
      ],
      verdict: `${int(cov)} of 2,000 bases are covered. On those bases depth varies by ${f(even, 2)}× its mean (evenness_cov), which rises as reads cluster.`
    };
  }
};

/* ---------- rendering ---------- */
let lit = null;
const main = $("#main"), tabs = $("#tabs");
const wfChip = (wf, href) => {
  const ch = wf === "patho" ? "pathopipe" : wf === "phynder" ? "pathphynder" : wf === "quick" ? "quicksand" : wf;
  const here = CHAPTERS.some(c => c.id === ch);
  return h(here || href ? "a" : "span", { class: "wf-chip", href: here || href ? (href || "#ch-" + ch) : null, style: `--tab: var(${WF_TAB[wf]})` }, h("i"), D.workflows[wf].name);
};
const flagIcon = () => { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 16 16"); s.setAttribute("aria-hidden", "true"); s.innerHTML = '<path d="M8 1.8 14.6 13.6H1.4Z" stroke-linejoin="round"/><path d="M8 6.4v3.4M8 11.6v.4" stroke-linecap="round"/>'; return s; };

/* lift the dictionary's own threshold wording, verbatim */
function thresholdOf(def) {
  const pats = [/Thresholds?:\s*([^]*?)\.?$/, /Hit:\s*([^]*?)\.?$/, /hit requires\s*([^;]*?)\.?$/, /Authentication filter\s*([^;]*?)\.?$/, /^P\(h \| o\) per hypothesis\.\s*([^]*?)\.?$/, /Depth-aware hit rule:\s*([^]*?)\.?$/];
  for (let i = 0; i < pats.length; i++) { const m = def.match(pats[i]); if (m) return { v: m[1].trim(), cut: i === 4 ? m[1] : m[0] }; }
  return null;
}
function renderAccount(a) {
  const art = h("article", { class: "account", id: a.id, "data-acc": a.id });
  const plateCol = h("div", { class: "plate-col" });
  const textCol = h("div", { class: "text-col" });
  textCol.append(h("h3", {}, a.title), h("p", { class: "ident", html: a.ident }));
  const ol = h("ol", { class: "marks" });
  a.items.forEach(([sym]) => {
    const r = bySym.get(sym), n = a.num[sym];
    const others = r.wf.filter(w => !a.ch.wf.includes(w) || a.ch.id === "shared");
    const facts = h("dl", { class: "mk-facts" });
    const th = thresholdOf(r.def);
    if (th) facts.append(h("div", { class: "thr-fact" }, h("dt", {}, "Threshold"), h("dd", {}, th.v)));
    const defText = th ? r.def.replace(th.cut, "").trim().replace(/[;,]$/, ".").replace(/\.\s*\.$/, ".") : r.def;
    if (r.range) facts.append(h("div", {}, h("dt", {}, "Default / range"), h("dd", {}, r.range)));
    if (r.units) facts.append(h("div", {}, h("dt", {}, "Units"), h("dd", {}, r.units)));
    if (r.aliases) facts.append(h("div", {}, h("dt", {}, "Also written"), h("dd", {}, r.aliases)));
    const li = h("li", { id: r.slug, "data-sym": sym },
      h("span", { class: "num" + (n ? "" : " none"), "aria-hidden": "true" }, n ? String(n) : ""),
      h("div", {},
        h("div", { class: "mk-head" }, h("code", { class: "mk-sym" }, r.symbol), h("span", { class: "mk-name" }, r.name), h("span", { class: "mk-kind" }, r.kind)),
        h("p", { class: "mk-def" }, defText),
        facts.children.length ? facts : null,
        r.unverified ? h("p", { class: "mk-flag" }, flagIcon(), typeof r.unverified === "string" ? r.unverified : "Interpretation not yet verified on data") : null,
        r.updated ? h("p", { class: "mk-src" }, `Updated from ${r.updated}; the dictionary row is not yet updated.`) : null,
        r.note ? h("p", { class: "mk-src" }, r.note) : null,
        r.wf.length > 1 || a.ch.id === "shared" ? h("p", { class: "mk-facts" }, h("span", { class: "also" }, h("span", { class: "mk-kind" }, "Reported by"), ...r.wf.map(w => wfChip(w)))) : null
      ));
    if (!n) li.title = "Not drawn on the plate";
    ol.append(li);
  });
  textCol.append(ol);
  plateCol.append(renderPlate(a));
  art.append(plateCol, textCol);
  return art;
}

function renderPlate(a) {
  const p = PLATES[a.id], fig = h("figure", { class: "plate" });
  if (p.init) p.init();
  const svg = S("svg", { class: "fig", viewBox: `0 0 ${p.w} ${p.h}`, role: "group", "aria-label": `Plate ${a.plateNo}: ${p.alt}` });
  const ctrls = h("div", { class: "ctrls" }), ro = h("dl", { class: "readouts" }), verdict = h("p", { class: "verdict" }), say = h("p", { class: "sr-only", "aria-live": "polite" });
  let sayT = 0, ready = false;
  const state = {};
  p.controls.forEach(c => {
    state[c.id] = c.value;
    const id = `${a.id}-${c.id}`;
    if (c.type === "check") {
      const inp = h("input", { type: "checkbox", id }); inp.checked = c.value;
      inp.addEventListener("change", () => { state[c.id] = inp.checked; draw(); });
      ctrls.append(h("div", { class: "ctrl check" }, inp, h("label", { for: id, html: c.label })));
    } else if (c.type === "select") {
      const sel = h("select", { id }, ...c.options.map(o => h("option", { value: o }, o))); sel.value = c.value;
      sel.addEventListener("change", () => { state[c.id] = sel.value; draw(); });
      ctrls.append(h("div", { class: "ctrl" }, h("label", { for: id, html: c.label }), sel));
    } else {
      const out = h("output", { for: id, "aria-hidden": "true" }, f(c.value, c.d));
      const inp = h("input", { type: "range", id, min: c.min, max: c.max, step: c.step, value: c.value });
      inp.setAttribute("aria-valuetext", f(c.value, c.d));
      inp.addEventListener("input", () => { state[c.id] = +inp.value; out.textContent = f(inp.value, c.d); inp.setAttribute("aria-valuetext", f(inp.value, c.d)); draw(); });
      ctrls.append(h("div", { class: "ctrl" }, h("label", { for: id, html: c.label }), out, inp));
    }
  });
  const marks = S("g", { class: "marks-layer" });
  function draw() {
    svg.textContent = "";
    const ctx = { svg: S("g", {}, svg), marks, acc: a };
    marks.textContent = "";
    const res = p.draw(ctx, state);
    svg.appendChild(marks);
    ro.textContent = "";
    (res.readouts || []).forEach(r => {
      const n = r.sym ? a.num[r.sym] : null;
      ro.append(h("div", { class: "ro", "data-sym": r.sym || null },
        h("span", { class: "dot" + (n ? "" : " none"), "aria-hidden": "true" }, n ? String(n) : ""),
        h("dt", {}, r.label), h("dd", { html: r.value })));
    });
    ro.hidden = !(res.readouts || []).length;
    verdict.innerHTML = res.verdict || "";
    if (lit && lit.acc === a.id) light(a.id, lit.sym);
    const ms = [...marks.querySelectorAll(".mark")];
    const act = ms.some(m => m.getAttribute("data-sym") === a.activeSym) ? a.activeSym : ms[0] && ms[0].getAttribute("data-sym");
    ms.forEach(m => m.setAttribute("tabindex", m.getAttribute("data-sym") === act ? "0" : "-1"));
    if (ready) { clearTimeout(sayT); sayT = setTimeout(() => { say.textContent = verdict.textContent; }, 700); }
    ready = true;
  }
  fig.append(h("div", { class: "svgwrap" }, svg));
  if (p.controls.length) {
    const reset = h("button", { type: "button", class: "reset" }, "Reset to defaults");
    reset.addEventListener("click", () => {
      p.controls.forEach(c => { state[c.id] = c.value; const el = document.getElementById(`${a.id}-${c.id}`); if (c.type === "check") el.checked = c.value; else el.value = c.value; const o = el.parentElement.querySelector("output"); if (o) o.textContent = f(c.value, c.d); });
      draw();
    });
    fig.append(ctrls, reset);
  }
  fig.append(ro, verdict, say, h("figcaption", {}, h("b", {}, `Plate ${a.plateNo}`), h("span", {}, p.caption)));
  draw();
  return fig;
}

CHAPTERS.forEach(ch => {
  const accs = ch.accounts.map(id => ACCOUNTS[id]);
  const nEntries = accs.reduce((t, a) => t + a.items.length, 0);
  const sec = h("section", { class: "chapter", id: "ch-" + ch.id, style: `--chc: var(${ch.tab})`, "aria-labelledby": "h-" + ch.id });
  const wfLinks = (REPOS[ch.id] || []).map(([label, url]) => h("a", { href: url, target: "_blank", rel: "noopener" }, label));
  const meta = h("div", { class: "ch-meta" }, h("div", {}, `${accs.length} account${accs.length > 1 ? "s" : ""} · ${nEntries} entries`), wfLinks.length ? h("div", {}, "GitHub: ", ...wfLinks.flatMap((l, i) => (i ? [" · ", l] : [l]))) : null);
  sec.append(h("header", { class: "ch-head" }, h("div", {}, h("h2", { id: "h-" + ch.id }, ch.name), h("p", {}, ch.desc)), meta));
  const body = h("div", { class: "ch-body" });
  accs.forEach(a => body.append(renderAccount(a)));
  sec.append(body);
  main.append(sec);
  tabs.append(h("a", { class: "tab", href: "#ch-" + ch.id, style: `--tab: var(${ch.tab})`, "data-ch": ch.id }, ch.short, h("span", { class: "n" }, String(nEntries))));
});
tabs.append(h("a", { class: "tab checklist", href: "#checklist", "data-ch": "checklist" }, "Checklist", h("span", { class: "n" }, String(rows.length))));

/* checklist */
(() => {
  const sec = h("section", { class: "chapter", id: "checklist", "aria-labelledby": "h-checklist" });
  const filter = h("div", { class: "cl-filter", role: "group", "aria-label": "Filter by workflow" });
  let active = null;
  const btns = (SCOPE ? [] : [["all", "All"], ...Object.keys(D.workflows).map(w => [w, D.workflows[w].name])]).map(([w, label]) => {
    const b = h("button", { type: "button", "aria-pressed": w === "all" ? "true" : "false", style: w === "all" ? null : `--tab: var(${WF_TAB[w]})` }, w === "all" ? null : h("i"), label);
    b.addEventListener("click", () => { active = w === "all" ? null : w; btns.forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false")); fill(); });
    filter.append(b); return b;
  });
  sec.append(h("header", { class: "cl-head" }, h("div", {}, h("h2", { id: "h-checklist" }, "Checklist"), h("p", {}, `All ${rows.length} ${SCOPE ? "entries in this guide" : "dictionary entries"}, A–Z. Each links to the account that draws or lists it.`)), filter));
  const tbody = h("tbody");
  const table = h("table", { class: "cl" }, h("thead", {}, h("tr", {}, ...["Symbol", "Full name", "Kind", "Default / range", "Workflow", "Account"].map(t => h("th", { scope: "col" }, t)))), tbody);
  sec.append(h("div", { class: "table-wrap" }, table));
  const sorted = [...rows].sort((a, b) => a.symbol.replace(/^[-*.]+/, "").localeCompare(b.symbol.replace(/^[-*.]+/, ""), "en", { sensitivity: "base" }));
  function fill() {
    tbody.textContent = "";
    sorted.filter(r => !active || r.wf.includes(active)).forEach(r => {
      tbody.append(h("tr", { "data-slug": r.slug },
        h("td", { class: "sym" }, r.symbol), h("td", {}, r.name), h("td", { class: "kind" }, r.kind), h("td", { class: "rng" }, r.range || "—"),
        h("td", {}, h("span", { class: "also" }, ...r.wf.map(w => wfChip(w)))),
        h("td", { class: "pl" }, h("a", { href: "#" + r.slug }, `Plate ${r.acc.plateNo} · ${r.acc.title}`))));
    });
  }
  fill();
  main.append(sec);
  main.append(h("p", { class: "foot", html: `Built from the aeDNA dictionary in the lab wiki (snapshot ${D.snapshot}). Plates use synthetic data to show what each parameter does; none of the drawn values are results from a sample. To update, re-export <code>data.js</code> from the dictionary.` }));
})();

const snapDate = new Date(D.snapshot + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
$("#countline").innerHTML = `${rows.length} entries ${SCOPE ? SCOPE.countLabel : `across ${Object.keys(D.workflows).length} workflows`}<span class="cl-snap"> · snapshot ${snapDate}</span>`;
$("#snap").innerHTML = (SCOPE && SCOPE.hideNotion) || !D.source ? `Dictionary snapshot ${snapDate}` : `Dictionary snapshot ${snapDate}<br><a href="${D.source}" target="_blank" rel="noopener">Open in Notion</a>`;

/* ---------- field-mark linking ---------- */
function light(accId, sym) {
  const art = document.getElementById(accId); if (!art) return;
  art.querySelectorAll(".lit").forEach(e => e.classList.remove("lit"));
  if (sym == null) { lit = null; return; }
  lit = { acc: accId, sym };
  art.querySelectorAll(`[data-sym="${CSS.escape(sym)}"]`).forEach(e => { e.classList.add("lit"); if (e.classList.contains("mark") && !e.contains(document.activeElement)) reveal(e); });
}
const target = e => { const el = e.target.closest && e.target.closest("[data-sym]"); const art = el && el.closest(".account"); return el && art ? [art.id, el.getAttribute("data-sym"), el] : null; };
main.addEventListener("mouseover", e => { const t = target(e); if (t) light(t[0], t[1]); });
main.addEventListener("mouseout", e => { const t = target(e); if (t && !(e.relatedTarget && t[2].contains(e.relatedTarget))) light(t[0], null); });
main.addEventListener("focusin", e => { const t = target(e); if (t) light(t[0], t[1]); });
main.addEventListener("focusout", e => { const t = target(e); if (t) light(t[0], null); });
function reveal(m) {
  const wrap = m.closest(".svgwrap"); if (!wrap || wrap.scrollWidth <= wrap.clientWidth + 2) return;
  const wr = wrap.getBoundingClientRect(), mr = m.querySelector("circle.dotc").getBoundingClientRect();
  const pad = 28; let d = 0;
  if (mr.right > wr.right - pad) d = mr.right - wr.right + pad; else if (mr.left < wr.left + pad) d = mr.left - wr.left - pad;
  if (d) wrap.scrollTo({ left: wrap.scrollLeft + d, behavior: reduced ? "auto" : "smooth" });
}
function pulse(art, sym) {
  art.querySelectorAll(`.mark[data-sym="${CSS.escape(sym)}"]`).forEach(m => { reveal(m); m.classList.remove("pulse"); void m.getBoundingClientRect(); m.classList.add("pulse"); setTimeout(() => m.classList.remove("pulse"), 600); });
}
const cue = w => { w.classList.toggle("more", w.scrollLeft + w.clientWidth < w.scrollWidth - 4); w.classList.toggle("less", w.scrollLeft > 4); };
document.querySelectorAll(".svgwrap").forEach(w => { cue(w); w.addEventListener("scroll", () => cue(w), { passive: true }); new ResizeObserver(() => cue(w)).observe(w); });
main.addEventListener("click", e => {
  const m = e.target.closest(".mark"); if (!m) return;
  const art = m.closest(".account"), sym = m.getAttribute("data-sym"), r = bySym.get(sym);
  const li = document.getElementById(r.slug);
  li.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  flash(li); pulse(art, sym);
});
main.addEventListener("keydown", e => {
  const m = e.target.closest && e.target.closest(".mark"); if (!m) return;
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); m.dispatchEvent(new MouseEvent("click", { bubbles: true })); return; }
  const ms = [...m.parentNode.querySelectorAll(".mark")], i = ms.indexOf(m);
  const j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: ms.length - 1 }[e.key];
  if (j == null) return;
  e.preventDefault();
  const next = ms[(j + ms.length) % ms.length], acc = ACCOUNTS[m.closest(".account").id];
  ms.forEach(x => x.setAttribute("tabindex", x === next ? "0" : "-1"));
  acc.activeSym = next.getAttribute("data-sym"); next.focus();
});
function flash(el) { el.classList.remove("found"); void el.offsetWidth; el.classList.add("found"); setTimeout(() => el.classList.remove("found"), 2600); }

/* ---------- navigation ---------- */
function go(slug, smooth = true) {
  const r = rows.find(x => x.slug === slug);
  if (!r) { const el = document.getElementById(slug); if (el) el.scrollIntoView({ block: "start", behavior: smooth && !reduced ? "smooth" : "auto" }); return; }
  const li = document.getElementById(r.slug), art = li.closest(".account");
  const wide = matchMedia("(min-width: 1081px)").matches;
  (wide ? li : art.querySelector(".plate")).scrollIntoView({ block: wide ? "center" : "start", behavior: smooth && !reduced ? "smooth" : "auto" });
  flash(li); light(art.id, K(r)); pulse(art, K(r));
  setTimeout(() => { if (lit && lit.sym === K(r)) light(art.id, null); }, 2600);
}
function onHash(smooth) { const s = decodeURIComponent(location.hash.slice(1)); if (s) go(s, smooth); }
window.addEventListener("hashchange", () => onHash(true));
const open = slug => { if (location.hash === "#" + slug) go(slug); else location.hash = slug; };

/* active tab */
const tabEls = [...tabs.querySelectorAll(".tab")];
const io = new IntersectionObserver(es => {
  es.forEach(e => { if (e.isIntersecting) { const id = e.target.id.replace(/^ch-/, ""); tabEls.forEach(t => t.setAttribute("aria-current", t.dataset.ch === id ? "true" : "false")); } });
}, { rootMargin: "-40% 0px -55% 0px" });
document.querySelectorAll(".chapter").forEach(s => io.observe(s));

/* ---------- search ---------- */
const q = $("#q"), list = $("#results");
const norm = s => (s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const GREEK = { theta: "θ", beta: "β", epsilon: "ε", eps: "ε", pi: "π", phi: "φ", sigma: "σ" };
let hits = [], sel = 0;
function score(r, t) {
  const sym = norm(r.symbol), al = norm(r.aliases), nm = norm(r.name);
  const parts = sym.split(/\s*[\/,]\s*/).concat(al.split(/[\s,;]+/));
  if (parts.includes(t) || sym === t) return 100;
  if (parts.some(p => p.startsWith(t))) return 80;
  if (sym.includes(t)) return 60;
  if (al.includes(t)) return 50;
  if (nm.startsWith(t)) return 45;
  if (nm.includes(t)) return 35;
  if (norm(r.def).includes(t)) return 10;
  return 0;
}
function search() {
  const raw = q.value.trim(), t = norm(GREEK[norm(raw)] || raw);
  list.textContent = "";
  if (!t) { list.hidden = true; q.setAttribute("aria-expanded", "false"); return; }
  hits = rows.map(r => [score(r, t), r]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0] || a[1].symbol.length - b[1].symbol.length).slice(0, 9).map(x => x[1]);
  sel = 0;
  if (!hits.length) {
    list.append(h("li", { class: "empty", role: "option", "aria-disabled": "true" }, `No entry matches “${raw}”. Search covers symbols, aliases and full names, for example fwf, nreads or posterior.`));
  } else hits.forEach((r, i) => {
    const li = h("li", { role: "option", id: "opt-" + i, "aria-selected": i === 0 ? "true" : "false" },
      h("span", { class: "r-sym" }, r.symbol), h("span", { class: "r-name" }, r.name), h("span", { class: "r-wf" }, ...r.wf.map(w => h("span", { class: "wf-chip", style: `--tab: var(${WF_TAB[w]})` }, h("i"), D.workflows[w].name))));
    li.addEventListener("mousedown", e => { e.preventDefault(); choose(i); });
    list.append(li);
  });
  list.hidden = false; q.setAttribute("aria-expanded", "true"); q.setAttribute("aria-activedescendant", hits.length ? "opt-0" : "");
}
function move(d) {
  if (!hits.length) return;
  sel = (sel + d + hits.length) % hits.length;
  [...list.children].forEach((li, i) => li.setAttribute("aria-selected", i === sel ? "true" : "false"));
  q.setAttribute("aria-activedescendant", "opt-" + sel);
  list.children[sel].scrollIntoView({ block: "nearest" });
}
function choose(i) { const r = hits[i]; if (!r) return; list.hidden = true; q.setAttribute("aria-expanded", "false"); q.blur(); open(r.slug); }
const clear = $("#qclear");
const syncClear = () => { clear.hidden = !q.value; };
q.addEventListener("input", () => { syncClear(); search(); });
clear.addEventListener("click", () => { q.value = ""; syncClear(); search(); q.focus(); });
q.addEventListener("focus", () => { if (q.value.trim()) search(); });
q.addEventListener("blur", () => setTimeout(() => { list.hidden = true; q.setAttribute("aria-expanded", "false"); }, 120));
q.addEventListener("keydown", e => {
  if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
  else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
  else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
  else if (e.key === "Escape") { q.value = ""; syncClear(); search(); q.blur(); }
});
document.addEventListener("keydown", e => {
  if (e.key === "/" && document.activeElement !== q && !/input|select|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); q.focus(); q.select(); }
});

/* masthead height for sticky offsets */
const mast = $(".mast");
const setMast = () => document.documentElement.style.setProperty("--mast-h", mast.offsetHeight + "px");
setMast(); new ResizeObserver(setMast).observe(mast);

if (location.hash) setTimeout(() => onHash(false), 120);
})();
