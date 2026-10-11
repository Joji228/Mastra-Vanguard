// Optional documentation capture. Requires an existing Playwright installation only.
// Uses the real game renderer; camera/actor placement is staged for readable stills.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output=path.join(root, 'docs', 'media');
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
await fs.mkdir(output, {recursive:true});
const browser=await chromium.launch({headless:true, ...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440, height:900}, deviceScaleFactor:1});
const errors=[];
page.on('pageerror', e=>errors.push(e.message));
page.on('console', m=>{if(m.type()==='error')errors.push(m.text());});

try {
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href);
  // Disable incidental shake, not UI or effects. No runtime source is changed.
  await page.evaluate(()=>{game.settings.shake=0;game.settings.quality='high';game.audio.muted=true;});
  for(const mode of ['classic', 'stage2', 'stage3', 'training']) {
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);}, mode);
    await page.waitForFunction(()=>game.started&&!game.loading);
    await page.waitForFunction(()=>getComputedStyle(document.getElementById('mainMenu')).visibility==='hidden');
    assert.equal(await page.evaluate(()=>game.assetFailures), 0, `${mode} artwork must load`);
    await page.evaluate(mode=>{
      game.paused=true;game.intro=0;game.shake=0;
      const h=game.activeHero;
      if(mode==='classic') {
        Object.assign(game.camera,{x:0,y:520});
        Object.assign(h,{x:340,y:1000,flying:true,vx:420,vy:-60,facing:1});
        const target=game.enemies[2];
        game.input.mouse.x=target.x+target.w/2;
        game.input.mouse.y=target.y+target.h/2-game.camera.y;
        h.fireHeatVision(SIM_STEP,game);
      } else if(mode==='stage2') {
        game.stage2Enemies.length=0;game.startStage2BossIntro();
        game.stage2Encounter='boss-fight';game.stage2BossEffects.length=0;
        Object.assign(game.stage2Boss,{x:5870,y:910,vx:0,vy:0});game.stage2Boss.setState('recover',.55);
        Object.assign(game.camera,{x:4960,y:650});
        Object.assign(h,{x:5460,y:980,flying:true,vx:0,vy:0,facing:1,guardTimer:.7});
      } else if(mode==='stage3') {
        game.stage3Enemies.length=0;game.startStage3BossIntro();
        game.stage3Encounter='boss-fight';game.stage3BossEffects.length=0;
        Object.assign(game.stage3Boss,{x:6530,y:1050,vx:0,vy:0});game.stage3Boss.setState('recover',.55);
        Object.assign(game.camera,{x:5760,y:720});
        Object.assign(h,{x:6000,y:1110,flying:true,vx:420,vy:0,facing:1});
        game.input.mouse.x=game.stage3Boss.cx-game.camera.x;
        game.input.mouse.y=game.stage3Boss.cy-game.camera.y;
        h.fireHeatVision(SIM_STEP,game);
        game.stage3Boss.flash=0; // Capture between damage flashes so the actual armor is legible.
      } else {
        game.settings.rangeCollapsed=false;
        Object.assign(game.camera,{x:400,y:820});
        Object.assign(h,{x:850,y:1600-CFG.playerH,onGround:true,flying:false,vx:0,vy:0,facing:1});
        game.spawnTrainingEnemies('dummy',1);game.spawnTrainingEnemies('stalker',1);game.trainingDebug=true;
        document.getElementById('trainingHitboxes').checked=true;
        game.syncTrainingDamage();
      }
      h.updateFlightPose(1);h.simX=undefined;h.simY=undefined;
      game.camera.simX=undefined;game.camera.simY=undefined;game.shake=0;game.draw();
    },mode);
    await page.waitForTimeout(550); // Menu fade completes before a full-viewport capture.
    await page.evaluate(()=>game.draw());
    await page.screenshot({path:path.join(output, `${mode==='classic'?'stage1':mode}.jpg`),type:'jpeg',quality:86});
    console.log(`Captured ${mode}`);
  }
  const coverIndex=process.argv.indexOf('--cover');
  if(coverIndex>=0) {
    const source=process.argv[coverIndex+1];assert(source,'--cover requires a source path');
    const data=await fs.readFile(source);
    const encoded=await page.evaluate(async src=>{
      const image=new Image();image.src=src;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=Math.round(image.naturalHeight*1600/image.naturalWidth);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      return canvas.toDataURL('image/jpeg',.9).split(',')[1];
    },`data:image/png;base64,${data.toString('base64')}`);
    await fs.writeFile(path.join(output,'mastra-vanguard-cover.jpg'),Buffer.from(encoded,'base64'));
  }
  assert.deepEqual(errors,[], 'Presentation capture must not conceal browser errors');
  console.log('Presentation capture: PASS (four modes, no browser errors)');
} finally { await browser.close(); }
