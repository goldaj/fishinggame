(function(){'use strict';
const G=window.GameCore;if(!G)return;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let scheduled=false;

function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
function pct(p,adaptive=false){
  const n=Math.max(0,Number(p)||0)*100;
  const d=adaptive?(n>=.1?1:n>=.01?2:n>=.001?3:4):n<1?2:1;
  return n.toFixed(d).replace('.',',')+' %';
}
function currentRank(){const s=G.currentState;return G.rankForSold(Math.max(0,Number(s&&s.totalSold)||0))}

function installFishingHeroClick(){
  const hero=$('#fish .hero'),button=$('#cast');if(!hero||!button||hero.dataset.clickableV208==='1')return;
  hero.dataset.clickableV208='1';hero.setAttribute('role','button');hero.setAttribute('tabindex','0');hero.setAttribute('aria-label','Action de pêche');
  const activate=e=>{
    if(e&&e.target&&e.target.closest&&e.target.closest('button,a,input,select,textarea'))return;
    if(!button.disabled)button.click();
  };
  hero.addEventListener('click',activate);
  hero.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!button.disabled)button.click()}});
}

function installPackPreviewClick(){
  const preview=$('#boosterPreview .mini-pack'),button=$('#packPull');if(!preview||!button||preview.dataset.clickableV208==='1')return;
  preview.dataset.clickableV208='1';preview.removeAttribute('aria-hidden');preview.setAttribute('role','button');preview.setAttribute('tabindex','0');preview.setAttribute('aria-label','Ouvrir le prochain booster');
  const activate=()=>{if(!button.disabled)button.click()};
  preview.addEventListener('click',e=>{e.stopPropagation();activate()});
  preview.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();activate()}});
}

function renderFishingOdds(){
  const hint=$('#fish .hint');if(!hint||!G.currentState||typeof G.fishingRarityOdds!=='function')return;
  let row=$('#fishingOddsV208');if(!row){row=document.createElement('div');row.id='fishingOddsV208';row.className='fishing-odds-v208';hint.insertAdjacentElement('afterend',row)}
  const rank=currentRank(),odds=G.fishingRarityOdds(G.currentState),wanted=['rare','epique','legendaire','mythique'];
  const pieces=odds.filter(o=>wanted.includes(o.rarity)).map(o=>`<span>${o.label} <b>${pct(o.p)}</b></span>`);
  const exceptional=typeof G.fishingOutOfRankChance==='function'?G.fishingOutOfRankChance(G.currentState):0;
  const html=`Rang ${rank} · ${pieces.join(' · ')}${exceptional?`<br>Hors-rang exceptionnel <b>${pct(exceptional)}</b>`:''}`;
  if(row.innerHTML!==html)row.innerHTML=html;
}

function patchBoosterOdds(){
  const el=$('#packOdds');if(!el||typeof G.cardOdds!=='function')return;
  const odds=G.cardOdds();
  const html='<b>Raretés du booster</b><br>'+odds.map(o=>`${o.label} · ${pct(o.p,true)}`).join('<br>')+'<br><small>Les 4 cartes Déchet sont exclues des boosters.</small>';
  if(el.innerHTML!==html)el.innerHTML=html;
}

function patchExplanations(){
  const hint=$('#fish .hint div');
  if(hint){const html='<b>50 espèces par rang.</b> La pêche choisit normalement parmi ton rang et les rangs inférieurs. Une prise hors-rang reste exceptionnellement possible. Leurre sélectif augmente seulement les raretés de pêche, jamais celles des boosters.';if(hint.innerHTML!==html)hint.innerHTML=html}
  const collection=$('#collection .section-head p');
  if(collection){const text='Pêche et boosters alimentent la même collection. Les rangs déterminent la pêche normale ; un booster peut donner n’importe quelle rareté, sans modifier les chances de pêche de son rang.';if(collection.textContent!==text)collection.textContent=text}
  const pack=$('.pack-panel h3+p');
  if(pack&&/Déchire|Chaque booster|Chaque carte/i.test(pack.textContent||'')){
    const text='Déchire le booster et révèle ses cinq cartes. Les probabilités et garanties du booster dépendent de la rareté des cartes et restent indépendantes de ton rang de pêche.';
    if(pack.textContent!==text)pack.textContent=text;
  }
}

function patchCollectionMeta(){
  const s=G.currentState;if(!s)return;const rank=currentRank();
  $$('#cards [data-card]').forEach(button=>{
    const id=Number(button.dataset.card),c=G.collectionCardById(id),meta=button.querySelector('.meta');if(!c||c.isTrash||!meta)return;
    const known=G.isKnownInCollection(s,c);
    if(!known&&c.gate<=rank){meta.style.display='';meta.textContent='Disponible à la pêche au rang actuel · disponible en booster'}
  });
}

function patchModal(){
  const modal=$('#cardModal');if(!modal||modal.classList.contains('hide')||!G.currentState)return;
  const number=clean($('#modalNumber')&&$('#modalNumber').textContent),match=number.match(/(\d{1,3})$/);if(!match)return;
  const c=G.collectionCardById(Number(match[1]));if(!c||c.isTrash)return;
  const rank=currentRank();
  $$('#modalStats .modal-stat').forEach(row=>{
    const label=clean(row.querySelector('small')&&row.querySelector('small').textContent),strong=row.querySelector('strong');if(!strong)return;
    if(label==='Pêche')strong.textContent=c.gate<=rank?'Disponible au rang actuel':`Rang ${c.gate} normalement · hors-rang exceptionnel avant`;
    if(label==='Effet d’une carte')strong.textContent='Ajoute la carte à la collection';
  });
}

function patchBoosterRevealCopy(){
  const s=G.currentState;if(!s)return;const rank=currentRank();
  $$('#boosterOpening .reveal-card').forEach(card=>{
    const name=clean(card.querySelector('.reveal-card-copy h3')&&card.querySelector('.reveal-card-copy h3').textContent);if(!name)return;
    const c=(G.cardPool?G.cardPool():[]).find(x=>x.name===name);if(!c)return;
    const foot=card.querySelector('.reveal-card-foot strong');if(!foot)return;
    const text=c.gate<=rank?'Pêchable au rang actuel':`Rang ${c.gate} normalement · hors-rang exceptionnel avant`;
    if(foot.textContent!==text)foot.textContent=text;
  });
}

function sync(){scheduled=false;installFishingHeroClick();installPackPreviewClick();renderFishingOdds();patchBoosterOdds();patchExplanations();patchCollectionMeta();patchModal();patchBoosterRevealCopy()}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(sync)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class','disabled']});
G.productVersion='2.0.8';G.releaseVersion='2.0.8';
sync();
})();
