const assert=require('assert');
const {CONFIG}=require('../app/src/main/assets/v142-ui.js');
assert.strictEqual(CONFIG.version,'1.4.2');
assert.deepStrictEqual(CONFIG.events,['fish','card','gacha']);
assert(CONFIG.packStaggerMs>=150&&CONFIG.packStaggerMs<=300);
assert(CONFIG.particleLifetimeMs>=1000);
assert(CONFIG.bannerLifetimeMs>=2000);
console.log('v142 animation config tests: OK');
