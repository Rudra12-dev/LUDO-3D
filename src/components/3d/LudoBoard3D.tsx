import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BOARD_DIM,
  TILE_SIZE,
  COMMON_TRACK_TILES,
  SAFE_TRACK_INDICES,
  START_INDICES,
  HOME_STRETCH_TILES,
  YARD_SLOTS,
  gridToWorld,
} from '../../engine/ludoCoordinates';
import { BoardTheme, PlayerColor } from '../../types/game';

interface LudoBoard3DProps {
  theme?: BoardTheme;
  activeColor?: PlayerColor;
}

const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  blue: '#3b82f6',
};

const COLOR_GLOW_MAP: Record<PlayerColor, string> = {
  red: '#ff7171',
  green: '#34d399',
  yellow: '#fbbf24',
  blue: '#60a5fa',
};

export const LudoBoard3D: React.FC<LudoBoard3DProps> = ({
  theme = 'royal_cosmos',
  activeColor = 'red',
}) => {
  const centerMandalaRef = useRef<THREE.Group>(null);
  const boardGlowRef = useRef<THREE.Mesh>(null);

  // Material Palette based on theme
  const palette = useMemo(() => {
    switch (theme) {
      case 'neon_cyber':
        return {
          slab: '#080a14',
          slabEdge: '#06b6d4',
          gridBase: '#0f172a',
          gridBorder: '#1e293b',
          gold: '#38bdf8',
          underGlow: '#06b6d4',
        };
      case 'ivory_palace':
        return {
          slab: '#1e2029',
          slabEdge: '#d4af37',
          gridBase: '#252936',
          gridBorder: '#3b4252',
          gold: '#e6c86e',
          underGlow: '#d4af37',
        };
      case 'royal_cosmos':
      default:
        return {
          slab: '#0a0c16',
          slabEdge: '#d4af37',
          gridBase: '#121626',
          gridBorder: '#232a42',
          gold: '#d4af37',
          underGlow: '#d4af37',
        };
    }
  }, [theme]);

  // Rotate center lotus mandala slowly
  useFrame((_, delta) => {
    if (centerMandalaRef.current) {
      centerMandalaRef.current.rotation.y += delta * 0.35;
    }
    if (boardGlowRef.current) {
      const time = Date.now() * 0.002;
      boardGlowRef.current.scale.set(
        1 + Math.sin(time) * 0.03,
        1,
        1 + Math.sin(time) * 0.03
      );
    }
  });

  const totalBoardSize = BOARD_DIM * TILE_SIZE + 0.8; // ~12.8 units

  return (
    <group position={[0, 0, 0]}>
      {/* Halo glow beneath the floating board */}
      <mesh
        ref={boardGlowRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.4, 0]}
      >
        <planeGeometry args={[totalBoardSize + 2, totalBoardSize + 2]} />
        <meshBasicMaterial
          color={palette.underGlow}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Main Obsidian Slab */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[totalBoardSize, 0.35, totalBoardSize]} />
        <meshStandardMaterial
          color={palette.slab}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Gold Rim Border around the Slab */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[totalBoardSize + 0.08, 0.08, totalBoardSize + 0.08]} />
        <meshStandardMaterial
          color={palette.slabEdge}
          metalness={0.9}
          roughness={0.15}
        />
      </mesh>

      {/* Inner Playing Field Surface */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[totalBoardSize - 0.4, 0.02, totalBoardSize - 0.4]} />
        <meshStandardMaterial
          color={palette.gridBase}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* 4 Corner Sanctuaries (Yards) */}
      {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
        // Yard center coordinates:
        const yardCenters: Record<PlayerColor, { col: number; row: number }> = {
          red: { col: 2.5, row: 2.5 },
          green: { col: 11.5, row: 2.5 },
          yellow: { col: 11.5, row: 11.5 },
          blue: { col: 2.5, row: 11.5 },
        };
        const c = yardCenters[color];
        const worldPos = gridToWorld(c.col, c.row, 0.06);
        const isActive = activeColor === color;

        return (
          <group key={color} position={[worldPos.x, worldPos.y, worldPos.z]}>
            {/* Yard Outer Platform */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[2.0, 2.15, 0.06, 32]} />
              <meshStandardMaterial
                color="#0f1322"
                roughness={0.3}
                metalness={0.6}
              />
            </mesh>

            {/* Yard Gold Filigree Ring */}
            <mesh position={[0, 0.045, 0]}>
              <ringGeometry args={[1.75, 1.95, 32]} />
              <meshStandardMaterial
                color={isActive ? COLOR_GLOW_MAP[color] : palette.gold}
                emissive={isActive ? COLOR_MAP[color] : '#000000'}
                emissiveIntensity={isActive ? 0.4 : 0}
                roughness={0.2}
                metalness={0.9}
              />
            </mesh>

            {/* Inner Gem Color Circle */}
            <mesh position={[0, 0.042, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[1.7, 32]} />
              <meshStandardMaterial
                color={COLOR_MAP[color]}
                transparent
                opacity={0.28}
                roughness={0.2}
              />
            </mesh>

            {/* 4 Token Pedestals in Yard */}
            {YARD_SLOTS[color].map((slot, sIdx) => {
              const pSlot = gridToWorld(slot.col, slot.row, 0.08);
              return (
                <group
                  key={sIdx}
                  position={[pSlot.x - worldPos.x, 0.02, pSlot.z - worldPos.z]}
                >
                  <mesh>
                    <cylinderGeometry args={[0.3, 0.34, 0.04, 16]} />
                    <meshStandardMaterial
                      color="#1a2035"
                      metalness={0.7}
                      roughness={0.3}
                    />
                  </mesh>
                  <mesh position={[0, 0.022, 0]}>
                    <ringGeometry args={[0.18, 0.28, 16]} />
                    <meshBasicMaterial color={COLOR_MAP[color]} />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* 52 Common Track Tiles */}
      {COMMON_TRACK_TILES.map((tile, idx) => {
        const pos = gridToWorld(tile.col, tile.row, 0.06);
        const isSafe = SAFE_TRACK_INDICES.has(idx);

        // Check if it's one of the 4 Start tiles
        let startColor: PlayerColor | null = null;
        if (idx === START_INDICES.red) startColor = 'red';
        if (idx === START_INDICES.green) startColor = 'green';
        if (idx === START_INDICES.yellow) startColor = 'yellow';
        if (idx === START_INDICES.blue) startColor = 'blue';

        return (
          <group key={`track-${idx}`} position={[pos.x, pos.y, pos.z]}>
            {/* Tile Base Plate */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[TILE_SIZE * 0.94, 0.03, TILE_SIZE * 0.94]} />
              <meshStandardMaterial
                color={startColor ? COLOR_MAP[startColor] : palette.gridBase}
                transparent={!!startColor}
                opacity={startColor ? 0.65 : 1}
                metalness={startColor ? 0.5 : 0.3}
                roughness={0.3}
              />
            </mesh>

            {/* Gold Inlaid Border for each tile */}
            <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
              <meshStandardMaterial
                color={startColor ? '#ffffff' : palette.gridBorder}
                roughness={0.5}
                metalness={0.4}
              />
            </mesh>

            {/* Safe Star Motif on Safe Tiles */}
            {isSafe && (
              <group position={[0, 0.025, 0]}>
                {/* 8-pointed gold star (composed of 2 overlapping square diamonds) */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.34, 0.34]} />
                  <meshStandardMaterial
                    color={palette.gold}
                    emissive={palette.gold}
                    emissiveIntensity={0.6}
                    metalness={0.9}
                  />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
                  <planeGeometry args={[0.34, 0.34]} />
                  <meshStandardMaterial
                    color={palette.gold}
                    emissive={palette.gold}
                    emissiveIntensity={0.6}
                    metalness={0.9}
                  />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* 4 Colored Home Stretches (6 steps each leading to center) */}
      {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
        const tiles = HOME_STRETCH_TILES[color].slice(0, 6);
        return tiles.map((tile, sIdx) => {
          const pos = gridToWorld(tile.col, tile.row, 0.065 + sIdx * 0.005);
          return (
            <group key={`home-${color}-${sIdx}`} position={[pos.x, pos.y, pos.z]}>
              <mesh>
                <boxGeometry args={[TILE_SIZE * 0.94, 0.03, TILE_SIZE * 0.94]} />
                <meshStandardMaterial
                  color={COLOR_MAP[color]}
                  emissive={COLOR_MAP[color]}
                  emissiveIntensity={0.25 + sIdx * 0.06}
                  metalness={0.7}
                  roughness={0.2}
                />
              </mesh>
              {/* Gold arrow / chevron motif pointing inward */}
              <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.16, 16]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        });
      })}

      {/* Center Cosmic Singularity & Sacred Lotus Mandala */}
      <group position={[0, 0.07, 0]}>
        {/* Central Square/Circle Dais */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[1.3, 1.4, 0.06, 32]} />
          <meshStandardMaterial
            color="#090b14"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* 4 Colored Quadrant Triangles in Center */}
        <group position={[0, 0.045, 0]}>
          {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((c, i) => {
            const rot = i * (Math.PI / 2);
            return (
              <mesh
                key={c}
                rotation={[-Math.PI / 2, 0, rot]}
                position={[
                  Math.cos(rot + Math.PI / 4) * 0.35,
                  0,
                  Math.sin(rot + Math.PI / 4) * 0.35,
                ]}
              >
                <coneGeometry args={[0.45, 0.65, 3]} />
                <meshStandardMaterial
                  color={COLOR_MAP[c]}
                  emissive={COLOR_MAP[c]}
                  emissiveIntensity={0.5}
                  metalness={0.5}
                  roughness={0.2}
                />
              </mesh>
            );
          })}
        </group>

        {/* Rotating Sacred Lotus Mandala */}
        <group ref={centerMandalaRef} position={[0, 0.07, 0]}>
          {/* Inner Golden Ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.7, 8]} />
            <meshStandardMaterial
              color={palette.gold}
              emissive={palette.gold}
              emissiveIntensity={0.4}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
          {/* Center Singularity Orb */}
          <mesh position={[0, 0.1, 0]}>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshStandardMaterial
              color="#fffbeb"
              emissive={palette.gold}
              emissiveIntensity={0.8}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
