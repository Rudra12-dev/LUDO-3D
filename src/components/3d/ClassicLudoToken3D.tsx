import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerColor, TokenState } from '../../types/game';
import { getTokenWorldPosition } from '../../engine/ludoCoordinates';

interface ClassicLudoToken3DProps {
  token: TokenState;
  tokenIndex: number;
  color: PlayerColor;
  isSelectable: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  stackOffset?: number;
}

// Authentic Ludo King Token Colors matching table.jpg
const COLOR_CONFIG: Record<
  PlayerColor,
  {
    disc: string;
    rim: string;
    star: string;
    light: string;
  }
> = {
  red: {
    disc: '#dc2626',
    rim: '#e2e8f0', // Silver metallic rim
    star: '#ffffff',
    light: '#ef4444',
  },
  green: {
    disc: '#16a34a',
    rim: '#e2e8f0', // Silver metallic rim
    star: '#ffffff',
    light: '#22c55e',
  },
  yellow: {
    disc: '#eab308',
    rim: '#d97706', // Gold metallic rim
    star: '#ffffff',
    light: '#fde047',
  },
  blue: {
    disc: '#0284c7',
    rim: '#e2e8f0', // Silver metallic rim
    star: '#ffffff',
    light: '#38bdf8',
  },
};

// 5-Pointed Star Shape for Token Medallion
function createStarShape(radius: number, innerRadius: number, points: number = 5): THREE.Shape {
  const shape = new THREE.Shape();
  const step = Math.PI / points;
  for (let i = 0; i < 2 * points; i++) {
    const r = i % 2 === 0 ? radius : innerRadius;
    const angle = i * step - Math.PI / 2;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

export const ClassicLudoToken3D: React.FC<ClassicLudoToken3DProps> = ({
  token,
  tokenIndex,
  color,
  isSelectable,
  isSelected = false,
  onSelect,
  stackOffset = 0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const starShape = useMemo(() => createStarShape(0.12, 0.055, 5), []);
  const starGeom = useMemo(() => new THREE.ShapeGeometry(starShape), [starShape]);

  // Position interpolation
  const currentPos = useRef(
    getTokenWorldPosition(color, tokenIndex, token.step, stackOffset)
  );
  const targetPos = useRef(
    getTokenWorldPosition(color, tokenIndex, token.step, stackOffset)
  );

  // Hop animation
  const hopState = useRef({
    isHopping: false,
    hopProgress: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
  });

  useEffect(() => {
    const newTarget = getTokenWorldPosition(color, tokenIndex, token.step, stackOffset);
    const startVec = new THREE.Vector3(currentPos.current.x, currentPos.current.y, currentPos.current.z);
    const endVec = new THREE.Vector3(newTarget.x, newTarget.y, newTarget.z);

    if (startVec.distanceTo(endVec) > 0.05) {
      hopState.current = {
        isHopping: true,
        hopProgress: 0,
        startPos: startVec,
        endPos: endVec,
      };
    }
    targetPos.current = newTarget;
  }, [token.step, stackOffset, color, tokenIndex]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    if (hopState.current.isHopping) {
      hopState.current.hopProgress += delta * 3.8;
      const p = Math.min(hopState.current.hopProgress, 1);

      const arcHeight = 0.6 * Math.sin(p * Math.PI);
      const lerpedX = THREE.MathUtils.lerp(hopState.current.startPos.x, hopState.current.endPos.x, p);
      const lerpedZ = THREE.MathUtils.lerp(hopState.current.startPos.z, hopState.current.endPos.z, p);
      const lerpedY = THREE.MathUtils.lerp(hopState.current.startPos.y, hopState.current.endPos.y, p) + arcHeight;

      groupRef.current.position.set(lerpedX, lerpedY, lerpedZ);
      currentPos.current = { x: lerpedX, y: lerpedY, z: lerpedZ };

      const stretch = 1 + Math.sin(p * Math.PI) * 0.2;
      const squash = 1 - Math.sin(p * Math.PI) * 0.1;
      groupRef.current.scale.set(squash, stretch, squash);

      if (p >= 1) {
        hopState.current.isHopping = false;
        groupRef.current.scale.set(1, 1, 1);
      }
    } else {
      const basePos = targetPos.current;
      let floatY = basePos.y;
      if (isSelectable) {
        floatY += Math.sin(time * 6 + tokenIndex) * 0.08 + 0.08;
      }
      groupRef.current.position.set(basePos.x, floatY, basePos.z);
    }

    // Glow indicator ring
    if (ringRef.current) {
      if (isSelectable) {
        ringRef.current.visible = true;
        ringRef.current.rotation.z += delta * 2.5;
        const s = 1 + Math.sin(time * 5) * 0.15;
        ringRef.current.scale.set(s, s, 1);
      } else {
        ringRef.current.visible = false;
      }
    }
  });

  const config = COLOR_CONFIG[color];
  const coinRadius = 0.28;
  const coinHeight = 0.12;

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        if (isSelectable && onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
      onPointerOver={(e) => {
        if (isSelectable) {
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
      {/* Golden Pulse Selection Ring on Ground */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        visible={false}
      >
        <ringGeometry args={[0.3, 0.42, 32]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* 
        Token Coin Body matching table.jpg:
        1. Metallic Silver/Gold Outer Chamfered Rim
      */}
      <mesh position={[0, coinHeight * 0.5, 0]}>
        <cylinderGeometry args={[coinRadius, coinRadius * 1.05, coinHeight, 32]} />
        <meshStandardMaterial
          color={config.rim}
          metalness={0.85}
          roughness={0.2}
        />
      </mesh>

      {/* 2. Concentric Decorative Ring on Top */}
      <mesh position={[0, coinHeight + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[coinRadius * 0.72, coinRadius * 0.92, 32]} />
        <meshStandardMaterial
          color={config.rim}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* 3. Glossy Colored Center Medallion */}
      <mesh position={[0, coinHeight + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[coinRadius * 0.7, 32]} />
        <meshStandardMaterial
          color={hovered && isSelectable ? '#ffffff' : config.disc}
          roughness={0.15}
          metalness={0.25}
        />
      </mesh>

      {/* 4. Embossed 5-Pointed Star Center Insignia (exactly like in photo) */}
      <mesh
        geometry={starGeom}
        position={[0, coinHeight + 0.008, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={config.star}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Light glow when selectable */}
      {isSelectable && (
        <pointLight
          color={config.light}
          intensity={hovered ? 1.5 : 0.8}
          distance={1.5}
        />
      )}
    </group>
  );
};
