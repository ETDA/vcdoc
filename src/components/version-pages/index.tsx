import React, {type CSSProperties, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

export type VersionEntry = {
  id: string;
  kind: 'external' | 'snapshot' | 'working';
  label: string;
  released: string | null;
  releasedBE: string;
  status: string;
  summary: string[];
  href: string | null;
  readPath: string | null;
};

export type PairRef = {from: string; to: string};

export const pairPath = (from: string, to: string) => `/versions/diff/${from}__${to}`;

export const deltaStats = (data: {
  from: VersionEntry;
  to: VersionEntry;
  stats: {chapters: number; unchanged: number; added: number; removed: number};
}) => [
  {label: 'บทที่เปลี่ยนแปลง', value: data.stats.chapters},
  {label: 'บรรทัดเพิ่ม', value: `+${data.stats.added}`},
  {label: 'บรรทัดตัด', value: `−${data.stats.removed}`},
  {label: 'บทที่ไม่เปลี่ยน', value: data.stats.unchanged},
];

/** Cell label used by the stacked (narrow container) table layout. */
export const cellLabel = (label: string): CSSProperties => ({['--label' as string]: JSON.stringify(label)}) as CSSProperties;

const chipClass: Record<string, string> = {
  กำลังจัดทำ: styles.chipWip,
  ถูกแทนที่: styles.chipReplaced,
  ฉบับปัจจุบัน: styles.chipCurrent,
  ฉบับก่อนหน้า: styles.chipExternal,
};

export function StatusChip({status}: {status: string}) {
  return <span className={`${styles.chip} ${chipClass[status] ?? ''}`}>{status}</span>;
}

export function VersionPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Layout title={title} description={description}>
      <main className="container margin-vertical--lg">
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>ประวัติเวอร์ชัน · VC Document</p>
          <Heading as="h1">{title}</Heading>
        </header>
        {children}
      </main>
    </Layout>
  );
}

export function PairHeader({from, to}: {from: VersionEntry; to: VersionEntry}) {
  return (
    <p className={styles.pairHeader}>
      <span className={styles.pairSide}>
        <strong>{from.label}</strong> · {from.releasedBE}
      </span>
      <span aria-hidden="true" className={styles.pairArrow}>
        →
      </span>
      <span className={styles.pairSide}>
        <strong>{to.label}</strong> · {to.releasedBE}
      </span>
    </p>
  );
}

export function StatList({items}: {items: {label: string; value: ReactNode}[]}) {
  return (
    <dl className={styles.stats}>
      {items.map((item) => (
        <div className={styles.stat} key={item.label}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
