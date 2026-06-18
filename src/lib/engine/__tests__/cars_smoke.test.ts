import { createInitialState, applyIntent } from '..';
import { getCard, DECKS } from '../cards';
import { legalMoves as getLegalMoves } from '../legalMoves';

describe('cars faction smoke test', () => {
  it('catalog resolves', () => {
    const deck = DECKS.cars;
    expect(deck.heroes.length).toBe(10);
    expect(deck.items.length).toBe(8);
    expect(deck.fields.length).toBe(2);
    for (const id of [...deck.heroes, ...deck.items, ...deck.fields]) {
      expect(() => getCard(id)).not.toThrow();
    }
    expect(getCard(deck.ultimate).isUltimateHero).toBe(true);
  });

  it('initializes a game with the cars deck on both sides without hanging', () => {
    const s1 = createInitialState('cars', 'saiyan', 'p1');
    expect(s1.players.p1.deck).toBe('cars');
    const s2 = createInitialState('android', 'cars', 'p2');
    expect(s2.players.p2.deck).toBe('cars');
  });

  it('plays through several legal moves without throwing', () => {
    let s = createInitialState('cars', 'frieza_force', 'p1');
    for (let i = 0; i < 12 && !s.winner; i++) {
      const moves = getLegalMoves(s, s.turnPlayer);
      if (moves.length === 0) break;
      const move = moves[0];
      s = applyIntent(s, move);
    }
    expect(s).toBeDefined();
  });
});
