import { GameState, PlayerId } from './types';

// ---- Win / loss check (in separate file to avoid circular deps) ----
export function checkWinLoss(state: GameState): GameState {
  if (state.winner) return state;

  // Check 5 KOs
  const p1KosScored = state.players.p2.koScoredAgainst; // KOs p1 scored = KOs against p2
  const p2KosScored = state.players.p1.koScoredAgainst;

  if (p1KosScored >= 7) return { ...state, winner: 'p1' };
  if (p2KosScored >= 7) return { ...state, winner: 'p2' };

  // Empty board check during opponent's turn
  // Check both players — if either player's board is completely empty, they lose
  for (const side of ['p1', 'p2'] as PlayerId[]) {
    const ps = state.players[side];
    const isEmpty =
      ps.actives.every(a => a === null) &&
      ps.bench.every(b => b === null);

    if (isEmpty) {
      // The other player wins
      const winner: PlayerId = side === 'p1' ? 'p2' : 'p1';
      return { ...state, winner };
    }
  }

  return state;
}
