(function(){'use strict';
const G=window.GameCore;
if(!G||!G.boosterFluidTearRules)return;

function upgrade(){
  const zone=document.querySelector('#tearZone');
  if(!zone||zone.dataset.v173==='1')return;
  const pack=document.querySelector('#tactilePack');
  const fill=document.querySelector('#tearFill');
  const fallback=document.querySelector('#tearFallback');
  if(!pack||!fill)return;

  zone.dataset.v173='1';
  zone.classList.add('tear-zone-v173');
  zone.setAttribute('aria-label','Glisser horizontalement autour de la couture du booster pour le déchirer');
  const copy=document.querySelector('.tactile-opening .gesture-copy');
  if(copy)copy.textContent='Glisse naturellement autour de la couture. Le haut du booster suit ton doigt et la zone est volontairement très large.';

  const oldKeydown=zone.onkeydown;
  let active=false,pointerId=null,startX=0,startAt=0,width=1,lastDx=0,finished=false,raf=0,pendingDx=0;

  const setDirection=dir=>{
    pack.dataset.tearDir=String(dir||1);
    pack.style.setProperty('--tear-final-x',`${(dir||1)*118}%`);
    pack.style.setProperty('--tear-final-rot',`${(dir||1)*6}deg`);
  };
  const paint=dx=>{
    lastDx=G.boosterFluidTearDrag(dx,width);
    const dir=lastDx<0?-1:1;
    const p=G.boosterFluidTearProgress(lastDx,width);
    pack.style.setProperty('--tear-x',`${lastDx}px`);
    pack.dataset.tearDir=String(dir);
    fill.style.width=`${Math.max(0,p*50)}%`;
    if(dir<0){fill.style.left='auto';fill.style.right='50%'}else{fill.style.left='50%';fill.style.right='auto'}
  };
  const schedulePaint=dx=>{
    pendingDx=dx;
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;paint(pendingDx)});
  };
  const reset=()=>{
    if(raf){cancelAnimationFrame(raf);raf=0}
    pack.classList.remove('tear-dragging-v173');
    pack.classList.add('tear-returning-v173');
    pack.style.setProperty('--tear-x','0px');
    fill.style.width='0%';
    setTimeout(()=>pack.classList.remove('tear-returning-v173'),220);
  };
  const finish=dir=>{
    if(finished)return;
    finished=true;active=false;
    if(raf){cancelAnimationFrame(raf);raf=0}
    setDirection(dir||1);
    pack.classList.remove('tear-dragging-v173','tear-returning-v173');
    if(typeof oldKeydown==='function')oldKeydown.call(zone,{key:'Enter',preventDefault(){}});
  };

  zone.onpointerdown=e=>{
    if(finished)return;
    active=true;pointerId=e.pointerId;startX=e.clientX;startAt=performance.now();lastDx=0;
    width=Math.max(1,pack.getBoundingClientRect().width);
    pack.classList.remove('tear-returning-v173');
    pack.classList.add('tear-dragging-v173');
    try{zone.setPointerCapture(pointerId)}catch(_){ }
  };
  zone.onpointermove=e=>{
    if(!active||e.pointerId!==pointerId||finished)return;
    const points=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null;
    const point=points&&points.length?points[points.length-1]:e;
    const dx=point.clientX-startX;
    schedulePaint(dx);
    if(Math.abs(dx)>=G.boosterFluidTearThreshold(width))finish(dx<0?-1:1);
  };
  zone.onpointerup=e=>{
    if(!active||e.pointerId!==pointerId||finished)return;
    active=false;
    const dx=e.clientX-startX;
    const dir=G.boosterFluidTearDecision(dx,width,performance.now()-startAt);
    try{zone.releasePointerCapture(pointerId)}catch(_){ }
    pointerId=null;
    if(dir)finish(dir);else reset();
  };
  zone.onpointercancel=e=>{
    if(e.pointerId!==pointerId||finished)return;
    active=false;pointerId=null;reset();
  };
  zone.onkeydown=e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();finish(1)}
  };
  if(fallback)fallback.addEventListener('click',()=>setDirection(1),true);
}

new MutationObserver(upgrade).observe(document.body,{subtree:true,childList:true});
upgrade();
})();
