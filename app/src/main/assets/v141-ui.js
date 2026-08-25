(function(){'use strict';
let lastFish='',lastGacha='',lastPack='';
function badge(host,text){
  if(!host||host.querySelector('.new-badge'))return;
  const b=document.createElement('span');b.className='new-badge';b.textContent=text;host.prepend(b);
}
function banner(text){
  const old=document.querySelector('.new-event-banner');if(old)old.remove();
  const el=document.createElement('div');el.className='new-event-banner';el.textContent=text;document.body.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('show'));
  setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove(),220)},2600);
}
function enhance(){
  const headline=document.querySelector('#headline'),result=document.querySelector('#result');
  if(headline&&result&&!result.classList.contains('hide')&&headline.textContent.includes('Nouvelle espèce découverte')){
    const sig='fish:'+result.textContent;
    if(sig!==lastFish){lastFish=sig;badge(result.querySelector('div'),'NOUVEAU POISSON');banner('NOUVEAU POISSON !')}
  }
  const g=document.querySelector('#gachaResult');
  if(g&&!g.classList.contains('hide')){
    const strong=g.querySelector('strong');
    if(strong&&strong.textContent.includes('Nouvelle espèce découverte')){
      const sig='gacha:'+g.textContent;
      if(sig!==lastGacha){lastGacha=sig;badge(g.querySelector('.draw-card>div'),'NOUVEAU GACHA');banner('NOUVEAU GACHA !')}
    }
  }
  const p=document.querySelector('#packResults');
  if(p&&!p.classList.contains('hide')){
    const fresh=[...p.querySelectorAll('.draw-card')].filter(card=>{const s=card.querySelector('strong');return s&&s.textContent.startsWith('Nouvelle carte')});
    fresh.forEach(card=>badge(card.querySelector('div'),'NOUVELLE CARTE'));
    if(fresh.length){const sig='pack:'+fresh.map(x=>x.textContent).join('|');if(sig!==lastPack){lastPack=sig;banner(fresh.length===1?'NOUVELLE CARTE !':`NOUVELLES CARTES ×${fresh.length} !`)}}
  }
}
new MutationObserver(enhance).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
enhance();
})();
