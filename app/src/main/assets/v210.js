(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v208.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const STATE_VERSION=11;
const PITY_STEP=.001;
const PITY_MAX=.03;
const PITY_MAX_CATCHES=30;
const rarityOrder=['commune','inhabituelle','rare','epique','legendaire','mythique'];
const purchaseBase=10000;

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
function finiteInt(v){return Math.max(0,Math.floor(finite(v)))}
function clamp01(v){return Math.max(0,Math.min(.999999,finite(v)))}
function rankOf(s){return G.rankForSold(Math.max(0,finite(s&&s.totalSold)))}
function isMissing(s,c){return !!c&&!c.isTrash&&!G.isKnownInCollection(s,c)}
function ensureUnlocked(s,id){
  if(!Array.isArray(s.unlocked))s.unlocked=[];
  if(!s.unlocked.includes(id)){s.unlocked.push(id);s.unlocked.sort((a,b)=>a-b)}
}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map((x,i)=>Math.max(0,finite(weight(x,i))));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[Math.min(items.length-1,Math.floor(clamp01(rand())*items.length))];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}
function pityWeightedPick(s,items,rand=Math.random){
  if(!items.length)return null;
  const odds=typeof G.fishingRarityOdds==='function'?G.fishingRarityOdds(s):[];
  const p=Object.fromEntries(odds.map(x=>[x.rarity,Math.max(0,finite(x.p))]));
  const counts={};items.forEach(c=>counts[c.rarity]=(counts[c.rarity]||0)+1);
  return pick(items,c=>(p[c.rarity]||0)/Math.max(1,counts[c.rarity]||1),rand);
}

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.newCardDryStreak=0;
  s.version=STATE_VERSION;
  return s;
};
const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input||{});
  s.newCardDryStreak=Math.min(PITY_MAX_CATCHES,finiteInt(input&&input.newCardDryStreak!=null?input.newCardDryStreak:s.newCardDryStreak));
  s.version=STATE_VERSION;
  G.currentState=s;
  return s;
};

G.newCardPityStep=PITY_STEP;
G.newCardPityMax=PITY_MAX;
G.newCardPityMaxCatches=PITY_MAX_CATCHES;
G.newCardPityChance=function(s){return Math.min(PITY_MAX,finiteInt(s&&s.newCardDryStreak)*PITY_STEP)};
G.newCardPityStatus=function(s){
  const dry=Math.min(PITY_MAX_CATCHES,finiteInt(s&&s.newCardDryStreak));
  const chance=G.newCardPityChance(s);
  return{dryStreak:dry,chance,max:PITY_MAX,remainingToMax:Math.max(0,PITY_MAX_CATCHES-dry)};
};

const previousRollCatch=G.rollCatch;
G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  const rolled=previousRollCatch(s,rand);
  const chance=G.newCardPityChance(s);
  G.lastNewCardPity={chance,dryStreak:finiteInt(s.newCardDryStreak),triggered:false,replacedId:null,resultId:rolled&&rolled.id||null};
  if(!rolled||rolled.isTrash||G.lastExceptionalCatch||!G.isKnownInCollection(s,rolled)||chance<=0)return rolled;
  const rank=rankOf(s);
  const unknown=(G.cardPool?G.cardPool():[]).filter(c=>c&&!c.isTrash&&c.gate<=rank&&isMissing(s,c));
  if(!unknown.length)return rolled;
  if(clamp01(rand())>=chance)return rolled;
  const forced=pityWeightedPick(s,unknown,rand);
  if(!forced)return rolled;
  G.lastNewCardPity={chance,dryStreak:finiteInt(s.newCardDryStreak),triggered:true,replacedId:rolled.id,resultId:forced.id};
  return forced;
};

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  const wasKnown=!!c&&G.isKnownInCollection(s,c);
  const reward=previousAddCatch(s,c,weightG);
  if(!reward||!c)return reward;
  if(!wasKnown){
    s.newCardDryStreak=0;
    reward.newCardPityReset=true;
  }else{
    s.newCardDryStreak=Math.min(PITY_MAX_CATCHES,finiteInt(s.newCardDryStreak)+1);
    reward.newCardPityReset=false;
  }
  reward.newCardPityChance=G.newCardPityChance(s);
  reward.newCardDryStreak=s.newCardDryStreak;
  return reward;
};

G.cardPurchasePrice=function(cardOrId){
  const c=typeof cardOrId==='object'?cardOrId:G.collectionCardById(cardOrId);
  if(!c||c.isTrash)return null;
  const index=rarityOrder.indexOf(c.rarity);
  return index<0?null:purchaseBase*Math.pow(2,index);
};
G.cardPurchasePrices=Object.fromEntries(rarityOrder.map((rarity,i)=>[rarity,purchaseBase*Math.pow(2,i)]));
G.canPurchaseCard=function(s,cardOrId){
  const c=typeof cardOrId==='object'?cardOrId:G.collectionCardById(cardOrId);
  if(!c)return{ok:false,reason:'card',card:null,cost:null};
  const cost=G.cardPurchasePrice(c);
  if(c.isTrash)return{ok:false,reason:'trash',card:c,cost:null};
  if(G.isKnownInCollection(s,c))return{ok:false,reason:'owned',card:c,cost};
  if(finite(s&&s.coins)<cost)return{ok:false,reason:'coins',card:c,cost};
  return{ok:true,reason:null,card:c,cost};
};
G.buyMissingCard=function(s,cardOrId){
  const status=G.canPurchaseCard(s,cardOrId);
  if(!status.ok)return status;
  const c=status.card,cost=status.cost;
  s.coins=Math.max(0,finite(s.coins)-cost);
  s.cardCopiesById=s.cardCopiesById&&typeof s.cardCopiesById==='object'?s.cardCopiesById:{};
  s.cardObtainedById=s.cardObtainedById&&typeof s.cardObtainedById==='object'?s.cardObtainedById:{};
  s.cardCopiesById[c.id]=Math.max(1,finiteInt(s.cardCopiesById[c.id]));
  s.cardObtainedById[c.id]=Math.max(1,finiteInt(s.cardObtainedById[c.id]));
  ensureUnlocked(s,c.id);
  s.purchasedCardsById=s.purchasedCardsById&&typeof s.purchasedCardsById==='object'?s.purchasedCardsById:{};
  s.purchasedCardsById[c.id]=finiteInt(s.purchasedCardsById[c.id])+1;
  return{ok:true,reason:null,card:c,cost,copies:G.cardCopies(s,c.id),coins:s.coins};
};

G.collectionEconomyVersion='2.0.10';
G.discoveryPityVersion='2.0.10';
G.productVersion='2.0.10';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
