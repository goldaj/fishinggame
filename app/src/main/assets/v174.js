(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v170.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const rules={distanceRatio:.38,distanceMinPx:88,flickMinPx:40,flickVelocity:.55,maxDragRatio:1.12};
G.releaseVersion='1.7.4';
G.boosterTearInteractionVersion='1.7.4';
G.boosterFluidTearRules=rules;
G.boosterFluidTearThreshold=width=>Math.max(rules.distanceMinPx,Math.max(1,Math.abs(Number(width)||1))*rules.distanceRatio);
G.boosterFluidTearDrag=(dx,width)=>{
  const w=Math.max(1,Math.abs(Number(width)||1));
  const limit=w*rules.maxDragRatio;
  const x=Number(dx)||0;
  return Math.max(-limit,Math.min(limit,x));
};
G.boosterFluidTearProgress=(dx,width)=>Math.min(1,Math.abs(Number(dx)||0)/G.boosterFluidTearThreshold(width));
G.boosterFluidTearDecision=(dx,width,elapsedMs)=>{
  const x=Number(dx)||0,elapsed=Math.max(1,Number(elapsedMs)||1),distance=Math.abs(x);
  if(distance>=G.boosterFluidTearThreshold(width))return x<0?-1:1;
  if(distance>=rules.flickMinPx&&distance/elapsed>=rules.flickVelocity)return x<0?-1:1;
  return 0;
};

if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
