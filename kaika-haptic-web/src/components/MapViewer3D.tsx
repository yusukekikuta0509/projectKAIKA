// src/components/MapViewer3D.tsx
'use client';
import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Plane, Box, Sphere, Capsule, Stars, Grid, Edges } from '@react-three/drei';
import * as THREE from 'three';

/* ── 定数 ── */
const BLOCK = 6;
const ROAD = 1.5;
const BLOCKS = 12;
const HALF = (BLOCK + ROAD) * BLOCKS;

/* ── 型定義 ── */
type Position = { x: number; y: number }; // 2D Logic Position
interface MapViewer3DProps {
  userPosition: Position; // Current 2D logic position
  userDirection: { x: number; y: number }; // Current movement direction (for avatar orientation)
  collectionState: 'idle' | 'collecting' | 'collected' | 'submitting';
}

/* ── Camera follow (微調整) ── */
function CameraRig({ target }: { target: THREE.Vector3 }) {
  const { camera } = useThree();
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    // デルタタイムを考慮してlerp係数を調整 (フレームレートに依存しにくくする)
    const lerpFactor = 1 - Math.exp(-delta * 4); // Adjust speed (4 is arbitrary)

    // カメラ位置のlerp
    const idealPosition = new THREE.Vector3(target.x, 25, target.z + 35); // 距離感調整
    camera.position.lerp(idealPosition, lerpFactor * 0.8); // 位置のlerp係数

    // 注視点のlerp
    currentLookAt.current.lerp(target, lerpFactor); // 注視点のlerp係数
    camera.lookAt(currentLookAt.current);
  });
  return null;
}

/* ── Roads (変更なし) ── */
function Roads() {
    const ref = useRef<THREE.InstancedMesh>(null!);
    useEffect(() => { if (!ref.current) return; const dummy = new THREE.Object3D(); const total = (BLOCKS * 2 + 1) * 2; let index = 0; for (let r = -BLOCKS; r <= BLOCKS; r++) { const o = r * (BLOCK + ROAD); dummy.position.set(0, 0.01, o); dummy.scale.set(HALF * 2, 1, ROAD); dummy.updateMatrix(); if(index < total) ref.current.setMatrixAt(index++, dummy.matrix); dummy.position.set(o, 0.01, 0); dummy.scale.set(ROAD, 1, HALF * 2); dummy.updateMatrix(); if(index < total) ref.current.setMatrixAt(index++, dummy.matrix); } while (index < ref.current.count) { dummy.scale.set(0,0,0); dummy.updateMatrix(); ref.current.setMatrixAt(index++, dummy.matrix); } ref.current.instanceMatrix.needsUpdate = true; }, []);
    return <instancedMesh ref={ref} args={[undefined, undefined, (BLOCKS * 2 + 1) * 2]} receiveShadow> <boxGeometry args={[1, 0.02, 1]} /> <meshStandardMaterial color="#1a1a1a" roughness={0.9} /> </instancedMesh>;
}

/* ── Glowing Center Lines (変更なし) ── */
function RoadLines() {
    const ref = useRef<THREE.InstancedMesh>(null!);
    const totalInstances = useMemo(() => { const lineSegmentLength = 2; const gapLength = 2; const patternLength = lineSegmentLength + gapLength; const lineCountPerAxis = Math.ceil(HALF * 2 / patternLength); return (BLOCKS * 2 + 1) * lineCountPerAxis * 2; }, []);
    useEffect(() => { if (!ref.current) return; const dummy = new THREE.Object3D(); let i = 0; const lineSegmentLength = 2; const gapLength = 2; const patternLength = lineSegmentLength + gapLength; for (let r = -BLOCKS; r <= BLOCKS; r++) { const o = r * (BLOCK + ROAD); for (let t = -HALF; t < HALF; t += patternLength) { dummy.position.set(t + lineSegmentLength / 2, 0.015, o); dummy.scale.set(lineSegmentLength, 1, 0.15); dummy.updateMatrix(); if(i < totalInstances) ref.current.setMatrixAt(i++, dummy.matrix); dummy.position.set(o, 0.015, t + lineSegmentLength / 2); dummy.rotation.y = Math.PI / 2; dummy.scale.set(lineSegmentLength, 1, 0.15); dummy.updateMatrix(); if(i < totalInstances) ref.current.setMatrixAt(i++, dummy.matrix); dummy.rotation.y = 0; } } while (i < totalInstances) { dummy.scale.set(0, 0, 0); dummy.updateMatrix(); ref.current.setMatrixAt(i++, dummy.matrix); } ref.current.instanceMatrix.needsUpdate = true; }, [totalInstances]);
    return <instancedMesh ref={ref} args={[undefined, undefined, totalInstances]} receiveShadow> <boxGeometry args={[1, 0.02, 1]} /> <meshStandardMaterial color="#ff6b00" emissive="#ff8c00" emissiveIntensity={0.8} toneMapped={false}/> </instancedMesh>;
}

/* ── Futuristic Buildings (変更なし) ── */
function Buildings() {
    const TOTAL = 700; const ref = useRef<THREE.InstancedMesh>(null!); const glowRef = useRef<THREE.InstancedMesh>(null!); const buildingColors = useMemo(() => [ new THREE.Color('#555555'), new THREE.Color('#666666'), new THREE.Color('#777777'), ], []);
    useEffect(() => { if (!ref.current || !glowRef.current) return; const dummy = new THREE.Object3D(); const glowDummy = new THREE.Object3D(); const color = new THREE.Color(); let i = 0; const colors = new Float32Array(TOTAL * 3); while (i < TOTAL) { const bx = (Math.random() * BLOCKS * 2 - BLOCKS) * (BLOCK + ROAD); const bz = (Math.random() * BLOCKS * 2 - BLOCKS) * (BLOCK + ROAD); if (Math.abs(bx % (BLOCK + ROAD)) < ROAD * 0.8 || Math.abs(bz % (BLOCK + ROAD)) < ROAD * 0.8) continue; const h = THREE.MathUtils.randFloat(0.5, 5); const b = THREE.MathUtils.randFloat(0.6, 1.8); dummy.position.set(bx, h / 2, bz); dummy.scale.set(b, h, b); dummy.rotation.y = Math.random() * Math.PI * 0.1; dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix); const baseColor = buildingColors[Math.floor(Math.random() * buildingColors.length)]; color.set(baseColor).lerp(Math.random() > 0.5 ? new THREE.Color(0x999999) : new THREE.Color(0x333333), Math.random() * 0.15); colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b; if (Math.random() > 0.8) { glowDummy.position.set(bx, h + 0.1, bz); glowDummy.scale.set(b * 0.3, 0.1, b * 0.3); } else { glowDummy.position.set(0, -1000, 0); glowDummy.scale.set(0, 0, 0); } glowDummy.updateMatrix(); glowRef.current.setMatrixAt(i, glowDummy.matrix); i++; } while (i < TOTAL) { dummy.scale.set(0,0,0); dummy.updateMatrix(); ref.current.setMatrixAt(i, dummy.matrix); glowDummy.scale.set(0,0,0); glowDummy.updateMatrix(); glowRef.current.setMatrixAt(i, dummy.matrix); colors[i * 3] = 0; colors[i * 3 + 1] = 0; colors[i * 3 + 2] = 0; i++; } if (ref.current.geometry) { ref.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3)); } else { console.warn("Building geometry not available for color attribute setting."); } ref.current.instanceMatrix.needsUpdate = true; if (ref.current.geometry.attributes.color) { (ref.current.geometry.attributes.color as THREE.InstancedBufferAttribute).needsUpdate = true; } glowRef.current.instanceMatrix.needsUpdate = true; }, [buildingColors]);
    return ( <> <instancedMesh ref={ref} args={[undefined, undefined, TOTAL]} castShadow receiveShadow> <boxGeometry args={[1, 1, 1]} /> <meshStandardMaterial roughness={0.6} metalness={0.4} vertexColors /> </instancedMesh> <instancedMesh ref={glowRef} args={[undefined, undefined, TOTAL]}> <boxGeometry args={[1, 1, 1]} /> <meshBasicMaterial color="#ff6b00" toneMapped={false} transparent opacity={0.9}/> </instancedMesh> </> );
}

/* ── Avatar (歩行風アニメーション追加) ── */
function Avatar({ pos, collecting, direction }: { pos: [number, number, number], collecting: boolean, direction: {x: number, z: number} }) {
  const groupRef = useRef<THREE.Group>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);
  const intensityFactor = collecting ? 1.6 : 1.0;

  // Target direction for lookAt
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  // Current rotation for smooth turning
  const currentRotationY = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // 1. 上下動 (歩行風)
    const walkCycleSpeed = 8; // 歩行の速さ
    const walkAmplitude = 0.08; // 上下の揺れ幅
    groupRef.current.position.y = pos[1] + Math.sin(t * walkCycleSpeed) * walkAmplitude;

    // 2. 進行方向への向き (滑らかに)
    if (Math.abs(direction.x) > 0.01 || Math.abs(direction.z) > 0.01) { // Avoid looking at self if direction is zero
        // Calculate target angle based on direction
        const targetAngle = Math.atan2(direction.x, direction.z);
        // Smoothly interpolate current rotation towards target angle
        const lerpFactor = 1 - Math.exp(-delta * 10); // Rotation speed (higher is faster)
        // Handle angle wrapping correctly (shortest path)
        let angleDiff = targetAngle - currentRotationY.current;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        currentRotationY.current += angleDiff * lerpFactor;

        groupRef.current.rotation.y = currentRotationY.current;
    }

    // 3. 体の傾き (歩行風) - X軸回転
    const tiltAmplitude = 0.05; // 傾きの大きさ
    const tiltSpeed = 4;
    groupRef.current.rotation.x = Math.sin(t * tiltSpeed) * tiltAmplitude;

    // 4. 発光強度 (点滅)
    if (bodyRef.current && headRef.current) {
        const bodyMaterial = bodyRef.current.material as THREE.MeshStandardMaterial;
        const headMaterial = headRef.current.material as THREE.MeshStandardMaterial;
        if (bodyMaterial && headMaterial) {
            const pulse = 0.8 + Math.sin(t * 6) * 0.4;
            bodyMaterial.emissiveIntensity = intensityFactor * pulse * 0.7;
            headMaterial.emissiveIntensity = intensityFactor * pulse * 0.9;
        }
    }
    if (lightRef.current) { lightRef.current.intensity = intensityFactor * (2.0 + Math.sin(t * 6) * 1.0); }

  });

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]}> {/* Use base Y from props */}
       {/* Head */}
       <mesh ref={headRef} position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#ff6b00" emissive="#ff8c00" emissiveIntensity={0.9 * intensityFactor} toneMapped={false} roughness={0.4} metalness={0.1} />
       </mesh>
       {/* Body */}
       <mesh ref={bodyRef} position={[0, -0.1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1.0, 4, 8]} />
            <meshStandardMaterial color="#ff6b00" emissive="#ff8c00" emissiveIntensity={0.7 * intensityFactor} toneMapped={false} roughness={0.6} metalness={0.1} />
        </mesh>
       <pointLight ref={lightRef} color="#ff6b00" intensity={2 * intensityFactor} distance={8} decay={2} />
    </group>
  );
}


/* ── Ground Grid Floor (変更なし) ── */
function GridFloor() {
  return ( <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow> <planeGeometry args={[HALF * 2, HALF * 2, 50, 50]} /> <meshStandardMaterial color="#080808" wireframe={true} emissive="#ff6b00" emissiveIntensity={0.06} toneMapped={false} /> </mesh> );
}

/* ── Main 3D Map Viewer Component ── */
// userDirection prop を追加
export default function MapViewer3D({ userPosition, collectionState, userDirection }: MapViewer3DProps & { userDirection: {x: number, z: number}}) {
  const scale = (BLOCK + ROAD);
  const worldOriginOffset = HALF;
  const wx = (userPosition.x / 100 * (HALF*2)) - worldOriginOffset;
  const wz = (userPosition.y / 100 * (HALF*2)) - worldOriginOffset;
  const target = useMemo(() => new THREE.Vector3(wx, 0, wz), [wx, wz]);
  const avatarBaseY = 0.6;
  const avatarPos: [number, number, number] = [wx, avatarBaseY, wz];

  return (
    <div style={{ height: '100%', width: '100%', background: 'var(--kaika-black, #0A0A0A)', borderRadius: 'inherit', overflow: 'hidden' }}>
      <Canvas shadows >
        <PerspectiveCamera makeDefault fov={55} near={1} far={300} /> {/* Removed position, controlled by CameraRig */}
        <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={15} maxDistance={90} target={target.clone()} enableDamping={true} dampingFactor={0.1}/>
        <CameraRig target={target} />

        {/* Environment */}
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={['#050505', 70, 180]} />
        <Stars radius={150} depth={60} count={6000} factor={5} saturation={0} fade speed={0.8} />
        <ambientLight intensity={0.35} color="#ffffff" />
        <directionalLight position={[50, 70, 40]} castShadow intensity={1.0} color="#ffffff" shadow-mapSize={[1024, 1024]} shadow-camera-far={200} shadow-camera-left={-HALF} shadow-camera-right={HALF} shadow-camera-top={HALF} shadow-camera-bottom={-HALF} />
        <pointLight position={[-40, 30, -40]} intensity={0.4} color="#ffaa55" distance={150} />

        {/* Scene elements */}
        <group>
            <GridFloor />
            <Roads />
            <RoadLines />
            <Buildings />
            {/* Avatarにdirectionを渡す */}
            <Avatar pos={avatarPos} collecting={collectionState === 'collecting'} direction={userDirection} />
        </group>
      </Canvas>
    </div>
  );
}