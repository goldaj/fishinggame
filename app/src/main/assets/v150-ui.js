(function(){'use strict';
const G=window.GameCore;
if(!G)return;
let scheduled=false,lastPackNumber=0;
function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}
function ensureUi(){
  const panel=document.querySelector('.pack-panel');if(!panel)return;
  const title=panel.querySelector('h3');if(title)setText(title,'Boosters de cartes');
  const intro=panel.querySelector('h3+p');
  if(intro)setText(intro,'Chaque booster contient 3 cartes. La 3e est au minimum Inhabituelle ; une Rare ou mieux est garantie au plus tard tous les 10 boosters. Les doublons restent des copies de collection et chaque carte ajoute aussi un spécimen vendable au panier.');
  const meta=panel.querySelector('.pack-meta');
  if(meta&&!document.querySelector('#packQuality')){
    const a=document.createElement('div');a.innerHTML='<small>Qualité garantie</small><strong id="packQuality">3e · Inhabituelle+</strong>';meta.appendChild(a);
    const b=document.createElement('div');b.innerHTML='<small>Protection Rare+</small><strong id="packPity">≤ 10 boosters</strong>';meta.appendChild(b);
  }
  const results=document.querySelector('#packResults');
  if(results&&!document.querySelector('#packSummary')){
    const s=document.createElement('div');s.id='packSummary';s.className='pack-summary hide';results.parentNode.insertBefore(s,results);
  }
  const stats=document.querySelector('.collection-stats');
  if(stats&&!document.querySelector('#cardCopiesTotal')){
    const p=document.createElement('span');p.className='pill';p.innerHTML='<b id="cardCopiesTotal">0</b>&nbsp;cartes possédées';stats.appendChild(p);
  }
}
function enhanceCards(s){
  document.querySelectorAll('#cards [data-card]').forEach(card=>{
    const id=Number(card.dataset.card),copies=G.cardCopies(s,id);
    let chip=card.querySelector('.copy-chip');
    if(copies>0&&!chip){chip=document.createElement('span');chip.className='copy-chip';card.appendChild(chip)}
    if(chip)setText(chip,'×'+copies);
  });
}
function renderPackSummary(){
  const r=G.lastCardPackResult,el=document.querySelector('#packSummary');if(!el||!r||!r.ok)return;
  if(r.packNumber===lastPackNumber&&!el.classList.contains('hide'))return;
  lastPackNumber=r.packNumber;
  const bits=[`${r.newCards} nouvelle${r.newCards>1?'s':''}`,`${r.duplicates} doublon${r.duplicates>1?'s':''}`,`meilleure : ${r.bestRarityLabel}`];
  if(r.rareProtectionTriggered)bits.push('protection Rare+ déclenchée');
  el.innerHTML=`<b>Booster #${r.packNumber}</b><span>${bits.join(' · ')}</span>`;
  el.classList.remove('hide');
}
function refresh(){
  scheduled=false;ensureUi();
  const s=G.currentState;if(!s)return;
  const status=G.cardBoosterStatus(s),cost=G.cardPackCost(s),button=document.querySelector('#packPull');
  const pity=document.querySelector('#packPity');
  if(status.guaranteedNext)setText(pity,'Rare+ garantie au prochain');
  else setText(pity,`Rare+ dans ≤ ${status.packsUntilRareGuarantee} booster${status.packsUntilRareGuarantee>1?'s':''}`);
  if(button)setText(button,`Ouvrir un booster · ${cost} ◉`);
  const copies=Object.values(s.cardCopiesById||{}).reduce((a,n)=>a+Math.max(0,Number(n)||0),0);
  setText(document.querySelector('#cardCopiesTotal'),String(copies));
  enhanceCards(s);renderPackSummary();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(refresh)}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
ensureUi();refresh();
})();
