// src/components/AnimatedBackground.tsx
'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './animatedBackground.module.css'; // Use CSS Modules

interface Props {
  feelingId: string | null;
  // カテゴリ情報も渡せるとより明確ですが、feelingIdから判定します
}

export default function AnimatedBackground({ feelingId }: Props) {
  let animationKey = 'default';
  let AnimationComponent = null;
  let backgroundClass = styles.defaultBg; // Default class

  // Determine animation based on feelingId (or category if available)
  if (feelingId === 'beach_sand') {
    animationKey = 'beach';
    AnimationComponent = <BeachWaves />;
    backgroundClass = styles.beachBg;
  } else if (['forest_floor', 'grassy_field', 'gravel_path'].includes(feelingId ?? '')) {
    animationKey = 'nature';
    AnimationComponent = <NatureElements />;
    backgroundClass = styles.natureBg;
  } else if (['athens_cobblestone', 'tokyo_asphalt'].includes(feelingId ?? '')) {
      animationKey = 'urban';
      AnimationComponent = <UrbanLines />;
      backgroundClass = styles.urbanBg;
  } else if (['quantum_flow', 'lunar_dust'].includes(feelingId ?? '')) {
      animationKey = 'abstract';
      AnimationComponent = <AbstractFlow />;
      backgroundClass = styles.abstractBg;
  } else {
      // Default case
      animationKey = 'default';
      AnimationComponent = null; // Or a default static SVG/Element
      backgroundClass = styles.defaultBg;
  }

  return (
    <div className={styles.backgroundContainer}>
      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey} // Key change triggers transition
          className={`${styles.backgroundLayer} ${backgroundClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }} // Slower fade
        >
          {AnimationComponent}
        </motion.div>
      </AnimatePresence>
      {/* Dot grid remains on top */}
      <div className={styles.dotGrid} aria-hidden />
    </div>
  );
}

// --- Animation Components ---

const BeachWaves = () => (
  <svg width="100%" height="100%" viewBox="0 0 150 100" preserveAspectRatio="none" className={styles.svgCanvas}>
    <defs>
      <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor: '#87CEEB'}} />
        <stop offset="60%" style={{stopColor: '#0077BE'}} />
        <stop offset="100%" style={{stopColor: '#003d66'}} />
      </linearGradient>
      <filter id="waterDisplacement" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="3" seed={Math.random()*10} result="turbulence"/>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="4" xChannelSelector="R" yChannelSelector="G"/>
        {/* <feGaussianBlur stdDeviation="0.3" /> */}
      </filter>
    </defs>
    {/* Multiple wave paths with filter */}
    <path filter="url(#waterDisplacement)" className={`${styles.wavePath} ${styles.wave1}`} d="M -50 50 Q -25 35 0 50 T 50 50 T 100 50 T 150 50 T 200 50 V 100 H -50 Z" />
    <path filter="url(#waterDisplacement)" className={`${styles.wavePath} ${styles.wave2}`} d="M -50 55 Q -20 45 5 55 T 55 55 T 105 55 T 155 55 T 205 55 V 100 H -50 Z" />
    <path filter="url(#waterDisplacement)" className={`${styles.wavePath} ${styles.wave3}`} d="M -50 60 Q -15 55 10 60 T 60 60 T 110 60 T 160 60 T 210 60 V 100 H -50 Z" />
    <path filter="url(#waterDisplacement)" className={`${styles.wavePath} ${styles.wave4}`} d="M -50 65 Q -20 60 5 65 T 55 65 T 105 65 T 155 65 T 205 65 V 100 H -50 Z" />
    <path filter="url(#waterDisplacement)" className={`${styles.wavePath} ${styles.wave5}`} d="M -50 70 Q -25 68 0 70 T 50 70 T 100 70 T 150 70 T 200 70 V 100 H -50 Z" />
  </svg>
);

const NatureElements = () => (
    // Container with base nature gradient/color set by .natureBg
    <div className={styles.natureContainer}>
        {/* Multiple leaves with varied animations */}
        {[...Array(10)].map((_, i) => (
            <div key={i} className={`${styles.leaf} ${styles[`leaf${(i % 5) + 1}`]}`} style={{ left: `${Math.random() * 90 + 5}%`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${15 + Math.random() * 10}s`, transform: `scale(${0.7 + Math.random() * 0.6})` }}>
                {Math.random() > 0.5 ? '🌿' : '🍃'}
            </div>
        ))}
        {/* Subtle light rays / sun beams */}
        <div className={styles.lightRay1}></div>
        <div className={styles.lightRay2}></div>
    </div>
);

const UrbanLines = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={styles.svgCanvas}>
       <defs>
            {/* Neon Line Gradient */}
            <linearGradient id="urbanLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(80, 200, 255, 0)" />
                <stop offset="50%" stopColor="rgba(80, 200, 255, 0.9)" />
                <stop offset="100%" stopColor="rgba(80, 200, 255, 0)" />
            </linearGradient>
            {/* Secondary Neon Gradient */}
            <linearGradient id="urbanLineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255, 107, 0, 0)" />
                <stop offset="50%" stopColor="rgba(255, 107, 0, 0.6)" />
                <stop offset="100%" stopColor="rgba(255, 107, 0, 0)" />
            </linearGradient>
            {/* Grid Pattern */}
             <pattern id="urbanGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(80, 200, 255, 0.1)" strokeWidth="0.5" />
             </pattern>
        </defs>
        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#urbanGrid)" />
        {/* Animated Lines */}
        <line x1="-100%" y1="15%" x2="100%" y2="15%" className={`${styles.urbanLine} ${styles.urbanLine1}`} />
        <line x1="120%" y1="35%" x2="-120%" y2="35%" className={`${styles.urbanLine} ${styles.urbanLine2}`} />
        <line x1="-100%" y1="60%" x2="100%" y2="60%" className={`${styles.urbanLine} ${styles.urbanLine3}`} />
        <line x1="120%" y1="85%" x2="-120%" y2="85%" className={`${styles.urbanLine} ${styles.urbanLine4}`} />
        {/* Diagonal lines */}
         <line x1="-20%" y1="-20%" x2="120%" y2="120%" className={`${styles.urbanLine} ${styles.urbanLine5}`} />
         <line x1="120%" y1="-20%" x2="-20%" y2="120%" className={`${styles.urbanLine} ${styles.urbanLine6}`} />
    </svg>
);

const AbstractFlow = () => (
    // Uses CSS for the main effect
    <div className={styles.abstractContainer}>
       {/* Optional: Add SVG filters or simple shapes here for more detail */}
       <svg width="100%" height="100%" className={styles.svgCanvas}>
          <defs>
                <filter id="abstractWarp">
                    <feTurbulence type="fractalNoise" baseFrequency="0.005 0.01" numOctaves="2" seed="5" result="warpNoise"/>
                    <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale="30" xChannelSelector="R" yChannelSelector="B" />
                    <feGaussianBlur stdDeviation="1" />
                </filter>
            </defs>
            {/* Apply filter to the container via CSS or to an element here */}
            {/* <rect width="100%" height="100%" filter="url(#abstractWarp)" /> */}
       </svg>
    </div>
);