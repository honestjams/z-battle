'use client';

import React, { useState } from 'react';
import type { PlayerId } from '@/lib/engine/types';

export type GameMode = 'hotseat' | 'vs_ai';

interface SetupScreenProps {
  onStart: (p1Deck: string, p2Deck: string, firstPlayer: PlayerId, mode: GameMode) => void;
}

const DECK_OPTIONS = [
  { id: 'saiyan', name: 'Saiyan', color: '#ff7a18' },
  { id: 'namekian', name: 'Namekian', color: '#34c759' },
  { id: 'android', name: 'Android', color: '#3aa6ff' },
  { id: 'human', name: 'Human', color: '#ffb648' },
  { id: 'frieza_force', name: 'Frieza Force', color: '#b44dff' },
];

function DeckPicker({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span
        style={{
          fontFamily: 'Bangers, sans-serif',
          fontSize: 13,
          color: 'var(--muted)',
          letterSpacing: 1,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
      {DECK_OPTIONS.map((deck) => {
        const isSelected = selected === deck.id;
        return (
          <button
            key={deck.id}
            onClick={() => onSelect(deck.id)}
            style={{
              background: isSelected ? `${deck.color}22` : 'rgba(255,255,255,0.04)',
              border: isSelected
                ? `2px solid ${deck.color}`
                : '1.5px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '10px 8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s',
              boxShadow: isSelected ? `0 0 12px ${deck.color}55` : 'none',
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: deck.color,
                flexShrink: 0,
                boxShadow: isSelected ? `0 0 6px ${deck.color}` : 'none',
              }}
            />
            <span
              style={{
                fontFamily: 'Saira Condensed, sans-serif',
                fontSize: 13,
                color: isSelected ? deck.color : 'var(--ink)',
                fontWeight: isSelected ? 700 : 400,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
              }}
            >
              {deck.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [p1Deck, setP1Deck] = useState<string | null>(null);
  const [p2Deck, setP2Deck] = useState<string | null>(null);
  const [firstPlayer, setFirstPlayer] = useState<PlayerId | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('hotseat');

  const canStart = p1Deck !== null && p2Deck !== null && firstPlayer !== null;

  function handleStart() {
    if (!canStart) return;
    onStart(p1Deck!, p2Deck!, firstPlayer!, gameMode);
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 430,
        minHeight: '100dvh',
        margin: '0 auto',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingRight: '16px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        paddingLeft: '16px',
        gap: 24,
        fontFamily: 'Saira, sans-serif',
      }}
    >
      {/* Title */}
      <div style={{ textAlign: 'center', paddingTop: 16 }}>
        <h1
          style={{
            fontFamily: 'Bangers, sans-serif',
            fontSize: 48,
            background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: 2,
          }}
        >
          Z-BATTLE
        </h1>
        <p
          style={{
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 11,
            color: 'var(--muted)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            margin: '4px 0 0',
          }}
        >
          Choose Your Decks
        </p>
      </div>

      {/* Deck pickers */}
      <div style={{ display: 'flex', gap: 12 }}>
        <DeckPicker label="Player 1" selected={p1Deck} onSelect={setP1Deck} />
        <DeckPicker label="Player 2" selected={p2Deck} onSelect={setP2Deck} />
      </div>

      {/* First player selector */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'Bangers, sans-serif',
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Who Goes First?
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['p1', 'p2'] as PlayerId[]).map((pid) => {
            const label = pid === 'p1' ? 'PLAYER 1' : 'PLAYER 2';
            const isSelected = firstPlayer === pid;
            return (
              <button
                key={pid}
                onClick={() => setFirstPlayer(pid)}
                style={{
                  flex: 1,
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--ki), var(--ki2))'
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? '2px solid var(--ki)'
                    : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 8px',
                  cursor: 'pointer',
                  fontFamily: 'Bangers, sans-serif',
                  fontSize: 14,
                  color: isSelected ? '#0d0f14' : 'var(--muted)',
                  letterSpacing: 1,
                  textTransform: 'uppercase' as const,
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 4px 16px rgba(255,122,24,0.4)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Game mode */}
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'Bangers, sans-serif',
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Game Mode
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['hotseat', 'vs_ai'] as GameMode[]).map((mode) => {
            const label = mode === 'hotseat' ? 'HOTSEAT' : 'VS AI';
            const isSelected = gameMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setGameMode(mode)}
                style={{
                  flex: 1,
                  background: isSelected
                    ? 'linear-gradient(135deg, var(--ki), var(--ki2))'
                    : 'rgba(255,255,255,0.04)',
                  border: isSelected
                    ? '2px solid var(--ki)'
                    : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  padding: '12px 8px',
                  cursor: 'pointer',
                  fontFamily: 'Bangers, sans-serif',
                  fontSize: 14,
                  color: isSelected ? '#0d0f14' : 'var(--muted)',
                  letterSpacing: 1,
                  textTransform: 'uppercase' as const,
                  transition: 'all 0.15s',
                  boxShadow: isSelected ? '0 4px 16px rgba(255,122,24,0.4)' : 'none',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          background: canStart
            ? 'linear-gradient(135deg, var(--ki), var(--ki2))'
            : 'rgba(255,255,255,0.06)',
          border: 'none',
          borderRadius: 12,
          padding: '16px',
          cursor: canStart ? 'pointer' : 'not-allowed',
          fontFamily: 'Bangers, sans-serif',
          fontSize: 18,
          color: canStart ? '#0d0f14' : 'var(--muted)',
          letterSpacing: 2,
          textTransform: 'uppercase' as const,
          boxShadow: canStart ? '0 4px 24px rgba(255,122,24,0.5)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        START BATTLE
      </button>
    </div>
  );
}
