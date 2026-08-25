(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v122.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const families=[
  ['Gobie','goby'],['Sardine','sardine'],['Crabe','crab'],['Ablette','bleak'],['Crevette','shrimp'],
  ['Mulet','mullet'],['Éperlan','smelt'],['Poulpe','octopus'],['Coquille','scallop'],['Girelle','wrasse'],
  ['Blennie','blenny'],['Moule','mussel'],['Bernard-l’ermite','hermit'],['Anchois','anchovy'],['Rouget','redmullet'],
  ['Seiche','cuttlefish'],['Palourde','clam'],['Méduse','jellyfish'],['Barbue','turbot'],['Maquereau','mackerel']
];
const traits=[
  'de quai','aux reflets d’argent','couvert de mousse','de brume','de corail rose',
  'des digues','des eaux claires','aux reflets nacrés','des herbiers','d’orage',
  'au bleu cobalt','aux perles blanches','voyageur','en mosaïque','des rois',
  'aux reflets dorés','des abysses','fantôme','aux éclats stellaires','des marées'
];
G.creatures.forEach((c,i)=>{
  if(c.id===100){c.name='Kraken des marées';c.assetFamily='kraken';c.assetMotif=19;c.assetVariant=4;return}
  const familyIndex=i%families.length,cycle=Math.floor(i/families.length),traitIndex=(familyIndex*7+cycle*3)%traits.length;
  c.name=`${families[familyIndex][0]} ${traits[traitIndex]}`;
  c.assetFamily=families[familyIndex][1];
  c.assetMotif=traitIndex;
  c.assetVariant=cycle;
});

const tuning={baitPerLevel:.08,reelPerLevel:.10,brokerPerLevel:.06,keeperBiasPerLevel:.12};
G.upgradeTuning=tuning;
G.upgrades.bait.desc='Réduit fortement l’attente avant qu’un poisson se présente, tout en conservant une part d’aléatoire.';
G.upgrades.reel.desc='Élargit nettement la fenêtre de ferrage. Les espèces rares restent plus exigeantes, mais chaque niveau se ressent.';
G.upgrades.keeper.desc='Déplace réellement la distribution vers les gros spécimens. Les records restent rares, mais deviennent sensiblement plus accessibles.';
G.upgrades.broker.desc='Augmente franchement le prix payé par le marché pour toutes les prises vendues.';

function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function randBetween(range,rand=Math.random){const[min,max]=range;return Math.round(min+(max-min)*clamp01(rand()))}
function level(s,key){const cfg=G.upgrades[key];return Math.max(0,Math.min(cfg.max,Math.floor(Number(s&&s.upgrades&&s.upgrades[key])||0)))}

G.fishingTiming=function(c,s,rand=Math.random){
  if(typeof s==='function'){rand=s;s=G.defaultState()}s=s||G.defaultState();
  const p=G.rarities[c.rarity],bait=level(s,'bait'),reel=level(s,'reel');
  return{
    waitMs:Math.round(randBetween(p.wait,rand)*(1-tuning.baitPerLevel*bait)),
    earlyMs:randBetween(p.early,rand),
    strikeMs:Math.round(randBetween(p.hit,rand)*(1+tuning.reelPerLevel*reel)),
    lateMs:randBetween(p.late,rand),
    difficulty:p.difficulty
  };
};

const previousRollWeight=G.rollWeight;
G.rollWeight=function(c,s,rand=Math.random){
  s=s||G.defaultState();const keeper=level(s,'keeper');
  if(!keeper)return previousRollWeight(c,s,rand);
  return previousRollWeight(c,s,()=>{
    const u=clamp01(rand());
    return 1-Math.pow(1-u,1+tuning.keeperBiasPerLevel*keeper);
  });
};

G.itemValue=function(s,item){
  const c=G.creatures[item.id-1],base=G.catchValue(c,item.weightG),broker=level(s,'broker');
  return Math.round(base*(1+tuning.brokerPerLevel*broker));
};
G.inventoryValue=function(s){return s.inventory.reduce((sum,item)=>sum+G.itemValue(s,item),0)};
G.sellAll=function(s){
  const value=G.inventoryValue(s),count=s.inventory.length,intrinsic=s.inventory.reduce((sum,item)=>sum+G.catchValue(G.creatures[item.id-1],item.weightG),0);
  s.coins+=value;s.totalEarned+=value;s.totalSold+=count;s.inventory=[];
  return{value,count,marketBonus:value-intrinsic};
};

function effectText(key,lvl){
  if(key==='bait')return lvl?`-${lvl*8}% attente`:'Attente normale';
  if(key==='reel')return lvl?`+${lvl*10}% fenêtre`:'Fenêtre normale';
  if(key==='keeper')return lvl?`Biais gros spécimens ${['','I','II','III','IV','V'][lvl]}`:'Distribution normale';
  if(key==='broker')return lvl?`+${lvl*6}% à la vente`:'Prix normal';
  return'';
}
G.upgradeStatus=function(s,key){
  const cfg=G.upgrades[key],lvl=level(s,key),rank=G.rankForSold(s.totalSold),maxed=lvl>=cfg.max,cost=maxed?null:cfg.costs[lvl],rankLocked=rank<cfg.rank;
  return{key,label:cfg.label,desc:cfg.desc,level:lvl,max:cfg.max,rankRequired:cfg.rank,cost,current:effectText(key,lvl),next:maxed?'Maximum':effectText(key,lvl+1),canBuy:!maxed&&!rankLocked&&s.coins>=cost,rankLocked,maxed};
};
G.buyUpgrade=function(s,key){
  if(!G.upgrades[key])return{ok:false,reason:'unknown'};
  const x=G.upgradeStatus(s,key);
  if(x.maxed)return{ok:false,reason:'max',status:x};
  if(x.rankLocked)return{ok:false,reason:'rank',status:x};
  if(s.coins<x.cost)return{ok:false,reason:'coins',status:x};
  s.coins-=x.cost;s.upgrades[key]=x.level+1;
  return{ok:true,cost:x.cost,status:G.upgradeStatus(s,key)};
};

G.catalogVersion='1.3.0';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
