// src/app/app/datacollector/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import styles from './datacollector.module.css';

// Collection state type definition
type CollectionState = 'idle' | 'collecting' | 'collected' | 'submitting';

// Position type definition
type Position = {
  x: number;
  y: number;
};

// Tokyo landmark data (relative coordinates on map)
const TOKYO_LANDMARKS = [
  { name: "Shinjuku", x: 30, y: 35 },
  { name: "Shibuya", x: 40, y: 50 },
  { name: "Tokyo Station", x: 60, y: 45 },
  { name: "Ikebukuro", x: 25, y: 20 },
  { name: "Ueno", x: 65, y: 25 },
  { name: "Akihabara", x: 58, y: 35 },
  { name: "Shinagawa", x: 55, y: 70 },
  { name: "Roppongi", x: 50, y: 55 },
];

export default function DataCollectorPage() {
  // --- Wallet Hooks ---
  const { publicKey, connected } = useWallet();

  // --- State ---
  const [collectionState, setCollectionState] = useState<CollectionState>('idle');
  const [simulatedDataType, setSimulatedDataType] = useState<string | null>(null);
  const [collectionStartTime, setCollectionStartTime] = useState<number | null>(null);
  const [collectionDuration, setCollectionDuration] = useState<number>(0); // seconds
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [earnedKaika, setEarnedKaika] = useState<number | null>(null);
  const [mockKaikaBalance, setMockKaikaBalance] = useState(125);
  const [dataTransferAnimation, setDataTransferAnimation] = useState(false);
  
  // --- Map related state ---
  const [userPosition, setUserPosition] = useState<Position>({ x: 45, y: 40 }); // Initial position near Tokyo center
  const [pathHistory, setPathHistory] = useState<Position[]>([]);
  const [currentLocation, setCurrentLocation] = useState<string>("Tokyo Area");
  const [dataCollected, setDataCollected] = useState<number>(0); // Amount of data collected
  const [totalDistance, setTotalDistance] = useState<number>(0); // Total distance moved
  const [mapRotation, setMapRotation] = useState<number>(0); // 3D effect for map
  const [mapTilt, setMapTilt] = useState<number>(20); // Tilt effect for 3D view
  
  // Refs for map size and canvas
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const pathCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapSvgRef = useRef<SVGSVGElement>(null);
  
  // Timer ref for movement simulation
  const movementTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Initialization ---
  useEffect(() => {
    // Initialize canvas
    updatePathCanvas();
    
    // Add 3D perspective effect on mouse move
    const handleMouseMove = (e: MouseEvent) => {
      if (!mapContainerRef.current) return;
      
      const rect = mapContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const maxRotation = 1.5; // Limit rotation degree
      const rotationX = ((e.clientY - centerY) / rect.height) * maxRotation;
      const rotationY = ((centerX - e.clientX) / rect.width) * maxRotation;
      
      if (mapSvgRef.current) {
        mapSvgRef.current.style.transform = `perspective(1200px) rotateX(${rotationX + mapTilt}deg) rotateY(${rotationY}deg)`;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      // Cleanup
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mapTilt]);

  // Update path canvas
  const updatePathCanvas = () => {
    if (!pathCanvasRef.current || pathHistory.length < 2) return;
    
    const canvas = pathCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Match canvas size to container
    if (mapContainerRef.current) {
      canvas.width = mapContainerRef.current.clientWidth;
      canvas.height = mapContainerRef.current.clientHeight;
    }
    
    // Draw path with glow effect
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Create glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 107, 0, 0.6)";
    
    ctx.beginPath();
    ctx.moveTo(pathHistory[0].x * canvas.width / 100, pathHistory[0].y * canvas.height / 100);
    
    for (let i = 1; i < pathHistory.length; i++) {
      ctx.lineTo(pathHistory[i].x * canvas.width / 100, pathHistory[i].y * canvas.height / 100);
    }
    
    ctx.strokeStyle = '#ff6b00';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw data points along the path
    pathHistory.forEach((point, index) => {
      if (index % 3 === 0) { // Draw only some points for better performance
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width / 100, 
          point.y * canvas.height / 100, 
          2, 0, Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fill();
      }
    });
  };

  // Update canvas when path history changes
  useEffect(() => {
    updatePathCanvas();
  }, [pathHistory]);

  // Simulate periodic position updates during collection
  useEffect(() => {
    if (collectionState === 'collecting') {
      // Clear existing timer
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
      }
      
      // Start new movement simulation
      movementTimerRef.current = setInterval(() => {
        // Move in a slightly random direction
        const moveX = (Math.random() - 0.5) * 3;
        const moveY = (Math.random() - 0.5) * 3;
        
        // Calculate new position (keep within map boundaries)
        const newX = Math.max(0, Math.min(100, userPosition.x + moveX));
        const newY = Math.max(0, Math.min(100, userPosition.y + moveY));
        
        // Update position
        setUserPosition({ x: newX, y: newY });
        
        // Add to path history
        setPathHistory(prev => [...prev, { x: newX, y: newY }]);
        
        // Calculate distance moved
        const distance = Math.sqrt(moveX * moveX + moveY * moveY);
        setTotalDistance(prev => prev + distance);
        
        // Update data collection amount
        setDataCollected(prev => prev + Math.floor(Math.random() * 10) + 5);
        
        // Find nearest landmark and update current location
        const nearestLandmark = findNearestLandmark(newX, newY);
        setCurrentLocation(nearestLandmark);
        
        // Slightly adjust map tilt for dynamic effect
        setMapTilt(prev => prev + (Math.random() - 0.5) * 0.1);
      }, 1000);
    } else {
      // Clear timer when collection stops
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
        movementTimerRef.current = null;
      }
    }
    
    return () => {
      if (movementTimerRef.current) {
        clearInterval(movementTimerRef.current);
      }
    };
  }, [collectionState, userPosition]);

  // Find nearest landmark
  const findNearestLandmark = (x: number, y: number): string => {
    let minDistance = Infinity;
    let nearestName = "Tokyo Area";
    
    TOKYO_LANDMARKS.forEach(landmark => {
      const distance = Math.sqrt(
        Math.pow(x - landmark.x, 2) + Math.pow(y - landmark.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestName = landmark.name;
      }
    });
    
    // Return "Area" if no landmark is close
    return minDistance < 15 ? `${nearestName} District` : "Tokyo Area";
  };

  // Reset map
  const resetMap = () => {
    setUserPosition({ x: 45, y: 40 });
    setPathHistory([]);
    setCurrentLocation("Tokyo Area");
    setMapTilt(20);
    updatePathCanvas();
  };

  // --- Handlers ---
  const handleStartCollection = () => {
    if (!connected) {
      alert("Please connect your wallet to start data collection.");
      return;
    }
    
    // Set collection start state
    setCollectionState('collecting');
    setCollectionStartTime(Date.now());
    setSimulatedDataType(getRandomDataType());
    setCollectionDuration(0);
    setSubmissionStatus(null);
    setEarnedKaika(null);
    
    // Reset data statistics
    setDataCollected(0);
    setTotalDistance(0);
    
    // Reset position history and add current point
    setPathHistory([userPosition]);
    
    console.log("Data collection started...");
  };

  const handleStopCollection = () => {
    if (collectionState !== 'collecting' || !collectionStartTime) return;
    
    // Calculate collection time
    const duration = Math.floor((Date.now() - collectionStartTime) / 1000);
    setCollectionDuration(duration);
    setCollectionState('collected');
    setCollectionStartTime(null);
    
    console.log(`Data collection stopped. Duration: ${duration} seconds`);
  };

  const handleSubmitData = () => {
    if (collectionState !== 'collected' || !connected) return;

    setCollectionState('submitting');
    setSubmissionStatus("Preparing data upload...");
    setDataTransferAnimation(true);
    console.log("Submitting data...");

    // Simulate data upload & transaction
    setTimeout(() => {
      setSubmissionStatus("Uploading data to IPFS (simulation)...");
      setTimeout(() => {
        setSubmissionStatus("Please approve transaction in your wallet...");
        setTimeout(() => {
          // Success scenario
          // Calculate reward based on time and distance
          const reward = Math.max(5, Math.floor(collectionDuration * 0.3 + totalDistance * 0.5));
          setEarnedKaika(reward);
          setMockKaikaBalance(prev => prev + reward);
          setSubmissionStatus(`Success! You've earned ${reward} KAIKA!`);
          setCollectionState('idle');
          setCollectionDuration(0);
          setSimulatedDataType(null);
          setDataTransferAnimation(false);
          console.log("Data successfully submitted.");
        }, 2500);
      }, 1500);
    }, 1000);
  };

  // Get random data type
  const getRandomDataType = () => {
    const types = ['Urban Sidewalk', 'Park Pathway', 'Office Flooring', 'Wooden Floor', 'Tiled Surface'];
    return types[Math.floor(Math.random() * types.length)];
  };

  // Timer effect during collection
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

  // --- Rendering ---
  return (
    <div className={styles.main}>
      {/* Header */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>◈</span>
          <span className={styles.logoText}>KAIKA</span>
        </Link>
        <nav className={styles.nav}>
          <Link href="/app/haptic" className={styles.navLink}>Haptic Select</Link>
          <Link href="/" className={styles.navLink}>Main Page</Link>
        </nav>
        <div className={styles.walletInfo}>
          {connected && publicKey && (
            <span className={styles.walletAddress}>
              {publicKey.toBase58().substring(0, 4)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 4)}
            </span>
          )}
          <span className={styles.kaikaBalance}>◈ {mockKaikaBalance} KAIKA</span>
          <WalletMultiButton className={styles.walletButton} />
        </div>
      </header>

      {/* Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.dashboardContainer}>
          {/* Map Section */}
          <div className={styles.mapContainer} ref={mapContainerRef}>
            {/* Map Layer - Tokyo Map (rendered with advanced SVG) */}
            <svg 
              width="100%" 
              height="100%" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              className={styles.mapSvg}
              ref={mapSvgRef}
            >
              {/* Background with gradient */}
              <defs>
                <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0a0d1c" />
                  <stop offset="100%" stopColor="#151b30" />
                </linearGradient>
                <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(100,149,237,0.1)" strokeWidth="0.5" />
                </pattern>
                
                {/* Glow filter for landmarks */}
                <filter id="landmarkGlow" height="300%" width="300%" x="-75%" y="-75%">
                  <feMorphology operator="dilate" radius="1" in="SourceAlpha" result="thicken" />
                  <feGaussianBlur in="thicken" stdDeviation="2" result="blurred" />
                  <feFlood floodColor="#4a7bff" result="glowColor" />
                  <feComposite in="glowColor" in2="blurred" operator="in" result="softGlow" />
                  <feMerge>
                    <feMergeNode in="softGlow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              
              <rect width="100" height="100" fill="url(#mapGradient)" />
              <rect width="100" height="100" fill="url(#gridPattern)" />
              
              {/* City glow effect */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(100,149,237,0.1)" strokeWidth="20" opacity="0.1" />
              
              {/* Tokyo's major areas */}
              {TOKYO_LANDMARKS.map((landmark, index) => (
                <g key={index} filter="url(#landmarkGlow)">
                  <circle 
                    cx={landmark.x} 
                    cy={landmark.y} 
                    r="4" 
                    fill="rgba(74,123,255,0.2)" 
                    stroke="rgba(74,123,255,0.5)" 
                    strokeWidth="0.5" 
                  />
                  <text 
                    x={landmark.x} 
                    y={landmark.y} 
                    textAnchor="middle" 
                    fill="rgba(255,255,255,0.8)" 
                    fontSize="2" 
                    dy="-6"
                    fontFamily="'Inter', sans-serif"
                  >
                    {landmark.name}
                  </text>
                </g>
              ))}
              
              {/* Road network with enhanced styling */}
              <line x1="30" y1="35" x2="40" y2="50" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="40" y1="50" x2="50" y2="55" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="50" y1="55" x2="60" y2="45" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="60" y1="45" x2="58" y2="35" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="58" y1="35" x2="65" y2="25" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="30" y1="35" x2="25" y2="20" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="25" y1="20" x2="65" y2="25" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
              <line x1="60" y1="45" x2="55" y2="70" stroke="rgba(100,149,237,0.2)" strokeWidth="0.5" />
            </svg>
            
            {/* Canvas for path drawing */}
            <canvas ref={pathCanvasRef} className={styles.pathTrail}></canvas>
            
            {/* User location */}
            <div 
              className={`${styles.userLocation} ${collectionState === 'collecting' ? styles.pulsing : ''}`}
              style={{ 
                left: `${userPosition.x}%`, 
                top: `${userPosition.y}%` 
              }}
            >
              <div className={styles.locationRing}></div>
            </div>
            
            {/* Data transfer animation */}
            {dataTransferAnimation && (
              <div className={styles.dataTransferAnimation}>
                <div className={styles.dataParticle}></div>
                <div className={styles.dataParticle}></div>
                <div className={styles.dataParticle}></div>
              </div>
            )}
            
            {/* Map overlay effect */}
            <div className={styles.mapOverlay}>
              <div className={styles.scanline}></div>
            </div>
            
            {/* Map controls */}
            <div className={styles.mapControls}>
              <button 
                className={`${styles.mapButton} ${styles.resetButton}`}
                onClick={resetMap}
                title="Reset Map"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c2.39 0 4.68.94 6.36 2.63L12 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className={`${styles.mapButton} ${styles.centerButton}`}
                onClick={() => setUserPosition({ x: 45, y: 40 })}
                title="Center Map"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="16" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="12" x2="16" y2="12" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Control Panel */}
          <div className={styles.controlPanel}>
            <h2 className={styles.panelTitle}>
              <svg className={styles.panelIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#4a7bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#4a7bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#4a7bff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              DATA COLLECTOR
            </h2>
            
            <div className={`${styles.statusCard} ${styles[collectionState]}`}>
              <div className={styles.statusDot}></div>
              <div className={styles.statusLabel}>STATUS</div>
              <div className={styles.statusValue}>
                {collectionState === 'idle' && 'STANDBY'}
                {collectionState === 'collecting' && 'COLLECTING DATA'}
                {collectionState === 'collected' && 'COLLECTION COMPLETE'}
                {collectionState === 'submitting' && 'PROCESSING'}
              </div>
            </div>
            
            <div className={styles.collectionInfo}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>LOCATION</span>
                <span className={`${styles.infoValue} ${styles.highlight}`}>{currentLocation}</span>
              </div>
              
              {simulatedDataType && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>DATA TYPE</span>
                  <span className={styles.infoValue}>{simulatedDataType}</span>
                </div>
              )}
              
              {collectionState !== 'idle' && (
                <>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>ELAPSED TIME</span>
                    <span className={styles.infoValue}>{collectionDuration}s</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>COLLECTED DATA</span>
                    <span className={styles.infoValue}>{dataCollected.toLocaleString()} KB</span>
                  </div>
                  
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>DISTANCE</span>
                    <span className={styles.infoValue}>{totalDistance.toFixed(2)} km</span>
                  </div>
                </>
              )}
            </div>
            
            {earnedKaika !== null && (
              <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{earnedKaika}</div>
                  <div className={styles.statLabel}>EARNED KAIKA</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{mockKaikaBalance}</div>
                  <div className={styles.statLabel}>BALANCE</div>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            {collectionState === 'idle' && (
              <button 
                onClick={handleStartCollection} 
                className={`${styles.actionButton} ${styles.start}`} 
                disabled={!connected}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 12L10 16V8L16 12Z" fill="currentColor"/>
                </svg>
                START DATA COLLECTION
              </button>
            )}
            
            {collectionState === 'collecting' && (
              <button 
                onClick={handleStopCollection} 
                className={`${styles.actionButton} ${styles.stop}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
                </svg>
                STOP COLLECTION ({collectionDuration}s)
              </button>
            )}
            
            {collectionState === 'collected' && (
              <button 
                onClick={handleSubmitData} 
                className={`${styles.actionButton} ${styles.submit}`} 
                disabled={!connected}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                SUBMIT DATA & CLAIM KAIKA
              </button>
            )}
            
            {collectionState === 'submitting' && (
              <button 
                className={`${styles.actionButton} ${styles.processing}`} 
                disabled
              >
                <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.2"/>
                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                  <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.1"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                </svg>
                PROCESSING...
              </button>
            )}
            
            {/* Submission status message */}
            {submissionStatus && (
              <div className={`${styles.submissionStatus} ${submissionStatus.includes('Success') ? styles.success : submissionStatus.includes('failed') ? styles.error : ''}`}>
                {submissionStatus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}