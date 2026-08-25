(function(){'use strict';
const G=window.GameCore;
if(!G)return;

const rules={distanceRatio:.38,distanceMinPx:88,flickMinPx:40,flickVelocity:.55,maxDragRatio:1.12};
G.releaseVersion='1.7.4';
G.boosterTearInteractionVersion='1.7.4';
G.boosterFluidTearRules=rules;
G.boosterFluidTearThreshold=width=>Math.max(rules.distanceMinPx,Math.max(1,width)*rules.distanceRatio);
G.boosterFluidTearDrag=(dx,width)=>{
  const limit=Math.max(1,width)*rules.maxDragRatio;
  return Math.max(-limit,Math.min(limit,Number(dx)||0));
};
G.boosterFluidTearProgress=(dx,width)=>Math.min(1,Math.abs(Number(dx)||0)/G.boosterFluidTearThreshold(width));
G.boosterFluidTearDecision=(dx,width,elapsedMs)=>{
  const x=Number(dx)||0,elapsed=Math.max(1,Number(elapsedMs)||1),distance=Math.abs(x);
  if(distance>=G.boosterFluidTearThreshold(width))return x<0?-1:1;
  if(distance>=rules.flickMinPx&&distance/elapsed>=rules.flickVelocity)return x<0?-1:1;
  return 0;
};
})();
