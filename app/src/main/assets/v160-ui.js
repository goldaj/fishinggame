(function(){'use strict';
const G=window.GameCore;
if(!G)return;

const $=s=>document.querySelector(s);
const setText=(el,text)=>{if(el&&el.textContent!==text)el.textContent=text};
let result=null,revealIndex=-1,busy=false;
const rarityStars={commune:'·',inhabituelle:'◆',rare:'◆◆',epique:'◆◆◆',legendaire:'✦✦✦✦',mythique:'✦✦✦✦✦'};

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c.icon||'🐟')}
function saveState(){try{localStorage.setItem('pm-save',JSON.stringify(G.currentState))}catch(_){}}
function redraw(){try{if(typeof window.draw==='function')window.draw()}catch(_){}}
function buzz(pattern){try{navigator.vibrate&&navigator.vibrate(pattern)}catch(_){}}
function reduced(){return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}
function safeFocus(el){try{el&&typeof el.focus==='function'&&el.focus({preventScroll:true})}catch(_){}}

function ensurePreview(){
  const panel=$('.pack-panel');if(!panel)return;
  let preview=$('#boosterPreview');
  if(!preview){
    preview=document.createElement('div');
    preview.id='boosterPreview';
    preview.className='booster-preview';
    const button=$('#packPull');
    panel.insertBefore(preview,button);
  }
  let overlay=$('#boosterOpening');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='boosterOpening';
    overlay.className='booster-opening hide';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Ouverture du booster');
    overlay.innerHTML=`
      <div class="booster-stage">
        <div class="booster-stage-head">
          <button id="boosterClose" class="booster-icon-button" aria-label="Afficher le bilan ou fermer">×</button>
          <div><small id="boosterStageKicker">BOOSTER</small><h2 id="boosterStageTitle"></h2></div>
          <button id="boosterSkip" class="booster-skip hide">Tout révéler</button>
        </div>
        <div id="boosterStageBody" class="booster-stage-body" aria-live="polite"></div>
        <div class="booster-stage-foot">
          <div class="booster-progress"><i id="boosterProgress"></i></div>
          <span id="boosterCounter">Prêt</span>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    $('#boosterClose').onclick=()=>closeOverlay(false);
    $('#boosterSkip').onclick=revealAll;
    overlay.addEventListener('click',e=>{if(e.target===overlay&&revealIndex>=G.cardPackSize)closeOverlay(true)});
  }
}

function previewHtml(p,status){
  const special=p.special?'<span class="booster-special-badge">SPÉCIAL</span>':'';
  const iridescent=status.packsUntilIridescent===1?'Irisé au prochain':`Irisé dans ${status.packsUntilIridescent}`;
  const abyssal=status.packsUntilAbyssal===1?'Abyssal au prochain':`Abyssal dans ${status.packsUntilAbyssal}`;
  return `
    <div class="mini-pack pack-${p.skin}" aria-hidden="true">
      <div class="mini-pack-shine"></div><span>✦</span><b>${p.type==='abyssal'?'ABYSSAL':p.type==='iridescent'?'IRISÉ':'P&M'}</b><small>${G.cardPackSize} CARTES</small>
    </div>
    <div class="booster-preview-copy">${special}<small>PROCHAIN · #${p.packNumber}</small><h4>${p.name}</h4><p>${p.guaranteeLabel}</p><div class="booster-preview-status"><span>Rare+ ≤ ${status.packsUntilRareGuarantee}</span><span>${iridescent}</span><span>${abyssal}</span></div></div>`;
}

function refreshPreview(){
  ensurePreview();
  const s=G.currentState;if(!s)return;
  const p=G.cardBoosterPreview(s),status=G.cardBoosterStatus(s),rules=G.cardBoosterRules;
  const preview=$('#boosterPreview');
  if(preview){
    const renderKey=[p.packNumber,p.type,p.skin,status.packsUntilRareGuarantee,status.packsUntilIridescent,status.packsUntilAbyssal].join('|');
    if(preview.dataset.renderKey!==renderKey){
      preview.dataset.renderKey=renderKey;
      preview.className=`booster-preview preview-${p.type}`;
      preview.innerHTML=previewHtml(p,status);
    }
  }
  const intro=$('.pack-panel h3+p');
  setText(intro,`Chaque booster contient ${G.cardPackSize} cartes et se révèle carte par carte. La dernière est au minimum Inhabituelle ; une Rare+ est protégée au plus tard tous les ${rules.rarePityPacks} boosters. Tous les ${rules.iridescentEvery} boosters, un Irisé garantit Rare+ ; tous les ${rules.abyssalEvery}, un Abyssal garantit Rare+ puis Épique+.`);
  const quality=$('#packQuality');setText(quality,p.guaranteeLabel);
  const pity=$('#packPity');setText(pity,status.guaranteedNext?'Rare+ garantie au prochain':`Rare+ dans ≤ ${status.packsUntilRareGuarantee} booster${status.packsUntilRareGuarantee>1?'s':''}`);
  const button=$('#packPull');if(button){setText(button,`Ouvrir ${G.cardPackSize} cartes · ${G.cardPackCost(s)} ◉`);button.disabled=s.coins<G.cardPackCost(s)}
}

function packShell(p){
  return `<div class="opening-intro">
    ${p.special?'<div class="opening-special">BOOSTER SPÉCIAL</div>':''}
    <div class="opening-pack pack-${p.skin}">
      <div class="opening-pack-foil"></div>
      <div class="opening-pack-top">PÊCHE &amp; MERVEILLES</div>
      <div class="opening-pack-mark">✦</div>
      <strong>${p.type==='abyssal'?'ABYSSAL':p.type==='iridescent'?'IRISÉ':p.name.replace('Booster ','')}</strong>
      <small>${G.cardPackSize} CARTES · ${p.guaranteeLabel}</small>
      <div class="opening-pack-tear"></div>
    </div>
    <button id="tearBooster" class="primary booster-open-action">Déchirer le booster</button>
    <p>Animation courte. Tu peux ensuite tout révéler d’un coup.</p>
  </div>`;
}

function openPack(){
  if(busy)return;
  const s=G.currentState;if(!s)return;
  const r=G.openCardPack(s);
  if(!r.ok){refreshPreview();return}
  result=r;revealIndex=-1;busy=false;
  saveState();redraw();refreshPreview();
  const overlay=$('#boosterOpening'),body=$('#boosterStageBody');
  overlay.className=`booster-opening booster-${r.booster.type}`;
  $('#boosterStageTitle').textContent=r.booster.name;
  $('#boosterStageKicker').textContent=`BOOSTER #${r.packNumber}`;
  $('#boosterSkip').classList.add('hide');
  $('#boosterProgress').style.width='0%';
  $('#boosterCounter').textContent='Prêt';
  body.innerHTML=packShell(r.booster);
  const tear=$('#tearBooster');
  tear.onclick=()=>{
    if(busy)return;busy=true;
    buzz([12,35,18]);
    $('.opening-pack').classList.add('is-torn');
    tear.disabled=true;
    setTimeout(()=>{busy=false;$('#boosterSkip').classList.remove('hide');revealNext()},reduced()?40:380);
  };
  requestAnimationFrame(()=>safeFocus(tear));
}

function particleBurst(intensity){
  if(intensity==='common'||intensity==='uncommon')return'';
  const count=intensity==='mythic'?18:intensity==='legendary'?14:intensity==='epic'?10:7;
  return `<div class="card-particles">${Array.from({length:count},(_,i)=>`<i style="--i:${i};--n:${count}"></i>`).join('')}</div>`;
}

function cardHtml(x,index){
  const c=x.creature,stars=rarityStars[c.rarity]||'';
  const badge=x.firstCard?'<span class="reveal-new">NOUVELLE</span>':`<span class="reveal-copy">COPIE ×${x.copy}</span>`;
  const guarantee=x.guarantee?`<span class="reveal-guarantee">${x.guarantee}</span>`:'';
  return `<div class="reveal-wrap intensity-${x.intensity}">
    ${particleBurst(x.intensity)}
    <article class="reveal-card ${c.rarity}">
      <div class="reveal-foil"></div>
      <div class="reveal-card-top"><span>N°${String(c.id).padStart(3,'0')}</span><b>${stars}</b></div>
      <div class="reveal-art">${art(c)}</div>
      <div class="reveal-card-copy">${badge}<h3>${c.name}</h3><p>${c.rarityLabel}</p>${guarantee}</div>
      <div class="reveal-card-foot"><span>${x.firstCard?'Ajoutée à la collection':'Doublon de collection'}</span><strong>${x.value} ◉ au panier</strong></div>
    </article>
    <button id="nextReveal" class="primary reveal-next">${index+1<G.cardPackSize?'Carte suivante':'Voir le bilan'}</button>
  </div>`;
}

function revealNext(){
  if(!result||busy)return;
  revealIndex++;
  if(revealIndex>=result.cards.length){return showSummary()}
  const x=result.cards[revealIndex];
  $('#boosterStageBody').innerHTML=cardHtml(x,revealIndex);
  $('#boosterCounter').textContent=`${revealIndex+1} / ${result.cards.length}`;
  $('#boosterProgress').style.width=`${((revealIndex+1)/result.cards.length)*100}%`;
  if(x.rarityIndex>=4)buzz([18,35,28,40,35]);else if(x.rarityIndex>=2)buzz([14,22,18]);else buzz(8);
  requestAnimationFrame(()=>{const card=$('.reveal-card');if(card)card.classList.add('is-visible');safeFocus($('#nextReveal'))});
  $('#nextReveal').onclick=revealNext;
}

function revealAll(){
  if(!result)return;
  revealIndex=result.cards.length;
  showSummary();
}

function summaryCards(){
  return result.cards.map(x=>`<div class="summary-mini ${x.creature.rarity}"><span>${art(x.creature)}</span><b>${x.creature.name}</b><small>${x.creature.rarityLabel}${x.firstCard?' · NEW':''}</small></div>`).join('');
}

function showSummary(){
  if(!result)return;
  revealIndex=result.cards.length;
  $('#boosterSkip').classList.add('hide');
  $('#boosterCounter').textContent='Terminé';
  $('#boosterProgress').style.width='100%';
  const special=result.specialBooster?`<span class="summary-special">${result.booster.name}</span>`:'';
  $('#boosterStageBody').innerHTML=`<div class="booster-summary intensity-${result.bestIntensity}">
    ${special}<small>BOOSTER #${result.packNumber}</small><h3>${result.jackpot?'Tirage exceptionnel':'Booster ouvert'}</h3>
    <p><b>${result.newCards}</b> nouvelle${result.newCards>1?'s':''} · <b>${result.duplicates}</b> doublon${result.duplicates>1?'s':''} · meilleure : <b>${result.bestRarityLabel}</b></p>
    <div class="summary-strip">${summaryCards()}</div>
    ${result.rareProtectionTriggered?'<div class="summary-protection">La protection Rare+ s’est déclenchée sur ce booster.</div>':''}
    <div class="summary-actions"><button id="summaryClose" class="secondary">Terminer</button><button id="summaryAgain" class="primary">Ouvrir encore · ${G.cardPackCost(G.currentState)} ◉</button></div>
  </div>`;
  $('#summaryClose').onclick=()=>closeOverlay(true);
  const again=$('#summaryAgain');
  again.disabled=G.currentState.coins<G.cardPackCost(G.currentState);
  again.onclick=()=>{closeOverlay(true);setTimeout(openPack,reduced()?0:120)};
  if(result.jackpot)buzz([22,45,32,60,42]);
  requestAnimationFrame(()=>safeFocus($('#summaryClose')));
}

function closeOverlay(force){
  if(!force&&result&&revealIndex<result.cards.length){revealAll();return}
  const overlay=$('#boosterOpening');if(overlay)overlay.className='booster-opening hide';
  result=null;revealIndex=-1;busy=false;
  saveState();redraw();refreshPreview();
  safeFocus($('#packPull'));
}

function hook(){
  ensurePreview();refreshPreview();
  const button=$('#packPull');if(button)button.onclick=openPack;
}

let scheduled=false;
new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refreshPreview()})}).observe(document.body,{subtree:true,childList:true,characterData:true});
hook();
})();
