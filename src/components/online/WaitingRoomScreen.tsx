'use client';

import React, { useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Match } from '@/lib/supabase/types';
import type { PlayerId } from '@/lib/engine/types';

interface WaitingRoomScreenProps {
  matchId: string;
  user: User;
  onMatchStarted: (matchId: string, myRole: PlayerId) => void;
  onCancel: () => void;
}

export default function WaitingRoomScreen({ matchId, user, onMatchStarted, onCancel }: WaitingRoomScreenProps) {
  useEffect(() => {
    // Subscribe to match updates
    const channel = supabase.channel(`match-wait:${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'matches',
        filter: `id=eq.${matchId}`,
      }, (payload) => {
        const match = payload.new as Match;
        if (match.status === 'active') {
          onMatchStarted(matchId, 'p1');
        }
      })
      .subscribe();

    // Also poll once in case we missed the event
    supabase.from('matches').select('*').eq('id', matchId).single().then(({ data }) => {
      if (data && (data as Match).status === 'active') {
        onMatchStarted(matchId, 'p1');
      }
    });

    return () => { supabase.removeChannel(channel); };
  }, [matchId, onMatchStarted]);

  async function handleCancel() {
    await supabase.from('matches').delete().eq('id', matchId);
    onCancel();
  }

  return (
    <div style={{
      width: '100%', maxWidth: 430, minHeight: '100dvh', margin: '0 auto',
      background: 'var(--bg)', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32, padding: '24px 16px',
      fontFamily: 'Saira, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: 'Saira Condensed, sans-serif', fontSize: 12, color: 'var(--muted)', letterSpacing: 3, textTransform: 'uppercase', margin: '0 0 8px' }}>
          Online Match
        </p>
        <h1 style={{
          fontFamily: 'Bangers, sans-serif', fontSize: 32,
          background: 'linear-gradient(135deg, var(--ki), var(--ki2))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', margin: 0, letterSpacing: 2,
        }}>
          WAITING FOR OPPONENT
        </h1>
      </div>

      <div style={{ width: 60, height: 2, background: 'linear-gradient(90deg, transparent, var(--ki), transparent)' }} />

      <p style={{
        fontFamily: 'Saira Condensed, sans-serif', fontSize: 11, color: 'var(--muted)',
        letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center', opacity: 0.7, lineHeight: 1.8,
      }}>
        Share your match code with a friend
      </p>

      <div style={{
        background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 16px',
      }}>
        <span style={{ fontFamily: 'Saira Condensed, sans-serif', fontSize: 11, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase' }}>
          {matchId.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <button onClick={handleCancel} style={{
        background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 10, padding: '12px 32px', cursor: 'pointer',
        fontFamily: 'Saira Condensed, sans-serif', fontSize: 12, color: 'var(--muted)',
        letterSpacing: 1, textTransform: 'uppercase',
      }}>
        CANCEL
      </button>
    </div>
  );
}
