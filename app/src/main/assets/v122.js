(function(root){'use strict';
const isNode=typeof module!=='undefined'&&module.exports;
const G=isNode?require('./core.js'):root.GameCore;
if(!G){if(isNode)module.exports=null;return}
const profiles={
  commune:{haptic:[78,98],duration:[26,34]},
  inhabituelle:{haptic:[82,103],duration:[27,36]},
  rare:{haptic:[86,108],duration:[28,38]},
  epique:{haptic:[90,113],duration:[29,40]},
  legendaire:{haptic:[94,118],duration:[30,42]},
  mythique:{haptic:[98,123],duration:[31,44]}
};
Object.keys(profiles).forEach(key=>{const p=profiles[key],r=G.rarities[key];if(r){r.haptic=p.haptic;r.hapticDuration=p.duration}});
function randBetween(range,rand){const [min,max]=range,u=Math.max(0,Math.min(.999999,(rand||Math.random)()));return Math.round(min+(max-min)*u)}
G.hapticProfile=function(c,rand=Math.random){const p=G.rarities[c.rarity];return{amplitude:randBetween(p.haptic,rand),durationMs:randBetween(p.hapticDuration,rand)}};
G.registerMiss=function(s,kind){s.streak=0;if(kind==='retracted'){s.retractedCasts=(s.retractedCasts||0)+1;return}s.failedHooks=(s.failedHooks||0)+1};
function tapHaptic(){try{if(root.NativeHaptics&&typeof root.NativeHaptics.tap==='function')root.NativeHaptics.tap();else if(root.navigator&&typeof root.navigator.vibrate==='function')root.navigator.vibrate(18)}catch(_){}}
if(root.document&&typeof root.document.addEventListener==='function')root.document.addEventListener('click',e=>{const b=e.target&&e.target.closest?e.target.closest('button'):null;if(b&&!b.disabled)tapHaptic()},true);
if(!isNode)root.GameCore=G;
if(isNode)module.exports=G;
})(typeof window==='undefined'?globalThis:window);
