/**
 * Clause extraction: numbered headings (levels 2–4) plus the body that belongs
 * to them, so a delta can be reported per clause instead of per chapter.
 */
import {createHash} from 'node:crypto';

const HEADING = /^(#{2,4})\s+(.+?)\s*#*\s*$/;
const NUMBERED = /^([0-9]+(\.[0-9]+)*\.?|[ก-ฮ]\.\d+\.?)/;

const bodyHash = (lines) => createHash('sha256').update(lines.join('\n').trimEnd()).digest('hex');

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    // \p{M} keeps Thai vowel and tone marks, which are combining characters.
    .replace(/[^\p{L}\p{M}\p{N}.-]/gu, '')
    .replace(/^-+|-+$/g, '');

export function clauseKey(headingText) {
  const firstToken = headingText.trim().split(/\s+/)[0] ?? '';
  if (NUMBERED.test(firstToken)) return firstToken;
  return slugify(headingText);
}

/** @returns {{key: string, title: string, level: number, line: number, body: string, bodyHash: string}[]} */
export function extractClauses(markdown) {
  const lines = markdown.split('\n');
  const clauses = [];
  let inFence = false;
  const used = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = HEADING.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const title = match[2].trim();
    const body = [];
    let scan = index + 1;
    let fence = false;
    while (scan < lines.length) {
      const next = lines[scan];
      if (next.trimStart().startsWith('```')) fence = !fence;
      if (!fence) {
        const nextHeading = HEADING.exec(next);
        if (nextHeading && nextHeading[1].length <= level) break;
      }
      body.push(next);
      scan += 1;
    }

    const baseKey = clauseKey(title);
    let key = baseKey;
    for (let suffix = 2; used.has(key); suffix += 1) key = `${baseKey}#${suffix}`;
    used.add(key);

    clauses.push({
      key,
      title,
      level,
      line: index + 1,
      body: body.join('\n').trim(),
      bodyHash: bodyHash(body),
    });
    index = scan - 1;
  }

  return clauses;
}

/**
 * Pair clauses of two versions: by key first, then by identical body (which is
 * how a renumbered clause is recognised), then the rest are added/removed.
 */
export function diffClauses(fromClauses, toClauses) {
  const fromByKey = new Map(fromClauses.map((clause) => [clause.key, clause]));
  const toByKey = new Map(toClauses.map((clause) => [clause.key, clause]));
  const rows = [];
  const matchedFrom = new Set();
  const matchedTo = new Set();

  for (const clause of toClauses) {
    const previous = fromByKey.get(clause.key);
    if (!previous) continue;
    matchedFrom.add(previous.key);
    matchedTo.add(clause.key);
    rows.push({
      key: clause.key,
      fromKey: previous.key,
      title: clause.title,
      previousTitle: previous.title,
      status: previous.bodyHash === clause.bodyHash ? 'unchanged' : 'changed',
      from: previous,
      to: clause,
    });
  }

  const unmatchedFrom = fromClauses.filter((clause) => !matchedFrom.has(clause.key));
  const unmatchedTo = toClauses.filter((clause) => !matchedTo.has(clause.key));
  const renumberedFrom = new Set();

  for (const clause of unmatchedTo) {
    const sameBody = unmatchedFrom.find(
      (candidate) => !renumberedFrom.has(candidate.key) && candidate.bodyHash === clause.bodyHash,
    );
    if (!sameBody) continue;
    renumberedFrom.add(sameBody.key);
    matchedTo.add(clause.key);
    rows.push({
      key: clause.key,
      fromKey: sameBody.key,
      title: clause.title,
      previousTitle: sameBody.title,
      status: 'renumbered',
      from: sameBody,
      to: clause,
    });
  }

  for (const clause of unmatchedTo.filter((candidate) => !matchedTo.has(candidate.key))) {
    rows.push({key: clause.key, fromKey: null, title: clause.title, previousTitle: null, status: 'added', from: null, to: clause});
  }
  for (const clause of unmatchedFrom.filter((candidate) => !renumberedFrom.has(candidate.key) && !matchedFrom.has(candidate.key))) {
    rows.push({key: clause.key, fromKey: clause.key, title: clause.title, previousTitle: clause.title, status: 'removed', from: clause, to: null});
  }

  return rows;
}
