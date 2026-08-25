const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const G=require('../app/src/main/assets/v140.js');

assert.strictEqual(G.catalogVersion,'1.4.0');
assert.strictEqual(G.totalSpecies,500);
assert.strictEqual(G.creatures.filter(c=>c&&!c.isTrash&&c.id<=500).length,500);
assert.strictEqual(new Set(G.creatures.filter(c=>c&&!c.isTrash&&c.id<=500).map(c=>c.name)).size,500);
assert.strictEqual(G.creatures[0].name,'Gobie');
assert.strictEqual(G.creatures[99].name,'Kraken des marées');

assert.deepStrictEqual(G.rarityCounts,{
  commune:200,
  inhabituelle:125,
  rare:90,
  epique:50,
  legendaire:30,
  mythique:5
});

const realAdded=G.creatures.filter(c=>c.id>=101&&c.id<=430);
assert.strictEqual(realAdded.length,330);
assert(realAdded.every(c=>c.gate>=1&&c.gate<=7));
assert.strictEqual(G.creatures.filter(c=>c.id>=431&&c.id<=470&&c.gate===8).length,40);
assert.strictEqual(G.creatures.filter(c=>c.id>=471&&c.id<=490&&c.gate===9).length,20);
assert.strictEqual(G.creatures.filter(c=>c.id>=491&&c.id<=500&&c.gate===10).length,10);
assert.strictEqual(new Set(G.creatures.filter(c=>c.id<=500).map(c=>c.assetKey)).size,500);
const fantasy=G.creatures.filter(c=>c.id>=471&&c.id<=500);
assert.strictEqual(fantasy.length,30);
assert(fantasy.every(c=>c.assetKind!=='fish'));
const forbiddenFantasyRoots=['kraken','hydre','makara','léviathan','kelpie','aspidochelone','serpent marin','régalec'];
const fantasyNames=fantasy.map(c=>c.name.toLowerCase()).join(' | ');
for(const root of forbiddenFantasyRoots)assert(!fantasyNames.includes(root),`fantasy root reused: ${root}`);

let s=G.defaultState();
assert.strictEqual(s.version,5);
assert.deepStrictEqual(s.cardCopiesById,{});
assert.strictEqual(G.gachaPool(s).length,0);
assert.strictEqual(G.gachaMinRank,8);
assert.strictEqual(G.cardPackCost(s),3000);

s=G.defaultState();s.totalSold=1850;s.coins=50000;
assert.strictEqual(G.rankForSold(s.totalSold),8);
const pool8=G.gachaPool(s);
assert(pool8.length>0);
assert(pool8.every(c=>c.gate===8));
assert.strictEqual(G.gachaCost(s),4000);

const first=pool8[0];
s.unlocked.push(first.id);
const beforeInv=s.inventory.length,beforeStreak=s.streak,beforeCaught=s.totalCaught;
const dup=G.pullGacha(s,()=>0);
assert(dup.ok);
assert(dup.duplicate);
assert.strictEqual(s.inventory.length,beforeInv+1);
assert.strictEqual(s.streak,beforeStreak);
assert.strictEqual(s.totalCaught,beforeCaught);
assert(dup.specimen&&dup.specimen.weightG>0);

let packState=G.defaultState();packState.coins=10000;
const beforeUnlocked=packState.unlocked.slice();
const beforeCaughtMap=JSON.stringify(packState.caughtById);
const pack=G.openCardPack(packState,()=>.999999);
assert(pack.ok);
assert.strictEqual(pack.cards.length,3);
assert.strictEqual(packState.inventory.length,3);
assert.strictEqual(packState.cardPacksOpened,1);
assert.strictEqual(packState.cardsDrawn,3);
assert.deepStrictEqual(packState.unlocked,beforeUnlocked);
assert.strictEqual(JSON.stringify(packState.caughtById),beforeCaughtMap);
const cardId=pack.cards[0].creature.id;
assert.strictEqual(G.cardCopies(packState,cardId),3);
assert.strictEqual(G.isDiscovered(packState,pack.cards[0].creature),false);

const migrated=G.normalizeState({
  version:5,coins:7,unlocked:[1,450],
  inventory:[{id:450,weightG:12345}],
  caughtById:{450:2},bestWeightById:{450:13000},
  cardCopiesById:{499:4},cardPacksOpened:3,cardsDrawn:9,gachaDuplicates:2,
  upgrades:{bait:0,reel:0,keeper:0,broker:0,cleanup:0}
});
assert(migrated.unlocked.includes(450));
assert(migrated.inventory.some(x=>x.id===450));
assert.strictEqual(migrated.caughtById[450],2);
assert.strictEqual(migrated.cardCopiesById[499],4);
assert.strictEqual(migrated.cardPacksOpened,3);
assert.strictEqual(migrated.version,5);

const discoveryState=G.defaultState();
discoveryState.totalSold=0;
const chance=G.wildDiscoveryChanceFor(discoveryState);
assert(chance>=.02&&chance<=.10);
const eligible=G.rankEligible(discoveryState);
assert(eligible.length>1);

const odds=G.cardOdds();
assert(Math.abs(odds.reduce((a,x)=>a+x.p,0)-1)<1e-9);

const ctx={console};
ctx.globalThis=ctx;
vm.createContext(ctx);
for(const file of ['catch-art.js','catch-art-unique.js']){
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../app/src/main/assets',file),'utf8'),ctx,{filename:file});
}
assert(ctx.CatchArt&&typeof ctx.CatchArt.render==='function');
const svgs=G.creatures.filter(c=>c&&!c.isTrash&&c.id<=500).map(c=>ctx.CatchArt.render(c));
assert(svgs.every(x=>typeof x==='string'&&x.startsWith('<svg')));
assert.strictEqual(new Set(svgs).size,500);

console.log('v140 tests: OK');
