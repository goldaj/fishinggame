(function(root){'use strict';
const A=root.CatchArt;if(!A||typeof A.render!=='function')return;
const previous=A.render.bind(A);
const GENERATED_IDS=new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380]);
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