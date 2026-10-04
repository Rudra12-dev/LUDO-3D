import React, { useMemo } from 'react';
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
import { PlayerColor } from '../../types/game';

interface ClassicLudoBoard3DProps {
  activeColor?: PlayerColor;
}

// Authentic Ludo King Colors matching table.jpg
const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#dc2626', // Vibrant Red
  green: '#16a34a', // Vivid Green
  yellow: '#eab308', // Radiant Golden Yellow
  blue: '#0284c7', // Sky / Deep Blue
};

// 5-Pointed Star Shape Generator for Three.js
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

export const ClassicLudoBoard3D: React.FC<ClassicLudoBoard3DProps> = ({
  activeColor = 'blue',
}) => {
  const starShape = useMemo(() => createStarShape(0.24, 0.11, 5), []);
  const starGeom = useMemo(() => new THREE.ShapeGeometry(starShape), [starShape]);

  const totalBoardSize = BOARD_DIM * TILE_SIZE; // 12.0 units
  const frameThickness = 0.45;
  const outerSize = totalBoardSize + frameThickness * 2; // ~12.9 units

  return (
    <group position={[0, 0, 0]}>
      {/* Outer Board Frame / Bevel (Dark border from photo) */}
      <mesh position={[0, -0.16, 0]}>
        <boxGeometry args={[outerSize, 0.32, outerSize]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Main Board Base Plate (Pure White surface where track is laid) */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[totalBoardSize, 0.04, totalBoardSize]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* 4 Quadrants (Yards) Exactly matching table.jpg:
          - Top-Left: Red (cols 0..5, rows 0..5)
          - Top-Right: Green (cols 9..14, rows 0..5)
          - Bottom-Left: Blue (cols 0..5, rows 9..14)
          - Bottom-Right: Yellow (cols 9..14, rows 9..14)
      */}
      {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
        const yardCenters: Record<PlayerColor, { col: number; row: number }> = {
          red: { col: 2.5, row: 2.5 },
          green: { col: 11.5, row: 2.5 },
          yellow: { col: 11.5, row: 11.5 },
          blue: { col: 2.5, row: 11.5 },
        };
        const c = yardCenters[color];
        const worldPos = gridToWorld(c.col, c.row, 0.035);
        const yardSize = 6 * TILE_SIZE; // 4.8 units

        return (
          <group key={color} position={[worldPos.x, worldPos.y, worldPos.z]}>
            {/* Colored Outer Square of the Yard */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[yardSize, 0.03, yardSize]} />
              <meshStandardMaterial
                color={COLOR_MAP[color]}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>

            {/* Inner Crisp White Square (as seen in photo) */}
            <mesh position={[0, 0.018, 0]}>
              <boxGeometry args={[yardSize * 0.72, 0.02, yardSize * 0.72]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.2}
                metalness={0.05}
              />
            </mesh>

            {/* 4 Colored Circles inside the White Square for token slots */}
            {YARD_SLOTS[color].map((slot, sIdx) => {
              const pSlot = gridToWorld(slot.col, slot.row, 0.032);
              return (
                <group
                  key={sIdx}
                  position={[pSlot.x - worldPos.x, 0.03, pSlot.z - worldPos.z]}
                >
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.35, 32]} />
                    <meshStandardMaterial
                      color={COLOR_MAP[color]}
                      roughness={0.3}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        );
      })}

      {/* 52 Common Track Tiles */}
      {COMMON_TRACK_TILES.map((tile, idx) => {
        const pos = gridToWorld(tile.col, tile.row, 0.04);
        const isSafe = SAFE_TRACK_INDICES.has(idx);

        // Check if start tile
        let startColor: PlayerColor | null = null;
        if (idx === START_INDICES.red) startColor = 'red';
        if (idx === START_INDICES.green) startColor = 'green';
        if (idx === START_INDICES.yellow) startColor = 'yellow';
        if (idx === START_INDICES.blue) startColor = 'blue';

        return (
          <group key={`track-${idx}`} position={[pos.x, pos.y, pos.z]}>
            {/* White/Colored Tile Plate */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[TILE_SIZE * 0.96, 0.02, TILE_SIZE * 0.96]} />
              <meshStandardMaterial
                color={startColor ? COLOR_MAP[startColor] : '#ffffff'}
                roughness={0.25}
                metalness={0.05}
              />
            </mesh>

            {/* Dark Outline Grid Wireframe */}
            <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[TILE_SIZE * 0.94, TILE_SIZE * 0.94]} />
              <meshBasicMaterial
                color="#94a3b8"
                wireframe
              />
            </mesh>

            {/* Outlined 5-Pointed Star on Safe Tiles (exactly like table.jpg) */}
            {isSafe && (
              <mesh
                geometry={starGeom}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0.016, 0]}
              >
                <meshBasicMaterial
                  color={startColor ? '#ffffff' : '#64748b'}
                  wireframe={!startColor}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 4 Colored Home Stretches (6 steps each leading into center) */}
      {(['red', 'green', 'yellow', 'blue'] as PlayerColor[]).map((color) => {
        const tiles = HOME_STRETCH_TILES[color].slice(0, 6);
        return tiles.map((tile, sIdx) => {
          const pos = gridToWorld(tile.col, tile.row, 0.042);
          return (
            <group key={`home-${color}-${sIdx}`} position={[pos.x, pos.y, pos.z]}>
              <mesh>
                <boxGeometry args={[TILE_SIZE * 0.96, 0.02, TILE_SIZE * 0.96]} />
                <meshStandardMaterial
                  color={COLOR_MAP[color]}
                  roughness={0.25}
                  metalness={0.1}
                />
              </mesh>
              {/* Subtle grid border */}
              <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[TILE_SIZE * 0.94, TILE_SIZE * 0.94]} />
                <meshBasicMaterial color="#ffffff" wireframe />
              </mesh>
            </group>
          );
        });
      })}

      {/* Center Home: 4 Colored Triangular Wedges matching table.jpg */}
      <group position={[0, 0.045, 0]}>
        {/* Base center white square underneath */}
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[3 * TILE_SIZE, 0.02, 3 * TILE_SIZE]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>

        {/* Red Triangle (Left) */}
        <mesh
          position={[-TILE_SIZE * 0.5, 0, 0]}
          rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        >
          <coneGeometry args={[1.5 * TILE_SIZE, 1.5 * TILE_SIZE, 3]} />
          <meshStandardMaterial color={COLOR_MAP.red} roughness={0.25} />
        </mesh>

        {/* Green Triangle (Top) */}
        <mesh
          position={[0, 0, -TILE_SIZE * 0.5]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
        >
          <coneGeometry args={[1.5 * TILE_SIZE, 1.5 * TILE_SIZE, 3]} />
          <meshStandardMaterial color={COLOR_MAP.green} roughness={0.25} />
        </mesh>

        {/* Yellow Triangle (Right) */}
        <mesh
          position={[TILE_SIZE * 0.5, 0, 0]}
          rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        >
          <coneGeometry args={[1.5 * TILE_SIZE, 1.5 * TILE_SIZE, 3]} />
          <meshStandardMaterial color={COLOR_MAP.yellow} roughness={0.25} />
        </mesh>

        {/* Blue Triangle (Bottom) */}
        <mesh
          position={[0, 0, TILE_SIZE * 0.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[1.5 * TILE_SIZE, 1.5 * TILE_SIZE, 3]} />
          <meshStandardMaterial color={COLOR_MAP.blue} roughness={0.25} />
        </mesh>

        {/* Diagonal Cross Divider Lines */}
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
          <planeGeometry args={[3 * TILE_SIZE * 1.4, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 4]}>
          <planeGeometry args={[3 * TILE_SIZE * 1.4, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
};
