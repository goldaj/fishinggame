const G=GameCore,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],key='pm-save';
const art=c=>window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):c.icon;
let st=G.normalizeState(JSON.parse(localStorage.getItem(key)||'null'));
let phase='idle',encounter=null,timing=null,timers=[],filter='all',marketView='sell';
function save(){localStorage.setItem(key,JSON.stringify(st))}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function vibrate(pattern){try{navigator.vibrate&&navigator.vibrate(pattern)}catch(_){}}
function hapticPulse(c){
  if(!c||!['early','strike','late'].includes(phase))return;
  const h=G.hapticProfile(c);
  try{
    if(window.NativeHaptics&&typeof window.NativeHaptics.pulse==='function')window.NativeHaptics.pulse(h.amplitude,h.durationMs);
    else vibrate(h.durationMs);
  }catch(_){vibrate(h.durationMs)}
  later(()=>hapticPulse(c),430+Math.round(Math.random()*230));
}
function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hide');clearTimeout(toast._t);toast._t=setTimeout(()=>$('#toast').classList.add('hide'),1800)}
function formatWeight(g){g=Math.round(Number(g)||0);if(g>=1000){const kg=g/1000;return (kg>=100?kg.toFixed(1):kg.toFixed(2)).replace('.',',')+' kg'}return g+' g'}
function hideCatchVisual(){const el=$('#landedFish');el.classList.add('hide');el.innerHTML=''}
function showCatchVisual(c,reward){
  const el=$('#landedFish');
  el.innerHTML=`<span class="fish-ico">${art(c)}</span><b>${c.name}</b><small>${formatWeight(reward.weightG)} · ${reward.value} ◉${reward.record?' · <span class="record">Nouveau record</span>':''}</small>`;
  el.classList.remove('hide');
}
function setFishUi({status='Calme',dot='',headline='La mer est calme.',sub='Lance ta ligne, puis attends la vraie touche.',button='Lancer la ligne',buttonClass='primary',float='',ripple=''}){
  $('#statusText').textContent=status;$('#statusDot').className='dot'+(dot?' '+dot:'');$('#headline').textContent=headline;$('#sub').textContent=sub;$('#cast').textContent=button;$('#cast').className=buttonClass;$('#cast').disabled=false;$('#float').className='float'+(float?' show '+float:'');$('#ripple').className='ripple'+(ripple?' '+ripple:'');
}
function startPostCatchCooldown(){
  phase='cooldown';const unlockAt=Date.now()+G.postCatchLockMs;$('#cast').disabled=true;
  const tick=()=>{const remaining=Math.ceil((unlockAt-Date.now())/1000);if(remaining<=0){phase='idle';$('#cast').disabled=false;$('#cast').textContent='Relancer';return}$('#cast').textContent=`Relancer · ${remaining}`;later(tick,250)};
  tick();
}
function setMarketView(view){
  marketView=view==='upgrades'?'upgrades':'sell';
  $('#marketSellPanel').classList.toggle('hide',marketView!=='sell');
  $('#marketUpgradePanel').classList.toggle('hide',marketView!=='upgrades');
  $$('#marketTabs button').forEach(b=>b.classList.toggle('on',b.dataset.marketTab===marketView));
}
function draw(){
  const n=G.nextRankInfo(st.totalSold);$('#coins').textContent=st.coins;$('#rank').textContent='Rang '+n.rank;$('#rtext').textContent=n.next?`${st.totalSold} / ${n.next} ventes`:'Rang maximum';$('#rbar').style.width=(n.progress*100)+'%';
  $('#s1').textContent=st.unlocked.length+'/100';$('#s2').textContent=G.inventoryCount(st);$('#s3').textContent=st.streak||0;market();shop();gacha();cards();
}
function market(){
  const rows=st.inventory,value=G.inventoryValue(st),count=G.inventoryCount(st);$('#basketValue').textContent=value+' ◉';$('#basketCount').textContent=count;$('#sell').disabled=!rows.length;$('#sell').textContent=rows.length?`Tout vendre · ${value} ◉`:'Panier vide';
  $('#inventory').innerHTML=rows.length?[...rows].reverse().map(item=>{const c=G.creatures[item.id-1],v=G.itemValue(st,item);return `<div class="row"><span class="ico catch-art-small">${art(c)}</span><div class="grow"><b>${c.name}</b><small>${c.rarityLabel} · ${formatWeight(item.weightG)}</small></div><span class="qty">${v} ◉</span></div>`}).join(''):'<div class="row"><div class="grow"><b>Rien à vendre</b><small>Chaque future prise gardera son poids individuel.</small></div></div>';
}
function shop(){
  $('#shopList').innerHTML=Object.keys(G.upgrades).map(key=>{const x=G.upgradeStatus(st,key);let button=x.maxed?'Niveau maximum':x.rankLocked?`Rang ${x.rankRequired} requis`:`Améliorer · ${x.cost} ◉`;return `<article class="shop-card"><div class="shop-top"><div><h3>${x.label}</h3><p>${x.desc}</p></div><span class="shop-level">Niv. ${x.level}/${x.max}</span></div><div class="shop-effect"><span>Actuel : ${x.current}</span><b>${x.maxed?'Maximum':'Suivant : '+x.next}</b></div><button class="buy" data-upgrade="${key}" ${x.canBuy?'':'disabled'}>${button}</button></article>`}).join('');
  $$('#shopList [data-upgrade]').forEach(b=>b.onclick=()=>{const r=G.buyUpgrade(st,b.dataset.upgrade);if(!r.ok)return draw();save();toast(`${r.status.label} · niveau ${r.status.level}`);draw()});
}
function gacha(){
  const cost=G.gachaCost(st),pool=G.eligibleLocked(st),odds=G.gachaOdds(st);$('#gcost').textContent=cost+' ◉';$('#gpool').textContent=pool.length;$('#pull').textContent='Tirer · '+cost+' ◉';$('#pull').disabled=st.coins<cost||!pool.length;
  $('#gstatus').textContent=st.unlocked.length===100?'Collection complète.':!pool.length?`Aucune nouveauté à ce rang. Prochain palier : rang ${G.nextGate(st)}.`:`${pool.length} nouvelle(s) espèce(s) sont accessibles à ton rang.`;
  $('#odds').innerHTML=odds.length?'<b>Répartition du pool actuel</b><br>'+odds.map(o=>`${o.label} · ${(o.p*100).toFixed(1)}%`).join('<br>'):'Le prochain rang ouvrira de nouvelles possibilités.';
}
function cards(){
  const rank=G.rankForSold(st.totalSold);$('#ccount').textContent=st.unlocked.length;
  $('#cards').innerHTML=G.creatures.filter(c=>filter==='all'||(filter==='unlocked')===st.unlocked.includes(c.id)).map(c=>{const u=st.unlocked.includes(c.id),best=Number(st.bestWeightById[c.id])||0,status=u?`${c.rarityLabel} · ${c.value} ◉${best?' · Record '+formatWeight(best):''}`:(c.gate<=rank?'Disponible au gacha':`Rang ${c.gate} requis`);return `<button type="button" class="card ${c.rarity} ${u?'':'lock'}" data-card="${c.id}"><div class="num">N°${String(c.id).padStart(3,'0')}</div><div class="ico catch-art-card">${u?art(c):'?'}</div><h3>${u?c.name:'Espèce inconnue'}</h3><div class="meta">${status}</div>${u?`<span class="rarity">${c.rarityLabel}</span>`:''}</button>`}).join('');
  $$('#cards [data-card]').forEach(b=>b.onclick=()=>openCard(Number(b.dataset.card)));
}
function openCard(id){
  const c=G.creatures[id-1],u=st.unlocked.includes(id),best=Number(st.bestWeightById[id])||0,caught=Number(st.caughtById[id])||0;
  $('#modalIcon').innerHTML=u?art(c):'?';$('#modalNumber').textContent='N°'+String(id).padStart(3,'0');$('#modalTitle').textContent=u?c.name:'Espèce inconnue';
  $('#modalRarity').textContent=u?`${c.rarityLabel} · difficulté ${c.difficulty.toLowerCase()}`:(c.gate<=G.rankForSold(st.totalSold)?'Accessible au gacha':`Rang ${c.gate} requis`);
  $('#modalStats').innerHTML=u?`<div class="modal-stat"><small>Valeur de base</small><strong>${c.value} ◉</strong></div><div class="modal-stat"><small>Meilleur poids découvert</small><strong>${best?formatWeight(best):'Aucun record'}</strong></div><div class="modal-stat"><small>Captures</small><strong>${caught}</strong></div><div class="modal-stat"><small>Ordre de collection</small><strong>${id} / 100</strong></div>`:`<div class="modal-stat"><small>Déblocage</small><strong>${c.gate<=G.rankForSold(st.totalSold)?'Gacha disponible':'Rang '+c.gate}</strong></div><div class="modal-stat"><small>Informations</small><strong>À découvrir</strong></div>`;
  $('#cardModal').classList.remove('hide');
}
function closeModal(){$('#cardModal').classList.add('hide')}
function resetFishing(copy){clearTimers();phase='idle';encounter=null;timing=null;hideCatchVisual();setFishUi(copy||{});draw()}
function cast(){
  clearTimers();hideCatchVisual();encounter=G.rollCatch(st);timing=G.fishingTiming(encounter,st);phase='waiting';$('#result').classList.add('hide');setFishUi({status:'Ligne à l’eau',dot:'live',headline:'Patience.',sub:'Le bouchon dérive. S’il ne se passe rien, appuyer relève simplement la canne.',button:'Relever la ligne',float:'waiting',ripple:'waiting'});
  later(()=>{if(phase!=='waiting')return;phase='early';hapticPulse(encounter);setFishUi({status:'Présence',dot:'warn',headline:'Ça frémit…',sub:'Quelque chose travaille la ligne, mais ce n’est pas encore la vraie touche.',button:'Relever la ligne',buttonClass:'primary warn',float:'early',ripple:'early'});
    later(()=>{if(phase!=='early')return;phase='strike';setFishUi({status:'TOUCHE',dot:'live',headline:'Ferre maintenant !',sub:`Fenêtre ${timing.difficulty.toLowerCase()} : les espèces rares pardonnent moins.`,button:'FERRER',buttonClass:'primary',float:'strike',ripple:'strike'});
      later(()=>{if(phase!=='strike')return;phase='late';setFishUi({status:'Ça décroche',dot:'bad',headline:'La fenêtre est passée.',sub:'Le poisson est encore au bout une fraction de seconde, mais il est déjà trop tard.',button:'Ferrer',buttonClass:'primary danger',float:'late',ripple:'late'});
        later(()=>{if(phase!=='late')return;miss('late-auto')},timing.lateMs);
      },timing.strikeMs);
    },timing.earlyMs);
  },timing.waitMs);
}
function retract(){G.registerMiss(st,'retracted');save();resetFishing({status:'Canne relevée',headline:'Rien au bout.',sub:'Tu as relevé la ligne avant qu’un poisson ne se présente.',button:'Relancer la ligne'});toast('Ligne relevée')}
function miss(kind){
  clearTimers();G.registerMiss(st,kind);save();const early=kind==='early';hideCatchVisual();setFishUi({status:'Raté',dot:'bad',headline:early?'Trop tôt.':'Trop tard.',sub:early?'Le poisson a senti le mouvement et s’est éloigné.':'Le poisson a eu le temps de décrocher.',button:'Relancer',buttonClass:'primary',float:'',ripple:''});phase='idle';encounter=null;timing=null;draw();
}
function land(){
  clearTimers();const c=encounter,weight=G.rollWeight(c,st),reward=G.addCatch(st,c,weight);save();encounter=null;timing=null;vibrate([18,20,28]);
  const bonusText=reward.bonus?` Combo ${reward.combo} : +${reward.bonus} ◉ immédiats.`:` Combo ${reward.combo}.`;
  setFishUi({status:'Prise',dot:'live',headline:'Belle prise.',sub:`${formatWeight(reward.weightG)} · valeur ${reward.value} ◉.${bonusText}`,button:'Relancer',buttonClass:'primary'});
  showCatchVisual(c,reward);
  $('#result').innerHTML=`<span class="ico catch-art-result">${art(c)}</span><div><b>${c.name}</b><small>${c.rarityLabel} · ${formatWeight(reward.weightG)}${reward.record?' · nouveau record':''}</small></div><span class="value">${reward.value} ◉</span>`;$('#result').classList.remove('hide');
  if(reward.bonus)toast(`Combo ${reward.combo} · +${reward.bonus} ◉ immédiats`);draw();startPostCatchCooldown();
}
$('#cast').onclick=()=>{const action=G.fishingInputOutcome(phase);if(action==='cast')return cast();if(action==='retract')return retract();if(action==='early-miss')return miss('early');if(action==='catch')return land();if(action==='late-miss')return miss('late')};
$('#sell').onclick=()=>{const r=G.sellAll(st);save();toast(`+${r.value} ◉ · ${r.count} prise(s) vendue(s)${r.marketBonus?` · bonus marché +${r.marketBonus} ◉`:''}`);draw()};
$('#pull').onclick=()=>{const r=G.pullGacha(st);if(!r.ok)return draw();save();toast('Nouvelle espèce : '+r.creature.name);draw();go('collection')};
$('#closeModal').onclick=closeModal;$('#cardModal').onclick=e=>{if(e.target===$('#cardModal'))closeModal()};
$$('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.s));function go(s){$$('.screen').forEach(x=>x.classList.toggle('on',x.id===s));$$('.nav button').forEach(x=>x.classList.toggle('on',x.dataset.s===s));draw()}
$$('#marketTabs button').forEach(b=>b.onclick=()=>setMarketView(b.dataset.marketTab));
$$('#collection .tabs button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;$$('#collection .tabs button').forEach(x=>x.classList.toggle('on',x===b));cards()});
setMarketView(marketView);save();draw();