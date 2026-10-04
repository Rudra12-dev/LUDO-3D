import { PlayerColor } from '../types/game';

export interface GridCoord {
  col: number; // 0..14
  row: number; // 0..14
}

export interface Vector3Coord {
  x: number;
  y: number;
  z: number;
}

export const TILE_SIZE = 0.8;
export const BOARD_DIM = 15;
export const BOARD_OFFSET = (BOARD_DIM - 1) * TILE_SIZE * 0.5; // ~5.6

export function gridToWorld(col: number, row: number, height: number = 0.15): Vector3Coord {
  return {
    x: col * TILE_SIZE - BOARD_OFFSET,
    y: height,
    z: row * TILE_SIZE - BOARD_OFFSET,
  };
}

/**
 * Common 52 track tiles in clockwise loop
 */
export const COMMON_TRACK_TILES: GridCoord[] = [
  // 0..4 (Red arm going right)
  { col: 1, row: 6 }, // 0: Red Start
  { col: 2, row: 6 }, // 1
  { col: 3, row: 6 }, // 2
  { col: 4, row: 6 }, // 3
  { col: 5, row: 6 }, // 4
  // 5..10 (turning up into top vertical arm)
  { col: 6, row: 5 }, // 5
  { col: 6, row: 4 }, // 6
  { col: 6, row: 3 }, // 7
  { col: 6, row: 2 }, // 8: Safe Star
  { col: 6, row: 1 }, // 9
  { col: 6, row: 0 }, // 10
  // 11..12 (top curve)
  { col: 7, row: 0 }, // 11
  { col: 8, row: 0 }, // 12
  // 13..17 (going down right side of top arm)
  { col: 8, row: 1 }, // 13: Green Start
  { col: 8, row: 2 }, // 14
  { col: 8, row: 3 }, // 15
  { col: 8, row: 4 }, // 16
  { col: 8, row: 5 }, // 17
  // 18..23 (turning right into right arm)
  { col: 9, row: 6 }, // 18
  { col: 10, row: 6 }, // 19
  { col: 11, row: 6 }, // 20
  { col: 12, row: 6 }, // 21: Safe Star
  { col: 13, row: 6 }, // 22
  { col: 14, row: 6 }, // 23
  // 24..25 (right curve)
  { col: 14, row: 7 }, // 24
  { col: 14, row: 8 }, // 25
  // 26..30 (turning left going into right arm bottom)
  { col: 13, row: 8 }, // 26: Yellow Start
  { col: 12, row: 8 }, // 27
  { col: 11, row: 8 }, // 28
  { col: 10, row: 8 }, // 29
  { col: 9, row: 8 }, // 30
  // 31..36 (turning down into bottom arm right side)
  { col: 8, row: 9 }, // 31
  { col: 8, row: 10 }, // 32
  { col: 8, row: 11 }, // 33
  { col: 8, row: 12 }, // 34: Safe Star
  { col: 8, row: 13 }, // 35
  { col: 8, row: 14 }, // 36
  // 37..38 (bottom curve)
  { col: 7, row: 14 }, // 37
  { col: 6, row: 14 }, // 38
  // 39..43 (turning up left side of bottom arm)
  { col: 6, row: 13 }, // 39: Blue Start
  { col: 6, row: 12 }, // 40
  { col: 6, row: 11 }, // 41
  { col: 6, row: 10 }, // 42
  { col: 6, row: 9 }, // 43
  // 44..49 (turning left into left arm bottom)
  { col: 5, row: 8 }, // 44
  { col: 4, row: 8 }, // 45
  { col: 3, row: 8 }, // 46
  { col: 2, row: 8 }, // 47: Safe Star
  { col: 1, row: 8 }, // 48
  { col: 0, row: 8 }, // 49
  // 50..51 (left curve)
  { col: 0, row: 7 }, // 50
  { col: 0, row: 6 }, // 51
];

export const START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

export const SAFE_TRACK_INDICES = new Set<number>([
  0, 8, 13, 21, 26, 34, 39, 47
]);

export const HOME_STRETCH_TILES: Record<PlayerColor, GridCoord[]> = {
  red: [
    { col: 1, row: 7 },
    { col: 2, row: 7 },
    { col: 3, row: 7 },
    { col: 4, row: 7 },
    { col: 5, row: 7 },
    { col: 6, row: 7 },
    { col: 7, row: 7 }, // Final Core
  ],
  green: [
    { col: 7, row: 1 },
    { col: 7, row: 2 },
    { col: 7, row: 3 },
    { col: 7, row: 4 },
    { col: 7, row: 5 },
    { col: 7, row: 6 },
    { col: 7, row: 7 }, // Final Core
  ],
  yellow: [
    { col: 13, row: 7 },
    { col: 12, row: 7 },
    { col: 11, row: 7 },
    { col: 10, row: 7 },
    { col: 9, row: 7 },
    { col: 8, row: 7 },
    { col: 7, row: 7 }, // Final Core
  ],
  blue: [
    { col: 7, row: 13 },
    { col: 7, row: 12 },
    { col: 7, row: 11 },
    { col: 7, row: 10 },
    { col: 7, row: 9 },
    { col: 7, row: 8 },
    { col: 7, row: 7 }, // Final Core
  ],
};

/**
 * 4 Base Yard Slots for each color
 */
export const YARD_SLOTS: Record<PlayerColor, GridCoord[]> = {
  red: [
    { col: 1.8, row: 1.8 },
    { col: 3.2, row: 1.8 },
    { col: 1.8, row: 3.2 },
    { col: 3.2, row: 3.2 },
  ],
  green: [
    { col: 10.8, row: 1.8 },
    { col: 12.2, row: 1.8 },
    { col: 10.8, row: 3.2 },
    { col: 12.2, row: 3.2 },
  ],
  yellow: [
    { col: 10.8, row: 10.8 },
    { col: 12.2, row: 10.8 },
    { col: 10.8, row: 12.2 },
    { col: 12.2, row: 12.2 },
  ],
  blue: [
    { col: 1.8, row: 10.8 },
    { col: 3.2, row: 10.8 },
    { col: 1.8, row: 12.2 },
    { col: 3.2, row: 12.2 },
  ],
};

/**
 * Convert player step (-1 to 57) to world position in 3D
 */
export function getTokenWorldPosition(
  color: PlayerColor,
  tokenIndex: number,
  step: number,
  stackOffset: number = 0
): Vector3Coord {
  // Yard
  if (step === -1) {
    const slot = YARD_SLOTS[color][tokenIndex] || { col: 2, row: 2 };
    return gridToWorld(slot.col, slot.row, 0.2);
  }

  // Home stretch (steps 51 to 57)
  if (step >= 51) {
    const stretchIndex = Math.min(step - 51, 6);
    const tile = HOME_STRETCH_TILES[color][stretchIndex];
    const pos = gridToWorld(tile.col, tile.row, 0.2 + (stretchIndex === 6 ? 0.15 : 0.05));
    // If in center core, offset slightly by color quadrant
    if (stretchIndex === 6) {
      const quadOffsets: Record<PlayerColor, [number, number]> = {
        red: [-0.15, -0.15],
        green: [0.15, -0.15],
        yellow: [0.15, 0.15],
        blue: [-0.15, 0.15],
      };
      const [qx, qz] = quadOffsets[color];
      return { x: pos.x + qx, y: pos.y, z: pos.z + qz };
    }
    return pos;
  }

  // Common track (step 0 to 50)
  const trackIndex = (START_INDICES[color] + step) % 52;
  const tile = COMMON_TRACK_TILES[trackIndex];
  const pos = gridToWorld(tile.col, tile.row, 0.2);

  // Stack offset if multiple tokens share tile
  if (stackOffset !== 0) {
    const angle = stackOffset * ((Math.PI * 2) / 3);
    const radius = 0.16;
    return {
      x: pos.x + Math.cos(angle) * radius,
      y: pos.y,
      z: pos.z + Math.sin(angle) * radius,
    };
  }

  return pos;
}

/**
 * Get the global track index for a token on the common track (0..50).
 * Returns -1 if in yard or home stretch.
 */
export function getGlobalTrackIndex(color: PlayerColor, step: number): number {
  if (step < 0 || step > 50) return -1;
  return (START_INDICES[color] + step) % 52;
}
