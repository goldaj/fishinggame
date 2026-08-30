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
function fish(){return (G.cardPool?G.cardPool():[]).filter(c=>c&&!c.isTrash&&c.id>=1&&c.id<=500)}
function level(s){return Math.max(0,Math.min(5,Math.floor(finite(s&&s.upgrades&&s.upgrades.rareline))))}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(x=>Math.max(0,finite(weight(x))));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[Math.min(items.length-1,Math.floor(clamp01(rand())*items.length))];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}

function validatePlan(){
  const totals=RARITIES.map(()=>0);
  rankQuotas.forEach((row,rank)=>{
    if(row.reduce((a,b)=>a+b,0)!==FISH_PER_RANK)throw new Error(`Le rang ${rank+1} doit contenir exactement ${FISH_PER_RANK} poissons.`);
    row.forEach((n,i)=>totals[i]+=n);
  });
  const actual=RARITIES.map(r=>fish().filter(c=>c.rarity===r).length);
  if(totals.some((n,i)=>n!==actual[i]))throw new Error(`Le plan 2.0.8 ne correspond pas au catalogue: attendu ${totals.join('/')}, catalogue ${actual.join('/')}.`);
}
function assignRankPlan(){
  validatePlan();
  const buckets={};
  RARITIES.forEach(r=>buckets[r]=fish().filter(c=>c.rarity===r).sort((a,b)=>a.id-b.id));
  const cursors=Object.fromEntries(RARITIES.map(r=>[r,0]));
  rankQuotas.forEach((row,rankIndex)=>{
    row.forEach((count,rarityIndex)=>{
      const rarity=RARITIES[rarityIndex],start=cursors[rarity],end=start+count;
      buckets[rarity].slice(start,end).forEach(c=>c.gate=rankIndex+1);
      cursors[rarity]=end;
    });
  });
}
assignRankPlan();

G.upgrades.rareline={
  label:'Leurre sélectif',
  desc:'Favorise les poissons rares pendant la pêche uniquement. Aucun effet sur les boosters.',
  rank:4,
  max:5,
  costs:[1600,3200,6400,12000,22000]
};

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.upgrades=s.upgrades&&typeof s.upgrades==='object'?s.upgrades:{};
  s.upgrades.rareline=level(s);
  s.version=STATE_VERSION;
  return s;
};
const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input||{});
  s.upgrades=s.upgrades&&typeof s.upgrades==='object'?s.upgrades:{};
  s.upgrades.rareline=level(s);
  s.version=STATE_VERSION;
  G.currentState=s;
  return s;
};

function rarelineText(lvl){
  if(!lvl)return'Distribution de rang normale';
  return `Rare +${lvl*12}% · Épique +${lvl*18}% · Légendaire +${lvl*25}% · Mythique +${lvl*35}%`;
}
const previousUpgradeStatus=G.upgradeStatus;
G.upgradeStatus=function(s,key){
  if(key!=='rareline')return previousUpgradeStatus(s,key);
  const cfg=G.upgrades.rareline,lvl=level(s),rank=rankOf(s),maxed=lvl>=cfg.max,cost=maxed?null:cfg.costs[lvl],rankLocked=rank<cfg.rank;
  return{key,label:cfg.label,desc:cfg.desc,level:lvl,max:cfg.max,rankRequired:cfg.rank,cost,current:rarelineText(lvl),next:maxed?'Maximum':rarelineText(lvl+1),canBuy:!maxed&&!rankLocked&&finite(s&&s.coins)>=cost,rankLocked,maxed};
};
const previousBuyUpgrade=G.buyUpgrade;
G.buyUpgrade=function(s,key){
  if(key!=='rareline')return previousBuyUpgrade(s,key);
  const x=G.upgradeStatus(s,key);
  if(x.maxed)return{ok:false,reason:'max',status:x};
  if(x.rankLocked)return{ok:false,reason:'rank',status:x};
  if(finite(s&&s.coins)<x.cost)return{ok:false,reason:'coins',status:x};
  s.coins-=x.cost;s.upgrades.rareline=x.level+1;
  return{ok:true,cost:x.cost,status:G.upgradeStatus(s,key)};
};

function weightedRarityVector(s,rank,availableRarities){
  rank=Math.max(1,Math.min(10,Math.floor(finite(rank,1))));
  const lvl=level(s),base=rankRarityWeights[rank-1];
  const vector=RARITIES.map((rarity,i)=>availableRarities.has(rarity)?base[i]*rarelineFactors[i](lvl):0);
  const total=vector.reduce((a,b)=>a+b,0);
  return total>0?vector.map(x=>x/total):vector;
}
function pickFishFromPool(pool,s,rank,rand=Math.random){
  if(!pool.length)return null;
  const byRarity={};RARITIES.forEach(r=>byRarity[r]=[]);
  pool.forEach(c=>{if(byRarity[c.rarity])byRarity[c.rarity].push(c)});
  const available=new Set(RARITIES.filter(r=>byRarity[r].length));
  const vector=weightedRarityVector(s,rank,available);
  const rarity=pick(RARITIES,(_,i)=>vector[i],rand);
  const candidates=byRarity[rarity]||[];
  if(!candidates.length)return pool[Math.min(pool.length-1,Math.floor(clamp01(rand())*pool.length))];
  return candidates[Math.min(candidates.length-1,Math.floor(clamp01(rand())*candidates.length))];
}

G.fishingRankQuotas=rankQuotas.map(row=>row.slice());
G.fishingRarityTable=rankRarityWeights.map(row=>row.slice());
G.fishPerRank=FISH_PER_RANK;
G.outOfRankFishingChance=OUT_OF_RANK_CHANCE;
G.fishingRankPlan=function(rank){
  rank=Math.max(1,Math.min(10,Math.floor(finite(rank,1))));
  return fish().filter(c=>c.gate===rank);
};
G.fishingRarityOdds=function(s){
  const rank=rankOf(s),pool=fish().filter(c=>c.gate<=rank),available=new Set(pool.map(c=>c.rarity)),vector=weightedRarityVector(s,rank,available);
  return RARITIES.map((rarity,i)=>({rarity,label:G.rarities[rarity].label,p:vector[i]}));
};
G.fishingOutOfRankChance=function(s){return rankOf(s)<10?OUT_OF_RANK_CHANCE:0};
G.fishingAvailability=function(s,c){
  const rank=rankOf(s);
  if(!c)return{fishable:false,known:false,early:false,exceptional:false,rank,normalRank:null,rankGap:0,multiplier:0};
  if(c.isTrash)return{fishable:true,known:G.isKnownInCollection(s,c),early:false,exceptional:false,rank,normalRank:1,rankGap:0,multiplier:1};
  const normalRank=Math.max(1,Math.floor(finite(c.gate,1))),rankGap=Math.max(0,normalRank-rank),known=G.isKnownInCollection(s,c);
  if(!rankGap)return{fishable:true,known,early:false,exceptional:false,rank,normalRank,rankGap:0,multiplier:1};
  return{fishable:false,known,early:false,exceptional:true,rank,normalRank,rankGap,multiplier:0,exceptionalChance:OUT_OF_RANK_CHANCE};
};

G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  if(Array.isArray(G.trashTypes)&&typeof G.trashRate==='function'&&clamp01(rand())<G.trashRate(s)){
    const index=Math.min(G.trashTypes.length-1,Math.floor(clamp01(rand())*G.trashTypes.length));
    return G.trashTypes[index];
  }
  const rank=rankOf(s),all=fish();
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
G.productVersion='2.0.8';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
