const assert=require('assert');
const fs=require('fs');

const ui=fs.readFileSync('app/src/main/assets/v171-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v171.css','utf8');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(ui.includes('TAP_MAX_DISTANCE=14'),'tap threshold must stay explicit');
assert.ok(ui.includes("dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'"),'simple tap must advance through the existing card navigation path');
assert.ok(ui.includes("zone.classList.add('tear-zone-v171')"),'tear target must be decorated on the packet seam');
assert.ok(ui.includes('autour de la liaison du paquet'),'tear instruction must target the visible seam area');
assert.ok(!ui.includes('TIRE ICI'),'tear affordance must not rely on visible instructional text');
assert.ok(css.includes('.tear-zone-v171{left:-22px;right:-22px;top:18px;height:120px'),'tear hitbox must span broadly above and below the seam');
assert.ok(css.includes('top:59px;border-top:2px dashed'),'visible seam must sit near the middle of the hitbox');
assert.ok(css.includes('.tear-tab-v171'),'visible tear grip must remain without text');
assert.ok(html.includes('v171.css')&&html.includes('v171-ui.js'),'1.7.x interaction assets must be loaded');
assert.ok(html.includes('touche ou glisse les cartes une à une'),'instructions must mention tap and swipe');
assert.ok(/versionCode\s+18/.test(gradle),'Android versionCode must be 18');
assert.ok(/versionName\s+'1\.7\.2'/.test(gradle),'Android versionName must be 1.7.2');

console.log('v1.7.2 booster interaction patch tests passed');
