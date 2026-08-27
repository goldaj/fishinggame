const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v201.js');

assert.ok(G,'2.0.3 core must load');
assert.strictEqual(G.productVersion,'2.0.3');
assert.strictEqual(G.releaseVersion,'2.0.3');
assert.strictEqual(G.duplicateCardMarketVersion,'2.0.3');

{
  const raw=G.defaultState();
  delete raw.unifiedCardsV201;
  delete raw.cardObtainedById;
  raw.cardCopiesById={1:4};
  const migrated=G.normalizeState(JSON.parse(JSON.stringify(raw)));
  assert.strictEqual(G.cardObtainedTotal(migrated,1),4,'2.0.3 migration must initialize lifetime obtained total from owned copies');
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
const booster170=fs.readFileSync('app/src/main/assets/v170-ui.js','utf8');
const booster171=fs.readFileSync('app/src/main/assets/v171-ui.js','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');
const p200=html.indexOf('<script src="v200.js"></script>');
const p201=html.indexOf('<script src="v201.js"></script>');
const pApp=html.indexOf('<script src="app.js"></script>');
const p200ui=html.indexOf('<script src="v200-ui.js"></script>');
const p201ui=html.indexOf('<script src="v201-ui.js"></script>');
assert.ok(p200>=0&&p201>p200&&pApp>p201,'2.0.3 core must patch 2.0 before app state is normalized');
assert.ok(p201ui>p200ui,'2.0.3 UI cleanup must stay after the existing 2.0 presentation');
assert.ok(ui.includes('card-duplicate-row-v201'),'duplicate cards must render as market rows');
assert.ok(ui.includes('1 exemplaire conservé'),'market UI must preserve the duplicate-selling rule');
assert.ok(ui.includes("hide($('#sub'))"),'fishing phase subtitles must stay hidden');
assert.ok(ui.includes("['cfound','packFound','packQuality','packPity','cardCopiesTotal']"),'collection and booster counters requested for removal must stay hidden without breaking their IDs');
assert.ok(ui.includes("`${capture[1]} capture(s)`"),'card list must keep only the fishing capture count instead of the owned-copy sentence');
assert.ok(ui.includes("/^Cartes possédées$/i"),'card modal owned-copy row must be hidden');
assert.ok(ui.includes("/^Statut$/i"),'fishing result status row must be hidden');

// Booster regression guard: text may be blanked, but the interaction DOM must never be hidden or replaced by the cleanup layer.
for(const selector of ['.gesture-copy','.edge-copy','.swipe-hint','.reveal-card-foot']){
  assert.ok(ui.includes(selector),`cleanup must target ${selector} text explicitly`);
}
assert.ok(ui.includes('blankTextNodes'),'booster copy must be removed by clearing text nodes while preserving elements');
assert.ok(!/['"]#boosterOpening \.gesture-copy['"].*forEach\(hide\)/s.test(ui),'gesture copy container must never be hidden');
assert.ok(!/['"]#boosterOpening \.swipe-hint['"].*forEach\(hide\)/s.test(ui),'swipe hint container must never be hidden');
assert.ok(!/['"]#boosterOpening \.reveal-card-foot['"].*forEach\(hide\)/s.test(ui),'reveal footer container must never be hidden');
assert.ok(ui.includes("opening.querySelector('#tearFallback')"),'only the explicit Ouvrir sans geste fallback may be hidden');
assert.ok(booster170.includes('zone.onpointerdown')&&booster170.includes('zone.onpointermove')&&booster170.includes('zone.onpointerup'),'tear gesture handlers must remain intact');
assert.ok(booster170.includes('shell.onpointerdown')&&booster170.includes('shell.onpointermove')&&booster170.includes('shell.onpointerup'),'card swipe handlers must remain intact');
assert.ok(booster171.includes("dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'"),'tap-to-advance compatibility must remain intact');

assert.ok(/versionCode\s+27/.test(gradle),'Android versionCode must be 27');
assert.ok(/versionName\s+'2\.0\.3'/.test(gradle),'Android versionName must be 2.0.3');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain stable for in-place update');

console.log('v2.0.3 booster-preserving UI cleanup tests passed');
