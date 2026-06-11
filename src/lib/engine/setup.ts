import { GameState, PlayerState, FighterInstance } from './types';
import { getCard, DECKS } from './cards';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function hasOneCostOneHero(hand: string[]): boolean {
  return hand.some(id => {
    const c = getCard(id);
    return c.cardType === 'hero' && c.kiCost === 1;
  });
}

function makePiles(deckId: string): { hero: string[]; item: string[]; field: string[] } {
  const deck = DECKS[deckId];
  return {
    hero: shuffle([...deck.heroes]),
    item: shuffle([...deck.items]),
    field: shuffle([...deck.fields]),
  };
}

function dealOpeningHand(piles: { hero: string[]; item: string[]; field: string[] }): {
  hand: string[];
  piles: { hero: string[]; item: string[]; field: string[] };
} {
  let hand: string[];
  let heroPile = [...piles.hero];
  do {
    // Reset and redraw
    heroPile = shuffle([...piles.hero]);
    hand = heroPile.splice(0, 5);
  } while (!hasOneCostOneHero(hand));
  return { hand, piles: { ...piles, hero: heroPile } };
}

export function createInitialState(
  p1DeckId: string,
  p2DeckId: string,
  firstPlayer: 'p1' | 'p2' = 'p1',
  p1UserId?: string,
  p2UserId?: string
): GameState {
  const p1Piles = makePiles(p1DeckId);
  const p2Piles = makePiles(p2DeckId);

  const { hand: p1Hand, piles: p1FinalPiles } = dealOpeningHand(p1Piles);
  const { hand: p2Hand, piles: p2FinalPiles } = dealOpeningHand(p2Piles);

  // Second player gets one extra card
  const secondPlayer = firstPlayer === 'p1' ? 'p2' : 'p1';

  // Build copies we can mutate for the extra card
  let p1HandFinal = [...p1Hand];
  let p2HandFinal = [...p2Hand];
  let p1PilesFinal = { ...p1FinalPiles, hero: [...p1FinalPiles.hero] };
  let p2PilesFinal = { ...p2FinalPiles, hero: [...p2FinalPiles.hero] };

  if (secondPlayer === 'p2' && p2PilesFinal.hero.length > 0) {
    p2HandFinal = [...p2HandFinal, p2PilesFinal.hero.shift()!];
  } else if (secondPlayer === 'p1' && p1PilesFinal.hero.length > 0) {
    p1HandFinal = [...p1HandFinal, p1PilesFinal.hero.shift()!];
  }

  const makePlayerState = (
    deckId: string,
    hand: string[],
    piles: typeof p1FinalPiles,
    userId?: string
  ): PlayerState => ({
    userId,
    deck: deckId,
    kiMax: 0,
    kiCurrent: 0,
    koScoredAgainst: 0,
    hand,
    piles,
    actives: [null, null],
    bench: [null, null],
    retreatUsedThisTurn: false,
    turnNumber: 0,
    friendlySaiyanKoedThisGame: false,
  });

  const p1State = makePlayerState(p1DeckId, p1HandFinal, p1PilesFinal, p1UserId);
  const p2State = makePlayerState(p2DeckId, p2HandFinal, p2PilesFinal, p2UserId);

  // Set Ki for the first player (turn 1 = 1 Ki)
  const firstPlayerState = firstPlayer === 'p1' ? p1State : p2State;
  firstPlayerState.kiMax = 1;
  firstPlayerState.kiCurrent = 1;
  firstPlayerState.turnNumber = 1;

  return {
    phase: 'draw',
    turnPlayer: firstPlayer,
    turnNumber: 1,
    firstPlayer,
    field: null,
    discard: [],
    players: {
      p1: p1State,
      p2: p2State,
    },
    winner: null,
    log: [],
    firstAttackDone: false,
    pendingPromotions: [],
  };
}

export function makeFighterInstance(cardId: string): FighterInstance {
  const card = getCard(cardId);
  if (card.cardType !== 'hero') throw new Error(`${cardId} is not a hero`);

  const maxHp = card.hp!;
  const oncePerGameUsed: Record<string, boolean> = {};

  // Initialize once-per-game flags
  for (const ab of card.abilities) {
    if (ab.oncePerGame) {
      oncePerGameUsed[ab.key] = false;
    }
  }

  return {
    cardId,
    currentHp: maxHp,
    maxHp,
    equipment: [],
    summoningSick: true,
    hasAttackedThisTurn: false,
    oncePerGameUsed,
    counters: {},
    statuses: [],
  };
}
