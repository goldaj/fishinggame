const assert=require('assert');
const G=require('../app/src/main/assets/v208.js');

assert.ok(G,'2.0.8 core must load');
assert.strictEqual(G.fishingBalanceVersion,'2.0.8');
assert.strictEqual(G.productVersion,'2.0.8');
assert.strictEqual(G.cardPool().length,500);

for(let rank=1;rank<=10;rank++){
  assert.strictEqual(G.fishingRankPlan(rank).length,50,`rank ${rank} must contain exactly 50 fish`);
}
const counts={};
G.cardPool().forEach(c=>counts[c.rarity]=(counts[c.rarity]||0)+1);
assert.deepStrictEqual(counts,{commune:200,inhabituelle:125,rare:90,epique:50,legendaire:30,mythique:5},'rarity totals must remain unchanged');

{
  const s=G.defaultState();s.totalSold=999999;
  const odds=G.fishingRarityOdds(s),myth=odds.find(x=>x.rarity==='mythique');
  assert.ok(myth.p>=.005-1e-9,'mythic max-rank fishing chance must be at least 0.5%');
  assert.ok(myth.p<.01,'mythic max-rank chance must remain below 1% before shop upgrades');
  const before=myth.p;
  s.upgrades.rareline=5;
  const boosted=G.fishingRarityOdds(s).find(x=>x.rarity==='mythique').p;
  assert.ok(boosted>before,'Leurre sélectif must increase mythic fishing odds');
  assert.ok(boosted<.02,'mythics must remain rare even with the shop upgrade maxed');
}

{
  const s=G.defaultState();s.totalSold=999999;
  const boosterBefore=G.cardOdds().map(x=>[x.rarity,x.p]);
  s.upgrades.rareline=5;
  const boosterAfter=G.cardOdds().map(x=>[x.rarity,x.p]);
  assert.deepStrictEqual(boosterAfter,boosterBefore,'fishing rarity upgrade must not alter booster odds');
}

{
  const s=G.defaultState();s.totalSold=0;
  assert.strictEqual(G.fishingOutOfRankChance(s),.0035,'pre-max ranks must have a small explicit out-of-rank chance');
  for(let i=0;i<120;i++){
    const seq=[.999,.999,Math.random(),Math.random()];let j=0;
    const c=G.rollCatch(s,()=>seq[Math.min(j++,seq.length-1)]);
    assert.ok(c.isTrash||c.gate<=1,'ordinary rank-1 catches must stay inside unlocked ranks');
  }
}

{
  const s=G.defaultState();s.totalSold=999999;
  assert.strictEqual(G.fishingOutOfRankChance(s),0,'rank 10 has no future rank to roll');
}

{
  const s=G.defaultState();s.coins=100000;s.totalSold=0;
  const r=G.openCardPack(s,()=>.999999);
  assert.ok(r.ok,'booster must still open');
  assert.strictEqual(r.cards.length,G.cardPackSize,'booster size must stay unchanged');
  assert.ok(r.cards.every(x=>typeof x.fishingUnlockText==='string'),'booster result should explain rank-based fishing without changing the draw');
}

console.log('v2.0.8 fishing balance tests passed');
