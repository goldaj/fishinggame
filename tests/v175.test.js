const assert=require('assert');
const fs=require('fs');
const G=require('../app/src/main/assets/v175.js');

const rules=G.boosterFoldTearRules;
assert.equal(rules.seamY,78,'fold must match the 78px bottom edge of the lid');
assert.equal(rules.zoneTop+rules.zoneHeight/2,rules.seamY,'touch strip must be centered on the fold');
assert.equal(G.boosterFoldStartDirection(30,300),1,'left edge must start a rightward tear');
assert.equal(G.boosterFoldStartDirection(150,300),0,'middle of the fold must not start tearing');
assert.equal(G.boosterFoldStartDirection(270,300),-1,'right edge must start a leftward tear');
assert.equal(G.boosterFoldTravel(90,1,300),90,'left-edge tear must track rightward travel 1:1');
assert.equal(G.boosterFoldTravel(-90,1,300),0,'left-edge tear must reject the wrong direction');
assert.equal(G.boosterFoldTravel(-90,-1,300),90,'right-edge tear must track leftward travel 1:1');
assert.equal(G.boosterFoldTravel(90,-1,300),0,'right-edge tear must reject the wrong direction');
assert.equal(G.boosterFoldDecision(190,1,300,500),1,'long left-to-right pull must tear');
assert.equal(G.boosterFoldDecision(-190,-1,300,500),-1,'long right-to-left pull must tear');
assert.equal(G.boosterFoldDecision(38,1,300,300),0,'short slow pull must not tear');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const ui=fs.readFileSync('app/src/main/assets/v175-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v175.css','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

const p174ui=html.indexOf('<script src="v174-ui.js"></script>');
const p175=html.indexOf('<script src="v175.js"></script>');
const p175ui=html.indexOf('<script src="v175-ui.js"></script>');
assert.ok(p174ui>=0&&p175>p174ui&&p175ui>p175,'1.7.5 must override the already-mounted 1.7.4 gesture instead of blocking tactile startup');
assert.ok(html.includes('href="v175.css"'),'1.7.5 css must load after prior booster styles');
assert.ok(html.includes('extrémité de la pliure'),'instructions must tell the player to start at a fold edge');
assert.ok(!html.includes('Pose le pouce n’importe où sur le booster'),'whole-pack instruction must be removed');
assert.ok(ui.includes('boosterFoldStartDirection(localX,width)'),'pointerdown must validate which fold edge was grabbed');
assert.ok(ui.includes("if(!dir)"),'middle starts must be rejected');
assert.ok(ui.includes("zone.setPointerCapture(pointerId)"),'valid edge grab must retain the gesture across the pack');
assert.ok(ui.includes('getCoalescedEvents'),'pointer motion should remain direct and smooth');
const legacyFinish=ui.indexOf("oldKeydown.call(zone");
const selectedFinishDirection=ui.indexOf('setFinishDirection(dir)',legacyFinish);
assert.ok(legacyFinish>=0&&selectedFinishDirection>legacyFinish,'selected left/right tear direction must be re-applied after the legacy transition');
assert.ok(css.includes('top:52px!important')&&css.includes('height:52px!important'),'active strip must surround the 78px fold, not the top of the booster');
assert.ok(css.includes('top:25px!important;border-top:2px dashed'),'visible seam must sit at y=77/78 within the strip');
assert.ok(css.includes('.fold-grip-left-v175')&&css.includes('.fold-grip-right-v175'),'both fold ends must have visible grab affordances');
assert.ok(css.includes('.tear-zone-v175 .tear-tab-v171{display:none!important}'),'obsolete single right-side grip must be hidden');
assert.ok(/versionCode\s+21/.test(gradle),'Android versionCode must be 21');
assert.ok(/versionName\s+'1\.7\.5'/.test(gradle),'Android versionName must be 1.7.5');

console.log('v1.7.5 fold-edge booster tear tests passed');
