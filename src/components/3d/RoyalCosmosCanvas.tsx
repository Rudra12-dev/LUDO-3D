import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CosmicAtmosphere } from './CosmicAtmosphere';
import { LudoBoard3D } from './LudoBoard3D';
import { LudoToken3D } from './LudoToken3D';
import { Dice3D } from './Dice3D';
import { Podium3D } from './Podium3D';
import {
  PlayerState,
  PlayerColor,
  BoardTheme,
  DiceStyle,
  MoveValidation,
} from '../../types/game';

interface RoyalCosmosCanvasProps {
  mode: 'login' | 'lobby' | 'game' | 'victory';
  theme: BoardTheme;
  diceStyle: DiceStyle;
  players?: PlayerState[];
  activePlayerIndex?: number;
  currentDiceRoll?: number | null;
  isRollingDice?: boolean;
  canRollDice?: boolean;
  onRollDice?: () => void;
  validMoves?: MoveValidation[];
  onSelectToken?: (tokenIndex: number) => void;
  isTopDownView?: boolean;
  lowPowerMode?: boolean;
  winnerColor?: PlayerColor;
  rankedPlayers?: PlayerState[];
}

// Camera Controller for smooth lerping between top-down 2D and 3D angled
const CameraController: React.FC<{
  mode: string;
  isTopDown: boolean;
}> = ({ mode, isTopDown }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame((_, delta) => {
    let targetPos = new THREE.Vector3(0, 14, 11);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (mode === 'login' || mode === 'lobby') {
      // Cinematic angled perspective
      targetPos = new THREE.Vector3(0, 12, 13);
      targetLook = new THREE.Vector3(0, -0.5, 0);
    } else if (mode === 'victory') {
      targetPos = new THREE.Vector3(0, 5, 8.5);
      targetLook = new THREE.Vector3(0, 1.8, 0);
    } else if (isTopDown) {
      targetPos = new THREE.Vector3(0, 18.5, 0.01);
      targetLook = new THREE.Vector3(0, 0, 0);
    } else {
      // Default 3D game view
      targetPos = new THREE.Vector3(0, 13.5, 10.5);
      targetLook = new THREE.Vector3(0, 0, 0.5);
    }

    camera.position.lerp(targetPos, delta * 3.5);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, delta * 3.5);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={6}
      maxDistance={24}
      maxPolarAngle={mode === 'victory' ? Math.PI / 2 : Math.PI / 2.3}
      minPolarAngle={0.05}
      rotateSpeed={0.6}
    />
  );
};

// Scene Rotator for Login and Lobby screens (gives majestic rotating floating board preview)
const SceneRotator: React.FC<{ children: React.ReactNode; isRotating: boolean }> = ({
  children,
  isRotating,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (isRotating && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });
  return <group ref={groupRef}>{children}</group>;
};

export const RoyalCosmosCanvas: React.FC<RoyalCosmosCanvasProps> = ({
  mode,
  theme,
  diceStyle,
  players = [],
  activePlayerIndex = 0,
  currentDiceRoll = null,
  isRollingDice = false,
  canRollDice = false,
  onRollDice,
  validMoves = [],
  onSelectToken,
  isTopDownView = false,
  lowPowerMode = false,
  winnerColor = 'red',
  rankedPlayers = [],
}) => {
  const activePlayer = players[activePlayerIndex];
  const activeColor = activePlayer ? activePlayer.color : 'red';

  return (
    <div className="w-full h-full relative overflow-hidden select-none touch-none">
      <Canvas
        camera={{ position: [0, 13.5, 11], fov: 45, near: 0.1, far: 100 }}
        dpr={lowPowerMode ? 1 : [1, 2]}
        gl={{
          antialias: !lowPowerMode,
          powerPreference: 'high-performance',
          alpha: false,
        }}
      >
        {/* Deep Cosmic Background */}
        <color attach="background" args={['#04050a']} />

        {/* Studio & Cosmic Lighting */}
        <ambientLight intensity={0.45} color="#93c5fd" />
        <directionalLight
          position={[8, 18, 10]}
          intensity={1.2}
          color="#fffbeb"
          castShadow={!lowPowerMode}
        />
        <pointLight position={[-10, 8, -8]} intensity={0.8} color="#d4af37" />
        <pointLight position={[10, 6, 10]} intensity={0.6} color="#38bdf8" />

        {/* Space Atmosphere: Nebulas, Stars, Gold Dust */}
        <CosmicAtmosphere theme={theme} lowPowerMode={lowPowerMode} />

        {/* Dynamic Camera Control */}
        <CameraController mode={mode} isTopDown={isTopDownView} />

        {mode === 'victory' ? (
          <Podium3D rankedPlayers={rankedPlayers} winnerColor={winnerColor} />
        ) : (
          <SceneRotator isRotating={mode === 'login' || mode === 'lobby'}>
            {/* Ludo Board */}
            <LudoBoard3D theme={theme} activeColor={activeColor} />

            {/* Tokens */}
            {players.map((player, pIdx) => {
              const isPlayerActive = pIdx === activePlayerIndex;

              return player.tokens.map((token, tIdx) => {
                const moveInfo = isPlayerActive
                  ? validMoves.find((m) => m.tokenIndex === tIdx)
                  : undefined;
                const isSelectable = !!(moveInfo && moveInfo.canMove);

                return (
                  <LudoToken3D
                    key={`${player.color}-${tIdx}`}
                    token={token}
                    tokenIndex={tIdx}
                    color={player.color}
                    isSelectable={isSelectable}
                    onSelect={() => onSelectToken && onSelectToken(tIdx)}
                  />
                );
              });
            })}

            {/* 3D Dice in Center of Board */}
            {mode === 'game' && (
              <Dice3D
                value={currentDiceRoll}
                isRolling={isRollingDice}
                canRoll={canRollDice}
                onRoll={() => onRollDice && onRollDice()}
                style={diceStyle}
                activeColor={activeColor}
                position={[0, 0.45, 0]}
              />
            )}
          </SceneRotator>
        )}
      </Canvas>
    </div>
  );
};
