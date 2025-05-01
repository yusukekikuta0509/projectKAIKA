'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import styles from './page.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function MainPage() {
  /* Refs */
  const aboutRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<HTMLDivElement>(null); // Ref for Launch/CTA section

  /* マウス追従グラデーション */
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const gradRef = useRef<HTMLDivElement>(null);
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

  /* GSAP Animations */
  useEffect(() => {
    // --- Hero Animation (On Load) ---
    gsap.from(`.${styles.catchphrase}`, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    gsap.from(`.${styles.description}`, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
    // Use direct selector for hero buttons as they don't have specific class names in the example
    gsap.from(`.${styles.heroCta} > *`, { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.2, delay: 0.6 });

    // --- Reusable Function for Section Title Animation ---
    const animateSectionTitle = (el: HTMLElement | null) => {
      if (!el) return;
      const title = el.querySelector(`.${styles.sectionTitle}, .${styles.catchphrase}`); // Target both section titles and device catchphrase
      if (title) {
        gsap.from(title, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%', // Start animation when 85% of the element is visible
            toggleActions: 'play none none none' // Play animation only once
          }
        });
      }
    };

    // --- About Section Animation ---
    animateSectionTitle(aboutRef.current);
    gsap.from(aboutRef.current?.querySelectorAll(`.${styles.aboutCard}`) || [], {
      y: 40,
      opacity: 0,
      scale: 0.95, // Add slight scale up
      stagger: 0.12,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: aboutRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none'
      }
    });

    // --- Device Section Animation ---
     if (deviceRef.current) {
        // Animate Text Content (Left side)
        gsap.from(deviceRef.current.querySelector(`.${styles.deviceContent}`), {
            x: -50, // Slide in from left
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger:{
                trigger: deviceRef.current,
                start:'top 80%',
                toggleActions: 'play none none none'
            }
        });
         // Animate Features List Items (Staggered)
        gsap.from(deviceRef.current.querySelectorAll(`.${styles.deviceFeature}`), {
            x: -30,
            opacity: 0,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.2, // Start slightly after the content block slides in
            ease: 'power3.out',
            scrollTrigger: {
                trigger: deviceRef.current.querySelector(`.${styles.deviceFeatures}`), // Trigger based on the list itself
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
         // Animate Purchase Button
         gsap.from(deviceRef.current.querySelector(`.${styles.purchaseButton}`), {
            y: 20,
            opacity: 0,
            duration: 0.6,
            delay: 0.4, // Start after features
            ease: 'power3.out',
            scrollTrigger: {
                trigger: deviceRef.current.querySelector(`.${styles.purchaseButton}`),
                start: 'top 90%',
                toggleActions: 'play none none none'
            }
        });
        // Animate Image (Right side)
        gsap.from(deviceRef.current.querySelector(`.${styles.deviceVisual}`), {
            x: 50, // Slide in from right
            opacity: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger:{
                trigger: deviceRef.current,
                start:'top 80%',
                toggleActions: 'play none none none'
            }
        });
     }


    // --- Team Section Animation ---
    animateSectionTitle(teamRef.current);
    gsap.from(teamRef.current?.querySelector(`.${styles.teamIntro}`) || null, { // Animate intro text
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: teamRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
    gsap.from(teamRef.current?.querySelectorAll(`.${styles.memberCard}`) || [], { // Stagger member cards
      y: 40,
      opacity: 0,
      scale: 0.9, // Add scale up
      stagger: 0.15,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: teamRef.current?.querySelector(`.${styles.teamGrid}`),
        start: 'top 85%', // Trigger when the grid comes into view
        toggleActions: 'play none none none'
      }
    });

    // --- CTA Section Animation ---
    if (launchRef.current) { // Check if ref exists
      gsap.from(launchRef.current.querySelector(`.${styles.launchTitle}`), {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: launchRef.current,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
      gsap.from(launchRef.current.querySelector(`.${styles.launchButton}`), {
        y: 40,
        opacity: 0,
        scale: 0.8,
        duration: 0.7,
        ease: 'back.out(1.7)', // Add bouncy effect
        scrollTrigger: {
          trigger: launchRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });
    }

    // Cleanup GSAP animations and ScrollTriggers on component unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className={styles.main}>

      {/* 背景 */}
      <div ref={gradRef} className={styles.gradientBackground} aria-hidden />
      <div className={styles.dotGrid} aria-hidden />

      {/* Header */}
      <header className={styles.header}>
      <Image src="/kaika_logo.png" alt="KAIKA" width={100} height={100} />
        <nav>
          <Link href="#about" className={styles.navLink}>About</Link>
          <Link href="#device" className={styles.navLink}>Device</Link>
          <Link href="#team" className={styles.navLink}>Team</Link>
        </nav>
        <WalletMultiButton className={styles.walletButton} />
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <h2 className={styles.catchphrase}>Bring the beach to your treadmill with haptic soles</h2>
        <p className={styles.description}>
          Feel the ground with haptic insoles that turn indoor workouts into an immersive experience, converting every step into on-chain rewards.
        </p>
        <div className={styles.heroCta}>
          <Link href="/app/haptic"><button className={styles.primaryButton}>Launch App</button></Link>
          <Link href="#device"><button className={styles.secondaryButton}>Learn More</button></Link>
        </div>
      </section>

      {/* About KAIKA */}
      <section id="about" ref={aboutRef} className={styles.aboutSection}>
        <h2 className={styles.sectionTitle}>What is KAIKA?</h2>
        <div className={styles.aboutGrid}>
          <AboutCard icon="🚀" title="Move-to-Earn 2.0">
            Stake your steps on Solana & automatically earn USDC every day. Integrate Web3: First haptic data platform on Solana.
          </AboutCard>
          <AboutCard icon="🌐" title="DePIN Infrastructure">
            Your shoes act as edge-nodes, optimizing rewards via real-world usage. Collect & monetize ground-feel data with our app.
          </AboutCard>
          <AboutCard icon="📊" title="Composable Fitness Data">
            Open metrics API—export to Strava or other health apps.
          </AboutCard>
          <AboutCard icon="⚡" title="64-Point Haptics">
            Real-time sand, gravel and snow textures under your feet.
          </AboutCard>
          <AboutCard icon="🎯" title="Problem Solver">
            Combat workout pain and boredom with immersive haptic feedback.
          </AboutCard>
        </div>
      </section>

      {/* Device */}
      <section id="device" ref={deviceRef} className={styles.deviceSection}>
        <div className={styles.deviceContent}>
            {/* Title uses h2 with catchphrase style, targeted by animateSectionTitle */}
            <h2 className={styles.catchphrase}>KAIKA v1.0</h2>
            <ul className={styles.deviceFeatures}>
                <li className={styles.deviceFeature}><span className={styles.featureNumber}>01</span> 64 haptic actuators</li>
                <li className={styles.deviceFeature}><span className={styles.featureNumber}>02</span> Bluetooth 5 Low-Latency</li>
                <li className={styles.deviceFeature}><span className={styles.featureNumber}>03</span> 8-hour battery</li>
                <li className={styles.deviceFeature}><span className={styles.featureNumber}>04</span> IP54 sweat-proof</li>
                <li className={styles.deviceFeature}><span className={styles.featureNumber}>05</span> Wireless and easy to attach to special insoles</li>
            </ul>
            <button className={styles.purchaseButton}>Pre-order</button>
        </div>
        <div className={styles.deviceVisual}>
          <Image src="/kaika.jpeg" alt="KAIKA device" width={500} height={400} className={styles.deviceImage} />
        </div>
      </section>

      {/* Team */}
      <section id="team" ref={teamRef} className={styles.teamSection}>
        <h2 className={styles.sectionTitle}>Our Team</h2>
        <p className={styles.teamIntro}>We combine haptic expertise with Web3 vision to pioneer Haptic DeSci.</p>
        <div className={styles.teamGrid}>
          <Member name="Yusuke" role="Co-Founder / Protocol Lead" avatar="/team/yusuke.jpg" />
          <Member name="Key" role="Co-Founder / Hardware Lead (Haptics PhD)" avatar="/team/key.jpg" />
          <Member name="Zen" role="Co-Founder / Growth Lead (BizDev PhD)" avatar="/team/zen.jpg" />
        </div>
      </section>

      {/* CTA */}
      {/* Added ref={launchRef} */}
      <section ref={launchRef} className={styles.launchSection}>
        <h2 className={styles.launchTitle}>Ready to run?</h2>
        <Link href="/app/haptic"><button className={styles.launchButton}>Launch App</button></Link>
      </section>
    </div>
  );
}

/* 子コンポーネント */
const AboutCard = ({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) => (
  <div className={styles.aboutCard}>
    <span className={styles.featureIcon}>{icon}</span>
    <h3>{title}</h3><p>{children}</p>
  </div>
);

const Member = ({ name, role, avatar }: { name: string, role: string, avatar: string }) => (
  <div className={styles.memberCard}>
    <Image src={avatar} alt={name} width={88} height={88} className={styles.memberAvatar} />
    <span className={styles.memberName}>{name}</span>
    <span className={styles.memberRole}>{role}</span>
  </div>
);