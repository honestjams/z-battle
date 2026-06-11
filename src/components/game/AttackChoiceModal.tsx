'use client';

import React from 'react';

export type AttackChoice =
  | { kind: 'normal' }
  | { kind: 'kaioken' }
  | { kind: 'one_shot' }
  | { kind: 'tri_beam' };

interface AttackChoiceModalProps {
  attackerName: string;
  showKaioken: boolean;
  kiAvailable: number;
  showOneShot: boolean;
  oneShotLabel?: string;
  showTriBeam: boolean;
  attackerHp: number;
  onChoose: (choice: AttackChoice) => void;
  onCancel: () => void;
}

export default function AttackChoiceModal({
  attackerName,
  showKaioken,
  kiAvailable,
  showOneShot,
  oneShotLabel,
  showTriBeam,
  attackerHp,
  onChoose,
  onCancel,
}: AttackChoiceModalProps) {
  const hasOptions = showKaioken || showOneShot || showTriBeam;

  // If no special options, just proceed with normal immediately
  React.useEffect(() => {
    if (!hasOptions) {
      onChoose({ kind: 'normal' });
    }
  }, [hasOptions, onChoose]);

  if (!hasOptions) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '20px',
          minWidth: 260,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center' }}>
          <span
            style={{
              fontFamily: 'Bangers, sans-serif',
              fontSize: 16,
              color: 'var(--ink)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {attackerName}
          </span>
          <p
            style={{
              fontFamily: 'Saira Condensed, sans-serif',
              fontSize: 10,
              color: 'var(--muted)',
              margin: '4px 0 0',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Choose Attack
          </p>
        </div>

        {/* Normal attack */}
        <ChoiceButton
          label="NORMAL ATTACK"
          sub=""
          color="var(--atk)"
          onClick={() => onChoose({ kind: 'normal' })}
        />

        {/* Kaioken */}
        {showKaioken && kiAvailable >= 2 && (
          <ChoiceButton
            label="KAIO-KEN"
            sub="+2 Ki · +3,000 DMG"
            color="var(--ki)"
            onClick={() => onChoose({ kind: 'kaioken' })}
          />
        )}

        {/* One-shot ability */}
        {showOneShot && (
          <ChoiceButton
            label={oneShotLabel ?? 'SPECIAL ABILITY'}
            sub="Ignore DEF (Once per game)"
            color="#b44dff"
            onClick={() => onChoose({ kind: 'one_shot' })}
          />
        )}

        {/* Tri-beam */}
        {showTriBeam && attackerHp > 1000 && (
          <ChoiceButton
            label="TRI-BEAM"
            sub="-1,000 HP · +2,000 DMG (Once)"
            color="#3aa6ff"
            onClick={() => onChoose({ kind: 'tri_beam' })}
          />
        )}

        {/* Cancel */}
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 10,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            padding: '4px',
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}

function ChoiceButton({
  label,
  sub,
  color,
  onClick,
}: {
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: `${color}18`,
        border: `1.5px solid ${color}66`,
        borderRadius: 8,
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        textAlign: 'left',
        WebkitTapHighlightColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <span
        style={{
          fontFamily: 'Bangers, sans-serif',
          fontSize: 13,
          color,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'Saira Condensed, sans-serif',
            fontSize: 9,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}
