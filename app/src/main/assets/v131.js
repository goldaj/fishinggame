(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v130.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const trashRates=[.10,.07,.05,.03,.02,.01];
const trashTypes=[
  {id:1001,key:'boot',name:'Botte trouée',weightG:620,assetKind:'trash-boot'},
  {id:1002,key:'can',name:'Boîte de conserve rouillée',weightG:85,assetKind:'trash-can'},
  {id:1003,key:'bottle',name:'Bouteille vide',weightG:420,assetKind:'trash-bottle'},
  {id:1004,key:'tire',name:'Vieux pneu',weightG:7800,assetKind:'trash-tire'}
].map(x=>Object.assign(x,{isTrash:true,rarity:'commune',rarityLabel:'Déchet',difficulty:G.rarities.commune.difficulty,value:1,assetKey:'trash-'+x.key}));
const trashById=new Map(trashTypes.map(x=>[x.id,x]));
const baseCreatures=G.creatures;
G.creatures=new Proxy(baseCreatures,{get(target,prop,receiver){
  if(typeof prop==='string'&&/^\d+$/.test(prop)){
    const index=Number(prop),trash=trashById.get(index+1);
    if(trash)return trash;
  }
  return Reflect.get(target,prop,receiver);
}});
G.trashTypes=trashTypes;
G.trashRates=trashRates.slice();

G.upgrades.cleanup={
  label:'Dépollution du port',
  desc:'Réduit la probabilité de remonter un déchet. Les déchets restants se comportent toujours comme une prise commune jusqu’au ferrage.',
  rank:1,
  max:5,
  costs:[650,1500,3400,7200,15000]
};
G.upgradeTuning=Object.assign({},G.upgradeTuning||{},{trashRates:trashRates.slice()});

function clampLevel(s){return Math.max(0,Math.min(5,Math.floor(Number(s&&s.upgrades&&s.upgrades.cleanup)||0)))}
function clamp01(x){return Math.max(0,Math.min(.999999,Number(x)||0))}
function isTrashCreature(c){return !!(c&&c.isTrash&&trashById.has(c.id))}
function isTrashItem(item){return !!(item&&trashById.has(Math.round(Number(item.id))))}
G.isTrashCreature=isTrashCreature;
G.isTrashItem=isTrashItem;
G.trashRate=s=>trashRates[clampLevel(s)];
G.trashForItem=item=>trashById.get(Math.round(Number(item&&item.id)))||null;

const previousDefaultState=G.defaultState;
G.defaultState=function(){
  const s=previousDefaultState();
  s.upgrades=Object.assign({},s.upgrades||{},{cleanup:0});
  s.totalTrashCaught=0;
  return s;
};

const previousNormalizeState=G.normalizeState;
G.normalizeState=function(input){
  const raw=input||{};
  const rawTrash=Array.isArray(raw.inventory)?raw.inventory.filter(isTrashItem).map(item=>{
    const t=trashById.get(Math.round(Number(item.id)));
    return{id:t.id,weightG:t.weightG,trash:true};
  }):[];
  const baseInput=Array.isArray(raw.inventory)?Object.assign({},raw,{inventory:raw.inventory.filter(item=>!isTrashItem(item))}):raw;
  const s=previousNormalizeState(baseInput);
  s.upgrades=Object.assign({},s.upgrades||{});
  s.upgrades.cleanup=clampLevel(raw);
  s.totalTrashCaught=Math.max(0,Math.floor(Number(raw.totalTrashCaught)||0));
  s.inventory.push(...rawTrash);
  return s;
};

const previousRollCatch=G.rollCatch;
G.rollCatch=function(s,rand=Math.random){
  s=s||G.defaultState();
  if(clamp01(rand())<G.trashRate(s)){
    const index=Math.min(trashTypes.length-1,Math.floor(clamp01(rand())*trashTypes.length));
    return trashTypes[index];
  }
  return previousRollCatch(s,rand);
};

const previousRollWeight=G.rollWeight;
G.rollWeight=function(c,s,rand=Math.random){
  if(isTrashCreature(c))return c.weightG;
  return previousRollWeight(c,s,rand);
};

const previousAddCatch=G.addCatch;
G.addCatch=function(s,c,weightG){
  if(!isTrashCreature(c))return previousAddCatch(s,c,weightG);
  s.inventory.push({id:c.id,weightG:c.weightG,trash:true});
  s.totalTrashCaught=(s.totalTrashCaught||0)+1;
  s.streak=0;
  return{combo:'rompue',bonus:0,weightG:c.weightG,value:1,record:false,trash:true};
};

const previousItemValue=G.itemValue;
G.itemValue=function(s,item){return isTrashItem(item)?1:previousItemValue(s,item)};
G.inventoryValue=function(s){return s.inventory.reduce((sum,item)=>sum+G.itemValue(s,item),0)};
G.sellAll=function(s){
  const items=s.inventory.slice(),value=items.reduce((sum,item)=>sum+G.itemValue(s,item),0);
  let fishCount=0,trashCount=0,marketBonus=0;
  items.forEach(item=>{
    if(isTrashItem(item)){trashCount++;return}
    const c=G.creatures[item.id-1];
    fishCount++;
    marketBonus+=G.itemValue(s,item)-G.catchValue(c,item.weightG);
  });
  s.coins+=value;
  s.totalEarned+=value;
  s.totalSold+=fishCount;
  s.inventory=[];
  return{value,count:items.length,fishCount,trashCount,marketBonus};
};

const previousUpgradeStatus=G.upgradeStatus;
G.upgradeStatus=function(s,key){
  if(key!=='cleanup')return previousUpgradeStatus(s,key);
  const cfg=G.upgrades.cleanup,level=clampLevel(s),rank=G.rankForSold(s.totalSold),maxed=level>=cfg.max,cost=maxed?null:cfg.costs[level],rankLocked=rank<cfg.rank;
  const text=l=>`${Math.round(trashRates[l]*100)}% de déchets`;
  return{key,label:cfg.label,desc:cfg.desc,level,max:cfg.max,rankRequired:cfg.rank,cost,current:text(level),next:maxed?'Maximum':text(level+1),canBuy:!maxed&&!rankLocked&&s.coins>=cost,rankLocked,maxed};
};

G.catalogVersion='1.3.1';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
