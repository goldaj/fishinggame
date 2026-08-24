(function(root){'use strict';
const R={
  commune:{label:'Commune',w:100,g:60,v:18,o:0,wait:[1600,5600],early:[1000,1500],hit:[1150,1650],late:[300,520],difficulty:'Souple',haptic:[38,58],hapticDuration:[14,20]},
  inhabituelle:{label:'Inhabituelle',w:55,g:28,v:30,o:1,wait:[1500,6000],early:[950,1900],hit:[930,1320],late:[290,500],difficulty:'Précise',haptic:[40,61],hapticDuration:[15,21]},
  rare:{label:'Rare',w:25,g:9,v:55,o:2,wait:[1400,6500],early:[850,2400],hit:[720,1050],late:[280,470],difficulty:'Délicate',haptic:[43,64],hapticDuration:[15,22]},
  epique:{label:'Épique',w:10,g:2.5,v:100,o:3,wait:[1300,7100],early:[700,3000],hit:[550,860],late:[260,440],difficulty:'Exigeante',haptic:[46,67],hapticDuration:[16,23]},
  legendaire:{label:'Légendaire',w:3,g:.45,v:220,o:4,wait:[1200,7800],early:[550,3600],hit:[430,680],late:[240,410],difficulty:'Brève',haptic:[49,70],hapticDuration:[17,24]},
  mythique:{label:'Mythique',w:1,g:.05,v:600,o:5,wait:[1100,8600],early:[400,4500],hit:[320,500],late:[220,380],difficulty:'Fulgurante',haptic:[52,73],hapticDuration:[18,25]}
};
const base=['Gobie','Sardine','Crabe','Ablette','Crevette','Mulet','Éperlan','Poulpe','Coquille','Girelle','Blennie','Moule','Bernard','Anchois','Rouget','Seiche','Palourde','Méduse','Barbue','Maquereau'];
const adj=['de quai','argentée','mousse','de brume','rose','des digues','clair','nacré','des herbiers','d’orage','cobalt','perlé','voyageur','mosaïque','royal','doré','abyssal','fantôme','stellaire','des marées'];
const icons=['🐟','🐠','🦀','🦐','🐙','🐚','🪼','🦞','🦈','🐡','⭐','🐍'];
const weightProfiles=[[30,220],[50,280],[180,2800],[20,180],[8,160],[450,7500],[20,260],[400,9500],[18,320],[70,1200],[20,420],[15,260],[80,1600],[8,110],[90,2300],[250,5200],[25,550],[120,4800],[450,12000],[130,3200]];
const rarityWeightScale=[1,1.08,1.18,1.32,1.55,1.9];
const upgrades={
  bait:{label:'Amorce patiente',desc:'Réduit l’attente avant qu’un poisson se présente, sans supprimer l’aléatoire.',rank:1,max:5,costs:[700,1400,2700,5200,9800]},
  reel:{label:'Moulinet de précision',desc:'Élargit légèrement la fenêtre de ferrage. La difficulté de base des espèces reste inchangée.',rank:2,max:5,costs:[900,1800,3500,6800,12800]},
  keeper:{label:'Vivier calibré',desc:'Augmente doucement la probabilité de sortir des spécimens plus lourds, sans révéler leurs limites.',rank:3,max:5,costs:[1400,2800,5400,10200,19000]},
  broker:{label:'Licence du marché',desc:'Améliore le prix payé par le marché pour toutes les prises vendues.',rank:4,max:5,costs:[1800,3600,7000,13200,24500]}
};
function rarity(id){return id<=40?'commune':id<=65?'inhabituelle':id<=83?'rare':id<=93?'epique':id<=99?'legendaire':'mythique'}
function gate(id){
  if(id===1)return 1;
  if(id<=6)return 1;if(id<=12)return 2;if(id<=20)return 3;if(id<=30)return 4;if(id<=40)return 5;
  if(id<=47)return 3;if(id<=55)return 4;if(id<=60)return 5;if(id<=65)return 6;
  if(id<=71)return 5;if(id<=77)return 6;if(id<=83)return 7;
  if(id<=87)return 7;if(id<=91)return 8;if(id<=93)return 9;
  if(id<=95)return 8;if(id<=98)return 9;if(id===99)return 10;return 10;
}
let previousValue=0;
const creatures=Array.from({length:100},(_,i)=>{
  const id=i+1,r=rarity(id),name=id===100?'Kraken des marées':`${base[i%base.length]} ${adj[(i*7)%adj.length]}`;
  const legacy=R[r].v+((id*7)%Math.max(5,Math.floor(R[r].v*.35)));
  const value=Math.max(legacy,previousValue+1);previousValue=value;
  return{id,name,rarity:r,rarityLabel:R[r].label,gate:gate(id),value,icon:icons[i%icons.length],difficulty:R[r].difficulty};
});
const hiddenWeightBounds=creatures.map((c,i)=>{
  if(c.id===100)return[120000,650000];
  const p=weightProfiles[i%weightProfiles.length],scale=rarityWeightScale[R[c.rarity].o];
  const wiggle=1+((((c.id*17)%13)-6)*.018);
  const spread=1+((c.id*11)%7)*.04;
  const min=Math.max(1,Math.round(p[0]*scale*wiggle));
  return[min,Math.max(min+1,Math.round(p[1]*scale*wiggle*spread))];
});
const thresholds=[0,40,120,260,480,800,1250,1850,2700,3800];
const postCatchLockMs=3000;
function rankForSold(sold){let r=1;thresholds.forEach((n,i)=>{if(sold>=n)r=i+1});return Math.min(10,r)}
function nextRankInfo(sold){let r=rankForSold(sold);if(r>=10)return{rank:r,next:null,current:thresholds[9],progress:1};let c=thresholds[r-1],n=thresholds[r];return{rank:r,current:c,next:n,progress:Math.max(0,Math.min(1,(sold-c)/(n-c)))}}
function defaultState(){return{version:4,coins:0,unlocked:[1],inventory:[],caughtById:{},bestWeightById:{},totalCaught:0,totalSold:0,totalEarned:0,comboEarned:0,gachaPulls:0,streak:0,maxStreak:0,failedHooks:0,retractedCasts:0,upgrades:{bait:0,reel:0,keeper:0,broker:0},tutorialSeen:false}}
function boundsFor(c){return hiddenWeightBounds[c.id-1]}
function clampWeight(c,w){const [a,b]=boundsFor(c);return Math.max(a,Math.min(b,Math.round(Number(w)||a)))}
function normalizeState(input){
  const incoming=input||{},s=Object.assign(defaultState(),incoming);
  if(!Array.isArray(s.unlocked))s.unlocked=[1];if(!s.unlocked.includes(1))s.unlocked.push(1);
  s.unlocked=[...new Set(s.unlocked)].filter(id=>id>=1&&id<=100).sort((a,b)=>a-b);
  s.caughtById=s.caughtById&&typeof s.caughtById==='object'?s.caughtById:{};
  s.bestWeightById=s.bestWeightById&&typeof s.bestWeightById==='object'?s.bestWeightById:{};
  const normalized=[];
  if(Array.isArray(s.inventory)){
    s.inventory.forEach(item=>{const id=Math.round(Number(item&&item.id)),c=creatures[id-1];if(c)normalized.push({id,weightG:clampWeight(c,item.weightG)})});
  }else{
    Object.entries(s.inventory||{}).forEach(([idRaw,nRaw])=>{const id=Math.round(Number(idRaw)),c=creatures[id-1],n=Math.max(0,Math.min(5000,Math.floor(Number(nRaw)||0)));if(c)for(let i=0;i<n;i++)normalized.push({id,weightG:boundsFor(c)[0]})});
  }
  s.inventory=normalized;
  s.inventory.forEach(item=>{const old=Number(s.bestWeightById[item.id])||0;if(item.weightG>old)s.bestWeightById[item.id]=item.weightG});
  const u=Object.assign({},defaultState().upgrades,s.upgrades||{});
  Object.keys(upgrades).forEach(k=>u[k]=Math.max(0,Math.min(upgrades[k].max,Math.floor(Number(u[k])||0))));
  s.upgrades=u;s.comboEarned=Math.max(0,Number(s.comboEarned)||0);s.version=4;return s;
}
function pick(items,w,rand=Math.random){let total=items.reduce((a,x)=>a+Math.max(0,w(x)),0),r=rand()*total;for(const x of items){r-=Math.max(0,w(x));if(r<=0)return x}return items[items.length-1]||null}
function catchable(s){return creatures.filter(c=>s.unlocked.includes(c.id))}
function rollCatch(s,rand=Math.random){let streak=Math.min(5,s.streak||0);return pick(catchable(s),c=>R[c.rarity].w*(1+R[c.rarity].o*.07*streak),rand)}
function randBetween(range,rand=Math.random){let [min,max]=range;return Math.round(min+(max-min)*Math.max(0,Math.min(.999999,rand())))}
function upgradeLevel(s,key){return Math.max(0,Math.min(upgrades[key].max,Math.floor(Number(s.upgrades&&s.upgrades[key])||0)))}
function fishingTiming(c,s,rand=Math.random){
  if(typeof s==='function'){rand=s;s=defaultState()}s=s||defaultState();
  const p=R[c.rarity],bait=upgradeLevel(s,'bait'),reel=upgradeLevel(s,'reel');
  return{
    waitMs:Math.round(randBetween(p.wait,rand)*(1-.04*bait)),
    earlyMs:randBetween(p.early,rand),
    strikeMs:Math.round(randBetween(p.hit,rand)*(1+.03*reel)),
    lateMs:randBetween(p.late,rand),
    difficulty:p.difficulty
  };
}
function fishingInputOutcome(phase){return({idle:'cast',waiting:'retract',early:'early-miss',strike:'catch',late:'late-miss'})[phase]||'ignore'}
function comboBonus(streak){let n=Math.max(0,Math.min(50,Number(streak)||0));if(n<2)return 0;let x=(n-2)/48;return Math.round(1+74*Math.pow(x,1.7))}
function rollWeight(c,s,rand=Math.random){
  s=s||defaultState();const keeper=upgradeLevel(s,'keeper'),[min,max]=boundsFor(c);
  const exponent=2.15-.13*keeper,u=Math.max(0,Math.min(.999999,rand())),t=Math.pow(u,exponent);
  return Math.round(min+(max-min)*t);
}
function catchValue(c,weightG){const[min,max]=boundsFor(c),w=clampWeight(c,weightG),t=(w-min)/(max-min);return Math.max(c.value,Math.round(c.value*(1+.75*Math.pow(t,1.15))))}
function itemValue(s,item){const c=creatures[item.id-1],baseValue=catchValue(c,item.weightG),broker=upgradeLevel(s,'broker');return Math.round(baseValue*(1+.02*broker))}
function addCatch(s,c,weightG){
  const w=clampWeight(c,weightG);s.inventory.push({id:c.id,weightG:w});s.caughtById[c.id]=(s.caughtById[c.id]||0)+1;s.totalCaught++;s.streak=(s.streak||0)+1;s.maxStreak=Math.max(s.maxStreak||0,s.streak);
  const previous=Number(s.bestWeightById[c.id])||0,record=w>previous;if(record)s.bestWeightById[c.id]=w;
  let bonus=comboBonus(s.streak);if(bonus){s.coins+=bonus;s.totalEarned+=bonus;s.comboEarned=(s.comboEarned||0)+bonus}
  return{combo:s.streak,bonus,weightG:w,value:catchValue(c,w),record};
}
function registerMiss(s,kind){if(kind==='retracted'){s.retractedCasts=(s.retractedCasts||0)+1;return}s.streak=0;s.failedHooks=(s.failedHooks||0)+1}
function inventoryValue(s){return s.inventory.reduce((a,item)=>a+itemValue(s,item),0)}
function inventoryCount(s){return s.inventory.length}
function sellAll(s){let value=inventoryValue(s),count=inventoryCount(s),intrinsic=s.inventory.reduce((a,item)=>a+catchValue(creatures[item.id-1],item.weightG),0);s.coins+=value;s.totalEarned+=value;s.totalSold+=count;s.inventory=[];return{value,count,marketBonus:value-intrinsic}}
function eligibleLocked(s){let r=rankForSold(s.totalSold);return creatures.filter(c=>!s.unlocked.includes(c.id)&&c.gate<=r)}
function nextGate(s){let locked=creatures.filter(c=>!s.unlocked.includes(c.id));return locked.length?Math.min(...locked.map(c=>c.gate)):null}
function gachaCost(s){let n=s.unlocked.length;return n<6?450:n<15?650:n<30?900:n<50?1200:n<70?1600:n<85?2100:2800}
function pullGacha(s,rand=Math.random){let cost=gachaCost(s),pool=eligibleLocked(s);if(s.coins<cost)return{ok:false,reason:'coins',cost};if(!pool.length)return{ok:false,reason:'gate',cost,nextGate:nextGate(s)};s.coins-=cost;let c=pick(pool,x=>R[x.rarity].g,rand);s.unlocked.push(c.id);s.unlocked.sort((a,b)=>a-b);s.gachaPulls++;return{ok:true,creature:c,cost}}
function gachaOdds(s){let pool=eligibleLocked(s),sum=0,m={};pool.forEach(c=>{m[c.rarity]=(m[c.rarity]||0)+R[c.rarity].g;sum+=R[c.rarity].g});return sum?Object.keys(m).sort((a,b)=>R[a].o-R[b].o).map(r=>({rarity:r,label:R[r].label,p:m[r]/sum})):[]}
function effectText(key,level){if(key==='bait')return level?`-${level*4}% attente`:'Attente normale';if(key==='reel')return level?`+${level*3}% fenêtre`:'Fenêtre normale';if(key==='keeper')return level?`Niveau ${level} gros spécimens`:'Distribution normale';if(key==='broker')return level?`+${level*2}% à la vente`:'Prix normal';return''}
function upgradeStatus(s,key){
  const cfg=upgrades[key],level=upgradeLevel(s,key),rank=rankForSold(s.totalSold),maxed=level>=cfg.max,cost=maxed?null:cfg.costs[level],rankLocked=rank<cfg.rank;
  return{key,label:cfg.label,desc:cfg.desc,level,max:cfg.max,rankRequired:cfg.rank,cost,current:effectText(key,level),next:maxed?'Maximum':effectText(key,level+1),canBuy:!maxed&&!rankLocked&&s.coins>=cost,rankLocked,maxed};
}
function buyUpgrade(s,key){if(!upgrades[key])return{ok:false,reason:'unknown'};const x=upgradeStatus(s,key);if(x.maxed)return{ok:false,reason:'max',status:x};if(x.rankLocked)return{ok:false,reason:'rank',status:x};if(s.coins<x.cost)return{ok:false,reason:'coins',status:x};s.coins-=x.cost;s.upgrades[key]=x.level+1;return{ok:true,cost:x.cost,status:upgradeStatus(s,key)}}
function hapticProfile(c,rand=Math.random){const p=R[c.rarity];return{amplitude:randBetween(p.haptic,rand),durationMs:randBetween(p.hapticDuration,rand)}}
root.GameCore={rarities:R,creatures,thresholds,postCatchLockMs,upgrades,rankForSold,nextRankInfo,defaultState,normalizeState,rollCatch,fishingTiming,fishingInputOutcome,comboBonus,rollWeight,catchValue,itemValue,addCatch,registerMiss,inventoryValue,inventoryCount,sellAll,eligibleLocked,nextGate,gachaCost,pullGacha,gachaOdds,upgradeStatus,buyUpgrade,hapticProfile};
if(typeof module!=='undefined')module.exports=root.GameCore;
})(typeof window==='undefined'?globalThis:window);