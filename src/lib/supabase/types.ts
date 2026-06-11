export type MatchStatus = 'waiting' | 'invited' | 'active' | 'finished';

export interface Match {
  id: string;
  status: MatchStatus;
  player1: string;
  player2: string | null;
  player1_deck: string | null;
  player2_deck: string | null;
  state: unknown; // GameState JSON blob
  winner: string | null;
  turn_player: string | null;
  updated_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

export interface Friendship {
  id: string;
  requester: string;
  addressee: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}
