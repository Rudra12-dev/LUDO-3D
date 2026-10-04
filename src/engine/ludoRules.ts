import {
  PlayerColor,
  PlayerState,
  TokenState,
  GameSettings,
  BotDifficulty,
  MoveAction
} from '../types/game';
import {
  SAFE_TRACK_INDICES,
  getGlobalTrackIndex
} from './ludoCoordinates';

export const FINAL_HOME_STEP = 57;

export interface MoveValidation {
  tokenIndex: number;
  canMove: boolean;
  targetStep: number;
  reason?: string;
  isDeploy?: boolean;
  capturesOpponent?: {
    playerIndex: number;
    tokenIndex: number;
    color: PlayerColor;
  };
}

/**
 * Checks all 4 tokens of a player and returns which ones can legally move with the given roll.
 */
export function getValidMoves(
  players: PlayerState[],
  activePlayerIndex: number,
  roll: number,
  settings: GameSettings
): MoveValidation[] {
  const activePlayer = players[activePlayerIndex];
  const results: MoveValidation[] = [];

  activePlayer.tokens.forEach((token, tokenIdx) => {
    // Already home
    if (token.step >= FINAL_HOME_STEP || token.isHome) {
      results.push({
        tokenIndex: tokenIdx,
        canMove: false,
        targetStep: token.step,
        reason: 'Already completed',
      });
      return;
    }

    // In Yard: needs a 6 to deploy
    if (token.step === -1) {
      if (roll === 6) {
        // Check if starting tile is blocked by own stack
        const canDeploy = true;
        results.push({
          tokenIndex: tokenIdx,
          canMove: canDeploy,
          targetStep: 0,
          isDeploy: true,
        });
      } else {
        results.push({
          tokenIndex: tokenIdx,
          canMove: false,
          targetStep: -1,
          reason: 'Need 6 to deploy',
        });
      }
      return;
    }

    // On track or home stretch
    const targetStep = token.step + roll;

    // Must roll exact number to reach home
    if (targetStep > FINAL_HOME_STEP) {
      results.push({
        tokenIndex: tokenIdx,
        canMove: false,
        targetStep,
        reason: 'Overshot home',
      });
      return;
    }

    // Check if landing on common track
    let captureInfo: MoveValidation['capturesOpponent'] | undefined = undefined;

    if (targetStep <= 50) {
      const targetGlobalIndex = getGlobalTrackIndex(activePlayer.color, targetStep);
      const isSafe = SAFE_TRACK_INDICES.has(targetGlobalIndex);

      // Check other players on this global track index
      for (let pIdx = 0; pIdx < players.length; pIdx++) {
        if (pIdx === activePlayerIndex) continue;
        const otherPlayer = players[pIdx];

        // In Team Mode, cannot capture teammate
        if (settings.mode === 'team' && activePlayer.team && activePlayer.team === otherPlayer.team) {
          continue;
        }

        const opponentTokensOnTile = otherPlayer.tokens
          .map((t, idx) => ({ t, idx }))
          .filter(
            ({ t }) =>
              t.step >= 0 &&
              t.step <= 50 &&
              getGlobalTrackIndex(otherPlayer.color, t.step) === targetGlobalIndex
          );

        if (opponentTokensOnTile.length > 0) {
          if (isSafe) {
            // Safe tile: friendly co-existence, no capture
          } else if (settings.allowStacking && opponentTokensOnTile.length >= 2) {
            // Blocked by opponent stack
            results.push({
              tokenIndex: tokenIdx,
              canMove: false,
              targetStep,
              reason: 'Blocked by opponent stack',
            });
            return;
          } else {
            // Capturable!
            captureInfo = {
              playerIndex: pIdx,
              tokenIndex: opponentTokensOnTile[0].idx,
              color: otherPlayer.color,
            };
          }
        }
      }
    }

    results.push({
      tokenIndex: tokenIdx,
      canMove: true,
      targetStep,
      capturesOpponent: captureInfo,
    });
  });

  return results;
}

/**
 * Intelligent AI Bot Move Selector
 */
export function selectBotMove(
  validMoves: MoveValidation[],
  difficulty: BotDifficulty,
  players: PlayerState[],
  activePlayerIndex: number
): number | null {
  const movable = validMoves.filter((m) => m.canMove);
  if (movable.length === 0) return null;
  if (movable.length === 1) return movable[0].tokenIndex;

  const activePlayer = players[activePlayerIndex];

  if (difficulty === 'easy') {
    // Pick randomly among movable
    const chosen = movable[Math.floor(Math.random() * movable.length)];
    return chosen.tokenIndex;
  }

  // Medium Difficulty:
  // 1. Capture if possible
  const captureMove = movable.find((m) => m.capturesOpponent);
  if (captureMove) return captureMove.tokenIndex;

  // 2. Reach home (step 57)
  const homeMove = movable.find((m) => m.targetStep === FINAL_HOME_STEP);
  if (homeMove) return homeMove.tokenIndex;

  // 3. Deploy out of yard if 6
  const deployMove = movable.find((m) => m.isDeploy);
  if (deployMove && Math.random() > 0.3) return deployMove.tokenIndex;

  // 4. Enter safe star
  const safeMove = movable.find((m) => {
    if (m.targetStep <= 50) {
      const gIdx = getGlobalTrackIndex(activePlayer.color, m.targetStep);
      return SAFE_TRACK_INDICES.has(gIdx);
    }
    return m.targetStep > 50; // Home stretch is 100% safe
  });
  if (safeMove && difficulty === 'hard') return safeMove.tokenIndex;

  if (difficulty === 'hard') {
    // Advanced tactical scoring:
    let bestScore = -9999;
    let bestTokenIdx = movable[0].tokenIndex;

    for (const move of movable) {
      let score = 0;
      const currentToken = activePlayer.tokens[move.tokenIndex];

      // Reaching home is huge
      if (move.targetStep === FINAL_HOME_STEP) score += 500;

      // Entering protected home stretch
      if (currentToken.step <= 50 && move.targetStep > 50) score += 150;

      // Capturing opponent
      if (move.capturesOpponent) score += 300;

      // Moving out of yard
      if (move.isDeploy) score += 120;

      // Entering safe tile
      if (move.targetStep <= 50) {
        const gIdx = getGlobalTrackIndex(activePlayer.color, move.targetStep);
        if (SAFE_TRACK_INDICES.has(gIdx)) score += 80;
      }

      // Check danger: is token currently vulnerable to any opponent within 1..6 tiles?
      if (currentToken.step >= 0 && currentToken.step <= 50) {
        const curGIdx = getGlobalTrackIndex(activePlayer.color, currentToken.step);
        if (!SAFE_TRACK_INDICES.has(curGIdx)) {
          // Check threat
          for (let pIdx = 0; pIdx < players.length; pIdx++) {
            if (pIdx === activePlayerIndex) continue;
            for (const oppToken of players[pIdx].tokens) {
              if (oppToken.step >= 0 && oppToken.step <= 50) {
                const oppGIdx = getGlobalTrackIndex(players[pIdx].color, oppToken.step);
                const dist = (curGIdx - oppGIdx + 52) % 52;
                if (dist >= 1 && dist <= 6) {
                  // Danger bonus: moving this token escapes danger!
                  score += 100;
                }
              }
            }
          }
        }
      }

      // Forward progression bias
      score += move.targetStep * 2;

      if (score > bestScore) {
        bestScore = score;
        bestTokenIdx = move.tokenIndex;
      }
    }

    return bestTokenIdx;
  }

  // Medium fallback: advance furthest token
  movable.sort((a, b) => b.targetStep - a.targetStep);
  return movable[0].tokenIndex;
}

/**
 * Checks victory condition
 */
export function checkWinner(
  players: PlayerState[],
  settings: GameSettings
): { winnerPlayer?: PlayerState; winningTeam?: 'A' | 'B'; isGameOver: boolean } {
  if (settings.mode === 'team') {
    const teamATokens = players
      .filter((p) => p.team === 'A')
      .flatMap((p) => p.tokens);
    const teamBTokens = players
      .filter((p) => p.team === 'B')
      .flatMap((p) => p.tokens);

    const teamAWon = teamATokens.every((t) => t.isHome || t.step >= FINAL_HOME_STEP);
    const teamBWon = teamBTokens.every((t) => t.isHome || t.step >= FINAL_HOME_STEP);

    if (teamAWon) return { winningTeam: 'A', isGameOver: true };
    if (teamBWon) return { winningTeam: 'B', isGameOver: true };
  } else {
    for (const player of players) {
      const allHome = player.tokens.every((t) => t.isHome || t.step >= FINAL_HOME_STEP);
      if (allHome) {
        return { winnerPlayer: player, isGameOver: true };
      }
    }
  }

  return { isGameOver: false };
}
