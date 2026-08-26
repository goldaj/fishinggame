(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s);
const hero=$('#fish .hero');if(!hero)return;
G.productName='Fishing Cards';
G.productVersion='1.9.0';
G.fishingExperienceVersion='1.9.0';

const stage=document.createElement('div');
stage.className='fishing-stage-v190 state-idle-v190';
stage.dataset.state='idle';
stage.setAttribute('aria-hidden','true');
stage.innerHTML=`
  <div class="water-depth-v190"></div>
  <div class="water-sheen-v190"></div>
  <div class="fish-shadow-v190"><i></i></div>
  <div class="bite-flash-v190"></div>
  <div class="splash-v190"><i></i><i></i><i></i><i></i></div>
  <div class="ring-v190 ring-a-v190"></div><div class="ring-v190 ring-b-v190"></div>
  <svg class="fishing-gear-v190" viewBox="0 0 360 404" preserveAspectRatio="none" focusable="false">
    <defs>
      <linearGradient id="rodWoodV190" x1="0" x2="1"><stop offset="0" stop-color="#9a653c"/><stop offset=".55" stop-color="#c78a52"/><stop offset="1" stop-color="#e0b171"/></linearGradient>
      <linearGradient id="rodGripV190" x1="0" x2="1"><stop offset="0" stop-color="#263640"/><stop offset="1" stop-color="#526a70"/></linearGradient>
      <linearGradient id="floatRedV190" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f3a58e"/><stop offset="1" stop-color="#d86f5d"/></linearGradient>
      <filter id="softShadowV190" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#00131a" flood-opacity=".52"/></filter>
    </defs>
    <g class="rod-rig-v190" filter="url(#softShadowV190)">
      <g class="rod-base-v190">
        <path class="rod-grip-v190" d="M334 360 L307 315"/>
        <path class="rod-main-v190" d="M310 318 C292 282 274 250 252 218"/>
        <g class="reel-v190">
          <circle cx="304" cy="311" r="14" class="reel-body-v190"/>
          <circle cx="304" cy="311" r="7" class="reel-core-v190"/>
          <path d="M314 318 L326 328" class="reel-arm-v190"/><circle cx="329" cy="331" r="4" class="reel-knob-v190"/>
        </g>
      </g>
      <g class="rod-tip-v190">
        <path class="rod-tip-shadow-v190" d="M253 219 C228 183 207 152 183 124"/>
        <path class="rod-tip-stroke-v190" d="M253 219 C228 183 207 152 183 124"/>
        <circle cx="183" cy="124" r="3.2" class="tip-eye-v190"/>
      </g>
    </g>
    <path class="line-v190" d="M183 124 C183 153 181 181 180 215"/>
    <g class="bobber-v190">
      <path class="bobber-stem-v190" d="M180 207 L180 217"/>
      <ellipse cx="180" cy="221" rx="7.5" ry="10.5" class="bobber-body-v190"/>
      <path d="M173 220 Q180 225 187 220 L187 225 Q180 231 173 225Z" class="bobber-light-v190"/>
    </g>
  </svg>
  <div class="tension-cue-v190"><span></span><span></span><span></span></div>`;
const landed=$('#landedFish');
hero.insertBefore(stage,landed||hero.firstChild);
hero.classList.add('fishing-experience-v190');

let stateToken=0,last='idle';
const normalize=s=>({early:'presence',strike:'bite','late-auto':'fail-late',cooldown:'card'}[s]||s||'idle');
function clearRarity(){['commune','inhabituelle','rare','epique','legendaire','mythique'].forEach(r=>hero.classList.remove('catch-rarity-'+r+'-v190'))}
function rawApply(state,detail={}){
  state=normalize(state);last=state;stage.dataset.state=state;
  stage.className='fishing-stage-v190 state-'+state+'-v190';
  hero.dataset.fishingStateV190=state;
  hero.classList.toggle('fishing-active-v190',!['idle','retract'].includes(state));
  hero.classList.toggle('fishing-bite-v190',state==='bite');
  hero.classList.toggle('fishing-fail-v190',state.indexOf('fail-')===0);
  hero.classList.toggle('fishing-success-v190',state.indexOf('reel-success')===0||state==='card');
  if(detail&&detail.rarity){clearRarity();hero.classList.add('catch-rarity-'+detail.rarity+'-v190')}
}
function applyState(state,detail={}){
  const token=++stateToken;state=normalize(state);
  if(state==='waiting' && ['idle','retract','fail-early','fail-late'].includes(last)){
    rawApply('cast',detail);
    setTimeout(()=>{if(token===stateToken)rawApply('waiting',detail)},560);
    return;
  }
  rawApply(state,detail);
}
window.addEventListener('fishingcards:fishing-phase',e=>{
  const d=e.detail||{};applyState(d.visualState||d.phase,d);
});

function syncCard(){
  const card=landed&&landed.querySelector('.fishing-catch-card-v180');
  if(!card)return;
  const rarity=['commune','inhabituelle','rare','epique','legendaire','mythique'].find(r=>card.classList.contains(r));
  if(rarity){clearRarity();hero.classList.add('catch-rarity-'+rarity+'-v190')}
  if(last.indexOf('reel-success')===0){
    const token=++stateToken;
    setTimeout(()=>{if(token===stateToken)rawApply('card',{rarity})},480);
  }
}
new MutationObserver(syncCard).observe(landed||hero,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});

const hint=$('#fish .hint div');
if(hint)hint.innerHTML='<b>Regarde la canne et le bouchon.</b> La ligne reste calme pendant l’attente, frémit quand une carte approche et se tend franchement à la TOUCHE. Ferre au bon moment : la prise remonte réellement de l’eau avant de se révéler.';
rawApply('idle');
})();
