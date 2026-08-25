(function(){'use strict';
const G=window.GameCore;
if(!G||G.releaseVersion!=='1.7.5'||!G.boosterFoldTearRules)return;

function upgrade(){
  const zone=document.querySelector('#tearZone');
  const pack=document.querySelector('#tactilePack');
  const fill=document.querySelector('#tearFill');
  const fallback=document.querySelector('#tearFallback');
  if(!zone||!pack||!fill||zone.dataset.v175==='1')return;

  zone.dataset.v175='1';
  zone.classList.add('tear-zone-v175');
  zone.setAttribute('aria-label','Attraper une extrémité de la pliure du booster puis tirer horizontalement vers l’autre côté');
  const copy=document.querySelector('.tactile-opening .gesture-copy');
  if(copy)copy.textContent='Attrape une extrémité de la pliure puis tire vers l’autre côté.';

  const oldKeydown=zone.onkeydown;
  const left=document.createElement('span');
  left.className='fold-grip-v175 fold-grip-left-v175';
  left.setAttribute('aria-hidden','true');
  left.innerHTML='<i></i>';
  const right=document.createElement('span');
  right.className='fold-grip-v175 fold-grip-right-v175';
  right.setAttribute('aria-hidden','true');
  right.innerHTML='<i></i>';
  zone.appendChild(left);zone.appendChild(right);

  let active=false,pointerId=null,startX=0,startAt=0,width=1,startDir=0,lastDx=0,finished=false;

  const setFinishDirection=dir=>{
    pack.style.setProperty('--tear-final-x',`${(dir<0?-1:1)*118}%`);
    pack.style.setProperty('--tear-final-rot',`${(dir<0?-1:1)*6}deg`);
  };

  const paint=rawDx=>{
    lastDx=rawDx;
    const travel=G.boosterFoldTravel(rawDx,startDir,width);
    const signed=startDir<0?-travel:travel;
    const progress=G.boosterFoldProgress(rawDx,startDir,width);
    pack.style.setProperty('--tear-x',`${signed}px`);
    pack.style.setProperty('--tear-progress',String(progress));
    fill.style.width=`${progress*100}%`;
    if(startDir<0){fill.style.left='auto';fill.style.right='0'}else{fill.style.left='0';fill.style.right='auto'}
  };

  const clearDrag=()=>{
    active=false;pointerId=null;startDir=0;
    zone.classList.remove('is-dragging','from-left-v175','from-right-v175');
  };

  const reset=()=>{
    clearDrag();
    pack.classList.remove('tear-dragging-v174');
    pack.classList.add('tear-returning-v174');
    pack.style.setProperty('--tear-x','0px');
    pack.style.setProperty('--tear-progress','0');
    fill.style.width='0%';fill.style.left='0';fill.style.right='auto';
    setTimeout(()=>pack.classList.remove('tear-returning-v174'),180);
  };

  const finish=dir=>{
    if(finished)return;
    finished=true;
    clearDrag();
    pack.classList.remove('tear-dragging-v174','tear-returning-v174');
    setFinishDirection(dir);
    if(typeof oldKeydown==='function')oldKeydown.call(zone,{key:'Enter',preventDefault(){}});
  };

  zone.onpointerdown=e=>{
    if(finished)return;
    const rect=pack.getBoundingClientRect();
    width=Math.max(1,rect.width);
    const localX=e.clientX-rect.left;
    const dir=G.boosterFoldStartDirection(localX,width);
    if(!dir){
      zone.classList.add('wrong-start-v175');
      setTimeout(()=>zone.classList.remove('wrong-start-v175'),180);
      return;
    }
    e.preventDefault();
    active=true;pointerId=e.pointerId;startX=e.clientX;startAt=performance.now();lastDx=0;startDir=dir;
    pack.classList.remove('tear-returning-v174');
    pack.classList.add('tear-dragging-v174');
    zone.classList.add('is-dragging',dir>0?'from-left-v175':'from-right-v175');
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
    try{zone.releasePointerCapture(pointerId)}catch(_){ }
    const dir=G.boosterFoldDecision(lastDx,startDir,width,performance.now()-startAt);
    if(dir)finish(dir);else reset();
  };

  zone.onpointercancel=e=>{
    if(!active||e.pointerId!==pointerId||finished)return;
    reset();
  };

  zone.onkeydown=e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();finish(1)}
  };
  if(fallback)fallback.addEventListener('click',()=>setFinishDirection(1),true);
}

new MutationObserver(upgrade).observe(document.body,{subtree:true,childList:true});
upgrade();
})();
