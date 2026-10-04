import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerColor } from '../../types/game';
import { soundManager } from '../../audio/soundManager';

interface ClassicDice3DProps {
  value: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onRoll: () => void;
  activeColor?: PlayerColor;
  position?: [number, number, number];
}

const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  6: [Math.PI, 0, 0],
  2: [-Math.PI / 2, 0, 0],
  5: [Math.PI / 2, 0, 0],
  3: [0, 0, Math.PI / 2],
  4: [0, 0, -Math.PI / 2],
};

export const ClassicDice3D: React.FC<ClassicDice3DProps> = ({
  value = 1,
  isRolling,
  canRoll,
  onRoll,
  activeColor = 'blue',
  position = [0, 1.2, 0],
}) => {
  const diceGroupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const rollAnim = useRef({
    rolling: false,
    progress: 0,
    duration: 0.8,
    startRot: new THREE.Euler(),
    targetRot: new THREE.Euler(),
    extraRotations: new THREE.Vector3(),
  });

  useEffect(() => {
    if (isRolling && diceGroupRef.current) {
      soundManager.playDiceRoll();
      const targetFace = value || Math.floor(Math.random() * 6) + 1;
      const targetRots = FACE_ROTATIONS[targetFace] || [0, 0, 0];

      const extraX = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;
      const extraY = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;
      const extraZ = (Math.floor(Math.random() * 2) + 2) * Math.PI * 2;

      rollAnim.current = {
        rolling: true,
        progress: 0,
        duration: 0.8,
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

      let bounceY = 0;
      if (p < 0.6) {
        bounceY = Math.sin((p / 0.6) * Math.PI) * 1.3;
      } else {
        bounceY = Math.sin(((p - 0.6) / 0.4) * Math.PI) * 0.4;
      }
      diceGroupRef.current.position.y = position[1] + bounceY;

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
      if (canRoll) {
        diceGroupRef.current.position.y = position[1] + Math.sin(time * 4) * 0.08;
      } else {
        diceGroupRef.current.position.y = position[1];
      }
    }
  });

  const size = 0.95;
  const half = size / 2;
  const pipOffset = half + 0.008;

  // Classic White Body with Black Pips as seen in table.jpg
  const bodyColor = '#ffffff';
  const pipColor = '#0f172a';

  const renderPips = (count: number) => {
    const r = 0.075;
    const d = 0.24;
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
            <circleGeometry args={[r, 24]} />
            <meshBasicMaterial color={pipColor} />
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
      {/* Light bounce when can roll */}
      {canRoll && (
        <pointLight
          color="#38bdf8"
          intensity={hovered ? 2 : 1}
          distance={2.5}
        />
      )}

      {/* Main White Die Cube with slightly rounded/beveled corners */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={hovered && canRoll ? '#f8fafc' : bodyColor}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>

      {/* Subtle border outline */}
      <mesh>
        <boxGeometry args={[size + 0.015, size + 0.015, size + 0.015]} />
        <meshBasicMaterial color="#cbd5e1" wireframe />
      </mesh>

      {/* 6 Faces with black pips matching photo */}
      <group position={[0, pipOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {renderPips(1)}
      </group>
      <group position={[0, -pipOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {renderPips(6)}
      </group>
      <group position={[0, 0, pipOffset]} rotation={[0, 0, 0]}>
        {renderPips(2)}
      </group>
      <group position={[0, 0, -pipOffset]} rotation={[0, Math.PI, 0]}>
        {renderPips(5)}
      </group>
      <group position={[pipOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderPips(3)}
      </group>
      <group position={[-pipOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {renderPips(4)}
      </group>
    </group>
  );
};
