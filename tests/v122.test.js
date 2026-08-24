const assert = require('assert');
const G = require('../app/src/main/assets/v122.js');

const order=['commune','inhabituelle','rare','epique','legendaire','mythique'];
const midpoint=r=>(r[0]+r[1])/2;

assert(G);
assert(G.rarities.commune.haptic[0]>=75);
assert(G.rarities.commune.hapticDuration[0]>=24);
for(let i=1;i<order.length;i++){
  const a=G.rarities[order[i-1]].haptic,b=G.rarities[order[i]].haptic;
  assert(midpoint(b)>midpoint(a));
  assert(b[0]<=a[1]);
}
for(const r of order){
  const c=G.creatures.find(x=>x.rarity===r);
  const lo=G.hapticProfile(c,()=>0),hi=G.hapticProfile(c,()=>.999999);
  assert.strictEqual(lo.amplitude,G.rarities[r].haptic[0]);
  assert.strictEqual(hi.amplitude,G.rarities[r].haptic[1]);
  assert.strictEqual(lo.durationMs,G.rarities[r].hapticDuration[0]);
  assert.strictEqual(hi.durationMs,G.rarities[r].hapticDuration[1]);
}

let s=G.defaultState();
s.streak=3;
const coins=s.coins;
G.registerMiss(s,'retracted');
assert.strictEqual(s.streak,0);
assert.strictEqual(s.retractedCasts,1);
assert.strictEqual(s.failedHooks,0);
assert.strictEqual(s.coins,coins);

for(const kind of ['early','late','late-auto','anything-else']){
  s.streak=4;
  const before=s.failedHooks;
  G.registerMiss(s,kind);
  assert.strictEqual(s.streak,0);
  assert.strictEqual(s.failedHooks,before+1);
}

s.streak=0;
const c=G.creatures[0],w=G.rollWeight(c,s,()=>.3);
G.addCatch(s,c,w);
assert.strictEqual(s.streak,1);

console.log('OK - v1.2.2 haptics and strict streak tests passed');
