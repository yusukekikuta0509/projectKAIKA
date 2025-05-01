// src/app/app/collector/page.tsx
'use client'; // useState を使うため

import { useState } from 'react';
import Link from 'next/link';
import styles from './collector.module.css';

// モックデータ
const collectedDataTypes = {
  surfaces: ['Sand', 'Grass', 'Asphalt', 'Cobblestone'],
  locations: ['Tokyo', 'Monaco', 'Local Park'],
};
const currentRevenue = 15.75; // 例: 収集データからの収益 (仮)

export default function CollectorPage() {
  const [isCollecting, setIsCollecting] = useState(false); // データ収集中かどうかの状態
  const [claimed, setClaimed] = useState(false); // 収益を請求済みか

  const handleToggleCollection = () => {
    setIsCollecting(!isCollecting);
    console.log(`Data collection ${!isCollecting ? 'started' : 'finished'}`);
    // TODO: 実際のデータ収集開始/停止ロジック (将来的に)
  };

  const handleClaimRevenue = () => {
    console.log(`Claiming revenue: $${currentRevenue}`);
    // TODO: SolanaブロックチェーンへのClaimトランザクション発行 (将来的に)
    setClaimed(true); // UI上、Claim済みとする
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Data Collector</h1>
        <nav>
          <Link href="/app/haptic">Streaming Haptic</Link> | {' '}
          <Link href="/">Main Page</Link>
        </nav>
      </header>

      <section className={styles.collectionControl}>
        <h2>Collection Status</h2>
        <button
          onClick={handleToggleCollection}
          className={`${styles.collectButton} ${isCollecting ? styles.collecting : ''}`}
        >
          {isCollecting ? 'Finish Collecting Data' : 'Start Collecting Data'}
        </button>
      </section>

      <section className={styles.collectedData}>
        <h2>Collected Data Summary</h2>
        <div>
          <strong>Surfaces:</strong> {collectedDataTypes.surfaces.join(', ')}
        </div>
        <div>
          <strong>Locations:</strong> {collectedDataTypes.locations.join(', ')}
        </div>
      </section>

      <section className={styles.mapSection}>
        <h2>Collected Routes Map</h2>
        <div className={styles.mapPlaceholder}>
          {/* TODO: ここにマップライブラリ (Leaflet, Mapbox GL JSなど) を統合 */}
          Map will be displayed here. Collected paths will be highlighted.
        </div>
      </section>

      <section className={styles.revenueSection}>
        <h2>Data Sales Revenue</h2>
        <div className={styles.revenueDisplay}>
          Current Earnings: <strong>${currentRevenue.toFixed(2)}</strong> {/* 小数点以下2桁表示 */}
        </div>
        <button onClick={handleClaimRevenue} disabled={claimed || currentRevenue <= 0}>
          {claimed ? 'Claimed' : 'Claim Revenue'}
        </button>
      </section>
    </div>
  );
}