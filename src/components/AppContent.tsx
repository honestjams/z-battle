'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { GameState, Intent, PlayerId } from '@/lib/engine/types';
import { applyIntent, createInitialState } from '@/lib/engine';
import { chooseMove } from '@/lib/engine/ai';
import { recordResult } from '@/lib/localStats';
import GameBoard from '@/components/game/GameBoard';
import SetupScreen, { type GameMode } from '@/components/game/SetupScreen';
import WinScreen from '@/components/game/WinScreen';
import PowerLevelScreen from '@/components/game/PowerLevelScreen';
import ImageCacheModal, { hasImagesCached } from '@/components/ui/ImageCacheModal';
import DeckScoutModal from '@/components/game/DeckScoutModal';

type Screen = 'setup' | 'pass' | 'game' | 'win' | 'power_level';

const AI_PLAYER: PlayerId = 'p2';

export default function AppContent() {
  const [screen, setScreen] = useState<Screen>('setup');

  const [gameState, setGameState] = useState<GameState | null>(null);
  const gameStateRef = useRef<GameState | null>(null);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  const [aiPlayer, setAiPlayer] = useState<PlayerId | null>(null);
  const [, setCurrentGameMode] = useState<GameMode>('hotseat');
  const [winnerState, setWinnerState] = useState<{ winner: PlayerId; deck: string } | null>(null);
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [pendingSetup, setPendingSetup] = useState<{
    p1Deck: string; p2Deck: string; firstPlayer: PlayerId; mode: GameMode;
  } | null>(null);
  const [pendingAiAttack, setPendingAiAttack] = useState<Intent | null>(null);
  const [pendingAiPlay, setPendingAiPlay] = useState<Intent | null>(null);

  // Offer the one-time image pre-cache on first load
  useEffect(() => {
    if (!hasImagesCached()) setShowCacheModal(true);
  }, []);

  // AI turn runner
  const handleIntent = useCallback((intent: Intent) => {
    const gs = gameStateRef.current;
    if (!gs) return;
    if (gs.winner) return;
    const prevTurnPlayer = gs.turnPlayer;
    let newState = applyIntent(gs, intent);

    if (aiPlayer) {
      while (newState.pendingPromotions.length > 0 && newState.pendingPromotions[0].side === aiPlayer) {
        const bench = newState.players[aiPlayer].bench;
        const benchIdx = bench.findIndex(f => f !== null);
        if (benchIdx === -1) break;
        newState = applyIntent(newState, { type: 'promote_from_bench', benchIndex: benchIdx });
      }
    }

    setGameState(newState);

    if (newState.winner) {
      setWinnerState({ winner: newState.winner, deck: newState.players[newState.winner].deck });
      recordResult({
        game_mode: aiPlayer ? 'ai' : 'hotseat',
        deck: newState.players['p1'].deck,
        won: newState.winner === 'p1',
      });
      setScreen('win');
      return;
    }

    if (newState.turnPlayer !== prevTurnPlayer) {
      if (aiPlayer) {
        setScreen('game');
      } else {
        setScreen('pass');
      }
    }
  }, [aiPlayer]);

  useEffect(() => {
    if (!aiPlayer || screen !== 'game' || !gameState) return;
    if (gameState.turnPlayer !== aiPlayer) return;
    if (gameState.winner) return;
    if (pendingAiAttack || pendingAiPlay) return;
    if (gameState.pendingPromotions.length > 0) return;
    const timer = setTimeout(() => {
      const move = chooseMove(gameState, aiPlayer);
      if (move) {
        if (move.type === 'attack') {
          setPendingAiAttack(move);
        } else if (move.type === 'play_item' || move.type === 'play_field') {
          setPendingAiPlay(move);
        } else {
          handleIntent(move);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [aiPlayer, screen, gameState, handleIntent, pendingAiAttack, pendingAiPlay]);

  function handleSetupStart(p1Deck: string, p2Deck: string, firstPlayer: PlayerId, mode: GameMode) {
    setPendingSetup({ p1Deck, p2Deck, firstPlayer, mode });
  }

  function handleScoutDone() {
    if (!pendingSetup) return;
    const { p1Deck, p2Deck, firstPlayer, mode } = pendingSetup;
    const state = createInitialState(p1Deck, p2Deck, firstPlayer);
    setGameState(state);
    setCurrentGameMode(mode);
    const ai = mode === 'vs_ai' ? AI_PLAYER : null;
    setAiPlayer(ai);
    setPendingSetup(null);
    setScreen(ai ? 'game' : 'pass');
  }

  return (
    <main style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100dvh', background: 'var(--bg)' }}>

      {screen === 'power_level' && (
        <PowerLevelScreen onBack={() => setScreen('setup')} />
      )}

      {screen === 'setup' && (
        <SetupScreen
          onStart={handleSetupStart}
          onPowerLevel={() => setScreen('power_level')}
          onCacheImages={() => setShowCacheModal(true)}
        />
      )}

      {(screen === 'game' || screen === 'pass') && gameState && (
        <>
          <GameBoard
            state={gameState}
            onIntent={screen === 'pass' ? () => {} : handleIntent}
            onTurnEnd={() => {}}
            perspective={aiPlayer !== null ? 'p1' : undefined}
            pendingEnemyAttack={pendingAiAttack}
            onEnemyAttackDone={(intent) => {
              setPendingAiAttack(null);
              handleIntent(intent);
            }}
            pendingEnemyPlay={pendingAiPlay}
            onEnemyPlayDone={(intent) => {
              setPendingAiPlay(null);
              handleIntent(intent);
            }}
          />
          {screen === 'pass' && (
            <div style={{
              position: 'fixed', inset: 0, zIndex: 400,
              background: 'rgb(13,15,20)',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 24,
            }}>
              <p style={{ fontFamily: 'Saira Condensed, sans-serif', fontSize: 12, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
                Up next
              </p>
              <h1 style={{
                fontFamily: 'Bangers, sans-serif', fontSize: 42, margin: 0, letterSpacing: 2,
                background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                {gameState.turnPlayer === 'p1' ? 'PLAYER 1' : 'PLAYER 2'}
              </h1>
              <p style={{ fontFamily: 'Saira Condensed, sans-serif', fontSize: 11, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
                Hand the device to the other player
              </p>
              <button onClick={() => setScreen('game')} style={{
                marginTop: 8,
                background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
                border: 'none', borderRadius: 12, padding: '16px 48px', cursor: 'pointer',
                fontFamily: 'Bangers, sans-serif', fontSize: 16, color: '#0d0f14',
                letterSpacing: 2, textTransform: 'uppercase',
                boxShadow: '0 4px 24px rgba(255,122,24,0.5)',
              }}>
                TAP TO REVEAL
              </button>
            </div>
          )}
        </>
      )}

      {screen === 'win' && winnerState && (
        <WinScreen
          winner={winnerState.winner}
          winnerDeck={winnerState.deck}
          onPlayAgain={() => { setGameState(null); setAiPlayer(null); setWinnerState(null); setScreen('setup'); }}
        />
      )}

      {showCacheModal && (
        <ImageCacheModal onClose={() => setShowCacheModal(false)} />
      )}

      {pendingSetup && (
        <DeckScoutModal
          p1Deck={pendingSetup.p1Deck}
          p2Deck={pendingSetup.p2Deck}
          isVsAi={pendingSetup.mode === 'vs_ai'}
          onDone={handleScoutDone}
        />
      )}

    </main>
  );
}
