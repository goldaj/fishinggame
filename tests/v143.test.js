const assert=require('assert');
const fs=require('fs');
const path=require('path');
const nav=require('../app/src/main/assets/v143-ui.js');

assert.strictEqual(nav.rankFromText('Rang 1'),1);
assert.strictEqual(nav.rankFromText('Rang 8'),8);
assert.strictEqual(nav.rankFromText('Rang 10'),10);
assert.strictEqual(nav.isGachaAvailable(7,8),false);
assert.strictEqual(nav.isGachaAvailable(8,8),true);

function classList(initial=[]){
  const set=new Set(initial);
  return {contains:x=>set.has(x),add:x=>set.add(x),remove:x=>set.delete(x)};
}
function fakeDoc(rank,screenOn=false){
  const navEl={dataset:{}};
  const rankEl={textContent:`Rang ${rank}`};
  const gacha={hidden:false,tabIndex:0,attrs:{},setAttribute(k,v){this.attrs[k]=v}};
  const screen={classList:classList(screenOn?['on']:[])};
  const fish={clicks:0,click(){this.clicks++}};
  const map={'.nav':navEl,'#rank':rankEl,'.nav [data-s="gacha"]':gacha,'#gacha':screen,'.nav [data-s="fish"]':fish};
  return {doc:{querySelector:s=>map[s]||null},navEl,rankEl,gacha,screen,fish};
}
let f=fakeDoc(7,true);let r=nav.apply(f.doc,{gachaMinRank:8});
assert.strictEqual(r.available,false);assert.strictEqual(f.gacha.hidden,true);assert.strictEqual(f.gacha.attrs['aria-hidden'],'true');assert.strictEqual(f.navEl.dataset.gachaAvailable,'false');assert.strictEqual(f.fish.clicks,1);
f=fakeDoc(8,false);r=nav.apply(f.doc,{gachaMinRank:8});
assert.strictEqual(r.available,true);assert.strictEqual(f.gacha.hidden,false);assert.strictEqual(f.gacha.attrs['aria-hidden'],'false');assert.strictEqual(f.navEl.dataset.gachaAvailable,'true');assert.strictEqual(f.fish.clicks,0);

const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'app/src/main/assets/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'app/src/main/assets/v143.css'),'utf8');
const navBlock=html.match(/<nav class="nav"[\s\S]*?<\/nav>/)[0];
const positions=['market','fish','collection','gacha'].map(x=>navBlock.indexOf(`data-s="${x}"`));
assert.ok(positions.every((x,i)=>i===0||x>positions[i-1]),'nav order must be market, fish, collection, gacha');
assert.ok(!navBlock.includes('grid-template-columns:repeat(4,1fr)'));
assert.ok(navBlock.includes('data-s="gacha" hidden aria-hidden="true"'));
assert.ok(html.includes('href="v143.css"'));
assert.ok(html.includes('src="v143-ui.js"'));
assert.ok(css.includes('[data-s="fish"]{grid-column:3}'));
assert.ok(css.includes('[data-s="market"]{grid-column:1}'));
assert.ok(css.includes('[data-s="gacha"]{grid-column:5}'));
assert.ok(css.includes('data-gacha-available="true"'));
console.log('v143 tests passed');
