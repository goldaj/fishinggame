const assert=require('assert');
const G=require('../app/src/main/assets/v132.js');

assert.strictEqual(G.catalogVersion,'1.3.2');
assert.strictEqual(G.wildDiscoveryChance,.02);
assert.strictEqual(G.creatures.length,100);

const seq=(...values)=>{let i=0;return()=>values[Math.min(i++,values.length-1)]};

const base=G.defaultState();
assert.deepStrictEqual(base.unlocked,[1]);
assert.deepStrictEqual(G.rankEligible(base).map(c=>c.id),[1,2,3,4,5,6],'le rang 1 doit rendre les six premières espèces pêchables');
assert.deepStrictEqual(G.undiscoveredEligible(base).map(c=>c.id),[2,3,4,5,6]);
assert.deepStrictEqual(G.discoveredEligible(base).map(c=>c.id),[1]);

const trash=G.rollCatch(base,seq(.05,.10));
assert(trash.isTrash,'les déchets doivent conserver leur priorité et leur taux 1.3.1');

const known=G.rollCatch(base,seq(.50,.50,.50));
assert.strictEqual(known.id,1,'hors fenêtre de découverte, seule une espèce déjà découverte doit sortir');

const wild=G.rollCatch(base,seq(.50,.01,0));
assert.strictEqual(wild.id,2,'dans la fenêtre de 2%, une espèce du rang encore inconnue doit pouvoir sortir');
assert(!base.unlocked.includes(wild.id));

base.streak=3;
const reward=G.addCatch(base,wild,G.rollWeight(wild,base,()=>.5));
assert.strictEqual(reward.newDiscovery,true,'la première capture sauvage doit être marquée comme découverte');
assert(base.unlocked.includes(2),'la première capture sauvage doit débloquer la carte de collection');
assert.strictEqual(base.caughtById[2],1);
assert(!G.undiscoveredEligible(base).some(c=>c.id===2));

const repeat=G.rollCatch(base,seq(.50,.50,.99));
assert([1,2].includes(repeat.id),'une espèce découverte doit revenir dans le pool normal');

const rank2=G.defaultState();rank2.totalSold=40;
assert.strictEqual(G.rankForSold(rank2.totalSold),2);
const rank2Ids=G.rankEligible(rank2).map(c=>c.id);
for(let id=1;id<=12;id++)assert(rank2Ids.includes(id),`l’espèce ${id} doit être pêchable au rang 2`);
assert(!rank2Ids.includes(13),'une espèce de rang supérieur ne doit pas devenir pêchable trop tôt');

const gacha=G.defaultState();gacha.coins=10000;
const pull=G.pullGacha(gacha,()=>0);
assert.strictEqual(pull.ok,true);
assert(gacha.unlocked.includes(pull.creature.id),'le gacha doit toujours révéler immédiatement une espèce');
assert(!G.undiscoveredEligible(gacha).some(c=>c.id===pull.creature.id),'une espèce trouvée au gacha ne doit plus être exceptionnellement rare');

const migrated=G.normalizeState({unlocked:[1],caughtById:{6:2},inventory:[],upgrades:{cleanup:0}});
assert(migrated.unlocked.includes(6),'une ancienne sauvegarde indiquant une capture doit considérer cette espèce comme découverte');

const wildForGacha=G.defaultState();
const c=G.creatures[1];
G.addCatch(wildForGacha,c,G.rollWeight(c,wildForGacha,()=>.5));
assert(!G.eligibleLocked(wildForGacha).some(x=>x.id===c.id),'une espèce découverte en pêche doit sortir du pool gacha');

console.log('v132 tests: OK');
