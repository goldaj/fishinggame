const assert=require('assert');
const fs=require('fs');
const crypto=require('crypto');
const G=require('../app/src/main/assets/v201.js');

assert.ok(G,'2.0.4 core must load');
assert.strictEqual(G.productVersion,'2.0.4');
assert.strictEqual(G.releaseVersion,'2.0.4');
assert.strictEqual(G.duplicateCardMarketVersion,'2.0.4');

{
  const raw=G.defaultState();
  delete raw.unifiedCardsV201;
  delete raw.cardObtainedById;
  raw.cardCopiesById={1:4};
  const migrated=G.normalizeState(JSON.parse(JSON.stringify(raw)));
  assert.strictEqual(G.cardObtainedTotal(migrated,1),4,'2.0.4 migration must initialize lifetime obtained total from owned copies');
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

const A='app/src/main/assets/';
const html=fs.readFileSync(A+'index.html','utf8');
const core201=fs.readFileSync(A+'v201.js','utf8');
const ui=fs.readFileSync(A+'v201-ui.js','utf8');
const cleanupCss=fs.readFileSync(A+'v204.css','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

function gitBlobSha(path){
  const data=fs.readFileSync(path);
  const header=Buffer.from(`blob ${data.length}\0`);
  return crypto.createHash('sha1').update(header).update(data).digest('hex');
}

// Exact 2.0.1 / validated 1.7.5 tactile engine files. Any byte change is a regression.
const tactileFiles={
  'v160-ui.js':'8ad170b7fa454d772122c4028746f3d0bd1f3dcf',
  'v170-ui.js':'2d8dc379d24a07be5612c2930caff1746ba88b2f',
  'v171-ui.js':'522d639fb6f1218dd76b1f6ee9312ae46d96f914',
  'v174.js':'5c2114d50b0cbebecc983d4d46bbf2ccf1b6603f',
  'v174-ui.js':'60f4876afec863fd27c86c667160014da6451064',
  'v175.js':'c3db1a4b08a2f3220e34164fa9c45cea6c5bcef4',
  'v175-ui.js':'31985e541b2cedaa89c68e1e3b4df2dafdd760a1'
};
for(const [name,sha] of Object.entries(tactileFiles)){
  assert.strictEqual(gitBlobSha(A+name),sha,`${name} must remain byte-identical to the validated 2.0.1 tactile runtime`);
}

// Exact runtime ordering needed to avoid the legacy button-based booster.
const order=['v160-ui.js','v170-ui.js','v171-ui.js','v174.js','v174-ui.js','v175.js','v175-ui.js','v180-ui.js','v190-ui.js','v200-ui.js','v201-ui.js'];
let last=-1;
for(const name of order){
  const pos=html.indexOf(`<script src="${name}"></script>`);
  assert.ok(pos>last,`${name} must keep the validated 2.0.1 runtime order`);
  last=pos;
}
assert.ok(core201.includes("G.releaseVersion=isNode?'2.0.4':'1.7.0'"),'browser must bootstrap the validated tactile 1.7.0 UI path');
assert.ok(fs.readFileSync(A+'v174.js','utf8').includes("G.releaseVersion='1.7.4'"),'v174 must advance the tactile runtime to 1.7.4');
assert.ok(fs.readFileSync(A+'v175.js','utf8').includes("G.releaseVersion='1.7.5'"),'v175 must advance the tactile runtime to 1.7.5');
assert.ok(ui.includes("G.releaseVersion='2.0.4'"),'final UI layer must publish 2.0.4 only after tactile initialization');

// The cleanup layer must never mutate the booster DOM again.
for(const forbidden of ['boosterOpening','tearFallback','tearZone','gesture-copy','edge-copy','swipe-hint','reveal-card-foot','blankTextNodes']){
  assert.ok(!ui.includes(forbidden),`v201-ui.js must not touch booster runtime token ${forbidden}`);
}
assert.ok(html.includes('<link rel="stylesheet" href="v204.css">'),'copy-only CSS layer must be loaded');
assert.ok(cleanupCss.includes('#boosterOpening .swipe-hint'),'requested booster hints must be visually hidden only by CSS');
assert.ok(cleanupCss.includes('visibility: hidden !important'),'booster copy removal must preserve historical layout geometry');
assert.ok(cleanupCss.includes('#boosterOpening #tearFallback'),'the explicit open-without-gesture fallback must be visually removed without deleting its DOM node');
assert.ok(cleanupCss.includes('pointer-events: none !important'),'hidden fallback must not steal touches');

// Requested non-booster copy cleanup.
assert.ok(ui.includes("`${capture[1]} capture(s)`"),'card list must keep only fishing capture count');
assert.ok(ui.includes("/^Cartes possédées$/i"),'card modal owned-copy row must be hidden');
assert.ok(ui.includes("/^Statut$/i"),'fishing result status row must be hidden');
assert.ok(ui.includes('Les spécimens remontés à la pêche apparaissent ici'),'empty market explanatory copy must be hidden');
assert.ok(cleanupCss.includes('#fish #sub'),'all fishing phase subtitles must stay hidden');
assert.ok(cleanupCss.includes('#market .section-head p'),'market explanatory copy must stay hidden');
assert.ok(cleanupCss.includes('#collection .section-head h2'),'Collection heading requested for removal must stay hidden');
assert.ok(cleanupCss.includes('#packOdds small'),'booster trash/explanatory small print must stay hidden');

assert.ok(/versionCode\s+28/.test(gradle),'Android versionCode must be 28');
assert.ok(/versionName\s+'2\.0\.4'/.test(gradle),'Android versionName must be 2.0.4');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain stable for in-place update');

console.log('v2.0.4 exact tactile rollback + copy-only cleanup tests passed');
