// Optional real-browser QA. The game itself remains dependency-free.
// PLAYWRIGHT_MODULE may point at an already-installed Playwright directory.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'artifacts','browser-audit');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const context=await browser.newContext({viewport:{width:1280,height:800}});
const page=await context.newPage(),errors=[],report={stages:[],errors,method:'Real Chrome, local file://, keyboard/mouse input. Enemy/boss positioning is accelerated for repeatable combat and completion checks; damage is delivered through the actual beam input.'};
page.on('pageerror',error=>errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
const url=pathToFileURL(path.join(root,'index.html')).href;
const check=async(expression,message)=>assert(await page.evaluate(expression),message);
async function aimAtTarget(){
  const point=await page.evaluate(()=>{
    const target=window.auditTarget;
    return target&&!target.dead?{x:target.x+target.w/2-game.camera.x,y:target.y+target.h/2-game.camera.y}:null;
  });
  if(!point)return false;
  await page.mouse.move(point.x,point.y);return true;
}
try{
  await page.goto(url);
  assert.equal(await page.evaluate(()=>Object.values(SPRITES).filter(image=>image.src).length),0,'main menu must not eagerly load three stages');
  await page.click('#openSettings');await page.check('#reducedFlashing');await page.selectOption('#effectsQuality','low');await page.click('#resumeGame');
  await page.reload();assert(await page.evaluate(()=>game.settings.reducedFlashing&&game.settings.quality==='low'),'display settings must persist');
  await page.click('#openSettings');await page.selectOption('#effectsQuality','high');await page.click('#resumeGame');
  for(const mode of ['classic','stage2','stage3']){
    await page.evaluate(()=>{game.returnToMainMenu();game.setGodMode(false);});
    await page.click(mode==='classic'?'#classicMode':mode==='stage2'?'#stage2Mode':'#stage3Mode');
    await page.waitForFunction(()=>game.started&&!game.loading);
    await check(()=>game.assetFailures===0,'all critical stage assets should load from file://');
    await page.waitForTimeout(180);
    const startX=await page.evaluate(()=>game.activeHero.x);
    await page.keyboard.down('d');await page.waitForTimeout(350);await page.keyboard.up('d');
    assert(await page.evaluate(()=>game.activeHero.x)>startX+35,'D must move Astra');
    await page.keyboard.press('w');await page.waitForTimeout(130);
    await check(()=>game.activeHero.vy<0,'W must jump');
    await page.keyboard.press('f');await page.waitForFunction(()=>game.activeHero.flying,{},{timeout:1500});
    await page.keyboard.down('s');await page.waitForTimeout(250);await page.keyboard.up('s');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>game.paused);
    const frozenTime=await page.evaluate(()=>game.runStats.time);await page.waitForTimeout(120);
    assert.equal(await page.evaluate(()=>game.runStats.time),frozenTime,'pause must freeze mission time');
    await page.click('#pauseGodMode');await check(()=>game.isGodMode,'pause God Mode switch must work');
    await page.click('#restartGame');await page.waitForTimeout(150);
    await page.keyboard.down('Shift');await page.keyboard.down('w');await page.waitForTimeout(680);
    await check(()=>game.activeHero.flying&&game.activeHero.speedBuild===1,'Power Launch must enter instant Mach flight');
    await page.keyboard.up('w');await page.keyboard.up('Shift');
    await page.evaluate(()=>{game.activeHero.x=1200;game.activeHero.y=500;game.activeHero.vx=0;game.activeHero.vy=0;game.activeHero.speedBuild=0;game.activeHero.sonicBoomTriggered=false;game.activeHero.sonicCooldown=0;});
    await page.keyboard.down('Shift');await page.keyboard.down('d');await page.waitForTimeout(2600);
    await check(()=>game.activeHero.speedBuild>=CFG.sonicThreshold&&game.activeHero.sonicBoomTriggered,'held Shift must build through Mach normally');
    await page.keyboard.up('Shift');await page.keyboard.up('d');
    await page.evaluate(()=>{const hero=game.activeHero;hero.x=120;hero.y=hero.spawnY-400;hero.vx=0;hero.vy=2000;hero.flying=true;hero.speedBuild=1;hero.sonicBoomTriggered=true;});
    await page.keyboard.down('Shift');await page.keyboard.down('s');await page.waitForTimeout(250);
    await check(()=>{const waves=game.isStage3?game.stage3LaunchWaves:game.isStage2?game.stage2LaunchWaves:game.launchWaves;return waves.some(wave=>wave.impact);},'Mach descent must create a landing impact in every stage');
    await page.keyboard.up('s');await page.keyboard.up('Shift');
    await page.evaluate(()=>{game.activeHero.vx=0;game.activeHero.vy=0;});
    await page.mouse.move(1000,430);await page.keyboard.down('Space');await page.waitForTimeout(500);await page.keyboard.up('Space');await page.waitForTimeout(40);
    await check(()=>{const beams=game.isStage3?game.stage3Beams:game.isStage2?game.stage2Beams:game.beams;return beams.some(beam=>beam.super);},'Space release must fire Super Beam');
    const liveTime=await page.evaluate(()=>game.runStats.time);await page.waitForTimeout(120);
    assert(await page.evaluate(()=>game.runStats.time)>liveTime,'Space release must not freeze the loop');
    await page.keyboard.press('v');await page.waitForTimeout(30);
    await check(()=>game.activeHero.ultimateCharges===CFG.ultimateMaxCharges&&game.activeHero.ultimateCd>0,'God Mode Nova must cast without consuming charges');
    // Restart for an actual all-minion beam clear. Positioning is accelerated, AI remains active.
    await page.evaluate(()=>{game.restart();game.intro=0;});
    for(let targetNumber=0;targetNumber<30;targetNumber++){
      const present=await page.evaluate(()=>{
        window.auditTarget=game.activeEnemies.find(enemy=>!enemy.dead);if(!window.auditTarget)return false;
        const target=window.auditTarget,hero=game.activeHero;hero.x=Math.max(25,target.x-260);hero.y=target.y+target.h/2-hero.h/2;hero.vx=0;hero.vy=0;hero.flying=true;
        game.camera.x=clamp(hero.x-280,0,Math.max(0,game.worldConfig.worldW-game.w));game.camera.y=clamp(hero.y-game.h*.48,0,Math.max(0,game.worldConfig.worldH-game.h));return true;
      });
      if(!present)break;
      await aimAtTarget();await page.mouse.down();
      for(let aim=0;aim<16;aim++){if(!await aimAtTarget())break;await page.waitForTimeout(100);}
      await page.mouse.up();
      await check(()=>!window.auditTarget||window.auditTarget.dead,'continuous beam must kill each visible minion');
    }
    await check(()=>game.activeEnemies.length===0,'all hostiles must clear without stuck survivors');
    await page.evaluate(()=>{
      const hero=game.activeHero;hero.x=game.isStage3?5900:game.isStage2?5350:4250;hero.y=game.isStage3?1100:game.isStage2?1000:1050;hero.vx=0;hero.vy=0;hero.flying=true;
    });
    await page.waitForFunction(()=>game.activeEncounter==='boss-fight');
    await page.waitForTimeout(600);await page.screenshot({path:path.join(output,mode+'-boss.png')});
    const attackStates=new Set();
    // Sample opening attacks, then accelerate health to inspect late-phase attack cycles.
    for(let sample=0;sample<18;sample++){attackStates.add(await page.evaluate(()=>game.activeBoss.state));await page.waitForTimeout(180);}
    await page.evaluate(()=>{game.activeBoss.hp=game.activeBoss.maxHp*.25;game.settings.quality='low';game.settings.reducedMotion=true;});
    const expected=mode==='classic'?['slam-windup','slam-impact']:mode==='stage2'?['slam-impact','pulse-windup']:['core-fire','foundry-windup','slam-impact'];
    for(let sample=0;sample<300&&!expected.every(state=>attackStates.has(state));sample++){
      attackStates.add(await page.evaluate(()=>game.activeBoss.state));await page.waitForTimeout(100);
    }
    for(const state of expected)assert(attackStates.has(state),mode+' late-phase boss should reach '+state);
    await page.screenshot({path:path.join(output,mode+'-boss-low-effects.png')});
    await page.evaluate(()=>{game.settings.quality='high';game.settings.reducedMotion=false;});
    await page.evaluate(()=>{window.auditTarget=game.activeBoss;});
    await page.mouse.down();
    for(let aim=0;aim<140;aim++){
      if(await page.evaluate(()=>game.activeBoss.dead))break;
      await page.evaluate(()=>{
        const boss=game.activeBoss,hero=game.activeHero;hero.x=clamp(boss.x-320,game.isStage3?STAGE3.arenaLeft+25:game.isStage2?game.stage2ArenaLeft+25:game.arenaLeft+25,game.worldConfig.worldW-hero.w);
        hero.y=clamp(boss.cy-hero.h/2,100,game.worldConfig.worldH-hero.h-100);hero.vx=0;hero.vy=0;hero.flying=true;
        game.camera.x=clamp(hero.x-200,0,Math.max(0,game.worldConfig.worldW-game.w));game.camera.y=clamp(hero.y-game.h*.5,0,Math.max(0,game.worldConfig.worldH-game.h));
      });
      await aimAtTarget();await page.waitForTimeout(100);
    }
    await page.mouse.up();await page.waitForFunction(()=>game.victory&&game.results,{},{timeout:8000});
    await page.screenshot({path:path.join(output,mode+'-results.png')});
    const results=await page.evaluate(()=>game.results);
    assert(results.kills>0&&results.time>0&&results.hp>0,'results must report the completed run');
    if(mode==='stage3')await page.click('#replayStage');
    else{
      const next=mode==='classic'?'stage2':'stage3';await page.click('#nextStage');
      await page.waitForFunction(expected=>game.mode===expected&&game.started&&!game.loading,next);
      await page.evaluate(previous=>game.startMode(previous),mode);
    }
    await check(()=>!game.victory&&!game.results,'replay or next-stage navigation must clear the old mission');
    for(let restart=0;restart<10;restart++)await page.evaluate(()=>game.restart());
    await check(()=>game.activeEnemies.length===(game.isStage3?12:game.isStage2?10:13),'repeated restarts must not accumulate enemies');
    await page.setViewportSize({width:960,height:640});await page.waitForTimeout(150);await page.keyboard.press('Escape');
    await page.waitForFunction(()=>game.paused);await page.waitForTimeout(300);await page.screenshot({path:path.join(output,mode+'-pause-small.png')});await page.keyboard.press('Escape');
    await page.click('#fullscreen');await page.waitForTimeout(150);await check(()=>Boolean(document.fullscreenElement),'fullscreen must enter');
    await page.click('#fullscreen');await page.setViewportSize({width:1280,height:800});
    const performanceSample=await page.evaluate(()=>{
      game.restart();game.intro=0;const c=game.ctx,draw=c.drawImage,samples=[];let calls=0;
      c.drawImage=function(...args){calls++;return draw.apply(this,args);};
      try{for(let frame=0;frame<100;frame++){const start=performance.now();game.update(1/60);game.draw();samples.push(performance.now()-start);}}
      finally{c.drawImage=draw;}
      samples.sort((a,b)=>a-b);return{samples:100,medianCpuMs:samples[50],p95CpuMs:samples[95],drawImageCallsPerFrame:calls/100,note:'CPU update + Canvas submission, not GPU frame completion or gameplay FPS.'};
    });
    report.stages.push({mode,results,observedBossStates:[...attackStates],restartCount:10,performanceSample});
    console.log('Browser stage PASS:',mode);
  }
  // Asset failure remains playable; this intentionally fails just one image before network I/O.
  const fallback=await context.newPage();
  await fallback.addInitScript(()=>{
    const NativeImage=window.Image;
    window.Image=class extends NativeImage{
      set src(value){if(value.includes('stage3-heliarch-zero')){queueMicrotask(()=>this.dispatchEvent(new Event('error')));return;}super.src=value;}
      get src(){return super.src;}
    };
  });
  await fallback.goto(url);await fallback.click('#stage3Mode');await fallback.waitForFunction(()=>game.started&&!game.loading);
  assert.equal(await fallback.evaluate(()=>game.assetFailures),1,'failed boss art must use a non-blocking fallback');
  await fallback.evaluate(()=>{game.setGodMode(true);game.activeEnemies.length=0;game.activeHero.x=5900;});await fallback.waitForFunction(()=>game.activeBoss!==null);
  await fallback.evaluate(()=>game.draw());await fallback.close();
  const reduced=await browser.newContext({reducedMotion:'reduce'}),reducedPage=await reduced.newPage();
  await reducedPage.goto(url);assert(await reducedPage.evaluate(()=>game.settings.reducedMotion&&game.settings.reducedFlashing&&game.settings.shake===0),'OS reduced motion must provide safe defaults');await reduced.close();
  assert.deepEqual(errors,[],'browser console must remain clear');
  report.passed=true;
}finally{
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));
  await browser.close();
}
console.log('Mastra Vanguard real-browser audit: PASS');
