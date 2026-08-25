(function(){'use strict';
const result=document.querySelector('#result'),status=document.querySelector('#statusText'),dot=document.querySelector('#statusDot'),headline=document.querySelector('#headline'),sub=document.querySelector('#sub');
if(!result||!status||!dot||!headline||!sub)return;
function refresh(){
  if(result.classList.contains('hide'))return;
  const meta=result.querySelector('small'),name=result.querySelector('b');
  if(!meta||!/^Déchet\b/.test(meta.textContent||''))return;
  status.textContent='Déchet';
  dot.className='dot warn';
  headline.textContent='Un déchet remonté.';
  sub.textContent=`${name?name.textContent:'Déchet'} · valeur 1 ◉. La série est rompue.`;
}
new MutationObserver(refresh).observe(result,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
refresh();
})();
