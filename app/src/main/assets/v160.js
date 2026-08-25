(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v150.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const CARD_PACK_COST=800;
const CARD_PACK_SIZE=5;
const RARE_PITY_PACKS=4;
const IRIDESCENT_EVERY=5;
const ABYSSAL_EVERY=15;
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
function nextMultipleDistance(n,step){
  const mod=n%step;
  return mod===0?step:step-mod;
}
function boosterTypeFor(packNumber){
  if(packNumber%ABYSSAL_EVERY===0)return'abyssal';
  if(packNumber%IRIDESCENT_EVERY===0)return'iridescent';
  return'standard';
}
function standardSkin(packNumber){
  const skins=[
    {skin:'maree',name:'Marée bleue',accent:'azur'},
    {skin:'corail',name:'Récif corail',accent:'corail'},
    {skin:'emeraude',name:'Courant émeraude',accent:'émeraude'}
  ];
  return skins[(packNumber-1)%skins.length];
}
function minPool(pool,minIndex){const filtered=pool.filter(c=>rarityIndex(c)>=minIndex);return filtered.length?filtered:pool}
function intensityFor(index){return index>=5?'mythic':index===4?'legendary':index===3?'epic':index===2?'rare':index===1?'uncommon':'common'}

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.version=7;
  s.cardRarePity=Math.max(0,Math.min(RARE_PITY_PACKS-1,Number(s.cardRarePity)||0));
  return s;
};
const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input||{});
  s.cardRarePity=Math.max(0,Math.min(RARE_PITY_PACKS-1,Math.floor(Number(s.cardRarePity)||0)));
  s.version=7;
  G.currentState=s;
  return s;
};

G.cardPackSize=CARD_PACK_SIZE;
G.cardPackCost=()=>CARD_PACK_COST;
G.cardBoosterRules={
  cost:CARD_PACK_COST,
  size:CARD_PACK_SIZE,
  finalMinRarity:'inhabituelle',
  rarePityPacks:RARE_PITY_PACKS,
  iridescentEvery:IRIDESCENT_EVERY,
  abyssalEvery:ABYSSAL_EVERY
};

G.cardBoosterStatus=function(s){
  const pity=Math.max(0,Math.min(RARE_PITY_PACKS-1,Math.floor(Number(s&&s.cardRarePity)||0)));
  const opened=Math.max(0,Math.floor(Number(s&&s.cardPacksOpened)||0));
  return{
    pity,
    guaranteedNext:pity>=RARE_PITY_PACKS-1,
    packsUntilRareGuarantee:Math.max(1,RARE_PITY_PACKS-pity),
    packsUntilIridescent:nextMultipleDistance(opened,IRIDESCENT_EVERY),
    packsUntilAbyssal:nextMultipleDistance(opened,ABYSSAL_EVERY),
    nextPack:opened+1
  };
};

G.cardBoosterPreview=function(s){
  const opened=Math.max(0,Math.floor(Number(s&&s.cardPacksOpened)||0));
  const packNumber=opened+1,type=boosterTypeFor(packNumber),status=G.cardBoosterStatus(s);
  if(type==='abyssal')return{
    packNumber,type,skin:'abyssal',name:'Booster Abyssal',accent:'abysses',
    guaranteeLabel:'4e Rare+ · 5e Épique+',
    headline:'Les abysses remontent.',
    special:true,
    rareProtectionActive:status.guaranteedNext
  };
  if(type==='iridescent')return{
    packNumber,type,skin:'iridescent',name:'Booster Irisé',accent:'irisé',
    guaranteeLabel:'5e carte Rare+',
    headline:'La marée prend des couleurs.',
    special:true,
    rareProtectionActive:status.guaranteedNext
  };
  const skin=standardSkin(packNumber);
  return{
    packNumber,type,skin:skin.skin,name:`Booster ${skin.name}`,accent:skin.accent,
    guaranteeLabel:status.guaranteedNext?'5e carte Rare+ · protection active':'5e carte Inhabituelle+',
    headline:'Cinq cartes, une montée en puissance.',
    special:false,
    rareProtectionActive:status.guaranteedNext
  };
};

G.openCardPack=function(s,rand=Math.random){
  if(s.coins<CARD_PACK_COST)return{ok:false,reason:'coins',cost:CARD_PACK_COST};
  const pool=G.cardPool();
  if(!pool.length)return{ok:false,reason:'pool',cost:CARD_PACK_COST};

  const booster=G.cardBoosterPreview(s);
  const due=G.cardBoosterStatus(s).guaranteedNext;
  s.coins-=CARD_PACK_COST;

  const cards=[];
  let rarePlus=false,forcedRare=false;
  for(let i=0;i<CARD_PACK_SIZE;i++){
    let eligible=pool,guarantee='';
    if(booster.type==='abyssal'&&i===3){
      eligible=minPool(pool,2);guarantee='Rare+ garantie';
    }
    if(booster.type==='abyssal'&&i===4){
      eligible=minPool(pool,3);guarantee='Épique+ garantie';
    }else if(booster.type==='iridescent'&&i===4){
      eligible=minPool(pool,2);guarantee='Rare+ garantie';
    }else if(booster.type==='standard'&&i===4){
      if(due&&!rarePlus){eligible=minPool(pool,2);guarantee='Protection Rare+';forcedRare=true}
      else{eligible=minPool(pool,1);guarantee='Inhabituelle+ garantie'}
    }

    const c=weightedPick(eligible,rand),previous=G.cardCopies(s,c.id);
    s.cardCopiesById[c.id]=previous+1;
    const specimen=G.grantSpecimen(s,c,rand);
    const rIndex=rarityIndex(c),isRarePlus=rIndex>=2;
    rarePlus=rarePlus||isRarePlus;
    cards.push({
      creature:c,
      firstCard:previous===0,
      copy:s.cardCopiesById[c.id],
      weightG:specimen.weightG,
      value:specimen.value,
      discovered:G.isDiscovered(s,c),
      slot:i+1,
      guaranteed:!!guarantee,
      guarantee,
      rarityIndex:rIndex,
      intensity:intensityFor(rIndex),
      isRarePlus
    });
  }

  s.cardRarePity=rarePlus?0:Math.min(RARE_PITY_PACKS-1,(Number(s.cardRarePity)||0)+1);
  s.cardPacksOpened=(s.cardPacksOpened||0)+1;
  s.cardsDrawn=(s.cardsDrawn||0)+CARD_PACK_SIZE;

  const best=cards.reduce((a,b)=>a.rarityIndex>=b.rarityIndex?a:b);
  const result={
    ok:true,
    cost:CARD_PACK_COST,
    cards,
    packNumber:s.cardPacksOpened,
    booster,
    specialBooster:booster.special,
    rareProtectionTriggered:forcedRare,
    newCards:cards.filter(x=>x.firstCard).length,
    duplicates:cards.filter(x=>!x.firstCard).length,
    bestRarity:best.creature.rarity,
    bestRarityLabel:best.creature.rarityLabel,
    bestCardId:best.creature.id,
    bestIntensity:best.intensity,
    jackpot:best.rarityIndex>=4,
    boosterStatus:G.cardBoosterStatus(s),
    nextBooster:G.cardBoosterPreview(s)
  };
  G.lastCardPackResult=result;
  return result;
};

G.releaseVersion='1.6.0';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
