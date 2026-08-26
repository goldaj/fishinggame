const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v200.js');

assert.ok(G,'2.0.0 core must load');
assert.strictEqual(G.productVersion,'2.0.0');
assert.strictEqual(G.unifiedCardsVersion,'2.0.0');
assert.strictEqual(G.totalCollectionCards,504,'collection must contain 500 fish cards plus 4 trash cards');
assert.strictEqual(G.collectionCards().length,504,'collection list must expose all 504 cards');
assert.strictEqual(G.trashTypes.length,4,'four trash cards must exist');
assert.ok(G.trashTypes.every(t=>t.rarity==='commune'),'all trash cards must use common card rarity');
assert.strictEqual(G.cardPool().length,500,'booster pool must contain only the 500 fish cards');
assert.ok(G.cardPool().every(c=>!c.isTrash),'trash cards must never appear in boosters');

{
  const s=G.defaultState();
  s.coins=100000;
  const inventoryBefore=s.inventory.length;
  const r=G.openCardPack(s,()=>.999999);
  assert.ok(r.ok,'booster must open with enough coins');
  assert.strictEqual(r.cards.length,G.cardPackSize,'booster size must stay unchanged');
  assert.strictEqual(s.inventory.length,inventoryBefore,'opening a booster must not create sellable specimens');
  assert.ok(r.cards.every(x=>G.cardCopies(s,x.creature.id)>0),'every drawn card must exist in the collection');
  assert.ok(r.cards.every(x=>G.fishingAvailability(s,x.creature).fishable),'every drawn fish card must become fishable immediately');
  assert.ok(r.cards.some(x=>x.earlyUnlock),'a low-rank deterministic pack should demonstrate early-rank unlock behavior');
  const early=r.cards.find(x=>x.earlyUnlock);
  assert.ok(early.fishingMultiplier<1,'an early-unlocked fish must be rarer than at its normal rank');
}

{
  const s=G.defaultState();
  const c=G.cardPool()[0];
  const before=G.cardCopies(s,c.id);
  const weight=G.rollWeight(c,s,()=>.5);
  const reward=G.addCatch(s,c,weight);
  assert.strictEqual(G.cardCopies(s,c.id),before+1,'catching a fish must add one copy of its collection card');
  assert.strictEqual(reward.cardCopy,before+1,'catch reward must expose the unified card copy count');
  assert.ok(G.isKnownInCollection(s,c),'caught fish must be known in the same collection as booster cards');
}

{
  const s=G.defaultState();
  const t=G.trashTypes[0];
  const before=G.cardCopies(s,t.id);
  const reward=G.addCatch(s,t,t.weightG);
  assert.ok(reward.trash,'trash catch path must remain a trash catch');
  assert.strictEqual(G.cardCopies(s,t.id),before+1,'catching trash must add its common collection card');
  assert.strictEqual(s.trashCaughtById[t.id],1,'trash catch identity must be tracked for collection migration and stats');
  assert.ok(G.isKnownInCollection(s,t),'caught trash card must become known');
}

{
  const s=G.defaultState();
  const rank=G.rankForSold(s.totalSold);
  const c=G.cardPool().find(x=>x.gate>rank);
  assert.ok(c,'catalog must contain a fish above starting rank');
  assert.strictEqual(G.fishingAvailability(s,c).fishable,false,'unknown fish above current rank must stay unavailable');
  s.cardCopiesById[c.id]=1;
  if(!s.unlocked.includes(c.id))s.unlocked.push(c.id);
  const a=G.fishingAvailability(s,c);
  assert.ok(a.fishable&&a.early,'owning the card must unlock fishing before normal rank');
  assert.ok(a.multiplier>0&&a.multiplier<1,'early fishing must be possible but rarer');
  assert.ok(G.earlyRankFishingMultiplier(2)<G.earlyRankFishingMultiplier(1),'each additional missing rank must further reduce encounter weight');
}

{
  const raw=G.defaultState();
  delete raw.unifiedCardsV200;
  raw.cardCopiesById={1:2};
  raw.caughtById={1:3,2:1};
  raw.unlocked=[1,2,20];
  raw.inventory=[{id:G.trashTypes[0].id,weightG:G.trashTypes[0].weightG,trash:true}];
  const migrated=G.normalizeState(JSON.parse(JSON.stringify(raw)));
  assert.ok(G.cardCopies(migrated,1)>=5,'migration must merge historical booster copies and actual catches');
  assert.ok(G.cardCopies(migrated,2)>=1,'historically caught fish must become collection cards');
  assert.ok(G.cardCopies(migrated,20)>=1,'historical gacha/unlocked species must be preserved as known cards');
  assert.ok(G.cardCopies(migrated,G.trashTypes[0].id)>=1,'identifiable trash still in inventory must migrate to its trash card');
  const snapshot=JSON.stringify(migrated.cardCopiesById);
  const migratedAgain=G.normalizeState(JSON.parse(JSON.stringify(migrated)));
  assert.strictEqual(JSON.stringify(migratedAgain.cardCopiesById),snapshot,'2.0 migration must be idempotent across subsequent launches');
}

assert.deepStrictEqual(G.gachaPool(),[],'gacha pool must be empty in 2.0');
assert.strictEqual(G.gachaCost(),0,'removed gacha must have no cost');
assert.strictEqual(G.pullGacha().ok,false,'removed gacha must not be callable as gameplay');
assert.strictEqual(G.pullGacha().reason,'removed');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const app=fs.readFileSync('app/src/main/assets/app.js','utf8');
const ui=fs.readFileSync('app/src/main/assets/v200-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v200.css','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(html.includes('href="v200.css"')&&html.includes('<script src="v200.js"></script>')&&html.includes('<script src="v200-ui.js"></script>'),'2.0 assets must load');
assert.ok(!html.includes('id="gacha"'),'gacha screen must be removed from HTML');
assert.ok(!app.includes('function gacha(')&&!app.includes('pullGacha('),'gacha runtime and click path must be removed from app.js');
assert.ok(app.includes('G.totalCollectionCards'),'main UI must render the 504-card collection total');
assert.ok(app.includes('G.collectionCards()'),'main UI must render fish and trash through one collection source');
assert.ok(ui.includes('fishing-trash-card-v200')&&ui.includes('DÉCHET'),'caught trash must use the same reveal-card form as collection cards');
assert.ok(css.includes('.fishing-trash-card-v200'),'2.0 must style trash-card presentation without a separate non-card result shape');
assert.ok(/versionCode\s+24/.test(gradle),'Android versionCode must be 24');
assert.ok(/versionName\s+'2\.0\.0'/.test(gradle),'Android versionName must be 2.0.0');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain stable for in-place update');

console.log('v2.0.0 unified Fishing Cards collection tests passed');
