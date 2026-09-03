(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const rarityStars={commune:'·',inhabituelle:'◆',rare:'◆◆',epique:'◆◆◆',legendaire:'✦✦✦✦',mythique:'✦✦✦✦✦'};
let scheduled=false;

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c&&c.icon||'🐟')}
function fmtCoins(v){return Math.max(0,Math.round(Number(v)||0)).toLocaleString('fr-FR')+' ◉'}
function fmtWeight(g){g=Math.round(Number(g)||0);if(g>=1000){const kg=g/1000;return (kg>=100?kg.toFixed(1):kg.toFixed(2)).replace('.',',')+' kg'}return g+' g'}
function cardNumber(c){return c&&c.isTrash?'D-'+String((G.trashTypes||[]).findIndex(t=>t.id===c.id)+1).padStart(3,'0'):'N°'+String(c&&c.id||0).padStart(3,'0')}
function saveState(){try{localStorage.setItem('pm-save',JSON.stringify(G.currentState))}catch(_){}}
function redraw(){try{if(typeof window.draw==='function')window.draw()}catch(_){}}
function toast(text){const el=$('#toast');if(!el)return;el.textContent=text;el.classList.remove('hide');clearTimeout(toast._t);toast._t=setTimeout(()=>el.classList.add('hide'),2200)}

function addRarityEdge(el){
  if(!el||el.querySelector(':scope > .rarity-edge-v210'))return;
  const edge=document.createElement('i');edge.className='rarity-edge-v210';edge.setAttribute('aria-hidden','true');el.appendChild(edge);
}
function patchRarityEdges(){
  $$('.reveal-card').forEach(addRarityEdge);
  $$('#cards .card').forEach(addRarityEdge);
}

function ensurePityRow(){
  const anchor=$('#fishingOddsV208')||$('#fish .hint');if(!anchor||!G.currentState||typeof G.newCardPityStatus!=='function')return;
  let row=$('#newCardPityV210');
  if(!row){row=document.createElement('div');row.id='newCardPityV210';row.className='new-card-pity-v210';anchor.insertAdjacentElement('afterend',row)}
  const x=G.newCardPityStatus(G.currentState),pct=(x.chance*100).toFixed(1).replace('.',',');
  const text=x.chance>=x.max
    ?`Bonus nouvelle carte : <b>${pct} %</b> · plafond atteint après ${x.dryStreak} prises sans nouveauté`
    :`Bonus nouvelle carte : <b>${pct} %</b> · +0,1 point par prise sans nouveauté`;
  if(row.innerHTML!==text)row.innerHTML=text;
}

function patchMissingPrices(){
  const s=G.currentState;if(!s)return;
  $$('#cards [data-card]').forEach(button=>{
    const c=G.collectionCardById(Number(button.dataset.card));if(!c)return;
    let price=button.querySelector('.missing-price-v210');
    const missing=!c.isTrash&&!G.isKnownInCollection(s,c),cost=missing?G.cardPurchasePrice(c):null;
    if(!missing){if(price)price.remove();return}
    if(!price){price=document.createElement('div');price.className='missing-price-v210';button.appendChild(price)}
    price.textContent=`Achetable · ${fmtCoins(cost)}`;
  });
}

function fullCardHtml(c,known,copies){
  const stars=rarityStars[c.rarity]||'',badge=known?`<span class="reveal-copy">CARTE ×${copies}</span>`:'<span class="reveal-new">NON POSSÉDÉE</span>';
  const rarity=c.isTrash?'Commune · Déchet':c.rarityLabel;
  const footLeft=known?'Collection':'À découvrir ou acheter';
  const footRight=c.isTrash?'Pêche uniquement':`Rang ${c.gate}`;
  return `<article class="reveal-card ${c.rarity} collection-card-preview-v210 is-visible">
    <div class="reveal-foil"></div>
    <div class="reveal-card-top"><span>${cardNumber(c)}</span><b>${stars}</b></div>
    <div class="reveal-art">${art(c)}</div>
    <div class="reveal-card-copy">${badge}<h3>${c.name}</h3><p>${rarity}</p></div>
    <div class="reveal-card-foot"><span>${footLeft}</span><strong>${footRight}</strong></div>
    <i class="rarity-edge-v210" aria-hidden="true"></i>
  </article>`;
}

function modalStatsHtml(c,known,copies){
  const s=G.currentState;if(!s)return'';
  if(c.isTrash){
    const caught=Math.max(0,Number(s.trashCaughtById&&s.trashCaughtById[c.id])||0);
    return known
      ?`<div class="modal-stat"><small>Cartes possédées</small><strong>${copies}</strong></div><div class="modal-stat"><small>Captures</small><strong>${caught}</strong></div><div class="modal-stat"><small>Poids</small><strong>${fmtWeight(c.weightG)}</strong></div><div class="modal-stat"><small>Obtention</small><strong>Pêche uniquement</strong></div>`
      :`<div class="modal-stat"><small>Rareté</small><strong>Commune</strong></div><div class="modal-stat"><small>Obtention</small><strong>Pêche uniquement</strong></div><div class="card-owned-note-v210">Les cartes Déchet ne peuvent pas être achetées.</div>`;
  }
  const caught=Math.max(0,Number(s.caughtById&&s.caughtById[c.id])||0),best=Math.max(0,Number(s.bestWeightById&&s.bestWeightById[c.id])||0),availability=G.fishingAvailability(s,c);
  let html=`<div class="modal-stat"><small>Cartes possédées</small><strong>${copies}</strong></div><div class="modal-stat"><small>Captures</small><strong>${caught}</strong></div><div class="modal-stat"><small>Meilleur poids</small><strong>${best?fmtWeight(best):'Aucun'}</strong></div><div class="modal-stat"><small>Pêche</small><strong>${availability.normalRank<=G.rankForSold(s.totalSold)?'Rang actuel':`Rang ${availability.normalRank}`}</strong></div>`;
  if(!known){
    const cost=G.cardPurchasePrice(c),can=Number(s.coins)>=cost;
    html+=`<div class="card-buy-panel-v210"><p>Ajouter directement cette carte à la collection pour <b>${fmtCoins(cost)}</b>.</p><button type="button" class="card-buy-v210" data-buy-card="${c.id}" ${can?'':'disabled'}>${can?`Acheter · ${fmtCoins(cost)}`:`Pièces insuffisantes · ${fmtCoins(cost)}`}</button></div>`;
  }else html+='<div class="card-owned-note-v210">Cette carte est déjà dans ta collection.</div>';
  return html;
}

function renderModal(id){
  const modal=$('#cardModal'),sheet=modal&&modal.querySelector('.modal-sheet'),icon=$('#modalIcon'),stats=$('#modalStats');if(!modal||modal.classList.contains('hide')||!sheet||!icon||!stats)return;
  const c=G.collectionCardById(Number(id));if(!c)return;
  const s=G.currentState,known=G.isKnownInCollection(s,c),copies=G.cardCopies(s,c.id),signature=[c.id,known?1:0,copies,Math.floor(Number(s.coins)||0)].join(':');
  if(modal.dataset.renderedV210===signature)return;
  modal.dataset.renderedV210=signature;modal.dataset.cardIdV210=String(c.id);
  sheet.classList.add('card-view-v210');icon.classList.add('full-card-modal-v210');
  icon.innerHTML=fullCardHtml(c,known,copies);stats.innerHTML=modalStatsHtml(c,known,copies);
  const buy=stats.querySelector('[data-buy-card]');
  if(buy)buy.onclick=e=>{
    e.preventDefault();e.stopPropagation();
    const r=G.buyMissingCard(G.currentState,Number(buy.dataset.buyCard));
    if(!r.ok){if(r.reason==='coins')toast('Pas assez de pièces');renderModal(c.id);return}
    saveState();redraw();modal.dataset.renderedV210='';renderModal(c.id);toast(`${c.name} ajoutée à la collection · ${fmtCoins(r.cost)}`);
  };
}

function installCollectionModalCapture(){
  const cards=$('#cards');if(!cards||cards.dataset.modalCaptureV210==='1')return;
  cards.dataset.modalCaptureV210='1';
  cards.addEventListener('click',e=>{
    const button=e.target.closest&&e.target.closest('[data-card]');if(!button)return;
    const modal=$('#cardModal');if(modal)modal.dataset.cardIdV210=button.dataset.card;
    requestAnimationFrame(()=>renderModal(Number(button.dataset.card)));
  },true);
}

function ensureTopButton(){
  let button=$('#collectionTopV210');if(!button){button=document.createElement('button');button.id='collectionTopV210';button.type='button';button.className='collection-top-v210 hide';button.setAttribute('aria-label','Remonter en haut de la collection');button.textContent='↑';document.body.appendChild(button);button.onclick=()=>{const collection=$('#collection');if(collection&&collection.scrollIntoView)collection.scrollIntoView({behavior:'smooth',block:'start'});else window.scrollTo({top:0,behavior:'smooth'})}}
  updateTopButton();
}
function updateTopButton(){
  const button=$('#collectionTopV210'),collection=$('#collection');if(!button||!collection)return;
  const y=Math.max(window.scrollY||0,document.documentElement.scrollTop||0,document.body.scrollTop||0);
  button.classList.toggle('hide',!collection.classList.contains('on')||y<420);
}

function patchVisibleModal(){
  const modal=$('#cardModal');if(!modal||modal.classList.contains('hide'))return;
  let id=Number(modal.dataset.cardIdV210);
  if(!id){const text=$('#modalNumber')&&$('#modalNumber').textContent,match=String(text||'').match(/N°(\d+)/);if(match)id=Number(match[1])}
  if(id)renderModal(id);
}

function sync(){scheduled=false;installCollectionModalCapture();ensurePityRow();patchMissingPrices();patchRarityEdges();ensureTopButton();patchVisibleModal();updateTopButton()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
window.addEventListener('scroll',updateTopButton,{passive:true});document.addEventListener('scroll',updateTopButton,true);
G.productVersion='2.0.10';G.releaseVersion='2.0.10';
sync();
})();
