/**
 * Single source of truth for the VC Document version chain.
 *
 * Read by docusaurus.config.ts, plugins/version-delta, the theme overrides and
 * scripts/*.mjs. Data only, and free of Node-only imports so the same chain can
 * be read while server-rendering and in the browser bundle. Tree hashing lives
 * in versions.hash.mjs because it needs node:crypto.
 *
 * The chain is ordered oldest → newest and is the only place a version is
 * declared. Everything else (status, drop-down labels, delta pairs) is derived
 * from an entry's position here, so cutting a release means appending one entry.
 */

/**
 * A predecessor published elsewhere (PDF), no snapshot in this repo.
 * @typedef {{kind: 'external', id: string, label: string, released: string, href: string}} ExternalEntry
 * A frozen draft that lives in versioned_docs/.
 * @typedef {{kind: 'snapshot', id: string, label: string, released: string, docTree: string, treeHash: string, summary: string[]}} SnapshotEntry
 * The draft being edited now; it becomes a snapshot when the next version is cut.
 * @typedef {{kind: 'working', id: string, label: string, docTree: string, startedAt: string}} WorkingEntry
 * @typedef {ExternalEntry | SnapshotEntry | WorkingEntry} VersionEntry
 */

/** @type {VersionEntry[]} */
export const chain = [
  {
    kind: 'external',
    id: '1.1',
    label: '1.1',
    released: '2025-01-15',
    href: 'https://www.etda.or.th/getattachment/Our-Service/Digital-Trusted-services-Infrastructure/VC-and-Digital-Document-Wallet/Information/รายงานทางเทคนค-Thai-VC-ARF-v1-1.pdf',
  },
  {
    kind: 'snapshot',
    id: '2.0-draft-0',
    label: '2.0 DRAFT 0',
    released: '2026-10-06',
    docTree: 'versioned_docs/version-2.0-draft-0',
    treeHash: '237b6f43566b2e5e857bee98ca9c8f304b261146f0cf71cd39b97fd7ce3a5258',
    summary: ['รวมบทที่ 0–16 ฉบับร่างแรก', 'ส่วนขยาย 2.0: บท 6.5 และบท 9–14'],
  },
  {
    kind: 'working',
    id: 'current',
    label: '2.0 DRAFT 1',
    docTree: 'docs',
    startedAt: '2026-11-24',
  },
];

/** @param {VersionEntry[]} [entries] @returns {VersionEntry[]} */
export const draftEntries = (entries = chain) => entries.filter((entry) => entry.kind !== 'external');

/** Consecutive (from, to) pairs of draft entries — one delta per pair.
 * @param {VersionEntry[]} [entries]
 * @returns {{from: VersionEntry, to: VersionEntry}[]}
 */
export const pairs = (entries = chain) => {
  const drafts = draftEntries(entries);
  return drafts.slice(1).map((to, index) => ({from: drafts[index], to}));
};

/**
 * Status is never stored: a snapshot followed by a later draft has been
 * replaced, the last draft is the one readers should use.
 * @param {VersionEntry} entry
 */
export function statusOf(entry) {
  if (entry.kind === 'working') return 'กำลังจัดทำ';
  if (entry.kind === 'external') return 'ฉบับก่อนหน้า';
  const drafts = draftEntries();
  const index = drafts.findIndex((draft) => draft.id === entry.id);
  return index >= 0 && index < drafts.length - 1 ? 'ถูกแทนที่' : 'ฉบับปัจจุบัน';
}

// th-TH resolves to the Buddhist calendar, so the year comes out in พ.ศ.
// Noon UTC+7 keeps the date stable for any ISO date string.
const thaiDateFormat = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Asia/Bangkok',
});

export const formatThaiDate = (iso) => thaiDateFormat.format(new Date(`${iso}T12:00:00+07:00`));

/** The `versions` option of @docusaurus/plugin-content-docs.
 * @returns {Record<string, {label: string, path?: string, badge: boolean, banner: 'none' | 'unmaintained'}>}
 */
export function docusaurusVersions() {
  const working = chain.find((entry) => entry.kind === 'working');
  if (!working) throw new Error('versions.meta.mjs: chain has no working entry');
  const versions = {};
  for (const entry of chain) {
    if (entry.kind !== 'snapshot') continue;
    versions[entry.id] = {
      label: `${entry.label} · ${formatThaiDate(entry.released)}`,
      badge: true,
      banner: 'unmaintained',
    };
  }
  versions[working.id] = {
    label: `${working.label} · กำลังจัดทำ`,
    path: '/',
    badge: true,
    banner: 'none',
  };
  return versions;
}
