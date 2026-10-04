/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  UserProfile,
  GameSettings,
  PlayerState,
  PlayerSeat,
  GamePhase,
  MoveValidation,
  PlayerColor,
  Language,
} from './types/game';
import {
  loadUserProfile,
  saveUserProfile,
  loadGameSettings,
  saveGameSettings,
  loadActiveMatch,
  saveActiveMatch,
  recordMatchStats,
} from './engine/storage';
import { soundManager } from './audio/soundManager';
import {
  getValidMoves,
  selectBotMove,
  checkWinner,
  FINAL_HOME_STEP,
} from './engine/ludoRules';

// 3D Canvas & Backdrops
import { LudoGameCanvas } from './components/3d/LudoGameCanvas';
import { ClassicBlueBackdrop } from './components/ui/ClassicBlueBackdrop';
import { LoginDiceBackdrop3D } from './components/3d/LoginDiceBackdrop3D';
import { LobbyBackdrop } from './components/ui/LobbyBackdrop';

// UI Screens & Modals
import { LoginScreen } from './components/ui/LoginScreen';
import { LobbyScreen } from './components/ui/LobbyScreen';
import { GameHUD } from './components/ui/GameHUD';
import { VictoryScreen } from './components/ui/VictoryScreen';
import { PauseModal } from './components/ui/PauseModal';
import { RulesModal } from './components/ui/RulesModal';

export default function App() {
  // Navigation Screens: 'login' | 'lobby' | 'game' | 'victory'
  const [screen, setScreen] = useState<'login' | 'lobby' | 'game' | 'victory'>('login');

  // User Profile & Settings
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [settings, setSettings] = useState<GameSettings>(() => loadGameSettings());

  // In-Game State
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [phase, setPhase] = useState<GamePhase>('WAITING_FOR_ROLL');
  const [currentDiceRoll, setCurrentDiceRoll] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<MoveValidation[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTopDownView, setIsTopDownView] = useState(true);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState<number>(15);

  // Quick play directly launches the match matching table.jpg
  const handleQuickPlay = useCallback((profile?: UserProfile) => {
    const prof = profile || userProfile;
    saveUserProfile(prof);
    setUserProfile(prof);

    // Default 4 seats matching table.jpg:
    // Bottom-Left: Blue (Player 1 - Human User)
    // Top-Left: Red (Player 2 - Bot)
    // Top-Right: Green (Player 3 - Bot)
    // Bottom-Right: Yellow (Player 4 - Bot)
    const defaultSeats: PlayerSeat[] = [
      {
        id: 'p0',
        name: prof.username || 'Player 1',
        color: 'blue',
        isBot: false,
        botDifficulty: 'medium',
        avatar: prof.avatar || '👑',
        isActive: true,
      },
      {
        id: 'p1',
        name: 'Player 2',
        color: 'red',
        isBot: true,
        botDifficulty: 'medium',
        avatar: '🦁',
        isActive: true,
      },
      {
        id: 'p2',
        name: 'Player 3',
        color: 'green',
        isBot: true,
        botDifficulty: 'hard',
        avatar: '💎',
        isActive: true,
      },
      {
        id: 'p3',
        name: 'Player 4',
        color: 'yellow',
        isBot: true,
        botDifficulty: 'medium',
        avatar: '🦅',
        isActive: true,
      },
    ];

    handleStartGame(defaultSeats);
  }, [userProfile]);

  // Victory State
  const [winnerPlayer, setWinnerPlayer] = useState<PlayerState | undefined>(undefined);
  const [winningTeam, setWinningTeam] = useState<'A' | 'B' | undefined>(undefined);
  const [matchCaptures, setMatchCaptures] = useState<number>(0);

  // Modals
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Initialize sound preferences
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setMusicEnabled(settings.musicEnabled);
  }, [settings.soundEnabled, settings.musicEnabled]);

  // Toast status message helper
  const showToast = useCallback((msg: string, duration: number = 2200) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // --- Auth Handlers ---
  const handleLoginSuccess = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setScreen('lobby');
  };

  const handleLogout = () => {
    soundManager.playClick();
    setScreen('login');
  };

  const handleToggleLanguage = () => {
    soundManager.playClick();
    const newLang: Language = settings.language === 'en' ? 'hi' : 'en';
    const updated: GameSettings = { ...settings, language: newLang };
    setSettings(updated);
    saveGameSettings(updated);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    saveGameSettings(newSettings);
  };

  // --- Starting a Match from Lobby ---
  const handleStartGame = (seats: PlayerSeat[]) => {
    const initializedPlayers: PlayerState[] = seats.map((seat) => ({
      id: seat.id,
      name: seat.name,
      color: seat.color,
      isBot: seat.isBot,
      botDifficulty: seat.botDifficulty,
      avatar: seat.avatar,
      team: seat.team,
      consecutiveSixes: 0,
      tokens: [
        { id: 0, color: seat.color, step: -1, isHome: false, inYard: true },
        { id: 1, color: seat.color, step: -1, isHome: false, inYard: true },
        { id: 2, color: seat.color, step: -1, isHome: false, inYard: true },
        { id: 3, color: seat.color, step: -1, isHome: false, inYard: true },
      ],
    }));

    setPlayers(initializedPlayers);
    setActivePlayerIndex(0);
    setPhase('WAITING_FOR_ROLL');
    setCurrentDiceRoll(null);
    setValidMoves([]);
    setMatchCaptures(0);
    setWinnerPlayer(undefined);
    setWinningTeam(undefined);
    setTurnTimeRemaining(settings.turnTimerSeconds || 15);
    setScreen('game');

    showToast(`${initializedPlayers[0].name}'s Turn to Roll!`);
  };

  // --- Advance to Next Turn ---
  const advanceTurn = useCallback(
    (bonusTurn: boolean = false) => {
      setPlayers((currentPlayers) => {
        // Check game over
        const winResult = checkWinner(currentPlayers, settings);
        if (winResult.isGameOver) {
          setPhase('GAME_OVER');
          setWinnerPlayer(winResult.winnerPlayer);
          setWinningTeam(winResult.winningTeam);
          setScreen('victory');
          const isHumanWinner =
            winResult.winnerPlayer && !winResult.winnerPlayer.isBot;
          recordMatchStats(!!isHumanWinner, matchCaptures, 4);
          return currentPlayers;
        }

        let nextIdx = activePlayerIndex;
        if (!bonusTurn) {
          nextIdx = (activePlayerIndex + 1) % currentPlayers.length;
          // Reset consecutive sixes on normal turn pass
          currentPlayers[activePlayerIndex].consecutiveSixes = 0;
        }

        setActivePlayerIndex(nextIdx);
        setPhase('WAITING_FOR_ROLL');
        setCurrentDiceRoll(null);
        setValidMoves([]);
        setTurnTimeRemaining(settings.turnTimerSeconds || 15);

        const nextPlayer = currentPlayers[nextIdx];
        if (bonusTurn) {
          showToast(
            settings.language === 'hi'
              ? `${nextPlayer.name}: अतिरिक्त बारी! पासा फेंकें 🎲`
              : `${nextPlayer.name}: Bonus Roll! Tap to roll 🎲`,
            3000
          );
        } else {
          showToast(
            settings.language === 'hi'
              ? `${nextPlayer.name}: आपकी बारी है! (It's your turn) पासा फेंकें 🎲`
              : `${nextPlayer.name}: It's your turn! Tap to roll dice 🎲`,
            3500
          );
        }

        return [...currentPlayers];
      });
    },
    [activePlayerIndex, settings, matchCaptures, showToast]
  );

  // --- Token Move Execution ---
  const executeTokenMove = useCallback(
    (tokenIndex: number) => {
      const activePlayer = players[activePlayerIndex];
      if (!activePlayer || !currentDiceRoll) return;

      const move = validMoves.find((m) => m.tokenIndex === tokenIndex);
      if (!move || !move.canMove) return;

      setPhase('ANIMATING_MOVE');
      soundManager.playTokenHop(tokenIndex);

      const targetStep = move.targetStep;
      let bonusTurn = currentDiceRoll === 6;
      let captureOccurred = false;

      // Update Player Tokens
      setPlayers((prevPlayers) => {
        const updated = [...prevPlayers];
        const p = { ...updated[activePlayerIndex] };
        const tokens = [...p.tokens];
        const prevStep = tokens[tokenIndex].step;

        tokens[tokenIndex] = {
          ...tokens[tokenIndex],
          step: targetStep,
          inYard: targetStep === -1,
          isHome: targetStep >= FINAL_HOME_STEP,
        };
        p.tokens = tokens;
        updated[activePlayerIndex] = p;

        // Check Home reached bonus
        if (targetStep >= FINAL_HOME_STEP && prevStep < FINAL_HOME_STEP) {
          soundManager.playTokenHome();
          bonusTurn = true;
          showToast(`${p.name} brought a token home! Bonus turn! 🌟`);
        }

        // Check Captures on opponent
        if (move.capturesOpponent) {
          const cap = move.capturesOpponent;
          soundManager.playCapture();
          setMatchCaptures((c) => c + 1);
          captureOccurred = true;
          bonusTurn = true;

          const victimPlayer = { ...updated[cap.playerIndex] };
          const victimTokens = [...victimPlayer.tokens];
          victimTokens[cap.tokenIndex] = {
            ...victimTokens[cap.tokenIndex],
            step: -1,
            inYard: true,
          };
          victimPlayer.tokens = victimTokens;
          updated[cap.playerIndex] = victimPlayer;

          showToast(`${p.name} captured ${victimPlayer.name}! Extra turn! ⚔️`);
        }

        return updated;
      });

      // Pause briefly for hop visual settling, then advance turn
      setTimeout(() => {
        advanceTurn(bonusTurn);
      }, 550);
    },
    [players, activePlayerIndex, currentDiceRoll, validMoves, advanceTurn, showToast]
  );

  // --- Roll Dice Logic ---
  const handleRollDice = useCallback(() => {
    if (phase !== 'WAITING_FOR_ROLL') return;

    setPhase('ROLLING_DICE');
    const roll = Math.floor(Math.random() * 6) + 1;
    setCurrentDiceRoll(roll);

    // After roll tumble settles (~850ms)
    setTimeout(() => {
      const activePlayer = players[activePlayerIndex];
      let newConsecutive = activePlayer.consecutiveSixes;

      if (roll === 6) {
        newConsecutive += 1;
        activePlayer.consecutiveSixes = newConsecutive;
      } else {
        activePlayer.consecutiveSixes = 0;
      }

      // Three consecutive 6s rule!
      if (newConsecutive >= 3) {
        showToast('Three 6s in a row! Turn forfeited. ⚠️');
        soundManager.playClick();
        setTimeout(() => advanceTurn(false), 900);
        return;
      }

      // Calculate valid moves
      const moves = getValidMoves(players, activePlayerIndex, roll, settings);
      setValidMoves(moves);
      const movableMoves = moves.filter((m) => m.canMove);

      if (movableMoves.length === 0) {
        setPhase('WAITING_FOR_TOKEN_SELECT');
        showToast(
          roll === 6
            ? 'No valid moves available'
            : `Rolled ${roll}. Need 6 to deploy from sanctuary.`,
          1600
        );
        setTimeout(() => advanceTurn(false), 1200);
      } else {
        setPhase('WAITING_FOR_TOKEN_SELECT');
      }
    }, 850);
  }, [phase, players, activePlayerIndex, settings, advanceTurn, showToast]);

  // --- AI Bot Automation Loop (Only moves token AFTER player rolls) ---
  useEffect(() => {
    if (screen !== 'game') return;
    const activePlayer = players[activePlayerIndex];
    if (!activePlayer || !activePlayer.isBot) return;

    // NEVER auto-roll! Wait until player triggers the roll!

    // If bot has already rolled and is waiting to pick a move:
    if (phase === 'WAITING_FOR_TOKEN_SELECT' && validMoves.length > 0) {
      const timer = setTimeout(() => {
        const chosenTokenIdx = selectBotMove(
          validMoves,
          activePlayer.botDifficulty,
          players,
          activePlayerIndex
        );
        if (chosenTokenIdx !== null) {
          executeTokenMove(chosenTokenIdx);
        }
      }, 700 + Math.random() * 300);
      return () => clearTimeout(timer);
    }
  }, [
    screen,
    phase,
    activePlayerIndex,
    players,
    validMoves,
    executeTokenMove,
  ]);

  // --- Turn Timer Countdown (Reminder only, no auto-roll) ---
  useEffect(() => {
    if (
      screen !== 'game' ||
      settings.turnTimerSeconds === 0 ||
      isPauseOpen ||
      isRulesOpen ||
      phase === 'GAME_OVER'
    ) {
      return;
    }

    const interval = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          return settings.turnTimerSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [
    screen,
    settings.turnTimerSeconds,
    isPauseOpen,
    isRulesOpen,
    phase,
  ]);

  // --- Keyboard Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'game' || isPauseOpen || isRulesOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'WAITING_FOR_ROLL') {
          handleRollDice();
        }
      } else if (e.key === 'c' || e.key === 'C') {
        setIsTopDownView((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        const newSound = !settings.soundEnabled;
        soundManager.setSoundEnabled(newSound);
        setSettings((s) => ({ ...s, soundEnabled: newSound }));
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        setIsPauseOpen((prev) => !prev);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const tokenIdx = parseInt(e.key, 10) - 1;
        const move = validMoves.find((m) => m.tokenIndex === tokenIdx);
        if (move && move.canMove && phase === 'WAITING_FOR_TOKEN_SELECT') {
          executeTokenMove(tokenIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    screen,
    isPauseOpen,
    isRulesOpen,
    phase,
    players,
    activePlayerIndex,
    validMoves,
    settings.soundEnabled,
    handleRollDice,
    executeTokenMove,
  ]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#04050a] text-white relative">
      {/* 
        Background Layer:
        - Screen 1 (Login): User requested glowing cyber dice photo -> LoginDiceBackdrop3D!
        - Screen 2 (Lobby): User requested warm nostalgic wooden tabletop photo -> LobbyBackdrop!
        - Screen 3 & 4 (Game & Victory): Royal Blue diagonal Ludo pattern matching table.jpg!
      */}
      {screen === 'login' ? (
        <LoginDiceBackdrop3D />
      ) : screen === 'lobby' ? (
        <LobbyBackdrop />
      ) : (
        <ClassicBlueBackdrop />
      )}

      {/* 3D Canvas Layer for Game and Victory */}
      {(screen === 'game' || screen === 'victory') && (
        <LudoGameCanvas
          mode={screen}
          players={players}
          activePlayerIndex={activePlayerIndex}
          currentDiceRoll={currentDiceRoll}
          isRollingDice={phase === 'ROLLING_DICE'}
          canRollDice={phase === 'WAITING_FOR_ROLL'}
          onRollDice={handleRollDice}
          validMoves={validMoves}
          onSelectToken={executeTokenMove}
          isTopDownView={isTopDownView}
          lowPowerMode={settings.lowPowerMode}
          winnerColor={winnerPlayer ? winnerPlayer.color : 'blue'}
          rankedPlayers={players}
        />
      )}

      {/* Screen 1: Login */}
      {screen === 'login' && (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onQuickPlay={handleQuickPlay}
          language={settings.language}
          onToggleLanguage={handleToggleLanguage}
        />
      )}

      {/* Screen 2: Lobby */}
      {screen === 'lobby' && (
        <LobbyScreen
          userProfile={userProfile}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onStartGame={handleStartGame}
          onOpenRules={() => setIsRulesOpen(true)}
          onLogout={handleLogout}
          onToggleLanguage={handleToggleLanguage}
        />
      )}

      {/* Screen 3: Game HUD */}
      {screen === 'game' && (
        <GameHUD
          players={players}
          activePlayerIndex={activePlayerIndex}
          phase={phase}
          currentDiceRoll={currentDiceRoll}
          onRollDice={handleRollDice}
          canRollDice={phase === 'WAITING_FOR_ROLL'}
          isTopDownView={isTopDownView}
          onToggleCamera={() => setIsTopDownView(!isTopDownView)}
          onOpenPause={() => setIsPauseOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          settings={settings}
          onToggleSound={() => {
            const next = !settings.soundEnabled;
            soundManager.setSoundEnabled(next);
            setSettings({ ...settings, soundEnabled: next });
          }}
          statusMessage={statusMessage}
          turnTimeRemaining={turnTimeRemaining}
        />
      )}

      {/* Screen 4: Victory Celebration */}
      {screen === 'victory' && (
        <VictoryScreen
          winnerPlayer={winnerPlayer}
          winningTeam={winningTeam}
          players={players}
          settings={settings}
          userProfile={userProfile}
          totalCaptures={matchCaptures}
          onRematch={() => {
            // Rematch with same players
            const resetPlayers = players.map((p) => ({
              ...p,
              consecutiveSixes: 0,
              tokens: [
                { id: 0, color: p.color, step: -1, isHome: false, inYard: true },
                { id: 1, color: p.color, step: -1, isHome: false, inYard: true },
                { id: 2, color: p.color, step: -1, isHome: false, inYard: true },
                { id: 3, color: p.color, step: -1, isHome: false, inYard: true },
              ],
            }));
            setPlayers(resetPlayers);
            setActivePlayerIndex(0);
            setPhase('WAITING_FOR_ROLL');
            setCurrentDiceRoll(null);
            setValidMoves([]);
            setMatchCaptures(0);
            setScreen('game');
          }}
          onReturnToLobby={() => setScreen('lobby')}
        />
      )}

      {/* Pause & Settings Modal */}
      <PauseModal
        isOpen={isPauseOpen}
        onClose={() => setIsPauseOpen(false)}
        onRestart={() => {
          setIsPauseOpen(false);
          if (players.length > 0) {
            handleStartGame(
              players.map((p) => ({
                id: p.id,
                name: p.name,
                color: p.color,
                isBot: p.isBot,
                botDifficulty: p.botDifficulty,
                avatar: p.avatar,
                team: p.team,
                isActive: true,
              }))
            );
          }
        }}
        onQuit={() => {
          setIsPauseOpen(false);
          setScreen('lobby');
        }}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
        language={settings.language}
      />
    </div>
  );
}
