// src/app/app/haptic/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react'; // Import useWallet
import styles from './haptic.module.css'; // CSS Moduleをインポート

// ============================================================
// 型定義とモックデータ (ファイル内に直接定義)
// ============================================================

// 感覚データのインターフェース定義
interface Feeling {
  id: string;
  name: string;
  description: string; // 説明追加
  priceUSDC: number; // 価格追加 (USDC想定)
  owned: boolean;
}

// モックデータ (初期状態)
const initialFeelings: Feeling[] = [
  { id: 'beach_sand', name: 'Beach Sand', description: 'Walk on a sunny beach.', priceUSDC: 5.0, owned: true },
  { id: 'athens_cobblestone', name: 'Athens Cobblestone', description: 'Ancient streets under your feet.', priceUSDC: 7.5, owned: true },
  { id: 'forest_floor', name: 'Forest Floor', description: 'Soft earth and leaves.', priceUSDC: 6.0, owned: false },
  { id: 'grassy_field', name: 'Grassy Field', description: 'Run through an open field.', priceUSDC: 4.5, owned: true },
  { id: 'tokyo_asphalt', name: 'Tokyo Asphalt', description: 'The feeling of a bustling city.', priceUSDC: 8.0, owned: false },
  { id: 'gravel_path', name: 'Gravel Path', description: 'Crunchy gravel on a trail.', priceUSDC: 5.5, owned: false },
];

// ============================================================
// HapticPage コンポーネント
// ============================================================

export default function HapticPage() {
  // --- Wallet Hook ---
  const { publicKey, connected } = useWallet(); // Wallet接続状態と公開鍵を取得

  // --- State ---
  const [isHapticOn, setIsHapticOn] = useState(true);
  // initialFeelingsを初期値として使用
  const [availableFeelings, setAvailableFeelings] = useState<Feeling[]>(initialFeelings);
  const [selectedFeelingId, setSelectedFeelingId] = useState<string | null>(
    // initialFeelingsから初期選択を決定
    initialFeelings.find(f => f.owned)?.id || null
  );
  const [loadingFeelingId, setLoadingFeelingId] = useState<string | null>(null);
  const [purchasingFeelingId, setPurchasingFeelingId] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null); // 購入ステータスメッセージ
  const [mockKaikaBalance, setMockKaikaBalance] = useState(125); // 擬似KAIKAトークン残高

  // --- Refs & Background Effect ---
  const gradRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
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
  };

  const handleSelectFeeling = (feelingId: string) => {
    const feeling = availableFeelings.find(f => f.id === feelingId);
     if (!feeling || !feeling.owned || loadingFeelingId || purchasingFeelingId || !isHapticOn) return;

    console.log(`Selecting: ${feeling.name}...`);
    setLoadingFeelingId(feelingId);
    setPurchaseStatus(null); // Clear purchase status

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
    if (!feeling || feeling.owned || loadingFeelingId || purchasingFeelingId) return;

    // --- Wallet接続チェック ---
    if (!connected || !publicKey) {
      setPurchaseStatus("Please connect your wallet to purchase.");
      alert("Please connect your wallet first!");
      return;
    }

    console.log(`Purchasing: ${feeling.name} for ${feeling.priceUSDC} USDC...`);
    setPurchasingFeelingId(feelingId);
    setPurchaseStatus("Connecting to wallet..."); // ステータス更新

    // --- 購入シミュレーション ---
    setTimeout(() => {
      setPurchaseStatus("Confirm transaction in your wallet..."); // ステータス更新
      setTimeout(() => {
          // 成功シナリオ
          setAvailableFeelings(prevFeelings =>
              prevFeelings.map(f =>
                  f.id === feelingId ? { ...f, owned: true } : f
              )
          );
          setPurchasingFeelingId(null);
          const fakeTx = 'Tx' + Math.random().toString(36).substring(2, 10);
          setPurchaseStatus(`Purchase successful! Tx: ${fakeTx}. ${feeling.name} is now available.`);
          console.log(`Purchased feeling: ${feeling.name}`);
          handleSelectFeeling(feelingId); // 自動選択

          // 失敗シナリオ (コメントアウト)
          // setPurchasingFeelingId(null);
          // setPurchaseStatus("Purchase failed. Please try again.");
          // console.log(`Purchase failed for: ${feeling.name}`);

      }, 2500); // ウォレット確認待ち時間
    }, 1500); // 初期処理時間
  };

  // --- Render ---
  return (
    <div className={styles.main}>
      {/* Background */}
      <div ref={gradRef} className={styles.gradientBackground} aria-hidden />
      <div className={styles.dotGrid} aria-hidden />

      {/* Header */}
      <header className={styles.header}>
         <Link href="/" className={styles.logo}>KAIKA</Link>
         <nav className={styles.nav}>
           <Link href="/app/datacollector" className={styles.navLink}>Data Collector</Link>
           <Link href="/" className={styles.navLink}>Main Page</Link>
         </nav>
         <div className={styles.walletInfo}>
             {connected && publicKey && (
                 <span className={styles.walletAddress}>
                     {publicKey.toBase58().substring(0, 4)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
                 </span>
             )}
             <span className={styles.kaikaBalance}>◎ {mockKaikaBalance} KAIKA</span>
             <WalletMultiButton className={styles.walletButton} id="wallet-connect-button" />
         </div>
      </header>

      {/* Content */}
      <div className={styles.contentWrapper}>
        {/* Haptic Control */}
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

        {/* Purchase Status */}
        {purchaseStatus && (
            <div className={`${styles.statusMessage} ${purchaseStatus.includes('successful') ? styles.success : purchaseStatus.includes('failed') ? styles.error : ''}`}>
                {purchaseStatus}
            </div>
        )}

        {/* Choose Feeling */}
        <section className={`${styles.section} ${styles.feelingsList}`}>
          <h2>Choose Feeling</h2>
          <ul>
            {availableFeelings.map((feeling) => (
              <li
                key={feeling.id}
                className={`${styles.feelingItem} ${selectedFeelingId === feeling.id ? styles.selected : ''} ${feeling.owned ? styles.owned : styles.notOwned}`}
              >
                 {/* Left side: Info */}
                 <div className={styles.feelingInfo}>
                    <span className={styles.feelingName}>{feeling.name}</span>
                    <p className={styles.feelingDescription}>{feeling.description}</p>
                    {!feeling.owned && (
                        <span className={styles.feelingPrice}>{feeling.priceUSDC.toFixed(2)} USDC</span>
                    )}
                 </div>

                 {/* Right side: Buttons/Loader */}
                <div className={styles.buttons}>
                  {loadingFeelingId === feeling.id && <div className={styles.loader}></div>}
                  {purchasingFeelingId === feeling.id && !loadingFeelingId && <div className={styles.loader}></div>}

                  {feeling.owned ? (
                    // Select Button
                    <button
                      onClick={() => handleSelectFeeling(feeling.id)}
                      disabled={!isHapticOn || selectedFeelingId === feeling.id || !!loadingFeelingId || !!purchasingFeelingId}
                      style={{ display: (loadingFeelingId === feeling.id || purchasingFeelingId === feeling.id) ? 'none' : 'block' }}
                    >
                      {selectedFeelingId === feeling.id ? 'Selected' : 'Select'}
                    </button>
                  ) : (
                    // Purchase Button
                    <button
                      onClick={() => handlePurchaseFeeling(feeling.id)}
                      className={`${styles.purchaseButton} ${purchasingFeelingId === feeling.id ? styles.purchasing : ''}`}
                      disabled={!!loadingFeelingId || !!purchasingFeelingId}
                      style={{ display: (loadingFeelingId === feeling.id || purchasingFeelingId === feeling.id) ? 'none' : 'block' }}
                    >
                      {purchasingFeelingId === feeling.id ? 'Processing...' : `Buy (${feeling.priceUSDC.toFixed(2)} USDC)`}
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