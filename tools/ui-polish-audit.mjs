// Optional real-Chrome UI regression checks. The game has no new dependencies.
// Point PLAYWRIGHT_MODULE at an existing installation and BROWSER_PATH at Chrome.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const {chromium} = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'artifacts', 'ui-polish-audit');
await fs.mkdir(output, {recursive: true});
const browser = await chromium.launch({headless: true, ...(process.env.BROWSER_PATH ? {executablePath: process.env.BROWSER_PATH} : {})});
const page = await browser.newPage({viewport: {width: 1920, height: 950}});
const errors = [], report = {menus: [], hud: [], errors};
page.on('pageerror', e => errors.push(e.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
const viewports = [[1920,950], [1536,750], [1280,720], [960,540], [640,360], [480,300]];
const states = ['idle', 'mach', 'launch-charge', 'beam-charge', 'guard', 'partial-nova', 'empty'];
const intersects = (a, b) => a.x < b.right - 1 && a.right > b.x + 1 && a.y < b.bottom - 1 && a.bottom > b.y + 1;

async function visibleBox(selector) {
  return page.locator(selector).evaluate(el => {
    if (!el.checkVisibility()) return null;
    const r = el.getBoundingClientRect();
    return {x: r.x, y: r.y, right: r.right, bottom: r.bottom};
  });
}

function assertOnScreen(rect, width, height, label) {
  assert(rect.x >= -1 && rect.y >= -1 && rect.right <= width + 1 && rect.bottom <= height + 1,
    `${label} is clipped at ${width}x${height}: ${JSON.stringify(rect)}`);
}

async function desktopMenuFit(selector) {
  const result = await page.locator(selector).evaluate(el => {
    const clipped = [], r = el.getBoundingClientRect();
    for (const child of el.querySelectorAll('button,input,select,h1,h2,p,li,.menu-controls span,.title-kicker,.mode-tag')) {
      if (!child.checkVisibility()) continue;
      const c = child.getBoundingClientRect();
      if (c.left < Math.max(0,r.left)-1 || c.top < Math.max(0,r.top)-1 || c.right > Math.min(innerWidth,r.right)+1 || c.bottom > Math.min(innerHeight,r.bottom)+1) clipped.push(child.id || child.textContent.trim());
    }
    return {clipped, clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, width: innerWidth, height: innerHeight};
  });
  assert.deepEqual(result.clipped, [], `${selector} has clipped content`);
  assert(result.scrollHeight <= result.clientHeight + 1, `${selector} requires desktop scrolling`);
  return result;
}

async function captureHud(state, god) {
  return page.evaluate(({state, god}) => {
    game.resize();
    game.setGodMode(god);
    const hero = game.activeHero;
    Object.assign(hero, {dead:false, hp:CFG.maxHp, energy:CFG.maxEnergy, speedEnergy:100, ultimateCharges:CFG.ultimateMaxCharges,
      ultimateKills:0, flying:false, onGround:true, boosting:false, speedBuild:0, launchCharging:false, launchTimer:0,
      chargingBeam:false, beamCharge:0, guardTimer:0, guardCd:0, guardPerfect:false, vx:0, vy:0});
    if (state === 'mach') Object.assign(hero, {flying:true, onGround:false, boosting:true, speedBuild:1, vx:CFG.speedFlyMax});
    if (state === 'launch-charge') Object.assign(hero, {launchCharging:true, launchTimer:hero.launchDuration*.75});
    if (state === 'beam-charge') Object.assign(hero, {chargingBeam:true, beamCharge:1, flying:true, onGround:false});
    if (state === 'guard') Object.assign(hero, {guardTimer:.5, guardPerfect:true, guardCd:CFG.guardCooldown});
    if (state === 'partial-nova') Object.assign(hero, {ultimateCharges:1, ultimateKills:2});
    if (state === 'empty') Object.assign(hero, {hp:4, energy:0, speedEnergy:0, ultimateCharges:0, ultimateKills:2, guardCd:1.3});
    const boss=game.activeBoss;
    if(boss)Object.assign(boss,{hp:boss.maxHp,dead:false,state:'recover',phase:1});
    if(state==='boss-warning'&&boss)Object.assign(boss,{hp:boss.maxHp*.18,state:'dash-windup',phase:3});
    if(state==='boss-defeated'&&boss)Object.assign(boss,{hp:0,dead:true});
    game.intro = 0;
    game.score = 999999;
    game.highScore = 9999999;
    const c = game.ctx, records = [], pipColors = [], nativeFillText = c.fillText, nativeFill = c.fill;
    // These two fills are the discrete active/empty Nova pips, not a continuous bar.
    c.fill = function(...args) {
      if(this.fillStyle==='#b891f5'||this.fillStyle==='#26344e')pipColors.push(this.fillStyle);
      return nativeFill.apply(this,args);
    };
    c.fillText = function(text, x, y, maxWidth) {
      const m = this.measureText(text), scale = maxWidth !== undefined && m.width > maxWidth ? maxWidth/m.width : 1;
      const t = this.getTransform();
      const points = [[x-m.actualBoundingBoxLeft*scale,y-m.actualBoundingBoxAscent],
        [x+m.actualBoundingBoxRight*scale,y-m.actualBoundingBoxAscent],
        [x-m.actualBoundingBoxLeft*scale,y+m.actualBoundingBoxDescent],
        [x+m.actualBoundingBoxRight*scale,y+m.actualBoundingBoxDescent]]
        .map(([px,py]) => ({x:(t.a*px+t.c*py+t.e)/game.dpr,y:(t.b*px+t.d*py+t.f)/game.dpr}));
      if (this.globalAlpha > .01 && String(text).trim()) records.push({text:String(text), x:Math.min(...points.map(p=>p.x)),
        y:Math.min(...points.map(p=>p.y)), right:Math.max(...points.map(p=>p.x)), bottom:Math.max(...points.map(p=>p.y))});
      return nativeFillText.call(this,text,x,y,...(maxWidth === undefined ? [] : [maxWidth]));
    };
    try {
      game.drawMissionHUD();
      game.drawBossIndicator();
    } finally {
      c.fillText = nativeFillText;
      c.fill = nativeFill;
    }
    return {records, pipColors, layout:game.hudLayout(), width:game.w, height:game.h};
  }, {state, god});
}

try {
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  for (const [width,height] of viewports.slice(0,3)) {
    await page.setViewportSize({width,height});
    const menu = await desktopMenuFit('#mainMenu');
    const stages = await page.locator('.mode-card').evaluateAll(cards => cards.map(card => {
      const r=card.getBoundingClientRect();return{x:r.x,y:r.y,bottom:r.bottom};
    }));
    assert.equal(stages.length,4);
    assert(stages.every((r,i)=>Math.abs(r.x-stages[0].x)<1 && (!i || r.y>stages[i-1].bottom)), 'stage cards must remain a vertical list');
    await page.locator('#classicMode').focus();
    for(const [key,id] of [['ArrowDown','stage2Mode'],['ArrowDown','stage3Mode'],['ArrowUp','stage2Mode'],['Home','classicMode'],['End','trainingMode'],['ArrowDown','classicMode']]) {
      await page.keyboard.press(key);
      assert.equal(await page.evaluate(()=>document.activeElement.id),id,`stage keyboard navigation: ${key}`);
    }
    const count = await page.locator('#mainMenu button, #actions button').count(), visited = [];
    for (let i=0;i<count+1;i++) {
      await page.keyboard.press('Tab');
      const active=await page.evaluate(()=>({id:document.activeElement.id,inside:document.querySelector('#mainMenu').contains(document.activeElement)||document.querySelector('#actions').contains(document.activeElement)}));
      assert(active.inside, 'main-menu keyboard focus must stay within menu or visible utility toolbar');
      visited.push(active.id);
    }
    for(const id of ['openSettings','mute','fullscreen'])assert(visited.includes(id),`${id} must be keyboard reachable from main menu`);
    await page.locator('#classicMode').focus();await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'fullscreen','reverse Tab wraps through toolbar');
    await page.locator('#godMode').focus();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#godMode').getAttribute('aria-checked'),'true','God Mode must expose switch state');
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#godMode').getAttribute('aria-checked'),'false');
    await page.click('#openSettings');
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#pauseMenu')).visibility==='visible');
    const settings = await desktopMenuFit('.pause-content');
    await page.check('#reducedMotion');
    await page.check('#reducedFlashing');
    await page.uncheck('#showControls');
    assert(await page.evaluate(()=>game.settings.reducedMotion && game.settings.reducedFlashing && !game.settings.showControls), 'settings inputs must update actual preferences');
    await page.keyboard.press('Escape');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'classicMode','Esc from settings restores stage focus');
    if (width===1920) await page.screenshot({path:path.join(output,'menu-1080p-browser.png')});
    report.menus.push({width,height,menu,settings});
  }
  await page.reload();
  assert(await page.evaluate(()=>game.settings.reducedMotion && game.settings.reducedFlashing && !game.settings.showControls),'UI preferences must survive reload');
  await page.click('#openSettings');
  await page.uncheck('#reducedMotion');await page.uncheck('#reducedFlashing');await page.check('#showControls');
  await page.click('#resumeGame');

  for (const mode of ['classic','stage2','stage3','training']) {
    await page.setViewportSize({width:1920,height:950});
    await page.evaluate(()=>{game.returnToMainMenu();game.setGodMode(false);});
    // Use keyboard activation as well as pointer activation on real stage buttons.
    const id={classic:'classicMode',stage2:'stage2Mode',stage3:'stage3Mode',training:'trainingMode'}[mode];
    await page.locator('#'+id).focus();await page.keyboard.press('Enter');
    await page.waitForFunction(()=>game.started&&!game.loading);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>game.paused);
    await desktopMenuFit('.pause-content');
    await page.click('#pauseGodMode');
    assert.equal(await page.locator('#pauseGodMode').getAttribute('aria-checked'),'true');
    await page.click('#resumeGame');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'game','resume restores input focus to game');
    // Freeze the simulation without opening a modal so layout assertions target gameplay.
    await page.evaluate(()=>{game.paused=true;game.intro=0;});
    for (const boss of [false,true]) {
      if (boss) await page.evaluate(()=>{
        if(game.isTraining)game.spawnTrainingBoss('warden');
        else if(game.isStage3)game.startStage3BossIntro();
        else if(game.isStage2)game.startStage2BossIntro();
        else game.startBossIntro();
        game.paused=true;game.intro=0;
      });
      for (const [width,height] of viewports) {
        await page.setViewportSize({width,height});
        await page.evaluate(()=>game.resize());
        const actions=await visibleBox('#actions'), controls=await visibleBox('#controls'), range=await visibleBox('#trainingHud');
        for (const [name,rect] of [['actions',actions],['controls',controls],['range',range]]) if(rect)assertOnScreen(rect,width,height,name);
        if (controls&&range) assert(!intersects(controls,range), 'controls must not be hidden behind the range panel');
        for (const god of [false,true]) for (const state of boss?[...states,'boss-warning','boss-defeated']:states) {
          const result=await captureHud(state,god);
          const {heroX,heroY,heroHeight,resourceWidth,panelX,panelY,panelWidth}=result.layout;
          if (Number.isFinite(heroHeight)) {
            const heroCard={x:heroX,y:heroY,right:heroX+resourceWidth,bottom:heroY+heroHeight};
            assertOnScreen(heroCard,width,height,'hero HUD panel');
            if(actions)assert(!intersects(heroCard,actions),'hero HUD panel overlaps top action buttons');
            if(controls)assert(!intersects(heroCard,controls),'hero HUD panel overlaps control hints');
            if(range)assert(!intersects(heroCard,range),'hero HUD panel overlaps range controls');
          }
          assert(panelX>=0 && panelY>=0 && panelWidth>0 && panelX+panelWidth<=width+1,'mission/boss HUD panel must fit');
          assert(result.records.length>=8, 'HUD must still render resource and mission labels');
          for (const text of result.records) {
            assertOnScreen(text,width,height,`${mode}/${boss?'boss':'hostiles'}/${god?'god':'normal'}/${state}: ${text.text}`);
            if(actions)assert(!intersects(text,actions),`HUD text overlaps Settings/Sound/Fullscreen: ${text.text} at ${width}x${height}`);
          }
          for(let a=0;a<result.records.length;a++)for(let b=a+1;b<result.records.length;b++) {
            const left=result.records[a],right=result.records[b];
            if(left.text!==right.text)assert(!intersects(left,right),`HUD labels overlap: "${left.text}" / "${right.text}" at ${width}x${height}`);
          }
          const serialized=result.records.map(r=>r.text).join(' ');
          assert(/HEALTH|HP/i.test(serialized),'health must remain readable');
          assert(/FLIGHT|FLY/i.test(serialized),'flight energy must remain readable');
          assert(/SPEED|BOOST|MACH/i.test(serialized),'speed energy must remain readable');
          assert(/NOVA|\[V\]/i.test(serialized),'Nova charges must remain readable');
          assert(/GUARD|\[Q\]/i.test(serialized),'Guard state must remain readable');
          assert.equal(result.pipColors.length,3,'Nova HUD must show exactly three discrete charge pips');
          assert.equal(result.pipColors.filter(color=>color==='#b891f5').length,god?3:state==='empty'?0:state==='partial-nova'?1:3,'Nova pips must represent actual charges / unlimited God Mode');
          assert.equal(/MACH/i.test(serialized),state==='mach','Mach label must only show during active Mach boosting');
          if(state==='beam-charge')assert(/BEAM|CHARG/i.test(serialized),'charging feedback must remain readable');
          if(state==='boss-warning')assert(/ATTACK INCOMING/.test(serialized),'boss windup must have readable combat warning');
          if(state==='boss-defeated')assert(/DEFEATED/.test(serialized),'zero HP boss must show defeated state');
          report.hud.push({mode,boss,width,height,god,state,textCount:result.records.length});
        }
        await captureHud('beam-charge',true);
        await page.evaluate(()=>game.draw());
        if(width===1920 || width===640 || width===480) await page.screenshot({path:path.join(output,`${mode}-${boss?'boss':'hostiles'}-${width}x${height}.png`)});
      }
    }
  }
  assert.deepEqual(errors,[],'browser must stay free of console/runtime errors');
  report.passed=true;
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
  console.log(`Menu/HUD polish checks: PASS (${report.hud.length} state/viewport checks; keyboard, switches, persistence, all modes)`);
} finally {
  await browser.close();
}
