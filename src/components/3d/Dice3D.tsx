import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DiceStyle, PlayerColor } from '../../types/game';
import { soundManager } from '../../audio/soundManager';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  style?: DiceStyle;
  activeColor?: PlayerColor;
  position?: [number, number, number];
}

// Target rotations [x, y, z] in radians to bring specific face to top (+Y)
// Standard orientation:
// 1 = top (+Y): [0, 0, 0]
// 6 = bottom (-Y): [Math.PI, 0, 0]
// 2 = front (+Z): [-Math.PI / 2, 0, 0]
// 5 = back (-Z): [Math.PI / 2, 0, 0]
// 3 = right (+X): [0, 0, Math.PI / 2]
// 4 = left (-X): [0, 0, -Math.PI / 2]
const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  5: [Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
};

export const Dice3D: React.FC<Dice3DProps> = ({
  value = 1,
  isRolling,
  canRoll,
  onRoll,
  style = 'crystal',
  activeColor = 'red',
  position = [0, 1.4, 0],
}) => {
  const diceGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Animation timeline state
  const rollAnim = useRef({
    rolling: false,
    progress: 0,
    duration: 0.85,
    startRot: new THREE.Euler(),
    targetRot: new THREE.Euler(),
    extraRotations: new THREE.Vector3(),
  });

  // Watch for roll trigger
  useEffect(() => {
    if (isRolling && diceGroupRef.current) {
      soundManager.playDiceRoll();
      const targetFace = value || Math.floor(Math.random() * 6) + 1;
      const targetRots = FACE_ROTATIONS[targetFace] || [0, 0, 0];

      // Add 2 to 4 full 360-degree spins around each axis
      const extraX = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;
      const extraY = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;
      const extraZ = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;

      rollAnim.current = {
        rolling: true,
        progress: 0,
        duration: 0.85,
        startRot: diceGroupRef.current.rotation.clone(),
        targetRot: new THREE.Euler(targetRots[0], targetRots[1], targetRots[2]),
        extraRotations: new THREE.Vector3(extraX, extraY, extraZ),
      };
    }
  }, [isRolling, value]);

  useFrame((state, delta) => {
    if (!diceGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (rollAnim.current.rolling) {
      rollAnim.current.progress += delta / rollAnim.current.duration;
      const p = Math.min(rollAnim.current.progress, 1);

      // Bounce arc in Y
      // 2 bounces: first big bounce up, second smaller bounce
      let bounceY = 0;
      if (p < 0.6) {
        bounceY = Math.sin((p / 0.6) * Math.PI) * 1.2;
      } else {
        bounceY = Math.sin(((p - 0.6) / 0.4) * Math.PI) * 0.35;
      }
      diceGroupRef.current.position.y = position[1] + bounceY;

      // Eased rotation
      const easeOutCubic = 1 - Math.pow(1 - p, 3);
      const curX =
        rollAnim.current.startRot.x +
        (rollAnim.current.targetRot.x + rollAnim.current.extraRotations.x - rollAnim.current.startRot.x) * easeOutCubic;
      const curY =
        rollAnim.current.startRot.y +
        (rollAnim.current.targetRot.y + rollAnim.current.extraRotations.y - rollAnim.current.startRot.y) * easeOutCubic;
      const curZ =
        rollAnim.current.startRot.z +
        (rollAnim.current.targetRot.z + rollAnim.current.extraRotations.z - rollAnim.current.startRot.z) * easeOutCubic;

      diceGroupRef.current.rotation.set(curX, curY, curZ);

      if (p >= 1) {
        rollAnim.current.rolling = false;
        diceGroupRef.current.position.y = position[1];
        diceGroupRef.current.rotation.copy(rollAnim.current.targetRot);
        if (value === 6) {
          soundManager.playSixRolled();
        }
      }
    } else {
      // Idle gentle float and slight orientation wobble when ready to roll
      if (canRoll) {
        diceGroupRef.current.position.y = position[1] + Math.sin(time * 3) * 0.08;
      } else {
        diceGroupRef.current.position.y = position[1];
      }
    }
  });

  // Material & Pip styling
  const size = 0.85;
  const half = size / 2;
  const pipOffset = half + 0.005;

  let bodyColor = '#1e1b4b';
  let pipColor = '#d4af37';
  let metalness = 0.8;
  let roughness = 0.2;
  let transmission = 0;

  if (style === 'crystal') {
    bodyColor = '#312e81';
    pipColor = '#fef08a';
    metalness = 0.2;
    roughness = 0.05;
    transmission = 0.65;
  } else if (style === 'gold_ingot') {
    bodyColor = '#d4af37';
    pipColor = '#dc2626';
    metalness = 0.95;
    roughness = 0.15;
  } else if (style === 'neon_prism') {
    bodyColor = '#09090b';
    pipColor = '#06b6d4';
    metalness = 0.9;
    roughness = 0.3;
  }

  // Pip helper: draws dots on plane
  const renderPips = (count: number) => {
    const r = 0.06;
    const d = 0.22;
    const pips: [number, number][] = [];

    switch (count) {
      case 1:
        pips.push([0, 0]);
        break;
      case 2:
        pips.push([-d, -d], [d, d]);
        break;
      case 3:
        pips.push([-d, -d], [0, 0], [d, d]);
        break;
      case 4:
        pips.push([-d, -d], [d, -d], [-d, d], [d, d]);
        break;
      case 5:
        pips.push([-d, -d], [d, -d], [0, 0], [-d, d], [d, d]);
        break;
      case 6:
        pips.push([-d, -d], [-d, 0], [-d, d], [d, -d], [d, 0], [d, d]);
        break;
    }

    return (
      <group>
        {pips.map(([px, py], i) => (
          <mesh key={i} position={[px, py, 0]}>
            <circleGeometry args={[r, 16]} />
            <meshStandardMaterial
              color={pipColor}
              emissive={pipColor}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
    );
  };

  return (
    <group
      ref={diceGroupRef}
      position={position}
      onClick={(e) => {
        if (canRoll && !isRolling) {
          e.stopPropagation();
          onRoll();
        }
      }}
      onPointerOver={(e) => {
        if (canRoll && !isRolling) {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Outer Golden Glow when can roll */}
      {canRoll && (
        <pointLight
          color={pipColor}
          intensity={hovered ? 2.5 : 1.2}
          distance={2.5}
        />
      )}

      {/* Main Cube Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshPhysicalMaterial
          color={hovered && canRoll ? '#4338ca' : bodyColor}
          metalness={metalness}
          roughness={roughness}
          transmission={transmission}
          transparent={transmission > 0}
          opacity={0.92}
          ior={1.6}
        />
      </mesh>

      {/* Gold Edge Trim Frame */}
      <mesh>
        <boxGeometry args={[size + 0.02, size + 0.02, size + 0.02]} />
        <meshStandardMaterial
          color="#d4af37"
          wireframe
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* 6 Faces with Pips */}
      {/* Face 1: Top (+Y) */}
      <group position={[0, pipOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {renderPips(1)}
      </group>

      {/* Face 6: Bottom (-Y) */}
      <group position={[0, -pipOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {renderPips(6)}
      </group>

      {/* Face 2: Front (+Z) */}
      <group position={[0, 0, pipOffset]} rotation={[0, 0, 0]}>
        {renderPips(2)}
      </group>

      {/* Face 5: Back (-Z) */}
      <group position={[0, 0, -pipOffset]} rotation={[0, Math.PI, 0]}>
        {renderPips(5)}
      </group>

      {/* Face 3: Right (+X) */}
      <group position={[pipOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderPips(3)}
      </group>

      {/* Face 4: Left (-X) */}
      <group position={[-pipOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {renderPips(4)}
      </group>
    </group>
  );
};
