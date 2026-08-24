(function(root){'use strict';
const R={
  commune:{label:'Commune',w:100,g:60,v:18,o:0,early:[260,500],hit:[980,1380],late:[300,520],difficulty:'Souple'},
  inhabituelle:{label:'Inhabituelle',w:55,g:28,v:30,o:1,early:[280,540],hit:[820,1180],late:[290,500],difficulty:'Précise'},
  rare:{label:'Rare',w:25,g:9,v:55,o:2,early:[300,580],hit:[660,980],late:[280,470],difficulty:'Délicate'},
  epique:{label:'Épique',w:10,g:2.5,v:100,o:3,early:[320,620],hit:[520,820],late:[260,440],difficulty:'Exigeante'},
  legendaire:{label:'Légendaire',w:3,g:.45,v:220,o:4,early:[340,660],hit:[410,660],late:[240,410],difficulty:'Brève'},
  mythique:{label:'Mythique',w:1,g:.05,v:600,o:5,early:[360,700],hit:[320,500],late:[220,380],difficulty:'Fulgurante'}
};
const base=['Gobie','Sardine','Crabe','Ablette','Crevette','Mulet','Éperlan','Poulpe','Coquille','Girelle','Blennie','Moule','Bernard','Anchois','Rouget','Seiche','Palourde','Méduse','Barbue','Maquereau'];
const adj=['de quai','argentée','mousse','de brume','rose','des digues','clair','nacré','des herbiers','d’orage','cobalt','perlé','voyageur','mosaïque','royal','doré','abyssal','fantôme','stellaire','des marées'];
const icons=['🐟','🐠','🦀','🦐','🐙','🐚','🪼','🦞','🦈','🐡','⭐','🐍'];
function rarity(id){return id<=40?'commune':id<=65?'inhabituelle':id<=83?'rare':id<=93?'epique':id<=99?'legendaire':'mythique'}
function gate(id){
  if(id===1)return 1;
  if(id<=6)return 1;if(id<=12)return 2;if(id<=20)return 3;if(id<=30)return 4;if(id<=40)return 5;
  if(id<=47)return 3;if(id<=55)return 4;if(id<=60)return 5;if(id<=65)return 6;
  if(id<=71)return 5;if(id<=77)return 6;if(id<=83)return 7;
  if(id<=87)return 7;if(id<=91)return 8;if(id<=93)return 9;
  if(id<=95)return 8;if(id<=98)return 9;if(id===99)return 10;return 10;
}
const creatures=Array.from({length:100},(_,i)=>{let id=i+1,r=rarity(id),name=id===100?'Kraken des marées':`${base[i%base.length]} ${adj[(i*7)%adj.length]}`;return{id,name,rarity:r,rarityLabel:R[r].label,gate:gate(id),value:R[r].v+((id*7)%Math.max(5,Math.floor(R[r].v*.35))),icon:icons[i%icons.length],difficulty:R[r].difficulty}});
const thresholds=[0,40,120,260,480,800,1250,1850,2700,3800];
function rankForSold(sold){let r=1;thresholds.forEach((n,i)=>{if(sold>=n)r=i+1});return Math.min(10,r)}
function nextRankInfo(sold){let r=rankForSold(sold);if(r>=10)return{rank:r,next:null,current:thresholds[9],progress:1};let c=thresholds[r-1],n=thresholds[r];return{rank:r,current:c,next:n,progress:Math.max(0,Math.min(1,(sold-c)/(n-c)))}}
function defaultState(){return{version:2,coins:0,unlocked:[1],inventory:{},caughtById:{},totalCaught:0,totalSold:0,totalEarned:0,gachaPulls:0,streak:0,maxStreak:0,failedHooks:0,retractedCasts:0,tutorialSeen:false}}
function normalizeState(s){s=Object.assign(defaultState(),s||{});if(!Array.isArray(s.unlocked))s.unlocked=[1];if(!s.unlocked.includes(1))s.unlocked.push(1);s.unlocked=[...new Set(s.unlocked)].filter(id=>id>=1&&id<=100).sort((a,b)=>a-b);s.inventory=s.inventory||{};s.caughtById=s.caughtById||{};s.version=2;return s}
function pick(items,w,rand=Math.random){let total=items.reduce((a,x)=>a+Math.max(0,w(x)),0),r=rand()*total;for(const x of items){r-=Math.max(0,w(x));if(r<=0)return x}return items[items.length-1]||null}
function catchable(s){return creatures.filter(c=>s.unlocked.includes(c.id))}
function rollCatch(s,rand=Math.random){let streak=Math.min(5,s.streak||0);return pick(catchable(s),c=>R[c.rarity].w*(1+R[c.rarity].o*.07*streak),rand)}
function randBetween(range,rand=Math.random){let [min,max]=range;return Math.round(min+(max-min)*Math.max(0,Math.min(.999999,rand())))}
function fishingTiming(c,rand=Math.random){let p=R[c.rarity];return{waitMs:randBetween([1800,5200],rand),earlyMs:randBetween(p.early,rand),strikeMs:randBetween(p.hit,rand),lateMs:randBetween(p.late,rand),difficulty:p.difficulty}}
function fishingInputOutcome(phase){return({idle:'cast',waiting:'retract',early:'early-miss',strike:'catch',late:'late-miss'})[phase]||'ignore'}
function addCatch(s,c){s.inventory[c.id]=(s.inventory[c.id]||0)+1;s.caughtById[c.id]=(s.caughtById[c.id]||0)+1;s.totalCaught++;s.streak=(s.streak||0)+1;s.maxStreak=Math.max(s.maxStreak||0,s.streak)}
function registerMiss(s,kind){if(kind==='retracted'){s.retractedCasts=(s.retractedCasts||0)+1;return}s.streak=0;s.failedHooks=(s.failedHooks||0)+1}
function inventoryValue(s){return Object.entries(s.inventory).reduce((a,[id,n])=>a+creatures[id-1].value*n,0)}
function inventoryCount(s){return Object.values(s.inventory).reduce((a,b)=>a+b,0)}
function sellAll(s){let value=inventoryValue(s),count=inventoryCount(s);s.coins+=value;s.totalEarned+=value;s.totalSold+=count;s.inventory={};return{value,count}}
function eligibleLocked(s){let r=rankForSold(s.totalSold);return creatures.filter(c=>!s.unlocked.includes(c.id)&&c.gate<=r)}
function nextGate(s){let locked=creatures.filter(c=>!s.unlocked.includes(c.id));return locked.length?Math.min(...locked.map(c=>c.gate)):null}
function gachaCost(s){let n=s.unlocked.length;return n<6?450:n<15?650:n<30?900:n<50?1200:n<70?1600:n<85?2100:2800}
function pullGacha(s,rand=Math.random){let cost=gachaCost(s),pool=eligibleLocked(s);if(s.coins<cost)return{ok:false,reason:'coins',cost};if(!pool.length)return{ok:false,reason:'gate',cost,nextGate:nextGate(s)};s.coins-=cost;let c=pick(pool,x=>R[x.rarity].g,rand);s.unlocked.push(c.id);s.unlocked.sort((a,b)=>a-b);s.gachaPulls++;return{ok:true,creature:c,cost}}
function gachaOdds(s){let pool=eligibleLocked(s),sum=0,m={};pool.forEach(c=>{m[c.rarity]=(m[c.rarity]||0)+R[c.rarity].g;sum+=R[c.rarity].g});return sum?Object.keys(m).sort((a,b)=>R[a].o-R[b].o).map(r=>({rarity:r,label:R[r].label,p:m[r]/sum})):[]}
root.GameCore={rarities:R,creatures,thresholds,rankForSold,nextRankInfo,defaultState,normalizeState,rollCatch,fishingTiming,fishingInputOutcome,addCatch,registerMiss,inventoryValue,inventoryCount,sellAll,eligibleLocked,nextGate,gachaCost,pullGacha,gachaOdds};
if(typeof module!=='undefined')module.exports=root.GameCore;
})(typeof window==='undefined'?globalThis:window);
