const assert=require('assert');
const G=require('../app/src/main/assets/v130.js');
require('../app/src/main/assets/catch-art.js');
require('../app/src/main/assets/catch-art-unique.js');
const Art=globalThis.CatchArt;

assert.strictEqual(G.catalogVersion,'1.3.0');
assert.strictEqual(G.creatures.length,100);
assert.strictEqual(new Set(G.creatures.map(c=>c.name)).size,100,'les 100 prises doivent avoir des noms uniques');
assert.strictEqual(new Set(G.creatures.map(c=>c.assetKey)).size,100,'les 100 prises doivent avoir des clés d’asset uniques');

const fantasyWords=/spectral|cristal|brumes|constellations|braise|abysses|runique|kelpie|aspidochelone|makara|hydre|kraken/i;
assert(G.creatures.filter(c=>c.gate<=7).every(c=>!fantasyWords.test(c.name)),'aucun nom fantaisiste avant le rang 8');
assert.deepStrictEqual(
  G.creatures.filter(c=>c.gate===8).map(c=>c.name),
  ['Requin-renard d’azur','Coelacanthe spectral','Esturgeon de cristal','Poisson-lion des brumes','Régalec des constellations','Poisson-pierre de braise']
);
assert.deepStrictEqual(
  G.creatures.filter(c=>c.gate>=9).map(c=>c.name),
  ['Léviathan des abysses','Serpent marin runique','Kelpie des marées','Aspidochelone antique','Makara des tempêtes','Hydre océanique','Kraken des marées']
);

const representative={
  3:'crab',8:'octopus',18:'jelly',25:'flatfish',58:'shark',60:'ray',79:'seahorse',83:'sawfish',100:'kraken'
};
Object.entries(representative).forEach(([id,kind])=>assert.strictEqual(G.creatures[Number(id)-1].assetKind,kind));

const renders=G.creatures.map(c=>Art.render(c));
assert(renders.every(x=>/^<svg/.test(x)&&x.includes('catch-svg')),'chaque prise doit produire un SVG minimaliste');
const visualRenders=renders.map(x=>x.replace(/ data-catch="[^"]+"/,''));
assert.strictEqual(new Set(visualRenders).size,100,'les 100 SVG doivent rester distincts même sans leur identifiant technique');

const c=G.creatures[0];
const s0=G.defaultState();
const s5=G.defaultState();s5.upgrades.bait=5;s5.upgrades.reel=5;s5.upgrades.keeper=5;s5.upgrades.broker=5;
const t0=G.fishingTiming(c,s0,()=>0.5),t5=G.fishingTiming(c,s5,()=>0.5);
assert(t5.waitMs<=Math.round(t0.waitMs*.61),'Amorce niveau 5 doit réduire l’attente d’environ 40%');
assert(t5.strikeMs>=Math.round(t0.strikeMs*1.49),'Moulinet niveau 5 doit élargir la fenêtre d’environ 50%');
const w0=G.rollWeight(c,s0,()=>0.5),w5=G.rollWeight(c,s5,()=>0.5);
assert(w5>w0,'Vivier niveau 5 doit déplacer sensiblement le poids vers le haut');
const item={id:c.id,weightG:w0};
const v0=G.itemValue(s0,item),v5=G.itemValue(s5,item);
assert(v5>=Math.round(v0*1.29),'Licence niveau 5 doit apporter environ +30% à la vente');
assert.strictEqual(G.upgradeStatus(s5,'bait').current,'-40% attente');
assert.strictEqual(G.upgradeStatus(s5,'reel').current,'+50% fenêtre');
assert.strictEqual(G.upgradeStatus(s5,'broker').current,'+30% à la vente');

console.log('v130 tests: OK');
