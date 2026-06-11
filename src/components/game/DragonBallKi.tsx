'use client';

import React from 'react';

interface DragonBallKiProps {
  stars: number;
  size: number;
  dim?: boolean;
}

function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  const outer = r;
  const inner = r * 0.4;
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push(`${cx + Math.cos(angle) * rad},${cy + Math.sin(angle) * rad}`);
  }
  return pts.join(' ');
}

const LAYOUTS: Record<number, [number, number][]> = {
  0: [],
  1: [[0, 0]],
  2: [[-0.3, -0.3], [0.3, 0.3]],
  3: [[0, -0.38], [-0.36, 0.26], [0.36, 0.26]],
  4: [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]],
  5: [[-0.32, -0.32], [0.32, -0.32], [0, 0], [-0.32, 0.32], [0.32, 0.32]],
  6: [[-0.3, -0.38], [0.3, -0.38], [-0.3, 0], [0.3, 0], [-0.3, 0.38], [0.3, 0.38]],
};

function getStarPositions(stars: number, radius: number): [number, number][] {
  if (stars <= 6) {
    const layout = LAYOUTS[stars] ?? [];
    return layout.map(([fx, fy]) => [fx * radius, fy * radius]);
  }
  if (stars === 7) {
    const positions: [number, number][] = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      positions.push([Math.cos(angle) * radius * 0.5, Math.sin(angle) * radius * 0.5]);
    }
    return positions;
  }
  // 8+: grid
  const positions: [number, number][] = [];
  const cols = 3;
  const rows = Math.ceil(stars / cols);
  for (let i = 0; i < stars; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push([
      (col - (cols - 1) / 2) * radius * 0.38,
      (row - (rows - 1) / 2) * radius * 0.38,
    ]);
  }
  return positions;
}

export default function DragonBallKi({ stars, size, dim = false }: DragonBallKiProps) {
  const r = size / 2;
  const id = `db-${stars}-${size}`;
  const starPositions = getStarPositions(stars, r);
  const starSize = Math.max(2, r * 0.14);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'inline-block', flexShrink: 0, opacity: dim ? 0.3 : 1 }}
    >
      <defs>
        <radialGradient id={`${id}-grad`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffdd80" />
          <stop offset="40%" stopColor="#ff9c20" />
          <stop offset="100%" stopColor="#c74b00" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="30%" cy="25%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,200,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,200,0)" />
        </radialGradient>
      </defs>
      {/* Main sphere */}
      <circle cx={r} cy={r} r={r * 0.92} fill={`url(#${id}-grad)`} />
      {/* Gloss highlight */}
      <ellipse cx={r * 0.7} cy={r * 0.55} rx={r * 0.32} ry={r * 0.22} fill={`url(#${id}-shine)`} />
      {/* Stars */}
      {starPositions.map(([sx, sy], i) => (
        <polygon
          key={i}
          points={starPoints(r + sx, r + sy, starSize)}
          fill="#cc0000"
          opacity="0.85"
        />
      ))}
    </svg>
  );
}
