import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ClassicLudoBoard3D } from './ClassicLudoBoard3D';
import { ClassicLudoToken3D } from './ClassicLudoToken3D';
import { ClassicDice3D } from './ClassicDice3D';
import { Podium3D } from './Podium3D';
import {
  PlayerState,
  PlayerColor,
  MoveValidation,
} from '../../types/game';

interface LudoGameCanvasProps {
  mode: 'game' | 'victory';
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

const CameraManager: React.FC<{
  mode: string;
  isTopDown: boolean;
}> = ({ mode, isTopDown }) => {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  useFrame((_, delta) => {
    let targetPos: THREE.Vector3;
    let targetLook: THREE.Vector3;

    if (mode === 'victory') {
      targetPos = new THREE.Vector3(0, 5, 8.5);
      targetLook = new THREE.Vector3(0, 1.8, 0);
    } else if (isTopDown) {
      // Direct Top-Down view matching table.jpg
      targetPos = new THREE.Vector3(0, 17.5, 0.01);
      targetLook = new THREE.Vector3(0, 0, 0);
    } else {
      // Subtle angled 3D view (30-degree tilt)
      targetPos = new THREE.Vector3(0, 14.5, 6.5);
      targetLook = new THREE.Vector3(0, 0, 0);
    }

    camera.position.lerp(targetPos, delta * 4);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook, delta * 4);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      minDistance={8}
      maxDistance={25}
      maxPolarAngle={mode === 'victory' ? Math.PI / 2 : Math.PI / 2.3}
      minPolarAngle={0.05}
    />
  );
};

export const LudoGameCanvas: React.FC<LudoGameCanvasProps> = ({
  mode,
  players = [],
  activePlayerIndex = 0,
  currentDiceRoll = null,
  isRollingDice = false,
  canRollDice = false,
  onRollDice,
  validMoves = [],
  onSelectToken,
  isTopDownView = true, // Top-down by default as in table.jpg
  lowPowerMode = false,
  winnerColor = 'blue',
  rankedPlayers = [],
}) => {
  const activePlayer = players[activePlayerIndex];
  const activeColor = activePlayer ? activePlayer.color : 'blue';

  return (
    <div className="w-full h-full relative overflow-hidden select-none touch-none">
      <Canvas
        camera={{ position: [0, 17.5, 0.01], fov: 46 }}
        dpr={lowPowerMode ? 1 : [1, 2]}
        gl={{
          antialias: true,
          alpha: true, // Transparent so ClassicBlueBackdrop shines through cleanly!
        }}
      >
        {/* Soft balanced studio lighting for high clarity */}
        <ambientLight intensity={0.9} color="#ffffff" />
        <directionalLight
          position={[5, 20, 8]}
          intensity={1.3}
          color="#ffffff"
          castShadow={!lowPowerMode}
        />
        <directionalLight position={[-8, 15, -6]} intensity={0.6} color="#dbeafe" />

        {/* Camera controller */}
        <CameraManager mode={mode} isTopDown={isTopDownView} />

        {mode === 'victory' ? (
          <Podium3D rankedPlayers={rankedPlayers} winnerColor={winnerColor} />
        ) : (
          <group>
            {/* The Classic Ludo Board from table.jpg */}
            <ClassicLudoBoard3D activeColor={activeColor} />

            {/* Tokens */}
            {players.map((player, pIdx) => {
              const isPlayerActive = pIdx === activePlayerIndex;

              return player.tokens.map((token, tIdx) => {
                const moveInfo = isPlayerActive
                  ? validMoves.find((m) => m.tokenIndex === tIdx)
                  : undefined;
                const isSelectable = !!(moveInfo && moveInfo.canMove);

                return (
                  <ClassicLudoToken3D
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

            {/* Center Dice on Board */}
            <ClassicDice3D
              value={currentDiceRoll}
              isRolling={isRollingDice}
              canRoll={canRollDice}
              onRoll={() => onRollDice && onRollDice()}
              activeColor={activeColor}
              position={[0, 0.35, 0]}
            />
          </group>
        )}
      </Canvas>
    </div>
  );
};
