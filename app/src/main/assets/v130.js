(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v122.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const catalog=[
'Gobie','Sardine','Crabe vert','Ablette','Crevette grise','Mulet',
'Éperlan','Poulpe commun','Coquille Saint-Jacques','Girelle','Blennie','Moule',
'Bernard-l’ermite','Anchois','Rouget-barbet','Seiche','Palourde','Méduse lune','Barbue','Maquereau',
'Bar','Dorade royale','Lieu jaune','Merlan','Sole','Plie','Limande','Turbot','Congre','Anguille européenne',
'Truite fario','Perche commune','Brochet','Sandre','Carpe commune','Tanche','Gardon','Brème commune','Silure glane','Saumon atlantique',
'Thon rouge','Bonite à dos rayé','Espadon','Marlin bleu','Barracuda','Mérou brun','Vivaneau rouge',
'Poisson-clown','Poisson-chirurgien','Poisson-perroquet','Poisson-papillon','Baliste','Rascasse rouge','Saint-Pierre','Lotte de mer',
'Baudroie commune','Petite roussette','Requin-marteau','Raie bouclée','Raie manta',
'Homard européen','Langouste rouge','Tourteau','Araignée de mer','Étrille','Calmar commun','Calmar flèche','Ormeau','Bigorneau','Bulot','Huître creuse',
'Couteau','Praire','Coque','Pétoncle noir','Oursin violet','Concombre de mer',
'Étoile de mer commune','Hippocampe moucheté','Syngnathe','Poisson-lune','Poisson-globe','Poisson-scie','Poisson-ange','Murène commune','Morue de l’Atlantique','Flétan de l’Atlantique',
'Requin-renard d’azur','Coelacanthe spectral','Esturgeon de cristal','Poisson-lion des brumes',
'Léviathan des abysses','Serpent marin runique',
'Régalec des constellations','Poisson-pierre de braise',
'Kelpie des marées','Aspidochelone antique','Makara des tempêtes','Hydre océanique','Kraken des marées'
];

function assetKind(name){
  const n=name.toLowerCase();
  if(n.includes('kraken'))return'kraken';
  if(n.includes('hydre'))return'hydra';
  if(n.includes('léviathan'))return'leviathan';
  if(n.includes('serpent marin'))return'serpent';
  if(n.includes('kelpie'))return'kelpie';
  if(n.includes('aspidochelone'))return'turtle';
  if(n.includes('makara'))return'makara';
  if(n.includes('méduse'))return'jelly';
  if(n.includes('poulpe'))return'octopus';
  if(n.includes('seiche')||n.includes('calmar'))return'squid';
  if(n.includes('crabe')||n.includes('tourteau')||n.includes('étrille')||n.includes('araignée de mer'))return'crab';
  if(n.includes('homard')||n.includes('langouste'))return'lobster';
  if(n.includes('crevette'))return'shrimp';
  if(n.includes('bernard'))return'hermit';
  if(n.includes('coquille')||n.includes('palourde')||n.includes('moule')||n.includes('huître')||n.includes('praire')||n.includes('coque')||n.includes('pétoncle')||n.includes('ormeau')||n.includes('bigorneau')||n.includes('bulot')||n==='couteau')return'shell';
  if(n.includes('oursin'))return'urchin';
  if(n.includes('étoile de mer'))return'starfish';
  if(n.includes('concombre de mer'))return'seacucumber';
  if(n.includes('hippocampe'))return'seahorse';
  if(n.includes('syngnathe'))return'pipefish';
  if(n.includes('raie'))return'ray';
  if(n.includes('requin')||n.includes('roussette'))return'shark';
  if(n.includes('poisson-scie'))return'sawfish';
  if(n.includes('poisson-lune'))return'sunfish';
  if(n.includes('poisson-globe'))return'puffer';
  if(n.includes('sole')||n.includes('plie')||n.includes('limande')||n.includes('turbot')||n.includes('barbue')||n.includes('flétan'))return'flatfish';
  if(n.includes('anguille')||n.includes('congre')||n.includes('murène')||n.includes('régalec'))return'eel';
  if(n.includes('espadon')||n.includes('marlin'))return'billfish';
  return'fish';
}

if(catalog.length!==100)throw new Error('Le catalogue 1.3.0 doit contenir exactement 100 prises.');
const names=new Set(catalog);
if(names.size!==100)throw new Error('Chaque prise 1.3.0 doit avoir un nom unique.');
G.creatures.forEach((c,i)=>{
  c.name=catalog[i];
  c.assetKey=`catch-${String(c.id).padStart(3,'0')}`;
  c.assetKind=assetKind(c.name);
  c.assetVariant=c.id;
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
