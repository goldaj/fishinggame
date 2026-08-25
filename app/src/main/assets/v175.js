(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v170.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const rules={
  seamY:78,
  zoneTop:52,
  zoneHeight:52,
  edgeGrabPx:76,
  distanceRatio:.60,
  distanceMinPx:132,
  flickMinPx:54,
  flickVelocity:.72,
  maxDragRatio:1.08
};

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
G.boosterFoldTearRules=rules;
G.boosterFoldStartDirection=function(localX,width){
  const w=Math.max(1,finite(width,1)),x=Math.max(0,Math.min(w,finite(localX)));
  const edge=Math.min(rules.edgeGrabPx,w*.32);
  if(x<=edge)return 1;
  if(x>=w-edge)return -1;
  return 0;
};
G.boosterFoldTravel=function(deltaX,startDirection,width){
  const dir=startDirection<0?-1:1,w=Math.max(1,finite(width,1));
  const forward=Math.max(0,finite(deltaX)*dir);
  return Math.min(forward,w*rules.maxDragRatio);
};
G.boosterFoldThreshold=function(width){
  const w=Math.max(1,finite(width,1));
  return Math.max(rules.distanceMinPx,w*rules.distanceRatio);
};
G.boosterFoldProgress=function(deltaX,startDirection,width){
  return Math.min(1,G.boosterFoldTravel(deltaX,startDirection,width)/Math.max(1,G.boosterFoldThreshold(width)));
};
G.boosterFoldDecision=function(deltaX,startDirection,width,elapsedMs){
  const travel=G.boosterFoldTravel(deltaX,startDirection,width),elapsed=Math.max(1,finite(elapsedMs,1));
  if(travel>=G.boosterFoldThreshold(width))return startDirection<0?-1:1;
  if(travel>=rules.flickMinPx&&travel/elapsed>=rules.flickVelocity)return startDirection<0?-1:1;
  return 0;
};

if(!isNode){G.releaseVersion='1.7.5';G.boosterTearInteractionVersion='1.7.5';root.GameCore=G}
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
