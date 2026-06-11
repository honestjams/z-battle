'use client';

import React from 'react';
import { getCard } from '@/lib/engine/cards';

interface FieldSlotProps {
  fieldId: string | null;
  isValidPlaySlot?: boolean;
  onTap?: () => void;
}

export default function FieldSlot({ fieldId, isValidPlaySlot = false, onTap }: FieldSlotProps) {
  if (!fieldId) {
    return (
      <div onClick={onTap} style={{
        width: 72, height: 50, borderRadius: 6, cursor: isValidPlaySlot ? 'pointer' : 'default',
        border: isValidPlaySlot ? '2px dashed var(--field)' : '1.5px dashed var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isValidPlaySlot ? 'rgba(52,199,89,0.08)' : 'transparent',
        boxShadow: isValidPlaySlot ? '0 0 10px rgba(52,199,89,0.4)' : 'none',
      }}>
        <span style={{
          fontFamily: 'Saira Condensed, sans-serif', fontSize: 9,
          color: isValidPlaySlot ? 'var(--field)' : 'var(--line)',
          textTransform: 'uppercase', letterSpacing: 1,
        }}>{isValidPlaySlot ? 'PLAY' : 'No Field'}</span>
      </div>
    );
  }

  let card;
  try { card = getCard(fieldId); } catch { card = null; }

  return (
    <div onClick={onTap} style={{
      width: 72, height: 50, borderRadius: 6,
      cursor: onTap ? 'pointer' : 'default',
      border: '1.5px solid var(--field)',
      boxShadow: '0 0 8px rgba(52,199,89,0.4)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {card?.image ? (
        // Art zone starts at (30px, 200px) in the 1200×1680 source.
        // At 10% scale (120×168px) that becomes (3px, 20px).
        // Center the 114px-wide art horizontally in the 72px slot → offset -24px.
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(/${card.image})`,
            backgroundSize: '120px 168px',
            backgroundPosition: 'center -40px',
            backgroundRepeat: 'no-repeat',
          }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: 'linear-gradient(135deg, #0a1f0a, #1a3520)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Bangers, sans-serif', fontSize: 8,
            color: 'var(--field)', textAlign: 'center', padding: '0 4px',
          }}>
            {card?.name ?? fieldId}
          </span>
        </div>
      )}
    </div>
  );
}
