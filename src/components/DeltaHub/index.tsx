import React from 'react';
import Link from '@docusaurus/Link';
import {VersionPage, PairHeader, StatList, deltaStats, cellLabel, type VersionEntry} from '../version-pages/index';
import styles from '../version-pages/styles.module.css';

type ChapterRow = {
  slug: string;
  file: string;
  status: 'added' | 'removed' | 'changed';
  added: number;
  removed: number;
  clauses: {added: number; removed: number; changed: number; renumbered: number};
};

type Payload = {
  from: VersionEntry;
  to: VersionEntry;
  pairPath: string;
  stats: {
    chapters: number;
    unchanged: number;
    added: number;
    removed: number;
    clauses: {added: number; removed: number; changed: number; renumbered: number};
  };
  chapters: ChapterRow[];
  unchanged: {slug: string; file: string}[];
};

const chapterStatus: Record<ChapterRow['status'], string> = {
  added: 'บทใหม่',
  removed: 'ตัดออก',
  changed: 'แก้ไข',
};

const chapterName = (file: string) => file.replace(/\.md$/, '');

export default function DeltaHub({data}: {data: Payload}) {
  const {from, to, pairPath, stats, chapters, unchanged} = data;
  const clauseTotal =
    stats.clauses.added + stats.clauses.removed + stats.clauses.changed + stats.clauses.renumbered;

  return (
    <VersionPage
      title={`ส่วนต่าง: ${to.label} เทียบกับ ${from.label}`}
      description={`รายการบทที่เปลี่ยนแปลงระหว่าง ${from.label} และ ${to.label}`}>
      <PairHeader from={from} to={to} />
      <StatList items={deltaStats(data)} />

      <p className={styles.lede}>
        ภาพรวมนี้แสดงระดับบท หากต้องการตรวจระดับข้อ (เพิ่ม / ตัด / แก้ไข / ย้ายข้อ){' '}
        <Link to={`${pairPath}/clauses`}>เปิดตารางส่วนต่างระดับข้อ</Link>
        {clauseTotal > 0 ? ` (${clauseTotal} ข้อ)` : ''}
      </p>

      <div
        className={styles.tableRegion}
        role="region"
        tabIndex={0}
        aria-labelledby="delta-chapters-caption">
        <table className={styles.responsiveTable}>
          <caption id="delta-chapters-caption" className={styles.muted}>
            บทที่มีการเปลี่ยนแปลง เรียงตามชื่อไฟล์
          </caption>
          <thead>
            <tr>
              <th scope="col">บท</th>
              <th scope="col">สถานะ</th>
              <th scope="col">บรรทัดเพิ่ม</th>
              <th scope="col">บรรทัดตัด</th>
              <th scope="col">ข้อ</th>
              <th scope="col">ส่วนต่าง</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((chapter) => (
              <tr key={chapter.slug}>
                <th scope="row" style={cellLabel('บท')}>
                  {chapterName(chapter.file)}
                </th>
                <td style={cellLabel('สถานะ')}>{chapterStatus[chapter.status]}</td>
                <td className={styles.numeric} style={cellLabel('บรรทัดเพิ่ม')}>
                  +{chapter.added}
                </td>
                <td className={styles.numeric} style={cellLabel('บรรทัดตัด')}>
                  −{chapter.removed}
                </td>
                <td style={cellLabel('ข้อ')}>
                  {chapter.clauses.added + chapter.clauses.removed + chapter.clauses.changed + chapter.clauses.renumbered === 0
                    ? '—'
                    : [
                        chapter.clauses.added ? `เพิ่ม ${chapter.clauses.added}` : null,
                        chapter.clauses.removed ? `ตัด ${chapter.clauses.removed}` : null,
                        chapter.clauses.changed ? `แก้ ${chapter.clauses.changed}` : null,
                        chapter.clauses.renumbered ? `ย้าย ${chapter.clauses.renumbered}` : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                </td>
                <td style={cellLabel('ส่วนต่าง')}>
                  <Link to={`${pairPath}/${chapter.slug}`}>ดูข้อความที่เปลี่ยน</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {unchanged.length > 0 ? (
        <details className={styles.disclosure}>
          <summary>บทที่ไม่มีการเปลี่ยนแปลง ({unchanged.length})</summary>
          <div className={styles.disclosureBody}>
            <ul>
              {unchanged.map((chapter) => (
                <li key={chapter.slug}>{chapterName(chapter.file)}</li>
              ))}
            </ul>
          </div>
        </details>
      ) : null}
    </VersionPage>
  );
}
