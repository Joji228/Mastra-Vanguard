// Optional v0.10 Chrome checks. Uses an existing Playwright installation only.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.join(root,'artifacts','v0.10');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={normalBossBaselines:[],errors};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.click('#trainingMode');await page.waitForFunction(()=>game.started&&!game.loading);
  await page.click('#trainingCollapse');assert(await page.locator('#trainingBody').isHidden());
  assert.equal(await page.locator('#trainingCollapse').getAttribute('aria-expanded'),'false');
  await page.reload();await page.click('#trainingMode');await page.waitForFunction(()=>game.started&&!game.loading);
  assert(await page.locator('#trainingBody').isHidden(),'minimized range must survive reload');
  await page.click('#trainingCollapse');
  await page.setViewportSize({width:640,height:360});
  await page.locator('#trainingReset').scrollIntoViewIfNeeded();await page.click('#trainingReset');
  assert(await page.evaluate(()=>document.activeElement===game.canvas),'scrolled range controls return focus to gameplay');
  await page.click('#openSettings');await page.locator('#showControls').uncheck();await page.click('#resumeGame');
  assert(await page.locator('#controls').isHidden());
  await page.click('#openSettings');assert.equal(await page.locator('#buildLabel').textContent(),'Version 0.10');
  await page.locator('#showControls').check();await page.click('#resumeGame');
  await page.setViewportSize({width:1280,height:800});
  // Inject a decode failure through the image error listener, without a missing network request.
  await page.evaluate(async()=>{
    game.paused=true;const image=SPRITES.astraAim;image.readyPromise=null;image.retryLoad=true;
    image.auditDecode=image.decode;image.decode=()=>Promise.reject(new Error('controlled decode failure'));
    const pending=readySprite(image);image.dispatchEvent(new Event('error'));await pending;
    game.failedArtwork=[image];game.assetFailures=1;game.syncArtworkNotice();image.decode=image.auditDecode;
    window.retryHero=game.activeHero;game.paused=false;
  });
  assert(await page.locator('#assetNotice').isVisible());await page.click('#retryArtwork');
  await page.waitForFunction(()=>game.assetFailures===0&&!game.artworkRetrying);
  assert(await page.evaluate(()=>game.activeHero===window.retryHero),'retry preserves the hero/mission');
  assert(await page.locator('#assetNotice').isHidden());
  for(const mode of ['classic','stage2','stage3']){
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);game.paused=true;},mode);
    const baselines=await page.evaluate(mode=>{
      const originalRandom=Math.random;let seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const data=[];
      try{for(const strategy of ['click','full-charge']){
        seed=12345;game.setGodMode(false);game.restart();game.activeEnemies.length=0;
        const h=game.activeHero,left=mode==='classic'?3975:mode==='stage2'?4970:STAGE3.arenaLeft,floor=mode==='classic'?1450:mode==='stage2'?1450:STAGE3.arenaFloor;
        Object.assign(h,{x:left+140,y:floor-h.h,onGround:true,vx:0,vy:0});
        if(mode==='classic')game.startBossIntro();else if(mode==='stage2')game.startStage2BossIntro();else game.startStage3BossIntro();
        let ticks=0;const states=new Set();
        for(;ticks<120*45&&!h.dead&&!game.victory;ticks++){
          const b=game.activeBoss;states.add(b.state);game.input.mouse.x=b.cx-game.camera.x;game.input.mouse.y=b.cy-game.camera.y;
          game.input.mouse.down=strategy==='click';
          if(strategy==='full-charge'){
            if(ticks%156===0){game.input.pressed.add(' ');game.input.keys.add(' ');}
            if(ticks%156===155){game.input.keys.delete(' ');game.input.released.add(' ');}
          }
          if(h.guardCd<=0)game.input.pressed.add('q');
          game.update(SIM_STEP);
        }
        data.push({mode,strategy,seconds:ticks/120,heroHp:h.hp,damageTaken:game.runStats.damage,bossHp:game.activeBoss.hp,bossDefeated:game.activeBoss.dead,states:[...states]});
        if(game.isGodMode)throw new Error('normal baseline accidentally enabled God Mode');
        game.paused=true;game.input.clear();
      }}finally{Math.random=originalRandom;}
      return data;
    },mode);
    assert(baselines.every(row=>row.states.some(state=>state.includes('windup')||state==='ranged')),'normal baselines must reach actual boss attacks');
    report.normalBossBaselines.push(...baselines);
  }
  await page.evaluate(async()=>{game.returnToMainMenu();await game.requestStartMode('training');});
  report.stress=await page.evaluate(()=>{
    game.setGodMode(true);game.spawnTrainingBoss('heliarch');
    for(const kind of ['trooper','drone','stalker','spore','legionnaire','manta','weaver'])game.spawnTrainingEnemies(kind,6);
    game.spawnTrainingEnemies('trooper',6);const startingEnemies=game.activeEnemies.length,samples=[];
    game.input.keys.add(' ');game.input.pressed.add(' ');
    for(let i=0;i<120;i++){const start=performance.now();game.update(SIM_STEP);game.update(SIM_STEP);game.draw();samples.push(performance.now()-start);}
    game.paused=true;game.input.clear();samples.sort((a,b)=>a-b);
    return{startingEnemies,remainingEnemies:game.activeEnemies.length,particles:game.particles.length,medianCpuMs:samples[60],p95CpuMs:samples[114],note:'Normal boss baselines are stationary scripted strategies, not a human difficulty playthrough. Stress uses God Mode; timings exclude completed GPU work.'};
  });
  assert.equal(report.stress.startingEnemies,48);assert(report.stress.particles<=520);
  await page.screenshot({path:path.join(out,'crowded-range.png')});
  assert.deepEqual(errors,[]);report.passed=true;
  await fs.writeFile(path.join(out,'release-audit.json'),JSON.stringify(report,null,2));
  console.log('v0.10 release checks: PASS');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
