import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useActiveDocContext, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {chain, pairs, formatThaiDate} from '@site/versions.meta.mjs';
import styles from './styles.module.css';

/**
 * Frozen-version notice. Replaces the English "no longer maintained" banner so
 * a reader of an archived draft sees the release date and a way to diff it.
 */
export default function DocVersionBanner({className}: {className?: string}) {
  const version = useDocsVersion();
  const {alternateDocVersions} = useActiveDocContext(version.pluginId);
  const entry = chain.find((item) => item.id === version.version);
  if (!entry || entry.kind === 'working') return null;

  const pair = pairs().find((candidate) => candidate.to.id === entry.id);
  const currentDoc = alternateDocVersions?.['current'];
  const currentNode = chain.find((item) => item.kind === 'working');

  return (
    <div
      className={clsx(
        className,
        ThemeClassNames.docs.docVersionBanner,
        'alert alert--warning margin-bottom--md',
        styles.banner,
      )}
      role="note">
      <p className={styles.title}>
        เก็บถาวรแล้ว — ฉบับ {entry.label} ไม่ได้รับการปรับปรุง
      </p>
      <p className={styles.body}>
        เนื้อหาของฉบับนี้ถูกตรึงไว้เมื่อเผยแพร่ ({formatThaiDate(entry.released)}) และจะไม่ถูกแก้ไขอีก
        {currentNode ? ` การแก้ไขใหม่ทั้งหมดอยู่ในฉบับ ${currentNode.label}` : ''}
      </p>
      <p className={styles.links}>
        {pair ? (
          <Link to={`/versions/diff/${pair.from.id}__${pair.to.id}`}>
            ดูส่วนต่างจาก {pair.from.label}
          </Link>
        ) : null}
        {currentDoc ? <Link to={currentDoc.path}>อ่านฉบับปัจจุบันของหน้านี้</Link> : null}
        <Link to="/versions">ประวัติเวอร์ชัน</Link>
      </p>
    </div>
  );
}
