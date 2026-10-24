const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const G = require('../app/src/main/assets/v210.js');

// Exercise the real boot code before it registers DOM listeners.
const source = fs.readFileSync(path.join(__dirname, '../app/src/main/assets/app.js'), 'utf8');
const prefix = source.slice(0, source.indexOf('function later('));
assert(prefix.includes('function loadSavedState()'));
function boot(storage) {
  const context = {
    GameCore: G, localStorage: storage,
    window: {}, console: {warn(){}}, document: {querySelector(){}}
  };
  vm.runInNewContext(prefix + '\nglobalThis.bootState=st;', context);
  return context.bootState;
}
const damaged = boot({getItem(){return '{broken-json';}});
assert.equal(damaged.coins, 0);
assert(Array.isArray(damaged.unlocked));
const unavailable = boot({getItem(){throw new Error('storage blocked');}});
assert.equal(unavailable.coins, 0);
const valid = boot({getItem(){return JSON.stringify({coins:123,unlocked:[1,2]});}});
assert.equal(valid.coins, 123);
assert.deepEqual(Array.from(valid.unlocked), [1, 2]);
console.log('OK: boot recovers corrupted or blocked saves');
