(function(){'use strict';
const G=window.GameCore;
if(!G||G.releaseVersion!=='1.7.4'||!G.boosterFluidTearRules)return;

function upgrade(){
  const zone=document.querySelector('#tearZone');
  const pack=document.querySelector('#tactilePack');
  const fill=document.querySelector('#tearFill');
  const fallback=document.querySelector('#tearFallback');
  if(!zone||!pack||!fill||zone.dataset.v174==='1')return;

  const oldKeydown=zone.onkeydown;
  zone.dataset.v174='1';
  zone.classList.add('tear-zone-v174');
  zone.setAttribute('aria-label','Poser le doigt n’importe où sur le booster puis glisser horizontalement pour le déchirer');
  const copy=document.querySelector('.tactile-opening .gesture-copy');
  if(copy)copy.textContent='Pose le pouce n’importe où sur le booster et glisse naturellement à gauche ou à droite. Le haut suit directement ton doigt.';

  let active=false,pointerId=null,startX=0,startAt=0,width=1,lastDx=0,armed=false,armDir=1,finished=false;

  const setDirection=dir=>{
    const d=dir<0?-1:1;
    pack.style.setProperty('--tear-final-x',`${d*118}%`);
    pack.style.setProperty('--tear-final-rot',`${d*6}deg`);
  };

  const paint=rawDx=>{
    const dx=G.boosterFluidTearDrag(rawDx,width);
    lastDx=dx;
    const progress=G.boosterFluidTearProgress(dx,width);
    pack.style.setProperty('--tear-x',`${dx}px`);
    pack.style.setProperty('--tear-progress',String(progress));
    fill.style.width=`${progress*50}%`;
    if(dx<0){fill.style.left='auto';fill.style.right='50%'}else{fill.style.left='50%';fill.style.right='auto'}
    if(!armed&&Math.abs(dx)>=G.boosterFluidTearThreshold(width)){
      armed=true;armDir=dx<0?-1:1;zone.classList.add('is-armed-v174');
      try{navigator.vibrate&&navigator.vibrate(8)}catch(_){ }
    }
  };

  const reset=()=>{
    pack.classList.remove('tear-dragging-v174');
    zone.classList.remove('is-dragging','is-armed-v174');
    pack.classList.add('tear-returning-v174');
    pack.style.setProperty('--tear-x','0px');
    pack.style.setProperty('--tear-progress','0');
    fill.style.width='0%';
    fill.style.left='50%';fill.style.right='auto';
    setTimeout(()=>pack.classList.remove('tear-returning-v174'),180);
  };

  const finish=dir=>{
    if(finished)return;
    finished=true;active=false;
    zone.classList.remove('is-dragging','is-armed-v174');
    pack.classList.remove('tear-dragging-v174','tear-returning-v174');
    setDirection(dir);
    if(typeof oldKeydown==='function')oldKeydown.call(zone,{key:'Enter',preventDefault(){}});
  };

  zone.onpointerdown=e=>{
    if(finished)return;
    e.preventDefault();
    active=true;pointerId=e.pointerId;startX=e.clientX;startAt=performance.now();lastDx=0;armed=false;armDir=1;
    width=Math.max(1,pack.getBoundingClientRect().width);
    pack.classList.remove('tear-returning-v174');
    pack.classList.add('tear-dragging-v174');
    zone.classList.add('is-dragging');
    try{zone.setPointerCapture(pointerId)}catch(_){ }
    paint(0);
  };

  zone.onpointermove=e=>{
    if(!active||e.pointerId!==pointerId||finished)return;
    e.preventDefault();
    const points=typeof e.getCoalescedEvents==='function'?e.getCoalescedEvents():null;
    const point=points&&points.length?points[points.length-1]:e;
    paint(point.clientX-startX);
  };

  zone.onpointerup=e=>{
    if(!active||e.pointerId!==pointerId||finished)return;
    e.preventDefault();
    paint(e.clientX-startX);
    active=false;
    try{zone.releasePointerCapture(pointerId)}catch(_){ }
    pointerId=null;
    const dir=armed?armDir:G.boosterFluidTearDecision(lastDx,width,performance.now()-startAt);
    if(dir)finish(dir);else reset();
  };

  zone.onpointercancel=e=>{
    if(e.pointerId!==pointerId||finished)return;
    active=false;pointerId=null;
    if(armed)finish(armDir);else reset();
  };

  zone.onkeydown=e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();finish(1)}
  };
  if(fallback)fallback.addEventListener('click',()=>setDirection(1),true);
}

new MutationObserver(upgrade).observe(document.body,{subtree:true,childList:true});
upgrade();
})();
