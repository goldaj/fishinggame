const assert=require('assert');
const G=require('../app/src/main/assets/v131.js');
require('../app/src/main/assets/catch-art.js');
require('../app/src/main/assets/catch-art-unique.js');
require('../app/src/main/assets/trash-art.js');
const Art=globalThis.CatchArt;

assert.strictEqual(G.catalogVersion,'1.3.1');
assert.strictEqual(G.creatures.length,100,'les déchets ne doivent pas entrer dans la collection');
assert.strictEqual(G.trashTypes.length,4);
assert.deepStrictEqual(G.trashTypes.map(x=>x.name),['Botte trouée','Boîte de conserve rouillée','Bouteille vide','Vieux pneu']);
assert.deepStrictEqual(G.trashRates,[.10,.07,.05,.03,.02,.01]);
assert.strictEqual(G.trashRate(G.defaultState()),.10);
const clean=G.defaultState();clean.upgrades.cleanup=5;assert.strictEqual(G.trashRate(clean),.01);
assert.strictEqual(G.upgradeStatus(clean,'cleanup').current,'1% de déchets');

const seq=(...values)=>{let i=0;return()=>values[Math.min(i++,values.length-1)]};
const s=G.defaultState();
const trash=G.rollCatch(s,seq(.05,.10));
assert(trash.isTrash,'5% doit tomber dans la zone déchets au taux de base 10%');
assert.strictEqual(trash.name,'Botte trouée');
const fish=G.rollCatch(s,seq(.50,.50));
assert(!fish.isTrash,'50% ne doit pas produire un déchet');

const common=G.creatures.find(c=>c.rarity==='commune');
const tt=G.fishingTiming(trash,s,()=>.5),ct=G.fishingTiming(common,s,()=>.5);
assert.deepStrictEqual(tt,ct,'les timings d’un déchet doivent être exactement ceux d’un commun à RNG identique');
assert.strictEqual(trash.rarity,'commune');
assert.strictEqual(trash.difficulty,common.difficulty);

const renderTrash=G.trashTypes.map(c=>Art.render(c));
assert(renderTrash.every(x=>/^<svg/.test(x)&&x.includes('catch-trash')));
assert.strictEqual(new Set(renderTrash).size,4,'les quatre déchets doivent avoir quatre pictogrammes distincts');

const state=G.defaultState();state.streak=7;state.totalSold=12;state.coins=0;
const reward=G.addCatch(state,trash,trash.weightG);
assert.strictEqual(reward.trash,true);
assert.strictEqual(reward.value,1);
assert.strictEqual(state.streak,0,'un déchet doit casser la série');
assert.strictEqual(state.totalCaught,0,'un déchet ne compte pas comme poisson capturé');
assert.strictEqual(state.totalTrashCaught,1);
assert.strictEqual(state.inventory.length,1);
assert.strictEqual(G.itemValue(state,state.inventory[0]),1,'un déchet vaut toujours exactement 1 pièce');

state.upgrades.broker=5;
assert.strictEqual(G.itemValue(state,state.inventory[0]),1,'la licence du marché ne doit pas augmenter la valeur des déchets');
const sold=G.sellAll(state);
assert.strictEqual(sold.value,1);
assert.strictEqual(sold.trashCount,1);
assert.strictEqual(sold.fishCount,0);
assert.strictEqual(state.coins,1);
assert.strictEqual(state.totalSold,12,'vendre un déchet ne doit pas faire progresser le rang');

const saved=G.normalizeState({upgrades:{cleanup:3},inventory:[{id:1004,weightG:1,trash:true}],totalTrashCaught:9});
assert.strictEqual(saved.upgrades.cleanup,3);
assert.strictEqual(saved.inventory.length,1);
assert.strictEqual(saved.inventory[0].id,1004);
assert.strictEqual(saved.totalTrashCaught,9);

console.log('v131 tests: OK');
