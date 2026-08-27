(function(){'use strict';
const G=window.GameCore;
if(!G)return;

const RESULT_KEY='__boosterPackResultV205';
const rarityStars={commune:'·',inhabituelle:'◆',rare:'◆◆',epique:'◆◆◆',legendaire:'✦✦✦✦',mythique:'✦✦✦✦✦'};

function art(c){return window.CatchArt&&typeof window.CatchArt.render==='function'?window.CatchArt.render(c):(c&&c.icon||'🐟')}
function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}

/* Observe the already-existing pack result without changing what openCardPack returns or how it mutates state. */
function observePackResult(){
  const original=G.openCardPack;
  if(typeof original!=='function'||original.__v205Observed)return;
  function observedOpenCardPack(){
    const result=original.apply(this,arguments);
    if(result&&result.ok)window[RESULT_KEY]=result;
    return result;
  }
  Object.defineProperty(observedOpenCardPack,'__v205Observed',{value:true});
  Object.defineProperty(observedOpenCardPack,'__v205Original',{value:original});
  G.openCardPack=observedOpenCardPack;
}

/* Make the seam gesture startable from the empty gutters beside the pack.
   Pointer input is forwarded to the current tearZone handler, so the 1.7.5 thresholds,
   direction rules, completion decision and state transition remain the source of truth. */
function installWideTearHit(){
  const pack=document.querySelector('#tactilePack');
  const zone=document.querySelector('#tearZone');
  const opening=pack&&pack.closest('.tactile-opening');
  if(!pack||!zone||!opening||opening.querySelector('#tearHitV205'))return;

  const hit=document.createElement('div');
  hit.id='tearHitV205';
  hit.className='tear-hit-v205';
  hit.setAttribute('aria-hidden','true');
  const rules=G.boosterFoldTearRules||{zoneTop:52,zoneHeight:52};
  const extraY=18;
  hit.style.top=(pack.offsetTop+Number(rules.zoneTop||52)-extraY)+'px';
  hit.style.height=(Number(rules.zoneHeight||52)+extraY*2)+'px';
  opening.appendChild(hit);

  let proxyId=null;
  const forward=(name,e)=>{const fn=zone[name];if(typeof fn==='function')fn.call(zone,e)};
  const stopProxy=()=>{
    proxyId=null;
    document.removeEventListener('pointermove',docMove,true);
    document.removeEventListener('pointerup',docUp,true);
    document.removeEventListener('pointercancel',docCancel,true);
  };
  const docMove=e=>{if(e.pointerId===proxyId)forward('onpointermove',e)};
  const docUp=e=>{if(e.pointerId!==proxyId)return;forward('onpointerup',e);stopProxy()};
  const docCancel=e=>{if(e.pointerId!==proxyId)return;forward('onpointercancel',e);stopProxy()};
  const startProxy=id=>{
    stopProxy();proxyId=id;
    document.addEventListener('pointermove',docMove,true);
    document.addEventListener('pointerup',docUp,true);
    document.addEventListener('pointercancel',docCancel,true);
  };

  hit.onpointerdown=e=>{
    forward('onpointerdown',e);
    let captured=false;
    try{captured=typeof zone.hasPointerCapture==='function'&&zone.hasPointerCapture(e.pointerId)}catch(_){ }
    if(!captured)startProxy(e.pointerId);
  };
}

/* Replace only the generic back artwork inside the existing five-card edge stack.
   The stack element and its original tap/drag handlers are left intact. */
function paintFrontFaces(){
  const stack=document.querySelector('#edgeStack');
  const result=window[RESULT_KEY];
  if(!stack||stack.dataset.v205==='1'||!result||!Array.isArray(result.cards))return;
  const cards=[...stack.querySelectorAll('.edge-card')];
  if(cards.length!==result.cards.length)return;

  cards.forEach((el,index)=>{
    const draw=result.cards[index],c=draw&&draw.creature;
    if(!c)return;
    el.classList.add('edge-face-v205',c.rarity);
    el.dataset.cardId=String(c.id);
    el.innerHTML=`<div class="edge-face-top-v205"><span>N°${String(c.id).padStart(3,'0')}</span><b>${esc(rarityStars[c.rarity]||'')}</b></div><div class="edge-face-art-v205">${art(c)}</div><div class="edge-face-copy-v205"><b>${esc(c.name)}</b><small>${esc(c.rarityLabel)}</small></div>`;
  });
  stack.dataset.v205='1';
}

let scheduled=false;
function sync(){scheduled=false;installWideTearHit();paintFrontFaces()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}

observePackResult();
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true});
sync();
})();
