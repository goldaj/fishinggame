const assert=require('assert');
const G=require('../app/src/main/assets/v170.js');

assert.strictEqual(G.releaseVersion,'1.7.0');
assert.ok(G.boosterGestureRules);

assert.strictEqual(G.boosterTearProgress(100,100,200),0);
assert.ok(G.boosterTearProgress(100,200,200)>0.6);
assert.strictEqual(G.boosterTearComplete(0.57),false);
assert.strictEqual(G.boosterTearComplete(0.58),true);

assert.strictEqual(G.boosterCardSwipeDecision(20,300,300),0,'un petit déplacement lent ne doit pas valider');
assert.strictEqual(G.boosterCardSwipeDecision(90,300,300),1,'un swipe suffisamment long vers la droite doit valider');
assert.strictEqual(G.boosterCardSwipeDecision(-90,300,300),-1,'un swipe suffisamment long vers la gauche doit valider');
assert.strictEqual(G.boosterCardSwipeDecision(42,300,60),1,'un flick court mais rapide doit valider');
assert.strictEqual(G.boosterCardSwipeDecision(-42,300,60),-1,'un flick rapide doit fonctionner dans les deux sens');

assert.strictEqual(G.boosterEdgeSignal(0),'common');
assert.strictEqual(G.boosterEdgeSignal(1),'uncommon');
assert.strictEqual(G.boosterEdgeSignal(2),'rare');
assert.strictEqual(G.boosterEdgeSignal(3),'epic');
assert.strictEqual(G.boosterEdgeSignal(4),'legendary');
assert.strictEqual(G.boosterEdgeSignal(5),'mythic');

const desc=G.boosterGestureDescription();
assert.ok(desc.tear&&desc.reveal&&desc.inspect);

console.log('v1.7.0 tactile booster gesture tests passed');
