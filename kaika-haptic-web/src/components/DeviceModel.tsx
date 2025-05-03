// src/components/DeviceModel.tsx
'use client';
import React, { JSX, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, AdaptiveDpr, AdaptiveEvents, Preload } from '@react-three/drei';
import * as THREE from 'three';

// GLTFモデルをロードして表示するコンポーネント
function Model({ url, ...props }: { url: string } & JSX.IntrinsicElements['group']) {
  const { scene } = useGLTF(url);
  const modelRef = useRef<THREE.Group>(null!);

  // useFrameによる自動回転はOrbitControlsと干渉するため削除（ユーザー操作に任せる）
  // useFrame((state, delta) => {
  //   if (modelRef.current) {
  //     modelRef.current.rotation.y += delta * 0.3;
  //   }
  // });

  // モデルの初期位置やスケールを調整
  return <primitive object={scene} ref={modelRef} scale={3.0} position={[0, -0.2, 0]} {...props} />;
}

// Canvasセットアップとモデル表示
export default function DeviceModel() {
  // ★★★ ここに用意したGLBファイルのパスを指定 (publicディレクトリからの相対パス) ★★★
  const modelUrl = '/deviceModel.glb'; // 例: public/models/kaika_device.glb

  return (
    // スタイルでコンテナのサイズと操作感を設定
    <div style={{ height: '500px', width: '100%', cursor: 'grab', touchAction: 'none', marginBottom: '0.5rem' }}>
      <Canvas shadows camera={{ position: [0, 0.5, 5], fov: 45 }}> {/* カメラ位置調整 */}
        {/* ライティング調整 */}
        <ambientLight intensity={Math.PI * 0.6} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={0.8} intensity={Math.PI * 1.5} castShadow shadow-mapSize={1024} />
        <pointLight position={[-10, -5, -10]} intensity={Math.PI * 0.8} color="#ffae5c" /> {/* オレンジ系の補助光 */}

        <Suspense fallback={null}> {/* モデルロード中のフォールバック */}
           {/* Stageはシンプルなシーンでは不要な場合も。直接モデルを配置 */}
           {/* <Stage environment="city" intensity={0.6}> */}
                <Model url={modelUrl} />
           {/* </Stage> */}
           <Preload all /> {/* モデルを事前にロード */}
        </Suspense>

        {/* OrbitControlsで360度回転可能に */}
        <OrbitControls
          enableZoom={false} // ズームは無効化 (任意)
          enablePan={false} // パンも無効化 (任意)
          enableRotate={true} // 回転は有効化
          autoRotate={true} // ★ 自動回転を有効化 ★
          autoRotateSpeed={1.0} // 自動回転の速度
          minPolarAngle={Math.PI / 2.5} // 縦回転の制限 (下から見上げすぎない)
          maxPolarAngle={Math.PI / 2.5} // 縦回転の制限 (上から見下ろしすぎない)
          target={[0, 0, 0]} // 回転の中心
        />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
      </Canvas>
    </div>
  );
}

// Preload the model (optional but recommended)
if (typeof window !== 'undefined') {
    try {
        useGLTF.preload('/deviceModel.glb'); // Adjust path
    } catch (error) {
        console.error("Failed to preload device model:", error);
    }
}