// Local, on-device stat storage — replaces the Supabase-backed game_results
// table so the game works with no account and no backend. All data lives in
// localStorage under STATS_KEY.

export type GameMode = 'ai' | 'hotseat';

export interface LocalGameResult {
  game_mode: GameMode;
  deck: string;
  won: boolean;
  created_at: string;
}

const STATS_KEY = 'zbattle_game_results';

export function loadResults(): LocalGameResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalGameResult[]) : [];
  } catch {
    return [];
  }
}

export function recordResult(result: Omit<LocalGameResult, 'created_at'>): void {
  if (typeof window === 'undefined') return;
  try {
    const results = loadResults();
    results.unshift({ ...result, created_at: new Date().toISOString() });
    localStorage.setItem(STATS_KEY, JSON.stringify(results));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

export function clearResults(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch {
    /* ignore */
  }
}
