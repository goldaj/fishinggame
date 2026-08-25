(function(root){'use strict';
if(!root.CatchArt||typeof root.CatchArt.render!=='function')return;
const previous=root.CatchArt.render;
function signature(c){
  const id=Number(c.id)||0;
  const a=16+((id*17)%19),b=22+((id*29)%17),d=1.4+((id%4)*.35);
  const e=62+((id*13)%15),f=18+((id*11)%23);
  let mark=`<circle cx="${a}" cy="${b}" r="${d.toFixed(1)}" fill="currentColor" opacity=".42"/><path d="M${e} ${f} l${3+(id%5)} ${2+((id+2)%4)}" opacity=".42"/>`;
  const n=String(c.name||'').toLowerCase();
  if(n.includes('baudroie')||n.includes('lotte de mer'))mark+=`<path d="M61 20 Q70 6 75 15" fill="none"/><circle cx="76" cy="15" r="2.2" fill="currentColor"/>`;
  if(n.includes('esturgeon'))mark+=`<path d="M39 23 l5 -3 l5 3 l5 -3 l5 3 l5 -3" fill="none" opacity=".75"/>`;
  if(n.includes('requin-renard'))mark+=`<path d="M16 34 Q4 12 9 4" fill="none" stroke-width="3"/>`;
  if(n.includes('poisson-lion'))mark+=`<path d="M37 23 l-8 -10 M43 21 l-3 -12 M50 21 l3 -12 M57 23 l8 -10" fill="none"/>`;
  if(n.includes('coelacanthe'))mark+=`<path d="M40 27 l5 -4 l5 4 l5 -4 l5 4 M40 35 l5 4 l5 -4 l5 4 l5 -4" fill="none" opacity=".65"/>`;
  if(n.includes('poisson-pierre'))mark+=`<path d="M37 39 l5 -8 l5 7 l5 -9 l5 8 l5 -7" fill="none" opacity=".8"/>`;
  return mark;
}
root.CatchArt.render=function(c){
  let svg=previous(c);
  if(!svg||!c)return svg;
  return svg.replace('</g></svg>',signature(c)+'</g></svg>');
};
})(typeof window==='undefined'?globalThis:window);
