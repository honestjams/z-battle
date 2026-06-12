'use client';

import React from 'react';
import Image from 'next/image';
import { getCard } from '@/lib/engine/cards';

interface HandCardProps {
  cardId: string;
  isSelected?: boolean;
}

const TYPE_ACCENT: Record<string, string> = {
  saiyan: '#ff7a18',
  namekian: '#34c759',
  android: '#3aa6ff',
  earthling: '#ffb648',
  frieza_force: '#b44dff',
};

function getArtBg(cardType: string, fighterType?: string): string {
  if (cardType === 'hero' && fighterType) return `${TYPE_ACCENT[fighterType] ?? '#ffb648'}18`;
  if (cardType === 'item') return 'rgba(31,184,196,0.12)';
  return 'rgba(76,217,100,0.12)';
}

function getFallbackColor(cardType: string, fighterType?: string): string {
  if (cardType === 'hero' && fighterType) return `${TYPE_ACCENT[fighterType] ?? '#ffb648'}60`;
  if (cardType === 'item') return 'rgba(31,184,196,0.5)';
  return 'rgba(76,217,100,0.5)';
}

export default function HandCard({ cardId, isSelected = false }: HandCardProps) {
  let card;
  try {
    card = getCard(cardId);
  } catch {
    card = null;
  }

  const name = card?.name ?? cardId;
  const cardType = card?.cardType ?? 'item';
  const fighterType = card?.fighterType;

  const artBg = getArtBg(cardType, fighterType);
  const fallbackColor = getFallbackColor(cardType, fighterType);

  return (
    <div
      style={{
        width: 86,
        height: 120,
        borderRadius: 8,
        border: isSelected ? '2px solid var(--ki)' : '1.5px solid var(--line)',
        background: 'var(--panel)',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: isSelected ? '0 0 12px var(--ki)' : 'none',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        transform: isSelected ? 'translateY(-8px)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {card?.image ? (
        <Image
          fill
          src={`/${card.image}`}
          alt={name}
          sizes="86px"
          loading="eager"
          style={{ objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '100%', height: '100%',
          background: artBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Bangers, sans-serif',
            fontSize: 28,
            color: fallbackColor,
            userSelect: 'none',
          }}>
            {name.charAt(0)}
          </span>
        </div>
      )}
    </div>
  );
}
