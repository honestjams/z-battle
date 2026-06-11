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
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {Array.from({ length: kiMax }, (_, i) => {
        const isLit = i < kiCurrent;
        return (
          <div
            key={i}
            className={animating && isLit ? 'ki-ball-pop' : undefined}
            style={animating && isLit ? { animationDelay: `${i * 80}ms`, display: 'inline-flex' } : { display: 'inline-flex' }}
          >
            <DragonBallKi
              stars={i + 1}
              size={size}
              dim={!isLit}
            />
          </div>
        );
      })}
    </div>
  );
}
