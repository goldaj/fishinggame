const assert=require('assert');
const G=require('../app/src/main/assets/v150.js');
const order=['commune','inhabituelle','rare','epique','legendaire','mythique'];
const idx=c=>order.indexOf(c.rarity);

assert.strictEqual(G.releaseVersion,'1.5.0');
assert.strictEqual(G.cardPackCost(),500);
assert.strictEqual(G.cardBoosterRules.finalMinRarity,'inhabituelle');
assert.strictEqual(G.cardBoosterRules.rarePityPacks,10);

{
  const s=G.normalizeState({coins:5000,cardCopiesById:{1:3},cardPacksOpened:7,cardsDrawn:21});
  assert.strictEqual(s.version,6,'la sauvegarde doit migrer vers le schéma 6');
  assert.strictEqual(s.cardCopiesById[1],3,'les copies existantes doivent être conservées');
  assert.strictEqual(s.cardPacksOpened,7,'le nombre de boosters existant doit être conservé');
  assert.strictEqual(s.cardRarePity,0,'une ancienne sauvegarde commence avec une protection neutre');
}

{
  const s=G.normalizeState({coins:5000});
  const r=G.openCardPack(s,()=>0);
  assert.ok(r.ok);
  assert.strictEqual(r.cost,500);
  assert.strictEqual(r.cards.length,3);
  assert.ok(idx(r.cards[2].creature)>=1,'la 3e carte doit être Inhabituelle ou mieux');
  assert.strictEqual(r.newCards,2,'avec ce tirage déterministe deux espèces distinctes doivent être nouvelles');
  assert.strictEqual(r.duplicates,1,'le doublon interne au booster doit être compté');
  assert.strictEqual(s.cardRarePity,1,'un booster sans Rare+ doit avancer la protection');
}

{
  const s=G.normalizeState({coins:5000,cardRarePity:9});
  const r=G.openCardPack(s,()=>0);
  assert.ok(r.ok);
  assert.ok(r.cards.some(x=>idx(x.creature)>=2),'le 10e booster au plus tard doit contenir Rare+');
  assert.strictEqual(r.rareProtectionTriggered,true,'la protection doit être signalée lorsqu’elle force la dernière carte');
  assert.strictEqual(s.cardRarePity,0,'une Rare+ doit réinitialiser la protection');
  assert.strictEqual(r.boosterStatus.packsUntilRareGuarantee,10);
}

{
  const s=G.normalizeState({coins:5000,cardRarePity:5});
  const before=G.cardBoosterStatus(s);
  assert.strictEqual(before.packsUntilRareGuarantee,5);
  assert.strictEqual(before.guaranteedNext,false);
  s.cardRarePity=9;
  const due=G.cardBoosterStatus(s);
  assert.strictEqual(due.guaranteedNext,true);
  assert.strictEqual(due.packsUntilRareGuarantee,1);
}

{
  const s=G.normalizeState({coins:499});
  const r=G.openCardPack(s,()=>0);
  assert.strictEqual(r.ok,false);
  assert.strictEqual(r.reason,'coins');
  assert.strictEqual(s.coins,499,'un booster refusé ne doit rien débiter');
}

console.log('v1.5.0 booster/TCG tests passed');
