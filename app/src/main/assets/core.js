(function(global){
  'use strict';

  const rarities = {
    commune: {label:'Commune', weight:100, gacha:60, value:18, order:0},
    inhabituelle: {label:'Inhabituelle', weight:55, gacha:28, value:30, order:1},
    rare: {label:'Rare', weight:25, gacha:9, value:55, order:2},
    epique: {label:'Épique', weight:10, gacha:2.5, value:100, order:3},
    legendaire: {label:'Légendaire', weight:3, gacha:0.45, value:220, order:4},
    mythique: {label:'Mythique', weight:1, gacha:0.05, value:600, order:5}
  };

  const names = [
    'Gobie de quai','Sardine argentée','Crabe mousse','Ablette de brume','Crevette rose','Mulet des digues','Éperlan clair','Petit poulpe','Coquille nacrée','Girelle vive',
    'Blennie tachetée','Moule bleue','Bernard-l’ermite','Anchois doré','Rouget côtier','Seiche juvénile','Palourde rayée','Méduse lune','Barbue de sable','Crabe violoniste',
    'Maquereau vert','Rascasse douce','Calmar perlé','Limande pâle','Étoile grenat','Vieille azurée','Sole des herbiers','Crevette mante','Poisson-lune nain','Araignée de mer',
    'Saint-pierre jeune','Congre rubané','Poisson coffre','Huître opale','Murène de crique','Syngnathe fin','Poisson aiguille','Chabot marin','Lançon cuivré','Dorade miroir',
    'Homard cobalt','Seiche d’encre','Poisson papillon','Rémora voyageur','Raie mouchetée','Calmar flèche','Méduse ruban','Crabe de corail','Vivaneau pourpre','Baliste mosaïque',
    'Poisson ange','Labre royal','Langouste ambrée','Poisson chirurgien','Hippocampe doré','Poisson perroquet','Raie pastenague','Mérou bronze','Nautile ivoire','Barracuda jeune',
    'Poisson mandarin','Murène rubis','Crevette impériale','Crabe porcelaine','Poisson licorne',
    'Raie électrique','Espadon voilé','Thon d’orage','Requin dormeur','Poulpe mimétique','Calmar diamant','Coelacanthe sombre','Poisson dragon','Méduse couronne','Homard fantôme',
    'Raie aigle','Poisson scorpion','Requin renard','Anguille pélican','Crabe yéti','Poisson chauve-souris','Narval des abysses','Oarfish écarlate','Chimère pâle',
    'Mante marine géante','Requin marteau ancien','Calmar colossal','Raie spectrale','Poulpe de verre','Poisson soleil royal','Requin-lanterne','Nautile noir','Méduse stellaire','Léviathan juvénile',
    'Requin blanc ancestral','Calmar astral','Raie cosmique','Poulpe roi','Serpent des fosses','Kraken des marées'
  ];

  const icons = ['🐟','🐠','🦀','🐟','🦐','🐟','🐟','🐙','🐚','🐠','🐟','🦪','🦀','🐟','🐟','🦑','🐚','🪼','🐟','🦀','🐟','🐟','🦑','🐟','⭐','🐠','🐟','🦐','🐡','🦀','🐟','🐍','🐡','🦪','🐍','🐉','🐟','🐟','🐟','🐟','🦞','🦑','🐠','🐟','🦈','🦑','🪼','🦀','🐟','🐠','🐠','🐠','🦞','🐠','🐉','🐠','🦈','🐟','🐚','🐟','🐠','🐍','🦐','🦀','🐠','🦈','🐟','🐟','🦈','🐙','🦑','🐟','🐉','🪼','🦞','🦈','🐟','🦈','🐟','🦀','🐟','🐋','🐟','🐟','🦐','🦈','🦑','🦈','🐙','🐟','🦈','🐚','🪼','🐉','🦈','🦑','🦈','🐙','🐍','🐟','🐙'];

  function rarityFor(id){
    if(id<=40) return 'commune';
    if(id<=65) return 'inhabituelle';
    if(id<=83) return 'rare';
    if(id<=93) return 'epique';
    if(id<=99) return 'legendaire';
    return 'mythique';
  }

  function gateFor(id){
    if(id<=3) return 1;
    const r=rarityFor(id);
    const ranges={
      commune:[1,4,4,40],
      inhabituelle:[2,6,41,65],
      rare:[4,8,66,83],
      epique:[6,9,84,93],
      legendaire:[8,10,94,99],
      mythique:[10,10,100,100]
    };
    const [g0,g1,a,b]=ranges[r];
    if(a===b) return g0;
    const t=(id-a)/(b-a);
    return Math.round(g0+t*(g1-g0));
  }

  const creatures=names.map((name,i)=>{
    const id=i+1, rarity=rarityFor(id), meta=rarities[rarity];
    return {
      id,name,rarity,rarityLabel:meta.label,icon:icons[i]||'🐟',gate:gateFor(id),
      value:meta.value+((id*7)%Math.max(5,Math.floor(meta.value*.35)))
    };
  });

  const rankThresholds=[0,8,20,45,80,120,175,240,325,420];

  function rankForSold(totalSold){
    let rank=1;
    for(let i=0;i<rankThresholds.length;i++) if(totalSold>=rankThresholds[i]) rank=i+1;
    return Math.min(10,rank);
  }

  function nextRankInfo(totalSold){
    const rank=rankForSold(totalSold);
    if(rank>=10) return {rank,next:null,current:rankThresholds[9],progress:1};
    const current=rankThresholds[rank-1], next=rankThresholds[rank];
    return {rank,next,current,progress:Math.max(0,Math.min(1,(totalSold-current)/(next-current)))};
  }

  function defaultState(){
    return {version:2,coins:0,unlocked:[1,2,3],inventory:{},caughtById:{},totalCaught:0,totalSold:0,totalEarned:0,gachaPulls:0,streak:0,maxStreak:0,tutorialSeen:false,sound:true};
  }

  function normalizeState(s){
    const base=defaultState();
    const out=Object.assign({},base,s||{});
    if(!Array.isArray(out.unlocked)) out.unlocked=[1,2,3];
    [1,2,3].forEach(id=>{if(!out.unlocked.includes(id)) out.unlocked.push(id);});
    out.unlocked=[...new Set(out.unlocked)].filter(id=>id>=1&&id<=100).sort((a,b)=>a-b);
    if(!out.inventory||typeof out.inventory!=='object') out.inventory={};
    if(!out.caughtById||typeof out.caughtById!=='object') out.caughtById={};
    out.streak=Number(out.streak||0);
    out.maxStreak=Number(out.maxStreak||0);
    return out;
  }

  function weightedPick(items,weightFn,random=Math.random){
    if(!items.length) return null;
    const total=items.reduce((s,x)=>s+Math.max(0,weightFn(x)),0);
    if(total<=0) return items[0];
    let r=random()*total;
    for(const x of items){
      r-=Math.max(0,weightFn(x));
      if(r<=0) return x;
    }
    return items[items.length-1];
  }

  function catchableCreatures(state){return creatures.filter(c=>state.unlocked.includes(c.id));}

  function rollCatch(state,random=Math.random){
    const streak=Math.min(5,Math.max(0,state.streak||0));
    return weightedPick(catchableCreatures(state),c=>{
      const meta=rarities[c.rarity];
      const luck=1+(meta.order*0.11*streak);
      return meta.weight*luck;
    },random);
  }

  function addCatch(state,creature){
    state.inventory[creature.id]=(state.inventory[creature.id]||0)+1;
    state.caughtById[creature.id]=(state.caughtById[creature.id]||0)+1;
    state.totalCaught++;
    state.streak=(state.streak||0)+1;
    state.maxStreak=Math.max(state.maxStreak||0,state.streak);
  }

  function inventoryValue(state){
    return Object.entries(state.inventory).reduce((sum,[id,count])=>sum+creatures[Number(id)-1].value*count,0);
  }

  function inventoryCount(state){return Object.values(state.inventory).reduce((a,b)=>a+b,0);}

  function sellAll(state){
    const value=inventoryValue(state), count=inventoryCount(state);
    state.coins+=value;
    state.totalEarned+=value;
    state.totalSold+=count;
    state.inventory={};
    return {value,count};
  }

  function eligibleLocked(state){
    const rank=rankForSold(state.totalSold);
    return creatures.filter(c=>!state.unlocked.includes(c.id)&&c.gate<=rank);
  }

  function nextGate(state){
    const locked=creatures.filter(c=>!state.unlocked.includes(c.id));
    if(!locked.length) return null;
    return Math.min(...locked.map(c=>c.gate));
  }

  function gachaCost(state){
    const n=state.unlocked.length;
    return n<15?80:n<40?110:n<70?140:170;
  }

  function pullGacha(state,random=Math.random){
    const cost=gachaCost(state), pool=eligibleLocked(state);
    if(state.coins<cost) return {ok:false,reason:'coins',cost};
    if(!pool.length) return {ok:false,reason:'gate',nextGate:nextGate(state),cost};
    state.coins-=cost;
    const creature=weightedPick(pool,c=>rarities[c.rarity].gacha,random);
    state.unlocked.push(creature.id);
    state.unlocked.sort((a,b)=>a-b);
    state.gachaPulls++;
    return {ok:true,creature,cost};
  }

  function gachaOdds(state){
    const pool=eligibleLocked(state);
    if(!pool.length) return [];
    const totals={};
    let sum=0;
    pool.forEach(c=>{
      const w=rarities[c.rarity].gacha;
      totals[c.rarity]=(totals[c.rarity]||0)+w;
      sum+=w;
    });
    return Object.keys(totals)
      .sort((a,b)=>rarities[a].order-rarities[b].order)
      .map(r=>({rarity:r,label:rarities[r].label,p:totals[r]/sum}));
  }

  global.GameCore={rarities,creatures,rankThresholds,rankForSold,nextRankInfo,defaultState,normalizeState,rollCatch,addCatch,inventoryValue,inventoryCount,sellAll,eligibleLocked,nextGate,gachaCost,pullGacha,gachaOdds};

  if(typeof module!=='undefined'&&module.exports) module.exports=global.GameCore;
})(typeof window!=='undefined'?window:globalThis);
