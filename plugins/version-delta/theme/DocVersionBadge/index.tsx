import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useActiveDocContext, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {chain, pairs, formatThaiDate} from '@site/versions.meta.mjs';
import styles from './styles.module.css';

export default function DocVersionBadge({className}: {className?: string}) {
  const version = useDocsVersion();
  const {alternateDocVersions} = useActiveDocContext(version.pluginId);
  const entry = chain.find((item) => item.id === version.version);
  if (!entry || !version.badge) return null;

  const newer = pairs().find((pair) => pair.from.id === entry.id);
  const older = pairs().find((pair) => pair.to.id === entry.id);
  const otherPair = newer ?? older;
  const other = otherPair ? (newer ? otherPair.to : otherPair.from) : null;
  const hasOther = other ? Boolean(alternateDocVersions?.[other.id]) : false;

  return (
    <span
      className={clsx(className, ThemeClassNames.docs.docVersionBadge, 'badge badge--secondary', styles.badge)}>
      <span className={styles.label}>{entry.label}</span>
      <span className={styles.date}>
        {entry.kind === 'working' ? 'กำลังจัดทำ' : `เผยแพร่ ${formatThaiDate(entry.released)}`}
      </span>
      {hasOther && otherPair && other ? (
        <Link className={styles.compare} to={`/versions/diff/${otherPair.from.id}__${otherPair.to.id}`}>
          เทียบกับ {other.label}
        </Link>
      ) : null}
    </span>
  );
}
