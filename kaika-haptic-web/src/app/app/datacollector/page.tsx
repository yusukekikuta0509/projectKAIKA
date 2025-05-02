// src/app/app/datacollector/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
// CSSモジュールと共通スタイルをインポート
import commonStyles from '../haptic/haptic.module.css'; // 共通スタイルを流用
import styles from './datacollector.module.css';

// データ収集状態
type CollectionState = 'idle' | 'collecting' | 'collected' | 'submitting';

export default function DataCollectorPage() {
  // --- Wallet Hook ---
  const { publicKey, connected } = useWallet();

  // --- State ---
  const [collectionState, setCollectionState] = useState<CollectionState>('idle');
  const [simulatedDataType, setSimulatedDataType] = useState<string | null>(null);
  const [collectionStartTime, setCollectionStartTime] = useState<number | null>(null);
  const [collectionDuration, setCollectionDuration] = useState<number>(0); // 秒
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [earnedKaika, setEarnedKaika] = useState<number | null>(null);
  // KAIKA残高はhapticページと共有する必要がある場合、Context APIや Zustand等の状態管理ライブラリが必要
  // ここではローカルで管理
  const [mockKaikaBalance, setMockKaikaBalance] = useState(125);

  // --- Refs & Background Effect (hapticページと同じ) ---
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
  const handleStartCollection = () => {
    if (!connected) {
        alert("Please connect your wallet to start collecting data.");
        return;
    }
    setCollectionState('collecting');
    setCollectionStartTime(Date.now());
    setSimulatedDataType(getRandomDataType()); // ランダムなデータタイプを設定
    setCollectionDuration(0);
    setSubmissionStatus(null);
    setEarnedKaika(null);
    console.log("Data collection started...");
  };

  const handleStopCollection = () => {
    if (collectionState !== 'collecting' || !collectionStartTime) return;
    const duration = Math.floor((Date.now() - collectionStartTime) / 1000);
    setCollectionDuration(duration);
    setCollectionState('collected');
    setCollectionStartTime(null); // Reset start time
    console.log(`Data collection stopped. Duration: ${duration}s`);
  };

  const handleSubmitData = () => {
    if (collectionState !== 'collected' || !connected) return;

    setCollectionState('submitting');
    setSubmissionStatus("Preparing data upload...");
    console.log("Submitting data...");

    // データアップロード & トランザクション シミュレーション
    setTimeout(() => {
        setSubmissionStatus("Uploading data to IPFS (simulated)...");
        setTimeout(() => {
            setSubmissionStatus("Confirm transaction in your wallet...");
            setTimeout(() => {
                // 成功シナリオ
                const reward = Math.max(5, Math.floor(collectionDuration * 0.5)); // 時間に応じて報酬を計算 (最低5)
                setEarnedKaika(reward);
                setMockKaikaBalance(prev => prev + reward); // 残高更新
                setSubmissionStatus(`Submission successful! Earned ${reward} KAIKA.`);
                setCollectionState('idle'); // アイドル状態に戻す
                setCollectionDuration(0);
                setSimulatedDataType(null);
                console.log("Data submitted successfully.");

                // 失敗シナリオ (例)
                // setSubmissionStatus("Submission failed. Network error.");
                // setCollectionState('collected'); // 失敗時は収集完了状態に戻すなど
            }, 2500); // ウォレット確認時間
        }, 1500); // IPFSアップロード時間
    }, 1000); // 初期処理時間
  };

  // Helper to get random data type
  const getRandomDataType = () => {
      const types = ['Urban Sidewalk', 'Park Trail', 'Office Carpet', 'Wooden Floor', 'Tiled Surface'];
      return types[Math.floor(Math.random() * types.length)];
  }

  // Timer effect for duration update while collecting
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (collectionState === 'collecting' && collectionStartTime) {
      interval = setInterval(() => {
        setCollectionDuration(Math.floor((Date.now() - collectionStartTime) / 1000));
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [collectionState, collectionStartTime]);


  // --- Render ---
  return (
    <div className={commonStyles.main}>
       {/* Background */}
       <div ref={gradRef} className={commonStyles.gradientBackground} aria-hidden />
       <div ref={gradRef} className={commonStyles.dotGrid} aria-hidden />

      {/* Header (共通) */}
       <header className={commonStyles.header}>
         <Link href="/" className={commonStyles.logo}>KAIKA</Link>
         <nav className={commonStyles.nav}>
           <Link href="/app/haptic" className={commonStyles.navLink}>Haptic Select</Link>
           <Link href="/" className={commonStyles.navLink}>Main Page</Link>
         </nav>
         <div className={commonStyles.walletInfo}>
             {connected && publicKey && (
                 <span className={commonStyles.walletAddress}>
                     {publicKey.toBase58().substring(0, 4)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
                 </span>
             )}
              {/* このページのKAIKA残高 */}
             <span className={commonStyles.kaikaBalance}>◎ {mockKaikaBalance} KAIKA</span>
             <WalletMultiButton className={commonStyles.walletButton} />
         </div>
       </header>

      {/* Content */}
      <div className={commonStyles.contentWrapper}>
        <section className={`${commonStyles.section} ${styles.collectionSection}`}>
          <h2>Data Collector</h2>

          {/* Status Indicator */}
          <div className={`${styles.statusIndicator} ${styles[collectionState]}`}>
            Status: {collectionState.toUpperCase()}
            {collectionState === 'collecting' && ` - Collecting '${simulatedDataType}' data (${collectionDuration}s)`}
          </div>

          {/* Action Buttons */}
          {collectionState === 'idle' && (
            <button onClick={handleStartCollection} className={`${styles.actionButton} ${styles.start}`} disabled={!connected}>
              Start Data Collection
            </button>
          )}
          {collectionState === 'collecting' && (
            <button onClick={handleStopCollection} className={`${styles.actionButton} ${styles.stop}`}>
              Stop Collection ({collectionDuration}s)
            </button>
          )}
          {collectionState === 'collected' && (
            <button onClick={handleSubmitData} className={`${styles.actionButton} ${styles.submit}`} disabled={!connected}>
              Submit '{simulatedDataType}' ({collectionDuration}s) & Earn KAIKA
            </button>
          )}
          {collectionState === 'submitting' && (
            <button className={`${styles.actionButton}`} disabled>
              Submitting Data...
            </button>
          )}

          {/* Collected Data Info */}
          {collectionState === 'collected' && simulatedDataType && (
              <div className={styles.collectedDataInfo}>
                  Data Ready: Type: '{simulatedDataType}', Duration: {collectionDuration} seconds. Click submit to earn rewards.
              </div>
          )}

           {/* Submission Status Message */}
           {submissionStatus && (
                <div className={`${styles.submissionStatus} ${submissionStatus.includes('successful') ? styles.success : submissionStatus.includes('failed') ? styles.error : ''}`}>
                    {submissionStatus}
                </div>
            )}

        </section>
      </div>
    </div>
  );
}