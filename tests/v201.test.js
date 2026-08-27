const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v201.js');

assert.ok(G,'2.0.2 core must load');
assert.strictEqual(G.productVersion,'2.0.2');
assert.strictEqual(G.releaseVersion,'2.0.2');
assert.strictEqual(G.duplicateCardMarketVersion,'2.0.2');

{
  const raw=G.defaultState();
  delete raw.unifiedCardsV201;
  delete raw.cardObtainedById;
  raw.cardCopiesById={1:4};
  const migrated=G.normalizeState(JSON.parse(JSON.stringify(raw)));
  assert.strictEqual(G.cardObtainedTotal(migrated,1),4,'2.0.2 migration must initialize lifetime obtained total from owned copies');
  const again=G.normalizeState(JSON.parse(JSON.stringify(migrated)));
  assert.strictEqual(G.cardObtainedTotal(again,1),4,'lifetime obtained migration must be idempotent');
}

{
  const s=G.defaultState(),c=G.collectionCardById(1);
  s.cardCopiesById[c.id]=4;
  s.cardObtainedById[c.id]=9;
  s.inventory=[];
  s.coins=0;s.totalSold=0;s.totalEarned=0;
  const expected=G.cardDuplicateUnitValue(s,c)*3;
  const r=G.sellAll(s);
  assert.strictEqual(r.duplicateCount,3,'three extra copies must be sold when four copies are owned');
  assert.strictEqual(r.duplicateValue,expected,'duplicate sale must use the duplicate-card market value');
  assert.strictEqual(G.cardCopies(s,c.id),1,'selling duplicates must always preserve exactly one owned copy');
  assert.strictEqual(G.cardObtainedTotal(s,c.id),9,'selling duplicates must never reduce lifetime obtained total');
  assert.strictEqual(s.coins,expected,'duplicate sale value must be credited');
  assert.strictEqual(s.totalSold,3,'duplicate card sales must count toward market rank progression');
}

{
  const s=G.defaultState(),c=G.collectionCardById(1);
  s.cardCopiesById[c.id]=1;s.cardObtainedById[c.id]=5;
  const r=G.sellCardDuplicates(s);
  assert.strictEqual(r.count,0,'the last owned copy must never be sellable');
  assert.strictEqual(G.cardCopies(s,c.id),1,'the collection copy must remain owned');
  assert.strictEqual(G.cardObtainedTotal(s,c.id),5,'historical obtained total remains independent from owned copies');
}

{
  const s=G.defaultState(),c=G.cardPool()[0];
  s.cardCopiesById[c.id]=1;s.cardObtainedById[c.id]=1;
  const beforeCopies=G.cardCopies(s,c.id),beforeTotal=G.cardObtainedTotal(s,c.id);
  G.addCatch(s,c,G.rollWeight(c,s,()=>.5));
  assert.strictEqual(G.cardCopies(s,c.id),beforeCopies+1,'catching a card must still add one owned copy');
  assert.strictEqual(G.cardObtainedTotal(s,c.id),beforeTotal+1,'catching a card must increment lifetime obtained exactly once');
}

{
  const s=G.defaultState();s.coins=100000;
  const before=G.collectionCards().reduce((n,c)=>n+G.cardObtainedTotal(s,c.id),0);
  const r=G.openCardPack(s,()=>.999999);
  assert.ok(r.ok,'booster must still open');
  const after=G.collectionCards().reduce((n,c)=>n+G.cardObtainedTotal(s,c.id),0);
  assert.strictEqual(after-before,G.cardPackSize,'each booster card must increment lifetime obtained exactly once');
}

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const ui=fs.readFileSync('app/src/main/assets/v201-ui.js','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');
const p200=html.indexOf('<script src="v200.js"></script>');
const p201=html.indexOf('<script src="v201.js"></script>');
const pApp=html.indexOf('<script src="app.js"></script>');
const p200ui=html.indexOf('<script src="v200-ui.js"></script>');
const p201ui=html.indexOf('<script src="v201-ui.js"></script>');
assert.ok(p200>=0&&p201>p200&&pApp>p201,'2.0.2 core must patch 2.0 before app state is normalized');
assert.ok(p201ui>p200ui,'2.0.2 UI must patch after the existing 2.0 presentation');
assert.ok(ui.includes('card-duplicate-row-v201'),'duplicate cards must render as market rows');
assert.ok(ui.includes('1 exemplaire conservé'),'market UI must preserve the duplicate-selling rule');
assert.ok(ui.includes("hide($('#sub'))"),'fishing phase subtitles must stay hidden');
assert.ok(ui.includes("['cfound','packFound','packQuality','packPity','cardCopiesTotal']"),'collection and booster counters requested for removal must stay hidden without breaking their IDs');
assert.ok(ui.includes("`${capture[1]} capture(s)`"),'card list must keep only the fishing capture count instead of the owned-copy sentence');
assert.ok(ui.includes("/^Cartes possédées$/i"),'card modal owned-copy row must be hidden');
assert.ok(ui.includes("/^Statut$/i"),'fishing result status row must be hidden');
assert.ok(/versionCode\s+26/.test(gradle),'Android versionCode must be 26');
assert.ok(/versionName\s+'2\.0\.2'/.test(gradle),'Android versionName must be 2.0.2');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain stable for in-place update');

console.log('v2.0.2 UI cleanup and duplicate card market tests passed');
