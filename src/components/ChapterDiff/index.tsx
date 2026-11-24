import React from 'react';
import Link from '@docusaurus/Link';
import 'diff2html/bundles/css/diff2html.min.css';
import {VersionPage, PairHeader, cellLabel, type VersionEntry} from '../version-pages/index';
import diffStyles from './diff2html.module.css';
import styles from './styles.module.css';
import shared from '../version-pages/styles.module.css';

type ClauseRow = {
  key: string;
  fromKey: string | null;
  title: string;
  status: 'added' | 'removed' | 'changed' | 'renumbered';
  added: number;
  removed: number;
  html: string;
};

type Payload = {
  from: VersionEntry;
  to: VersionEntry;
  pairPath: string;
  chapter: {slug: string; file: string; status: 'added' | 'removed' | 'changed'};
  added: number;
  removed: number;
  html: string;
  clauses: ClauseRow[];
  unchangedClauses: {key: string; title: string}[];
};

const statusLabel = {added: 'บทใหม่', removed: 'ตัดออก', changed: 'แก้ไข'};

export default function ChapterDiff({data}: {data: Payload}) {
  const {from, to, pairPath, chapter, added, removed, html, clauses, unchangedClauses} = data;

  return (
    <VersionPage
      title={`ส่วนต่างบท: ${chapter.file.replace(/\.md$/, '')}`}
      description={`ข้อความที่เปลี่ยนแปลงในบทนี้ระหว่าง ${from.label} และ ${to.label}`}>
      <PairHeader from={from} to={to} />
      <p className={styles.chapterMeta}>
        <span>{statusLabel[chapter.status]}</span>
        <span>+{added} บรรทัด</span>
        <span>−{removed} บรรทัด</span>
        <span>{clauses.length} ข้อที่เปลี่ยน</span>
        <Link to={pairPath}>ภาพรวมระดับบท</Link>
        <Link to={`${pairPath}/clauses`}>ตารางระดับข้อ</Link>
      </p>

      <div className={styles.viewport}>
        <div className={styles.barParent}>
          <div className={styles.bar}>
            <span className={styles.barSide}>
              A · <strong>{from.label}</strong> · {from.releasedBE}
            </span>
            <span aria-hidden="true" className={styles.barArrow}>
              →
            </span>
            <span className={styles.barSide}>
              B · <strong>{to.label}</strong> · {to.releasedBE}
            </span>
            <Link className={styles.barLink} to={pairPath}>
              ภาพรวมส่วนต่าง
            </Link>
          </div>
        </div>
        <div className={diffStyles.diffHost} dangerouslySetInnerHTML={{__html: html}} />
      </div>

      {clauses.length > 0 ? (
        <details className={shared.disclosure} open>
          <summary>ข้อที่มีการเปลี่ยนแปลง ({clauses.length})</summary>
          <div className={shared.disclosureBody}>
            <ul className={styles.clauseList}>
              {clauses.map((clause) => (
                <li key={`${clause.fromKey ?? ''}-${clause.key}`} className={styles.clauseItem}>
                  <strong>{clause.fromKey && clause.fromKey !== clause.key ? `${clause.fromKey} → ${clause.key}` : clause.key}</strong>{' '}
                  {clause.title}
                  {clause.html ? (
                    <details className={shared.disclosure}>
                      <summary>
                        ดูข้อความ (+{clause.added} / −{clause.removed})
                      </summary>
                      <div className={diffStyles.diffHost} dangerouslySetInnerHTML={{__html: clause.html}} />
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}

      {unchangedClauses.length > 0 ? (
        <details className={shared.disclosure}>
          <summary>ข้อที่ไม่มีการเปลี่ยนแปลง ({unchangedClauses.length})</summary>
          <div className={shared.disclosureBody}>
            <ul>
              {unchangedClauses.map((clause) => (
                <li key={clause.key}>
                  {clause.key} {clause.title}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}
    </VersionPage>
  );
}
