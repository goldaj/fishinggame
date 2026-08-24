const assert = require('assert');
const G = require('../app/src/main/assets/core.js');

assert.strictEqual(G.creatures.length, 100, 'exactly 100 creatures');
assert.deepStrictEqual(G.defaultState().unlocked, [1, 2, 3], 'three starting creatures');
assert(G.creatures.slice(0, 3).every(c => c.rarity === 'commune'), 'starting cards are common');
assert.strictEqual(G.creatures[99].rarity, 'mythique');
assert.strictEqual(G.creatures[99].gate, 10);

const rarityCounts = G.creatures.reduce((acc, c) => {
  acc[c.rarity] = (acc[c.rarity] || 0) + 1;
  return acc;
}, {});
assert.deepStrictEqual(rarityCounts, {
  commune: 40,
  inhabituelle: 25,
  rare: 18,
  epique: 10,
  legendaire: 6,
  mythique: 1
});

let s = G.defaultState();
for (let i = 0; i < 5; i++) {
  const c = G.rollCatch(s, () => 0);
  G.addCatch(s, c);
}
assert.strictEqual(G.inventoryCount(s), 5);
const sell = G.sellAll(s);
assert.strictEqual(sell.count, 5);
assert(s.coins > 0);
assert.strictEqual(s.totalSold, 5);

const expectedRanks = [
  [0, 1], [7, 1], [8, 2], [19, 2], [20, 3], [44, 3], [45, 4],
  [79, 4], [80, 5], [119, 5], [120, 6], [174, 6], [175, 7],
  [239, 7], [240, 8], [324, 8], [325, 9], [419, 9], [420, 10]
];
for (const [sold, rank] of expectedRanks) {
  assert.strictEqual(G.rankForSold(sold), rank, `rank for ${sold} sold`);
}

s = G.defaultState();
s.coins = 10000;
const before = s.unlocked.length;
const r = G.pullGacha(s, () => 0);
assert(r.ok);
assert.strictEqual(s.unlocked.length, before + 1);
assert(![1, 2, 3].includes(r.creature.id));
const firstNew = r.creature.id;
const r2 = G.pullGacha(s, () => 0);
assert(r2.ok);
assert.notStrictEqual(r2.creature.id, firstNew, 'no duplicate gacha unlock');

s = G.defaultState();
s.coins = 100000;
while (G.eligibleLocked(s).length) {
  const x = G.pullGacha(s, () => 0);
  assert(x.ok);
}
assert(G.nextGate(s) > 1, 'gate should block later species');
assert(s.unlocked.every(id => G.creatures[id - 1].gate <= 1), 'rank-1 gacha cannot bypass gates');

s = G.defaultState();
s.coins = 10000;
const unlocked = G.pullGacha(s, () => 0).creature;
const catchableIds = new Set(G.creatures.filter(c => s.unlocked.includes(c.id)).map(c => c.id));
assert(catchableIds.has(unlocked.id));

console.log('OK - core gameplay tests passed');
