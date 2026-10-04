import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CosmicAtmosphereProps {
  theme?: string;
  lowPowerMode?: boolean;
}

export const CosmicAtmosphere: React.FC<CosmicAtmosphereProps> = ({
  theme = 'royal_cosmos',
  lowPowerMode = false,
}) => {
  const starsRef = useRef<THREE.Points>(null);
  const goldDustRef = useRef<THREE.Points>(null);
  const nebulaRef = useRef<THREE.Group>(null);
  const shootingStarRef = useRef<THREE.Mesh>(null);

  // Background Starfield
  const starCount = lowPowerMode ? 600 : 1600;
  const [starPositions, starColors] = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const colorPalette = [
      new THREE.Color('#ffffff'),
      new THREE.Color('#d4af37'),
      new THREE.Color('#a5b4fc'),
      new THREE.Color('#fef08a'),
      new THREE.Color('#f43f5e'),
    ];

    for (let i = 0; i < starCount; i++) {
      // Distribute in sphere
      const r = 25 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    return [positions, colors];
  }, [starCount]);

  // Floating Royal Gold Dust
  const dustCount = lowPowerMode ? 80 : 250;
  const dustPositions = useMemo(() => {
    const positions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = Math.random() * 8 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 22;
    }
    return positions;
  }, [dustCount]);

  // Shooting star animation state
  const shootingStarState = useRef({
    active: false,
    timer: 0,
    pos: new THREE.Vector3(0, 0, 0),
    vel: new THREE.Vector3(0, 0, 0),
  });

  useFrame((_, delta) => {
    // Rotate distant stars
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.015;
    }

    // Drifting gold dust
    if (goldDustRef.current) {
      goldDustRef.current.rotation.y += delta * 0.025;
      const positions = goldDustRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < dustCount; i++) {
        positions[i * 3 + 1] += delta * 0.15;
        if (positions[i * 3 + 1] > 8) {
          positions[i * 3 + 1] = -1;
        }
      }
      goldDustRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Nebula slow rotation
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y -= delta * 0.008;
    }

    // Shooting star logic
    const ss = shootingStarState.current;
    ss.timer += delta;
    if (!ss.active && ss.timer > 4 + Math.random() * 4) {
      ss.active = true;
      ss.timer = 0;
      ss.pos.set(
        (Math.random() - 0.5) * 25,
        10 + Math.random() * 5,
        -15 - Math.random() * 10
      );
      ss.vel.set(
        (Math.random() > 0.5 ? 1 : -1) * (18 + Math.random() * 10),
        -(10 + Math.random() * 6),
        8 + Math.random() * 5
      );
      if (shootingStarRef.current) {
        shootingStarRef.current.visible = true;
        shootingStarRef.current.position.copy(ss.pos);
      }
    }

    if (ss.active && shootingStarRef.current) {
      ss.pos.addScaledVector(ss.vel, delta);
      shootingStarRef.current.position.copy(ss.pos);
      if (ss.pos.y < -5 || ss.pos.length() > 60) {
        ss.active = false;
        shootingStarRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Distant Stars */}
      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[starPositions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[starColors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* Floating Gold Dust */}
      <points ref={goldDustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[dustPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d4af37"
          size={0.12}
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Shooting Star */}
      <mesh ref={shootingStarRef} visible={false}>
        <cylinderGeometry args={[0.03, 0.005, 1.8, 6]} />
        <meshBasicMaterial color="#fffbeb" transparent opacity={0.9} />
      </mesh>

      {/* Deep Space Nebula Clouds (Layered transparent spheres) */}
      <group ref={nebulaRef}>
        <mesh position={[0, -2, -18]} scale={[25, 14, 18]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={theme === 'neon_cyber' ? '#1e1b4b' : theme === 'ivory_palace' ? '#181824' : '#1e1035'}
            transparent
            opacity={0.3}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh position={[12, 4, -12]} scale={[16, 12, 14]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={theme === 'neon_cyber' ? '#0f766e' : '#4a154b'}
            transparent
            opacity={0.2}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh position={[-14, 2, -14]} scale={[18, 14, 16]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial
            color={theme === 'neon_cyber' ? '#0369a1' : '#1e293b'}
            transparent
            opacity={0.25}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </group>
  );
};
