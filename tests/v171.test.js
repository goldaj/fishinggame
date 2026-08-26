const assert=require('assert');
const fs=require('fs');

const ui=fs.readFileSync('app/src/main/assets/v171-ui.js','utf8');
const tactile=fs.readFileSync('app/src/main/assets/v170-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v171.css','utf8');
const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(ui.includes('TAP_MAX_DISTANCE=14'),'tap threshold must stay explicit');
assert.ok(ui.includes("dispatchEvent(new KeyboardEvent('keydown',{key:'Enter'"),'simple tap must advance through the existing card navigation path');
assert.ok(tactile.includes('bindCardSwipe')&&tactile.includes('boosterCardSwipeDecision'),'swipe navigation must remain implemented even if later UI copy changes');
assert.ok(ui.includes("zone.classList.add('tear-zone-v171')"),'tear target must be decorated on the packet seam');
assert.ok(ui.includes('autour de la liaison du paquet'),'tear instruction must target the visible seam area');
assert.ok(!ui.includes('TIRE ICI'),'tear affordance must not rely on visible instructional text');
assert.ok(css.includes('.tear-zone-v171{left:-22px;right:-22px;top:18px;height:120px'),'tear hitbox must span broadly above and below the seam');
assert.ok(css.includes('top:59px;border-top:2px dashed'),'visible seam must sit near the middle of the hitbox');
assert.ok(css.includes('.tear-tab-v171'),'visible tear grip must remain without text');
assert.ok(html.includes('v171.css')&&html.includes('v171-ui.js'),'1.7.x interaction assets must be loaded for compatibility');
const versionCodeMatch=gradle.match(/versionCode\s+(\d+)/);
assert.ok(versionCodeMatch&&Number(versionCodeMatch[1])>=18,'Android versionCode must not regress below 18');
const versionNameMatch=gradle.match(/versionName\s+'(\d+)\.(\d+)\.(\d+)'/);
assert.ok(versionNameMatch,'Android versionName must remain semantic');
const major=Number(versionNameMatch[1]),minor=Number(versionNameMatch[2]);
assert.ok(major>1||(major===1&&minor>=7),'Android versionName must not regress below the tactile 1.7 generation');

console.log('v1.7+ booster interaction compatibility tests passed');
