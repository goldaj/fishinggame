(function(){'use strict';
const G=window.GameCore;
if(!G||G.releaseVersion!=='1.7.0')return;

let tap=null;
const TAP_MAX_DISTANCE=14;
const TAP_MAX_DURATION=520;

function decorateTearTarget(){
  const zone=document.querySelector('#tearZone');
  if(!zone||zone.dataset.v171==='1')return;
  zone.dataset.v171='1';
  zone.classList.add('tear-zone-v171');
  zone.setAttribute('aria-label','Poser le doigt autour de la jonction de déchirure du booster puis glisser horizontalement pour le déchirer');
  const oldLabel=zone.querySelector('span');
  const oldArrow=zone.querySelector('b');
  if(oldLabel)oldLabel.classList.add('legacy-tear-label');
  if(oldArrow)oldArrow.classList.add('legacy-tear-arrow');
  const tab=document.createElement('span');
  tab.className='tear-tab-v171';
  tab.setAttribute('aria-hidden','true');
  tab.innerHTML='<i></i><i></i><i></i>';
  zone.appendChild(tab);
  const copy=document.querySelector('.tactile-opening .gesture-copy');
  if(copy)copy.textContent='Glisse horizontalement autour de la liaison du paquet pour le déchirer.';
}

function decorateReveal(){
  const shell=document.querySelector('#swipeCard');
  if(!shell||shell.dataset.v171==='1')return;
  shell.dataset.v171='1';
  const name=shell.querySelector('.reveal-card h3')?.textContent||'Carte';
  shell.setAttribute('aria-label',`${name}. Toucher pour passer à la carte suivante, ou glisser à gauche ou à droite.`);
  const hint=shell.parentElement?.querySelector('.swipe-hint');
  if(hint){
    const title=hint.querySelector('b');
    const detail=hint.querySelector('small');
    if(title)title.textContent='Touche ou glisse la carte';
    if(detail)detail.textContent=detail.textContent.includes('bilan')?'touche pour le bilan · swipe fonctionne aussi':'touche pour la suivante · swipe fonctionne aussi';
  }
}

function decorate(){decorateTearTarget();decorateReveal()}

new MutationObserver(decorate).observe(document.body,{subtree:true,childList:true});
decorate();

document.addEventListener('pointerdown',e=>{
  const shell=e.target.closest&&e.target.closest('#swipeCard');
  if(!shell)return;
  tap={pointerId:e.pointerId,shell,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,startAt:performance.now()};
},true);

document.addEventListener('pointermove',e=>{
  if(!tap||tap.pointerId!==e.pointerId)return;
  tap.lastX=e.clientX;tap.lastY=e.clientY;
},true);

document.addEventListener('pointercancel',e=>{if(tap&&tap.pointerId===e.pointerId)tap=null},true);

document.addEventListener('pointerup',e=>{
  if(!tap||tap.pointerId!==e.pointerId)return;
  tap.lastX=e.clientX;tap.lastY=e.clientY;
  const current=tap;tap=null;
  const dx=current.lastX-current.startX,dy=current.lastY-current.startY;
  const distance=Math.hypot(dx,dy),duration=performance.now()-current.startAt;
  if(distance>TAP_MAX_DISTANCE||duration>TAP_MAX_DURATION)return;
  setTimeout(()=>{
    if(!document.body.contains(current.shell)||current.shell.id!=='swipeCard')return;
    current.shell.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  },0);
},true);

window.BoosterUX171={tapMaxDistance:TAP_MAX_DISTANCE,tapMaxDuration:TAP_MAX_DURATION};
})();
