const assert=require('assert');
const fs=require('fs');

const html=fs.readFileSync('app/src/main/assets/index.html','utf8');
const ui=fs.readFileSync('app/src/main/assets/v190-ui.js','utf8');
const css=fs.readFileSync('app/src/main/assets/v190.css','utf8');
const app=fs.readFileSync('app/src/main/assets/app.js','utf8');
const gradle=fs.readFileSync('app/build.gradle','utf8');

assert.ok(html.includes('href="v190.css"'),'1.9.0 fishing scene styles must load');
assert.ok(html.indexOf('<script src="v190-ui.js"></script>')>html.indexOf('<script src="v180-ui.js"></script>'),'1.9.0 fishing motion must mount after the 1.8 caught-card layer');
assert.ok(ui.includes("G.fishingExperienceVersion='1.9.0'"),'runtime must expose the 1.9 fishing experience version');
assert.ok(ui.includes('rod-grip-v190')&&ui.includes('rod-main-v190')&&ui.includes('rod-tip-v190'),'new rod must be a multi-part vector component');
assert.ok(ui.includes('reel-v190')&&ui.includes('line-v190')&&ui.includes('bobber-v190'),'rod, reel, line and bobber must belong to one visual rig');
assert.ok(ui.includes("if(status==='Ligne à l’eau')return'waiting'"),'waiting animation must synchronize to the real fishing UI state');
assert.ok(ui.includes("if(status==='Présence')return'presence'"),'presence animation must synchronize to the real fishing UI state');
assert.ok(ui.includes("if(status==='TOUCHE')return'bite'"),'bite animation must synchronize to the real fishing UI state');
assert.ok(ui.includes("if(status==='Raté')"),'miss animation must synchronize to real failed catches');
assert.ok(ui.includes("if(status==='Découverte'||status==='Prise')return'reel-success'"),'successful fish catches must enter the reel animation');
assert.ok(ui.includes("if(status==='Déchet')return'reel-success-trash'"),'trash catches must keep the physical 1.9 reel-success path before later card presentation layers run');
assert.ok(ui.includes('MutationObserver(syncUiState)'),'motion layer must observe real gameplay state instead of duplicating timing logic');
assert.ok(ui.includes("landed.querySelector('.fishing-catch-card-v180')"),'1.9 must hand off to the existing canonical caught-card component');

assert.ok(css.includes('#fish .hero.fishing-experience-v190>#float')&&css.includes('display:none!important'),'legacy fishing emoji must be visually replaced');
assert.ok(css.includes('.state-waiting-v190')&&css.includes('.state-presence-v190')&&css.includes('.state-bite-v190'),'waiting, presence and bite need distinct visual states');
assert.ok(css.includes('.state-fail-early-v190')&&css.includes('.state-fail-late-v190'),'early and late failures need distinct feedback');
assert.ok(css.includes('.state-reel-success-v190')&&css.includes('.state-card-v190'),'successful reeling and card presentation must be separate states');
assert.ok(css.includes('@keyframes fishingCardReelV190'),'caught card must physically rise from the water into its reveal position');
assert.ok(css.includes('.water-sheen-v190')&&css.includes('.ring-v190')&&css.includes('.splash-v190'),'water, ripple and splash feedback must be present');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'motion overhaul must respect reduced-motion preferences');

assert.ok(app.includes("key='pm-save'"),'save key must remain unchanged');
assert.ok(app.includes('timing=G.fishingTiming(encounter,st)'),'1.9 must keep existing fishing timing mechanics');
assert.ok(app.includes('const c=encounter,weight=G.rollWeight(c,st),reward=G.addCatch(st,c,weight)'),'later releases must keep existing catch/weight/reward mechanics');
assert.ok(app.includes('startPostCatchCooldown();'),'later releases must preserve the post-catch anti-spam cooldown');
assert.ok(!app.includes('fishingExperienceVersion'),'core fishing engine must not duplicate the visual experience marker');

const versionCode=Number((gradle.match(/versionCode\s+(\d+)/)||[])[1]);
assert.ok(versionCode>=23,'Android versionCode must not regress below the 1.9 release');
const version=gradle.match(/versionName\s+'(\d+)\.(\d+)\.(\d+)'/);
assert.ok(version&&(Number(version[1])>1||(Number(version[1])===1&&Number(version[2])>=9)),'Android versionName must not regress below the 1.9 line');
assert.ok(gradle.includes("applicationId 'com.openai.pechemerveilles'"),'applicationId must remain stable for in-place updates');

console.log('v1.9+ Fishing Cards fishing experience compatibility tests passed');
