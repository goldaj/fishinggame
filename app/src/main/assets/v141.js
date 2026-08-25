(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v140.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}
const CARD_PACK_COST=500;
function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function pick(items,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(c=>Math.max(.0001,Number(G.rarities[c.rarity]&&G.rarities[c.rarity].g)||1));
  const total=weights.reduce((a,b)=>a+b,0);
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}
G.cardPackCost=()=>CARD_PACK_COST;
G.openCardPack=function(s,rand=Math.random){
  if(s.coins<CARD_PACK_COST)return{ok:false,reason:'coins',cost:CARD_PACK_COST};
  s.coins-=CARD_PACK_COST;
  const pool=G.cardPool(),cards=[];
  for(let i=0;i<G.cardPackSize;i++){
    const c=pick(pool,rand),previous=G.cardCopies(s,c.id);
    s.cardCopiesById[c.id]=previous+1;
    const specimen=G.grantSpecimen(s,c,rand);
    cards.push({creature:c,firstCard:previous===0,copy:s.cardCopiesById[c.id],weightG:specimen.weightG,value:specimen.value,discovered:G.isDiscovered(s,c)});
  }
  s.cardPacksOpened=(s.cardPacksOpened||0)+1;
  s.cardsDrawn=(s.cardsDrawn||0)+G.cardPackSize;
  return{ok:true,cost:CARD_PACK_COST,cards};
};
G.releaseVersion='1.4.1';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
