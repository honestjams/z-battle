'use client';

import React, { useState, useRef } from 'react';

// AppContent is lazy-loaded on demand — keeps the initial bundle tiny
type Phase = 'splash' | 'loading' | 'ready';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = React.ComponentType<any>;

export default function Home() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [progress, setProgress] = useState(0);
  const [AppContent, setAppContent] = useState<AnyComponent | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function handlePowerUp() {
    setPhase('loading');

    // Asymptotic animation: approaches 90% while the bundle downloads
    let p = 0;
    timerRef.current = setInterval(() => {
      p += (90 - p) * 0.07;
      setProgress(p);
    }, 60);

    import('@/components/AppContent').then((mod) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      // Wrap in arrow fn so React doesn't treat the component as a state updater
      setAppContent(() => mod.default as AnyComponent);
      setTimeout(() => setPhase('ready'), 500);
    });
  }

  if (phase === 'ready' && AppContent) {
    return <AppContent />;
  }

  const pct = Math.round(progress);
  const filled = Math.round(pct / 10);

  // Red scouter palette
  const vivid  = '#e82020';
  const border = '#c01818';
  const dark   = '#150404';
  const muted  = '#5c1a1a';

  return (
    <div style={{
      width: '100%',
      height: '100dvh',
      background: '#0d0f14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>

      {/* Red scanlines */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(232,32,32,0.03) 2px, rgba(232,32,32,0.03) 4px)',
      }} />

      {/* Scouter modal */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: 300,
        background: dark,
        border: `2px solid ${border}`,
        borderRadius: 12,
        padding: '28px 24px 24px',
        fontFamily: 'Courier New, monospace',
        fontWeight: 700,
        boxShadow: `0 0 50px ${vivid}20, 0 0 120px rgba(0,0,0,0.95)`,
      }}>

        {/* Corner brackets */}
        <span style={{ position: 'absolute', top: 6,    left:  8, color: vivid, fontSize: 14, opacity: 0.45 }}>⌐</span>
        <span style={{ position: 'absolute', top: 6,    right: 8, color: vivid, fontSize: 14, opacity: 0.45, display: 'inline-block', transform: 'scaleX(-1)' }}>⌐</span>
        <span style={{ position: 'absolute', bottom: 6, left:  8, color: vivid, fontSize: 14, opacity: 0.45, display: 'inline-block', transform: 'scaleY(-1)' }}>⌐</span>
        <span style={{ position: 'absolute', bottom: 6, right: 8, color: vivid, fontSize: 14, opacity: 0.45, display: 'inline-block', transform: 'scale(-1)' }}>⌐</span>

        {/* Header label */}
        <div style={{ fontSize: 8, color: muted, letterSpacing: 3, marginBottom: 20, textTransform: 'uppercase' }}>
          ◈ CAPSULE CORP SCOUTER v3.1
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Bangers, sans-serif',
          fontSize: 42,
          fontWeight: 400,
          color: vivid,
          letterSpacing: 4,
          lineHeight: 1,
          marginBottom: 6,
          textShadow: `0 0 28px ${vivid}50`,
        }}>
          Z-BATTLE
        </div>
        <div style={{ fontSize: 9, color: muted, letterSpacing: 2, marginBottom: 20 }}>
          COMBAT SYSTEM OFFLINE
        </div>

        <div style={{ fontSize: 9, color: muted, letterSpacing: 1, marginBottom: 22 }}>
          {'━'.repeat(26)}
        </div>

        {/* ── Splash: show POWER UP button ── */}
        {phase === 'splash' && (
          <button
            onClick={handlePowerUp}
            style={{
              width: '100%',
              padding: '14px 0',
              background: `${vivid}12`,
              border: `2px solid ${vivid}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontWeight: 700,
              fontSize: 14,
              color: vivid,
              letterSpacing: 5,
            }}
          >
            POWER UP
          </button>
        )}

        {/* ── Loading: show charging bar ── */}
        {phase === 'loading' && (
          <>
            <div style={{ fontSize: 9, color: muted, letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
              INITIALISING SYSTEMS
            </div>

            {/* Progress bar */}
            <div style={{ fontSize: 20, letterSpacing: 3, lineHeight: 1, marginBottom: 10 }}>
              <span style={{ color: vivid }}>{'█'.repeat(filled)}</span>
              <span style={{ color: muted }}>{'░'.repeat(10 - filled)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontSize: 9, color: muted, letterSpacing: 1 }}>
                {pct < 100
                  ? <span className="scouter-reading" style={{ color: vivid }}>LOADING</span>
                  : <span style={{ color: vivid }}>READY</span>
                }
              </span>
              <span style={{ fontSize: 11, color: vivid, letterSpacing: 1 }}>{pct}%</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
