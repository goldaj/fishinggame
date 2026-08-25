(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.NavLayoutV143=api;
  if(typeof document!=='undefined')api.mount(document,root&&root.GameCore);
})(typeof window==='undefined'?globalThis:window,function(){
  'use strict';
  function rankFromText(text){
    const m=String(text||'').match(/(\d+)/);
    return m?Number(m[1]):1;
  }
  function isGachaAvailable(rank,minRank){
    return Number(rank)>=Number(minRank||8);
  }
  function apply(doc,core){
    if(!doc||typeof doc.querySelector!=='function')return {mounted:false,rank:1,minRank:8,available:false};
    const nav=doc.querySelector('.nav');
    const rankEl=doc.querySelector('#rank');
    const gachaButton=doc.querySelector('.nav [data-s="gacha"]');
    if(!nav||!rankEl||!gachaButton)return {mounted:false,rank:1,minRank:8,available:false};
    const minRank=Number(core&&core.gachaMinRank)||8;
    const rank=rankFromText(rankEl.textContent);
    const available=isGachaAvailable(rank,minRank);
    gachaButton.hidden=!available;
    gachaButton.setAttribute('aria-hidden',available?'false':'true');
    gachaButton.tabIndex=available?0:-1;
    nav.dataset.gachaAvailable=available?'true':'false';
    if(!available){
      const gachaScreen=doc.querySelector('#gacha');
      if(gachaScreen&&gachaScreen.classList&&gachaScreen.classList.contains('on')){
        const fishButton=doc.querySelector('.nav [data-s="fish"]');
        if(fishButton&&typeof fishButton.click==='function')fishButton.click();
      }
    }
    return {mounted:true,rank,minRank,available};
  }
  function mount(doc,core){
    const update=()=>apply(doc,core);
    const rankEl=doc&&doc.querySelector?doc.querySelector('#rank'):null;
    update();
    if(rankEl&&typeof MutationObserver!=='undefined'){
      const observer=new MutationObserver(update);
      observer.observe(rankEl,{childList:true,characterData:true,subtree:true});
      return observer;
    }
    return null;
  }
  return {rankFromText,isGachaAvailable,apply,mount};
});
