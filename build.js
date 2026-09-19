#!/usr/bin/env node
/* =========================================================
   build.js — bundles the whole course into ONE self-contained
   .html file that runs offline from file:// with no server,
   no build tooling and no dependencies.

     node build.js              -> dist/ml-ai-systems-course.html

   How it works: every page's <style>, <body> markup and inline
   <script> is captured into window.ML_PAGES. A tiny hash router
   swaps them in on navigation and re-runs assets/app.js, so each
   page boots exactly as it does in the multi-file site.
   ========================================================= */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, 'dist');
const OUT_FILE = path.join(OUT_DIR, 'ml-ai-systems-course.html');

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------- 1. collect the pages ---------- */
const pageFiles = fs.readdirSync(ROOT)
  .filter((f) => f.endsWith('.html'))
  .sort((a, b) => (a === 'index.html' ? -1 : b === 'index.html' ? 1 : a.localeCompare(b)));

if (!pageFiles.includes('index.html')) fail('index.html not found — run this from the course root.');

const RE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
const RE_SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

// The blocking <head> snippet every page carries to apply the saved theme before
// first paint. Matched exactly (not by keyword — pages have other theme code) and
// emitted once, in the bundle's own <head>.
const THEME_BOOTSTRAP =
  `try{var t=JSON.parse(localStorage.getItem('ml-theme'));if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

const pages = {};
for (const file of pageFiles) {
  const src = read(file);

  const bodyOpen = src.match(/<body\b([^>]*)>/i);
  if (!bodyOpen) fail(`${file}: no <body> tag`);
  const bodyInner = src.slice(src.indexOf(bodyOpen[0]) + bodyOpen[0].length, src.lastIndexOf('</body>'));

  const chapter = (bodyOpen[1].match(/data-chapter=["']?(\d+)/i) || [])[1] || '';
  const title = (src.match(/<title>([\s\S]*?)<\/title>/i) || [, file])[1].trim();

  // page-local <style> blocks (the shared stylesheet is inlined once, globally)
  const styles = [...src.matchAll(RE_STYLE)].map((m) => m[1]).join('\n');

  // inline <script> blocks, minus the theme bootstrap (hoisted) and external srcs
  const scripts = [];
  let sawBootstrap = false;
  for (const m of src.matchAll(RE_SCRIPT)) {
    if (/\bsrc=/i.test(m[1])) continue;          // assets/app.js, assets/study-data.js
    if (m[2].trim() === THEME_BOOTSTRAP) { sawBootstrap = true; continue; }
    scripts.push(m[2]);
  }
  if (!sawBootstrap) fail(`${file}: theme bootstrap missing or changed — update THEME_BOOTSTRAP in build.js`);

  // strip <script>/<style> out of the markup we replay
  const html = bodyInner.replace(RE_SCRIPT, '').replace(RE_STYLE, '');

  pages[file] = { title, chapter, styles, html, scripts };
}

/* ---------- 2. patch the shared runtime for single-file mode ---------- */
// Three places hard-code multi-file navigation. Each patch asserts, so the
// build fails loudly instead of silently shipping a broken bundle.
let appJs = read('assets/app.js');
appJs = patch(appJs, 'assets/app.js',
  `function go(r) { if (r) location.href = r.f + (r.a ? '#' + r.a : ''); }`,
  `function go(r) { if (r) { close(); ML.go(r.f, r.a); } }`);
appJs = patch(appJs, 'assets/app.js',
  `const here = location.pathname.split('/').pop();`,
  `const here = window.ML_ROUTE || location.pathname.split('/').pop();`);

pages['index.html'].scripts = pages['index.html'].scripts.map((s) => patch(
  s, 'index.html',
  `n.addEventListener('click', () => location.href = ch.file);`,
  `n.addEventListener('click', () => ML.go(ch.file));`,
  /* optional */ true));
if (!pages['index.html'].scripts.some((s) => s.includes('ML.go(ch.file)'))) {
  fail('index.html: architecture-map click handler not found — update the patch in build.js');
}

const css = read('assets/style.css');
const studyData = read('assets/study-data.js');

/* ---------- 3. emit ---------- */
const bundle = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pages['index.html'].title)}</title>
<meta name="author" content="Palak Deb Patra">
<meta name="description" content="Palak Deb Patra's ML &amp; AI Systems Playlist — 52 interactive chapters with live diagrams, simulators and quizzes. Single-file offline edition.">
<script>try{var t=JSON.parse(localStorage.getItem('ml-theme'));if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<style>
${css}
</style>
<style id="ml-page-style"></style>
</head>
<body>
<noscript><p style="font:16px system-ui;padding:40px;max-width:40em;margin:auto">This course is interactive — please enable JavaScript.</p></noscript>

<script>window.ML_PAGES = ${json(pages)};</script>
<script>${studyData}</script>
<script>window.__ML_BOOT = function () {\n${appJs}\n};</script>
<script>${router()}</script>
</body>
</html>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, bundle);

const kb = (Buffer.byteLength(bundle) / 1024 / 1024).toFixed(2);
console.log(`✓ ${pageFiles.length} pages bundled -> ${path.relative(ROOT, OUT_FILE)} (${kb} MB)`);

/* ---------- helpers ---------- */
function fail(msg) { console.error('✗ build failed: ' + msg); process.exit(1); }

function patch(src, where, find, replace, optional) {
  if (!src.includes(find)) {
    if (optional) return src;
    fail(`${where}: could not find the line to patch:\n    ${find}\n  The source changed — update build.js.`);
  }
  return src.split(find).join(replace);
}

function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

// JSON that is safe to sit inside a <script> element: an HTML parser ends the
// script at the first "</script" (and "<!--" opens a comment), so those byte
// sequences are escaped in a way JSON strings still decode identically.
function json(v) {
  const BS = String.fromCharCode(92);        // a literal backslash
  const LT = BS + 'u003C';                   // "<" — valid in both JSON and JS strings
  const LSEP = String.fromCharCode(0x2028);
  const PSEP = String.fromCharCode(0x2029);
  return JSON.stringify(v)
    .split('</').join(LT + '/')
    .split('<!--').join(LT + '!--')
    .split(LSEP).join(BS + 'u2028')
    .split(PSEP).join(BS + 'u2029');
}

function router() { return fs.readFileSync(path.join(ROOT, 'src', 'router.js'), 'utf8'); }
