const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v174.js');

assert.equal(G.releaseVersion,'1.7.4');
assert.equal(G.boosterTearInteractionVersion,'1.7.4');
assert.equal(G.boosterFluidTearDrag(90,300),90,'right drag must follow pointer 1:1');
assert.equal(G.boosterFluidTearDrag(-90,300),-90,'left drag must follow pointer 1:1');
assert.equal(G.boosterFluidTearDecision(115,300,500),1,'comfortable right drag must tear');
assert.equal(G.boosterFluidTearDecision(-115,300,500),-1,'comfortable left drag must tear');
assert.equal(G.boosterFluidTearDecision(42,300,70),1,'quick right flick must tear');
assert.equal(G.boosterFluidTearDecision(-42,300,70),-1,'quick left flick must tear');
assert.equal(G.boosterFluidTearDecision(24,300,300),0,'tiny slow movement must not tear');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const ui=fs.readFileSync('app/src/main/assets/v174-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v174.css','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

const p160=html.indexOf('<script src="v160-ui.js"></script>');
const p170=html.indexOf('<script src="v170-ui.js"></script>');
const p171=html.indexOf('<script src="v171-ui.js"></script>');
const p174=html.indexOf('<script src="v174.js"></script>');
const p174ui=html.indexOf('<script src="v174-ui.js"></script>');
assert.ok(p160>=0&&p170>p160&&p171>p170&&p174>p171&&p174ui>p174,
  '1.7 tactile UI must initialize while releaseVersion is still 1.7.0, before 1.7.4 patches the gesture');
assert.ok(!html.includes('<script src="v173.js"></script>'),'v173.js must not preempt tactile startup');
assert.ok(!html.includes('<script src="v173-ui.js"></script>'),'v173-ui must not override restored handlers');
assert.ok(!html.includes('href="v173.css"'),'v173 css must not override restored hit area');
assert.ok(html.includes('href="v174.css"'),'1.7.4 css must load');
assert.ok(ui.includes("zone.classList.add('tear-zone-v174')"),'1.7.4 must decorate the real V1.7 tear surface');
assert.ok(ui.includes("pack.style.setProperty('--tear-x',`${dx}px`)"),'pack lid must consume signed pointer travel directly');
assert.ok(ui.includes('getCoalescedEvents'),'coalesced pointer samples should be used when available');
assert.ok(ui.includes('oldKeydown.call(zone'),'1.7.4 must finish through the restored V1.7 edge-preview flow');
assert.ok(css.includes('top:-24px!important;bottom:-24px!important;height:auto!important'),'hit area must cover the whole booster vertically');
assert.ok(css.includes('transform:translate3d(var(--tear-x,0px),0,0)!important'),'drag transform must visibly use the signed pointer CSS variable');
assert.ok(css.includes('.tactile-pack.tear-dragging-v174 .pack-lid{transition:none!important'),'finger-follow must have no transition lag');
assert.ok(/versionCode\s+20/.test(gradle),'Android versionCode must be 20');
assert.ok(/versionName\s+'1\.7\.4'/.test(gradle),'Android versionName must be 1.7.4');

console.log('v1.7.4 restored tactile booster regression tests passed');
