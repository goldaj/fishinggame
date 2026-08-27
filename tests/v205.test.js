'use strict';
const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');

const root=path.resolve(__dirname,'..');
const asset=name=>path.join(root,'app','src','main','assets',name);
const read=name=>fs.readFileSync(asset(name),'utf8');

function gitBlobSha(file){
  const body=fs.readFileSync(file);
  const header=Buffer.from(`blob ${body.length}\0`,'utf8');
  return crypto.createHash('sha1').update(header).update(body).digest('hex');
}

/* These are the validated 2.0.1/1.7.x tactile files restored in 2.0.4.
   This feature must remain a final overlay rather than mutating the opening engine. */
const historical={
  'v160-ui.js':'8ad170b7fa454d772122c4028746f3d0bd1f3dcf',
  'v170-ui.js':'2d8dc379d24a07be5612c2930caff1746ba88b2f',
  'v171-ui.js':'522d639fb6f1218dd76b1f6ee9312ae46d96f914',
  'v174.js':'5c2114d50b0cbebecc983d4d46bbf2ccf1b6603f',
  'v174-ui.js':'60f4876afec863fd27c86c667160014da6451064',
  'v175.js':'c3db1a4b08a2f3220e34164fa9c45cea6c5bcef4',
  'v175-ui.js':'31985e541b2cedaa89c68e1e3b4df2dafdd760a1'
};
Object.entries(historical).forEach(([name,sha])=>{
  assert.strictEqual(gitBlobSha(asset(name)),sha,`${name} must stay byte-identical to the validated tactile engine`);
});

const html=read('index.html');
assert(html.includes('<link rel="stylesheet" href="v205.css">'));
assert(html.includes('<script src="v205-ui.js"></script>'));
assert(html.indexOf('v205.css')>html.indexOf('v204.css'),'v205.css must load after v204.css');
assert(html.indexOf('v205-ui.js')>html.indexOf('v201-ui.js'),'v205-ui.js must load after the existing booster/runtime layers');

const js=read('v205-ui.js');
assert(js.includes('const result=original.apply(this,arguments);'),'pack result wrapper must delegate to the original pack function');
assert(js.includes('return result;'),'pack result wrapper must return the original result');
assert(js.includes("forward('onpointerdown',e)"),'wide seam input must forward to the existing tear handler');
assert(js.includes("forward('onpointermove',e)"),'wide seam input must forward movement to the existing tear handler');
assert(js.includes("forward('onpointerup',e)"),'wide seam input must forward release to the existing tear handler');
assert(js.includes("stack.querySelectorAll('.edge-card')"),'edge stack DOM must be reused');
assert(js.includes('result.cards[index]'),'front preview must use the already-drawn pack cards');
assert(js.includes('art(c)'),'front preview must render the real card art');
[
  'G.boosterFoldStartDirection=',
  'G.boosterFoldTravel=',
  'G.boosterFoldProgress=',
  'G.boosterFoldDecision=',
  'G.releaseVersion='
].forEach(forbidden=>assert(!js.includes(forbidden),`v205-ui.js must not redefine ${forbidden}`));

const css=read('v205.css');
assert(css.includes('top:72px!important;'));
assert(css.includes('height:12px!important;'));
assert(css.includes('.tear-hit-v205'));
assert(css.includes('.edge-card.edge-face-v205'));
assert(css.includes('#boosterOpening #edgeFallback'));
assert(css.includes('display:none!important;'));

console.log('v205 booster UX overlay checks passed');
