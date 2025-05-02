// src/app/app/datacollector/page.tsx
'use client';
// useRef を react からインポートするのを忘れないように
import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// --- Import Icons ---
import { FaMountain, FaTree, FaUmbrellaBeach, FaWater, FaQuestion } from 'react-icons/fa';
import { FiPlay, FiSquare, FiUploadCloud, FiCheckCircle, FiAlertCircle, FiLoader, FiMapPin, FiDatabase, FiClock, FiTrendingUp, FiCompass, FiRepeat, FiMaximize } from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';

// --- Import CSS ---
import styles from './datacollector.module.css';

// --- Import 3D Map Viewer (Client-side only) ---
const MapViewer3D = dynamic(() => import('@/components/MapViewer3D'), { // ★★★ パスを確認 ★★★
    ssr: false,
    loading: () => <div style={{height: '100%', background: 'var(--kaika-near-black, #111)', display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', color: 'var(--kaika-light-grey, #aaa)', borderRadius: '16px'}}>
                       <FiLoader size={24} className={styles.spinner} style={{marginBottom: '1rem'}}/>
                       Loading 3D Environment...
                   </div>
});

// --- Dynamically import WalletMultiButton ---
const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

// ============================================================
// Type Definitions
// ============================================================
type CollectionState = 'idle' | 'collecting' | 'collected' | 'submitting';
type Position = { x: number; y: number; };
interface Terrain {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

// ============================================================
// Constants & Data
// ============================================================
const KAIKA_REWARD_PER_SECOND = 0.3;
const KAIKA_REWARD_PER_DISTANCE = 0.5;
const MIN_KAIKA_REWARD = 5;
const CURRENT_LOCATION = "Shibuya Crossing";
const NETWORK_NAME = "Devnet";

// Tokyo landmark data - findNearestLandmarkで使用
const TOKYO_LANDMARKS = [
  { name: "Shinjuku", x: 30, y: 35 }, { name: "Shibuya", x: 40, y: 50 },
  { name: "Tokyo Stn", x: 60, y: 45 }, { name: "Ikebukuro", x: 25, y: 20 },
  { name: "Ueno", x: 65, y: 25 }, { name: "Akihabara", x: 58, y: 35 },
  { name: "Shinagawa", x: 55, y: 70 }, { name: "Roppongi", x: 50, y: 55 },
];

// Terrain Data
const terrains: Terrain[] = [
  { id: 'city',     label: 'City',     icon: FiTrendingUp },
  { id: 'forest',   label: 'Forest',   icon: FaTree },
  { id: 'mountain', label: 'Mountain', icon: FaMountain },
  { id: 'beach',    label: 'Beach',    icon: FaUmbrellaBeach },
  { id: 'water',    label: 'Water',    icon: FaWater },
  { id: 'other',    label: 'Other',    icon: FaQuestion },
];

// ============================================================
// Helper Function
// ============================================================
const truncateAddress = (address: string | null | undefined, startLength = 4, endLength = 4): string => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};


// ============================================================
// DataCollectorPage Component
// ============================================================
export default function DataCollectorPage() {
  // --- Wallet Hooks ---
  const { publicKey, connected } = useWallet();

  // --- State ---
  const [collectionState, setCollectionState] = useState<CollectionState>('idle');
  const [selectedTerrain, setSelectedTerrain] = useState<string | null>(null);
  const [collectionStartTime, setCollectionStartTime] = useState<number | null>(null);
  const [collectionDuration, setCollectionDuration] = useState<number>(0);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [earnedKaika, setEarnedKaika] = useState<number | null>(null);
  const [mockKaikaBalance, setMockKaikaBalance] = useState(125);
  const [dataTransferAnimation, setDataTransferAnimation] = useState(false);
  const [userLogicPosition, setUserLogicPosition] = useState<Position>({ x: 50, y: 50 });
  const [currentLocationName, setCurrentLocationName] = useState<string>(CURRENT_LOCATION);
  const [dataCollected, setDataCollected] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [simulatedDataType, setSimulatedDataType] = useState<string | null>(null);

  // --- Refs ---
  const movementTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousPositionRef = useRef<Position>(userLogicPosition);
  // ★★★ currentDirectionRef の定義を追加 ★★★
  const currentDirectionRef = useRef({ x: 0, y: 1 }); // 初期方向 (例: Y軸プラス方向、つまり3D空間のZ軸プラス方向)

   // --- Memoized Values ---
   const selectedTerrainLabel = useMemo(() => {
       return terrains.find(t => t.id === selectedTerrain)?.label ?? 'Environment';
   }, [selectedTerrain]);


   // --- Helper: Find nearest landmark ---
   const findNearestLandmark = useCallback((x: number, y: number): string => {
    let minDistance = Infinity;
    let nearestName = "Tokyo Area";
    TOKYO_LANDMARKS.forEach(landmark => {
      const distance = Math.sqrt(Math.pow(x - landmark.x, 2) + Math.pow(y - landmark.y, 2));
      if (distance < minDistance) { minDistance = distance; nearestName = landmark.name; }
    });
    return minDistance < 15 ? `${nearestName} District` : "Tokyo Area";
  }, []); // Empty dependency array is correct here


  // --- Effects ---

  // Simulate user movement
  useEffect(() => {
    if (collectionState === 'collecting') {
      if (movementTimerRef.current) clearInterval(movementTimerRef.current);
      movementTimerRef.current = setInterval(() => {
        setUserLogicPosition(prevPos => {
          // --- 歩行風移動ロジック ---
          // 1. 時々、方向を少しランダムに変える
          if (Math.random() < 0.1) { // 10%の確率で方向転換
            const angleChange = (Math.random() - 0.5) * (Math.PI / 4); // 最大45度変更
            // currentDirectionRef を使用
            const currentAngle = Math.atan2(currentDirectionRef.current.y, currentDirectionRef.current.x);
            const newAngle = currentAngle + angleChange;
            currentDirectionRef.current = { x: Math.cos(newAngle), y: Math.sin(newAngle) };
          }

          // 2. 現在の方向に一定速度で進む
          const speed = 0.7 + (Math.random() - 0.5) * 0.2; // 少し変動する速度
          // currentDirectionRef を使用
          const moveX = currentDirectionRef.current.x * speed;
          const moveY = currentDirectionRef.current.y * speed;

          // 3. 新しい位置を計算 (境界チェック)
          const newX = Math.max(0, Math.min(100, prevPos.x + moveX));
          const newY = Math.max(0, Math.min(100, prevPos.y + moveY));
          const newPos = { x: newX, y: newY };

          // 4. 統計情報を更新
          const distance = Math.sqrt(moveX * moveX + moveY * moveY) / 5;
          setTotalDistance(prevDist => prevDist + distance);
          setDataCollected(prevData => prevData + Math.floor(Math.random() * 5) + 1);
          setCurrentLocationName(findNearestLandmark(newX, newY));

          // 前回の位置を更新 (次フレームの方向計算用)
          previousPositionRef.current = prevPos;

          return newPos; // 新しい位置を返す
        });
      }, 800); // 更新間隔
    } else {
      if (movementTimerRef.current) { clearInterval(movementTimerRef.current); movementTimerRef.current = null; }
    }
    return () => { if (movementTimerRef.current) clearInterval(movementTimerRef.current); };
  }, [collectionState, findNearestLandmark]); // findNearestLandmark dependency

  // Timer effect for collection duration display
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (collectionState === 'collecting' && collectionStartTime) {
      interval = setInterval(() => { setCollectionDuration(Math.floor((Date.now() - collectionStartTime) / 1000)); }, 1000);
    } else if (collectionState !== 'collecting' && interval) {
      clearInterval(interval);
    }
     if (collectionState === 'idle') { setCollectionDuration(0); }
    return () => { if (interval) clearInterval(interval); };
  }, [collectionState, collectionStartTime]);


  // --- Action Handlers ---
  const handleTerrainSelect = (terrainId: string) => { if (collectionState === 'idle') { setSelectedTerrain(terrainId); } };

  const handleStartCollection = () => {
    if (!connected) { alert("Please connect your wallet first."); return; }
    if (!selectedTerrain) { alert("Please select a terrain type first."); return; }
    if (collectionState !== 'idle') return;
    const terrainLabel = terrains.find(t => t.id === selectedTerrain)?.label ?? 'Generic';
    setCollectionState('collecting');
    setCollectionStartTime(Date.now());
    setSimulatedDataType(`${terrainLabel} Scan`);
    setCollectionDuration(0); setSubmissionStatus(null); setEarnedKaika(null);
    setDataCollected(0); setTotalDistance(0);
    previousPositionRef.current = userLogicPosition; // 開始時の位置を記録
    // アバターの位置はリセットしない
    console.log(`Data collection started for ${terrainLabel}...`);
  };

  const handleStopCollection = () => {
    if (collectionState !== 'collecting' || !collectionStartTime) return;
    const duration = Math.floor((Date.now() - collectionStartTime) / 1000);
    setCollectionDuration(duration);
    setCollectionState('collected');
    setCollectionStartTime(null);
    if (movementTimerRef.current) { clearInterval(movementTimerRef.current); movementTimerRef.current = null; }
    const reward = Math.max(MIN_KAIKA_REWARD, Math.floor(duration * KAIKA_REWARD_PER_SECOND + totalDistance * KAIKA_REWARD_PER_DISTANCE));
    setEarnedKaika(reward);
    console.log(`Collection stopped. Duration: ${duration}s, Distance: ${totalDistance.toFixed(2)}, Data: ${dataCollected}KB, Earned: ${reward} KAIKA`);
  };

  const handleSubmitData = () => {
    if (collectionState !== 'collected' || !connected || earnedKaika === null) return;
    setCollectionState('submitting');
    setSubmissionStatus("Packaging data...");
    setDataTransferAnimation(true); console.log("Submitting data...");
    setTimeout(() => {
      setSubmissionStatus("Uploading securely...");
      setTimeout(() => {
        setSubmissionStatus("Confirm transaction...");
        setTimeout(() => {
          setMockKaikaBalance(prev => prev + earnedKaika);
          setSubmissionStatus(`Success! +${earnedKaika} KAIKA`);
          setCollectionState('idle'); setDataTransferAnimation(false);
          setTimeout(() => { // Clear stats after showing success
            setSelectedTerrain(null); setSimulatedDataType(null); setEarnedKaika(null);
            setSubmissionStatus(null); setDataCollected(0); setTotalDistance(0);
          }, 2500);
          console.log("Data successfully submitted.");
        }, 2000 + Math.random() * 1000);
      }, 1500);
    }, 1000);
    setTimeout(() => setDataTransferAnimation(false), 5000); // Animation fallback stop
  };


  // --- Render Action Button ---
  const renderActionButton = useCallback(() => {
    let buttonText = ''; let clickHandler: () => void = () => {}; let buttonStyle = '';
    let key = collectionState; let isDisabled = false; let Icon = FiPlay;

    switch (collectionState) {
      case 'idle':
        buttonText = connected ? 'Start Collection' : 'Connect Wallet'; clickHandler = handleStartCollection;
        buttonStyle = styles.start; key = 'idle'; isDisabled = !connected || !selectedTerrain; Icon = FiPlay;
        break;
      case 'collecting':
        buttonText = `Stop (${collectionDuration}s)`; clickHandler = handleStopCollection;
        buttonStyle = styles.stop; key = 'collecting'; Icon = FiSquare;
        break;
      case 'collected':
        buttonText = `Submit & Claim ${earnedKaika ?? '-'} KAIKA`; clickHandler = handleSubmitData;
        buttonStyle = styles.submit; key = 'collected'; isDisabled = !connected || earnedKaika === null; Icon = FiUploadCloud;
        break;
      case 'submitting':
        buttonText = 'Processing...'; clickHandler = () => {}; buttonStyle = styles.processing;
        key = 'submitting'; isDisabled = true; Icon = FiLoader;
        break;
      default: return null;
    }
    return ( <motion.button key={key} onClick={clickHandler} disabled={isDisabled} className={`${styles.actionButton} ${buttonStyle}`} whileHover={!isDisabled ? { scale: 1.03, y: -2, transition: { duration: 0.1 } } : {}} whileTap={!isDisabled ? { scale: 0.97, transition: { duration: 0.1 } } : {}} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} title={collectionState === 'idle' && connected && !selectedTerrain ? "Select environment first" : ""} > <Icon className={collectionState === 'submitting' ? styles.spinner : ''} size="18" /> {buttonText} </motion.button> );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionState, collectionDuration, connected, earnedKaika, selectedTerrain]); // Dependencies ok


  // --- Calculate User Direction for Avatar ---
  const userDirection = useMemo(() => {
      const dx = userLogicPosition.x - previousPositionRef.current.x;
      const dz = userLogicPosition.y - previousPositionRef.current.y; // Logic Y -> World Z
      const length = Math.sqrt(dx * dx + dz * dz);
      // Return normalized direction or (0,0) if no movement
      return length > 0.01 ? { x: dx / length, z: dz / length } : { x: 0, z: 0 };
  }, [userLogicPosition]); // Depends only on userLogicPosition


  // --- Component Render ---
  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}> <span className={styles.logoIcon}>◈</span> <span className={styles.logoText}>KAIKA</span> </Link>
        <nav className={styles.nav}> <Link href="/app/haptic" className={styles.navLink}>Haptic Select</Link> </nav>
        <div className={styles.walletInfo}>
          {connected && publicKey && ( <span className={styles.walletAddress} title={publicKey.toBase58()}> {truncateAddress(publicKey.toBase58())} </span> )}
          <span className={styles.kaikaBalance}>◈ {mockKaikaBalance} KAIKA</span>
          <WalletMultiButtonDynamic className={styles.walletButton} />
        </div>
      </header>

      {/* Content */}
      <div className={styles.contentWrapper}>

         {/* Control Panel (Left Side) */}
          <motion.div
            className={styles.controlPanel}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className={styles.panelTitle}> <FiDatabase className={styles.panelIcon} /> Data Collector </h2>
            {/* Status Card */}
            <motion.div layout className={`${styles.statusCard} ${styles[collectionState]}`}>
                <div className={styles.statusDot}></div>
                <div className={styles.statusLabel}>Status</div>
                <div className={styles.statusValue}>
                  {collectionState === 'idle' && 'Standby'}
                  {collectionState === 'collecting' && 'Collecting'}
                  {collectionState === 'collected' && 'Complete'}
                  {collectionState === 'submitting' && 'Processing'}
                </div>
            </motion.div>

            {/* Terrain Selector */}
             <AnimatePresence>
             {collectionState === 'idle' && (
                 <motion.div
                    key="terrain-selector-integrated"
                    className={styles.terrainSelectorIntegrated}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto', transition: { delay: 0.1 } }}
                    exit={{ opacity: 0, height: 0 }}
                 >
                     <h3 className={styles.terrainTitle}>Select Data Environment</h3>
                     <div className={styles.terrainOptions}>
                         {terrains.map((terrain) => (
                            <motion.button
                                key={terrain.id}
                                className={`${styles.terrainButton} ${selectedTerrain === terrain.id ? styles.selected : ''}`}
                                onClick={() => handleTerrainSelect(terrain.id)}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.1 }}
                            >
                                <terrain.icon size={20} className={styles.terrainIcon} />
                                <span className={styles.terrainLabel}>{terrain.label}</span>
                            </motion.button>
                         ))}
                     </div>
                 </motion.div>
             )}
            </AnimatePresence>

            {/* Collection Info */}
            <motion.div layout className={styles.collectionInfo}>
              <div className={styles.infoItem}> <span className={styles.infoLabel}><FiMapPin size={12}/>Location</span> <span className={`${styles.infoValue} ${styles.highlight}`}>{currentLocationName}</span> </div>
              {(selectedTerrain || collectionState !== 'idle') && (
                <div className={styles.infoItem}> <span className={styles.infoLabel}><FiDatabase size={12}/>Type</span> <span className={styles.infoValue}>{simulatedDataType ?? 'N/A'}</span> </div>
              )}
              <AnimatePresence>
              {collectionState !== 'idle' && (
                <motion.div
                    layout key="stats"
                    initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                    style={{display: 'contents'}} // Use contents for grid layout
                >
                   <div className={styles.infoItem}> <span className={styles.infoLabel}><FiClock size={12}/>Time</span> <span className={styles.infoValue}>{collectionDuration}s</span> </div>
                   <div className={styles.infoItem}> <span className={styles.infoLabel}><FiTrendingUp size={12}/>Data</span> <span className={styles.infoValue}>{dataCollected.toLocaleString()} KB</span> </div>
                   <div className={styles.infoItem}> <span className={styles.infoLabel}><FiCompass size={12}/>Distance</span> <span className={styles.infoValue}>{totalDistance.toFixed(2)} km</span> </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>

            {/* Earned KAIKA Stats */}
            <AnimatePresence>
            {earnedKaika !== null && collectionState === 'idle' && ( // Show only after submission completed
              <motion.div
                layout key="earned-stats"
                className={styles.statsContainer}
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              >
                <div className={styles.statCard}> <div className={styles.statValue}>{earnedKaika}</div> <div className={styles.statLabel}>KAIKA Earned</div> </div>
                <div className={styles.statCard}> <div className={styles.statValue}>{mockKaikaBalance}</div> <div className={styles.statLabel}>New Balance</div> </div>
              </motion.div>
            )}
            </AnimatePresence>

            {/* Action buttons container */}
            <div style={{ marginTop: 'auto', paddingTop: '1rem' }}> {/* Push button to bottom */}
                <AnimatePresence mode="wait">
                    {renderActionButton()}
                </AnimatePresence>
            </div>

            {/* Submission status message */}
             <AnimatePresence>
             {submissionStatus && collectionState !== 'idle' && ( // Show status only during/after submission, before idle
              <motion.div
                 key="submission-status"
                 className={`${styles.submissionStatus} ${submissionStatus.includes('Success') ? styles.success : submissionStatus.includes('failed') ? styles.error : ''}`}
                 initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              >
                 {/* Icons based on status */}
                 {submissionStatus.includes('Success') ? <FiCheckCircle size={14}/> : submissionStatus.includes('failed') ? <FiAlertCircle size={14}/> : <FiLoader size={14} className={styles.spinner}/>}
                 <span style={{marginLeft: '0.5rem'}}>{submissionStatus}</span>
              </motion.div>
            )}
           </AnimatePresence>
          </motion.div> {/* End Control Panel */}

          {/* 3D Map Viewer Section (Right Side) */}
          <motion.div
            className={styles.dashboardContainer} // Container for the 3D view
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
             {/* Suspense for R3F loading state */}
             <Suspense fallback={
                 <div style={{height: '100%', background: 'var(--kaika-near-black, #111)', display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center', color: 'var(--kaika-light-grey, #aaa)', borderRadius: '16px'}}>
                     <FiLoader size={24} className={styles.spinner} style={{marginBottom: '1rem'}}/>
                     Loading 3D Environment...
                 </div>
             }>
                 {/* Pass collection state and direction to MapViewer3D */}
                 <MapViewer3D
                    userPosition={userLogicPosition}
                    collectionState={collectionState}
                    userDirection={userDirection} // Pass calculated direction
                 />
             </Suspense>
          </motion.div>

        </div> {/* End Content Wrapper */}
      </div> 
  ); // End of component return
} // End of component function