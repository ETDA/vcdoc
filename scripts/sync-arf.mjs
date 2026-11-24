#!/usr/bin/env node
// Copies the Thai VC ARF into this Docusaurus site.
//
// Source of truth is the vc-document repo at a git ref (origin/main by default),
// materialized with `git archive` so no working tree or local commit is touched.
// vc-document keeps Thai under a `th/` locale prefix and uses raw HTML comments;
// Docusaurus needs `docs/thai-vc-arf/` and MDX comments. The rules are in
// .agents/skills/vcdoc-arf-sync/SKILL.md.
//
//   node scripts/sync-arf.mjs                     sync from origin/main into docs/
//   node scripts/sync-arf.mjs --check             report drift, write nothing
//   node scripts/sync-arf.mjs --prune             also delete files the source dropped
//   node scripts/sync-arf.mjs --ref origin/main   pick another git ref
//   ARF_SOURCE=<dir>                              read a plain directory instead
import {readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, copyFileSync, rmSync, statSync, mkdtempSync} from 'node:fs';
import {join, dirname, resolve, relative, basename} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const REPO = resolve(process.env.ARF_REPO ?? join(process.env.HOME, 'code/vc-document'));
const REF = value('--ref', 'origin/main');
const check = flag('--check');
const prune = flag('--prune');
const OUT = resolve(value('--out', join(ROOT, 'docs')));
const LABEL = await currentLabel();

const IMAGE = /\.(png|jpe?g|gif|svg|webp)$/i;
const KEEP = new Set(['_category_.json', '.DS_Store']);

async function currentLabel() {
  const meta = join(ROOT, 'versions.meta.mjs');
  if (!existsSync(meta)) return '2.0 DRAFT 1';
  const {chain} = await import(meta);
  return chain[chain.length - 1].label;
}

// Balanced converter. Mermaid arrows (`P1 --> P2`) and text already inside an
// open comment survive untouched, which a naive replace breaks.
function convertComments(text) {
  const out = [];
  let depth = 0;
  let i = 0;
  while (i < text.length) {
    if (text.startsWith('<!--', i)) {
      out.push(depth === 0 ? '{/*' : '<!--');
      depth += 1;
      i += 4;
    } else if (text.startsWith('-->', i)) {
      out.push(depth === 1 ? '*/}' : '-->');
      depth = Math.max(0, depth - 1);
      i += 3;
    } else {
      out.push(text[i]);
      i += 1;
    }
  }
  if (depth !== 0) throw new Error('unbalanced HTML comments');
  return out.join('');
}

function firstHeading(raw) {
  const line = raw.split('\n').find((l) => l.startsWith('# '));
  return line ? line.slice(2).trim() : '';
}

function withFrontmatter(name, raw) {
  const body = convertComments(raw);
  const description =
    name === 'README.md'
      ? `Thai VC ARF — ${LABEL} — Thai VC ARF ${LABEL}`
      : `${firstHeading(raw)} — Thai VC ARF ${LABEL}`;
  return `---\ndescription: ${JSON.stringify(description)}\n---\n\n${body}`;
}

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => !KEEP.has(f) && statSync(join(dir, f)).isFile());
}

function sourceRoot() {
  if (process.env.ARF_SOURCE) return resolve(process.env.ARF_SOURCE);
  const tmp = mkdtempSync(join(process.env.TMPDIR ?? '/tmp', 'arf-sync-'));
  const tar = join(tmp, 'source.tar');
  execFileSync('git', ['-C', REPO, 'archive', '--format=tar', '-o', tar, REF, 'th/thai-vc-arf', 'en/thai-vc-arf']);
  execFileSync('tar', ['-xf', tar, '-C', tmp]);
  return tmp;
}

const SRC = sourceRoot();
const plan = [];

const thaiSrc = join(SRC, 'th/thai-vc-arf');
const thaiOut = join(OUT, 'thai-vc-arf');
for (const name of files(thaiSrc)) {
  if (!name.endsWith('.md')) continue;
  plan.push({from: join(thaiSrc, name), to: join(thaiOut, name), transform: (raw) => withFrontmatter(name, raw)});
}
for (const name of files(join(thaiSrc, 'images'))) {
  if (!IMAGE.test(name)) continue;
  plan.push({from: join(thaiSrc, 'images', name), to: join(thaiOut, 'images', name), transform: null});
}
const enSrc = join(SRC, 'en/thai-vc-arf');
for (const name of files(enSrc)) {
  if (!name.endsWith('.md')) continue;
  plan.push({from: join(enSrc, name), to: join(OUT, 'en/thai-vc-arf', name), transform: convertComments});
}

if (plan.length === 0) {
  console.error(`no source files at ${REF} in ${REPO}`);
  process.exit(1);
}

const changed = [];
for (const item of plan) {
  const source = readFileSync(item.from);
  const next = item.transform ? item.transform(source.toString('utf8')) : null;
  const before = existsSync(item.to) ? readFileSync(item.to) : null;
  const same = before !== null && (next === null ? before.equals(source) : before.toString('utf8') === next);
  if (same) continue;
  changed.push(relative(ROOT, item.to));
  if (check) continue;
  mkdirSync(dirname(item.to), {recursive: true});
  if (next === null) copyFileSync(item.from, item.to);
  else writeFileSync(item.to, next);
}

const planned = new Set(plan.map((p) => p.to));
const stale = [];
for (const dir of [thaiOut, join(thaiOut, 'images'), join(OUT, 'en/thai-vc-arf')]) {
  const isImageDir = basename(dir) === 'images';
  for (const name of files(dir)) {
    if (!name.endsWith('.md') && !(isImageDir && IMAGE.test(name))) continue;
    const full = join(dir, name);
    if (!planned.has(full)) stale.push(relative(ROOT, full));
  }
}
if (prune && !check) for (const s of stale) rmSync(join(ROOT, s), {force: true});

console.log(`source: ${process.env.ARF_SOURCE ?? `${REF} in ${REPO}`}`);
console.log(`${plan.length} source file(s), ${changed.length} ${check ? 'would change' : 'changed'}`);
for (const f of changed) console.log(`  ~ ${f}`);
if (stale.length > 0) {
  const state = prune && !check ? 'deleted' : 'stale, pass --prune to delete';
  console.log(`${stale.length} file(s) not in source (${state})`);
  for (const f of stale) console.log(`  - ${f}`);
}
