(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v201.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const STATE_VERSION=10;
const RARITIES=['commune','inhabituelle','rare','epique','legendaire','mythique'];
const FISH_PER_RANK=50;
const OUT_OF_RANK_CHANCE=.0035;
const futureRankDecay=.18;
const rankQuotas=[
  [40,8,2,0,0,0],
  [35,10,4,1,0,0],
  [30,12,6,2,0,0],
  [25,14,8,3,0,0],
  [20,15,9,5,1,0],
  [18,15,10,5,2,0],
  [15,14,11,7,3,0],
  [10,12,13,9,5,1],
  [5,10,14,9,10,2],
  [2,15,13,9,9,2]
];
const rankRarityWeights=[
  [.82,.15,.03,0,0,0],
  [.75,.19,.05,.01,0,0],
  [.68,.22,.08,.02,0,0],
  [.60,.25,.11,.035,.005,0],
  [.53,.27,.14,.05,.01,0],
  [.45,.29,.17,.07,.02,0],
  [.38,.30,.20,.09,.03,0],
  [.32,.29,.22,.12,.0485,.0015],
  [.27,.27,.24,.14,.077,.003],
  [.245,.275,.25,.15,.075,.005]
];
const rarelineFactors=[
  lvl=>1,
  lvl=>1+.02*lvl,
  lvl=>1+.12*lvl,
  lvl=>1+.18*lvl,
  lvl=>1+.25*lvl,
  lvl=>1+.35*lvl
];

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
function clamp01(v){return Math.max(0,Math.min(.999999,finite(v)))}
function rankOf(s){return G.rankForSold(Math.max(0,finite(s&&s.totalSold)))}
function upgradeLevel(s,key){const cfg=G.upgrades&&G.upgrades[key];return cfg?Math.max(0,Math.min(cfg.max,Math.floor(finite(s&&s.upgrades&&s.upgrades[key])))):0}
function rarityIndex(c){return Math.max(0,RARITIES.indexOf(c&&c.rarity))}
function fishList(){return (G.cardPool?G.cardPool():[]).filter(c=>c&&!c.isTrash).slice(0,500)}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(x=>Math.max(0,finite(weight(x))));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[Math.min(items.length-1,Math.floor(clamp01(rand())*items.length))];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}

function buildRankPlan(){
  const byRarity=Object.fromEntries(RARITIES.map(r=>[r,fishList().filter(c=>c.rarity===r)]));
  const used=new Set(),plan=[];
  for(let rank=1;rank<=10;rank++){
    const row=[];
    rankQuotas[rank-1].forEach((count,ri)=>{
      const pool=byRarity[RARITIES[ri]].filter(c=>!used.has(c.id));
      for(let i=0;i<count;i++){
        const c=pool[i];if(!c)throw new Error(`Quota de rang impossible pour ${RARITIES[ri]} au rang ${rank}`);
        used.add(c.id);row.push(c);
      }
    });
    if(row.length!==FISH_PER_RANK)throw new Error(`Le rang ${rank} doit contenir ${FISH_PER_RANK} espèces.`);
    row.forEach(c=>c.gate=rank);
    plan.push(row);
  }
  if(used.size!==500)throw new Error('Les 500 poissons doivent être distribués sur les 10 rangs.');
  return plan;
}
const rankPlan=buildRankPlan();

G.fishingRankPlan=rank=>rankPlan[Math.max(1,Math.min(10,Math.floor(finite(rank,1))))-1].slice();
G.fishingRankForCard=function(cardOrId){
  const id=typeof cardOrId==='object'?cardOrId&&cardOrId.id:Number(cardOrId);
  for(let i=0;i<rankPlan.length;i++)if(rankPlan[i].some(c=>c.id===id))return i+1;
  return null;
};

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.version=Math.max(STATE_VERSION,Math.floor(finite(s.version)));
  s.upgrades=s.upgrades&&typeof s.upgrades==='object'?s.upgrades:{};
  if(!Number.isFinite(Number(s.upgrades.rareline)))s.upgrades.rareline=0;
  return s;
};
const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input||{});
  s.upgrades=s.upgrades&&typeof s.upgrades==='object'?s.upgrades:{};
  s.upgrades.rareline=Math.max(0,Math.min(5,Math.floor(finite(s.upgrades.rareline))));
  s.version=Math.max(STATE_VERSION,Math.floor(finite(s.version)));
  G.currentState=s;return s;
};

G.upgrades.rareline={
  label:'Leurre sélectif',
  desc:'Augmente les chances de poissons rares, épiques, légendaires et mythiques à la pêche uniquement. Les boosters ne sont jamais modifiés.',
  rank:4,max:5,costs:[2200,4800,9500,18500,35000]
};
const previousUpgradeStatus=G.upgradeStatus;
G.upgradeStatus=function(s,key){
  if(key!=='rareline')return previousUpgradeStatus(s,key);
  const cfg=G.upgrades.rareline,level=upgradeLevel(s,key),rank=rankOf(s),maxed=level>=cfg.max,cost=maxed?null:cfg.costs[level],rankLocked=rank<cfg.rank;
  const text=lvl=>lvl?`Raretés de pêche renforcées · niveau ${lvl}`:'Raretés de pêche normales';
  return{key,label:cfg.label,desc:cfg.desc,level,max:cfg.max,rankRequired:cfg.rank,cost,current:text(level),next:maxed?'Maximum':text(level+1),canBuy:!maxed&&!rankLocked&&finite(s.coins)>=cost,rankLocked,maxed};
};
const previousBuyUpgrade=G.buyUpgrade;
G.buyUpgrade=function(s,key){
  if(key!=='rareline')return previousBuyUpgrade(s,key);
  const x=G.upgradeStatus(s,key);if(x.maxed)return{ok:false,reason:'max',status:x};if(x.rankLocked)return{ok:false,reason:'rank',status:x};if(finite(s.coins)<x.cost)return{ok:false,reason:'coins',status:x};
  s.coins-=x.cost;s.upgrades.rareline=x.level+1;return{ok:true,cost:x.cost,status:G.upgradeStatus(s,key)};
};

function boostedRarityWeights(s,rank){
  const level=upgradeLevel(s,'rareline'),base=rankRarityWeights[rank-1].slice();
  const boosted=base.map((w,i)=>w*rarelineFactors[i](level));
  const total=boosted.reduce((a,b)=>a+b,0)||1;
  return boosted.map(w=>w/total);
}
G.fishingRarityOdds=function(s){
  const rank=rankOf(s),weights=boostedRarityWeights(s,rank);
  return RARITIES.map((r,i)=>({rarity:r,label:G.rarities[r].label,p:weights[i]}));
};
G.fishingOutOfRankChance=s=>rankOf(s)>=10?0:OUT_OF_RANK_CHANCE;
G.fishingOutOfRankBaseChance=OUT_OF_RANK_CHANCE;
G.fishingRarityWeightsByRank=rankRarityWeights.map(x=>x.slice());

function pickRarity(s,rank,pool,rand){
  const available=new Set(pool.map(c=>c.rarity));
  const weights=boostedRarityWeights(s,rank);
  const entries=RARITIES.map((rarity,i)=>({rarity,index:i,weight:available.has(rarity)?weights[i]:0})).filter(x=>x.weight>0);
  return pick(entries,x=>x.weight,rand)?.rarity||pool[0]?.rarity||'commune';
}
function pickFishFromPool(pool,s,rank,rand){
  if(!pool.length)return null;
  const rarity=pickRarity(s,rank,pool,rand),same=pool.filter(c=>c.rarity===rarity);
  return same[Math.min(same.length-1,Math.floor(clamp01(rand())*same.length))]||pool[0];
}

G.rankEligible=function(s){const rank=rankOf(s);return fishList().filter(c=>c.gate<=rank)};
G.undiscoveredEligible=s=>G.rankEligible(s).filter(c=>!G.isKnownInCollection(s,c));
G.discoveredEligible=s=>G.rankEligible(s).filter(c=>G.isKnownInCollection(s,c));
G.fishingAvailability=function(s,c){
  if(!c)return{fishable:false,known:false,early:false,rank:rankOf(s),normalRank:null,rankGap:0,multiplier:0};
  if(c.isTrash)return{fishable:true,known:G.isKnownInCollection(s,c),early:false,rank:rankOf(s),normalRank:1,rankGap:0,multiplier:1};
  const rank=rankOf(s),normalRank=Math.max(1,Math.min(10,Math.floor(finite(c.gate,1)))),rankGap=Math.max(0,normalRank-rank);
  return{fishable:normalRank<=rank,known:G.isKnownInCollection(s,c),early:false,exceptional:rankGap>0,rank,normalRank,rankGap,multiplier:normalRank<=rank?1:0};
};

G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  if(Array.isArray(G.trashTypes)&&typeof G.trashRate==='function'&&clamp01(rand())<G.trashRate(s)){
    const index=Math.min(G.trashTypes.length-1,Math.floor(clamp01(rand())*G.trashTypes.length));return G.trashTypes[index];
  }
  const rank=rankOf(s),all=fishList();
  if(rank<10&&clamp01(rand())<OUT_OF_RANK_CHANCE){
    const futureRanks=[];
    for(let r=rank+1;r<=10;r++)if(all.some(c=>c.gate===r))futureRanks.push(r);
    const target=pick(futureRanks,r=>Math.pow(futureRankDecay,r-rank-1),rand);
    const exceptional=all.filter(c=>c.gate===target);
    const caught=pickFishFromPool(exceptional,s,target,rand);
    if(caught){G.lastExceptionalCatch={id:caught.id,rank:target,currentRank:rank};return caught}
  }
  G.lastExceptionalCatch=null;
  const normal=all.filter(c=>c.gate<=rank);
  return pickFishFromPool(normal,s,rank,rand);
};

const previousOpenCardPack=G.openCardPack;
G.openCardPack=function(s,rand=Math.random){
  const result=previousOpenCardPack(s,rand);
  if(!result||!result.ok)return result;
  const rank=rankOf(s);
  result.cards.forEach(x=>{
    const c=x&&x.creature;if(!c)return;
    const rankGap=Math.max(0,Math.floor(finite(c.gate,1))-rank);
    x.earlyUnlock=false;
    x.rankGap=rankGap;
    x.normalRank=c.gate;
    x.fishingMultiplier=rankGap?0:1;
    x.fishingUnlockText=rankGap?`Pêche normale au rang ${c.gate} · chance hors-rang exceptionnelle avant`:'Pêchable au rang actuel';
  });
  return result;
};

G.fishingBalanceVersion='2.0.8';
G.productVersion='2.0.9';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
