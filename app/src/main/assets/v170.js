(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./v160.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}

const gestureRules={
  tearThreshold:.58,
  tearTravelRatio:.72,
  cardSwipeMinPx:64,
  cardSwipeRatio:.22,
  cardFlickMinPx:34,
  cardFlickVelocity:.52
};

function finite(v,fallback=0){v=Number(v);return Number.isFinite(v)?v:fallback}
function clamp01(v){return Math.max(0,Math.min(1,finite(v)))}

G.boosterGestureRules=gestureRules;
G.boosterTearProgress=function(startX,currentX,width){
  const travel=Math.max(1,Math.abs(finite(width))*gestureRules.tearTravelRatio);
  return clamp01(Math.abs(finite(currentX)-finite(startX))/travel);
};
G.boosterTearComplete=function(progress){return clamp01(progress)>=gestureRules.tearThreshold};
G.boosterCardSwipeDecision=function(deltaX,width,elapsedMs){
  const dx=finite(deltaX),w=Math.max(1,Math.abs(finite(width,1))),ms=Math.max(1,finite(elapsedMs,1));
  const distance=Math.abs(dx),threshold=Math.max(gestureRules.cardSwipeMinPx,w*gestureRules.cardSwipeRatio);
  const velocity=distance/ms;
  if(distance>=threshold||(distance>=gestureRules.cardFlickMinPx&&velocity>=gestureRules.cardFlickVelocity))return dx<0?-1:1;
  return 0;
};
G.boosterEdgeSignal=function(rarityIndex){
  const i=Math.max(0,Math.floor(finite(rarityIndex)));
  return i>=5?'mythic':i===4?'legendary':i===3?'epic':i===2?'rare':i===1?'uncommon':'common';
};
G.boosterGestureDescription=function(){
  return{
    tear:'Glisser horizontalement sur la bande du booster.',
    reveal:'Glisser la carte à gauche ou à droite.',
    inspect:'Toucher une carte du bilan pour la revoir en grand.'
  };
};

G.releaseVersion='1.7.0';
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
