(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v170.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const rules={
  hitboxTop:-4,
  hitboxHeight:164,
  seamY:78,
  maxTravelRatio:1.12,
  tearDistanceRatio:.34,
  tearMinPx:78,
  tearFlickMinPx:32,
  tearFlickVelocity:.42
};

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
function sign(v){return v<0?-1:1}

G.boosterFluidTearRules=rules;
G.boosterFluidTearDrag=function(deltaX,width){
  const w=Math.max(1,Math.abs(finite(width,1)));
  const max=w*rules.maxTravelRatio;
  return Math.max(-max,Math.min(max,finite(deltaX)));
};
G.boosterFluidTearThreshold=function(width){
  const w=Math.max(1,Math.abs(finite(width,1)));
  return Math.max(rules.tearMinPx,w*rules.tearDistanceRatio);
};
G.boosterFluidTearDecision=function(deltaX,width,elapsedMs){
  const dx=finite(deltaX),distance=Math.abs(dx),ms=Math.max(1,finite(elapsedMs,1));
  const velocity=distance/ms;
  if(distance>=G.boosterFluidTearThreshold(width))return sign(dx);
  if(distance>=rules.tearFlickMinPx&&velocity>=rules.tearFlickVelocity)return sign(dx);
  return 0;
};
G.boosterFluidTearProgress=function(deltaX,width){
  const threshold=Math.max(1,G.boosterFluidTearThreshold(width));
  return Math.max(0,Math.min(1,Math.abs(finite(deltaX))/threshold));
};

if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
