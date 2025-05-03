/* ──────────────────────────────────────────────
   File: src/app/page.tsx
   ────────────────────────────────────────────── */
   'use client';

   // usePathname フックをインポート
   import { useEffect, useRef, useState, useLayoutEffect } from 'react';
   import { usePathname } from 'next/navigation'; // <-- インポート追加
   import dynamic from 'next/dynamic';
   import Link from 'next/link';
   import Image from 'next/image';
   import gsap from 'gsap';
   import { ScrollTrigger } from 'gsap/ScrollTrigger';
   import styles from './page.module.css';
   import { FiMapPin, FiDownloadCloud, FiGift } from 'react-icons/fi';
   
   /* Wallet ボタンを CSR 専用で読み込む */
   const WalletMultiButton = dynamic(
     () => import('@solana/wallet-adapter-react-ui').then((m) => m.WalletMultiButton),
     { ssr: false }
   );
   
   // GSAPプラグイン登録
   if (typeof window !== "undefined") {
       gsap.registerPlugin(ScrollTrigger);
   }
   
   
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<Params extends any[], Func extends (...args: Params) => void>(func: Func, waitFor: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // ↓ Parameters<T> を Params に変更
  const debounced = (...args: Params): void => {
    if (timeoutId !== null) { clearTimeout(timeoutId); }
    timeoutId = setTimeout(() => { timeoutId = null; func(...args); }, waitFor);
  };
  // ↓ clear の型アサーションはそのまま
  (debounced as any).clear = () => { if (timeoutId !== null) { clearTimeout(timeoutId); timeoutId = null; } };
  // ↓ 戻り値の型アサーションを少し具体的に (必須ではない)
  return debounced as Func & { clear?: () => void };
}
   
   
   export default function MainPage() {
     /* ───── Refs ───── */
     const mainRef = useRef<HTMLDivElement>(null);
     const aboutRef  = useRef<HTMLDivElement>(null);
     const deviceRef = useRef<HTMLDivElement>(null);
     const teamRef   = useRef<HTMLDivElement>(null);
     const launchRef = useRef<HTMLDivElement>(null);
     const gradRef   = useRef<HTMLDivElement>(null);
   
     /* ───── Hooks ───── */
     const pathname = usePathname(); // 現在のパスを取得
     const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
   
     /* ───── 背景グラデーション (マウス追従) ───── */
     useEffect(() => {
      const move = (e: MouseEvent) => setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
      window.addEventListener('mousemove', move);
      return () => window.removeEventListener('mousemove', move);
  }, []);
   
     useEffect(() => {
       if (!gradRef.current) return;
       gsap.to(gradRef.current, {
           duration: 0.5,
           background: `radial-gradient(circle at ${10 + mouse.x * 30}% ${30 + mouse.y * 40}%, rgba(255,107,0,.1) 0%, rgba(0,0,0,0) 70%)`,
           ease: 'power2.out'
       });
     }, [mouse]);
   
     /* ───── GSAP Animations with Context & Pathname Dependency ───── */
     // useLayoutEffect を使用し、依存配列に pathname を追加
     useLayoutEffect(() => {
       console.log("Setting up GSAP context for path:", pathname); // デバッグログ
   
       const ctx = gsap.context(() => {
         // requestAnimationFrame で1フレーム待って初期化
        
           console.log("Initializing GSAP animations...");
   
           // --- アニメーション設定 ---
           /* Hero Animation */
           gsap.fromTo(`.${styles.catchphrase}`, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 });
           gsap.fromTo(`.${styles.description}`, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
           gsap.fromTo(`.${styles.heroCta} > *`, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.3 });
   
           /* 共通タイトルアニメ */
           const animateTitle = (el: Element | null) => {
             if (el) {
               // fromTo を使用して初期状態を確実に設定
               gsap.fromTo(el, { y: 40, opacity: 0 }, {
                 y: 0, opacity: 1, duration: 0.7, ease: 'power3.out',
                 scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none', invalidateOnRefresh: true }
               });
             } else { console.warn("animateTitle: Element not found"); }
           };
           
           /* About Section Animation */
           animateTitle(aboutRef.current?.querySelector(`.${styles.sectionTitle}`) ?? null);
           const aboutCards = aboutRef.current 
               ? gsap.utils.toArray(aboutRef.current.querySelectorAll(`.${styles.aboutCard}`)) 
               : [];
           if (aboutCards.length > 0) {
             gsap.fromTo(aboutCards, { y: 40, opacity: 0, scale: 0.95 }, {
               y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 0.6, ease: 'power3.out',
               scrollTrigger: { trigger: aboutRef.current, start: 'top 85%', toggleActions: 'play none none none', invalidateOnRefresh: true }
             });
           } else { console.warn("About cards not found"); }
   
           /* Device Section Animation */
           if (deviceRef.current) {
             animateTitle(deviceRef.current.querySelector(`.${styles.catchphrase}`));
             gsap.fromTo(deviceRef.current.querySelector(`.${styles.deviceContent}`), { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: deviceRef.current, start: 'top 85%', toggleActions: 'play none none none', invalidateOnRefresh: true } });
             gsap.fromTo(gsap.utils.toArray(deviceRef.current.querySelectorAll(`.${styles.deviceFeature}`)), { x: -30, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', scrollTrigger: { trigger: deviceRef.current.querySelector(`.${styles.deviceFeatures}`), start: 'top 90%', toggleActions: 'play none none none', invalidateOnRefresh: true } });
             gsap.fromTo(deviceRef.current.querySelector(`.${styles.purchaseButton}`), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.2, scrollTrigger: { trigger: deviceRef.current.querySelector(`.${styles.purchaseButton}`), start: 'top 95%', toggleActions: 'play none none none', invalidateOnRefresh: true } });
             gsap.fromTo(deviceRef.current.querySelector(`.${styles.deviceVisual}`), { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: deviceRef.current, start: 'top 85%', toggleActions: 'play none none none', invalidateOnRefresh: true } });
           } else { console.warn("Device section ref not found"); }
   
           /* Team Section Animation */
           animateTitle(teamRef.current?.querySelector(`.${styles.sectionTitle}`) ?? null);
           const teamCards = teamRef.current 
               ? gsap.utils.toArray(teamRef.current.querySelectorAll(`.${styles.memberCard}`)) 
               : [];
           if (teamCards.length > 0) {
             gsap.fromTo(teamCards, { opacity: 0, y: 40 }, {
               opacity: 1, y: 0, stagger: 0.15, duration: 0.6, ease: 'power3.out',
               scrollTrigger: { trigger: teamRef.current, start: 'top 85%', toggleActions: 'play none none none', invalidateOnRefresh: true },
             });
           } else { console.warn("Team cards not found"); }
   
           /* CTA Section Animation */
           if (launchRef.current) {
             animateTitle(launchRef.current.querySelector(`.${styles.launchTitle}`));
             gsap.fromTo(launchRef.current.querySelector(`.${styles.launchButton}`), { y: 40, opacity: 0, scale: 0.8 }, {
               y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)', delay: 0.1,
               scrollTrigger: { trigger: launchRef.current, start: 'top 85%', toggleActions: 'play none none none', invalidateOnRefresh: true }
             });
           } else { console.warn("Launch section ref not found"); }
   
           /* ScrollTrigger Refresh Handling */
           const refreshScrollTriggers = () => {
               console.log("Refreshing ScrollTriggers...");
               ScrollTrigger.refresh();
           };
           const debouncedRefresh = debounce(refreshScrollTriggers, 300);
           window.addEventListener('resize', debouncedRefresh);
           let refreshTimeoutId: NodeJS.Timeout | null = setTimeout(refreshScrollTriggers, 500); // Initial refresh delay
   
         
   
           console.log("GSAP animations initialized.");
           return () => {
            // この関数は、gsap.context が revert される際や、
            // 依存配列 [pathname] が変わってエフェクトが再実行される「前」に呼ばれる
            console.log("Cleaning up listeners and timeouts inside GSAP context");
            clearTimeout(refreshTimeoutId as NodeJS.Timeout); // タイマーをクリア
            refreshTimeoutId = null;
            window.removeEventListener('resize', debouncedRefresh); // リスナーを削除
            debouncedRefresh.clear?.(); // debounceのタイマーもクリア
        };

   
       }, mainRef); // GSAP Context scope
   
       // --- クリーンアップ関数 ---
       return () => {
           console.log("GSAP Context revert start for path:", pathname); // パス名もログに出す
           // cancelAnimationFrame(animFrameId); // requestAnimationFrame をクリア (通常 ctx.revert() で不要)
           ctx.revert(); // GSAP Context のアニメーションとトリガーを破棄
           // ScrollTrigger.killAll(); // ★ 必要であれば試す (他のページに影響する可能性あり)
           console.log("GSAP Context revert complete");
       };
     }, [pathname]); // ★★★ 依存配列に pathname を追加 ★★★
   
   
     /* ───── JSX ───── */
     return (
       <div className={styles.main} ref={mainRef}>
         {/* 背景 */}
         <div ref={gradRef} className={styles.gradientBackground} aria-hidden />
         <div className={styles.dotGrid} aria-hidden />
   
         {/* Header */}
         <header className={styles.header}>
           <Image src="/kaika_logo.png" alt="KAIKA" width={80} height={80} priority />
           <nav>
             <Link href="#about" className={styles.navLink} >About</Link>
             <Link href="#device" className={styles.navLink}>Device</Link>
             <Link href="#team" className={styles.navLink} >Team</Link>
           </nav>
           <WalletMultiButton className={styles.walletButton} />
         </header>
   
         {/* Hero */}
         <section className={styles.hero}>
           <h1 className={styles.catchphrase}>Bring the beach to your treadmill with haptic soles</h1>
           <p className={styles.description}>
             Feel the ground with haptic insoles that turn indoor workouts into an immersive experience,
             converting every step into on-chain rewards.
           </p>
           <div className={styles.heroCta}>
             <Link href="/app/haptic"><button className={styles.primaryButton}>Launch App</button></Link>
             <Link href="#device" scroll={false}><button className={styles.secondaryButton}>Learn More</button></Link>
           </div>
         </section>
   
         {/* About (内容変更済み) */}
         <section id="about" ref={aboutRef} className={styles.aboutSection}>
           <h2 className={styles.sectionTitle}>How KAIKA Works</h2>
           <div className={styles.aboutGrid}>
             <AboutCard icon={<FiMapPin size={24}/>} title="Collect Haptic Data">
               Simply walk or run with KAIKA insoles. Our app collects real-world ground-feel data seamlessly via BLE.
             </AboutCard>
             <AboutCard icon={<FiDownloadCloud size={24}/>} title="Get New Sensations">
               Browse a marketplace of unique haptic NFTs created by us and the community. Purchase and install them directly to your device.
             </AboutCard>
             <AboutCard icon={<FiGift size={24}/>} title="Earn for Contribution">
                Become a vital part of our Haptic DePIN. Data providers are rewarded with KAIKA tokens, fueling the ecosystem.
             </AboutCard>
           </div>
         </section>
   
         {/* Device */}
         <section id="device" ref={deviceRef} className={`${styles.deviceSection} ${styles.deviceWrap}`}>
           <div className={styles.deviceContent}>
             <h2 className={styles.catchphrase}>KAIKA Haptic Insole v1</h2>
             <ul className={styles.deviceFeatures}>
               <li className={styles.deviceFeature}><span className={styles.featureNumber}>01</span> 64 High-Fidelity Actuators</li>
               <li className={styles.deviceFeature}><span className={styles.featureNumber}>02</span> Bluetooth 5.2 Low Energy</li>
               <li className={styles.deviceFeature}><span className={styles.featureNumber}>03</span> 8+ Hour Battery Life</li>
               <li className={styles.deviceFeature}><span className={styles.featureNumber}>04</span> IP54 Sweat & Dust Resistant</li>
               <li className={styles.deviceFeature}><span className={styles.featureNumber}>05</span> Wireless & Easy Attachment</li>
             </ul>
             <button className={styles.purchaseButton}>Pre-order Now</button>
           </div>
           <div className={styles.deviceVisual}>
             <Image src="/kaika.jpeg" alt="KAIKA device" width={500} height={400} className={styles.deviceImage} priority/>
           </div>
         </section>
   
         {/* Team */}
         <section id="team" ref={teamRef} className={styles.teamSection}>
           <h2 className={styles.sectionTitle}>Our Team</h2>
           <p className={styles.teamIntro}>
             Pioneering Haptic DeSci through deep expertise in haptics and Web3 innovation.
           </p>
           <div className={styles.teamGrid}>
           <Member
            name="Kay"
            role="Co-Founder · PhD (Haptics)"
            tags={["Crypto", "Superteam Japan Contributor"]} // テキストタグのみ
            avatar="/kay.jpeg"
            showSuperteamBadge={true} // バッジ表示フラグ追加
          />
          <Member
            name="Yusuke"
            role="Co-Founder · Web3 Lead"
            tags={["Solana Developer", "Ex-Music Univ."]} // Superteam Contributor はバッジで示す
            avatar="/yusuke.jpg"
            showSuperteamBadge={true} // バッジ表示フラグ追加
          />
          <Member
            name="Zen"
            role="Co-Founder · Global Biz-Dev" // Global Biz-Dev に変更例
            tags={["PhD Candidate (Haptics & HCI)", "Trilingual"]} // Superteam Contributor はバッジで示す
            avatar="/zen.jpg" // 画像パス確認
            showSuperteamBadge={true} // バッジ表示フラグ追加
          />
                    </div>
         </section>
   
         {/* CTA */}
         <section ref={launchRef} className={styles.launchSection}>
           <h2 className={styles.launchTitle}>Ready to Feel the Difference?</h2>
           <Link href="/app/haptic"><button className={styles.launchButton}>Launch KAIKA App</button></Link>
         </section>
   
         
       </div>
     );
   }
   
   const AboutCard = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
    <div className={styles.aboutCard}>
      <span className={styles.featureIcon}>{icon}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
  
  // Member コンポーネントに showSuperteamBadge prop を追加
  const Member = ({ name, role, avatar, tags, showSuperteamBadge }: {
      name: string;
      role: string;
      avatar: string;
      tags?: string[];
      showSuperteamBadge?: boolean; // バッジ表示を制御するフラグ
  }) => (
    <div className={styles.memberCard}>
      <div className={styles.avatarWrapper}>
          <Image src={avatar} alt={name} width={88} height={88} className={styles.memberAvatar} unoptimized={true} />
          {/* showSuperteamBadgeがtrueの場合にバッジを表示 */}
          {showSuperteamBadge && (
              <Image
                  // ★★★ Superteam Japan ロゴ画像のパス (publicディレクトリ内) ★★★
                  src="/superteam.png"
                  alt="Superteam Japan Contributor"
                  width={68} // バッジのサイズ調整
                  height={68}
                  className={styles.superteamBadge} // 新しいCSSクラス
                  title="Superteam Japan Contributor" // ツールチップ
              />
          )}
      </div>
      <span className={styles.memberName}>{name}</span>
      <span className={styles.memberRole}>{role}</span>
      {tags && tags.length > 0 && (
        <div className={styles.memberTagsContainer}>
          {tags.map((tag, index) => (
            <span key={index} className={styles.memberTag}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );