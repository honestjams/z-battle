'use client';

import React from 'react';
import DragonBallKi from './DragonBallKi';

interface KiDisplayProps {
  kiCurrent: number;
  kiMax: number;
  size?: number;
  animating?: boolean;
}

export default function KiDisplay({ kiCurrent, kiMax, size = 22, animating = false }: KiDisplayProps) {
  const gap = 3;
  const rowSize = 4;
  const row1 = Array.from({ length: Math.min(rowSize, kiMax) }, (_, i) => i);
  const row2 = kiMax > rowSize ? Array.from({ length: kiMax - rowSize }, (_, i) => i + rowSize) : [];
  // Stagger row 2 by half a pip width so it sits between row 1's orbs
  const staggerOffset = (size + gap) / 2;

  const renderOrb = (i: number) => {
    const isLit = i < kiCurrent;
    return (
      <div
        key={i}
        className={animating && isLit ? 'ki-ball-pop' : undefined}
        style={animating && isLit ? { animationDelay: `${i * 80}ms`, display: 'inline-flex' } : { display: 'inline-flex' }}
      >
        <DragonBallKi stars={i + 1} size={size} dim={!isLit} />
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      <div style={{ display: 'flex', gap }}>
        {row1.map(i => renderOrb(i))}
      </div>
      {row2.length > 0 && (
        <div style={{ display: 'flex', gap, marginLeft: staggerOffset }}>
          {row2.map(i => renderOrb(i))}
        </div>
      )}
    </div>
  );
}
