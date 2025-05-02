// src/components/DeviceModel.tsx
'use client';
// useEffect を react からインポート
import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei';

// GLTFモデルをロードして表示するコンポーネント
function Model({ url, ...props }: { url: string } & JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.3;
    }
  });
  return <primitive object={scene} ref={modelRef} scale={1.5} position={[0, -0.5, 0]} {...props} />;
}

// Canvasセットアップとモデル表示
export default function DeviceModel() {
  // モデルURLをコンポーネント内で定義
  const modelUrl = '/models/kaika_device.glb'; // ★★★ パスを確認してください ★★★

  // useEffect を使ってコンポーネントマウント時に preload を試みる
  useEffect(() => {
    // modelUrl が有効な場合にのみ preload を試行
    if (modelUrl) {
        try {
          useGLTF.preload(modelUrl);
          console.log("Preloading model:", modelUrl); // 成功ログ（デバッグ用）
        } catch (error) {
          // エラー発生時、modelUrl はこのスコープで利用可能
          console.error("Failed to preload model:", modelUrl, error);
          // ここでユーザーへのエラー通知など、適切なエラーハンドリングを行うことができます
        }
    }
  }, [modelUrl]); // modelUrl が変更された場合に再実行（通常は固定URLなので初回のみ）

  return (
    <div style={{ height: '200px', width: '100%', cursor: 'grab', touchAction: 'none' }}>
      <Canvas shadows camera={{ position: [0, 0.5, 4], fov: 45 }}>
        <ambientLight intensity={Math.PI / 1.5} />
        <spotLight
          position={[5, 5, 5]}
          angle={0.3}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI / 2} />
        <Suspense fallback={null}> {/* モデルロード中のフォールバック */}
           {/* モデルURLが有効な場合のみ Stage と Model をレンダリング */}
           {modelUrl && (
                <Stage environment="city" intensity={0.5}>
                    <Model url={modelUrl} />
                </Stage>
           )}
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 2.5}
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}

// ファイル末尾の try...catch ブロックは削除します
// try {
//     useGLTF.preload(modelUrl);
// } catch (error) {
//     console.error("Failed to preload model:", modelUrl, error);
// }