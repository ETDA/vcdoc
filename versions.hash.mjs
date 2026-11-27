/**
 * Integrity checks for frozen doc trees. Kept apart from versions.meta.mjs so
 * that the version chain itself stays importable in the browser bundle.
 */
import {createHash} from 'node:crypto';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {join, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const siteDir = fileURLToPath(new URL('.', import.meta.url));

function listFiles(root) {
  const out = [];
  for (const entry of readdirSync(root)) {
    const path = join(root, entry);
    if (statSync(path).isDirectory()) out.push(...listFiles(path).map((p) => join(entry, p)));
    else out.push(entry);
  }
  return out;
}

/**
 * Content hash of a doc tree: sorted relative path + file bytes.
 * Paths are part of the hash so a rename cannot pass as identical content.
 */
export function hashTree(dir) {
  const root = join(siteDir, dir);
  const digest = createHash('sha256');
  for (const rel of listFiles(root).sort()) {
    digest.update(rel.split(sep).join('/'));
    digest.update('\0');
    digest.update(readFileSync(join(root, rel)));
    digest.update('\0');
  }
  return digest.digest('hex');
}

export function assertTreeHash(entry) {
  if (entry.kind !== 'snapshot') throw new Error(`${entry.id} is not a frozen snapshot`);
  const actual = hashTree(entry.docTree);
  if (actual !== entry.treeHash) {
    throw new Error(
      `frozen tree drift in ${entry.docTree}: recorded ${entry.treeHash}, found ${actual}`,
    );
  }
  return true;
}
