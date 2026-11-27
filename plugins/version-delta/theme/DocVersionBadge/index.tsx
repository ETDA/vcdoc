import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useGlobalData from '@docusaurus/useGlobalData';
import {useActiveDocContext, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {chain, pairs, formatThaiDate} from '@site/versions.meta.mjs';
import styles from './styles.module.css';

type ChapterRoutes = Record<string, Record<string, Record<string, string>>>;

export default function DocVersionBadge({className}: {className?: string}) {
  const version = useDocsVersion();
  const {alternateDocVersions, activeDoc} = useActiveDocContext(version.pluginId);
  const globalData = useGlobalData();
  const entry = chain.find((item) => item.id === version.version);
  if (!entry || !version.badge) return null;

  const newer = pairs().find((pair) => pair.from.id === entry.id);
  const older = pairs().find((pair) => pair.to.id === entry.id);
  const otherPair = newer ?? older;
  const other = otherPair ? (newer ? otherPair.to : otherPair.from) : null;
  const hasOther = other ? Boolean(alternateDocVersions?.[other.id]) : false;

  const hubHref = otherPair ? `/versions/diff/${otherPair.from.id}__${otherPair.to.id}` : null;
  // The chapter slug in the delta payload is the doc id's last segment, lowercased
  // so README and readme agree.
  const chapterRoutes = (globalData['version-delta'] as {default?: {chapterRoutes?: ChapterRoutes}})?.default
    ?.chapterRoutes;
  const slug = activeDoc?.id?.split('/').pop()?.toLowerCase();
  const chapterHref =
    slug && otherPair ? chapterRoutes?.[otherPair.from.id]?.[otherPair.to.id]?.[slug] : undefined;
  // A chapter that exists only in this draft has no counterpart page, but it does
  // have a diff route, so the link still has somewhere useful to go.
  const canCompare = Boolean(other) && (hasOther || Boolean(chapterHref));
  const href = chapterHref ?? hubHref ?? undefined;

  return (
    <span
      className={clsx(className, ThemeClassNames.docs.docVersionBadge, 'badge badge--secondary', styles.badge)}>
      <span className={styles.label}>{entry.label}</span>
      <span className={styles.date}>
        {entry.kind === 'working' ? 'กำลังจัดทำ' : `เผยแพร่ ${formatThaiDate(entry.released)}`}
      </span>
      {canCompare && other && href ? (
        <Link className={styles.compare} to={href}>
          เทียบกับ {other.label}
        </Link>
      ) : null}
    </span>
  );
}
