(function(){'use strict';
const G=window.GameCore;
if(!G||G.releaseVersion!=='1.7.0')return;

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
let result=null,revealIndex=-1,busy=false,stage='idle',inspectIndex=0;
const rarityStars={commune:'·',inhabituelle:'◆',rare:'◆◆',epique:'◆◆◆',legendaire:'✦✦✦✦',mythique:'✦✦✦✦✦'};

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c.icon||'🐟')}
function saveState(){try{localStorage.setItem('pm-save',JSON.stringify(G.currentState))}catch(_){}}
function redraw(){try{if(typeof window.draw==='function')window.draw()}catch(_){}}
function buzz(pattern){try{navigator.vibrate&&navigator.vibrate(pattern)}catch(_){}}
function reduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function safeFocus(el){try{el&&typeof el.focus==='function'&&el.focus({preventScroll:true})}catch(_){}}
function later(fn,ms){return setTimeout(fn,reduced()?Math.min(ms,40):ms)}
function rarityBuzz(x){if(!x)return;if(x.rarityIndex>=4)buzz([18,35,28,40,35]);else if(x.rarityIndex>=2)buzz([14,22,18]);else buzz(8)}

function ensureOverlay(){
  const old=$('#boosterOpening');
  if(old&&old.dataset.tactile170==='1')return old;
  if(old)old.remove();
  const overlay=document.createElement('div');
  overlay.id='boosterOpening';overlay.dataset.tactile170='1';overlay.className='booster-opening hide';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Ouverture tactile du booster');
  overlay.innerHTML=`<div class="booster-stage tactile-stage">
    <div class="booster-stage-head">
      <button id="boosterClose" class="booster-icon-button" aria-label="Afficher le bilan ou fermer">×</button>
      <div><small id="boosterStageKicker">BOOSTER</small><h2 id="boosterStageTitle"></h2></div>
      <button id="boosterSkip" class="booster-skip hide">Tout révéler</button>
    </div>
    <div id="boosterStageBody" class="booster-stage-body" aria-live="polite"></div>
    <div class="booster-stage-foot"><div class="booster-progress"><i id="boosterProgress"></i></div><span id="boosterCounter">Prêt</span></div>
  </div>`;
  document.body.appendChild(overlay);
  $('#boosterClose').onclick=handleClose;
  $('#boosterSkip').onclick=revealAll;
  overlay.addEventListener('click',e=>{if(e.target===overlay&&stage==='summary')closeOverlay()});
  return overlay;
}

function refresh(){
  ensureOverlay();
  const s=G.currentState;if(!s)return;
  const button=$('#packPull'),cost=G.cardPackCost(s);
  if(button){setText(button,`Ouvrir ${G.cardPackSize} cartes · ${cost} ◉`);button.disabled=s.coins<cost;button.onclick=openPack}
  const intro=$('.pack-panel h3+p');
  if(intro)setText(intro,'Déchire le booster du doigt, regarde la tranche des cinq cartes puis fais-les défiler une à une. Les garanties et probabilités restent identiques à la V1.6.');
}

function packShell(p){
  return `<div class="opening-intro tactile-opening">
    ${p.special?'<div class="opening-special">BOOSTER SPÉCIAL</div>':''}
    <div id="tactilePack" class="opening-pack tactile-pack pack-${p.skin}" style="--tear-x:0%">
      <div class="opening-pack-foil"></div>
      <div class="pack-lid"></div>
      <div class="opening-pack-top">PÊCHE &amp; MERVEILLES</div>
      <div class="opening-pack-mark">✦</div>
      <strong>${p.type==='abyssal'?'ABYSSAL':p.type==='iridescent'?'IRISÉ':p.name.replace('Booster ','')}</strong>
      <small>${G.cardPackSize} CARTES · ${p.guaranteeLabel}</small>
      <div id="tearZone" class="tear-zone" role="button" tabindex="0" aria-label="Glisser horizontalement pour déchirer le booster">
        <i id="tearFill"></i><span>GLISSE POUR DÉCHIRER</span><b>↔</b>
      </div>
    </div>
    <p class="gesture-copy">Pose ton doigt sur la bande et glisse horizontalement. Les deux sens fonctionnent.</p>
    <button id="tearFallback" class="gesture-fallback">Ouvrir sans geste</button>
  </div>`;
}

function openPack(){
  if(busy)return;
  const s=G.currentState;if(!s)return;
  const r=G.openCardPack(s);
  if(!r.ok){refresh();return}
  result=r;revealIndex=-1;inspectIndex=0;busy=false;stage='pack';
  saveState();redraw();refresh();
  const overlay=ensureOverlay(),body=$('#boosterStageBody');
  overlay.className=`booster-opening booster-${r.booster.type}`;
  $('#boosterStageTitle').textContent=r.booster.name;
  $('#boosterStageKicker').textContent=`BOOSTER #${r.packNumber}`;
  $('#boosterSkip').classList.add('hide');
  $('#boosterProgress').style.width='0%';$('#boosterCounter').textContent='À ouvrir';
  body.innerHTML=packShell(r.booster);
  bindTear();
}

function bindTear(){
  const zone=$('#tearZone'),pack=$('#tactilePack'),fill=$('#tearFill'),fallback=$('#tearFallback');if(!zone||!pack)return;
  let active=false,startX=0,width=1,progress=0;
  const render=p=>{progress=Math.max(0,Math.min(1,p));fill.style.width=(progress*100)+'%';pack.style.setProperty('--tear-x',(progress*112)+'%')};
  const finish=()=>{if(busy||stage!=='pack')return;busy=true;render(1);pack.classList.add('is-torn');buzz([10,28,14]);later(()=>{busy=false;showEdges()},330)};
  zone.onpointerdown=e=>{if(busy)return;active=true;startX=e.clientX;width=Math.max(1,pack.getBoundingClientRect().width);zone.classList.add('is-dragging');try{zone.setPointerCapture(e.pointerId)}catch(_){}};
  zone.onpointermove=e=>{if(!active||busy)return;render(G.boosterTearProgress(startX,e.clientX,width));if(G.boosterTearComplete(progress))finish()};
  const cancel=e=>{if(!active)return;active=false;zone.classList.remove('is-dragging');try{zone.releasePointerCapture(e.pointerId)}catch(_){}if(stage==='pack'&&!busy){render(0);buzz(6)}};
  zone.onpointerup=cancel;zone.onpointercancel=cancel;
  zone.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();finish()}};
  fallback.onclick=finish;
  requestAnimationFrame(()=>safeFocus(zone));
}

function edgeStackHtml(){
  return `<div class="edge-preview">
    <small>AVANT LA RÉVÉLATION</small><h3>Regarde la tranche.</h3>
    <div id="edgeStack" class="edge-stack" style="--fan:9px" role="button" tabindex="0" aria-label="Pile de cinq cartes. Faire glisser pour écarter les tranches, toucher pour retourner la première carte.">
      ${result.cards.map((x,i)=>`<div class="edge-card edge-${G.boosterEdgeSignal(x.rarityIndex)}" style="--i:${i}"><span>✦</span><small>${i+1}</small></div>`).join('')}
    </div>
    <p class="edge-copy">Les cinq tranches sont visibles. Fais glisser légèrement la pile pour les écarter ; une tranche brillante peut trahir quelque chose de rare.</p>
    <p class="gesture-copy"><b>Touche la pile</b> pour retourner la première carte.</p>
    <button id="edgeFallback" class="gesture-fallback">Commencer la révélation</button>
  </div>`;
}

function showEdges(){
  if(!result)return;stage='edges';
  $('#boosterSkip').classList.remove('hide');$('#boosterCounter').textContent='5 cartes';
  $('#boosterStageBody').innerHTML=edgeStackHtml();
  const stack=$('#edgeStack'),fallback=$('#edgeFallback');let active=false,startX=0,moved=0;
  stack.onpointerdown=e=>{active=true;startX=e.clientX;moved=0;try{stack.setPointerCapture(e.pointerId)}catch(_){}};
  stack.onpointermove=e=>{if(!active)return;moved=Math.abs(e.clientX-startX);const fan=Math.max(9,Math.min(20,9+moved*.07));stack.style.setProperty('--fan',fan+'px')};
  stack.onpointerup=e=>{if(!active)return;active=false;try{stack.releasePointerCapture(e.pointerId)}catch(_){}if(moved<12)revealCard(0)};
  stack.onpointercancel=()=>{active=false};
  stack.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();revealCard(0)}};
  fallback.onclick=()=>revealCard(0);
  requestAnimationFrame(()=>safeFocus(stack));
}

function particleBurst(intensity){
  if(intensity==='common'||intensity==='uncommon')return'';
  const count=intensity==='mythic'?18:intensity==='legendary'?14:intensity==='epic'?10:7;
  return `<div class="card-particles">${Array.from({length:count},(_,i)=>`<i style="--i:${i};--n:${count}"></i>`).join('')}</div>`;
}

function cardFace(x,extra=''){
  const c=x.creature,stars=rarityStars[c.rarity]||'',badge=x.firstCard?'<span class="reveal-new">NOUVELLE</span>':`<span class="reveal-copy">COPIE ×${x.copy}</span>`,guarantee=x.guarantee?`<span class="reveal-guarantee">${x.guarantee}</span>`:'';
  return `<article class="reveal-card ${c.rarity} ${extra}">
    <div class="reveal-foil"></div><div class="reveal-card-top"><span>N°${String(c.id).padStart(3,'0')}</span><b>${stars}</b></div>
    <div class="reveal-art">${art(c)}</div><div class="reveal-card-copy">${badge}<h3>${c.name}</h3><p>${c.rarityLabel}</p>${guarantee}</div>
    <div class="reveal-card-foot"><span>${x.firstCard?'Ajoutée à la collection':'Doublon de collection'}</span><strong>${x.value} ◉ au panier</strong></div>
  </article>`;
}

function revealCard(index){
  if(!result||index<0||index>=result.cards.length)return showSummary();
  stage='reveal';revealIndex=index;const x=result.cards[index];
  $('#boosterSkip').classList.remove('hide');$('#boosterCounter').textContent=`${index+1} / ${result.cards.length}`;$('#boosterProgress').style.width=`${((index+1)/result.cards.length)*100}%`;
  $('#boosterStageBody').innerHTML=`<div class="reveal-wrap tactile-reveal-wrap intensity-${x.intensity}">${particleBurst(x.intensity)}<div id="swipeCard" class="swipe-card-shell" role="button" tabindex="0" aria-label="${x.creature.name}. Glisser à gauche ou à droite pour passer à la carte suivante.">${cardFace(x,'tactile-reveal is-visible')}</div><div class="swipe-hint"><span>←</span><b>Glisse la carte</b><span>→</span><small>${index+1===result.cards.length?'pour voir le bilan':'pour révéler la suivante'}</small></div></div>`;
  rarityBuzz(x);bindCardSwipe($('#swipeCard'),index);requestAnimationFrame(()=>safeFocus($('#swipeCard')));
}

function bindCardSwipe(shell,index){
  if(!shell)return;let active=false,startX=0,startY=0,startAt=0,dx=0,dy=0;
  const card=shell.querySelector('.reveal-card');
  const reset=()=>{card.style.transition='transform .24s cubic-bezier(.2,.8,.2,1),opacity .2s ease';card.style.transform='translate3d(0,0,0) rotate(0deg) scale(1)';card.style.opacity='1';later(()=>{card.style.transition=''},250)};
  const advance=dir=>{if(busy)return;busy=true;card.style.transition='transform .23s cubic-bezier(.2,.75,.2,1),opacity .2s ease';card.style.transform=`translate3d(${dir*125}vw,${Math.min(36,Math.abs(dy)*.15)}px,0) rotate(${dir*18}deg) scale(.96)`;card.style.opacity='.08';buzz(8);later(()=>{busy=false;if(index+1<result.cards.length)revealCard(index+1);else showSummary()},230)};
  shell.onpointerdown=e=>{if(busy)return;active=true;startX=e.clientX;startY=e.clientY;startAt=performance.now();dx=dy=0;card.style.transition='none';try{shell.setPointerCapture(e.pointerId)}catch(_){}};
  shell.onpointermove=e=>{if(!active||busy)return;dx=e.clientX-startX;dy=e.clientY-startY;const rot=Math.max(-11,Math.min(11,dx/24));const lift=Math.max(-18,Math.min(18,dy*.08));card.style.transform=`translate3d(${dx}px,${lift}px,0) rotate(${rot}deg) scale(1)`;card.style.opacity=String(Math.max(.55,1-Math.abs(dx)/520))};
  const end=e=>{if(!active)return;active=false;try{shell.releasePointerCapture(e.pointerId)}catch(_){}const dir=G.boosterCardSwipeDecision(dx,shell.getBoundingClientRect().width,performance.now()-startAt);if(dir)advance(dir);else reset()};
  shell.onpointerup=end;shell.onpointercancel=end;
  shell.onkeydown=e=>{if(e.key==='ArrowLeft'){e.preventDefault();advance(-1)}else if(e.key==='ArrowRight'||e.key==='Enter'||e.key===' '){e.preventDefault();advance(1)}};
}

function revealAll(){if(!result)return;showSummary()}

function summaryCards(){return result.cards.map((x,i)=>`<button class="summary-mini ${x.creature.rarity}" data-summary-card="${i}" aria-label="Revoir ${x.creature.name} en grand"><span>${art(x.creature)}</span><b>${x.creature.name}</b><small>${x.creature.rarityLabel}${x.firstCard?' · NEW':''}</small></button>`).join('')}

function showSummary(){
  if(!result)return;stage='summary';revealIndex=result.cards.length;$('#boosterSkip').classList.add('hide');$('#boosterCounter').textContent='Terminé';$('#boosterProgress').style.width='100%';
  const special=result.specialBooster?`<span class="summary-special">${result.booster.name}</span>`:'';
  $('#boosterStageBody').innerHTML=`<div class="booster-summary intensity-${result.bestIntensity}">${special}<small>BOOSTER #${result.packNumber}</small><h3>${result.jackpot?'Tirage exceptionnel':'Booster ouvert'}</h3><p><b>${result.newCards}</b> nouvelle${result.newCards>1?'s':''} · <b>${result.duplicates}</b> doublon${result.duplicates>1?'s':''} · meilleure : <b>${result.bestRarityLabel}</b></p><div class="summary-strip tactile-summary">${summaryCards()}</div><p class="summary-tap-hint">Touche une carte pour la revoir en grand.</p>${result.rareProtectionTriggered?'<div class="summary-protection">La protection Rare+ s’est déclenchée sur ce booster.</div>':''}<div class="summary-actions"><button id="summaryClose" class="secondary">Terminer</button><button id="summaryAgain" class="primary">Ouvrir encore · ${G.cardPackCost(G.currentState)} ◉</button></div></div>`;
  $$('#boosterStageBody [data-summary-card]').forEach(b=>b.onclick=()=>inspectCard(Number(b.dataset.summaryCard)));
  $('#summaryClose').onclick=closeOverlay;const again=$('#summaryAgain');again.disabled=G.currentState.coins<G.cardPackCost(G.currentState);again.onclick=()=>{closeOverlay();later(openPack,120)};
  if(result.jackpot)buzz([22,45,32,60,42]);requestAnimationFrame(()=>safeFocus($('[data-summary-card]')));
}

function inspectCard(index){
  if(!result)return;stage='inspect';inspectIndex=Math.max(0,Math.min(result.cards.length-1,index));const x=result.cards[inspectIndex];
  $('#boosterCounter').textContent=`${inspectIndex+1} / ${result.cards.length}`;
  $('#boosterStageBody').innerHTML=`<div class="inspect-wrap"><div class="inspect-toolbar"><button id="inspectBack" class="inspect-back">‹ Bilan</button><span>Carte ${inspectIndex+1} / ${result.cards.length}</span></div><div id="inspectCard" class="inspect-card-shell" tabindex="0">${cardFace(x,'inspect-card is-visible')}</div><div class="inspect-nav"><button id="inspectPrev" aria-label="Carte précédente">←</button><small>Fais glisser le doigt sur la carte pour incliner le reflet.</small><button id="inspectNext" aria-label="Carte suivante">→</button></div></div>`;
  $('#inspectBack').onclick=showSummary;$('#inspectPrev').disabled=inspectIndex===0;$('#inspectNext').disabled=inspectIndex===result.cards.length-1;$('#inspectPrev').onclick=()=>inspectCard(inspectIndex-1);$('#inspectNext').onclick=()=>inspectCard(inspectIndex+1);bindInspectTilt($('#inspectCard'));requestAnimationFrame(()=>safeFocus($('#inspectCard')));
}

function bindInspectTilt(shell){
  if(!shell)return;const card=shell.querySelector('.reveal-card');let active=false;
  const apply=e=>{const r=shell.getBoundingClientRect(),px=Math.max(0,Math.min(1,(e.clientX-r.left)/Math.max(1,r.width))),py=Math.max(0,Math.min(1,(e.clientY-r.top)/Math.max(1,r.height))),ry=(px-.5)*14,rx=(.5-py)*10;card.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.015)`;card.style.setProperty('--shine-x',(px*100)+'%');card.style.setProperty('--shine-y',(py*100)+'%')};
  shell.onpointerdown=e=>{active=true;try{shell.setPointerCapture(e.pointerId)}catch(_){}apply(e)};shell.onpointermove=e=>{if(active)apply(e)};const end=e=>{active=false;try{shell.releasePointerCapture(e.pointerId)}catch(_){}card.style.transition='transform .28s ease';card.style.transform='perspective(900px) rotateX(0) rotateY(0) scale(1)';later(()=>{card.style.transition=''},300)};shell.onpointerup=end;shell.onpointercancel=end;
  shell.onkeydown=e=>{if(e.key==='ArrowLeft'&&inspectIndex>0){e.preventDefault();inspectCard(inspectIndex-1)}else if(e.key==='ArrowRight'&&inspectIndex<result.cards.length-1){e.preventDefault();inspectCard(inspectIndex+1)}else if(e.key==='Escape'){e.preventDefault();showSummary()}};
}

function handleClose(){if(stage==='inspect')return showSummary();if(result&&stage!=='summary'&&stage!=='idle')return showSummary();closeOverlay()}
function closeOverlay(){const overlay=ensureOverlay();overlay.className='booster-opening hide';result=null;revealIndex=-1;busy=false;stage='idle';saveState();redraw();refresh();safeFocus($('#packPull'))}

function hook(){ensureOverlay();refresh();const button=$('#packPull');if(button)button.onclick=openPack}
let scheduled=false;new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;if(stage==='idle')refresh()})}).observe(document.body,{subtree:true,childList:true,characterData:true});
hook();
})();
