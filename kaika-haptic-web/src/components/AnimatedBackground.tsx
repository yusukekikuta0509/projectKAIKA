// src/components/AnimatedBackground.tsx
'use client';
import { useEffect, useState, useRef } from 'react';
import styles from './animatedBackground.module.css';

interface AnimatedBackgroundProps {
  feelingId?: string | null;
}

const VIDEO_SRC = '/videos/background_loop.mp4';

// Change { feelingId } to { feelingId: _feelingId }
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ feelingId: _feelingId }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Now, _feelingId is the variable in scope.
    // If _feelingId is not used, ESLint might ignore it if configured to do so for underscore-prefixed vars.
    // The original feelingId prop is still passed, but here we assign it to _feelingId.

    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoLoad = () => {
        setIsVideoLoaded(true);
      };

      videoElement.addEventListener('loadeddata', handleVideoLoad);

      if (videoElement.readyState >= 2) {
        setIsVideoLoaded(true);
      }

      return () => {
        if (videoElement) {
          videoElement.removeEventListener('loadeddata', handleVideoLoad);
        }
      };
    }
  }, []); // _feelingId (derived from feelingId) is not used in this effect

  return (
    <div className={`${styles.videoBackgroundContainer} ${isVideoLoaded ? styles.loaded : ''}`}>
      <video
        ref={videoRef}
        key={VIDEO_SRC}
        className={styles.backgroundVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default AnimatedBackground;