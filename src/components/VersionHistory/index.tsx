import React from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {
  VersionPage,
  StatusChip,
  pairPath,
  cellLabel,
  type PairRef,
  type VersionEntry,
} from '../version-pages/index';
import styles from '../version-pages/styles.module.css';

type Payload = {entries: VersionEntry[]; pairs: PairRef[]};

export default function VersionHistory({data}: {data: Payload}) {
  const {entries, pairs} = data;
  const newestFirst = [...entries].reverse();
  const labelOf = (id: string) => entries.find((entry) => entry.id === id)?.label ?? id;

  return (
    <VersionPage
      title="ประวัติเวอร์ชัน"
      description="ลูกโซ่ฉบับของเอกสาร Thai VC ARF พร้อมวันที่เผยแพร่และส่วนต่างระหว่างฉบับ">
      <p className={styles.lede}>
        เอกสาร Thai VC ARF เผยแพร่เป็นลูกโซ่ของฉบับที่ตรึงเนื้อหาไว้ เมื่อฉบับใดเผยแพร่แล้วจะไม่ถูกแก้ไขอีก
        ส่วนฉบับปัจจุบันเปิดรับการแก้ไขและจะถูกตรึงเมื่อตัดเวอร์ชันถัดไป ทุกหน้าของทุกฉบับแสดงวันที่เผยแพร่ของฉบับนั้น
      </p>

      <div
        className={styles.tableRegion}
        role="region"
        tabIndex={0}
        aria-labelledby="versions-caption">
        <table className={styles.responsiveTable}>
          <caption id="versions-caption" className={styles.muted}>
            ตารางเวอร์ชันทั้งหมด เรียงจากใหม่ไปเก่า
          </caption>
          <thead>
            <tr>
              <th scope="col">เวอร์ชัน</th>
              <th scope="col">สถานะ</th>
              <th scope="col">วันที่เผยแพร่</th>
              <th scope="col">สรุปการเปลี่ยนแปลง</th>
              <th scope="col">ลิงก์</th>
            </tr>
          </thead>
          <tbody>
            {newestFirst.map((entry) => {
              const olderPair = pairs.find((pair) => pair.to === entry.id);
              const newerPair = pairs.find((pair) => pair.from === entry.id);
              return (
                <tr key={entry.id}>
                  <th scope="row" style={cellLabel('เวอร์ชัน')}>
                    <Heading as="h2" className="margin-bottom--none" style={{fontSize: '1rem'}}>
                      {entry.label}
                    </Heading>
                  </th>
                  <td style={cellLabel('สถานะ')}>
                    <StatusChip status={entry.status} />
                  </td>
                  <td style={cellLabel('วันที่เผยแพร่')}>
                    <time dateTime={entry.released ?? undefined}>{entry.releasedBE}</time>
                  </td>
                  <td style={cellLabel('สรุปการเปลี่ยนแปลง')}>
                    {entry.summary.length > 0 ? (
                      <ul className={styles.summaryList}>
                        {entry.summary.map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className={styles.muted}>
                        {entry.kind === 'working' ? 'ฉบับที่กำลังแก้ไข — จะสรุปเมื่อตัดเวอร์ชัน' : '—'}
                      </span>
                    )}
                  </td>
                  <td style={cellLabel('ลิงก์')}>
                    <div className={styles.links}>
                      {entry.readPath ? (
                        <Link to={entry.readPath}>อ่านฉบับนี้</Link>
                      ) : entry.href ? (
                        <Link href={entry.href}>เปิดเอกสารต้นฉบับ (PDF)</Link>
                      ) : null}
                      {olderPair ? (
                        <Link to={pairPath(olderPair.from, olderPair.to)}>
                          ส่วนต่างจาก {labelOf(olderPair.from)}
                        </Link>
                      ) : null}
                      {newerPair ? (
                        <Link to={pairPath(newerPair.from, newerPair.to)}>
                          เทียบกับ {labelOf(newerPair.to)}
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </VersionPage>
  );
}
