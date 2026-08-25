(function(){'use strict';
const G=window.GameCore;
if(!G)return;

const gachaIntro=document.querySelector('#gacha .panel > p');
if(gachaIntro)gachaIntro.textContent='Le rang rend les nouvelles espèces pêchables. Tant qu’elles n’ont jamais été découvertes, elles restent exceptionnellement rares en pêche. Le gacha les révèle immédiatement et les fait rejoindre leur fréquence normale.';

const collectionIntro=document.querySelector('#collection .section-head p');
if(collectionIntro)collectionIntro.textContent='Une espèce devient visible après sa première capture ou un tirage gacha. Le rang suffit toutefois à la rendre pêchable, avec une chance de découverte sauvage très faible.';

const cards=document.querySelector('#cards');
function refreshCards(){
  if(!cards)return;
  cards.querySelectorAll('.meta').forEach(meta=>{
    if((meta.textContent||'').trim()==='Disponible au gacha')meta.textContent='Très rare en pêche · gacha disponible';
  });
}
if(cards){new MutationObserver(refreshCards).observe(cards,{subtree:true,childList:true});refreshCards()}

const modal=document.querySelector('#cardModal');
function refreshModal(){
  if(!modal||modal.classList.contains('hide'))return;
  const rarity=document.querySelector('#modalRarity');
  if(rarity&&(rarity.textContent||'').trim()==='Accessible au gacha')rarity.textContent='Très rare en pêche · gacha disponible';
  document.querySelectorAll('#modalStats strong').forEach(el=>{
    if((el.textContent||'').trim()==='Gacha disponible')el.textContent='Très rare en pêche · gacha disponible';
  });
}
if(modal){new MutationObserver(refreshModal).observe(modal,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});refreshModal()}

const result=document.querySelector('#result'),status=document.querySelector('#statusText'),dot=document.querySelector('#statusDot'),headline=document.querySelector('#headline'),sub=document.querySelector('#sub');
function refreshDiscovery(){
  if(!result||result.classList.contains('hide')||!G.lastWildDiscovery)return;
  const name=result.querySelector('b');
  if(!name||name.textContent!==G.lastWildDiscovery.name)return;
  if(status)status.textContent='Découverte';
  if(dot)dot.className='dot live';
  if(headline)headline.textContent='Nouvelle espèce découverte !';
  if(sub&&!sub.textContent.includes('fréquence normale'))sub.textContent=`${sub.textContent} Elle rejoint désormais sa fréquence normale de pêche.`;
  G.lastWildDiscovery=null;
}
if(result){new MutationObserver(refreshDiscovery).observe(result,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});refreshDiscovery()}
})();
