#!/usr/bin/env node
/**
 * Static validation of the Docusaurus build output (build/).
 *
 * Run AFTER `npm run build`. Verifies:
 *   1. Every source doc produced a generated page (no doc dropped).
 *   2. Locale layout is correct: Thai at the root + /thai-vc-arf/..., English at /en/... .
 *   3. No raw HTML comments leaked into the source (format-conversion regression check).
 *   4. Mermaid diagrams: every top-level mermaid block parses without syntax errors
 *      (using the mermaid parser under jsdom; client-side rendering is covered by E2E).
 *   5. Image integrity: every referenced image exists on disk and no image file is
 *      orphaned (referenced-but-missing or present-but-unused images are both errors).
 *
 * Exits non-zero on the first failure.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = join(ROOT, 'build');
const DOCS = join(ROOT, 'docs');

const failures = [];
const checks = [];
const ok = (msg) => checks.push(`  PASS  ${msg}`);
const fail = (msg) => {
  failures.push(msg);
  checks.push(`  FAIL  ${msg}`);
};

// --- helpers ---------------------------------------------------------------

// Docusaurus default slug: filename without .md, with a leading integer prefix
// ("00-", "01-", ... "16-") stripped. Dot-numbered files ("06.5-", "08.1-",
// "12.1-") keep their prefix. Verified against build/sitemap.xml.
const slugFromFilename = (filename) => filename.replace(/\.md$/, '').replace(/^\d+-/, '');

function mdFiles(dir) {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort();
}

// --- 1. all docs generated -------------------------------------------------

console.log('1. all docs generated');
if (!existsSync(BUILD)) {
  fail(`build/ directory not found — run "npm run build" first`);
} else {
  const thaiDir = join(DOCS, 'thai-vc-arf');
  const enDir = join(DOCS, 'en', 'thai-vc-arf');

  const thaiMd = mdFiles(thaiDir).filter((f) => f !== 'README.md');
  for (const f of thaiMd) {
    const slug = slugFromFilename(f);
    const html = join(BUILD, 'thai-vc-arf', slug, 'index.html');
    if (existsSync(html)) ok(`docs/thai-vc-arf/${f} -> /thai-vc-arf/${slug}/`);
    else fail(`missing page for docs/thai-vc-arf/${f} (expected ${html})`);
  }

  // README.md becomes the Thai category landing page at /thai-vc-arf/
  if (existsSync(join(BUILD, 'thai-vc-arf', 'index.html'))) {
    ok('docs/thai-vc-arf/README.md -> /thai-vc-arf/');
  } else {
    fail('missing Thai category landing page /thai-vc-arf/ (from README.md)');
  }

  for (const f of mdFiles(enDir)) {
    const slug = slugFromFilename(f);
    const html = join(BUILD, 'en', 'thai-vc-arf', slug, 'index.html');
    if (existsSync(html)) ok(`docs/en/thai-vc-arf/${f} -> /en/thai-vc-arf/${slug}/`);
    else fail(`missing page for docs/en/thai-vc-arf/${f}`);
  }
}

// --- 2. locale support -----------------------------------------------------

console.log('2. locale support');
if (existsSync(BUILD)) {
  const readHtml = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');

  const home = readHtml(join(BUILD, 'index.html'));
  if (home.includes('Thai VC ARF')) ok('homepage / serves the Thai index');
  else fail('homepage / does not contain the Thai index title');

  const en = readHtml(join(BUILD, 'en', 'thai-vc-arf', 'minimal-interoperability-reference', 'index.html'));
  if (en.includes("Thailand's VC stack")) ok('English summary served at /en/thai-vc-arf/...');
  else fail('English summary page missing or does not contain its title');

  const thaiPage = readHtml(join(BUILD, 'thai-vc-arf', 'scope', 'index.html'));
  if (thaiPage.includes('ขอบข่าย')) ok('Thai chapter content present (scope page)');
  else fail('Thai chapter page missing expected content');
}

// --- 3. no raw HTML comments (format regression) ---------------------------

console.log('3. format conversion (no raw HTML comments)');
{
  let leaked = 0;
  // A raw "<!--" is only a problem at TOP LEVEL (depth 0). Nested "<!-- ... -->"
  // inside an already-converted {/* ... */} comment is literal text and is fine.
  const topLevelHtmlLines = (text) => {
    const hits = [];
    let depth = 0;
    let i = 0;
    let line = 1;
    while (i < text.length) {
      const ch = text[i];
      if (text.startsWith('{/*', i)) {
        depth += 1;
        i += 3;
      } else if (text.startsWith('*/}', i)) {
        depth = Math.max(0, depth - 1);
        i += 3;
      } else if (text.startsWith('<!--', i) && depth === 0) {
        hits.push(line);
        i += 4;
      } else {
        if (ch === '\n') line += 1;
        i += 1;
      }
    }
    return hits;
  };
  const scan = (dir) => {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const p = join(dir, f);
      const text = readFileSync(p, 'utf8');
      for (const ln of topLevelHtmlLines(text)) {
        leaked += 1;
        fail(`top-level HTML comment in ${p}:${ln}`);
      }
    }
  };
  scan(join(DOCS, 'thai-vc-arf'));
  scan(join(DOCS, 'en', 'thai-vc-arf'));
  if (leaked === 0) ok('no top-level HTML comments in source markdown');
}

// --- 4. mermaid syntax (every top-level block parses) ---------------------

console.log('4. mermaid syntax');
{
  // mermaid's flowchart parser calls DOMPurify.addHook, which needs a DOM.
  // Provide a minimal jsdom window BEFORE dynamically importing mermaid so the
  // flowchart diagram module (lazily loaded on first parse) sees it.
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({ startOnLoad: false });

  // collect top-level ```mermaid blocks (skip those inside {/* */} comments,
  // which are hidden agent metadata, not rendered diagrams)
  const blocks = [];
  const scan = (dir) => {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.md')) continue;
      const p = join(dir, f);
      const lines = readFileSync(p, 'utf8').split('\n');
      let depth = 0;
      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        if (line.trim().startsWith('```mermaid') && depth === 0) {
          const codeLines = [];
          let j = idx + 1;
          while (j < lines.length && !lines[j].trim().startsWith('```')) {
            codeLines.push(lines[j]);
            j += 1;
          }
          blocks.push({ code: codeLines.join('\n'), file: relative(ROOT, p), line: idx + 1 });
          idx = j; // skip to the closing fence
          continue;
        }
        const opens = (line.match(/\{\/\*/g) || []).length;
        const closes = (line.match(/\*\/\}/g) || []).length;
        depth = Math.max(0, depth + opens - closes);
      }
    }
  };
  scan(join(DOCS, 'thai-vc-arf'));
  scan(join(DOCS, 'en', 'thai-vc-arf'));

  if (blocks.length === 0) {
    fail('no mermaid blocks found in source');
  } else {
    let parsed = 0;
    for (const b of blocks) {
      try {
        await mermaid.parse(b.code);
        parsed += 1;
      } catch (e) {
        fail(`mermaid syntax error in ${b.file}:${b.line}: ${e.message.split('\n')[0]}`);
      }
    }
    if (parsed === blocks.length) ok(`${parsed} mermaid diagram(s) all parse cleanly`);
  }
}

// --- 5. image integrity ----------------------------------------------------

console.log('5. image integrity');
{
  const walk = (dir) => {
    const out = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) out.push(...walk(p));
      else out.push(p);
    }
    return out;
  };
  const isImage = (p) => /\.(png|jpe?g|gif|svg|webp)$/i.test(p);

  const allFiles = walk(DOCS);
  const imgFiles = allFiles.filter(isImage);

  const refs = [];
  const refRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  for (const md of allFiles.filter((p) => p.endsWith('.md'))) {
    const text = readFileSync(md, 'utf8');
    let m;
    while ((m = refRe.exec(text)) !== null) {
      if (isImage(m[1])) refs.push({ target: m[1], md });
    }
  }

  // every referenced image resolves to a real file
  let broken = 0;
  const referenced = new Set();
  for (const { target, md } of refs) {
    const abs = resolve(dirname(md), target);
    if (!existsSync(abs)) {
      broken += 1;
      fail(`referenced image missing: ${target} (in ${relative(ROOT, md)})`);
    } else {
      referenced.add(abs);
    }
  }
  if (broken === 0) ok(`${refs.length} image reference(s) all resolve`);

  // no image file is orphaned (present but never referenced)
  const orphans = imgFiles.filter((p) => !referenced.has(p));
  if (orphans.length === 0) ok(`${imgFiles.length} image file(s) all referenced`);
  else for (const o of orphans) fail(`orphan image (never referenced): ${relative(ROOT, o)}`);
}

// --- summary ---------------------------------------------------------------

console.log('\n' + checks.join('\n'));
if (failures.length > 0) {
  console.error(`\n${failures.length} validation failure(s).`);
  process.exit(1);
}
console.log('\nStatic build validation passed.');
