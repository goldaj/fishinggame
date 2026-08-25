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
function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hide');clearTimeout(toast._t);toast._t=setTimeout(()=>$('#toast').classList.add('hide'),2200)}
function formatWeight(g){g=Math.round(Number(g)||0);if(g>=1000){const kg=g/1000;return (kg>=100?kg.toFixed(1):kg.toFixed(2)).replace('.',',')+' kg'}return g+' g'}
function pct(x){return (Math.max(0,Number(x)||0)*100).toFixed(1).replace('.',',')+'%'}
function hideCatchVisual(){const el=$('#landedFish');el.classList.add('hide');el.innerHTML=''}
function showCatchVisual(c,reward){
  const el=$('#landedFish');
  el.innerHTML=`<span class="fish-ico">${art(c)}</span><b>${c.name}</b><small>${formatWeight(reward.weightG)} · ${reward.value} ◉${reward.record?' · <span class="record">Nouveau record</span>':''}</small>`;
  el.classList.remove('hide');
}
function setFishUi({status='Calme',dot='',headline='La mer est calme.',sub='Lance ta ligne, puis attends la vraie touche.',button='Lancer la ligne',buttonClass='primary',float='',ripple=''}) {
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
  const n=G.nextRankInfo(st.totalSold),found=G.discoveredCount(st);
  $('#coins').textContent=st.coins;$('#rank').textContent='Rang '+n.rank;$('#rtext').textContent=n.next?`${st.totalSold} / ${n.next} ventes`:'Rang maximum';$('#rbar').style.width=(n.progress*100)+'%';
  $('#s1').textContent=found+'/'+G.totalSpecies;$('#s2').textContent=G.inventoryCount(st);$('#s3').textContent=st.streak||0;
  market();shop();gacha();packs();cards();
}
function market(){
  const rows=st.inventory,value=G.inventoryValue(st),count=G.inventoryCount(st);$('#basketValue').textContent=value+' ◉';$('#basketCount').textContent=count;$('#sell').disabled=!rows.length;$('#sell').textContent=rows.length?`Tout vendre · ${value} ◉`:'Panier vide';
  $('#inventory').innerHTML=rows.length?[...rows].reverse().map(item=>{const c=G.creatures[item.id-1],v=G.itemValue(st,item);return `<div class="row"><span class="ico catch-art-small">${art(c)}</span><div class="grow"><b>${c.name}</b><small>${c.isTrash?'Déchet':c.rarityLabel} · ${formatWeight(item.weightG)}</small></div><span class="qty">${v} ◉</span></div>`}).join(''):'<div class="row"><div class="grow"><b>Rien à vendre</b><small>Poissons pêchés, doublons gacha et spécimens issus des cartes apparaissent ici.</small></div></div>';
}
function shop(){
  $('#shopList').innerHTML=Object.keys(G.upgrades).map(key=>{const x=G.upgradeStatus(st,key);let button=x.maxed?'Niveau maximum':x.rankLocked?`Rang ${x.rankRequired} requis`:`Améliorer · ${x.cost} ◉`;return `<article class="shop-card"><div class="shop-top"><div><h3>${x.label}</h3><p>${x.desc}</p></div><span class="shop-level">Niv. ${x.level}/${x.max}</span></div><div class="shop-effect"><span>Actuel : ${x.current}</span><b>${x.maxed?'Maximum':'Suivant : '+x.next}</b></div><button class="buy" data-upgrade="${key}" ${x.canBuy?'':'disabled'}>${button}</button></article>`}).join('');
  $$('#shopList [data-upgrade]').forEach(b=>b.onclick=()=>{const r=G.buyUpgrade(st,b.dataset.upgrade);if(!r.ok)return draw();save();toast(`${r.status.label} · niveau ${r.status.level}`);draw()});
}
function gacha(){
  const rank=G.rankForSold(st.totalSold),cost=G.gachaCost(st),pool=G.gachaPool(st),odds=G.gachaOdds(st),newChance=G.gachaNewChance(st);
  $('#gcost').textContent=cost+' ◉';$('#gpool').textContent=pool.length;
  $('#pull').textContent=rank<G.gachaMinRank?`Rang ${G.gachaMinRank} requis`:'Tirer · '+cost+' ◉';
  $('#pull').disabled=rank<G.gachaMinRank||st.coins<cost||!pool.length;
  $('#gstatus').textContent=rank<G.gachaMinRank
    ?`Le gacha s’ouvre au rang ${G.gachaMinRank}. Les rangs 1 à 7 se complètent par la pêche.`
    :`${pool.length} espèce(s) de rang 8 à ${rank} dans le pool · ${pct(newChance)} de chance pondérée d’obtenir une nouvelle découverte. Les doublons deviennent des spécimens vendables.`;
  $('#odds').innerHTML=odds.length?'<b>Raretés du pool actuel</b><br>'+odds.map(o=>`${o.label} · ${pct(o.p)}`).join('<br>'):'Aucun tirage disponible à ce rang.';
}
function renderGachaResult(r){
  const el=$('#gachaResult');if(!r||!r.ok){el.classList.add('hide');el.innerHTML='';return}
  const c=r.creature;
  el.classList.remove('hide');
  el.innerHTML=`<div class="draw-card ${c.rarity}"><span class="draw-art">${art(c)}</span><div><b>${c.name}</b><small>${c.rarityLabel}</small><strong>${r.duplicate?`Doublon · ${formatWeight(r.specimen.weightG)} · ${r.specimen.value} ◉ au panier`:'Nouvelle espèce découverte'}</strong></div></div>`;
}
function packs(){
  const cost=G.cardPackCost(st),odds=G.cardOdds(),known=G.knownCardCount(st),found=G.discoveredCount(st);
  $('#packCost').textContent=cost+' ◉';$('#packKnown').textContent=known+'/'+G.totalSpecies;$('#packFound').textContent=found+'/'+G.totalSpecies;
  $('#packPull').textContent=`Ouvrir 3 cartes · ${cost} ◉`;$('#packPull').disabled=st.coins<cost;
  $('#packOdds').innerHTML='<b>Raretés des cartes</b><br>'+odds.map(o=>`${o.label} · ${pct(o.p)}`).join('<br>');
}
function renderPackResults(r){
  const el=$('#packResults');if(!r||!r.ok){el.classList.add('hide');el.innerHTML='';return}
  el.classList.remove('hide');
  el.innerHTML=r.cards.map(x=>`<div class="draw-card ${x.creature.rarity}"><span class="draw-art">${art(x.creature)}</span><div><b>${x.creature.name}</b><small>${x.creature.rarityLabel} · carte ×${x.copy}</small><strong>${x.firstCard?'Nouvelle carte':'Doublon'} · ${formatWeight(x.weightG)} · ${x.value} ◉ au panier</strong></div></div>`).join('');
}
function cardMatches(c){
  const found=G.isDiscovered(st,c),copies=G.cardCopies(st,c.id),known=found||copies>0;
  if(filter==='found')return found;
  if(filter==='cards')return copies>0;
  if(filter==='unknown')return !known;
  return true;
}
function cards(){
  const rank=G.rankForSold(st.totalSold),known=G.knownCardCount(st),foundCount=G.discoveredCount(st);
  $('#ccount').textContent=known;$('#cfound').textContent=foundCount;
  $('#cards').innerHTML=G.creatures.filter(c=>c&&!c.isTrash&&c.id<=G.totalSpecies&&cardMatches(c)).map(c=>{
    const found=G.isDiscovered(st,c),copies=G.cardCopies(st,c.id),known=found||copies>0,best=Number(st.bestWeightById[c.id])||0,caught=Number(st.caughtById[c.id])||0;
    let status='';
    if(found)status=`Trouvée · ${c.rarityLabel} · ${caught} capture(s)${best?' · Record '+formatWeight(best):''}`;
    else if(copies)status=`Carte ×${copies} · Non trouvée · pêchable au rang ${c.gate}`;
    else if(c.gate>rank)status=`Rang ${c.gate} requis`;
    else status=c.gate>=G.gachaMinRank?'Très rare en pêche · gacha disponible':'Très rare en pêche';
    return `<button type="button" class="card ${c.rarity} ${known?'':'lock'} ${copies&&!found?'card-only':''}" data-card="${c.id}"><div class="num">N°${String(c.id).padStart(3,'0')}</div><div class="ico catch-art-card">${known?art(c):'?'}</div><h3>${known?c.name:'Espèce inconnue'}</h3><div class="meta">${status}</div>${known?`<span class="rarity">${c.rarityLabel}</span>`:''}</button>`;
  }).join('');
  $$('#cards [data-card]').forEach(b=>b.onclick=()=>openCard(Number(b.dataset.card)));
}
function openCard(id){
  const c=G.creatures[id-1],found=G.isDiscovered(st,c),copies=G.cardCopies(st,id),known=found||copies>0,best=Number(st.bestWeightById[id])||0,caught=Number(st.caughtById[id])||0,rank=G.rankForSold(st.totalSold);
  $('#modalIcon').innerHTML=known?art(c):'?';$('#modalNumber').textContent='N°'+String(id).padStart(3,'0');$('#modalTitle').textContent=known?c.name:'Espèce inconnue';
  if(found)$('#modalRarity').textContent=`Trouvée · ${c.rarityLabel} · difficulté ${c.difficulty.toLowerCase()}`;
  else if(copies)$('#modalRarity').textContent=`Carte obtenue ×${copies} · poisson non trouvé`;
  else $('#modalRarity').textContent=c.gate<=rank?(c.gate>=G.gachaMinRank?'Très rare en pêche · gacha disponible':'Très rare en pêche'):`Rang ${c.gate} requis`;
  if(found){
    $('#modalStats').innerHTML=`<div class="modal-stat"><small>Valeur de base</small><strong>${c.value} ◉</strong></div><div class="modal-stat"><small>Meilleur poids pêché</small><strong>${best?formatWeight(best):'Aucun record'}</strong></div><div class="modal-stat"><small>Captures à la ligne</small><strong>${caught}</strong></div><div class="modal-stat"><small>Cartes possédées</small><strong>${copies}</strong></div><div class="modal-stat"><small>Rang de pêche</small><strong>${c.gate}</strong></div>`;
  }else if(copies){
    $('#modalStats').innerHTML=`<div class="modal-stat"><small>Valeur de base</small><strong>${c.value} ◉</strong></div><div class="modal-stat"><small>Statut</small><strong>Non trouvé</strong></div><div class="modal-stat"><small>Cartes possédées</small><strong>${copies}</strong></div><div class="modal-stat"><small>Pêche</small><strong>${c.gate<=rank?'Accessible, très rare':'Rang '+c.gate}</strong></div><div class="modal-stat"><small>Découverte</small><strong>La carte ne débloque pas le poisson</strong></div>`;
  }else{
    $('#modalStats').innerHTML=`<div class="modal-stat"><small>Pêche</small><strong>${c.gate<=rank?'Accessible, très rare':'Rang '+c.gate}</strong></div><div class="modal-stat"><small>Carte</small><strong>Peut apparaître dans un pack</strong></div>`;
  }
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
  if(reward.trash){
    setFishUi({status:'Déchet',dot:'warn',headline:'Un déchet remonté.',sub:`${c.name} · valeur 1 ◉. La série est rompue.`,button:'Relancer',buttonClass:'primary'});
    showCatchVisual(c,reward);
    $('#result').innerHTML=`<span class="ico catch-art-result">${art(c)}</span><div><b>${c.name}</b><small>Déchet · ${formatWeight(reward.weightG)}</small></div><span class="value">1 ◉</span>`;$('#result').classList.remove('hide');
  }else{
    const bonusText=reward.bonus?` Combo ${reward.combo} : +${reward.bonus} ◉ immédiats.`:` Combo ${reward.combo}.`;
    setFishUi({status:reward.newDiscovery?'Découverte':'Prise',dot:'live',headline:reward.newDiscovery?'Nouvelle espèce découverte !':'Belle prise.',sub:`${formatWeight(reward.weightG)} · valeur ${reward.value} ◉.${bonusText}${reward.newDiscovery?' Elle rejoint désormais sa fréquence normale de pêche.':''}`,button:'Relancer',buttonClass:'primary'});
    showCatchVisual(c,reward);
    $('#result').innerHTML=`<span class="ico catch-art-result">${art(c)}</span><div><b>${c.name}</b><small>${c.rarityLabel} · ${formatWeight(reward.weightG)}${reward.record?' · nouveau record':''}</small></div><span class="value">${reward.value} ◉</span>`;$('#result').classList.remove('hide');
    if(reward.bonus)toast(`Combo ${reward.combo} · +${reward.bonus} ◉ immédiats`);
  }
  draw();startPostCatchCooldown();
}

$('#cast').onclick=()=>{const action=G.fishingInputOutcome(phase);if(action==='cast')return cast();if(action==='retract')return retract();if(action==='early-miss')return miss('early');if(action==='catch')return land();if(action==='late-miss')return miss('late')};
$('#sell').onclick=()=>{const r=G.sellAll(st);save();toast(`+${r.value} ◉ · ${r.count} objet(s) vendu(s)${r.marketBonus?` · bonus marché +${r.marketBonus} ◉`:''}`);draw()};
$('#pull').onclick=()=>{const r=G.pullGacha(st);if(!r.ok)return draw();save();renderGachaResult(r);toast(r.duplicate?`Doublon : ${r.creature.name} ajouté au panier`:`Nouvelle espèce : ${r.creature.name}`);draw()};
$('#packPull').onclick=()=>{const r=G.openCardPack(st);if(!r.ok)return draw();save();renderPackResults(r);toast('3 cartes · 3 spécimens ajoutés au panier');draw()};
$('#closeModal').onclick=closeModal;$('#cardModal').onclick=e=>{if(e.target===$('#cardModal'))closeModal()};
$$('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.s));function go(s){$$('.screen').forEach(x=>x.classList.toggle('on',x.id===s));$$('.nav button').forEach(x=>x.classList.toggle('on',x.dataset.s===s));draw()}
$$('#marketTabs button').forEach(b=>b.onclick=()=>setMarketView(b.dataset.marketTab));
$$('#collection .collection-tabs button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;$$('#collection .collection-tabs button').forEach(x=>x.classList.toggle('on',x===b));cards()});
setMarketView(marketView);save();draw();
