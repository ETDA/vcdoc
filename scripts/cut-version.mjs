#!/usr/bin/env node
/**
 * Freeze the current working draft as a new snapshot.
 *
 *   npm run version:cut -- "2.0 DRAFT 1"
 *
 * Steps: copy docs/ into versioned_docs/version-<id>/ (docusaurus docs:version),
 * turn the working chain entry into a snapshot of that copy, append a fresh
 * working entry for the next draft, and record the tree hash.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chain, formatThaiDate} from '../versions.meta.mjs';
import {hashTree} from '../versions.hash.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const META = join(ROOT, 'versions.meta.mjs');

const arg = process.argv[2];
if (!arg) {
  console.error('usage: npm run version:cut -- "2.0 DRAFT 1"');
  process.exit(1);
}

const id = arg
  .toLowerCase()
  .replace(/[^a-z0-9.]+/g, '-')
  .replace(/^[-.]+|[-.]+$/g, '');

const versionsJson = JSON.parse(readFileSync(join(ROOT, 'versions.json'), 'utf8'));
if (versionsJson.includes(id) || chain.some((entry) => entry.id === id)) {
  console.error(`version ${id} already exists`);
  process.exit(1);
}

const working = chain.find((entry) => entry.kind === 'working');
if (!working) {
  console.error('versions.meta.mjs has no working entry to freeze');
  process.exit(1);
}
if (working.label !== arg) {
  console.warn(
    `warning: the working entry is labelled "${working.label}", freezing it as "${arg}".`,
  );
}

const today = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Asia/Bangkok'}).format(new Date());

execFileSync('npx', ['docusaurus', 'docs:version', id], {cwd: ROOT, stdio: 'inherit'});

const docTree = `versioned_docs/version-${id}`;
if (!existsSync(join(ROOT, docTree))) {
  console.error(`docs:version reported success but ${docTree} is missing`);
  process.exit(1);
}
const treeHash = hashTree(docTree);

// "2.0 DRAFT 1" -> "2.0 DRAFT 2"; with no trailing number the next draft keeps
// the label and a human has to edit versions.meta.mjs.
const bump = (label) => {
  const match = /^(.*?)(\d+)$/.exec(label);
  return match ? `${match[1]}${Number(match[2]) + 1}` : label;
};
const nextLabel = bump(arg);
if (nextLabel === arg) {
  console.warn(`warning: could not derive the next label from "${arg}" — set it by hand in versions.meta.mjs.`);
}

const quote = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

const snapshotBlock = `  {
    kind: 'snapshot',
    id: '${quote(id)}',
    label: '${quote(arg)}',
    released: '${today}',
    docTree: '${docTree}',
    treeHash: '${treeHash}',
    summary: [],
  }`;

const workingBlock = `  {
    kind: 'working',
    id: 'current',
    label: '${quote(nextLabel)}',
    docTree: 'docs',
    startedAt: '${today}',
  }`;

const source = readFileSync(META, 'utf8');
const start = source.indexOf("  {\n    kind: 'working',");
const endMarker = '\n];';
const end = start >= 0 ? source.indexOf(endMarker, start) : -1;
if (start < 0 || end < 0) {
  console.error('could not locate the working entry in versions.meta.mjs');
  process.exit(1);
}

const rewritten = `${source.slice(0, start)}${snapshotBlock},\n${workingBlock}${source.slice(end)}`;
writeFileSync(META, rewritten);

console.log(`\nFroze "${arg}" as ${id} (${formatThaiDate(today)}).`);
console.log(`hash ${treeHash}`);
console.log(`docs/ continues as ${nextLabel} (working).`);
console.log('Next: fill in summary[] and run npm run versions:check.');
