/**
 * Builds the version history and version-delta routes.
 *
 * Everything is precomputed in contentLoaded: patches are rendered to static
 * HTML, so a delta page needs no client-side fetch and works from the build
 * output alone.
 */
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chain, pairs, statusOf, formatThaiDate} from '../../versions.meta.mjs';
import {CHAPTER_DIR, chapterUnion, readChapter, chapterSlug} from './lib/snapshot.mjs';
import {extractClauses, diffClauses} from './lib/clauses.mjs';
import {chapterDiff, clauseDiff} from './lib/diffs.mjs';

const THEME_PATH = fileURLToPath(new URL('./theme', import.meta.url));
const SITE_DIR = fileURLToPath(new URL('../..', import.meta.url));
const RESERVED_SLUGS = new Set(['clauses']);

const readPath = (entry) => {
  if (entry.kind === 'external') return null;
  return entry.kind === 'working' ? `/${CHAPTER_DIR}/` : `/${entry.id}/${CHAPTER_DIR}/`;
};

const describe = (entry) => ({
  id: entry.id,
  kind: entry.kind,
  label: entry.label,
  released: entry.released ?? entry.startedAt ?? null,
  releasedBE: formatThaiDate(entry.released ?? entry.startedAt),
  status: statusOf(entry),
  summary: entry.summary ?? [],
  href: entry.href ?? null,
  readPath: readPath(entry),
});

// The heading repeats its own number ("3.1. บทบาท…"); show it once.
const displayTitle = (title, key) =>
  title.startsWith(key) ? title.slice(key.length).trim() || title : title;

const clausePayload = (row, file, slug) => ({
  key: row.key,
  fromKey: row.fromKey,
  title: displayTitle(row.title, row.key),
  previousTitle: row.previousTitle,
  status: row.status,
  chapterFile: file,
  chapterSlug: slug,
  fromLine: row.from?.line ?? null,
  toLine: row.to?.line ?? null,
  ...(row.status === 'changed' || row.status === 'renumbered'
    ? clauseDiff({
        fromText: row.from?.body ?? '',
        toText: row.to?.body ?? '',
        fromName: `${row.fromKey} (ก่อน)`,
        toName: `${row.key} (หลัง)`,
      })
    : {added: 0, removed: 0, html: ''}),
});

/** Doc permalinks from every docs plugin instance (allContentLoaded payload). */
function collectDocPaths(content) {
  const out = [];
  for (const pluginContent of Object.values(content ?? {})) {
    for (const instance of Object.values(pluginContent ?? {})) {
      for (const version of instance?.loadedVersions ?? []) {
        for (const doc of version.docs) out.push(doc.permalink);
      }
    }
  }
  return out;
}

export default function versionDeltaPlugin(context) {
  const siteDir = context.siteDir;
  const baseUrl = context.baseUrl;
  const addedRoutePaths = [];

  return {
    name: 'version-delta',

    getThemePath() {
      return THEME_PATH;
    },

    // Route collisions can only be judged against every plugin's docs, which is
    // what allContentLoaded carries (contentLoaded only sees this plugin's).
    allContentLoaded({content}) {
      const docPaths = collectDocPaths(content);
      for (const routePath of addedRoutePaths) {
        for (const docPath of docPaths) {
          if (docPath === routePath || docPath.startsWith(`${routePath}/`)) {
            throw new Error(`version-delta route ${routePath} collides with doc ${docPath}`);
          }
        }
      }
    },

    async contentLoaded({actions: {addRoute, createData}}) {
      const routes = [];

      const historyData = await createData(
        'versions.json',
        JSON.stringify(
          {
            entries: chain.map(describe),
            pairs: pairs().map(({from, to}) => ({from: from.id, to: to.id})),
          },
          null,
          2,
        ),
      );
      routes.push({
        path: `${baseUrl}versions`,
        component: '@site/src/components/VersionHistory/index.tsx',
        exact: true,
        modules: {data: historyData},
      });

      for (const {from, to} of pairs()) {
        const fromTree = join(siteDir, from.docTree);
        const toTree = join(siteDir, to.docTree);
        const pairPath = `/versions/diff/${from.id}__${to.id}`;
        const chapters = [];
        const unchanged = [];
        const clauseRows = [];
        const unchangedClauses = [];

        for (const file of chapterUnion(fromTree, toTree)) {
          const slug = chapterSlug(file);
          if (RESERVED_SLUGS.has(slug)) throw new Error(`chapter ${file} maps to reserved slug ${slug}`);
          const before = readChapter(fromTree, file);
          const after = readChapter(toTree, file);
          if (before === null && after === null) continue;
          if (before === after) {
            unchanged.push({slug, file});
            continue;
          }

          const status = before === null ? 'added' : after === null ? 'removed' : 'changed';
          const diff = chapterDiff({
            fromText: before ?? '',
            toText: after ?? '',
            fromName: `${from.id}/${file}`,
            toName: `${to.id}/${file}`,
          });
          const rows = diffClauses(
            before === null ? [] : extractClauses(before),
            after === null ? [] : extractClauses(after),
          ).map((row) => clausePayload(row, file, slug));

          for (const row of rows) {
            if (row.status === 'unchanged') unchangedClauses.push({key: row.key, title: row.title, chapterSlug: slug});
            else clauseRows.push(row);
          }

          chapters.push({
            slug,
            file,
            status,
            added: diff.added,
            removed: diff.removed,
            clauses: {
              added: rows.filter((row) => row.status === 'added').length,
              removed: rows.filter((row) => row.status === 'removed').length,
              changed: rows.filter((row) => row.status === 'changed').length,
              renumbered: rows.filter((row) => row.status === 'renumbered').length,
            },
            html: diff.html,
            clauseRows: rows,
          });
        }

        const stats = {
          chapters: chapters.length,
          unchanged: unchanged.length,
          added: chapters.reduce((sum, chapter) => sum + chapter.added, 0),
          removed: chapters.reduce((sum, chapter) => sum + chapter.removed, 0),
          clauses: {
            added: clauseRows.filter((row) => row.status === 'added').length,
            removed: clauseRows.filter((row) => row.status === 'removed').length,
            changed: clauseRows.filter((row) => row.status === 'changed').length,
            renumbered: clauseRows.filter((row) => row.status === 'renumbered').length,
          },
        };

        const hubData = await createData(
          `delta-${from.id}__${to.id}.json`,
          JSON.stringify(
            {
              from: describe(from),
              to: describe(to),
              pairPath,
              stats,
              chapters: chapters.map(({clauseRows, html, ...chapter}) => chapter),
              unchanged,
            },
            null,
            2,
          ),
        );
        routes.push({
          path: `${baseUrl}${pairPath.slice(1)}`,
          component: '@site/src/components/DeltaHub/index.tsx',
          exact: true,
          modules: {data: hubData},
        });

        const clausesData = await createData(
          `delta-${from.id}__${to.id}-clauses.json`,
          JSON.stringify(
            {from: describe(from), to: describe(to), pairPath, stats, rows: clauseRows, unchanged: unchangedClauses},
            null,
            2,
          ),
        );
        routes.push({
          path: `${baseUrl}${pairPath.slice(1)}/clauses`,
          component: '@site/src/components/ClauseTable/index.tsx',
          exact: true,
          modules: {data: clausesData},
        });

        for (const chapter of chapters) {
          const data = await createData(
            `delta-${from.id}__${to.id}-${chapter.slug}.json`,
            JSON.stringify(
              {
                from: describe(from),
                to: describe(to),
                pairPath,
                chapter: {slug: chapter.slug, file: chapter.file, status: chapter.status},
                added: chapter.added,
                removed: chapter.removed,
                html: chapter.html,
                clauses: chapter.clauseRows,
                unchangedClauses: unchangedClauses
                  .filter((row) => row.chapterSlug === chapter.slug)
                  .map(({key, title}) => ({key, title})),
              },
              null,
              2,
            ),
          );
          routes.push({
            path: `${baseUrl}${pairPath.slice(1)}/${chapter.slug}`,
            component: '@site/src/components/ChapterDiff/index.tsx',
            exact: true,
            modules: {data},
          });
        }
      }

      for (const route of routes) {
        addedRoutePaths.push(route.path);
        await addRoute(route);
      }
    },
  };
}
