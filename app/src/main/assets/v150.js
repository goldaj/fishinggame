(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v141.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const CARD_PACK_COST=500;
const PITY_PACKS=10;
const rarityOrder=['commune','inhabituelle','rare','epique','legendaire','mythique'];
function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function rarityIndex(c){return Math.max(0,rarityOrder.indexOf(c&&c.rarity))}
function weightedPick(items,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(c=>Math.max(.0001,Number(G.rarities[c.rarity]&&G.rarities[c.rarity].g)||1));
  const total=weights.reduce((a,b)=>a+b,0);
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.version=6;
  s.cardRarePity=0;
  return s;
};
const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input||{});
  s.cardRarePity=Math.max(0,Math.min(PITY_PACKS-1,Math.floor(Number(s.cardRarePity)||0)));
  s.version=6;
  G.currentState=s;
  return s;
};

G.cardBoosterRules={cost:CARD_PACK_COST,size:3,finalMinRarity:'inhabituelle',rarePityPacks:PITY_PACKS};
G.cardBoosterStatus=function(s){
  const pity=Math.max(0,Math.min(PITY_PACKS-1,Math.floor(Number(s&&s.cardRarePity)||0)));
  return{pity,guaranteedNext:pity>=PITY_PACKS-1,packsUntilRareGuarantee:Math.max(1,PITY_PACKS-pity)};
};
G.cardPackCost=()=>CARD_PACK_COST;
G.openCardPack=function(s,rand=Math.random){
  if(s.coins<CARD_PACK_COST)return{ok:false,reason:'coins',cost:CARD_PACK_COST};
  const pool=G.cardPool();
  if(!pool.length)return{ok:false,reason:'pool',cost:CARD_PACK_COST};
  s.coins-=CARD_PACK_COST;
  const due=G.cardBoosterStatus(s).guaranteedNext;
  const cards=[];
  let rarePlus=false,forcedRare=false;
  for(let i=0;i<G.cardPackSize;i++){
    let eligible=pool;
    if(i===G.cardPackSize-1){
      if(due&&!rarePlus){eligible=pool.filter(c=>rarityIndex(c)>=2);forcedRare=true}
      else eligible=pool.filter(c=>rarityIndex(c)>=1);
    }
    const c=weightedPick(eligible.length?eligible:pool,rand),previous=G.cardCopies(s,c.id);
    s.cardCopiesById[c.id]=previous+1;
    const specimen=G.grantSpecimen(s,c,rand);
    const isRarePlus=rarityIndex(c)>=2;
    rarePlus=rarePlus||isRarePlus;
    cards.push({creature:c,firstCard:previous===0,copy:s.cardCopiesById[c.id],weightG:specimen.weightG,value:specimen.value,discovered:G.isDiscovered(s,c),guaranteed:i===G.cardPackSize-1,isRarePlus});
  }
  s.cardRarePity=rarePlus?0:Math.min(PITY_PACKS-1,(Number(s.cardRarePity)||0)+1);
  s.cardPacksOpened=(s.cardPacksOpened||0)+1;
  s.cardsDrawn=(s.cardsDrawn||0)+G.cardPackSize;
  const best=cards.reduce((a,b)=>rarityIndex(a.creature)>=rarityIndex(b.creature)?a:b);
  const result={ok:true,cost:CARD_PACK_COST,cards,packNumber:s.cardPacksOpened,rareProtectionTriggered:forcedRare,newCards:cards.filter(x=>x.firstCard).length,duplicates:cards.filter(x=>!x.firstCard).length,bestRarity:best.creature.rarity,bestRarityLabel:best.creature.rarityLabel,boosterStatus:G.cardBoosterStatus(s)};
  G.lastCardPackResult=result;
  return result;
};
G.releaseVersion='1.5.0';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
