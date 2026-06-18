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

// bg   = vivid scouter-lens colour at 50% opacity (lets the dark page show through)
// text = 80% black + 20% vivid — dark, hue-tinted, bold-readable
// muted = 70% black + 30% vivid — slightly lighter for secondary labels
const SCOUTER_COLORS: Record<SouterColor, { bg: string; text: string; muted: string }> = {
  green:  { bg: 'rgba(0,196,38,0.5)',   text: '#002708', muted: '#003b0b' },
  red:    { bg: 'rgba(232,32,32,0.5)',  text: '#2e0606', muted: '#460a0a' },
  purple: { bg: 'rgba(184,48,232,0.5)', text: '#250a2e', muted: '#370e46' },
  blue:   { bg: 'rgba(0,150,232,0.5)',  text: '#001e2e', muted: '#002d46' },
};

const DECK_NAMES: Record<string, string> = {
  saiyan: 'THE CREW',
  android: 'THE NETWORK',
  frieza_force: 'ICONS',
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

function WinBar({ wins, games, text, muted }: { wins: number; games: number; text: string; muted: string }) {
  if (games === 0) return <span style={{ color: muted, fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700 }}>NO DATA</span>;
  const pct = Math.round((wins / games) * 100);
  const filled = Math.round(pct / 10);
  return (
    <span style={{ fontFamily: 'Courier New, monospace', fontSize: 12, letterSpacing: 1, fontWeight: 700 }}>
      <span style={{ color: text }}>{'█'.repeat(filled)}</span>
      <span style={{ color: muted }}>{'░'.repeat(10 - filled)}</span>
      <span style={{ color: text }}>{' '}{wins}/{games}{'  '}{pct}%</span>
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
      color: color.muted, letterSpacing: 1, margin: '2px 0',
    }}>
      {'━'.repeat(32)}
    </div>
  );

  const row = (label: string, value: React.ReactNode) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, minHeight: 22 }}>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 11, color: color.muted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: color.text, textAlign: 'right' }}>
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
      background: color.bg,
      display: 'flex', flexDirection: 'column',
      padding: 'max(16px, env(safe-area-inset-top)) 20px max(32px, env(safe-area-inset-bottom))',
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.3s',
      fontWeight: 700,
    }}>

      {/* Scanlines overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.10) 2px, rgba(0,0,0,0.10) 4px)',
      }} />

      {/* Corner bracket decorations */}
      <div style={{ position: 'absolute', top: 12, left: 12, color: color.text, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.4, pointerEvents: 'none', zIndex: 1 }}>⌐</div>
      <div style={{ position: 'absolute', top: 12, right: 12, color: color.text, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.4, pointerEvents: 'none', zIndex: 1, transform: 'scaleX(-1)' }}>⌐</div>
      <div style={{ position: 'absolute', bottom: 48, left: 12, color: color.text, fontFamily: 'Courier New, monospace', fontSize: 16, opacity: 0.4, pointerEvents: 'none', zIndex: 1, transform: 'scaleY(-1)' }}>⌐</div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: 0, flex: 1 }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <button onClick={onBack} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Courier New, monospace', fontSize: 11,
            color: color.muted, textTransform: 'uppercase', letterSpacing: 1,
            padding: 0, marginBottom: 16,
          }}>
            ← BACK
          </button>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.muted, letterSpacing: 3, marginBottom: 4 }}>
            ◈ CAPSULE CORP SCOUTER v3.1
          </div>
          <div style={{
            fontFamily: 'Courier New, monospace', fontSize: 22,
            color: color.text, letterSpacing: 4, textTransform: 'uppercase',
          }}>
            POWER LEVEL
          </div>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.muted, letterSpacing: 2, marginTop: 2 }}>
            COMBAT ANALYSIS: {user.email}
          </div>
        </div>

        {loading ? (
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 13, color: color.muted, letterSpacing: 2, marginTop: 32, textAlign: 'center' }}>
            SCANNING…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

            {/* VS AI */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.text, letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>▸ VS AI</div>
            {row('GAMES ANALYZED', stats.ai.games)}
            {row('VICTORIES', <WinBar wins={stats.ai.wins} games={stats.ai.games} text={color.text} muted={color.muted} />)}

            {/* HOTSEAT */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.text, letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>▸ HOTSEAT</div>
            {row('GAMES ANALYZED', stats.hotseat.games)}
            {row('VICTORIES', <WinBar wins={stats.hotseat.wins} games={stats.hotseat.games} text={color.text} muted={color.muted} />)}

            {/* ONLINE */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.text, letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>▸ ONLINE</div>
            {row('GAMES ANALYZED', stats.online.games)}
            {row('VICTORIES', <WinBar wins={stats.online.wins} games={stats.online.games} text={color.text} muted={color.muted} />)}

            {/* Deck analysis */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.text, letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>▸ UNIT ANALYSIS</div>
            {row('PREFERRED UNIT',
              stats.favDeck
                ? <>{DECK_NAMES[stats.favDeck.deck] ?? stats.favDeck.deck.toUpperCase()}<span style={{ color: color.muted, fontSize: 10 }}> ×{stats.favDeck.count}</span></>
                : <span style={{ color: color.muted }}>—</span>
            )}
            {row('OPTIMAL UNIT',
              stats.bestDeck
                ? <>{DECK_NAMES[stats.bestDeck.deck] ?? stats.bestDeck.deck.toUpperCase()}<span style={{ color: color.muted, fontSize: 10 }}> {stats.bestDeck.pct}% ({stats.bestDeck.games}g)</span></>
                : <span style={{ color: color.muted, fontSize: 11 }}>{stats.totalGames < 3 ? 'NEED 3+ GAMES' : '—'}</span>
            )}

            {/* Power level total */}
            {divider}
            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 10, color: color.text, letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>▸ POWER READING</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Courier New, monospace', fontSize: 11, color: color.muted, letterSpacing: 1 }}>POWER LEVEL</span>
              <span style={{
                fontFamily: 'Courier New, monospace', fontSize: 28,
                color: color.text, letterSpacing: 4,
              }}>
                {stats.power.toLocaleString()}
              </span>
            </div>
            <div style={{ marginTop: 4, fontFamily: 'Courier New, monospace', fontSize: 14, letterSpacing: 2 }}>
              <span style={{ color: color.text }}>{'█'.repeat(powerFilled)}</span>
              <span style={{ color: color.muted }}>{'░'.repeat(10 - powerFilled)}</span>
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
          background: color.muted,
          border: `2px solid ${color.text}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 12px rgba(0,0,0,0.35)`,
          zIndex: 10,
        }}
        title="Change scouter colour"
      >
        {/* Placeholder — replace src with real image when ready */}
        <span style={{
          fontFamily: 'Courier New, monospace', fontSize: 18,
          color: color.bg,
        }}>
          ◉
        </span>
      </button>

    </div>
  );
}
