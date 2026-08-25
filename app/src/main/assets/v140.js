(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v132.js'):root.GameCore;
const catalog=isNode?require('./v140-catalog.js'):root.V140Catalog;
if(!G||!catalog){if(isNode)module.exports=null;return}

const TOTAL_SPECIES=500;
const CARD_PACK_SIZE=3;
const CARD_PACK_COST=3000;
const GACHA_MIN_RANK=8;
const GACHA_COSTS={8:4000,9:6500,10:9000};
const rarityOrder=['commune','inhabituelle','rare','epique','legendaire','mythique'];

function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function pick(items,weight,rand=Math.random){
  if(!items.length)return null;
  const weights=items.map(x=>Math.max(0,Number(weight(x))||0));
  const total=weights.reduce((a,b)=>a+b,0);
  if(total<=0)return items[Math.min(items.length-1,Math.floor(clamp01(rand())*items.length))];
  let r=clamp01(rand())*total;
  for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}
  return items[items.length-1];
}
function rarityForNewId(id){
  if(id<=260)return'commune';
  if(id<=360)return'inhabituelle';
  if(id<=432)return'rare';
  if(id<=472)return'epique';
  if(id<=496)return'legendaire';
  return'mythique';
}
function gateForNewId(id){
  if(id<=430)return 1+Math.min(6,Math.floor(((id-101)*7)/330));
  if(id<=470)return 8;
  if(id<=490)return 9;
  return 10;
}
function assetKind(name){
  const n=String(name||'').toLowerCase();
  if(n.includes('kraken'))return'kraken';
  if(n.includes('hydre'))return'hydra';
  if(n.includes('léviathan')||n.includes('behemoth')||n.includes('béhémoth'))return'leviathan';
  if(n.includes('serpent')||n.includes('dragon'))return'serpent';
  if(n.includes('kelpie'))return'kelpie';
  if(n.includes('tortue')||n.includes('aspidochelone'))return'turtle';
  if(n.includes('makara'))return'makara';
  if(n.includes('méduse')||n.includes('galère portugaise')||n.includes('cténophore'))return'jelly';
  if(n.includes('poulpe')||n.includes('argonaute'))return'octopus';
  if(n.includes('seiche')||n.includes('calmar')||n.includes('vampire des abysses'))return'squid';
  if(n.includes('crabe')||n.includes('tourteau')||n.includes('étrille')||n.includes('araignée de mer'))return'crab';
  if(n.includes('homard')||n.includes('langouste')||n.includes('langoustine')||n.includes('écrevisse'))return'lobster';
  if(n.includes('crevette')||n.includes('crevette-mante'))return'shrimp';
  if(n.includes('bernard'))return'hermit';
  if(n.includes('coquille')||n.includes('palourde')||n.includes('moule')||n.includes('huître')||
     n.includes('praire')||n.includes('coque')||n.includes('pétoncle')||n.includes('ormeau')||
     n.includes('bigorneau')||n.includes('bulot')||n.includes('buccin')||n.includes('tridacne')||
     n.includes('patelle')||n.includes('porcelaine')||n.includes('cône ')||n.includes('murex')||
     n.includes('troque')||n.includes('turbo ')||n.includes('telline')||n.includes('donace')||
     n==='couteau')return'shell';
  if(n.includes('oursin')||n.includes('dollar des sables'))return'urchin';
  if(n.includes('étoile de mer')||n.includes('ophiure')||n.includes('lys de mer'))return'starfish';
  if(n.includes('concombre de mer')||n.includes('holothurie'))return'seacucumber';
  if(n.includes('hippocampe'))return'seahorse';
  if(n.includes('syngnathe')||n.includes('dragon de mer'))return'pipefish';
  if(n.includes('raie')||n.includes('torpille')||n.includes('manta'))return'ray';
  if(n.includes('requin')||n.includes('roussette')||n.includes('aiguillat')||n.includes('mégalodon'))return'shark';
  if(n.includes('poisson-scie')||n.includes('roi-scie'))return'sawfish';
  if(n.includes('poisson-lune')||n.includes('môle '))return'sunfish';
  if(n.includes('poisson-globe')||n.includes('poisson-ballon')||n.includes('poisson-hérisson')||n.includes('diodon'))return'puffer';
  if(n.includes('sole')||n.includes('plie')||n.includes('limande')||n.includes('turbot')||n.includes('barbue')||n.includes('flétan')||n.includes('flet'))return'flatfish';
  if(n.includes('anguille')||n.includes('congre')||n.includes('murène')||n.includes('lamproie')||n.includes('régalec'))return'eel';
  if(n.includes('espadon')||n.includes('marlin')||n.includes('voilier'))return'billfish';
  return'fish';
}
function rarityWeight(c,streakBonus){
  const r=G.rarities[c.rarity];
  if(!r)return 1;
  return r.w*(streakBonus?1+r.o*.07*streakBonus:1);
}
function cardWeight(c){const r=G.rarities[c.rarity];return r?Math.max(.0001,r.g):1}
function upgradeLevel(s,key){
  const cfg=G.upgrades&&G.upgrades[key];
  return cfg?Math.max(0,Math.min(cfg.max,Math.floor(Number(s&&s.upgrades&&s.upgrades[key])||0))):0;
}
function comboBonus(streak){
  if(typeof G.comboBonus==='function')return G.comboBonus(streak);
  const n=Math.max(0,Math.min(50,Number(streak)||0));if(n<2)return 0;
  return Math.round(1+74*Math.pow((n-2)/48,1.7));
}

const oldFish=Array.from(G.creatures).filter(c=>c&&!c.isTrash&&c.id>=1&&c.id<=100).slice(0,100).map(c=>Object.assign({},c));
if(oldFish.length!==100)throw new Error('La 1.4.0 exige les 100 espèces historiques avant extension.');
const additions=[...catalog.real,...catalog.rank8,...catalog.rank9,...catalog.rank10];
if(additions.length!==400)throw new Error('Le catalogue 1.4.0 doit ajouter exactement 400 espèces.');
const names=[...oldFish.map(c=>c.name),...additions];
if(names.length!==TOTAL_SPECIES||new Set(names).size!==TOTAL_SPECIES)throw new Error('Les 500 espèces doivent avoir des noms uniques.');

const newFish=additions.map((name,i)=>{
  const id=101+i,rarity=rarityForNewId(id),gate=gateForNewId(id),r=G.rarities[rarity];
  const jitter=((id*17)%19)-9;
  const value=Math.max(1,Math.round(r.v*(1+.18*(gate-1)) + jitter*Math.max(1,r.v*.012)));
  return{id,name,rarity,rarityLabel:r.label,gate,value,icon:'🐟',difficulty:r.difficulty,
    assetKey:`catch-${String(id).padStart(3,'0')}`,assetKind:assetKind(name),assetVariant:id};
});
oldFish.forEach(c=>{
  c.assetKey=c.assetKey||`catch-${String(c.id).padStart(3,'0')}`;
  c.assetKind=c.assetKind||assetKind(c.name);
  c.assetVariant=c.id;
});
const fish=[...oldFish,...newFish];

const trashLookup=id=>typeof G.trashForItem==='function'?G.trashForItem({id}):null;
G.creatures=new Proxy(fish,{get(target,prop,receiver){
  if(typeof prop==='string'&&/^\d+$/.test(prop)){
    const id=Number(prop)+1,t=trashLookup(id);if(t)return t;
  }
  return Reflect.get(target,prop,receiver);
}});

const oldRollWeight=G.rollWeight;
const legacyBounds=oldFish.map(c=>{
  try{
    const min=oldRollWeight(c,G.defaultState(),()=>0);
    const max=oldRollWeight(c,G.defaultState(),()=>.999999999);
    return[Math.max(1,Math.round(min)),Math.max(Math.round(min)+1,Math.round(max))];
  }catch(_){return[50,500]}
});
const familyBounds={
  fish:[40,1800],flatfish:[80,3500],eel:[150,9000],shark:[2500,120000],ray:[900,75000],sawfish:[3500,90000],
  billfish:[1800,110000],sunfish:[8000,180000],puffer:[80,4000],seahorse:[4,120],pipefish:[3,90],
  crab:[40,8500],lobster:[80,7000],shrimp:[2,500],hermit:[15,1600],shell:[5,4500],urchin:[20,1800],
  starfish:[15,2500],seacucumber:[30,5000],octopus:[80,12000],squid:[40,35000],jelly:[30,10000],
  leviathan:[18000,280000],serpent:[12000,220000],kelpie:[9000,160000],turtle:[12000,240000],
  makara:[16000,260000],hydra:[22000,320000],kraken:[35000,650000]
};
const rarityScale={commune:1,inhabituelle:1.12,rare:1.3,epique:1.55,legendaire:1.9,mythique:2.4};
const bounds=fish.map((c,i)=>{
  if(i<100)return legacyBounds[i];
  const p=familyBounds[c.assetKind]||familyBounds.fish,scale=rarityScale[c.rarity]||1,gateScale=1+(c.gate-1)*.045;
  const wiggle=1+((((c.id*23)%17)-8)*.018);
  const min=Math.max(1,Math.round(p[0]*scale*gateScale*wiggle));
  const max=Math.max(min+1,Math.round(p[1]*scale*gateScale*wiggle*(1+((c.id*11)%9)*.035)));
  return[min,max];
});
G.boundsFor=c=>bounds[(c&&c.id||0)-1]||[1,2];
G.clampWeight=function(c,w){const[a,b]=G.boundsFor(c);return Math.max(a,Math.min(b,Math.round(Number(w)||a)))};

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.version=5;
  s.cardCopiesById={};
  s.cardPacksOpened=0;
  s.cardsDrawn=0;
  s.gachaDuplicates=0;
  return s;
};

const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const raw=input||{},s=previousNormalizeState(raw);
  const unlocked=new Set([1]);
  (Array.isArray(raw.unlocked)?raw.unlocked:s.unlocked||[]).forEach(id=>{id=Math.round(Number(id));if(id>=1&&id<=TOTAL_SPECIES)unlocked.add(id)});
  const caught={};
  const rawCaught=raw.caughtById&&typeof raw.caughtById==='object'?raw.caughtById:s.caughtById||{};
  Object.entries(rawCaught).forEach(([idRaw,nRaw])=>{const id=Math.round(Number(idRaw)),n=Math.max(0,Math.floor(Number(nRaw)||0));if(id>=1&&id<=TOTAL_SPECIES&&n){caught[id]=n;unlocked.add(id)}});
  s.caughtById=caught;
  s.unlocked=[...unlocked].sort((a,b)=>a-b);

  const best={};
  const rawBest=raw.bestWeightById&&typeof raw.bestWeightById==='object'?raw.bestWeightById:s.bestWeightById||{};
  Object.entries(rawBest).forEach(([idRaw,wRaw])=>{const id=Math.round(Number(idRaw)),c=fish[id-1];if(c)best[id]=G.clampWeight(c,wRaw)});
  s.bestWeightById=best;

  const restored=[];
  if(Array.isArray(s.inventory))s.inventory.forEach(item=>restored.push(item));
  if(Array.isArray(raw.inventory)){
    raw.inventory.forEach(item=>{
      const id=Math.round(Number(item&&item.id));
      if(id<=100||id>TOTAL_SPECIES)return;
      const c=fish[id-1];if(c)restored.push({id,weightG:G.clampWeight(c,item.weightG)});
    });
  }
  s.inventory=restored;

  const cards={};
  const rawCards=raw.cardCopiesById&&typeof raw.cardCopiesById==='object'?raw.cardCopiesById:{};
  Object.entries(rawCards).forEach(([idRaw,nRaw])=>{const id=Math.round(Number(idRaw)),n=Math.max(0,Math.min(9999,Math.floor(Number(nRaw)||0)));if(id>=1&&id<=TOTAL_SPECIES&&n)cards[id]=n});
  s.cardCopiesById=cards;
  s.cardPacksOpened=Math.max(0,Math.floor(Number(raw.cardPacksOpened)||0));
  s.cardsDrawn=Math.max(0,Math.floor(Number(raw.cardsDrawn)||0));
  s.gachaDuplicates=Math.max(0,Math.floor(Number(raw.gachaDuplicates)||0));
  s.version=5;
  G.currentState=s;
  return s;
};

G.totalSpecies=TOTAL_SPECIES;
G.cardPackSize=CARD_PACK_SIZE;
G.cardPackCost=()=>CARD_PACK_COST;
G.gachaMinRank=GACHA_MIN_RANK;
G.isDiscovered=(s,c)=>!!(c&&!c.isTrash&&((Array.isArray(s&&s.unlocked)&&s.unlocked.includes(c.id))||Number(s&&s.caughtById&&s.caughtById[c.id])>0));
G.cardCopies=(s,id)=>Math.max(0,Math.floor(Number(s&&s.cardCopiesById&&s.cardCopiesById[id])||0));
G.hasCard=(s,id)=>G.cardCopies(s,id)>0;
G.isKnownInCollection=(s,c)=>G.isDiscovered(s,c)||G.hasCard(s,c.id);
G.rankEligible=function(s){const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0));return fish.filter(c=>c.gate<=rank)};
G.undiscoveredEligible=s=>G.rankEligible(s).filter(c=>!G.isDiscovered(s,c));
G.discoveredEligible=s=>G.rankEligible(s).filter(c=>G.isDiscovered(s,c));
G.wildDiscoveryChanceFor=function(s){
  const unknown=G.undiscoveredEligible(s).length;
  if(!unknown)return 0;
  return Math.min(.10,.02+Math.max(0,unknown-1)*.0017);
};
G.wildDiscoveryChance='adaptive-2%-10%';

G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  if(Array.isArray(G.trashTypes)&&typeof G.trashRate==='function'&&clamp01(rand())<G.trashRate(s)){
    const index=Math.min(G.trashTypes.length-1,Math.floor(clamp01(rand())*G.trashTypes.length));
    return G.trashTypes[index];
  }
  const eligible=G.rankEligible(s);if(!eligible.length)return null;
  const unknown=eligible.filter(c=>!G.isDiscovered(s,c)),known=eligible.filter(c=>G.isDiscovered(s,c));
  if(unknown.length&&clamp01(rand())<G.wildDiscoveryChanceFor(s))return pick(unknown,c=>rarityWeight(c,0),rand);
  const pool=known.length?known:eligible,streak=Math.min(5,Math.max(0,Number(s.streak)||0));
  return pick(pool,c=>rarityWeight(c,streak),rand);
};

G.rollWeight=function(c,s,rand=Math.random){
  if(c&&c.isTrash)return c.weightG;
  s=s||G.defaultState();const keeper=upgradeLevel(s,'keeper'),[min,max]=G.boundsFor(c);
  const u0=clamp01(rand()),u=keeper?1-Math.pow(1-u0,1+.12*keeper):u0;
  const exponent=2.15-.13*keeper,t=Math.pow(u,exponent);
  return Math.round(min+(max-min)*t);
};
G.catchValue=function(c,weightG){
  const[min,max]=G.boundsFor(c),w=G.clampWeight(c,weightG),t=(w-min)/(max-min);
  return Math.max(c.value,Math.round(c.value*(1+.75*Math.pow(t,1.15))));
};
G.itemValue=function(s,item){
  if(typeof G.isTrashItem==='function'&&G.isTrashItem(item))return 1;
  const c=fish[(item&&item.id||0)-1];if(!c)return 0;
  const base=G.catchValue(c,item.weightG),broker=upgradeLevel(s,'broker');
  return Math.round(base*(1+.06*broker));
};
G.inventoryValue=s=>(s&&Array.isArray(s.inventory)?s.inventory:[]).reduce((sum,item)=>sum+G.itemValue(s,item),0);
G.inventoryCount=s=>s&&Array.isArray(s.inventory)?s.inventory.length:0;
G.sellAll=function(s){
  const items=s.inventory.slice(),value=items.reduce((sum,item)=>sum+G.itemValue(s,item),0);
  let fishCount=0,trashCount=0,marketBonus=0;
  items.forEach(item=>{
    if(typeof G.isTrashItem==='function'&&G.isTrashItem(item)){trashCount++;return}
    const c=fish[item.id-1];if(!c)return;fishCount++;marketBonus+=G.itemValue(s,item)-G.catchValue(c,item.weightG);
  });
  s.coins+=value;s.totalEarned+=value;s.totalSold+=fishCount;s.inventory=[];
  return{value,count:items.length,fishCount,trashCount,marketBonus};
};

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  if(c&&c.isTrash)return previousAddCatch(s,c,weightG);
  const was=G.isDiscovered(s,c),w=G.clampWeight(c,weightG);
  s.inventory.push({id:c.id,weightG:w});
  s.caughtById[c.id]=(s.caughtById[c.id]||0)+1;
  s.totalCaught=(s.totalCaught||0)+1;
  s.streak=(s.streak||0)+1;
  s.maxStreak=Math.max(s.maxStreak||0,s.streak);
  const previous=Number(s.bestWeightById[c.id])||0,record=w>previous;if(record)s.bestWeightById[c.id]=w;
  const bonus=comboBonus(s.streak);if(bonus){s.coins+=bonus;s.totalEarned+=bonus;s.comboEarned=(s.comboEarned||0)+bonus}
  if(!was){if(!s.unlocked.includes(c.id))s.unlocked.push(c.id);s.unlocked.sort((a,b)=>a-b);G.lastWildDiscovery={id:c.id,name:c.name}}
  return{combo:s.streak,bonus,weightG:w,value:G.catchValue(c,w),record,newDiscovery:!was};
};
G.grantSpecimen=function(s,c,rand=Math.random){
  const w=G.rollWeight(c,s,rand);s.inventory.push({id:c.id,weightG:w});
  return{weightG:w,value:G.catchValue(c,w)};
};

G.gachaPool=function(s){
  const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0));
  if(rank<GACHA_MIN_RANK)return[];
  return fish.filter(c=>c.gate>=GACHA_MIN_RANK&&c.gate<=rank);
};
G.eligibleLocked=s=>G.gachaPool(s).filter(c=>!G.isDiscovered(s,c));
G.nextGate=function(s){
  const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0));
  return rank<8?8:rank<10?rank+1:null;
};
G.gachaCost=function(s){
  const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0));
  return GACHA_COSTS[Math.max(8,Math.min(10,rank))];
};
G.gachaOdds=function(s){
  const pool=G.gachaPool(s),sum=pool.reduce((a,c)=>a+cardWeight(c),0),m={};
  pool.forEach(c=>m[c.rarity]=(m[c.rarity]||0)+cardWeight(c));
  return sum?Object.keys(m).sort((a,b)=>rarityOrder.indexOf(a)-rarityOrder.indexOf(b)).map(r=>({rarity:r,label:G.rarities[r].label,p:m[r]/sum})):[];
};
G.gachaNewChance=function(s){
  const pool=G.gachaPool(s),sum=pool.reduce((a,c)=>a+cardWeight(c),0);
  if(!sum)return 0;
  return pool.filter(c=>!G.isDiscovered(s,c)).reduce((a,c)=>a+cardWeight(c),0)/sum;
};
G.pullGacha=function(s,rand=Math.random){
  const rank=G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0)),cost=G.gachaCost(s);
  if(rank<GACHA_MIN_RANK)return{ok:false,reason:'rank',cost,rankRequired:GACHA_MIN_RANK};
  const pool=G.gachaPool(s);if(!pool.length)return{ok:false,reason:'gate',cost,nextGate:G.nextGate(s)};
  if(s.coins<cost)return{ok:false,reason:'coins',cost};
  s.coins-=cost;
  const c=pick(pool,cardWeight,rand),duplicate=G.isDiscovered(s,c);
  let specimen=null;
  if(duplicate){specimen=G.grantSpecimen(s,c,rand);s.gachaDuplicates=(s.gachaDuplicates||0)+1}
  else{if(!s.unlocked.includes(c.id))s.unlocked.push(c.id);s.unlocked.sort((a,b)=>a-b)}
  s.gachaPulls=(s.gachaPulls||0)+1;
  return{ok:true,creature:c,cost,duplicate,specimen};
};

G.cardPool=()=>fish.slice();
G.cardOdds=function(){
  const pool=fish,sum=pool.reduce((a,c)=>a+cardWeight(c),0),m={};
  pool.forEach(c=>m[c.rarity]=(m[c.rarity]||0)+cardWeight(c));
  return Object.keys(m).sort((a,b)=>rarityOrder.indexOf(a)-rarityOrder.indexOf(b)).map(r=>({rarity:r,label:G.rarities[r].label,p:m[r]/sum}));
};
G.openCardPack=function(s,rand=Math.random){
  const cost=CARD_PACK_COST;if(s.coins<cost)return{ok:false,reason:'coins',cost};
  s.coins-=cost;const cards=[];
  for(let i=0;i<CARD_PACK_SIZE;i++){
    const c=pick(fish,cardWeight,rand),previous=G.cardCopies(s,c.id);
    s.cardCopiesById[c.id]=previous+1;
    const specimen=G.grantSpecimen(s,c,rand);
    cards.push({creature:c,firstCard:previous===0,copy:s.cardCopiesById[c.id],weightG:specimen.weightG,value:specimen.value,discovered:G.isDiscovered(s,c)});
  }
  s.cardPacksOpened=(s.cardPacksOpened||0)+1;s.cardsDrawn=(s.cardsDrawn||0)+CARD_PACK_SIZE;
  return{ok:true,cost,cards};
};
G.knownCardCount=s=>fish.reduce((n,c)=>n+(G.isKnownInCollection(s,c)?1:0),0);
G.discoveredCount=s=>fish.reduce((n,c)=>n+(G.isDiscovered(s,c)?1:0),0);

G.catalogVersion='1.4.0';
G.rarityCounts=fish.reduce((m,c)=>(m[c.rarity]=(m[c.rarity]||0)+1,m),{});
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
