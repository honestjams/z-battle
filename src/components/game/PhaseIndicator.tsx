'use client';

import React from 'react';
import type { Phase } from '@/lib/engine/types';

interface PhaseIndicatorProps {
  phase: Phase;
  turnNumber: number;
}

const PHASES: { key: Phase; label: string }[] = [
  { key: 'draw', label: 'Draw' },
  { key: 'main1', label: 'Main' },
  { key: 'battle', label: 'Battle' },
  { key: 'main2', label: 'Main 2' },
  { key: 'end', label: 'End' },
];

export default function PhaseIndicator({ phase, turnNumber }: PhaseIndicatorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
      <span style={{
        fontFamily: 'Saira Condensed, sans-serif',
        fontSize: 10,
        color: 'var(--muted)',
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        Turn {turnNumber}
      </span>
      <div style={{ display: 'flex', gap: 2 }}>
        {PHASES.map(({ key, label }) => {
          const isActive = key === phase;
          return (
            <span
              key={key}
              style={{
                fontFamily: 'Saira Condensed, sans-serif',
                fontSize: 9,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#0d0f14' : 'var(--muted)',
                background: isActive ? 'var(--ki)' : 'var(--panel2)',
                borderRadius: 3,
                padding: '2px 4px',
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                border: isActive ? 'none' : '1px solid var(--line)',
                boxShadow: isActive ? '0 0 8px var(--ki)' : 'none',
              }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
