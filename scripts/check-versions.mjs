#!/usr/bin/env node
/**
 * Verify the version chain: frozen trees still hash to their recorded value and
 * versions.json matches versions.meta.mjs. Exits non-zero on any drift.
 */
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chain, formatThaiDate} from '../versions.meta.mjs';
import {assertTreeHash} from '../versions.hash.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const problems = [];

const versionsJsonPath = join(ROOT, 'versions.json');
const versionsJson = existsSync(versionsJsonPath)
  ? JSON.parse(readFileSync(versionsJsonPath, 'utf8'))
  : [];

const snapshots = chain.filter((entry) => entry.kind === 'snapshot');

for (const entry of snapshots) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.released)) {
    problems.push(`${entry.id}: released "${entry.released}" is not YYYY-MM-DD`);
  }
  if (!formatThaiDate(entry.released)) problems.push(`${entry.id}: no Thai release date`);
  if (!existsSync(join(ROOT, entry.docTree))) {
    problems.push(`${entry.id}: missing doc tree ${entry.docTree}`);
    continue;
  }
  try {
    assertTreeHash(entry);
    console.log(`  PASS  ${entry.id} ${entry.treeHash.slice(0, 12)}…`);
  } catch (error) {
    problems.push(error.message);
  }
}

for (const id of versionsJson) {
  if (!snapshots.some((entry) => entry.id === id)) problems.push(`versions.json lists ${id} with no chain entry`);
}
for (const entry of snapshots) {
  if (!versionsJson.includes(entry.id)) problems.push(`chain lists ${entry.id} but versions.json does not`);
}
if (chain.filter((entry) => entry.kind === 'working').length !== 1) {
  problems.push('the chain must have exactly one working entry');
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`  FAIL  ${problem}`);
  console.error(`\n${problems.length} version chain problem(s).`);
  process.exit(1);
}
console.log(`\nVersion chain OK (${snapshots.length} snapshot(s)).`);
