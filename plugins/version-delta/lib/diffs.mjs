/**
 * Diff rendering. Patches are produced at build time and rendered to static
 * HTML by diff2html, so a delta page ships as plain markup with no client fetch.
 */
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {createTwoFilesPatch} = require('diff');
const {html: renderDiff} = require('diff2html');

export function linePatch({fromText, toText, fromName, toName, context = 3}) {
  return createTwoFilesPatch(fromName, toName, fromText ?? '', toText ?? '', '', '', {context});
}

export function countChanges(patch) {
  let added = 0;
  let removed = 0;
  for (const line of patch.split('\n')) {
    if (line.startsWith('+++') || line.startsWith('---')) continue;
    if (line.startsWith('+')) added += 1;
    else if (line.startsWith('-')) removed += 1;
  }
  return {added, removed};
}

export function renderPatch(patch, {outputFormat = 'side-by-side'} = {}) {
  return renderDiff(patch, {drawFileList: false, matching: 'lines', outputFormat});
}

/** Chapter-scale delta: both line counts and the side-by-side HTML. */
export function chapterDiff({fromText, toText, fromName, toName}) {
  const patch = linePatch({fromText, toText, fromName, toName});
  return {
    patch,
    ...countChanges(patch),
    html: renderPatch(patch, {outputFormat: 'side-by-side'}),
  };
}

/**
 * Clause-scale delta: a small hunk around the edit, so a one-word Thai change
 * does not redraw the whole clause.
 */
export function clauseDiff({fromText, toText, fromName, toName}) {
  const patch = linePatch({fromText, toText, fromName, toName});
  const counts = countChanges(patch);
  return {...counts, patch, html: counts.added + counts.removed > 0 ? renderPatch(patch, {outputFormat: 'line-by-line'}) : ''};
}
