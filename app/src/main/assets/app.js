const G=GameCore,$=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],key='pm-save';
let st=G.normalizeState(JSON.parse(localStorage.getItem(key)||'null'));
let phase='idle',encounter=null,timing=null,timers=[],filter='all';
function save(){localStorage.setItem(key,JSON.stringify(st))}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function clearTimers(){timers.forEach(clearTimeout);timers=[]}
function vibrate(pattern){try{navigator.vibrate&&navigator.vibrate(pattern)}catch(_){}}
function toast(t){$('#toast').textContent=t;$('#toast').classList.remove('hide');clearTimeout(toast._t);toast._t=setTimeout(()=>$('#toast').classList.add('hide'),1700)}
function setFishUi({status='Calme',dot='',headline='La mer est calme.',sub='Lance ta ligne, puis attends la vraie touche.',button='Lancer la ligne',buttonClass='primary',float='',ripple=''}){
  $('#statusText').textContent=status;$('#statusDot').className='dot'+(dot?' '+dot:'');$('#headline').textContent=headline;$('#sub').textContent=sub;$('#cast').textContent=button;$('#cast').className=buttonClass;$('#float').className='float'+(float?' show '+float:'');$('#ripple').className='ripple'+(ripple?' '+ripple:'');
}
function draw(){
  const n=G.nextRankInfo(st.totalSold);$('#coins').textContent=st.coins;$('#rank').textContent='Rang '+n.rank;$('#rtext').textContent=n.next?`${st.totalSold} / ${n.next} ventes`:'Rang maximum';$('#rbar').style.width=(n.progress*100)+'%';
  $('#s1').textContent=st.unlocked.length+'/100';$('#s2').textContent=G.inventoryCount(st);$('#s3').textContent=st.streak||0;market();gacha();cards();
}
function market(){
  const rows=Object.entries(st.inventory).filter(x=>x[1]>0),value=G.inventoryValue(st),count=G.inventoryCount(st);$('#basketValue').textContent=value+' ◉';$('#basketCount').textContent=count;$('#sell').disabled=!rows.length;$('#sell').textContent=rows.length?`Tout vendre · ${value} ◉`:'Panier vide';
  $('#inventory').innerHTML=rows.length?rows.map(([id,q])=>{const c=G.creatures[id-1];return `<div class="row"><span class="ico">${c.icon}</span><div class="grow"><b>${c.name}</b><small>${c.rarityLabel} · ${c.value} ◉</small></div><span class="qty">×${q}</span></div>`}).join(''):'<div class="row"><div class="grow"><b>Rien à vendre</b><small>Les prises réussies apparaîtront ici.</small></div></div>';
}
function gacha(){
  const cost=G.gachaCost(st),pool=G.eligibleLocked(st),odds=G.gachaOdds(st);$('#gcost').textContent=cost+' ◉';$('#gpool').textContent=pool.length;$('#pull').textContent='Tirer · '+cost+' ◉';$('#pull').disabled=st.coins<cost||!pool.length;
  $('#gstatus').textContent=st.unlocked.length===100?'Collection complète.':!pool.length?`Aucune nouveauté à ce rang. Prochain palier : rang ${G.nextGate(st)}.`:`${pool.length} nouvelle(s) espèce(s) sont accessibles à ton rang.`;
  $('#odds').innerHTML=odds.length?'<b>Répartition du pool actuel</b><br>'+odds.map(o=>`${o.label} · ${(o.p*100).toFixed(1)}%`).join('<br>'):'Le prochain rang ouvrira de nouvelles possibilités.';
}
function cards(){
  const rank=G.rankForSold(st.totalSold);$('#ccount').textContent=st.unlocked.length;$('#cards').innerHTML=G.creatures.filter(c=>filter==='all'||(filter==='unlocked')===st.unlocked.includes(c.id)).map(c=>{const u=st.unlocked.includes(c.id),status=u?`${c.rarityLabel} · ${c.difficulty}`:(c.gate<=rank?'Disponible au gacha':`Rang ${c.gate} requis`);return `<article class="card ${c.rarity} ${u?'':'lock'}"><div class="num">N°${String(c.id).padStart(3,'0')}</div><div class="ico">${u?c.icon:'?'}</div><h3>${u?c.name:'Espèce inconnue'}</h3><div class="meta">${status}</div>${u?`<span class="rarity">${c.rarityLabel}</span>`:''}</article>`}).join('');
}
function resetFishing(copy){clearTimers();phase='idle';encounter=null;timing=null;setFishUi(copy||{});draw()}
function cast(){
  clearTimers();encounter=G.rollCatch(st);timing=G.fishingTiming(encounter);phase='waiting';$('#result').classList.add('hide');setFishUi({status:'Ligne à l’eau',dot:'live',headline:'Patience.',sub:'Le bouchon dérive. S’il ne se passe rien, appuyer relève simplement la canne.',button:'Relever la ligne',float:'waiting',ripple:'waiting'});
  later(()=>{if(phase!=='waiting')return;phase='early';vibrate(30);setFishUi({status:'Présence',dot:'warn',headline:'Ça frémit…',sub:'Un poisson est là, mais ce n’est pas encore la vraie touche.',button:'Relever la ligne',buttonClass:'primary warn',float:'early',ripple:'early'});
    later(()=>{if(phase!=='early')return;phase='strike';vibrate([45,35,90]);setFishUi({status:'TOUCHE',dot:'live',headline:'Ferre maintenant !',sub:`Fenêtre ${timing.difficulty.toLowerCase()} : les espèces rares pardonnent moins.`,button:'FERRER',buttonClass:'primary',float:'strike',ripple:'strike'});
      later(()=>{if(phase!=='strike')return;phase='late';setFishUi({status:'Ça décroche',dot:'bad',headline:'La fenêtre est passée.',sub:'Le poisson est encore là une fraction de seconde, mais il est déjà trop tard.',button:'Ferrer',buttonClass:'primary danger',float:'late',ripple:'late'});
        later(()=>{if(phase!=='late')return;miss('late-auto')},timing.lateMs);
      },timing.strikeMs);
    },timing.earlyMs);
  },timing.waitMs);
}
function retract(){G.registerMiss(st,'retracted');save();resetFishing({status:'Canne relevée',headline:'Rien au bout.',sub:'Tu as relevé la ligne avant qu’un poisson ne se présente.',button:'Relancer la ligne'});toast('Ligne relevée')}
function miss(kind){
  clearTimers();G.registerMiss(st,kind);save();const early=kind==='early';setFishUi({status:'Raté',dot:'bad',headline:early?'Trop tôt.':'Trop tard.',sub:early?'Le poisson a senti le mouvement et s’est éloigné.':'Le poisson a eu le temps de décrocher.',button:'Relancer',buttonClass:'primary',float:'',ripple:''});phase='idle';encounter=null;timing=null;draw();
}
function land(){
  clearTimers();const c=encounter;G.addCatch(st,c);save();phase='idle';encounter=null;timing=null;setFishUi({status:'Prise',dot:'live',headline:'Belle prise.',sub:'Le ferrage était dans la bonne fenêtre.',button:'Relancer',buttonClass:'primary'});$('#result').innerHTML=`<span class="ico">${c.icon}</span><div><b>${c.name}</b><small>${c.rarityLabel} · difficulté ${c.difficulty.toLowerCase()}</small></div><span class="value">${c.value} ◉</span>`;$('#result').classList.remove('hide');draw();
}
$('#cast').onclick=()=>{const action=G.fishingInputOutcome(phase);if(action==='cast')return cast();if(action==='retract')return retract();if(action==='early-miss')return miss('early');if(action==='catch')return land();if(action==='late-miss')return miss('late')};
$('#sell').onclick=()=>{const r=G.sellAll(st);save();toast(`+${r.value} ◉ · ${r.count} prise(s) vendue(s)`);draw()};
$('#pull').onclick=()=>{const r=G.pullGacha(st);if(!r.ok)return draw();save();toast('Nouvelle espèce : '+r.creature.name);draw();go('collection')};
$$('.nav button').forEach(b=>b.onclick=()=>go(b.dataset.s));function go(s){$$('.screen').forEach(x=>x.classList.toggle('on',x.id===s));$$('.nav button').forEach(x=>x.classList.toggle('on',x.dataset.s===s));draw()}
$$('.tabs button').forEach(b=>b.onclick=()=>{filter=b.dataset.f;$$('.tabs button').forEach(x=>x.classList.toggle('on',x===b));cards()});
draw();
