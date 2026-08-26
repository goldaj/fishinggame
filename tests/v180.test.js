const assert=require('assert');
const fs=require('fs');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const ui=fs.readFileSync('app/src/main/assets/v180-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v180.css','utf8');
const cardCss=fs.readFileSync('app/src/main/assets/v160.css','utf8');
const app=fs.readFileSync('app/src/main/assets/app.js','utf8');
const manifest=fs.readFileSync('app/src/main/AndroidManifest.xml','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(html.includes('<title>Fishing Cards</title>'),'document title must be Fishing Cards');
assert.ok(html.includes('<h1>Fishing Cards</h1>'),'visible game title must be Fishing Cards');
assert.ok(html.includes('href="v180.css"'),'1.8.0 fishing-card styles must load');
assert.ok(html.indexOf('<script src="v180-ui.js"></script>')>html.indexOf('<script src="v175-ui.js"></script>'),'Fishing Cards UX must patch the stable 1.7.5 booster layer last');
assert.ok(html.includes('La pêche et les boosters utilisent désormais exactement les mêmes cartes.'),'collection copy must describe the unified card identity');

assert.ok(ui.includes("G.productName='Fishing Cards'"),'runtime brand must be Fishing Cards');
assert.ok(ui.includes("G.productVersion='1.8.0'"),'runtime product version must be 1.8.0');
assert.ok(ui.includes('class="reveal-card ${c.rarity} fishing-catch-card-v180 is-visible"'),'caught cards must reuse the exact booster reveal-card rarity classes');
assert.ok(ui.includes('<div class="reveal-foil"></div>'),'caught cards must reuse the booster foil layer');
assert.ok(ui.includes('Poids · ${weight}'),'caught card must add specimen weight to the card itself');
assert.ok(ui.includes('NOUVEAU RECORD'),'record state must remain visible on the caught card');
assert.ok(ui.includes('/^Déchet\\b/i.test(detail)'),'trash must stay trash instead of becoming a collection card');
assert.ok(ui.includes("setText(el,'FISHING CARDS')"),'dynamically created booster wrappers must use the new brand');

assert.ok(css.includes('.landed-fish.fishing-card-landed-v180'),'the fishing stage must have a dedicated card landing presentation');
assert.ok(css.includes('.fishing-card-summary-v180'),'catch details must remain readable below the fishing stage');
assert.ok(!css.includes('linear-gradient(160deg,#263943,#15242c)'),'1.8.0 must not duplicate rarity colors; it must inherit booster card styling');
assert.ok(cardCss.includes('.reveal-card.commune{background:linear-gradient(160deg,#263943,#15242c)}'),'booster card rarity styling remains the canonical source');
assert.ok(cardCss.includes('.reveal-card.mythique{background:linear-gradient(160deg,#213c4a,#51375f 32%,#286b68 64%,#65552f)}'),'mythic catch card must inherit the same booster mythic colors');

assert.ok(app.includes("key='pm-save'"),'existing save storage key must be preserved');
assert.ok(app.includes('startPostCatchCooldown();'),'successful catches must retain the existing post-catch anti-spam cooldown');
assert.ok(app.includes('timing=G.fishingTiming(encounter,st)'),'fishing timing mechanics must remain on the existing engine');
assert.ok(app.includes('const c=encounter,weight=G.rollWeight(c,st),reward=G.addCatch(st,c,weight)'),'catch probability/reward path must remain on the existing engine');

assert.ok(manifest.includes('android:label="Fishing Cards"'),'Android launcher label must be Fishing Cards');
assert.ok(/versionCode\s+22/.test(gradle),'Android versionCode must be 22');
assert.ok(/versionName\s+'1\.8\.0'/.test(gradle),'Android versionName must be 1.8.0');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain unchanged so the update installs over the existing app');

console.log('v1.8.0 Fishing Cards UX regression tests passed');
