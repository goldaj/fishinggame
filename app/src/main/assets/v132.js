(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v131.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const wildDiscoveryChance=.02;
G.wildDiscoveryChance=wildDiscoveryChance;
G.upgradeTuning=Object.assign({},G.upgradeTuning||{},{wildDiscoveryChance});

function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function baseCreatures(){return Array.from(G.creatures).filter(c=>c&&c.id>=1&&c.id<=100&&!c.isTrash)}
function rankEligible(s){
  const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0));
  return baseCreatures().filter(c=>c.gate<=rank);
}
function isDiscovered(s,c){
  if(!c||c.isTrash)return false;
  return !!((Array.isArray(s&&s.unlocked)&&s.unlocked.includes(c.id))||Number(s&&s.caughtById&&s.caughtById[c.id])>0);
}
function undiscoveredEligible(s){return rankEligible(s).filter(c=>!isDiscovered(s,c))}
function discoveredEligible(s){return rankEligible(s).filter(c=>isDiscovered(s,c))}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(x=>Math.max(0,Number(weight(x))||0));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[0];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){
    r-=weights[i];
    if(r<=0)return items[i];
  }
  return items[items.length-1];
}
function rarityWeight(c,streakBonus){
  const r=G.rarities[c.rarity];
  if(!r)return 1;
  return r.w*(streakBonus?1+r.o*.07*streakBonus:1);
}

G.rankEligible=rankEligible;
G.isDiscovered=isDiscovered;
G.undiscoveredEligible=undiscoveredEligible;
G.discoveredEligible=discoveredEligible;

const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const s=previousNormalizeState(input);
  const discovered=new Set(Array.isArray(s.unlocked)?s.unlocked:[1]);
  Object.entries(s.caughtById||{}).forEach(([idRaw,countRaw])=>{
    const id=Math.round(Number(idRaw));
    if(id>=1&&id<=100&&Number(countRaw)>0)discovered.add(id);
  });
  discovered.add(1);
  s.unlocked=[...discovered].filter(id=>id>=1&&id<=100).sort((a,b)=>a-b);
  return s;
};

G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();

  if(Array.isArray(G.trashTypes)&&typeof G.trashRate==='function'&&clamp01(rand())<G.trashRate(s)){
    const index=Math.min(G.trashTypes.length-1,Math.floor(clamp01(rand())*G.trashTypes.length));
    return G.trashTypes[index];
  }

  const eligible=rankEligible(s);
  if(!eligible.length)return null;
  const unknown=eligible.filter(c=>!isDiscovered(s,c));
  const known=eligible.filter(c=>isDiscovered(s,c));

  if(unknown.length&&clamp01(rand())<wildDiscoveryChance){
    return pick(unknown,c=>rarityWeight(c,0),rand);
  }

  const pool=known.length?known:eligible;
  const streak=Math.min(5,Math.max(0,Number(s.streak)||0));
  return pick(pool,c=>rarityWeight(c,streak),rand);
};

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  if(c&&c.isTrash)return previousAddCatch(s,c,weightG);
  const wasDiscovered=isDiscovered(s,c);
  const reward=previousAddCatch(s,c,weightG);
  if(c&&!wasDiscovered){
    if(!Array.isArray(s.unlocked))s.unlocked=[];
    if(!s.unlocked.includes(c.id))s.unlocked.push(c.id);
    s.unlocked.sort((a,b)=>a-b);
    reward.newDiscovery=true;
    G.lastWildDiscovery={id:c.id,name:c.name};
  }else reward.newDiscovery=false;
  return reward;
};

G.catalogVersion='1.3.2';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
