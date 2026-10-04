import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlayerState, PlayerColor } from '../../types/game';
import { LudoToken3D } from './LudoToken3D';

interface Podium3DProps {
  rankedPlayers: PlayerState[];
  winnerColor: PlayerColor;
}

export const Podium3D: React.FC<Podium3DProps> = ({ rankedPlayers, winnerColor }) => {
  const trophyRef = useRef<THREE.Group>(null);
  const spotlightRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    if (trophyRef.current) {
      trophyRef.current.rotation.y += delta * 0.8;
      trophyRef.current.position.y = 2.8 + Math.sin(state.clock.getElapsedTime() * 2) * 0.12;
    }
    if (spotlightRef.current) {
      spotlightRef.current.intensity = 3 + Math.sin(state.clock.getElapsedTime() * 3) * 0.8;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Central Rotating Gold Trophy */}
      <group ref={trophyRef} position={[0, 2.8, 0]}>
        <pointLight ref={spotlightRef} color="#fef08a" intensity={3.5} distance={6} />
        {/* Trophy Cup */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.55, 0.25, 0.7, 24]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Trophy Base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.28, 0.2, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.35, 0.38, 0.14, 24]} />
          <meshStandardMaterial color="#1a1a24" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glowing Gem inside Trophy Cup */}
        <mesh position={[0, 0.55, 0]}>
          <octahedronGeometry args={[0.22]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#d4af37"
            emissiveIntensity={1}
            roughness={0.1}
          />
        </mesh>
        {/* Left Handle */}
        <mesh position={[-0.55, 0.45, 0]} rotation={[0, 0, Math.PI / 6]}>
          <torusGeometry args={[0.24, 0.05, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Right Handle */}
        <mesh position={[0.55, 0.45, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <torusGeometry args={[0.24, 0.05, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#d4af37" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Podium 1st Place (Center) */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[1.3, 1.45, 1.5, 32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Gold Inlay Ring */}
        <mesh position={[0, 1.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.25, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Winner Token Showcase */}
        <group position={[0, 1.55, 0]} scale={[1.4, 1.4, 1.4]}>
          <LudoToken3D
            token={{ id: 0, color: winnerColor, step: 57, isHome: true, inYard: false }}
            tokenIndex={0}
            color={winnerColor}
            isSelectable={false}
          />
        </group>
      </group>

      {/* Podium 2nd Place (Left) */}
      {rankedPlayers.length > 1 && (
        <group position={[-2.4, 0, 0]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[1.1, 1.2, 1.0, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.05, 32]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
          </mesh>
          <group position={[0, 1.05, 0]} scale={[1.1, 1.1, 1.1]}>
            <LudoToken3D
              token={{
                id: 0,
                color: rankedPlayers[1].color,
                step: 57,
                isHome: true,
                inYard: false,
              }}
              tokenIndex={0}
              color={rankedPlayers[1].color}
              isSelectable={false}
            />
          </group>
        </group>
      )}

      {/* Podium 3rd Place (Right) */}
      {rankedPlayers.length > 2 && (
        <group position={[2.4, 0, 0]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[1.0, 1.1, 0.7, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 0.71, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.95, 32]} />
            <meshStandardMaterial color="#b45309" metalness={0.9} roughness={0.2} />
          </mesh>
          <group position={[0, 0.75, 0]} scale={[1.0, 1.0, 1.0]}>
            <LudoToken3D
              token={{
                id: 0,
                color: rankedPlayers[2].color,
                step: 57,
                isHome: true,
                inYard: false,
              }}
              tokenIndex={0}
              color={rankedPlayers[2].color}
              isSelectable={false}
            />
          </group>
        </group>
      )}
    </group>
  );
};
