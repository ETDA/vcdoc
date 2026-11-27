import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {chain} from '../../versions.meta.mjs';

const FRONT_MATTER = /^---\r?\n[\s\S]*?\r?\n---\r?\n/;
const MDX_COMMENT = /\{\/\*[\s\S]*?\*\/\}/g;
const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const MD_LINK = /(!?)\[([^\]]*)\]\(([^()\s]*)(?:\s+"([^"]*)")?\)/g;

const README_ID = 'thai-vc-arf/README';
const FAQ_ID = 'thai-vc-arf/faq';
const MINIMAL_REFERENCE_ID = 'thai-vc-arf/minimal-interoperability-reference';
const THAI_DIR = 'thai-vc-arf/';
const EN_DIR = 'en/';
const STATUS_LABELS = new Map([
  ['ตอบแล้ว', 'answered'],
  ['รอมีมติ', 'pending'],
]);

const workingLabel = () => {
  const entry = chain.find((item) => item.kind === 'working');
  if (!entry) throw new Error('agent-docs: versions.meta.mjs has no working entry');
  return entry.label;
};

const sourcePath = (siteDir, doc) => resolve(siteDir, doc.source.replace(/^@site\//, ''));

const mdUrl = (doc, siteConfig) =>
  doc.permalink.endsWith('/')
    ? `${siteConfig.url}${doc.permalink}index.md`
    : `${siteConfig.url}${doc.permalink}.md`;

const isExternal = (target) => /^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//');

function resolveDocTarget(target, fromDir, docBySource) {
  if (target === '' || target.startsWith('#') || isExternal(target)) return null;
  const [file, ...anchorParts] = target.split('#');
  const doc = docBySource.get(resolve(fromDir, file));
  if (!doc) return null;
  return {doc, anchor: anchorParts.length > 0 ? `#${anchorParts.join('#')}` : ''};
}

function rewriteDocLinks(text, fromDir, docBySource, siteConfig) {
  return text.replace(MD_LINK, (whole, bang, label, target, title) => {
    if (bang) return whole;
    const hit = resolveDocTarget(target, fromDir, docBySource);
    if (!hit) return whole;
    return `[${label}](${mdUrl(hit.doc, siteConfig)}${hit.anchor}${title ? ` "${title}"` : ''})`;
  });
}

const plainText = (markdown) =>
  markdown
    .replace(MD_LINK, (whole, bang, label) => (bang ? '' : label))
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

function injectHead(htmlPath, tag) {
  if (!existsSync(htmlPath)) throw new Error(`agent-docs: missing build file ${htmlPath}`);
  const html = readFileSync(htmlPath, 'utf8');
  if (html.includes(tag)) return;
  if (!html.includes('</head>')) throw new Error(`agent-docs: no </head> in ${htmlPath}`);
  writeFileSync(htmlPath, html.replace('</head>', `${tag}</head>`));
}

function faqTableRows(markdown) {
  const rows = [];
  const lines = markdown.split(/\r?\n/);
  let started = false;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    if (!line.trimStart().startsWith('|')) {
      if (started) break;
      continue;
    }
    started = true;
    const cells = line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    rows.push({cells, line: index + 1});
  }
  return rows;
}

function parseFaq(markdown, faqDoc, docBySource, siteDir, siteConfig) {
  const items = [];
  const seen = new Set();
  const faqDir = dirname(sourcePath(siteDir, faqDoc));
  const table = markdown.replace(MDX_COMMENT, (comment) => comment.replace(/[^\n]/g, ''));
  for (const {cells, line} of faqTableRows(table)) {
    if (cells[0] === 'ข้อ') continue;
    if (cells.every((cell) => /^:?-+:?$/.test(cell))) continue;
    if (cells.length !== 5) {
      throw new Error(`agent-docs: FAQ row at line ${line} (${cells[0] || '?'}) has ${cells.length} cells, expected 5`);
    }
    const [id, question, answer, sectionCell, statusLabel] = cells;
    const status = STATUS_LABELS.get(statusLabel);
    if (!status) {
      throw new Error(
        `agent-docs: FAQ row ${id} has unknown status "${statusLabel}" (expected ${[...STATUS_LABELS.keys()].join(' or ')})`,
      );
    }
    if (seen.has(id)) throw new Error(`agent-docs: duplicate FAQ id ${id} at line ${line}`);
    seen.add(id);
    if (!question || !answer) throw new Error(`agent-docs: FAQ row ${id} has an empty question or answer`);

    const sectionUrls = [];
    const section = sectionCell
      .replace(MD_LINK, (whole, bang, label, target) => {
        if (bang) return whole;
        const hit = resolveDocTarget(target, faqDir, docBySource);
        if (hit) sectionUrls.push(`${mdUrl(hit.doc, siteConfig)}${hit.anchor}`);
        else if (isExternal(target)) sectionUrls.push(target);
        return label;
      })
      .replace(/\s+/g, ' ')
      .trim();

    items.push({
      id,
      question,
      answer: rewriteDocLinks(answer, faqDir, docBySource, siteConfig),
      section,
      sectionUrls,
      status,
      statusLabel,
      url: `${siteConfig.url}${faqDoc.permalink}`,
    });
  }
  if (items.length === 0) throw new Error('agent-docs: FAQ chapter has no data rows');
  return items;
}

function renderLlms(docs, faqDoc, faqItems, siteConfig, baseUrl) {
  const byId = new Map(docs.map((doc) => [doc.id, doc]));
  const link = (doc, suffix = '') => `- [${doc.title}](${mdUrl(doc, siteConfig)})${suffix}`;

  const readme = byId.get(README_ID);
  const minimal = byId.get(MINIMAL_REFERENCE_ID);
  if (!readme || !minimal) throw new Error('agent-docs: README or minimal reference doc missing');

  const chapters = docs
    .filter((doc) => doc.id.startsWith(THAI_DIR))
    .filter((doc) => doc !== readme && doc !== minimal && doc.id !== FAQ_ID)
    .sort((a, b) => (a.sidebarPosition ?? 0) - (b.sidebarPosition ?? 0) || a.id.localeCompare(b.id));

  const english = docs.filter((doc) => doc.id.startsWith(EN_DIR));

  const lines = [
    '# Thai VC ARF',
    '',
    '> Thai Verifiable Credentials Architecture and Reference Framework, published by ETDA.',
    '',
    `Current version: ${workingLabel()}. Use this version unless the question names another one. Frozen drafts are historical.`,
    '',
    '## Overview',
    `- [Thai VC ARF](${mdUrl(readme, siteConfig)}): Index, scope, and reading order.`,
    link(minimal, ': One-page summary for counterpart systems.'),
    '',
    '## Chapters',
    ...chapters.map((doc) => link(doc)),
    '',
    '## FAQ',
    link(faqDoc, `: ${faqItems.length} questions and answers.`),
    `- [FAQ dataset](${siteConfig.url}${baseUrl}faq.json): JSON records with id, question, answer, section, status, and url.`,
    '',
    '## English',
    ...english.map((doc) => link(doc, ': One-page English summary for counterpart systems.')),
    '',
    '## Versions',
    `- [Version history](${siteConfig.url}${baseUrl}versions): Release dates, labels, and per-chapter diffs.`,
    ...chain.map((entry) =>
      entry.kind === 'snapshot'
        ? `- [${entry.label}](${siteConfig.url}${baseUrl}${entry.id}/): Frozen draft released ${entry.released}.`
        : entry.kind === 'external'
          ? `- [${entry.label}](${entry.href}): Published ${entry.released}.`
          : null,
    ).filter(Boolean),
    '',
  ];
  return lines.join('\n');
}

export default function agentDocsPlugin(context) {
  const siteDir = context.siteDir;
  const baseUrl = context.baseUrl;
  let docs = [];

  return {
    name: 'agent-docs',

    // allContent carries every plugin's payload; content here is this plugin's own.
    allContentLoaded({allContent}) {
      const collected = [];
      for (const pluginContent of Object.values(allContent ?? {})) {
        for (const instance of Object.values(pluginContent ?? {})) {
          for (const version of instance?.loadedVersions ?? []) {
            if (version.versionName !== 'current') continue;
            for (const doc of version.docs) {
              if (doc.unlisted) continue;
              collected.push({
                source: doc.source,
                permalink: doc.permalink,
                id: doc.id,
                title: doc.title,
                sidebarPosition: doc.sidebarPosition,
              });
            }
          }
        }
      }
      docs = collected;
    },

    async postBuild({outDir, siteConfig}) {
      if (docs.length === 0) throw new Error('agent-docs: allContentLoaded collected no current docs');
      const routeOf = (permalink) => {
        if (!permalink.startsWith(baseUrl)) {
          throw new Error(`agent-docs: permalink ${permalink} is outside baseUrl ${baseUrl}`);
        }
        return permalink.slice(baseUrl.length);
      };
      const docBySource = new Map(docs.map((doc) => [sourcePath(siteDir, doc), doc]));

      for (const doc of docs) {
        const sourceFile = sourcePath(siteDir, doc);
        const raw = readFileSync(sourceFile, 'utf8');
        const body = rewriteDocLinks(
          raw.replace(FRONT_MATTER, '').replace(MDX_COMMENT, '').replace(HTML_COMMENT, ''),
          dirname(sourceFile),
          docBySource,
          siteConfig,
        ).replace(/^\s*\n/, '');
        const markdown = `> Canonical: ${siteConfig.url}${doc.permalink}\n\n${body}`;
        const route = routeOf(doc.permalink);
        const twinPath = join(outDir, `${route}${doc.permalink.endsWith('/') ? 'index.md' : '.md'}`);
        mkdirSync(dirname(twinPath), {recursive: true});
        writeFileSync(twinPath, markdown);

        injectHead(
          join(outDir, route, 'index.html'),
          `<link rel="alternate" type="text/markdown" href="${mdUrl(doc, siteConfig)}"/>`,
        );
      }

      const faqDoc = docs.find((doc) => doc.id === FAQ_ID);
      if (!faqDoc) throw new Error(`agent-docs: no current doc with id ${FAQ_ID}`);
      const faqItems = parseFaq(
        readFileSync(sourcePath(siteDir, faqDoc), 'utf8'),
        faqDoc,
        docBySource,
        siteDir,
        siteConfig,
      );

      const dataset = {
        version: workingLabel(),
        canonical: `${siteConfig.url}${faqDoc.permalink}`,
        source: mdUrl(faqDoc, siteConfig),
        count: faqItems.length,
        items: faqItems,
      };
      writeFileSync(join(outDir, 'faq.json'), `${JSON.stringify(dataset, null, 2)}\n`);

      const jsonLd = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: 'th',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: plainText(item.question),
          acceptedAnswer: {'@type': 'Answer', text: plainText(item.answer)},
        })),
      }).replace(/</g, '\\u003c');
      const faqHtml = join(outDir, routeOf(faqDoc.permalink), 'index.html');
      const faqHtmlText = readFileSync(faqHtml, 'utf8');
      if (!faqHtmlText.includes('"@type":"FAQPage"')) {
        if (!faqHtmlText.includes('</head>')) throw new Error(`agent-docs: no </head> in ${faqHtml}`);
        writeFileSync(
          faqHtml,
          faqHtmlText.replace('</head>', `<script type="application/ld+json">${jsonLd}</script></head>`),
        );
      }

      writeFileSync(join(outDir, 'llms.txt'), renderLlms(docs, faqDoc, faqItems, siteConfig, baseUrl));
    },
  };
}
