'use client';

import React from 'react';
import type { PlayerId } from '@/lib/engine/types';

interface PassScreenProps {
  turnPlayer: PlayerId;
  onReveal: () => void;
  isAiGame?: boolean;
}

export default function PassScreen({ turnPlayer, onReveal, isAiGame }: PassScreenProps) {
  const playerLabel = turnPlayer === 'p1' ? 'PLAYER 1' : 'PLAYER 2';

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
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        padding: '24px 16px',
        fontFamily: 'Saira, sans-serif',
      }}
    >
      {/* Player label */}
      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: 3,
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}
        >
          Up Next
        </p>
        <h1
          style={{
            fontFamily: 'Bangers, sans-serif',
            fontSize: 42,
            background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0,
            letterSpacing: 2,
          }}
        >
          {playerLabel}
        </h1>
        <p
          style={{
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 13,
            color: 'var(--muted)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            margin: '8px 0 0',
          }}
        >
          DRAW PHASE
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          width: 60,
          height: 2,
          background: 'linear-gradient(90deg, transparent, var(--ki), transparent)',
        }}
      />

      {/* Pass device message */}
      {!isAiGame && (
        <p
          style={{
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 12,
            color: 'var(--muted)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            textAlign: 'center',
            opacity: 0.7,
            maxWidth: 220,
            lineHeight: 1.6,
          }}
        >
          Hand the device to the other player
        </p>
      )}

      {/* Reveal button */}
      <button
        onClick={onReveal}
        style={{
          background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
          border: 'none',
          borderRadius: 12,
          padding: '16px 48px',
          cursor: 'pointer',
          fontFamily: 'Bangers, sans-serif',
          fontSize: 16,
          color: '#0d0f14',
          letterSpacing: 2,
          textTransform: 'uppercase' as const,
          boxShadow: '0 4px 24px rgba(255,122,24,0.5)',
        }}
      >
        TAP TO REVEAL
      </button>
    </div>
  );
}
