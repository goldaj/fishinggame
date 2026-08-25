const assert=require('assert');
const G=require('../app/src/main/assets/v160.js');
const order=['commune','inhabituelle','rare','epique','legendaire','mythique'];
const idx=c=>order.indexOf(c.rarity);

assert.strictEqual(G.releaseVersion,'1.6.0');
assert.strictEqual(G.cardPackCost(),800);
assert.strictEqual(G.cardPackSize,5);
assert.strictEqual(G.cardBoosterRules.rarePityPacks,4);
assert.strictEqual(G.cardBoosterRules.iridescentEvery,5);
assert.strictEqual(G.cardBoosterRules.abyssalEvery,15);

{
  const s=G.normalizeState({coins:9000,cardCopiesById:{1:3},cardPacksOpened:7,cardsDrawn:21,cardRarePity:9});
  assert.strictEqual(s.version,7,'la sauvegarde doit migrer vers le schéma 7');
  assert.strictEqual(s.cardCopiesById[1],3,'les copies existantes doivent être conservées');
  assert.strictEqual(s.cardPacksOpened,7,'le nombre de boosters doit être conservé');
  assert.strictEqual(s.cardRarePity,3,'la protection historique doit être bornée au nouveau plafond');
}

{
  const s=G.normalizeState({coins:5000});
  const r=G.openCardPack(s,()=>0);
  assert.ok(r.ok);
  assert.strictEqual(r.cost,800);
  assert.strictEqual(r.cards.length,5);
  assert.ok(idx(r.cards[4].creature)>=1,'la 5e carte standard doit être Inhabituelle ou mieux');
  assert.strictEqual(s.coins,4200);
  assert.strictEqual(s.cardsDrawn,5);
  assert.strictEqual(s.cardPacksOpened,1);
}

{
  const s=G.normalizeState({coins:5000,cardRarePity:3,cardPacksOpened:0});
  const r=G.openCardPack(s,()=>0);
  assert.ok(r.cards.some(x=>idx(x.creature)>=2),'le 4e booster sans Rare+ au plus tard doit contenir Rare+');
  assert.strictEqual(r.rareProtectionTriggered,true);
  assert.strictEqual(s.cardRarePity,0);
}

{
  const s=G.normalizeState({coins:5000,cardPacksOpened:4});
  const p=G.cardBoosterPreview(s);
  assert.strictEqual(p.type,'iridescent');
  const r=G.openCardPack(s,()=>0);
  assert.strictEqual(r.booster.type,'iridescent');
  assert.ok(idx(r.cards[4].creature)>=2,'le booster Irisé doit finir sur Rare+');
  assert.strictEqual(r.specialBooster,true);
}

{
  const s=G.normalizeState({coins:5000,cardPacksOpened:14});
  const p=G.cardBoosterPreview(s);
  assert.strictEqual(p.type,'abyssal');
  const r=G.openCardPack(s,()=>0);
  assert.strictEqual(r.booster.type,'abyssal');
  assert.ok(idx(r.cards[3].creature)>=2,'la 4e carte Abyssale doit être Rare+');
  assert.ok(idx(r.cards[4].creature)>=3,'la 5e carte Abyssale doit être Épique+');
}

{
  const s=G.normalizeState({coins:799});
  const r=G.openCardPack(s,()=>0);
  assert.strictEqual(r.ok,false);
  assert.strictEqual(r.reason,'coins');
  assert.strictEqual(s.coins,799,'un booster refusé ne doit rien débiter');
}

{
  const s=G.normalizeState({coins:5000,cardPacksOpened:10,cardRarePity:2});
  const status=G.cardBoosterStatus(s);
  assert.strictEqual(status.packsUntilRareGuarantee,2);
  assert.strictEqual(status.packsUntilIridescent,5);
  assert.strictEqual(status.packsUntilAbyssal,5);
}

console.log('v1.6.0 premium booster experience tests passed');
