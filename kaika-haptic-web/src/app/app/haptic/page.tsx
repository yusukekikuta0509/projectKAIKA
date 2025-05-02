// src/app/app/haptic/page.tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup'; // Import CountUp if used (not used in this specific file currently)
import { SiSolana } from 'react-icons/si'; // Only used if network chip needed (currently not)

// --- Import Components ---
import DeviceConnectModal from '@/components/DeviceConnectModal'; // モーダルコンポーネント
import styles from './haptic.module.css';

// ============================================================
// Type Definitions
// ============================================================
interface Feeling {
  id: string;
  name: string;
  description: string;
  priceUSDC: number;
  owned: boolean;
  category: 'nature' | 'urban' | 'abstract';
  intensity: number; // 1-10
  attributes: {
    texture: number; // 1-10
    pressure: number; // 1-10
    temperature: number; // 1-10
  };
  videoSrc?: string; // 背景動画ファイルのパス (オプション)
}
interface Transaction {
  id: string;
  feelingId: string;
  amount: number; // USDC amount
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  txHash: string;
}
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'failed';
type PortfolioView = 'owned' | 'history';

// ============================================================
// Mock Data with Video Paths
// ============================================================
const initialFeelings: Feeling[] = [
  { id: 'beach_sand', name: 'Beach Sand', description: 'Warm sand flowing between your toes.', priceUSDC: 5.0, owned: true, category: 'nature', intensity: 6, attributes: { texture: 7, pressure: 4, temperature: 8 }, videoSrc: '/videos/beach.mp4' },
  { id: 'athens_cobblestone', name: 'Athens Cobblestone', description: 'Ancient, smooth worn streets.', priceUSDC: 7.5, owned: true, category: 'urban', intensity: 8, attributes: { texture: 9, pressure: 7, temperature: 6 }, videoSrc: '/videos/city_ancient.mp4' },
  { id: 'forest_floor', name: 'Forest Floor', description: 'Soft, damp earth, moss, and leaves.', priceUSDC: 6.0, owned: false, category: 'nature', intensity: 7, attributes: { texture: 8, pressure: 5, temperature: 4 }, videoSrc: '/videos/forest.mp4' },
  { id: 'grassy_field', name: 'Grassy Field', description: 'Tickling tall grass in a meadow.', priceUSDC: 4.5, owned: true, category: 'nature', intensity: 5, attributes: { texture: 6, pressure: 3, temperature: 7 }, videoSrc: '/videos/field.mp4' },
  { id: 'tokyo_asphalt', name: 'Tokyo Asphalt', description: 'Firm, pristine city streets.', priceUSDC: 8.0, owned: false, category: 'urban', intensity: 7, attributes: { texture: 5, pressure: 8, temperature: 6 }, videoSrc: '/videos/city_modern.mp4' },
  { id: 'gravel_path', name: 'Gravel Path', description: 'Crunchy, uneven small stones.', priceUSDC: 5.5, owned: false, category: 'nature', intensity: 8, attributes: { texture: 9, pressure: 7, temperature: 5 }, videoSrc: '/videos/mountain_path.mp4' },
  { id: 'quantum_flow', name: 'Quantum Flow', description: 'Otherworldly flowing particles.', priceUSDC: 12.5, owned: false, category: 'abstract', intensity: 9, attributes: { texture: 9, pressure: 8, temperature: 7 }, videoSrc: '/videos/abstract_flow.mp4' },
  { id: 'lunar_dust', name: 'Lunar Dust', description: 'Walking on the Moon in low gravity.', priceUSDC: 15.0, owned: false, category: 'abstract', intensity: 10, attributes: { texture: 10, pressure: 6, temperature: 2 }, videoSrc: '/videos/space.mp4' },
];

// Mock Transaction Data
const initialTransactions: Transaction[] = [
  { id: 'tx1', feelingId: 'beach_sand', amount: 5.0, timestamp: Date.now() - 259200000, status: 'confirmed', txHash: '5kFbQzX3bTfGqR8kL7nJpW1tZvY9xV6c2sA4hJdGfEwB' },
  { id: 'tx2', feelingId: 'athens_cobblestone', amount: 7.5, timestamp: Date.now() - 604800000, status: 'confirmed', txHash: '3mJhGtFvCbXnZq8wL9kRpT1yV7xW6dGfEwBqS9dLkPnM' },
  { id: 'tx3', feelingId: 'grassy_field', amount: 4.5, timestamp: Date.now() - 864000000, status: 'confirmed', txHash: '9pLoKiJuHyGtFrDeWsAqZxCvBnMjKlPoRtY6uI2oPzXe' },
  // Add a mock failed transaction for testing display
  { id: 'tx4', feelingId: 'forest_floor', amount: 6.0, timestamp: Date.now() - 3600000, status: 'failed', txHash: '2sAqZxCvBnMjKlPoRtY6uI2oPzXe9pLoKiJuHyGtFrDe' },
];

// ============================================================
// Helper Functions
// ============================================================
const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    try {
        // Use Intl for potentially better locale support, fallback if error
        return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(date);
    } catch (e) {
        console.warn("Intl.DateTimeFormat failed, using toLocaleString fallback.");
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

const truncateAddress = (address: string | null | undefined, startLength = 4, endLength = 4): string => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};


// ============================================================
// HapticPage Component
// ============================================================
export default function HapticPage() {
  // --- Wallet Hook ---
  const { publicKey, connected } = useWallet();

  // --- State ---
  const [hapticIntensity, setHapticIntensity] = useState(50);
  const [availableFeelings, setAvailableFeelings] = useState<Feeling[]>(initialFeelings);
  const [selectedFeelingId, setSelectedFeelingId] = useState<string | null>(null);
  const [loadingFeelingId, setLoadingFeelingId] = useState<string | null>(null);
  const [purchasingFeelingId, setPurchasingFeelingId] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<string | null>(null);
  const [mockKaikaBalance, setMockKaikaBalance] = useState(125);
  const [mockUSDCBalance, setMockUSDCBalance] = useState(50);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'nature' | 'urban' | 'abstract'>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentActiveZone, setCurrentActiveZone] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceConnectionStatus, setDeviceConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [backgroundVideoUrl, setBackgroundVideoUrl] = useState<string | null>(null);
  const [isHapticOn, setIsHapticOn] = useState(false); // Linked to deviceConnectionStatus
  const [portfolioView, setPortfolioView] = useState<PortfolioView>('owned');

  // --- Refs ---
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  // --- Effects ---

  // Background Video Effect
  useEffect(() => {
    const selectedFeeling = availableFeelings.find(f => f.id === selectedFeelingId);
    const newVideoUrl = selectedFeeling?.videoSrc || null; // Default to null
    setBackgroundVideoUrl(newVideoUrl);

    // Play/Pause videos based on selection
    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (videoEl) {
        if (videoEl.src.endsWith(newVideoUrl ?? '___nevermatch___')) {
          videoEl.play().catch(e => console.warn("Video play failed (user interaction might be needed):", e));
        } else {
          // Only pause if it was actually playing to avoid unnecessary calls
          if (!videoEl.paused) {
             videoEl.pause();
             videoEl.currentTime = 0; // Optional: Reset video time when paused
          }
        }
      }
    });
  }, [selectedFeelingId, availableFeelings]);

  // Playback Zone Effect
  useEffect(() => {
    let zoneInterval: NodeJS.Timeout | null = null;
    if (isPlaying && deviceConnectionStatus === 'connected') {
      zoneInterval = setInterval(() => {
        const zones = ['zone1', 'zone2', 'zone3', 'zone4'];
        const randomZone = zones[Math.floor(Math.random() * zones.length)];
        setCurrentActiveZone(randomZone);
        setTimeout(() => {
          if (isPlaying) setCurrentActiveZone(null); // Clear only if still playing
        }, 500);
      }, 1500); // Activate every 1.5 seconds
    } else {
      if (zoneInterval) clearInterval(zoneInterval);
      setCurrentActiveZone(null);
    }
    return () => { if (zoneInterval) clearInterval(zoneInterval); };
  }, [isPlaying, deviceConnectionStatus]);

  // Update haptic intensity variable for potential CSS use
   useEffect(() => {
        document.documentElement.style.setProperty('--haptic-intensity', (hapticIntensity / 100).toString());
   }, [hapticIntensity]);

   // Update haptic color variable based on selection
    useEffect(() => {
        const selectedFeeling = availableFeelings.find(f => f.id === selectedFeelingId);
        let primaryColor = 'rgba(255,107,0,.15)'; // Default orange
         if (selectedFeeling) {
            if (selectedFeeling.category === 'nature') primaryColor = 'rgba(76,175,80,.15)';
            else if (selectedFeeling.category === 'urban') primaryColor = 'rgba(33,150,243,.15)';
            else if (selectedFeeling.category === 'abstract') primaryColor = 'rgba(156,39,176,.2)';
         }
        document.documentElement.style.setProperty('--haptic-color', primaryColor);
    }, [selectedFeelingId, availableFeelings]);


  // --- Handlers ---
  const openConnectModal = () => setIsModalOpen(true);
  const closeConnectModal = () => setIsModalOpen(false);

  // Device Connection Logic (Simulated)
  const handleConnectDevice = useCallback(async (): Promise<boolean> => {
    setDeviceConnectionStatus('connecting');
    console.log("Attempting to connect device...");
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.15; // 85% success rate
        if (success) {
          setDeviceConnectionStatus('connected');
          setIsHapticOn(true);
          console.log("Device connected successfully.");
          setTimeout(closeConnectModal, 1200);
          resolve(true);
        } else {
          setDeviceConnectionStatus('failed');
          setIsHapticOn(false);
          console.log("Device connection failed.");
          // Keep modal open on failure for retry
          resolve(false);
        }
      }, 2000 + Math.random() * 1000);
    });
  }, []); // No dependencies needed for this simulation

  // Device Disconnect Logic
  const handleDisconnectDevice = () => {
    setDeviceConnectionStatus('disconnected');
    setIsHapticOn(false);
    setIsPlaying(false);
    setCurrentActiveZone(null);
    setSelectedFeelingId(null); // Deselect feeling
    setBackgroundVideoUrl(null); // Reset background
    console.log("Device disconnected.");
  };

  // Intensity Change Handler
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHapticIntensity(parseInt(e.target.value));
  };

  // Marketplace Category Filter Handler
  const handleCategoryChange = (category: 'all' | 'nature' | 'urban' | 'abstract') => {
    setSelectedCategory(category);
  };

  // Select Feeling Handler (for owned items)
  const handleSelectFeeling = (feelingId: string) => {
    const feeling = availableFeelings.find(f => f.id === feelingId);
    if (deviceConnectionStatus !== 'connected') {
        setPurchaseStatus("Please connect your KAIKA device first.");
        setTimeout(() => setPurchaseStatus(null), 3000);
        return;
    }
     if (!feeling || !feeling.owned || loadingFeelingId || purchasingFeelingId) {
        return;
    }
    setLoadingFeelingId(feelingId);
    setPurchaseStatus(null);
    console.log(`Loading feeling: ${feeling.name}`);
    setTimeout(() => {
      setSelectedFeelingId(feelingId);
      setLoadingFeelingId(null);
      setIsPlaying(false); // Stop playback on new selection
      setCurrentActiveZone(null);
      console.log(`Selected feeling: ${feeling.name}`);
    }, 800);
  };

  // Purchase Feeling Handler
  const handlePurchaseFeeling = (feelingId: string) => {
    const feeling = availableFeelings.find(f => f.id === feelingId);
    if (!feeling || feeling.owned || loadingFeelingId || purchasingFeelingId) return;
    if (!connected || !publicKey) {
      setPurchaseStatus("Please connect your wallet to purchase.");
      setTimeout(() => setPurchaseStatus(null), 4000);
      return;
    }
    if (mockUSDCBalance < feeling.priceUSDC) {
      setPurchaseStatus(`Insufficient USDC balance. Required: ${feeling.priceUSDC.toFixed(2)}, Available: ${mockUSDCBalance.toFixed(2)}`);
      setTimeout(() => setPurchaseStatus(null), 4000);
      return;
    }

    setPurchasingFeelingId(feelingId);
    setPurchaseStatus(`Processing purchase for ${feeling.name}...`);
    console.log(`Attempting purchase: ${feeling.name}`);

    // Purchase Simulation
    setTimeout(() => {
      setPurchaseStatus("Generating transaction...");
      console.log("Generating transaction...");
      setTimeout(() => {
        setPurchaseStatus("Please confirm transaction in your wallet...");
        console.log("Waiting for wallet confirmation...");
        setTimeout(() => {
          const isSuccess = Math.random() > 0.15;
          const newTxHash = 'sim_' + Array.from({ length: 30 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join('');

          if (isSuccess) {
            console.log(`Purchase transaction confirmed: ${newTxHash}`);
            setMockUSDCBalance(prev => prev - feeling.priceUSDC);
            setMockKaikaBalance(prev => prev + Math.floor(feeling.priceUSDC / 2));
            setAvailableFeelings(prevFeelings =>
              prevFeelings.map(f => f.id === feelingId ? { ...f, owned: true } : f)
            );
            const newTx: Transaction = {
              id: `tx${Date.now()}`, feelingId: feelingId, amount: feeling.priceUSDC,
              timestamp: Date.now(), status: 'confirmed', txHash: newTxHash
            };
            setTransactions(prev => [newTx, ...prev]);
            setPurchaseStatus(`Purchase successful! '${feeling.name}' added to your portfolio. Tx: ${truncateAddress(newTxHash)}`);
          } else {
            console.log("Purchase transaction failed.");
            setPurchaseStatus("Transaction failed. Please try again.");
            const failedTx: Transaction = {
              id: `tx${Date.now()}`, feelingId: feelingId, amount: feeling.priceUSDC,
              timestamp: Date.now(), status: 'failed', txHash: newTxHash
            };
            setTransactions(prev => [failedTx, ...prev]);
          }
          setPurchasingFeelingId(null);
          setTimeout(() => setPurchaseStatus(null), 5000);
        }, 3000 + Math.random() * 2000);
      }, 1500);
    }, 500);
  };

  // Toggle Playback Handler
  const togglePlayback = () => {
    if (deviceConnectionStatus !== 'connected' || !selectedFeelingId) {
        if (deviceConnectionStatus !== 'connected') {
            openConnectModal(); // Prompt to connect
        }
        return;
    }
    const newState = !isPlaying;
    setIsPlaying(newState);
    console.log(newState ? `Playing feeling: ${selectedFeeling?.name}` : `Stopped feeling: ${selectedFeeling?.name}`);
    if (!newState) {
      setCurrentActiveZone(null);
    }
    // TODO: Send play/stop command to actual device
  };

  // --- Filtered Feelings ---
  const marketplaceFeelings = availableFeelings.filter(feeling =>
    !feeling.owned && (selectedCategory === 'all' || feeling.category === selectedCategory)
  );
  const ownedFeelings = availableFeelings.filter(feeling => feeling.owned);

  // --- Get Currently Selected Feeling Details ---
  const selectedFeeling = availableFeelings.find(f => f.id === selectedFeelingId);

  // --- Render ---
  return (
    <div className={styles.main}>
      {/* --- Backgrounds --- */}
      <div className={styles.backgroundVideoContainer}>
        {initialFeelings.map(f => f.videoSrc && (
          <video
            key={f.id}
            ref={el => { if (el) videoRefs.current[f.id] = el; }} // Assign ref
            className={`${styles.backgroundVideo} ${backgroundVideoUrl === f.videoSrc ? styles.visible : ''}`}
            src={f.videoSrc}
            autoPlay
            loop
            muted // Mute background videos
            playsInline
          />
        ))}
      </div>
      <div className={styles.dotGrid} aria-hidden />
      {/* --- Particle Effects --- */}
      {isHapticOn && (
        <div className={styles.particleContainer}>
          {/* Generate multiple particles dynamically or use CSS pseudo-elements */}
          <div className={`${styles.particleEffect} ${isPlaying ? styles.active : ''}`}></div>
        </div>
      )}

      {/* --- Header --- */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
           <Image src="/kaika_logo.png" alt="KAIKA" width={80} height={30} priority />
        </Link>
        <Link href="/app/datacollector" className={styles.dataCollectorLink}>
         Collect Data
       </Link>
        <div className={styles.walletInfo}>
          {connected && publicKey && (
            <div className={styles.balanceContainer}>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>USDC</span>
                <span className={styles.balanceValue}>${mockUSDCBalance.toFixed(2)}</span>
              </div>
              <div className={styles.balanceItem}>
                <span className={styles.balanceLabel}>KAIKA</span>
                <span className={styles.kaikaBalance}>◎ {mockKaikaBalance}</span>
              </div>
            </div>
          )}
           <button
             onClick={deviceConnectionStatus === 'connected' ? handleDisconnectDevice : openConnectModal}
             className={`${styles.connectDeviceButton} ${styles[deviceConnectionStatus]}`}
             disabled={deviceConnectionStatus === 'connecting'}
           >
             {deviceConnectionStatus === 'connecting' && <div className={styles.connectionSpinner}></div>}
             {deviceConnectionStatus === 'connected' ? 'Device Connected' :
              deviceConnectionStatus === 'connecting' ? 'Connecting...' : 'Connect Device'}
           </button>
          {connected && publicKey && (
            <span className={styles.walletAddress} title={publicKey.toBase58()}>
              {truncateAddress(publicKey.toBase58())}
            </span>
          )}
          <WalletMultiButton className={styles.walletButton} id="wallet-connect-button" />
        </div>
      </header>

      {/* --- Content Wrapper --- */}
      <div className={styles.contentWrapper}>
        {/* --- Left Panel: Controls + Visualizer --- */}
        <div className={styles.controlPanel}>
          {/* Haptic Controls Section */}
          <section className={`${styles.section} ${styles.controls}`}>
            <h2>Haptic Control</h2>
            <div className={styles.controlsGrid}>
              <div className={styles.controlItem}>
                <label htmlFor="intensitySlider" className={styles.sliderLabel}>Intensity</label>
                <input
                    id="intensitySlider"
                    type="range" min="0" max="100"
                    value={hapticIntensity}
                    onChange={handleIntensityChange}
                    className={styles.slider}
                    disabled={deviceConnectionStatus !== 'connected'}
                />
                <div className={styles.sliderValue}>{hapticIntensity}%</div>
              </div>
            </div>
          </section>

          {/* Visualizer Section */}
          <section className={`${styles.section} ${styles.visualizer}`}>
             <h2>Haptic Visualizer</h2>
             {selectedFeeling ? (
                 <div className={styles.visualizerContent}>
                    {/* Feeling Details */}
                     <div className={styles.feelingDetails}>
                        <div className={styles.feelingTitle}>
                          <span className={styles.feelingNameLarge}>{selectedFeeling.name}</span>
                          <span className={`${styles.feelingCategoryTag} ${styles[selectedFeeling.category]}`}>
                            {selectedFeeling.category}
                          </span>
                        </div>
                        <p className={styles.feelingDescriptionLarge}>{selectedFeeling.description}</p>
                     </div>
                     {/* Attribute Bars */}
                     <div className={styles.attributesGrid}>
                        <div className={styles.attributeItem}>
                            <span className={styles.attributeLabel}>Texture</span>
                            <div className={styles.attributeBar}><div className={styles.attributeFill} style={{ width: `${selectedFeeling.attributes.texture * 10}%` }}></div></div>
                            <span className={styles.attributeValue}>{selectedFeeling.attributes.texture}</span>
                        </div>
                        <div className={styles.attributeItem}>
                            <span className={styles.attributeLabel}>Pressure</span>
                            <div className={styles.attributeBar}><div className={styles.attributeFill} style={{ width: `${selectedFeeling.attributes.pressure * 10}%` }}></div></div>
                            <span className={styles.attributeValue}>{selectedFeeling.attributes.pressure}</span>
                        </div>
                        <div className={styles.attributeItem}>
                            <span className={styles.attributeLabel}>Temperature</span>
                            <div className={styles.attributeBar}>
                                <div className={`${styles.attributeFill} ${styles.temperatureFill}`} style={{ width: `${selectedFeeling.attributes.temperature * 10}%`, backgroundColor: `hsl(${selectedFeeling.attributes.temperature > 5 ? 25 : 200}, 80%, 50%)` }}></div>
                            </div>
                            <span className={styles.attributeValue}>{selectedFeeling.attributes.temperature}</span>
                        </div>
                     </div>
                     {/* Playback Button */}
                     <div className={styles.playbackControls}>
                          <button
                              onClick={togglePlayback}
                              className={`${styles.playButton} ${isPlaying ? styles.playing : ''}`}
                              disabled={deviceConnectionStatus !== 'connected' || !selectedFeelingId}
                          >
                              {isPlaying ? 'Stop Experience' : 'Play Experience'}
                          </button>
                      </div>
                     {/* Haptic Zones */}
                     <div className={styles.hapticZones}>
                        <div className={`${styles.zone} ${currentActiveZone === 'zone1' ? styles.active : ''}`} id="zone1"></div>
                        <div className={`${styles.zone} ${currentActiveZone === 'zone2' ? styles.active : ''}`} id="zone2"></div>
                        <div className={`${styles.zone} ${currentActiveZone === 'zone3' ? styles.active : ''}`} id="zone3"></div>
                        <div className={`${styles.zone} ${currentActiveZone === 'zone4' ? styles.active : ''}`} id="zone4"></div>
                      </div>
                     {/* Device Status */}
                     <div className={styles.deviceStatus}>
                         <span className={`${styles.statusIndicator} ${deviceConnectionStatus === 'connected' ? styles.connected : styles.disconnected}`}></span>
                         <span className={styles.statusText}>
                           {deviceConnectionStatus === 'connected' ? 'Device connected' : deviceConnectionStatus === 'connecting' ? 'Connecting...' : 'Device disconnected'}
                         </span>
                         {isPlaying && deviceConnectionStatus === 'connected' && (
                           <span className={styles.transmittingText}>Transmitting...</span>
                         )}
                     </div>
                 </div>
             ) : (
                 <div className={styles.placeholderText}>
                     {deviceConnectionStatus === 'connected'
                       ? "Select a feeling from your portfolio to visualize and play."
                       : "Connect your KAIKA device to begin."}
                 </div>
             )}
          </section>
        </div>

        {/* --- Right Panel: Marketplace / Portfolio / Info --- */}
        <div className={styles.contentPanel}>
           {/* Purchase Status Message */}
           <AnimatePresence>
             {purchaseStatus && (
               <motion.div
                 key="purchase-status"
                 className={`${styles.statusMessage} ${
                    purchaseStatus.includes('successful') ? styles.success :
                    purchaseStatus.includes('failed') || purchaseStatus.includes('Insufficient') ? styles.error : styles.pending
                 }`}
                 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
               >
                 {purchaseStatus}
               </motion.div>
             )}
           </AnimatePresence>

           {/* --- Your Portfolio Section --- */}
           <section className={`${styles.section} ${styles.feelingsSection}`}>
              <div className={styles.sectionHeader}>
                <h2>Your Portfolio</h2>
                <button className={styles.toggleViewButton} onClick={() => setPortfolioView(portfolioView === 'owned' ? 'history' : 'owned')}>
                    {portfolioView === 'owned' ? 'Show Purchase History' : 'Show Owned Feelings'}
                </button>
              </div>

              <AnimatePresence mode="wait">
                {portfolioView === 'owned' ? (
                    <motion.div key="owned-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                        <ul className={styles.feelingsGrid}>
                            {ownedFeelings.length > 0 ? ownedFeelings.map((feeling) => (
                                <motion.li key={feeling.id} className={`${styles.feelingGridItem} ${selectedFeelingId === feeling.id ? styles.selected : ''} ${styles.owned} ${styles[feeling.category]}`} layout>
                                    <div className={styles.feelingContent}>
                                        <div className={styles.feelingInfo}>
                                            <div className={styles.feelingHeader}>
                                                <span className={styles.feelingName}>{feeling.name}</span>
                                            </div>
                                            <p className={styles.feelingDescription}>{feeling.description}</p>
                                            <div className={styles.feelingMetrics}>
                                                <div className={styles.metric}><span className={styles.metricLabel}>Intensity</span><span className={styles.metricValue}>{feeling.intensity}/10</span></div>
                                            </div>
                                        </div>
                                        <div className={styles.buttons}>
                                            <AnimatePresence>
                                            {loadingFeelingId === feeling.id ? (
                                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className={styles.loader}></div></motion.div>
                                            ) : (
                                                <motion.button key="select-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handleSelectFeeling(feeling.id)} disabled={deviceConnectionStatus !== 'connected' || selectedFeelingId === feeling.id || !!loadingFeelingId} className={`${styles.actionButton} ${selectedFeelingId === feeling.id ? styles.selected : ''}`}>
                                                    {selectedFeelingId === feeling.id ? 'Selected' : 'Select'}
                                                </motion.button>
                                            )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                    <div className={styles.nftBadge} title="You own the NFT for this haptic feeling">NFT</div>
                                </motion.li>
                            )) : <p className={styles.placeholderText} style={{ gridColumn: '1 / -1' }}>Purchase feelings from the marketplace to build your portfolio.</p>}
                        </ul>
                    </motion.div>
                ) : (
                    <motion.div key="history-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className={styles.transactionHistory}>
                         {transactions.length > 0 ? (
                             <ul className={styles.transactionList}>
                                 {transactions.map(tx => {
                                     const txFeeling = availableFeelings.find(f => f.id === tx.feelingId);
                                     return (
                                         <li key={tx.id} className={styles.transactionItem}>
                                             <div className={styles.transactionInfo}>
                                                 <span className={styles.transactionName}>{txFeeling?.name || 'Unknown Feeling'} Purchase</span>
                                                 <span className={styles.transactionDate}>{formatDate(tx.timestamp)}</span>
                                             </div>
                                             <div className={styles.transactionDetails}>
                                                 <span className={styles.transactionAmount}>${tx.amount.toFixed(2)} USDC</span>
                                                 <a href={`https://solscan.io/tx/${tx.txHash}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className={styles.transactionHash} title={tx.txHash}> Tx: {truncateAddress(tx.txHash, 6, 4)} </a>
                                                 <span className={`${styles.transactionStatus} ${styles[tx.status]}`}>{tx.status}</span>
                                             </div>
                                         </li>
                                     );
                                 })}
                             </ul>
                         ) : ( <p className={styles.noTransactions}>No purchase history yet.</p> )}
                    </motion.div>
                )}
              </AnimatePresence>
           </section>

           {/* --- Marketplace Section --- */}
           <section className={`${styles.section} ${styles.feelingsSection}`}>
              <div className={styles.sectionHeader}>
                <h2>Marketplace</h2>
                 <div className={styles.categoryFilters}>
                    <button className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`} onClick={() => handleCategoryChange('all')}>All</button>
                    <button className={`${styles.categoryButton} ${selectedCategory === 'nature' ? styles.active : ''}`} onClick={() => handleCategoryChange('nature')}>Nature</button>
                    <button className={`${styles.categoryButton} ${selectedCategory === 'urban' ? styles.active : ''}`} onClick={() => handleCategoryChange('urban')}>Urban</button>
                    <button className={`${styles.categoryButton} ${selectedCategory === 'abstract' ? styles.active : ''}`} onClick={() => handleCategoryChange('abstract')}>Abstract</button>
                 </div>
              </div>
              <ul className={styles.feelingsGrid}>
                {marketplaceFeelings.length > 0 ? marketplaceFeelings.map((feeling) => (
                  <motion.li key={feeling.id} className={`${styles.feelingGridItem} ${styles.notOwned} ${styles[feeling.category]}`} layout>
                    <div className={styles.feelingContent}>
                      <div className={styles.feelingInfo}>
                            <div className={styles.feelingHeader}> <span className={styles.feelingName}>{feeling.name}</span> </div>
                            <p className={styles.feelingDescription}>{feeling.description}</p>
                            <div className={styles.feelingMetrics}> <div className={styles.metric}><span className={styles.metricLabel}>Intensity</span><span className={styles.metricValue}>{feeling.intensity}/10</span></div> </div>
                       </div>
                      <span className={styles.feelingPrice}>${feeling.priceUSDC.toFixed(2)} USDC</span>
                      <div className={styles.buttons}>
                         <AnimatePresence>
                         {purchasingFeelingId === feeling.id ? (
                             <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className={styles.loader}></div></motion.div>
                         ) : (
                             <motion.button key="buy-button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => handlePurchaseFeeling(feeling.id)} className={`${styles.purchaseButton}`} disabled={!!purchasingFeelingId || !connected} >
                                {`Buy for $${feeling.priceUSDC.toFixed(2)}`}
                             </motion.button>
                         )}
                         </AnimatePresence>
                      </div>
                    </div>
                  </motion.li>
                )) : ( <p className={styles.placeholderText} style={{ gridColumn: '1 / -1' }}> No items match the current filter in the marketplace. </p> )}
              </ul>
           </section>

           {/* --- Premium Section --- */}
           <section className={`${styles.section} ${styles.premiumSection}`}>
              <div className={styles.premiumBanner}>
                <h3>Premium Haptic Experiences</h3>
                <p>Coming soon - Join the waitlist for exclusive tactile sensations and early access.</p>
                <button className={styles.waitlistButton}>Join Waitlist</button>
              </div>
            </section>

           {/* --- Contract Info Section --- */}
           <section className={`${styles.section} ${styles.contractInfo}`}>
               <h2>Platform Information</h2>
               <div className={styles.contractGrid}>
                 <div className={styles.contractItem}> <span className={styles.contractLabel}>NFT Contract</span> <span className={styles.contractValue} title="MockContractAddressHKAnft...dEvN">HKAn...dEvN</span> </div>
                 <div className={styles.contractItem}> <span className={styles.contractLabel}>Total Experiences</span> <span className={styles.contractValue}>{availableFeelings.length}</span> </div>
                 <div className={styles.contractItem}> <span className={styles.contractLabel}>Your Collection</span> <span className={styles.contractValue}>{ownedFeelings.length}</span> </div>
                 <div className={styles.contractItem}> <span className={styles.contractLabel}>Network</span> <span className={styles.contractValue}>Solana Devnet</span> </div>
               </div>
             </section>
        </div>
      </div>

      {/* --- Device Connect Modal --- */}
      <DeviceConnectModal
        isOpen={isModalOpen}
        onRequestClose={closeConnectModal}
        onConnect={handleConnectDevice}
        connectionStatus={deviceConnectionStatus}
      />
    </div>
  );
}