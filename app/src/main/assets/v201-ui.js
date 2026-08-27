(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let modalCardId=null,scheduled=false;
G.productVersion='2.0.4';
G.releaseVersion='2.0.4';
document.body.classList.add('duplicate-card-market-v201');

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c&&c.icon||'▦')}
function cleanText(v){return String(v||'').replace(/\s+/g,' ').trim()}
function hide(el){if(el&&el.style.display!=='none')el.style.display='none'}
function show(el){if(el&&el.style.display==='none')el.style.display=''}
function displayUnit(el){return el&&(el.closest('.pill, .pack-meta > div, .modal-stat, .catch-summary-stat-v180')||el.parentElement)}
function hideById(id){const el=document.getElementById(id);if(el)hide(displayUnit(el))}
function leadingText(meta){return [...meta.childNodes].filter(n=>n.nodeType===3).map(n=>n.nodeValue||'').join(' ').replace(/\s+/g,' ').trim()}
function setLeadingText(meta,text){let node=[...meta.childNodes].find(n=>n.nodeType===3);if(!node){node=document.createTextNode(text);meta.insertBefore(node,meta.firstChild||null)}else if(node.nodeValue!==text)node.nodeValue=text}

function patchMarketCopy(){
  const p=$('#market .section-head p');if(!p)return;
  const text='Vends les spécimens réellement remontés à la pêche et les doublons de cartes. Une copie de chaque carte est toujours conservée dans la collection.';
  if(p.textContent!==text)p.textContent=text;
}
function patchMarket(){
  const s=G.currentState,inventory=$('#inventory'),basketValue=$('#basketValue'),basketCount=$('#basketCount'),sell=$('#sell');
  if(!s||!inventory||!basketValue||!basketCount||!sell)return;
  const rows=G.cardDuplicateRows(s),count=G.marketSellableCount(s),value=G.marketSellableValue(s),specimenCount=G.inventoryCount(s);
  if(basketValue.textContent!==value+' ◉')basketValue.textContent=value+' ◉';
  if(basketCount.textContent!==String(count))basketCount.textContent=String(count);
  sell.disabled=count===0;
  const label=count?`Tout vendre · ${value} ◉`:'Panier vide';if(sell.textContent!==label)sell.textContent=label;
  const hasRendered=inventory.querySelector('.card-duplicate-row-v201');
  if(!rows.length){inventory.querySelectorAll('.card-duplicate-row-v201').forEach(x=>x.remove());return}
  if(hasRendered)return;
  if(specimenCount===0)inventory.innerHTML='';
  rows.forEach(row=>{
    const c=row.creature,rarity=c.isTrash?'Commune · Déchet':c.rarityLabel;
    inventory.insertAdjacentHTML('beforeend',`<div class="row card-duplicate-row-v201" data-card-duplicate="${c.id}"><span class="ico catch-art-small">${art(c)}</span><div class="grow"><b>${c.name}</b><small>Doublon de carte · ${rarity} · ${row.count} à vendre · 1 exemplaire conservé</small></div><span class="qty">${row.value} ◉</span></div>`);
  });
}
function patchCollection(){
  const s=G.currentState;if(!s)return;
  $$('#cards [data-card]').forEach(button=>{
    const id=Number(button.dataset.card),c=G.collectionCardById(id);if(!c||!G.isKnownInCollection(s,c))return;
    const meta=button.querySelector('.meta');if(!meta)return;
    const total=G.cardObtainedTotal(s,id),existing=meta.querySelector('.card-obtained-total-v201');
    if(existing){if(existing.dataset.total!==String(total)){existing.dataset.total=String(total);existing.textContent=` · obtenue ${total} fois au total`}return}
    const span=document.createElement('span');span.className='card-obtained-total-v201';span.dataset.total=String(total);span.textContent=` · obtenue ${total} fois au total`;meta.appendChild(span);
  });
}
function patchModal(){
  const s=G.currentState,stats=$('#modalStats'),modal=$('#cardModal');if(!s||!stats||!modal||modal.classList.contains('hide')||!modalCardId)return;
  const c=G.collectionCardById(modalCardId);if(!c||!G.isKnownInCollection(s,c))return;
  const total=G.cardObtainedTotal(s,modalCardId);
  let row=stats.querySelector('.card-obtained-total-v201');
  if(!row){row=document.createElement('div');row.className='modal-stat card-obtained-total-v201';row.innerHTML='<small>Obtenue au total</small><strong></strong>';stats.appendChild(row)}
  const strong=row.querySelector('strong');if(strong.textContent!==String(total))strong.textContent=String(total);
}

/* Requested label cleanup outside the booster only. */
function patchCardMeta(){
  $$('#cards .meta').forEach(meta=>{
    const raw=leadingText(meta);
    if(/^Inconnue\b/i.test(raw)){setLeadingText(meta,'');hide(meta);return}
    const capture=raw.match(/(\d+)\s*capture\(s\)/i);
    if(capture&&/carte\s*×/i.test(raw)){setLeadingText(meta,`${capture[1]} capture(s)`);show(meta)}
  });
  $$('.card-obtained-total-v201').forEach(hide);
}
function patchFishingNoise(){
  $$('#fish .catch-summary-stat-v180').forEach(row=>{const label=cleanText(row.querySelector('small')&&row.querySelector('small').textContent);if(/^Statut$/i.test(label))hide(row)});
}
function patchModalNoise(){
  $$('#modalStats .modal-stat').forEach(row=>{const label=cleanText(row.querySelector('small')&&row.querySelector('small').textContent);if(/^Cartes possédées$/i.test(label)||row.classList.contains('card-obtained-total-v201'))hide(row)});
}
function patchMarketNoise(){
  $$('#inventory small').forEach(el=>{if(/^Les spécimens remontés à la pêche apparaissent ici\./i.test(cleanText(el.textContent)))hide(el)});
}
function patchDynamicCounters(){['packQuality','packPity','cardCopiesTotal'].forEach(hideById)}
function patchRequestedCopy(){patchCardMeta();patchFishingNoise();patchModalNoise();patchMarketNoise();patchDynamicCounters()}

function sync(){scheduled=false;patchMarketCopy();patchMarket();patchCollection();patchModal();patchRequestedCopy()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#cards [data-card]');if(b){modalCardId=Number(b.dataset.card);schedule()}});
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
sync();
})();
