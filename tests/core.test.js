const assert = require('assert');
const G = require('../app/src/main/assets/core.js');
assert.strictEqual(G.creatures.length, 100);
assert.deepStrictEqual(G.defaultState().unlocked, [1,2,3]);
assert(G.creatures.slice(0,3).every(c => c.rarity === 'commune'));
assert.strictEqual(G.creatures[99].rarity, 'mythique');
assert.strictEqual(G.creatures[99].gate, 10);
const counts = G.creatures.reduce((a,c)=>{a[c.rarity]=(a[c.rarity]||0)+1;return a},{});
assert.deepStrictEqual(counts,{commune:40,inhabituelle:25,rare:18,epique:10,legendaire:6,mythique:1});
let s = G.defaultState();
for(let i=0;i<5;i++){const c=G.rollCatch(s,()=>0);G.addCatch(s,c)}
assert.strictEqual(G.inventoryCount(s),5);
const sale=G.sellAll(s); assert.strictEqual(sale.count,5); assert(s.coins>0); assert.strictEqual(s.totalSold,5);
[[0,1],[7,1],[8,2],[20,3],[45,4],[80,5],[120,6],[175,7],[240,8],[325,9],[420,10]].forEach(([sold,rank])=>assert.strictEqual(G.rankForSold(sold),rank));
s=G.defaultState(); s.coins=10000; const before=s.unlocked.length; const p1=G.pullGacha(s,()=>0); assert(p1.ok); assert.strictEqual(s.unlocked.length,before+1); const p2=G.pullGacha(s,()=>0); assert(p2.ok); assert.notStrictEqual(p1.creature.id,p2.creature.id);
s=G.defaultState(); s.coins=99999; while(G.eligibleLocked(s).length) assert(G.pullGacha(s,()=>0).ok); assert(G.nextGate(s)>1); assert(s.unlocked.every(id=>G.creatures[id-1].gate<=1));
console.log('OK - core gameplay tests passed');
