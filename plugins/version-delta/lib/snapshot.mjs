/**
 * Read a doc tree as a list of chapters. A chapter is one markdown file in the
 * Thai ARF folder; README.md is the folder's landing page and is treated as a
 * chapter so that landing-page edits show up in the delta.
 */
import {readdirSync, readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';

export const CHAPTER_DIR = 'thai-vc-arf';

// Same rule as scripts/validate-build.mjs: a leading "00-" integer prefix is
// stripped, dot-numbered files ("06.5-", "08.1-") keep their prefix.
export const slugFromFilename = (filename) =>
  filename.replace(/\.md$/, '').replace(/^\d+-/, '');

export const chapterSlug = (filename) => (filename === 'README.md' ? 'readme' : slugFromFilename(filename));

export function chapterFiles(docTree) {
  const dir = join(docTree, CHAPTER_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .sort();
}

export function readChapter(docTree, filename) {
  const path = join(docTree, CHAPTER_DIR, filename);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

/** Union of chapter filenames across two trees, sorted. */
export function chapterUnion(fromTree, toTree) {
  return [...new Set([...chapterFiles(fromTree), ...chapterFiles(toTree)])].sort();
}
