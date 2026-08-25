const assert=require('assert');
const fs=require('fs');

const ui=fs.readFileSync('app/src/main/assets/v171-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v171.css','utf8');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(ui.includes('TAP_MAX_DISTANCE=14'),'tap threshold must stay explicit');
assert.ok(ui.includes("dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'"),'simple tap must advance through the existing card navigation path');
assert.ok(ui.includes("zone.classList.add('tear-zone-v171')"),'tear target must be decorated on the packet edge');
assert.ok(ui.includes('La zone tactile est volontairement large'),'tear affordance must explain the forgiving target');
assert.ok(css.includes('.tear-zone-v171{left:-18px;right:-18px;top:0;height:98px'),'tear hitbox must cover a large area on the packet top edge');
assert.ok(css.includes('.tear-tab-v171'),'visible tear tab must exist');
assert.ok(html.includes('v171.css')&&html.includes('v171-ui.js'),'1.7.1 assets must be loaded');
assert.ok(html.includes('touche ou glisse les cartes une à une'),'instructions must mention tap and swipe');
assert.ok(/versionCode\s+17/.test(gradle),'Android versionCode must be 17');
assert.ok(/versionName\s+'1\.7\.1'/.test(gradle),'Android versionName must be 1.7.1');

console.log('v1.7.1 booster interaction patch tests passed');
