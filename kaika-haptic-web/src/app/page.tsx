'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '../components/Logo';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './page.module.css';

export default function MainPage() {
  // Create refs for GSAP animations
  const headerRef = useRef(null);
  const heroRef = useRef(null);
  const catchphrase1Ref = useRef(null);
  const catchphrase2Ref = useRef(null);
  const descriptionRef = useRef(null);
  const featuresRef = useRef(null);
  const deviceSectionRef = useRef(null);
  const launchSectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Header animation
    gsap.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Hero section animations
    const heroTl = gsap.timeline();
    heroTl.from(heroRef.current.querySelector(`.${styles.logoWrapper}`), {
      scale: 0.8,
      opacity: 0,
      duration: 1.2,
      ease: "back.out(1.7)"
    })
    .from(catchphrase1Ref.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.4")
    .from(catchphrase2Ref.current, {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    }, "-=0.6")
    .from(descriptionRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, "-=0.4");

    // Features section animation
    gsap.from(featuresRef.current.querySelectorAll(`.${styles.featureCard}`), {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      }
    });

    // Device section animation
    gsap.from(deviceSectionRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.8,
      scrollTrigger: {
        trigger: deviceSectionRef.current,
        start: "top 75%",
      }
    });

    // Launch section animation
    gsap.from(launchSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      scrollTrigger: {
        trigger: launchSectionRef.current,
        start: "top 80%",
      }
    });
    
    // Continuous subtle animation for the launch button
    if (launchSectionRef.current) {
      const launchButton = launchSectionRef.current.querySelector(`.${styles.launchButton}`);
      if (launchButton) {
        gsap.to(launchButton, {
          boxShadow: "0 0 20px rgba(0, 200, 255, 0.6)",
          repeat: -1,
          yoyo: true,
          duration: 1.5
        });
      }
    }

  }, []);

  const handleConnectWallet = () => {
    console.log("Connect Wallet clicked");
  };
  
  const handlePurchaseDevice = () => {
    console.log("Purchase Device clicked");
  };

  return (
    <main className={styles.main}>
      <header ref={headerRef} className={styles.header}>
        <div className={styles.headerLeft}>
          
        </div>
        <div className={styles.headerRight}>
          <nav className={styles.nav}>
            <Link href="/about" className={styles.navLink}>About</Link>
            <Link href="/docs" className={styles.navLink}>Docs</Link>
            <Link href="/community" className={styles.navLink}>Community</Link>
          </nav>
          <button onClick={handleConnectWallet} className={styles.walletButton}>
            Connect Wallet
          </button>
        </div>
      </header>

      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoWrapper}>
            <Logo width={250} height={100} />
          </div>
          
          <h2 ref={catchphrase1Ref} className={styles.catchphrase}>
            Bring the beach to your treadmill
          </h2>
          
          <h3 ref={catchphrase2Ref} className={styles.subcatchphrase}>
            The first haptic insoles for immersive fitness
          </h3>
          
          <p ref={descriptionRef} className={styles.description}>
            Experience the world beneath your feet. Our haptic insoles reproduce ground textures in real-time, 
            turning your indoor workouts into immersive adventures with Web3 integration.
          </p>
          
          <div className={styles.heroCta}>
            <Link href="/app/haptic" passHref>
              <button className={styles.primaryButton}>
                Launch App
              </button>
            </Link>
            <button onClick={handlePurchaseDevice} className={styles.secondaryButton}>
              Purchase Device
            </button>
          </div>
        </div>
        
        <div className={styles.heroVisual}>
          <div className={styles.heroImage}>
            {/* Added kaika.jpeg image to hero section */}
            <Image
              src="/kaika.jpeg"
              alt="KAIKA Haptic Insoles"
              width={500} // 元画像のアスペクト比のための情報
              height={700} // 元画像のアスペクト比のための情報
              // className={styles.insolePreview} // サイズ指定があると競合しやすいので注意
              // 代わりにインラインスタイルや専用クラスで object-fit を指定
              style={{ objectFit: 'contain', width: '100%', height: '100%' }} // コンテナに合わせて伸縮、アスペクト比維持
              // または新しいクラス名を設定: className={styles.heroImageActual}
            />
          </div>
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>64</span>
              <span className={styles.statLabel}>Haptic Points</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>12+</span>
              <span className={styles.statLabel}>Texture Types</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>8h</span>
              <span className={styles.statLabel}>Battery Life</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Experience a New Dimension of Fitness</h2>
        
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏃</div>
            <h3>Texture Simulation</h3>
            <p>Feel the ground change as you run through different environments - sand, gravel, grass, and more.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🌐</div>
            <h3>Web3 Integration</h3>
            <p>Earn tokens as you exercise and unlock new virtual environments with NFT purchases.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🎮</div>
            <h3>Gamified Fitness</h3>
            <p>Turn your daily workout into an adventure with goals, challenges and interactive experiences.</p>
          </div>
          
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📊</div>
            <h3>Performance Tracking</h3>
            <p>Advanced sensors track your running metrics and provide detailed feedback in real-time.</p>
          </div>
        </div>
      </section>

      <section ref={deviceSectionRef} className={styles.deviceSection}>
        <div className={styles.deviceContent}>
          <h2 className={styles.sectionTitle}>KAIKA Haptic Device</h2>
          <div className={styles.deviceFeatures}>
            <div className={styles.deviceFeature}>
              <span className={styles.featureNumber}>01</span>
              <p>64 independent haptic feedback points</p>
            </div>
            <div className={styles.deviceFeature}>
              <span className={styles.featureNumber}>02</span>
              <p>Wireless connectivity via Bluetooth 5.0</p>
            </div>
            <div className={styles.deviceFeature}>
              <span className={styles.featureNumber}>03</span>
              <p>Pressure and motion sensors for precision feedback</p>
            </div>
            <div className={styles.deviceFeature}>
              <span className={styles.featureNumber}>04</span>
              <p>Rechargeable battery with 8+ hours of usage</p>
            </div>
          </div>
          
          <button onClick={handlePurchaseDevice} className={styles.purchaseButton}>
            Pre-order Now
          </button>
        </div>
        
        <div className={styles.deviceVisual}>
          {/* Added kaika.jpeg image to device section */}
          <div className={styles.deviceImageContainer}>
            <Image 
              src="/kaika.jpeg" 
              alt="KAIKA Haptic Device" 
              width={500} 
              height={400} 
              className={styles.deviceImage}
            />
            <div className={styles.deviceOverlay}>
              <span className={styles.deviceLabel}>KAIKA v1.0</span>
            </div>
          </div>
        </div>
      </section>

      <section ref={launchSectionRef} className={styles.launchSection}>
        <h2 className={styles.launchTitle}>Ready to transform your fitness experience?</h2>
        <p className={styles.launchDescription}>
          Connect your KAIKA device or try our demo mode to experience the future of immersive fitness.
        </p>
        <Link href="/app/haptic" passHref>
          <button className={styles.launchButton}>
            Launch App
          </button>
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Logo width={100} height={35} />
            <p className={styles.footerTagline}>Revolutionizing fitness through haptic technology</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkGroup}>
              <h4>Product</h4>
              <Link href="/features">Features</Link>
              <Link href="/technology">Technology</Link>
              <Link href="/roadmap">Roadmap</Link>
            </div>
            
            <div className={styles.footerLinkGroup}>
              <h4>Resources</h4>
              <Link href="/docs">Documentation</Link>
              <Link href="/developers">Developers</Link>
              <Link href="/api">API</Link>
            </div>
            
            <div className={styles.footerLinkGroup}>
              <h4>Community</h4>
              <Link href="/discord">Discord</Link>
              <Link href="/twitter">Twitter</Link>
              <Link href="/telegram">Telegram</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} KAIKA Project. All rights reserved.</p>
          <div className={styles.footerBottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}