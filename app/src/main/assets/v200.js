(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v170.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const FISH_COUNT=500;
const STATE_VERSION=8;
const rarityOrder=['commune','inhabituelle','rare','epique','legendaire','mythique'];

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
function clamp01(v){return Math.max(0,Math.min(.999999,finite(v)))}
function rankOf(s){return G.rankForSold(Math.max(0,finite(s&&s.totalSold)))}
function fishList(){
  const out=[];
  for(let i=0;i<FISH_COUNT;i++){const c=G.creatures[i];if(c&&!c.isTrash)out.push(c)}
  return out;
}
function trashList(){return Array.isArray(G.trashTypes)?G.trashTypes.filter(Boolean):[]}
function isValidCollectionId(id){return (id>=1&&id<=FISH_COUNT)||trashList().some(t=>t.id===id)}
function rarityIndex(c){return Math.max(0,rarityOrder.indexOf(c&&c.rarity))}
function rarityWeight(c,streakBonus){
  const r=G.rarities[c.rarity];
  if(!r)return 1;
  return Math.max(.0001,r.w*(streakBonus?1+(Number(r.o)||0)*.07*streakBonus:1));
}
function cardWeight(c){
  const r=G.rarities[c.rarity];
  return r?Math.max(.0001,Number(r.g)||1):1;
}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(x=>Math.max(0,Number(weight(x))||0));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[Math.min(items.length-1,Math.floor(clamp01(rand())*items.length))];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}
function ensureUnlocked(s,id){
  if(id<1||id>FISH_COUNT)return;
  if(!Array.isArray(s.unlocked))s.unlocked=[];
  if(!s.unlocked.includes(id)){s.unlocked.push(id);s.unlocked.sort((a,b)=>a-b)}
}
function collectionCopies(s,id){
  return Math.max(0,Math.floor(Number(s&&s.cardCopiesById&&s.cardCopiesById[id])||0));
}

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.version=STATE_VERSION;
  s.unifiedCardsV200=1;
  s.trashCaughtById={};
  return s;
};

const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const raw=input||{},alreadyMigrated=Number(raw.unifiedCardsV200)===1;
  const s=previousNormalizeState(raw);
  const cards={};
  const previousCards=s.cardCopiesById&&typeof s.cardCopiesById==='object'?s.cardCopiesById:{};
  Object.entries(previousCards).forEach(([idRaw,nRaw])=>{
    const id=Math.round(Number(idRaw)),n=Math.max(0,Math.min(999999,Math.floor(Number(nRaw)||0)));
    if(isValidCollectionId(id)&&n)cards[id]=n;
  });
  const rawCards=raw.cardCopiesById&&typeof raw.cardCopiesById==='object'?raw.cardCopiesById:{};
  Object.entries(rawCards).forEach(([idRaw,nRaw])=>{
    const id=Math.round(Number(idRaw)),n=Math.max(0,Math.min(999999,Math.floor(Number(nRaw)||0)));
    if(isValidCollectionId(id)&&n)cards[id]=Math.max(cards[id]||0,n);
  });

  const caught=s.caughtById&&typeof s.caughtById==='object'?s.caughtById:{};
  if(!alreadyMigrated){
    fishList().forEach(c=>{
      const caughtN=Math.max(0,Math.floor(Number(caught[c.id])||0));
      const packN=Math.max(0,Math.floor(Number(rawCards[c.id])||0));
      const historicallyUnlocked=Array.isArray(s.unlocked)&&s.unlocked.includes(c.id);
      const merged=packN+caughtN;
      if(merged>0)cards[c.id]=Math.max(cards[c.id]||0,merged);
      else if(historicallyUnlocked)cards[c.id]=Math.max(1,cards[c.id]||0);
    });
  }else{
    fishList().forEach(c=>{
      const caughtN=Math.max(0,Math.floor(Number(caught[c.id])||0));
      if(caughtN>0&&!(cards[c.id]>0))cards[c.id]=1;
    });
  }

  const trashCaught={};
  const rawTrashCaught=raw.trashCaughtById&&typeof raw.trashCaughtById==='object'?raw.trashCaughtById:{};
  trashList().forEach(t=>{
    let n=Math.max(0,Math.floor(Number(rawTrashCaught[t.id])||0));
    if(!alreadyMigrated&&Array.isArray(raw.inventory)){
      const inventoryCount=raw.inventory.filter(item=>Math.round(Number(item&&item.id))===t.id).length;
      n=Math.max(n,inventoryCount);
      if(inventoryCount)cards[t.id]=Math.max(cards[t.id]||0,inventoryCount);
    }
    if(n)trashCaught[t.id]=n;
  });

  s.cardCopiesById=cards;
  s.trashCaughtById=trashCaught;
  fishList().forEach(c=>{if(cards[c.id]>0)ensureUnlocked(s,c.id)});
  s.version=STATE_VERSION;
  s.unifiedCardsV200=1;
  G.currentState=s;
  return s;
};

G.totalCollectionCards=FISH_COUNT+trashList().length;
G.collectionCards=()=>[...fishList(),...trashList()];
G.collectionCardById=function(id){
  id=Math.round(Number(id));
  if(id>=1&&id<=FISH_COUNT)return G.creatures[id-1]||null;
  return trashList().find(t=>t.id===id)||null;
};
G.cardCopies=(s,id)=>collectionCopies(s,id);
G.hasCard=(s,id)=>collectionCopies(s,id)>0;
G.isKnownInCollection=function(s,c){
  if(!c)return false;
  if(G.hasCard(s,c.id))return true;
  if(c.isTrash)return Math.max(0,Number(s&&s.trashCaughtById&&s.trashCaughtById[c.id])||0)>0;
  return (Array.isArray(s&&s.unlocked)&&s.unlocked.includes(c.id))||Math.max(0,Number(s&&s.caughtById&&s.caughtById[c.id])||0)>0;
};
G.isDiscovered=(s,c)=>G.isKnownInCollection(s,c);
G.collectionKnownCount=s=>G.collectionCards().reduce((n,c)=>n+(G.isKnownInCollection(s,c)?1:0),0);
G.knownCardCount=G.collectionKnownCount;
G.discoveredCount=G.collectionKnownCount;
G.fishedCollectionCount=function(s){
  let n=fishList().reduce((sum,c)=>sum+(Math.max(0,Number(s&&s.caughtById&&s.caughtById[c.id])||0)>0?1:0),0);
  n+=trashList().reduce((sum,t)=>sum+(Math.max(0,Number(s&&s.trashCaughtById&&s.trashCaughtById[t.id])||0)>0?1:0),0);
  return n;
};
G.trashCollectionCount=s=>trashList().reduce((n,t)=>n+(G.isKnownInCollection(s,t)?1:0),0);

G.earlyRankFishingMultiplier=function(rankGap){
  const gap=Math.max(0,Math.floor(Number(rankGap)||0));
  if(!gap)return 1;
  return Math.max(.015,Math.pow(.32,gap));
};
G.fishingAvailability=function(s,c){
  if(!c)return{fishable:false,known:false,early:false,rank:rankOf(s),normalRank:null,rankGap:0,multiplier:0};
  if(c.isTrash)return{fishable:true,known:G.isKnownInCollection(s,c),early:false,rank:rankOf(s),normalRank:1,rankGap:0,multiplier:1};
  const rank=rankOf(s),normalRank=Math.max(1,Math.floor(Number(c.gate)||1)),known=G.isKnownInCollection(s,c),rankGap=Math.max(0,normalRank-rank);
  if(rankGap===0)return{fishable:true,known,early:false,rank,normalRank,rankGap:0,multiplier:1};
  if(known)return{fishable:true,known:true,early:true,rank,normalRank,rankGap,multiplier:G.earlyRankFishingMultiplier(rankGap)};
  return{fishable:false,known:false,early:false,rank,normalRank,rankGap,multiplier:0};
};

G.rankEligible=function(s){
  const rank=rankOf(s);
  return fishList().filter(c=>c.gate<=rank);
};
G.undiscoveredEligible=s=>G.rankEligible(s).filter(c=>!G.isKnownInCollection(s,c));
G.discoveredEligible=s=>G.rankEligible(s).filter(c=>G.isKnownInCollection(s,c));

G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  if(Array.isArray(G.trashTypes)&&typeof G.trashRate==='function'&&clamp01(rand())<G.trashRate(s)){
    const index=Math.min(G.trashTypes.length-1,Math.floor(clamp01(rand())*G.trashTypes.length));
    return G.trashTypes[index];
  }
  const rank=rankOf(s),normal=fishList().filter(c=>c.gate<=rank);
  if(!normal.length)return null;
  const unknown=normal.filter(c=>!G.isKnownInCollection(s,c));
  if(unknown.length&&typeof G.wildDiscoveryChanceFor==='function'&&clamp01(rand())<G.wildDiscoveryChanceFor(s)){
    return pick(unknown,c=>rarityWeight(c,0),rand);
  }
  const knownNormal=normal.filter(c=>G.isKnownInCollection(s,c));
  const earlyKnown=fishList().filter(c=>c.gate>rank&&G.isKnownInCollection(s,c));
  const basePool=knownNormal.length?knownNormal:normal;
  const pool=[...basePool,...earlyKnown];
  const streak=Math.min(5,Math.max(0,Number(s.streak)||0));
  return pick(pool,c=>{
    const availability=G.fishingAvailability(s,c);
    return rarityWeight(c,streak)*(availability.early?availability.multiplier:1);
  },rand);
};

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  const previous=G.cardCopies(s,c&&c.id);
  const reward=previousAddCatch(s,c,weightG);
  if(!c||!reward)return reward;
  s.cardCopiesById=s.cardCopiesById&&typeof s.cardCopiesById==='object'?s.cardCopiesById:{};
  s.cardCopiesById[c.id]=previous+1;
  if(c.isTrash){
    s.trashCaughtById=s.trashCaughtById&&typeof s.trashCaughtById==='object'?s.trashCaughtById:{};
    s.trashCaughtById[c.id]=(s.trashCaughtById[c.id]||0)+1;
  }else ensureUnlocked(s,c.id);
  s.unifiedCardsV200=1;
  reward.cardCopy=s.cardCopiesById[c.id];
  reward.firstCard=previous===0;
  reward.collectionNew=previous===0;
  return reward;
};

G.cardPool=()=>fishList();
G.cardOdds=function(){
  const pool=G.cardPool(),sum=pool.reduce((a,c)=>a+cardWeight(c),0),m={};
  pool.forEach(c=>m[c.rarity]=(m[c.rarity]||0)+cardWeight(c));
  return sum?Object.keys(m).sort((a,b)=>rarityOrder.indexOf(a)-rarityOrder.indexOf(b)).map(r=>({rarity:r,label:G.rarities[r].label,p:m[r]/sum})):[];
};

function minPool(pool,minIndex){
  const filtered=pool.filter(c=>rarityIndex(c)>=minIndex);
  return filtered.length?filtered:pool;
}
function weightedCardPick(items,rand=Math.random){return pick(items,cardWeight,rand)}

G.openCardPack=function(s,rand=Math.random){
  const cost=G.cardPackCost(s);
  if(s.coins<cost)return{ok:false,reason:'coins',cost};
  const pool=G.cardPool();
  if(!pool.length)return{ok:false,reason:'pool',cost};
  const booster=G.cardBoosterPreview(s),status=G.cardBoosterStatus(s),due=status.guaranteedNext;
  s.coins-=cost;

  const cards=[];
  let rarePlus=false,forcedRare=false;
  const rank=rankOf(s);
  for(let i=0;i<G.cardPackSize;i++){
    let eligible=pool,guarantee='';
    if(booster.type==='abyssal'&&i===3){eligible=minPool(pool,2);guarantee='Rare+ garantie'}
    if(booster.type==='abyssal'&&i===4){eligible=minPool(pool,3);guarantee='Épique+ garantie'}
    else if(booster.type==='iridescent'&&i===4){eligible=minPool(pool,2);guarantee='Rare+ garantie'}
    else if(booster.type==='standard'&&i===4){
      if(due&&!rarePlus){eligible=minPool(pool,2);guarantee='Protection Rare+';forcedRare=true}
      else{eligible=minPool(pool,1);guarantee='Inhabituelle+ garantie'}
    }

    const c=weightedCardPick(eligible,rand),previous=G.cardCopies(s,c.id),knownBefore=G.isKnownInCollection(s,c);
    s.cardCopiesById[c.id]=previous+1;
    ensureUnlocked(s,c.id);
    const rIndex=rarityIndex(c),isRarePlus=rIndex>=2,rankGap=Math.max(0,(Number(c.gate)||1)-rank);
    rarePlus=rarePlus||isRarePlus;
    cards.push({
      creature:c,
      firstCard:previous===0,
      newlyUnlocked:!knownBefore,
      copy:s.cardCopiesById[c.id],
      discovered:true,
      earlyUnlock:rankGap>0,
      rankGap,
      normalRank:c.gate,
      fishingMultiplier:rankGap>0?G.earlyRankFishingMultiplier(rankGap):1,
      fishingUnlockText:rankGap>0?`Pêchable dès maintenant · très rare jusqu’au rang ${c.gate}`:'Pêchable à sa fréquence normale',
      slot:i+1,
      guaranteed:!!guarantee,
      guarantee,
      rarityIndex:rIndex,
      intensity:rIndex>=5?'mythic':rIndex===4?'legendary':rIndex===3?'epic':rIndex===2?'rare':rIndex===1?'uncommon':'common',
      isRarePlus
    });
  }

  s.cardRarePity=rarePlus?0:Math.min((G.cardBoosterRules&&G.cardBoosterRules.rarePityPacks||4)-1,(Number(s.cardRarePity)||0)+1);
  s.cardPacksOpened=(s.cardPacksOpened||0)+1;
  s.cardsDrawn=(s.cardsDrawn||0)+G.cardPackSize;
  s.unifiedCardsV200=1;

  const best=cards.reduce((a,b)=>a.rarityIndex>=b.rarityIndex?a:b);
  const result={
    ok:true,cost,cards,packNumber:s.cardPacksOpened,booster,
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

G.gachaEnabled=false;
G.gachaPool=()=>[];
G.eligibleLocked=()=>[];
G.gachaOdds=()=>[];
G.gachaNewChance=()=>0;
G.gachaCost=()=>0;
G.pullGacha=()=>({ok:false,reason:'removed'});
G.productVersion='2.0.0';
G.unifiedCardsVersion='2.0.0';

if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
