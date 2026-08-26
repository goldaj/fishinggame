(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v200.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const STATE_VERSION=9;
function finiteInt(v){return Math.max(0,Math.floor(Number(v)||0))}
function ensureTotals(s,raw){
  const incoming=raw&&raw.cardObtainedById&&typeof raw.cardObtainedById==='object'?raw.cardObtainedById:{};
  const current=s&&s.cardObtainedById&&typeof s.cardObtainedById==='object'?s.cardObtainedById:{};
  const totals={};
  (G.collectionCards?G.collectionCards():[]).forEach(c=>{
    const total=Math.max(finiteInt(incoming[c.id]),finiteInt(current[c.id]),finiteInt(G.cardCopies(s,c.id)));
    if(total)totals[c.id]=total;
  });
  s.cardObtainedById=totals;
  s.unifiedCardsV201=1;
  s.version=STATE_VERSION;
  return s;
}

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.cardObtainedById={};
  s.unifiedCardsV201=1;
  s.version=STATE_VERSION;
  return s;
};

const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const raw=input||{};
  const s=previousNormalizeState(raw);
  ensureTotals(s,raw);
  G.currentState=s;
  return s;
};

G.cardObtainedTotal=function(s,id){
  const total=finiteInt(s&&s.cardObtainedById&&s.cardObtainedById[id]);
  return Math.max(total,finiteInt(G.cardCopies(s,id)));
};
G.cardDuplicateCount=(s,id)=>Math.max(0,finiteInt(G.cardCopies(s,id))-1);
G.cardDuplicateUnitValue=function(s,cardOrId){
  const c=typeof cardOrId==='object'?cardOrId:G.collectionCardById(cardOrId);
  if(!c)return 0;
  const base=Math.max(1,finiteInt(c.value)||1);
  const broker=Math.max(0,Math.min(5,finiteInt(s&&s.upgrades&&s.upgrades.broker)));
  return Math.round(base*(1+.02*broker));
};
G.cardDuplicateRows=function(s){
  return (G.collectionCards?G.collectionCards():[]).map(c=>{
    const count=G.cardDuplicateCount(s,c.id);
    if(!count)return null;
    const unitValue=G.cardDuplicateUnitValue(s,c),intrinsicUnit=Math.max(1,finiteInt(c.value)||1);
    return{id:c.id,creature:c,count,unitValue,value:unitValue*count,intrinsic:intrinsicUnit*count};
  }).filter(Boolean);
};
G.cardDuplicateCountTotal=s=>G.cardDuplicateRows(s).reduce((n,row)=>n+row.count,0);
G.cardDuplicateValue=s=>G.cardDuplicateRows(s).reduce((n,row)=>n+row.value,0);
G.marketSellableCount=s=>G.inventoryCount(s)+G.cardDuplicateCountTotal(s);
G.marketSellableValue=s=>G.inventoryValue(s)+G.cardDuplicateValue(s);

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  const before=c?G.cardObtainedTotal(s,c.id):0;
  const reward=previousAddCatch(s,c,weightG);
  if(reward&&c){
    if(!s.cardObtainedById||typeof s.cardObtainedById!=='object')s.cardObtainedById={};
    s.cardObtainedById[c.id]=before+1;
    s.unifiedCardsV201=1;
    reward.cardObtainedTotal=s.cardObtainedById[c.id];
  }
  return reward;
};

const previousOpenCardPack=G.openCardPack;
G.openCardPack=function(s,rand=Math.random){
  const before={};
  (G.collectionCards?G.collectionCards():[]).forEach(c=>before[c.id]=G.cardObtainedTotal(s,c.id));
  const result=previousOpenCardPack(s,rand);
  if(!result||!result.ok)return result;
  if(!s.cardObtainedById||typeof s.cardObtainedById!=='object')s.cardObtainedById={};
  const gained={};
  result.cards.forEach(x=>{const id=x.creature.id;gained[id]=(gained[id]||0)+1});
  Object.entries(gained).forEach(([idRaw,n])=>{const id=Number(idRaw);s.cardObtainedById[id]=(before[id]||0)+n});
  result.cards.forEach(x=>x.obtainedTotal=G.cardObtainedTotal(s,x.creature.id));
  s.unifiedCardsV201=1;
  return result;
};

G.sellCardDuplicates=function(s){
  const rows=G.cardDuplicateRows(s),count=rows.reduce((n,row)=>n+row.count,0),value=rows.reduce((n,row)=>n+row.value,0),intrinsic=rows.reduce((n,row)=>n+row.intrinsic,0);
  if(!count)return{value:0,count:0,marketBonus:0};
  if(!s.cardCopiesById||typeof s.cardCopiesById!=='object')s.cardCopiesById={};
  rows.forEach(row=>s.cardCopiesById[row.id]=1);
  s.coins=(Number(s.coins)||0)+value;
  s.totalEarned=(Number(s.totalEarned)||0)+value;
  s.totalSold=(Number(s.totalSold)||0)+count;
  return{value,count,marketBonus:value-intrinsic};
};

const previousSellAll=G.sellAll;
G.sellAll=function(s){
  const specimens=previousSellAll(s),duplicates=G.sellCardDuplicates(s);
  return{
    value:(specimens.value||0)+duplicates.value,
    count:(specimens.count||0)+duplicates.count,
    marketBonus:(specimens.marketBonus||0)+duplicates.marketBonus,
    specimenCount:specimens.count||0,
    specimenValue:specimens.value||0,
    duplicateCount:duplicates.count,
    duplicateValue:duplicates.value
  };
};

G.productVersion='2.0.1';
G.releaseVersion='2.0.1';
G.duplicateCardMarketVersion='2.0.1';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
