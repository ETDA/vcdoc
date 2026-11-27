import React from 'react';
import Link from '@docusaurus/Link';
import 'diff2html/bundles/css/diff2html.min.css';
import {VersionPage, PairHeader, StatList, cellLabel, type VersionEntry} from '../version-pages/index';
import diffStyles from '../ChapterDiff/diff2html.module.css';
import styles from '../version-pages/styles.module.css';

type ClauseRow = {
  key: string;
  fromKey: string | null;
  title: string;
  previousTitle: string | null;
  status: 'added' | 'removed' | 'changed' | 'renumbered';
  chapterFile: string;
  chapterSlug: string;
  fromLine: number | null;
  toLine: number | null;
  added: number;
  removed: number;
  html: string;
};

type Payload = {
  from: VersionEntry;
  to: VersionEntry;
  pairPath: string;
  stats: {
    clauses: {added: number; removed: number; changed: number; renumbered: number};
  };
  rows: ClauseRow[];
  unchanged: {key: string; title: string; chapterSlug: string}[];
};

const statusLabel: Record<ClauseRow['status'], string> = {
  added: 'เพิ่ม',
  removed: 'ตัด',
  changed: 'แก้ไข',
  renumbered: 'ย้ายข้อ',
};

const chapterName = (file: string) => file.replace(/\.md$/, '');

export default function ClauseTable({data}: {data: Payload}) {
  const {from, to, pairPath, stats, rows, unchanged} = data;
  const captionId = `clauses-${from.id}-${to.id}`.replace(/[^a-zA-Z0-9-]/g, '-');

  return (
    <VersionPage
      title={`ส่วนต่างระดับข้อ: ${to.label} เทียบกับ ${from.label}`}
      description={`ข้อที่มีการเพิ่ม ตัด แก้ไข หรือย้าย ระหว่าง ${from.label} และ ${to.label}`}>
      <PairHeader from={from} to={to} />
      <StatList
        items={[
          {label: 'ข้อที่เพิ่ม', value: stats.clauses.added},
          {label: 'ข้อที่ตัด', value: stats.clauses.removed},
          {label: 'ข้อที่แก้ไข', value: stats.clauses.changed},
          {label: 'ข้อย้ายหมายเลข', value: stats.clauses.renumbered},
        ]}
      />

      <p className={styles.lede}>
        ข้อถูกจับคู่ด้วยหมายเลขข้อก่อน หากเนื้อหาเหมือนกันแต่หมายเลขเปลี่ยนจะรายงานเป็น “ย้ายข้อ”
        ข้อที่เนื้อหาไม่เปลี่ยนจะถูกพับไว้ด้านล่าง —{' '}
        <Link to={pairPath}>กลับไปภาพรวมระดับบท</Link>
      </p>

      <div
        className={styles.tableRegion}
        role="region"
        tabIndex={0}
        aria-labelledby={captionId}>
        <table className={styles.responsiveTable}>
          <caption id={captionId} className={styles.muted}>
            ตารางส่วนต่างระดับข้อระหว่าง {from.label} และ {to.label} ({rows.length} ข้อ)
          </caption>
          <thead>
            <tr>
              <th scope="col">ข้อ</th>
              <th scope="col">ชื่อข้อ</th>
              <th scope="col">สถานะ</th>
              <th scope="col">บท</th>
              <th scope="col">การเปลี่ยนแปลง</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.chapterSlug}-${row.key}`}>
                <th scope="row" style={cellLabel('ข้อ')}>
                  {row.fromKey && row.fromKey !== row.key ? `${row.fromKey} → ${row.key}` : row.key}
                </th>
                <td style={cellLabel('ชื่อข้อ')}>
                  {row.title}
                  {row.previousTitle && row.previousTitle !== row.title ? (
                    <span className={styles.muted}> (เดิม: {row.previousTitle})</span>
                  ) : null}
                </td>
                <td style={cellLabel('สถานะ')}>{statusLabel[row.status]}</td>
                <td style={cellLabel('บท')}>
                  <Link to={`${pairPath}/${row.chapterSlug}`}>{chapterName(row.chapterFile)}</Link>
                </td>
                <td style={cellLabel('การเปลี่ยนแปลง')}>
                  {row.html ? (
                    <details className={styles.disclosure}>
                      <summary>
                        ดูข้อความ (+{row.added} / −{row.removed})
                      </summary>
                      <div
                        className={diffStyles.diffHost}
                        dangerouslySetInnerHTML={{__html: row.html}}
                      />
                    </details>
                  ) : (
                    <span className={styles.muted}>
                      {row.status === 'added' ? `มีเฉพาะใน ${to.label}` : `มีเฉพาะใน ${from.label}`}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unchanged.length > 0 ? (
        <details className={styles.disclosure}>
          <summary>ข้อที่ไม่มีการเปลี่ยนแปลง ({unchanged.length})</summary>
          <div className={styles.disclosureBody}>
            <ul>
              {unchanged.map((row) => (
                <li key={`${row.chapterSlug}-${row.key}`}>
                  {row.key} {row.title}
                </li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}
    </VersionPage>
  );
}
