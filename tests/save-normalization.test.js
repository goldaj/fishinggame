const assert = require('assert');
const G = require('../app/src/main/assets/core.js');

const legacy = G.normalizeState({
  unlocked: ['1', '2', 2, 999, 'oops'],
  coins: '150', totalSold: '40', totalEarned: '-8',
  streak: '-3', gachaPulls: 'not-a-number',
  upgrades: { bait: '2' }
});
assert.deepStrictEqual(legacy.unlocked, [1, 2]);
assert.strictEqual(legacy.coins, 150);
assert.strictEqual(legacy.totalSold, 40);
assert.strictEqual(legacy.totalEarned, 0);
assert.strictEqual(legacy.streak, 0);
assert.strictEqual(legacy.gachaPulls, 0);
assert.strictEqual(legacy.upgrades.bait, 2);
assert(G.catchable === undefined || !G.catchable); // internal helper stays private

const s = G.normalizeState({coins: '-300', unlocked: [1, '3']});
assert.strictEqual(s.coins, 0);
assert.deepStrictEqual(s.unlocked, [1, 3]);
G.addCatch(s, G.creatures[0], G.rollWeight(G.creatures[0], s, () => 0.5));
assert.strictEqual(typeof s.coins, 'number');
console.log('OK - legacy save normalization');
