'use client';

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { GameResult } from '@/lib/supabase/types';

interface PowerLevelScreenProps {
  user: User;
  onBack: () => void;
}

type SouterColor = 'green' | 'red' | 'purple' | 'blue';

const SCOUTER_COLORS: Record<SouterColor, { primary: string; dim: string; bg: string }> = {
  green:  { primary: '#00ff41', dim: '#004d15',  bg: 'rgba(0,255,65,0.04)'  },
  red:    { primary: '#ff3333', dim: '#4d0000',  bg: 'rgba(255,51,51,0.04)' },
  purple: { primary: '#cc44ff', dim: '#3d0052',  bg: 'rgba(204,68,255,0.04)'},
  blue:   { primary: '#00aaff', dim: '#003352',  bg: 'rgba(0,170,255,0.04)' },
};

const DECK_NAMES: Record<string, string> = {
  saiyan: 'SAIYAN',
  namekian: 'NAMEKIAN',
  android: 'ANDROID',
  human: 'EARTHLING',
  frieza_force: 'FRIEZA FORCE',
};

function computeStats(results: GameResult[]) {
  const byMode = (mode: GameResult['game_mode']) => results.filter(r => r.game_mode === mode);
  const wins = (rs: GameResult[]) => rs.filter(r => r.won).length;

  const ai = byMode('ai');
  const hotseat = byMode('hotseat');
  const online = byMode('online');

  // Favourite deck: most appearances across all modes
  const deckCounts: Record<string, number> = {};
  for (const r of results) deckCounts[r.deck] = (deckCounts[r.deck] ?? 0) + 1;
  const favDeck = Object.entries(deckCounts).sort((a, b) => b[1] - a[1])[0];

  // Best deck: highest win rate with at least 3 games
  const deckWins: Record<string, { w: number; g: number }> = {};
  for (const r of results) {
    if (!deckWins[r.deck]) deckWins[r.deck] = { w: 0, g: 0 };
    deckWins[r.deck].g++;
    if (r.won) deckWins[r.deck].w++;
  }
  const qualified = Object.entries(deckWins).filter(([, v]) => v.g >= 3);
  const bestDeck = qualified.sort((a, b) => (b[1].w / b[1].g) - (a[1].w / a[1].g))[0];
  const bestDeckPct = bestDeck ? Math.round((bestDeck[1].w / bestDeck[1].g) * 100) : null;

  // Power level: weighted score
  const totalWins = wins(results);
  const power = totalWins * 150 + ai.length * 20 + online.length * 40;

  return {
    ai: { games: ai.length, wins: wins(ai) },
    hotseat: { games: hotseat.length, wins: wins(hotseat) },
    online: { games: online.length, wins: wins(online) },
    favDeck: favDeck ? { deck: favDeck[0], count: favDeck[1] } : null,
    bestDeck: bestDeck ? { deck: bestDeck[0], pct: bestDeckPct!, games: bestDeck[1].g } : null,
    power,
    totalGames: results.length,
    totalWins,
  };
}

function WinBar({ wins, games, color, dim }: { wins: number; games: number; color: string; dim: string }) {
  if (games === 0) return <span style={{ color: dim, fontFamily: 'Courier New, monospace', fontSize: 11 }}>NO DATA</span>;
  const pct = Math.round((wins / games) * 100);
  const filled = Math.round(pct / 10);
  return (
    <span style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color, letterSpacing: 1 }}>
      {'█'.repeat(filled)}{'░'.repeat(10 - filled)}
      {' '}{wins}/{games}{'  '}{pct}%
    </span>
  );
}

export default function PowerLevelScreen({ user, onBack }: PowerLevelScreenProps) {
  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorKey, setColorKey] = useState<SouterColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('scouter_color') as SouterColor) ?? 'green';
    }
    return 'green';
  });

  const color = SCOUTER_COLORS[colorKey];
  const COLOR_ORDER: SouterColor[] = ['green', 'red', 'purple', 'blue'];

  function cycleColor() {
    setColorKey(prev => {
      const next = COLOR_ORDER[(COLOR_ORDER.indexOf(prev) + 1) % COLOR_ORDER.length];
      localStorage.setItem('scouter_color', next);
      return next;
    });
  }

  useEffect(() => {
    supabase
      .from('game_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setResults((data as GameResult[]) ?? []);
        setLoading(false);
      });
  }, [user.id]);

  const stats = computeStats(results);

  const divider = (
    <div style={{
      fontFamily: 'Courier New, monospace', fontSize: 11,
      color: color.dim, letterSpacing: 1, margin: '2px 0',
    }}>
      {'━'.repeat(32)}
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, minHeight: 22 }}>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 11, color: color.dim, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: color.primary, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );

  // Power level bar (0–9999 range mapped to 10 blocks)
  const powerCapped = Math.min(stats.power, 9999);
  const powerFilled = Math.round((powerCapped / 9999) * 10);

  return (
    <div style={{
      width: '100%', maxWidth: 430, minHeight: '100dvh', margin: '0 auto',
      background: '#000',
      display: 'flex', flexDirection: 'column',
      padding: 'max(16px, env(safe-area-inset-top)) 20px max(32px, env(safe-area-inset-bottom))',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Scanlines overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
      }} />

      {/* Corner bracket decorations */}
      <div style={{ position: 'absolute', top: 12, left: 12, color: color.primary, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.5, pointerEvents: 'none', zIndex: 1 }}>⌐</div>
      <div style={{ position: 'absolute', top: 12, right: 12, color: color.primary, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.5, pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}>⌐</div>
      <div style={{ position: 'absolute', bottom: 48, left: 12, color: color.primary, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.5, pointerEvents: 'none', zIndex: 1, transform: 'scaleY(-1)' }}>⌐</div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Courier New, monospace', fontSize: 11,
            color: color.dim, textTransform: 'uppercase', letterSpacing: 1,
            padding: 0, marginBottom: 16,
          }}>
            ← BACK
          </button>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>
            ◈ CAPSULE CORP SCOUTER v3.1
          </div>
          <div style={{
            fontFamily: 'Courier New, monospace', fontSize: 22,
            color: color.primary, letterSpacing: 4, textTransform: 'uppercase',
            textShadow: `0 0 12px ${color.primary}, 0 0 24px ${color.primary}60`,
          }}>
            POWER LEVEL
          </div>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 2, marginTop: 2 }}>
            COMBAT ANALYSIS: {user.email}
          </div>
        </div>

        {loading ? (
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 13, color: color.dim, letterSpacing: 2, marginTop: 32, textAlign: 'center' }}>
            SCANNING…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* VS AI */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>▸ VS AI</div>
            {row('GAMES ANALYZED', stats.ai.games)}
            {row('VICTORIES', <WinBar wins={stats.ai.wins} games={stats.ai.games} color={color.primary} dim={color.dim} />)}

            {/* HOTSEAT */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>▸ HOTSEAT</div>
            {row('GAMES ANALYZED', stats.hotseat.games)}
            {row('VICTORIES', <WinBar wins={stats.hotseat.wins} games={stats.hotseat.games} color={color.primary} dim={color.dim} />)}

            {/* ONLINE */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>▸ ONLINE</div>
            {row('GAMES ANALYZED', stats.online.games)}
            {row('VICTORIES', <WinBar wins={stats.online.wins} games={stats.online.games} color={color.primary} dim={color.dim} />)}

            {/* Deck analysis */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>▸ UNIT ANALYSIS</div>
            {row('PREFERRED UNIT',
              stats.favDeck
                ? <>{DECK_NAMES[stats.favDeck.deck] ?? stats.favDeck.deck.toUpperCase()}<span style={{ color: color.dim, fontSize: 10 }}> ×{stats.favDeck.count}</span></>
                : <span style={{ color: color.dim }}>—</span>
            )}
            {row('OPTIMAL UNIT',
              stats.bestDeck
                ? <>{DECK_NAMES[stats.bestDeck.deck] ?? stats.bestDeck.deck.toUpperCase()}<span style={{ color: color.dim, fontSize: 10 }}> {stats.bestDeck.pct}% ({stats.bestDeck.games}g)</span></>
                : <span style={{ color: color.dim, fontSize: 11 }}>{stats.totalGames < 3 ? 'NEED 3+ GAMES' : '—'}</span>
            )}

            {/* Power level total */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.dim, letterSpacing: 3, marginBottom: 4 }}>▸ POWER READING</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Courier New, monospace', fontSize: 11, color: color.dim, letterSpacing: 1 }}>POWER LEVEL</span>
              <span style={{
                fontFamily: 'Courier New, monospace', fontSize: 28,
                color: color.primary, letterSpacing: 4,
                textShadow: `0 0 16px ${color.primary}, 0 0 32px ${color.primary}80`,
              }}>
                {stats.power.toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: 4, fontFamily: 'Courier New, monospace', fontSize: 14, color: color.primary, letterSpacing: 2 }}>
              {'█'.repeat(powerFilled)}{'░'.repeat(10 - powerFilled)}
            </div>
            {divider}

          </div>
        )}
      </div>

      {/* Scouter colour toggle — bottom right */}
      <button
        onClick={cycleColor}
        style={{
          position: 'fixed',
          bottom: 'max(28px, env(safe-area-inset-bottom))',
          right: 20,
          width: 52, height: 52,
          borderRadius: '50%',
          background: color.bg,
          border: `2px solid ${color.primary}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 12px ${color.primary}80`,
          zIndex: 10,
        }}
        title="Change scouter colour"
      >
        {/* Placeholder — replace src with real image when ready */}
        <span style={{
          fontFamily: 'Courier New, monospace', fontSize: 18,
          color: color.primary,
          textShadow: `0 0 8px ${color.primary}`,
        }}>
          ◉
        </span>
      </button>

    </div>
  );
}
