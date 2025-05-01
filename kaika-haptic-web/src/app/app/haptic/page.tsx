// src/app/app/haptic/page.tsx
'use client'; // useState, useEffect, useRef を使うため
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'; // Wallet Buttonをインポート
import styles from './haptic.module.css'; // CSSモジュールをインポート

// 感覚データの型定義
interface Feeling {
  id: string;
  name: string;
  owned: boolean;
}

// モックデータ (初期状態)
const initialFeelings: Feeling[] = [
  { id: 'beach_sand', name: 'Beach Sand', owned: true },
  { id: 'athens_cobblestone', name: 'Athens Cobblestone', owned: true },
  { id: 'forest_floor', name: 'Forest Floor', owned: false },
  { id: 'grassy_field', name: 'Grassy Field', owned: true },
  { id: 'tokyo_asphalt', name: 'Tokyo Asphalt', owned: false },
  { id: 'gravel_path', name: 'Gravel Path', owned: false }, // 追加データ
];

export default function HapticPage() {
  // --- State ---
  const [isHapticOn, setIsHapticOn] = useState(true); // ハプティック状態
  const [availableFeelings, setAvailableFeelings] = useState<Feeling[]>(initialFeelings); // 感覚リスト
  const [selectedFeelingId, setSelectedFeelingId] = useState<string | null>(
    initialFeelings.find(f => f.owned)?.id || null // 初期選択 (所有しているもの)
  );
  const [loadingFeelingId, setLoadingFeelingId] = useState<string | null>(null); // ロード中ID
  const [purchasingFeelingId, setPurchasingFeelingId] = useState<string | null>(null); // 購入処理中ID

  // --- Refs for Background ---
  const gradRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // --- Effects ---
  // Mouse follow effect (トップページからコピー)
  useEffect(() => {
    const move = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  useEffect(() => {
    if (!gradRef.current) return;
    const x = 10 + mouse.x * 30, y = 30 + mouse.y * 40;
    gradRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255,107,0,.1) 0%, rgba(0,0,0,0) 70%)`;
  }, [mouse]);

  // --- Handlers ---
  const handleToggleHaptic = () => {
    setIsHapticOn(!isHapticOn);
    console.log(`Haptic turned ${!isHapticOn ? 'ON' : 'OFF'}`);
    if (!isHapticOn) {
      // OFFにする場合は選択も解除 (任意)
      // setSelectedFeelingId(null);
    }
    // TODO: 実際のデバイス制御ロジック
  };

  const handleSelectFeeling = (feelingId: string) => {
    const feeling = availableFeelings.find(f => f.id === feelingId);
    if (!feeling || !feeling.owned || loadingFeelingId || purchasingFeelingId || !isHapticOn) {
        return; // 処理中、非所有、Haptic OFFの場合は何もしない
    }

    console.log(`Selecting: ${feeling.name}...`);
    setLoadingFeelingId(feelingId); // ローディング開始

    // --- ダウンロードシミュレーション ---
    setTimeout(() => {
      setSelectedFeelingId(feelingId);
      setLoadingFeelingId(null); // ローディング完了
      console.log(`Selected feeling: ${feeling.name}`);
      // TODO: 実際のデバイスへの感覚データ送信
    }, 1500); // 1.5秒待機
  };

  const handlePurchaseFeeling = (feelingId: string) => {
     const feeling = availableFeelings.find(f => f.id === feelingId);
     if (!feeling || feeling.owned || loadingFeelingId || purchasingFeelingId) {
         return; // 処理中、所有済みの場合は何もしない
     }

    console.log(`Purchasing: ${feeling.name}...`);
    setPurchasingFeelingId(feelingId); // 購入処理開始

    // --- 購入シミュレーション ---
    setTimeout(() => {
      // 状態を更新して所有済みにする
      setAvailableFeelings(prevFeelings =>
        prevFeelings.map(f =>
          f.id === feelingId ? { ...f, owned: true } : f
        )
      );
      setPurchasingFeelingId(null); // 購入処理完了
      console.log(`Purchased feeling: ${feeling.name}`);
      // 購入後、自動で選択状態にする (任意)
      handleSelectFeeling(feelingId);
      // TODO: Web3マーケットプレイスでの実際の購入処理
    }, 2000); // 2秒待機
  };

  // --- Render ---
  return (
    <div className={styles.main}>
      {/* 背景 (トップページと同じ) */}
      <div ref={gradRef} className={styles.gradientBackground} aria-hidden />
      <div className={styles.dotGrid} aria-hidden />

      {/* ヘッダー (トップページのデザインを流用) */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>KAIKA</Link> {/* ロゴからトップへ */}
        <nav className={styles.nav}>
          {/* アプリ内ナビゲーション (必要に応じて) */}
          {/* <Link href="/app/data-collector" className={styles.navLink}>Data Collector</Link> */}
          <Link href="/" className={styles.navLink}>Main Page</Link> {/* トップページへのリンク */}
        </nav>
        <WalletMultiButton className={styles.walletButton}/> {/* ウォレットボタン */}
      </header>

      {/* コンテンツエリア */}
      <div className={styles.contentWrapper}>
        {/* Haptic Control Section */}
        <section className={`${styles.section} ${styles.controls}`}>
          <h2>Haptic Control</h2>
          <button
            onClick={handleToggleHaptic}
            className={`${styles.toggleButton} ${isHapticOn ? styles.on : styles.off}`}
          >
            {isHapticOn ? 'Haptic ON' : 'Haptic OFF'}
          </button>
          {!isHapticOn && <p style={{color: '#aaa', marginTop: '1rem'}}>Haptic is OFF. Turn it ON to select feelings.</p>}
        </section>

        {/* Choose Feeling Section */}
        <section className={`${styles.section} ${styles.feelingsList}`}>
          <h2>Choose Feeling</h2>
          <ul>
            {availableFeelings.map((feeling) => (
              <li
                key={feeling.id}
                className={`${styles.feelingItem} ${selectedFeelingId === feeling.id ? styles.selected : ''}`}
              >
                <span>{feeling.name}</span>
                <div className={styles.buttons}>
                  {/* ローディング表示 */}
                  {loadingFeelingId === feeling.id && (
                     <div className={styles.loader}></div>
                  )}

                  {/* ボタン表示ロジック */}
                  {feeling.owned ? (
                    // 所有している場合: Selectボタン
                    <button
                      onClick={() => handleSelectFeeling(feeling.id)}
                      disabled={!isHapticOn || selectedFeelingId === feeling.id || !!loadingFeelingId || !!purchasingFeelingId}
                      // ローディング中は非表示にする場合
                      style={{ display: loadingFeelingId === feeling.id ? 'none' : 'block' }}
                    >
                      {selectedFeelingId === feeling.id ? 'Selected' : 'Select'}
                    </button>
                  ) : (
                    // 所有していない場合: Purchaseボタン
                    <button
                      onClick={() => handlePurchaseFeeling(feeling.id)}
                      className={`${styles.purchaseButton} ${purchasingFeelingId === feeling.id ? styles.purchasing : ''}`}
                      disabled={!!loadingFeelingId || !!purchasingFeelingId}
                       // ローディング中は非表示にする場合
                       style={{ display: loadingFeelingId === feeling.id ? 'none' : 'block' }}
                    >
                      {purchasingFeelingId === feeling.id ? 'Processing...' : 'Purchase'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}