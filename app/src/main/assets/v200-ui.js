(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s);
const rarityStars={commune:'·'};
G.productVersion='2.0.0';
document.body.classList.add('unified-cards-v200');

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c&&c.icon||'♻')}
function formatWeight(g){g=Math.round(Number(g)||0);if(g>=1000){const kg=g/1000;return (kg>=100?kg.toFixed(1):kg.toFixed(2)).replace('.',',')+' kg'}return g+' g'}
function trashNumber(c){const i=(G.trashTypes||[]).findIndex(t=>t.id===c.id);return'D-'+String(i+1).padStart(3,'0')}
function trashByName(name){return (G.trashTypes||[]).find(t=>t.name===String(name||'').trim())||null}

function patchBoosterCard(){
  document.querySelectorAll('.booster-opening .reveal-card').forEach(card=>{
    if(card.dataset.unifiedV200==='1')return;
    const name=card.querySelector('.reveal-card-copy h3')&&card.querySelector('.reveal-card-copy h3').textContent.trim();
    const c=G.collectionCards().find(x=>!x.isTrash&&x.name===name);if(!c)return;
    const foot=card.querySelector('.reveal-card-foot strong');
    if(foot){
      const a=G.fishingAvailability(G.currentState,c);
      foot.textContent=a.early?`Pêche très rare jusqu’au rang ${c.gate}`:'Pêchable à sa fréquence normale';
    }
    card.dataset.unifiedV200='1';
  });
}

function patchTrashCatch(){
  const result=$('#result'),landed=$('#landedFish'),hero=$('#fish .hero');
  if(!result||!landed||!hero)return;
  if(result.classList.contains('hide')){delete result.dataset.unifiedTrashV200;return}
  const small=result.querySelector('small');
  if(!small||!/^Déchet\b/i.test(small.textContent.trim())){delete result.dataset.unifiedTrashV200;return}
  if(result.dataset.unifiedTrashV200==='1')return;
  const name=result.querySelector('b')&&result.querySelector('b').textContent.trim(),c=trashByName(name);if(!c)return;
  const copies=G.cardCopies(G.currentState,c.id),first=copies===1,weight=formatWeight(c.weightG);
  hero.classList.add('catch-card-active-v180');
  landed.className='landed-fish fishing-card-landed-v180 fishing-trash-card-landed-v200';
  landed.innerHTML=`<article class="reveal-card commune fishing-catch-card-v180 fishing-trash-card-v200 is-visible" aria-label="Carte déchet ${c.name}, commune, poids ${weight}">
    <div class="reveal-foil"></div>
    <div class="reveal-card-top"><span>${trashNumber(c)}</span><b>${rarityStars.commune}</b></div>
    <div class="reveal-art">${art(c)}</div>
    <div class="reveal-card-copy"><span class="reveal-copy fishing-trash-badge-v200">DÉCHET</span>${first?'<span class="reveal-new">NOUVELLE</span>':''}<h3>${c.name}</h3><p>Commune · Déchet</p></div>
    <div class="reveal-card-foot"><span>Poids · ${weight}</span><strong>1 ◉ au panier</strong></div>
  </article>`;
  result.dataset.unifiedTrashV200='1';
  result.className='catch-result fishing-card-summary-v180';
  result.innerHTML=`<div class="catch-summary-stat-v180"><small>Poids</small><strong>${weight}</strong></div><div class="catch-summary-stat-v180"><small>Valeur du spécimen</small><strong>1 ◉</strong></div><div class="catch-summary-stat-v180"><small>Collection</small><strong>${first?'Nouvelle carte Déchet':`Carte ×${copies}`}</strong></div>`;
}

let scheduled=false;
function sync(){scheduled=false;patchBoosterCard();patchTrashCatch()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
sync();
})();
