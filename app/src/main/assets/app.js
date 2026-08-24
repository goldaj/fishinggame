(function(){
  'use strict';
  const G=window.GameCore;
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const storageKey='peche-merveilles-save-v1';
  let state=load();
  let fishingPhase='idle', biteTimer=null, missTimer=null, toastTimer=null, collectionFilter='all';

  function load(){
    try{return G.normalizeState(JSON.parse(localStorage.getItem(storageKey)||'null'));}catch(e){return G.defaultState();}
  }
  function save(){ localStorage.setItem(storageKey,JSON.stringify(state)); }
  function vibrate(pattern){ try{if(navigator.vibrate) navigator.vibrate(pattern);}catch(e){} }
  function fmt(n){return Number(n||0).toLocaleString('fr-FR');}
  function plural(n,s,p){return n+' '+(n>1?p:s);}

  function toast(msg){
    const el=$('#toast'); el.textContent=msg; el.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.add('hidden'),1900);
  }

  function renderHeader(){
    $('#coins').textContent=fmt(state.coins);
    const info=G.nextRankInfo(state.totalSold);
    $('#rankLabel').textContent='Rang '+info.rank;
    $('#rankProgress').style.width=(info.progress*100)+'%';
    $('#rankProgressText').textContent=info.next===null?'Rang maximum':`${state.totalSold} / ${info.next} ventes`;
  }

  function renderFish(){
    $('#unlockedStat').textContent=`${state.unlocked.length} / 100`;
    $('#bagStat').textContent=plural(G.inventoryCount(state),'prise','prises');
    $('#caughtStat').textContent=plural(state.totalCaught,'pêchée','pêchées');
    const badge=$('#streakBadge');
    if((state.streak||0)>=2){$('#streakCount').textContent=state.streak;badge.classList.remove('hidden');}else badge.classList.add('hidden');
  }

  function startFishing(){
    if(fishingPhase!=='idle') return;
    fishingPhase='waiting';
    $('#catchResult').classList.add('hidden');
    $('#float').className='float waiting';
    $('#castBtn').disabled=true; $('#castBtn').className='primary big'; $('#castBtn').textContent='La ligne est à l’eau…';
    $('#fishHeadline').textContent='Quelque chose rôde dessous.';
    $('#fishSub').textContent='Observe le bouchon. Ne tape pas trop tôt.';
    const delay=500+Math.random()*900;
    biteTimer=setTimeout(beginBite,delay);
  }
  function beginBite(){
    if(fishingPhase!=='waiting') return;
    fishingPhase='bite'; vibrate([35,35,55]);
    $('#float').className='float bite';
    $('#castBtn').disabled=false; $('#castBtn').className='primary big alert'; $('#castBtn').textContent='FERRER !';
    $('#fishHeadline').textContent='ÇA MORD !'; $('#fishSub').textContent='Maintenant. Tire la ligne !';
    missTimer=setTimeout(missFish,1900);
  }
  function missFish(){
    if(fishingPhase!=='bite') return;
    fishingPhase='idle'; state.streak=0; save(); renderFish();
    $('#float').className='float hidden';
    $('#castBtn').disabled=false; $('#castBtn').className='primary big'; $('#castBtn').textContent='Relancer la ligne';
    $('#fishHeadline').textContent='Trop tard…'; $('#fishSub').textContent='La prise s’est échappée. La prochaine sera moins insolente.';
  }
  function hookFish(){
    if(fishingPhase==='idle'){startFishing();return;}
    if(fishingPhase!=='bite') return;
    clearTimeout(missTimer); fishingPhase='idle'; vibrate(70);
    const c=G.rollCatch(state); G.addCatch(state,c); save();
    $('#float').className='float hidden';
    $('#castBtn').disabled=false; $('#castBtn').className='primary big'; $('#castBtn').textContent='Relancer la ligne';
    $('#fishHeadline').textContent='Belle prise !'; $('#fishSub').textContent='Elle rejoint ton panier, prête à être vendue au marché.';
    const el=$('#catchResult');
    el.innerHTML=`<div class="big-icon">${c.icon}</div><div><strong>${c.name}</strong><small>${c.rarityLabel} · valeur ${c.value} ◉</small></div>`;
    el.classList.remove('hidden');
    renderAll();
  }

  function renderMarket(){
    const value=G.inventoryValue(state), count=G.inventoryCount(state);
    $('#marketValue').textContent=fmt(value)+' ◉';
    const btn=$('#sellAllBtn'); btn.disabled=count===0; btn.textContent=count?`Tout vendre · ${fmt(value)} ◉`:'Panier vide';
    const rows=Object.entries(state.inventory).filter(([,q])=>q>0).sort((a,b)=>G.creatures[a[0]-1].rarity.localeCompare(G.creatures[b[0]-1].rarity));
    $('#inventoryList').innerHTML=rows.length?rows.map(([id,q])=>{
      const c=G.creatures[id-1]; return `<div class="inventory-row"><div class="iicon">${c.icon}</div><div class="info"><strong>${c.name}</strong><small>${c.rarityLabel} · ${c.value} ◉ pièce</small></div><div class="qty"><b>×${q}</b><small>${fmt(c.value*q)} ◉</small></div></div>`;
    }).join(''):'<div class="empty">Ton panier est vide.<br><small>Les poissons ont remporté cette manche.</small></div>';
  }
  function sellAll(){
    const beforeRank=G.rankForSold(state.totalSold), res=G.sellAll(state); if(!res.count)return;
    const afterRank=G.rankForSold(state.totalSold); save(); renderAll(); vibrate(45);
    toast(`${res.count} prise${res.count>1?'s':''} vendue${res.count>1?'s':''} · +${fmt(res.value)} ◉`);
    if(afterRank>beforeRank) setTimeout(()=>showRankUp(afterRank),350);
  }

  function renderGacha(){
    const cost=G.gachaCost(state), pool=G.eligibleLocked(state), rank=G.rankForSold(state.totalSold), btn=$('#gachaBtn');
    btn.textContent=`Tirer une nouvelle espèce · ${cost} ◉`;
    let status='';
    if(state.unlocked.length===100){status='<strong>Collection complète.</strong> La mer peut enfin déposer une plainte.'; btn.disabled=true;}
    else if(!pool.length){const gate=G.nextGate(state);status=`Aucune nouvelle espèce accessible. Atteins le <strong>rang ${gate}</strong>.`;btn.disabled=true;}
    else if(state.coins<cost){status=`${pool.length} espèce${pool.length>1?'s':''} accessible${pool.length>1?'s':''} au rang ${rank}. Il te manque <strong>${cost-state.coins} ◉</strong>.`;btn.disabled=true;}
    else{status=`${pool.length} nouvelle${pool.length>1?'s':''} espèce${pool.length>1?'s':''} possible${pool.length>1?'s':''}. <strong>Zéro doublon.</strong>`;btn.disabled=false;}
    $('#gachaStatus').innerHTML=status;
    const odds=G.gachaOdds(state);
    $('#oddsPanel').innerHTML=odds.length?odds.map(o=>`<div class="odd-row"><span>${o.label}</span><span>${(o.p*100).toFixed(o.p<.01?2:1)} %</span></div>`).join(''):'<div class="odd-row"><span>Aucun tirage disponible</span><span>—</span></div>';
  }
  function doGacha(){
    const result=G.pullGacha(state); if(!result.ok){renderAll();return;}
    save(); renderAll(); vibrate([45,40,45,40,90]);
    showReveal(result.creature,result.cost);
  }

  function renderCollection(){
    $('#collectionCount').textContent=state.unlocked.length;
    const rank=G.rankForSold(state.totalSold);
    const list=G.creatures.filter(c=>collectionFilter==='all'||(collectionFilter==='unlocked'&&state.unlocked.includes(c.id))||(collectionFilter==='locked'&&!state.unlocked.includes(c.id)));
    $('#collectionGrid').innerHTML=list.map(c=>{
      const unlocked=state.unlocked.includes(c.id); const gateText=c.gate<=rank?'Disponible au gacha':`Rang ${c.gate} requis`;
      return `<article class="creature-card ${c.rarity} ${unlocked?'':'locked'}" data-id="${c.id}">
        <div class="card-id">N° ${String(c.id).padStart(3,'0')}</div>
        <div class="card-icon">${unlocked?c.icon:'?'}</div>
        <h3>${unlocked?c.name:'Espèce inconnue'}</h3>
        <div class="rarity">${unlocked?c.rarityLabel:'Non identifiée'}</div>
        ${unlocked?`<div class="value">${c.value} ◉</div>`:`<div class="lock-note">${gateText}</div>`}
      </article>`;
    }).join('');
  }

  function showCreatureDetails(c){
    const caught=state.caughtById[c.id]||0;
    openModal(`<div class="modal-icon">${c.icon}</div><span class="rarity-chip">${c.rarityLabel}</span><h2>${c.name}</h2><p>Carte N° ${String(c.id).padStart(3,'0')} · Rang d’accès ${c.gate}</p><p><strong>Valeur :</strong> ${c.value} ◉<br><strong>Pêchée :</strong> ${caught} fois</p><div class="modal-actions"><button class="primary" data-close>Fermer</button></div>`);
  }
  function showReveal(c,cost){
    openModal(`<div class="modal-icon">${c.icon}</div><span class="rarity-chip">${c.rarityLabel}</span><h2>${c.name}</h2><p>Nouvelle espèce débloquée. Elle peut désormais mordre à ta ligne et sa carte rejoint ta collection.</p><p><strong>Valeur de vente :</strong> ${c.value} ◉</p><div class="modal-actions"><button class="secondary" data-close>Fermer</button><button class="primary" data-goto="fish">La pêcher</button></div>`);
  }
  function showRankUp(rank){
    const unlockedNow=G.creatures.filter(c=>c.gate===rank&&!state.unlocked.includes(c.id)).length;
    openModal(`<div class="modal-icon">⚓</div><div class="eyebrow">NOUVEL HORIZON</div><h2>Rang ${rank} atteint</h2><p>Ta réputation au port grandit. ${unlockedNow?`${unlockedNow} nouvelle${unlockedNow>1?'s':''} espèce${unlockedNow>1?'s':''} entre${unlockedNow>1?'nt':''} maintenant dans le gacha.`:'De nouvelles profondeurs deviennent accessibles.'}</p><div class="modal-actions"><button class="primary" data-close>Continuer</button></div>`);
  }
  function openModal(html){$('#modalCard').innerHTML=html;$('#modal').classList.remove('hidden');}
  function closeModal(){ $('#modal').classList.add('hidden'); }

  const tutorial=[
    {icon:'🎣',title:'Pêche',text:'Lance la ligne. Quand le bouchon s’agite et que “FERRER !” apparaît, touche le bouton avant que la prise ne s’échappe.'},
    {icon:'◉',title:'Vends tes prises',text:'Le marché transforme ton panier en pièces. Le nombre de prises vendues augmente aussi ton rang et ouvre de nouvelles espèces.'},
    {icon:'✦',title:'Agrandis tes eaux',text:'Chaque tirage du gacha débloque une espèce inédite. Sa carte apparaît dans la collection et elle devient immédiatement pêchable.'}
  ];
  function showTutorial(step=0){
    const t=tutorial[step];
    const dots=tutorial.map((_,i)=>`<span class="${i===step?'on':''}"></span>`).join('');
    openModal(`<div class="modal-icon">${t.icon}</div><div class="eyebrow">BIENVENUE AU PORT</div><h2>${t.title}</h2><p>${t.text}</p><div class="tutorial-dots">${dots}</div><div class="modal-actions">${step>0?'<button class="secondary" data-tutorial="'+(step-1)+'">Retour</button>':'<button class="secondary" data-skip>Passer</button>'}<button class="primary" ${step<tutorial.length-1?'data-tutorial="'+(step+1)+'"':'data-finish-tutorial'}>${step<tutorial.length-1?'Suivant':'Pêcher'}</button></div>`);
  }
  function finishTutorial(){state.tutorialSeen=true;save();closeModal();}

  function gotoScreen(name){
    $$('.screen').forEach(x=>x.classList.toggle('active',x.id==='screen-'+name));
    $$('.nav').forEach(x=>x.classList.toggle('active',x.dataset.screen===name));
    window.scrollTo(0,0); renderAll();
  }
  function renderAll(){renderHeader();renderFish();renderMarket();renderGacha();renderCollection();}

  $('#castBtn').addEventListener('click',hookFish);
  $('#sellAllBtn').addEventListener('click',sellAll);
  $('#gachaBtn').addEventListener('click',doGacha);
  $('#oddsBtn').addEventListener('click',()=>$('#oddsPanel').classList.toggle('hidden'));
  $$('.nav').forEach(b=>b.addEventListener('click',()=>gotoScreen(b.dataset.screen)));
  $$('.filter').forEach(b=>b.addEventListener('click',()=>{collectionFilter=b.dataset.filter;$$('.filter').forEach(x=>x.classList.toggle('active',x===b));renderCollection();}));
  $('#collectionGrid').addEventListener('click',e=>{const card=e.target.closest('.creature-card');if(!card)return;const id=Number(card.dataset.id);if(state.unlocked.includes(id))showCreatureDetails(G.creatures[id-1]);});
  $('#modal').addEventListener('click',e=>{
    const t=e.target;
    if(t.matches('.modal-backdrop,[data-close]')) closeModal();
    if(t.dataset.goto){closeModal();gotoScreen(t.dataset.goto);}
    if(t.dataset.tutorial!==undefined) showTutorial(Number(t.dataset.tutorial));
    if(t.hasAttribute('data-finish-tutorial')) finishTutorial();
    if(t.hasAttribute('data-skip')) finishTutorial();
  });

  renderAll();
  if(!state.tutorialSeen) setTimeout(()=>showTutorial(0),220);
})();
