const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v210.js');

assert.ok(G,'2.0.10 core must load');
assert.strictEqual(G.productVersion,'2.0.10');
assert.strictEqual(G.discoveryPityVersion,'2.0.10');
assert.strictEqual(G.collectionEconomyVersion,'2.0.10');

{
  const s=G.defaultState();
  assert.strictEqual(G.newCardPityChance(s),0);
  s.newCardDryStreak=10;assert.strictEqual(G.newCardPityChance(s),.01);
  s.newCardDryStreak=30;assert.strictEqual(G.newCardPityChance(s),.03);
  s.newCardDryStreak=999;assert.strictEqual(G.newCardPityChance(s),.03,'pity must never exceed 3%');
}

{
  const s=G.defaultState();s.totalSold=0;s.cardCopiesById={};s.cardObtainedById={};s.unlocked=[];s.caughtById={};s.newCardDryStreak=30;
  const rank1=G.fishingRankPlan(1);
  const target=rank1.find(c=>c.rarity==='rare');
  assert.ok(target,'rank 1 must contain a rare target for pity test');
  rank1.filter(c=>c.id!==target.id).forEach(c=>{s.cardCopiesById[c.id]=1;s.cardObtainedById[c.id]=1;s.unlocked.push(c.id)});
  const seq=[.999,.999,0,0,0,0];let i=0;
  const caught=G.rollCatch(s,()=>seq[Math.min(i++,seq.length-1)]);
  assert.strictEqual(caught.id,target.id,'max pity should be able to reroute a duplicate roll to an eligible missing card');
  assert.ok(caught.gate<=1,'pity must never force a future-rank card');
  assert.strictEqual(G.lastNewCardPity.triggered,true);
}

{
  const s=G.defaultState();s.totalSold=0;s.newCardDryStreak=12;
  const c=G.fishingRankPlan(1)[0];
  s.cardCopiesById[c.id]=1;s.cardObtainedById[c.id]=1;if(!s.unlocked.includes(c.id))s.unlocked.push(c.id);
  const reward=G.addCatch(s,c,100);
  assert.ok(reward);
  assert.strictEqual(s.newCardDryStreak,13,'duplicate landed catch increments drought counter');
}

{
  const s=G.defaultState();s.totalSold=0;s.newCardDryStreak=29;s.cardCopiesById={};s.cardObtainedById={};s.unlocked=[];s.caughtById={};
  const c=G.fishingRankPlan(1)[0];
  const reward=G.addCatch(s,c,100);
  assert.ok(reward.collectionNew||reward.firstCard);
  assert.strictEqual(s.newCardDryStreak,0,'landing a new card resets drought counter');
}

{
  const s=G.defaultState();s.coins=99999999;s.newCardDryStreak=17;
  const before=s.newCardDryStreak;
  const r=G.openCardPack(s,()=>.999999);
  assert.ok(r.ok);
  assert.strictEqual(s.newCardDryStreak,before,'boosters must not alter fishing drought counter');
}

{
  assert.deepStrictEqual(G.cardPurchasePrices,{commune:10000,inhabituelle:20000,rare:40000,epique:80000,legendaire:160000,mythique:320000});
  const s=G.defaultState();s.coins=1000000;s.cardCopiesById={};s.cardObtainedById={};s.unlocked=[];s.caughtById={};
  const c=G.cardPool().find(x=>x.rarity==='rare');
  const beforeCaught=Number(s.caughtById[c.id])||0;
  const dryBefore=s.newCardDryStreak=7;
  const r=G.buyMissingCard(s,c.id);
  assert.strictEqual(r.ok,true);
  assert.strictEqual(r.cost,40000);
  assert.strictEqual(G.cardCopies(s,c.id),1);
  assert.strictEqual(G.isKnownInCollection(s,c),true);
  assert.strictEqual(Number(s.caughtById[c.id])||0,beforeCaught,'buying a card must not create a fake fishing capture');
  assert.strictEqual(s.newCardDryStreak,dryBefore,'buying a card must not reset fishing drought');
  assert.strictEqual(G.buyMissingCard(s,c.id).reason,'owned','a known card cannot be bought again');
}

{
  const s=G.defaultState();s.coins=999999;
  const trash=G.collectionCards().find(c=>c.isTrash);
  assert.ok(trash);
  assert.strictEqual(G.cardPurchasePrice(trash),null);
  assert.strictEqual(G.buyMissingCard(s,trash).reason,'trash','trash cards remain fishing-only');
}

{
  const s=G.defaultState();s.coins=9999;s.cardCopiesById={};s.cardObtainedById={};s.unlocked=[];s.caughtById={};
  const common=G.cardPool().find(c=>c.rarity==='commune'&&!G.isKnownInCollection(s,c));
  const r=G.buyMissingCard(s,common);
  assert.strictEqual(r.ok,false);assert.strictEqual(r.reason,'coins');assert.strictEqual(r.cost,10000);
}

{
  const ui=fs.readFileSync('app/src/main/assets/v210-ui.js','utf8');
  const css=fs.readFileSync('app/src/main/assets/v210.css','utf8');
  assert.ok(ui.includes('collectionTopV210'),'collection must expose a scroll-to-top control');
  assert.ok(ui.includes('fullCardHtml'),'collection modal must render a real full card');
  assert.ok(ui.includes('data-buy-card'),'missing card modal must expose a buy action');
  assert.ok(ui.includes("G.releaseVersion='2.0.10'"),'browser UI must publish 2.0.10 after tactile bootstrap');
  assert.ok(!ui.includes('Bonus nouvelle carte'),'discovery pity probability must never be displayed to the player');
  assert.ok(!ui.includes('newCardPityV210'),'discovery pity must have no UI row');
  assert.ok(ui.includes("const visual=known?art(c):'<span class=\"unknown-card-art-v210\""),'unknown collection cards must not render their artwork');
  assert.ok(ui.includes('<h3>${c.name}</h3>'),'unknown card detail can still reveal the species name');
  assert.ok(css.includes('.rarity-edge-v210'),'real cards must keep the rarity edge signal');
  assert.ok(css.includes('.collection-card-preview-v210'),'collection card preview styling must exist');
  assert.ok(css.includes('.unknown-card-art-v210'),'unknown card artwork placeholder styling must exist');
  assert.ok(!css.includes('.new-card-pity-v210'),'removed discovery pity row must not retain presentation CSS');
}

console.log('v2.0.10 discovery pity, collection purchase and UI source tests passed');
