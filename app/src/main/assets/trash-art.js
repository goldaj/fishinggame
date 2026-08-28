(function(root){'use strict';
const A=root.CatchArt;if(!A||typeof A.render!=='function')return;
const previous=A.render.bind(A);
const GENERATED_IDS=new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50]);
function pad(id){return String(Math.round(Number(id)||0)).padStart(3,'0')}
function generated(c){return `<img class="catch-svg catch-generated-art" src="card-art/${pad(c.id)}.webp" alt="" aria-hidden="true" draggable="false" loading="lazy" decoding="async">`}
function base(inner,c){return `<svg class="catch-svg catch-trash" viewBox="0 0 96 64" aria-hidden="true" data-catch="${c.assetKey}"><g fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="2.15" stroke-linecap="round" stroke-linejoin="round">${inner}</g></svg>`}
function renderTrash(c){
  if(c.assetKind==='trash-boot')return base('<path d="M28 12 L51 12 L50 34 Q61 39 73 42 Q78 45 74 51 Q70 56 57 54 L30 50 Q24 49 24 42 L28 12Z"/><path d="M33 19 H48 M33 26 H48 M31 42 Q43 45 56 46"/>',c);
  if(c.assetKind==='trash-can')return base('<path d="M31 14 H65 L62 51 Q48 56 34 51 L31 14Z"/><ellipse cx="48" cy="14" rx="17" ry="5"/><path d="M34 24 Q48 28 63 24 M33 40 Q48 44 63 40"/><path d="M57 18 l6 7 l-7 5"/>',c);
  if(c.assetKind==='trash-bottle')return base('<path d="M43 8 H55 L55 18 Q63 24 63 34 L62 52 Q48 57 34 52 L33 34 Q33 24 41 18 L43 8Z"/><path d="M42 14 H56 M38 32 Q48 36 59 32 M38 45 Q48 48 58 45"/>',c);
  return base('<circle cx="48" cy="32" r="24"/><circle cx="48" cy="32" r="11"/><path d="M29 16 L36 23 M67 16 L60 23 M27 48 L36 41 M69 48 L60 41"/>',c);
}
A.generatedCardArtIds=GENERATED_IDS;
A.render=function(c){
  if(c&&GENERATED_IDS.has(Number(c.id)))return generated(c);
  return c&&c.isTrash?renderTrash(c):previous(c);
};
})(typeof window==='undefined'?globalThis:window);
