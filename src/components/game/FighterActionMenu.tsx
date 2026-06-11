'use client';

import React from 'react';
import type { Intent, GameState } from '@/lib/engine/types';
import { getCard } from '@/lib/engine/cards';
import { legalMoves } from '@/lib/engine';

interface FighterActionMenuProps {
  state: GameState;
  side: 'active' | 'bench';
  index: number;
  isOpponent: boolean;
  onIntent: (intent: Intent) => void;
  onClose: () => void;
  onSelectRetreatTarget: () => void; // triggers bench selection mode
}

export default function FighterActionMenu({
  state,
  side,
  index,
  isOpponent,
  onIntent,
  onClose,
  onSelectRetreatTarget,
}: FighterActionMenuProps) {
  const tp = state.turnPlayer;
  const player = state.players[tp];
  const fighter = side === 'active' ? player.actives[index] : player.bench[index];

  if (!fighter || isOpponent) return null;

  const card = (() => {
    try { return getCard(fighter.cardId); } catch { return null; }
  })();

  const moves = legalMoves(state, tp);

  const canRetreat =
    side === 'active' &&
    state.phase === 'main1' &&
    moves.some((m) => m.type === 'retreat' && m.activeIndex === index);

  const canSacrifice = moves.some(
    (m) => m.type === 'sacrifice' && m.side === side && m.index === index
  );

  const canUltimate =
    side === 'active' &&
    state.phase === 'battle' &&
    moves.some((m) => m.type === 'ultimate' && m.fighterIndex === index);

  const ultAb = card?.abilities.find(
    (ab) => ab.kind === 'ultimate' || ab.kind === 'activated_one_shot'
  );

  const [sacrificeConfirm, setSacrificeConfirm] = React.useState(false);

  function handleSacrifice() {
    onIntent({ type: 'sacrifice', side, index });
    onClose();
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '105%',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'var(--panel)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 200,
        minWidth: 120,
        boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {canRetreat && !sacrificeConfirm && (
        <MenuButton
          label="RETREAT"
          color="var(--ki)"
          onClick={() => {
            onClose();
            onSelectRetreatTarget();
          }}
        />
      )}

      {canUltimate && !sacrificeConfirm && ultAb && (
        <MenuButton
          label={`ULTIMATE`}
          color="#b44dff"
          onClick={() => {
            // Ultimate targeting handled by parent selection
            onIntent({ type: 'ultimate', fighterIndex: index });
            onClose();
          }}
        />
      )}

      {canSacrifice && !sacrificeConfirm && (
        <MenuButton
          label="SACRIFICE"
          color="var(--atk)"
          onClick={() => setSacrificeConfirm(true)}
        />
      )}

      {sacrificeConfirm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: 'Saira Condensed, sans-serif',
              fontSize: 9,
              color: 'var(--muted)',
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Sure?
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            <MenuButton label="YES" color="var(--atk)" onClick={handleSacrifice} />
            <MenuButton
              label="NO"
              color="var(--muted)"
              onClick={() => setSacrificeConfirm(false)}
            />
          </div>
        </div>
      )}

      {!sacrificeConfirm && (
        <MenuButton label="CLOSE" color="var(--muted)" onClick={onClose} />
      )}
    </div>
  );
}

function MenuButton({
  label,
  color,
  onClick,
}: {
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${color}66`,
        borderRadius: 4,
        padding: '6px 8px',
        cursor: 'pointer',
        fontFamily: 'Bangers, sans-serif',
        fontSize: 10,
        color,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
        textAlign: 'center',
      }}
    >
      {label}
    </button>
  );
}
