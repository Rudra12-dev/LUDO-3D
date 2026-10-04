import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerColor, TokenState } from '../../types/game';
import { getTokenWorldPosition } from '../../engine/ludoCoordinates';

interface LudoToken3DProps {
  token: TokenState;
  tokenIndex: number;
  color: PlayerColor;
  isSelectable: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  stackOffset?: number;
  isCapturing?: boolean;
}

const COLOR_CONFIG: Record<
  PlayerColor,
  {
    core: string;
    glow: string;
    glass: string;
    light: string;
  }
> = {
  red: {
    core: '#dc2626',
    glow: '#f87171',
    glass: '#991b1b',
    light: '#ef4444',
  },
  green: {
    core: '#059669',
    glow: '#34d399',
    glass: '#065f46',
    light: '#10b981',
  },
  yellow: {
    core: '#d97706',
    glow: '#fbbf24',
    glass: '#92400e',
    light: '#f59e0b',
  },
  blue: {
    core: '#2563eb',
    glow: '#60a5fa',
    glass: '#1e40af',
    light: '#3b82f6',
  },
};

export const LudoToken3D: React.FC<LudoToken3DProps> = ({
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
  const coreRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Current visual position for smooth interpolation
  const currentPos = useRef(
    getTokenWorldPosition(color, tokenIndex, token.step, stackOffset)
  );
  const targetPos = useRef(
    getTokenWorldPosition(color, tokenIndex, token.step, stackOffset)
  );

  // Hopping animation state
  const hopState = useRef({
    isHopping: false,
    hopProgress: 0,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
  });

  // Watch step updates
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
    const config = COLOR_CONFIG[color];

    // Handle hop motion with parabolic arc and squash/stretch
    if (hopState.current.isHopping) {
      hopState.current.hopProgress += delta * 3.5; // Hop duration ~0.28s
      const p = Math.min(hopState.current.hopProgress, 1);

      // Arc height
      const arcHeight = 0.55 * Math.sin(p * Math.PI);
      const lerpedX = THREE.MathUtils.lerp(
        hopState.current.startPos.x,
        hopState.current.endPos.x,
        p
      );
      const lerpedZ = THREE.MathUtils.lerp(
        hopState.current.startPos.z,
        hopState.current.endPos.z,
        p
      );
      const lerpedY = THREE.MathUtils.lerp(
        hopState.current.startPos.y,
        hopState.current.endPos.y,
        p
      ) + arcHeight;

      groupRef.current.position.set(lerpedX, lerpedY, lerpedZ);
      currentPos.current = { x: lerpedX, y: lerpedY, z: lerpedZ };

      // Squash and stretch
      const stretch = 1 + Math.sin(p * Math.PI) * 0.25;
      const squash = 1 - Math.sin(p * Math.PI) * 0.12;
      groupRef.current.scale.set(squash, stretch, squash);

      if (p >= 1) {
        hopState.current.isHopping = false;
        groupRef.current.scale.set(1, 1, 1);
      }
    } else {
      // Idle / Floating state when selectable
      const basePos = targetPos.current;
      let floatY = basePos.y;
      if (isSelectable) {
        floatY += Math.sin(time * 5 + tokenIndex) * 0.08 + 0.06;
      }
      groupRef.current.position.set(basePos.x, floatY, basePos.z);

      // Scale reset
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 8);
    }

    // Glowing selection ring animation
    if (ringRef.current) {
      if (isSelectable) {
        ringRef.current.visible = true;
        ringRef.current.rotation.z += delta * 2;
        const s = 1 + Math.sin(time * 4) * 0.12;
        ringRef.current.scale.set(s, s, 1);
      } else {
        ringRef.current.visible = false;
      }
    }

    // Inner core pulse
    if (coreRef.current) {
      const pulse = isSelectable ? 0.3 * Math.sin(time * 6) + 0.7 : 0.4;
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = pulse;
      }
    }
  });

  const config = COLOR_CONFIG[color];

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
      {/* Selection Glow Indicator Ring on Floor */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        visible={false}
      >
        <ringGeometry args={[0.26, 0.36, 32]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Royal Pawn Geometry:
          1. Gold Base Flange */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.06, 24]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 2. Glass Flared Body */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.11, 0.21, 0.28, 24]} />
        <meshPhysicalMaterial
          color={config.glass}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.1}
          transmission={0.6}
          ior={1.5}
        />
      </mesh>

      {/* 3. Glowing Inner Energy Core */}
      <mesh ref={coreRef} position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial
          color={config.core}
          emissive={config.glow}
          emissiveIntensity={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* 4. Gold Waist Ring Collar */}
      <mesh position={[0, 0.36, 0]}>
        <torusGeometry args={[0.13, 0.025, 12, 24]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>

      {/* 5. Crown Finial Sphere */}
      <mesh position={[0, 0.48, 0]}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshPhysicalMaterial
          color={hovered || isSelected ? '#ffffff' : config.core}
          emissive={config.glow}
          emissiveIntensity={hovered || isSelected ? 0.7 : 0.3}
          roughness={0.1}
          metalness={0.2}
          transmission={0.5}
        />
      </mesh>

      {/* 6. Gold Apex Spike / Mini Lotus Crown */}
      <mesh position={[0, 0.63, 0]}>
        <coneGeometry args={[0.04, 0.09, 12]} />
        <meshStandardMaterial
          color="#d4af37"
          metalness={0.95}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
};
