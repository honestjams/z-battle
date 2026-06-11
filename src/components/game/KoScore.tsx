'use client';

import React from 'react';

interface KoScoreProps {
  scored: number;    // KOs THIS player scored on the opponent
  max?: number;
}

export default function KoScore({ scored, max = 7 }: KoScoreProps) {
  const rows = [
    Array.from({ length: 4 }, (_, i) => i),
    Array.from({ length: 3 }, (_, i) => i + 4),
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          {r === 0 && (
            <span style={{
              fontFamily: 'Saira Condensed, sans-serif',
              fontSize: 8,
              color: 'var(--muted)',
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginRight: 1,
              lineHeight: 1,
            }}>KO</span>
          )}
          {r === 1 && <span style={{ width: 18 }} />}
          {row.map(i => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i < scored ? 'var(--ki)' : 'transparent',
                border: `1.5px solid ${i < scored ? 'var(--ki)' : 'var(--line)'}`,
                boxShadow: i < scored ? '0 0 5px var(--ki)' : 'none',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
