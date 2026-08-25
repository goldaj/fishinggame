const assert=require('assert');
const G=require('../app/src/main/assets/v141.js');

assert.strictEqual(G.releaseVersion,'1.4.1');
assert.strictEqual(G.cardPackCost(G.defaultState()),500);

const s=G.defaultState();
s.coins=1000;
const beforeUnlocked=s.unlocked.slice();
const beforeCaught=JSON.stringify(s.caughtById);
const pack=G.openCardPack(s,()=>.999999);
assert(pack.ok);
assert.strictEqual(pack.cost,500);
assert.strictEqual(s.coins,500);
assert.strictEqual(pack.cards.length,3);
assert.strictEqual(s.inventory.length,3);
assert.deepStrictEqual(s.unlocked,beforeUnlocked);
assert.strictEqual(JSON.stringify(s.caughtById),beforeCaught);

const poor=G.defaultState();
poor.coins=499;
const denied=G.openCardPack(poor,()=>0);
assert.strictEqual(denied.ok,false);
assert.strictEqual(denied.reason,'coins');
assert.strictEqual(denied.cost,500);
assert.strictEqual(poor.coins,499);

console.log('v141 tests: OK');
