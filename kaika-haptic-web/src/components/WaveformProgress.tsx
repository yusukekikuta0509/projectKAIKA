// src/components/WaveformProgress.tsx
'use client';
import { motion, useTime, useTransform, AnimatePresence } from 'framer-motion';
import style from './waveformprogress.module.css'; // 専用CSSモジュール

interface Props {
  collecting: boolean;
  seconds: number;
}

const WAVE_POINTS = 10; // 波を構成する点の数（調整可能）
const WAVE_HEIGHT = 20; // 波の高さ
const WAVE_SPEED = 0.5; // 波のアニメーション速度

export default function WaveformProgress({ collecting, seconds }: Props) {
  const time = useTime(); // Framer Motion の時間

  // 時間に基づいて滑らかな値を生成 (0から1の間を往復)
  const waveOffset = useTransform(
    time,
    (t) => (Math.sin(t / 1000 * WAVE_SPEED * Math.PI * 2) + 1) / 2 // 0..1 の範囲
  );

  // SVG path の 'd' 属性を動的に生成する関数
  const createWavePath = (offset: number, amplitude: number, points: number, yBase: number) => {
    let d = `M 0 ${yBase}`; // 開始点
    const segmentWidth = 100 / (points - 1); // 100%幅に対するセグメント幅

    for (let i = 1; i < points; i++) {
      const x = i * segmentWidth;
      // Sin波を生成: offset で時間経過、i で水平位置による位相ずれ
      const sinInput = (offset * Math.PI * 2) + (i / (points - 1)) * Math.PI * 3;
      const y = yBase + Math.sin(sinInput) * amplitude;
      // スムーズなカーブにするための中間制御点を計算 (簡易的な方法)
      const prevX = (i - 1) * segmentWidth;
      const cx = prevX + segmentWidth / 2;
      // S (smooth quadratic Bézier curveto) コマンドを使用
      d += ` S ${cx} ${y}, ${x} ${y}`;
    }
    // パスを閉じるために右下、左下を経由して開始点に戻る（塗りつぶし用）
    d += ` L 100 ${yBase + amplitude * 2} L 0 ${yBase + amplitude * 2} Z`;
    return d;
  };

  // Framer Motionの useTransform を使って path d をアニメーション
  const pathD1 = useTransform(waveOffset, (latest) => createWavePath(latest, WAVE_HEIGHT * 0.7, WAVE_POINTS, 40));
  const pathD2 = useTransform(waveOffset, (latest) => createWavePath(latest + 0.3, WAVE_HEIGHT * 0.5, WAVE_POINTS, 45)); // 少しずらす
  const pathD3 = useTransform(waveOffset, (latest) => createWavePath(latest + 0.6, WAVE_HEIGHT * 0.3, WAVE_POINTS, 50)); // さらにずらす

  return (
    <div className={style.waveformContainer}>
      <motion.svg
        viewBox="0 0 100 100" // viewBox を 100x100 にして相対指定しやすく
        preserveAspectRatio="none" // アスペクト比を維持しない
        style={{ width: '100%', height: '100px' }} // 表示サイズ
        initial={{ opacity: 0 }}
        animate={{ opacity: collecting ? 1 : 0.3 }} // 収集中でなければ薄く
        transition={{ duration: 0.5 }}
      >
        {/* 複数の波を重ねる */}
        <motion.path className={`${style.waveformPath} ${style.path1}`} d={pathD1} />
        <motion.path className={`${style.waveformPath} ${style.path2}`} d={pathD2} />
        <motion.path className={`${style.waveformPath} ${style.path3}`} d={pathD3} />
      </motion.svg>

      {/* 経過時間の表示 */}
      <AnimatePresence>
        {collecting && (
           <motion.div
             key="timer-overlay"
             className={style.timerOverlay}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -10 }}
             transition={{ duration: 0.3 }}
            >
              {/* Collecting... を削除し秒数のみ表示 */}
              {seconds}s
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}