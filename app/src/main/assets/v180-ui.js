(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s);
const rarityStars={commune:'·',inhabituelle:'◆',rare:'◆◆',epique:'◆◆◆',legendaire:'✦✦✦✦',mythique:'✦✦✦✦✦'};
G.productName='Fishing Cards';
G.productVersion='1.8.0';

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c&&c.icon||'🐟')}
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function findCreature(name){
  const target=String(name||'').trim();if(!target)return null;
  for(let i=0;i<(G.totalSpecies||500);i++){
    const c=G.creatures[i];
    if(c&&!c.isTrash&&c.name===target)return c;
  }
  return null;
}
function resetCatchCard(){
  const hero=$('#fish .hero'),landed=$('#landedFish'),result=$('#result');
  if(hero)hero.classList.remove('catch-card-active-v180');
  if(landed&&landed.classList.contains('fishing-card-landed-v180')){
    landed.className='landed-fish hide';
    landed.innerHTML='';
  }
  if(result)delete result.dataset.fishingCardV180;
}
function catchCardHtml(c,{weight,valueText,newDiscovery,record}){
  const stars=rarityStars[c.rarity]||'';
  const badge=newDiscovery?'<span class="reveal-new">NOUVELLE</span>':'<span class="reveal-copy fishing-caught-badge-v180">PÊCHÉE</span>';
  const recordBadge=record?'<span class="reveal-guarantee">NOUVEAU RECORD</span>':'';
  return `<article class="reveal-card ${c.rarity} fishing-catch-card-v180 is-visible" aria-label="Carte pêchée ${c.name}, ${c.rarityLabel}, poids ${weight}">
    <div class="reveal-foil"></div>
    <div class="reveal-card-top"><span>N°${String(c.id).padStart(3,'0')}</span><b>${stars}</b></div>
    <div class="reveal-art">${art(c)}</div>
    <div class="reveal-card-copy">${badge}<h3>${c.name}</h3><p>${c.rarityLabel}</p>${recordBadge}</div>
    <div class="reveal-card-foot"><span>Poids · ${weight}</span><strong>${valueText} au panier</strong></div>
  </article>`;
}
function renderCatchCard(){
  const result=$('#result'),landed=$('#landedFish'),hero=$('#fish .hero');
  if(!result||!landed||!hero)return;
  if(result.classList.contains('hide')){resetCatchCard();return}
  if(result.dataset.fishingCardV180)return;
  const small=result.querySelector('small');
  if(!small)return;
  const detail=small.textContent.trim();
  if(/^Déchet\b/i.test(detail)){
    hero.classList.remove('catch-card-active-v180');
    result.dataset.fishingCardV180='trash';
    return;
  }
  const name=result.querySelector('b')&&result.querySelector('b').textContent.trim();
  const c=findCreature(name);if(!c)return;
  const parts=detail.split('·').map(x=>x.trim()).filter(Boolean);
  const weight=parts[1]||'Poids inconnu';
  const valueText=(result.querySelector('.value')&&result.querySelector('.value').textContent.trim())||`${c.value} ◉`;
  const record=/nouveau record/i.test(detail);
  const newDiscovery=($('#statusText')&&$('#statusText').textContent.trim())==='Découverte';
  result.dataset.fishingCardV180=`${c.id}|${weight}|${valueText}|${newDiscovery?1:0}|${record?1:0}`;
  hero.classList.add('catch-card-active-v180');
  landed.className='landed-fish fishing-card-landed-v180';
  landed.innerHTML=catchCardHtml(c,{weight,valueText,newDiscovery,record});
  result.className='catch-result fishing-card-summary-v180';
  result.innerHTML=`<div class="catch-summary-stat-v180"><small>Poids</small><strong>${weight}</strong></div><div class="catch-summary-stat-v180"><small>Valeur du spécimen</small><strong>${valueText}</strong></div><div class="catch-summary-stat-v180"><small>Statut</small><strong>${newDiscovery?'Nouvelle découverte':record?'Nouveau record':'Carte pêchée'}</strong></div>`;
}
function patchBrand(){
  document.title='Fishing Cards';
  setText($('.brand h1'),'Fishing Cards');
  setText($('.brand small'),'COLLECTION MARINE');
  document.querySelectorAll('.opening-pack-top').forEach(el=>setText(el,'FISHING CARDS'));
  document.querySelectorAll('.mini-pack b').forEach(el=>{if(el.textContent.trim()==='P&M')setText(el,'FC')});
}
let queued=false;
function sync(){queued=false;patchBrand();renderCatchCard()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
patchBrand();renderCatchCard();
})();
