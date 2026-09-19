#!/usr/bin/env node
/* =========================================================
   tools/build-study-data.js — regenerates assets/study-data.js

     node tools/build-study-data.js

   Parses every NN-slug.html chapter and emits two globals:

     window.ML_INDEX — the Ctrl+K search index
                       [{ n, f, ti, lv, e: [{ t, a, k }] }]
                       k is 'section' | 'demo' | 'topic' | 'fact'
     window.ML_CARDS — the flashcard deck, built from the quizzes
                       [{ n, ti, f, lv, q, o[], a, w }]

   Anchors must match the ids assets/app.js assigns in buildToc():
   the i-th <h2> in <main class="content"> gets
     's' + (i+1) + '-' + slug(textContent).slice(0, 40)
   so this file reproduces that exactly. Change one, change both.
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'study-data.js');

/* ---------- chapter registry, read from the single source of truth ---------- */
const appJs = fs.readFileSync(path.join(ROOT, 'assets', 'app.js'), 'utf8');
const regBlock = appJs.slice(appJs.indexOf('const CHAPTERS = ['), appJs.indexOf('const LEVELS = ['));
const CHAPTERS = [...regBlock.matchAll(/\{\s*n:\s*(\d+),\s*file:\s*'([^']+)',\s*title:\s*'([^']+)',\s*level:\s*'([^']+)'/g)]
  .map((m) => ({ n: +m[1], file: m[2], title: m[3].replace(/\\'/g, "'"), level: m[4] }));

if (CHAPTERS.length < 2) fail('could not parse CHAPTERS out of assets/app.js — did the registry format change?');

/* ---------- helpers ---------- */
const strip = (html) => html
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

// same slug rule as buildToc() in assets/app.js
const anchorFor = (text, i) =>
  's' + (i + 1) + '-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

// drop a leading section number ("3 · " or "3. ") from a heading
const cleanHeading = (t) => t.replace(/^\d+\s*[·.]\s*/, '').trim();

function mainOf(src, file) {
  const i = src.indexOf('<main class="content">');
  const j = src.lastIndexOf('</main>');
  if (i < 0 || j < 0) fail(`${file}: no <main class="content"> … </main>`);
  return src.slice(i, j);
}

/* ---------- build ---------- */
const index = [];
const cards = [];
let quizWarnings = 0;

for (const ch of CHAPTERS) {
  const p = path.join(ROOT, ch.file);
  if (!fs.existsSync(p)) fail(`${ch.file} is in the registry but not on disk`);
  const body = mainOf(fs.readFileSync(p, 'utf8'), ch.file);

  const entries = [];
  const seen = new Set();
  const add = (t, a, k) => {
    t = t.trim();
    if (!t || t.length > 120) return;
    const key = k + '|' + t.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({ t, a, k });
  };

  // 1. sections — <h2> in document order, which is how app.js numbers anchors
  const h2s = [...body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1]));
  const anchors = h2s.map((t, i) => anchorFor(t, i));
  h2s.forEach((t, i) => add(cleanHeading(t), anchors[i], 'section'));

  // the anchor of the section a given character offset falls inside
  const h2Offsets = [...body.matchAll(/<h2\b[^>]*>/gi)].map((m) => m.index);
  const anchorAt = (pos) => {
    let a = '';
    for (let i = 0; i < h2Offsets.length; i++) if (h2Offsets[i] < pos) a = anchors[i];
    return a;
  };

  // 2. demos — the title of every interactive panel
  for (const m of body.matchAll(/<span class="p-title">([\s\S]*?)<\/span>/gi)) {
    add(strip(m[1]), anchorAt(m.index), 'demo');
  }

  // 3. topics — sub-headings and callout titles
  for (const m of body.matchAll(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi)) {
    const t = strip(m[1]).replace(/^[^\w]+/, '');
    if (!/key takeaways/i.test(t)) add(t, anchorAt(m.index), 'topic');
  }
  for (const m of body.matchAll(/<div class="title">([\s\S]*?)<\/div>/gi)) {
    add(strip(m[1]), anchorAt(m.index), 'topic');
  }

  // 4. facts — the key takeaways, which are the densest one-liners in the course
  const tk = body.match(/<div class="takeaways">([\s\S]*?)<\/div>/i);
  if (tk) for (const m of tk[1].matchAll(/<li>([\s\S]*?)<\/li>/gi)) add(strip(m[1]), anchorAt(body.indexOf('<div class="takeaways">')), 'fact');

  index.push({ n: ch.n, f: ch.file, ti: ch.title, lv: ch.level, e: entries });

  // 5. flashcards — one per quiz block
  const quizzes = [...body.matchAll(/<div class="quiz" data-answer="(\d+)">([\s\S]*?)<div class="explain">([\s\S]*?)<\/div>/gi)];
  if (quizzes.length !== 5) {
    console.warn(`  ! ${ch.file}: found ${quizzes.length} quiz blocks (expected 5)`);
    quizWarnings++;
  }
  for (const q of quizzes) {
    const a = +q[1];
    const inner = q[2];
    const qm = inner.match(/<p class="q">([\s\S]*?)<\/p>/i);
    const opts = [...inner.matchAll(/<button class="opt">([\s\S]*?)<\/button>/gi)].map((m) => strip(m[1]));
    if (!qm || opts.length < 2) { console.warn(`  ! ${ch.file}: skipped a malformed quiz block`); continue; }
    if (a >= opts.length) { console.warn(`  ! ${ch.file}: data-answer=${a} is out of range`); continue; }
    cards.push({ n: ch.n, ti: ch.title, f: ch.file, lv: ch.level, q: strip(qm[1]), o: opts, a, w: strip(q[3]) });
  }
}

/* ---------- emit ---------- */
const out = `/* GENERATED by tools/build-study-data.js — do not edit by hand.
   Re-run \`node tools/build-study-data.js\` after editing any chapter. */
window.ML_INDEX = ${JSON.stringify(index)};
window.ML_CARDS = ${JSON.stringify(cards)};
`;
fs.writeFileSync(OUT, out);

const entryCount = index.reduce((s, c) => s + c.e.length, 0);
console.log(`✓ ${CHAPTERS.length} chapters → ${entryCount} search entries, ${cards.length} flashcards`);
console.log(`  ${path.relative(ROOT, OUT)} (${(Buffer.byteLength(out) / 1024).toFixed(0)} KB)`);
if (quizWarnings) console.log(`  ${quizWarnings} chapter(s) do not have exactly 5 quiz questions`);

function fail(msg) { console.error('✗ study-data build failed: ' + msg); process.exit(1); }
