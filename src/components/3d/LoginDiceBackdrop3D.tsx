import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Reusable luxury obsidian die with cyan glowing pips matching user's photo
const FuturisticCyberDie: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  size?: number;
  rotSpeed?: number;
}> = ({ position, rotation, size = 1.8, rotSpeed = 0.2 }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 1.2 + position[0]) * 0.18;
    meshRef.current.rotation.y += delta * rotSpeed * 0.6;
    meshRef.current.rotation.x += delta * rotSpeed * 0.3;
  });

  const half = size / 2;
  const pipOffset = half + 0.008;
  const pipRadius = size * 0.085;
  const pipDist = size * 0.26;

  // Render glowing cyan circular pips
  const renderPips = (count: number) => {
    const coords: [number, number][] = [];
    if (count === 1) coords.push([0, 0]);
    if (count === 2) coords.push([-pipDist, -pipDist], [pipDist, pipDist]);
    if (count === 3) coords.push([-pipDist, -pipDist], [0, 0], [pipDist, pipDist]);
    if (count === 4) coords.push([-pipDist, -pipDist], [pipDist, -pipDist], [-pipDist, pipDist], [pipDist, pipDist]);
    if (count === 5) coords.push([-pipDist, -pipDist], [pipDist, -pipDist], [0, 0], [-pipDist, pipDist], [pipDist, pipDist]);
    if (count === 6) coords.push([-pipDist, -pipDist], [-pipDist, 0], [-pipDist, pipDist], [pipDist, -pipDist], [pipDist, 0], [pipDist, pipDist]);

    return (
      <group>
        {coords.map(([x, y], i) => (
          <group key={i} position={[x, y, 0]}>
            {/* Recessed dark socket ring */}
            <mesh position={[0, 0, -0.005]}>
              <ringGeometry args={[pipRadius * 0.9, pipRadius * 1.35, 24]} />
              <meshBasicMaterial color="#020617" />
            </mesh>
            {/* Glowing cyan pip center */}
            <mesh>
              <circleGeometry args={[pipRadius, 24]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            {/* Cyan pip glow halo */}
            <pointLight color="#06b6d4" intensity={0.4} distance={0.8} />
          </group>
        ))}
      </group>
    );
  };

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Glossy Obsidian Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color="#06070d"
          roughness={0.08}
          metalness={0.95}
        />
      </mesh>

      {/* Subtle Purple-lit Chamfer Outline */}
      <mesh>
        <boxGeometry args={[size + 0.015, size + 0.015, size + 0.015]} />
        <meshBasicMaterial color="#a855f7" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Faces with Glowing Cyan Pips */}
      {/* Top (+Y) */}
      <group position={[0, pipOffset, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {renderPips(6)}
      </group>
      {/* Bottom (-Y) */}
      <group position={[0, -pipOffset, 0]} rotation={[Math.PI / 2, 0, 0]}>
        {renderPips(1)}
      </group>
      {/* Front (+Z) */}
      <group position={[0, 0, pipOffset]} rotation={[0, 0, 0]}>
        {renderPips(4)}
      </group>
      {/* Back (-Z) */}
      <group position={[0, 0, -pipOffset]} rotation={[0, Math.PI, 0]}>
        {renderPips(3)}
      </group>
      {/* Right (+X) */}
      <group position={[pipOffset, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderPips(2)}
      </group>
      {/* Left (-X) */}
      <group position={[-pipOffset, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {renderPips(5)}
      </group>
    </group>
  );
};

export const LoginDiceBackdrop3D: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 bg-[#030308] overflow-hidden pointer-events-none">
      {/* Atmospheric Purple Radial Gradient Bloom behind the dice, matching the photo */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(126,34,206,0.28)_0%,_rgba(59,7,100,0.12)_45%,_transparent_75%)] pointer-events-none" />

      {/* Subtle background stars */}
      <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_20px_30px,#ffffff,rgba(0,0,0,0)),radial-gradient(1px_1px_at_40px_70px,#a855f7,rgba(0,0,0,0)),radial-gradient(1px_1px_at_90px_40px,#06b6d4,rgba(0,0,0,0))] bg-[length:120px_120px] opacity-40" />

      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.25} color="#4c1d95" />

        {/* Strong Vibrant Royal Purple Rim Lighting from Left & Right matching user's photo */}
        <directionalLight position={[-6, 4, 3]} intensity={4.5} color="#c084fc" />
        <directionalLight position={[6, -3, 2]} intensity={3.8} color="#9333ea" />
        <pointLight position={[0, 0, 4]} intensity={1.8} color="#06b6d4" distance={8} />

        {/* Top Floating Die matching the photo angle */}
        <FuturisticCyberDie
          position={[0, 1.9, 0]}
          rotation={[0.7, -0.65, 0.4]}
          size={1.9}
          rotSpeed={0.15}
        />

        {/* Bottom Floating Die matching the photo angle */}
        <FuturisticCyberDie
          position={[0, -2.1, 0.2]}
          rotation={[0.3, 0.45, -0.2]}
          size={2.0}
          rotSpeed={-0.12}
        />
      </Canvas>
    </div>
  );
};
