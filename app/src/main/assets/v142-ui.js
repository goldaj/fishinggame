(function(root){'use strict';
const CONFIG={version:'1.4.2',events:['fish','card','gacha'],packStaggerMs:190,particleLifetimeMs:1700,bannerLifetimeMs:2700};
if(typeof document==='undefined'){
  if(typeof module!=='undefined'&&module.exports)module.exports={CONFIG};
  return;
}

const reduced=()=>!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
let lastFish='',lastGacha='',lastPack='';

function safeAnimate(el,frames,options){
  if(!el||reduced()||typeof el.animate!=='function')return null;
  try{return el.animate(frames,options)}catch(_){return null}
}
function badge(host,text){
  if(!host)return;
  let b=host.querySelector('.new-badge');
  if(!b){b=document.createElement('span');b.className='new-badge';host.prepend(b)}
  b.textContent=text;
}
function cleanupLater(el,ms){setTimeout(()=>{if(el&&el.remove)el.remove()},ms)}
function stableText(host){
  if(!host)return'';
  const clone=host.cloneNode(true);
  [...clone.querySelectorAll('.new-badge,.v142-card-back')].forEach(x=>x.remove());
  return clone.textContent||'';
}
function centerOf(anchor){
  if(!anchor||!anchor.getBoundingClientRect)return{x:innerWidth/2,y:innerHeight/2};
  const r=anchor.getBoundingClientRect();
  return{x:r.left+r.width/2,y:r.top+r.height/2};
}
function particleLayer(){
  let layer=document.querySelector('.v142-fx-layer');
  if(!layer){layer=document.createElement('div');layer.className='v142-fx-layer';document.body.appendChild(layer)}
  return layer;
}
function emitParticles(anchor,kind,count){
  if(reduced())return;
  const layer=particleLayer(),c=centerOf(anchor);
  for(let i=0;i<count;i++){
    const p=document.createElement('i');
    p.className=`v142-particle ${kind}`;
    p.style.left=c.x+'px';p.style.top=c.y+'px';
    if(kind==='spark'||kind==='star')p.textContent=i%3===0?'✦':'•';
    layer.appendChild(p);
    const a=Math.random()*Math.PI*2;
    const d=(kind==='bubble'?35:55)+Math.random()*(kind==='star'?120:85);
    const dx=Math.cos(a)*d,dy=Math.sin(a)*d-(kind==='bubble'?45:0);
    const rot=(Math.random()*220-110)+'deg';
    const delay=Math.random()*160;
    safeAnimate(p,[
      {transform:'translate(-50%,-50%) scale(.25)',opacity:0},
      {transform:'translate(-50%,-50%) scale(1)',opacity:1,offset:.16},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${rot}) scale(.15)`,opacity:0}
    ],{duration:900+Math.random()*650,delay,easing:'cubic-bezier(.16,.8,.28,1)',fill:'forwards'});
    cleanupLater(p,CONFIG.particleLifetimeMs+delay);
  }
}
function ringBurst(anchor,kind,count){
  if(reduced())return;
  const layer=particleLayer(),c=centerOf(anchor);
  for(let i=0;i<count;i++){
    const r=document.createElement('i');r.className=`v142-ring ${kind}`;r.style.left=c.x+'px';r.style.top=c.y+'px';layer.appendChild(r);
    safeAnimate(r,[{transform:'translate(-50%,-50%) scale(.2)',opacity:.85},{transform:`translate(-50%,-50%) scale(${1.7+i*.65})`,opacity:0}],{duration:700+i*150,delay:i*70,easing:'cubic-bezier(.1,.7,.2,1)',fill:'forwards'});
    cleanupLater(r,1500);
  }
}
function banner(type,title,subtitle){
  const old=document.querySelector('.v142-celebration-banner');if(old)old.remove();
  const icons={fish:'≈',card:'▦',gacha:'✦'};
  const el=document.createElement('div');el.className=`v142-celebration-banner ${type}`;
  el.innerHTML=`<span class="v142-banner-icon">${icons[type]||'✦'}</span><span><b>${title}</b>${subtitle?`<small>${subtitle}</small>`:''}</span>`;
  document.body.appendChild(el);
  safeAnimate(el,[
    {transform:'translate(-50%,-22px) scale(.86)',opacity:0},
    {transform:'translate(-50%,5px) scale(1.035)',opacity:1,offset:.65},
    {transform:'translate(-50%,0) scale(1)',opacity:1}
  ],{duration:420,easing:'cubic-bezier(.17,.89,.3,1.35)',fill:'forwards'});
  setTimeout(()=>{
    const a=safeAnimate(el,[{transform:'translate(-50%,0) scale(1)',opacity:1},{transform:'translate(-50%,-10px) scale(.97)',opacity:0}],{duration:260,easing:'ease-in',fill:'forwards'});
    if(a){a.onfinish=()=>el.remove();a.oncancel=()=>el.remove()}else el.remove();
  },CONFIG.bannerLifetimeMs);
}
function animateFish(result,isNew){
  result.classList.add('v142-fish-result');
  safeAnimate(result,[
    {transform:'translateY(18px) scale(.92)',opacity:.2},
    {transform:'translateY(-4px) scale(1.035)',opacity:1,offset:.68},
    {transform:'translateY(0) scale(1)',opacity:1}
  ],{duration:520,easing:'cubic-bezier(.15,.82,.28,1.18)'});
  const icon=result.querySelector('.catch-art-result,.ico');
  safeAnimate(icon,[
    {transform:'translateY(22px) rotate(-9deg) scale(.72)'},
    {transform:'translateY(-7px) rotate(4deg) scale(1.12)',offset:.62},
    {transform:'translateY(0) rotate(0) scale(1)'}
  ],{duration:620,easing:'cubic-bezier(.17,.9,.3,1.25)'});
  emitParticles(icon||result,'bubble',isNew?18:9);ringBurst(icon||result,'water',isNew?3:1);
  if(isNew){
    const host=result.querySelector('div')||result;badge(host,'NOUVEAU POISSON');
    result.classList.add('v142-new');
    const nameEl=result.querySelector('b'),name=nameEl?nameEl.textContent:'Nouvelle espèce';
    banner('fish','NOUVEAU POISSON',name);
  }
}
function makeCardBack(card){
  const back=document.createElement('span');back.className='v142-card-back';back.innerHTML='<i>✦</i><b>PÊCHE &amp;<br>MERVEILLES</b>';
  card.appendChild(back);return back;
}
function animatePack(pack){
  const cards=[...pack.querySelectorAll('.draw-card')];
  cards.forEach((card,index)=>{
    const delay=index*CONFIG.packStaggerMs;
    const strong=card.querySelector('strong');
    const isNew=!!(strong&&strong.textContent.startsWith('Nouvelle carte'));
    card.classList.add('v142-pack-card');
    const back=makeCardBack(card);
    safeAnimate(card,[
      {transform:'perspective(700px) rotateY(-72deg) translateY(24px) scale(.82)',opacity:0},
      {transform:'perspective(700px) rotateY(5deg) translateY(-4px) scale(1.025)',opacity:1,offset:.72},
      {transform:'perspective(700px) rotateY(0) translateY(0) scale(1)',opacity:1}
    ],{duration:620,delay,easing:'cubic-bezier(.18,.82,.28,1.16)',fill:'both'});
    safeAnimate(back,[
      {transform:'rotateY(0deg) scale(1)',opacity:1},
      {transform:'rotateY(82deg) scale(.94)',opacity:1,offset:.72},
      {transform:'rotateY(96deg) scale(.9)',opacity:0}
    ],{duration:480,delay:delay+100,easing:'cubic-bezier(.55,.02,.75,.45)',fill:'forwards'});
    setTimeout(()=>back.remove(),delay+700);
    if(isNew){
      const host=card.querySelector('div')||card;
      badge(host,'NOUVELLE CARTE');card.classList.add('v142-new');
      setTimeout(()=>{emitParticles(card,'spark',13);ringBurst(card,'card',2)},delay+350);
    }
  });
  const fresh=cards.filter(card=>{const s=card.querySelector('strong');return s&&s.textContent.startsWith('Nouvelle carte')});
  if(fresh.length){
    const title=fresh.length===1?'NOUVELLE CARTE':`NOUVELLES CARTES ×${fresh.length}`;
    setTimeout(()=>banner('card',title,'Ajoutée à la collection'),Math.min(520,cards.length*CONFIG.packStaggerMs));
  }
}
function animateGacha(result,isNew){
  const card=result.querySelector('.draw-card')||result;
  card.classList.add('v142-gacha-card');
  safeAnimate(card,[
    {transform:'perspective(900px) rotateX(62deg) scale(.48)',filter:'blur(7px)',opacity:0},
    {transform:'perspective(900px) rotateX(-5deg) scale(1.08)',filter:'blur(0)',opacity:1,offset:.7},
    {transform:'perspective(900px) rotateX(0) scale(1)',filter:'blur(0)',opacity:1}
  ],{duration:760,easing:'cubic-bezier(.12,.78,.2,1.16)'});
  const art=card.querySelector('.draw-art');
  safeAnimate(art,[{transform:'scale(.45) rotate(-18deg)',opacity:.1},{transform:'scale(1.18) rotate(5deg)',opacity:1,offset:.7},{transform:'scale(1) rotate(0)',opacity:1}],{duration:820,easing:'cubic-bezier(.14,.82,.24,1.2)'});
  ringBurst(card,'gacha',isNew?4:2);emitParticles(card,isNew?'star':'spark',isNew?26:12);
  if(isNew){
    const host=card.querySelector('div')||card;
    badge(host,'NOUVEAU GACHA');card.classList.add('v142-new');
    const nameEl=card.querySelector('b'),name=nameEl?nameEl.textContent:'Nouvelle espèce';
    setTimeout(()=>banner('gacha','NOUVEAU GACHA',name),260);
  }
}
function enhance(){
  const result=document.querySelector('#result');
  if(result&&!result.classList.contains('hide')){
    const nameEl=result.querySelector('b'),name=nameEl?nameEl.textContent:'';
    const statusEl=document.querySelector('#statusText'),isTrash=((statusEl?statusEl.textContent:'')||'').includes('Déchet');
    const sig='fish:'+name+':'+stableText(result);
    if(name&&!isTrash&&sig!==lastFish){lastFish=sig;const headlineEl=document.querySelector('#headline'),isNew=((headlineEl?headlineEl.textContent:'')||'').includes('Nouvelle espèce découverte');animateFish(result,isNew)}
  }
  const g=document.querySelector('#gachaResult');
  if(g&&!g.classList.contains('hide')){
    const sig='gacha:'+stableText(g);
    if(sig!==lastGacha){lastGacha=sig;const strong=g.querySelector('strong');const isNew=!!(strong&&strong.textContent.includes('Nouvelle espèce découverte'));animateGacha(g,isNew)}
  }
  const p=document.querySelector('#packResults');
  if(p&&!p.classList.contains('hide')){
    const sig='pack:'+stableText(p);
    if(sig!==lastPack){lastPack=sig;animatePack(p)}
  }
}

new MutationObserver(enhance).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
enhance();
})(typeof window==='undefined'?globalThis:window);
