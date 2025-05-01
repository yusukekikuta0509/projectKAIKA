// src/app/app/haptic/page.tsx
'use client'; // useState を使うため、Client Component としてマーク

import { useState } from 'react';
import Link from 'next/link';
import styles from './haptic.module.css'; // CSSモジュールをインポート

// モックデータ (実際のデータはAPIなどから取得)
const availableFeelings = [
  { id: 'beach_sand', name: 'Beach Sand', owned: true },
  { id: 'athens_cobblestone', name: 'Athens Cobblestone', owned: true },
  { id: 'forest_floor', name: 'Forest Floor', owned: false },
  { id: 'grassy_field', name: 'Grassy Field', owned: true },
  { id: 'tokyo_asphalt', name: 'Tokyo Asphalt', owned: false },
];

export default function HapticPage() {
  const [isHapticOn, setIsHapticOn] = useState(true); // ハプティック状態
  const [selectedFeelingId, setSelectedFeelingId] = useState<string | null>(
    availableFeelings.find(f => f.owned)?.id || null // 初期は所有しているものから選択
  );

  const handleToggleHaptic = () => {
    setIsHapticOn(!isHapticOn);
    console.log(`Haptic turned ${!isHapticOn ? 'ON' : 'OFF'}`);
    // TODO: 実際のデバイス制御ロジック (将来的に)
  };

  const handleSelectFeeling = (feelingId: string) => {
    const feeling = availableFeelings.find(f => f.id === feelingId);
    if (feeling && feeling.owned) {
      setSelectedFeelingId(feelingId);
      console.log(`Selected feeling: ${feeling.name}`);
      // TODO: 実際のデバイスへの感覚データ送信 (将来的に)
    } else {
      console.log("This feeling needs to be purchased.");
      // TODO: 購入処理への導線
    }
  };

  const handlePurchaseFeeling = (feelingId: string) => {
      const feeling = availableFeelings.find(f => f.id === feelingId);
      console.log(`Purchase feeling: ${feeling?.name}`);
      // TODO: Web3マーケットプレイスでの購入処理 (将来的に)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Streaming Haptic</h1>
        <nav>
          <Link href="/app/collector">Data Collector</Link> | {' '}
          <Link href="/">Main Page</Link>
        </nav>
      </header>

      <section className={styles.controls}>
        <h2>Haptic Control</h2>
        <button onClick={handleToggleHaptic} className={`${styles.toggleButton} ${isHapticOn ? styles.on : styles.off}`}>
          {isHapticOn ? 'Haptic ON' : 'Haptic OFF'}
        </button>
      </section>

      <section className={styles.feelingsList}>
        <h2>Choose Feeling</h2>
        <ul>
          {availableFeelings.map((feeling) => (
            <li key={feeling.id} className={`${styles.feelingItem} ${selectedFeelingId === feeling.id ? styles.selected : ''}`}>
              <span>{feeling.name}</span>
              <div className={styles.buttons}>
                {feeling.owned ? (
                  <button
                    onClick={() => handleSelectFeeling(feeling.id)}
                    disabled={!isHapticOn || selectedFeelingId === feeling.id}
                  >
                    {selectedFeelingId === feeling.id ? 'Selected' : 'Select'}
                  </button>
                ) : (
                  <button onClick={() => handlePurchaseFeeling(feeling.id)} className={styles.purchaseButton}>
                    Purchase
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}