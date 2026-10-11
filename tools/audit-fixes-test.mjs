// Optional real-Chrome regressions for the October 2026 audit fixes.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'artifacts','audit-fixes');
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const report={focus:[],flashing:null,slowLoad:null,retry:null,sessionGuard:null,errors:[]};
const url=pathToFileURL(path.join(root,'index.html')).href;
async function newPage(){
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  page.on('pageerror',error=>report.errors.push(error.message));
  return page;
}
try{
  const page=await newPage();await page.goto(url);
  await page.click('#mute');assert.equal(await page.evaluate(()=>document.activeElement.id),'mute','main-menu toolbar retains keyboard focus');
  for(const mode of ['classic','stage2','stage3','training']){
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);game.setGodMode(true);Object.assign(game.activeHero,{x:120,y:400,vx:0,vy:0,flying:true});},mode);
    await page.click('#mute');assert.equal(await page.evaluate(()=>document.activeElement.id),'game',mode+': pointer Sound activation restores gameplay focus');
    await page.keyboard.down('d');assert(await page.evaluate(()=>game.input.down('d')),mode+': D registers after Sound');await page.keyboard.up('d');
    await page.locator('#mute').focus();await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'mute',mode+': keyboard toolbar activation retains accessible focus');
    await page.mouse.click(600,400);assert.equal(await page.evaluate(()=>document.activeElement.id),'game',mode+': canvas click restores gameplay focus');
    await page.keyboard.press('f');await page.waitForFunction(()=>!game.activeHero.flying);
    // Test the toolbar's focus flow without native fullscreen changing window state.
    await page.evaluate(()=>{document.documentElement.requestFullscreen=()=>Promise.resolve();});
    await page.click('#fullscreen');assert.equal(await page.evaluate(()=>document.activeElement.id),'game',mode+': Fullscreen pointer activation restores gameplay focus');
    await page.keyboard.press('Escape');await page.waitForFunction(()=>game.paused);await page.click('#resumeGame');
    assert.equal(await page.evaluate(()=>document.activeElement.id),'game',mode+': pause/resume keeps gameplay focus');
    report.focus.push({mode,sound:true,canvas:true,fullscreenHandler:true,keyboardToolbar:true,pause:true});
  }
  const art=await newPage();await art.goto(url);
  report.flashing=await art.evaluate(()=>{
    const context=()=>{
      const values={alphas:[],fills:[]};
      const ctx=new Proxy({globalAlpha:1},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){if(k==='globalAlpha')values.alphas.push(v);if(k==='fillStyle')values.fills.push(v);o[k]=v;return true;}});
      return{ctx,values};
    };
    const rings=[];
    for(const Boss of [PrismWarden,AstralDevourer,HeliarchZero])for(const phase of [2,3]){
      const boss=new Boss(5300,500);boss.phase=phase;boss.state='recover';
      const capture=reduced=>{game.settings.reducedFlashing=reduced;return [0,Math.PI/16,3*Math.PI/16].map(t=>{boss.anim=t;const c=context();boss.draw(c.ctx);return c.values.alphas;});};
      rings.push({boss:Boss.name,phase,reduced:capture(true),normal:capture(false)});
    }
    const fallbacks=[];
    // Assets remain unloaded on this menu page, exercising every missing-art body.
    for(const target of [new Crate(0,0),new GroundEnemy(0,0),new FlyingEnemy(0,0),new CrystalStalker(0,0),new SporeDrone(0,0),new SolarLegionnaire(0,0),new FluxManta(0,0),new ForgeWeaver(0,0,0),new PrismWarden(0,0),new AstralDevourer(0,0),new HeliarchZero(0,0)]){
      const capture=(reduced,flash)=>{game.settings.reducedFlashing=reduced;target.flash=flash;const c=context();target.draw(c.ctx);return c.values.fills;};
      fallbacks.push({type:target.constructor.name,reducedIdle:capture(true,0),reducedHit:capture(true,.04),normalIdle:capture(false,0),normalHit:capture(false,.04)});
    }
    return{rings,fallbacks};
  });
  for(const row of report.flashing.rings){
    assert.deepEqual(row.reduced[0],row.reduced[1],row.boss+': Reduced Flashing freezes decorative alpha');
    assert.deepEqual(row.reduced[0],row.reduced[2],row.boss+': Reduced Flashing stays stable through the pulse');
    assert.notDeepEqual(row.normal[0],row.normal[1],row.boss+': normal decorative pulses remain');
  }
  for(const row of report.flashing.fallbacks){
    assert.deepEqual(row.reducedIdle,row.reducedHit,row.type+': fallback respects Reduced Flashing');
    assert.notDeepEqual(row.normalIdle,row.normalHit,row.type+': normal fallback hit feedback remains');
  }
  report.flashing.loadedManta=await art.evaluate(async()=>{
    await readySprite(SPRITES.stage3Manta);const manta=new FluxManta(0,0);
    const capture=(reduced,flash)=>{game.settings.reducedFlashing=reduced;manta.flash=flash;const alphas=[];
      const ctx=new Proxy({globalAlpha:1},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){if(k==='globalAlpha')alphas.push(v);o[k]=v;return true;}});
      manta.draw(ctx);return alphas;
    };
    return{reducedIdle:capture(true,0),reducedHit:capture(true,.04),normalIdle:capture(false,0),normalHit:capture(false,.04)};
  });
  assert.deepEqual(report.flashing.loadedManta.reducedIdle,report.flashing.loadedManta.reducedHit,'loaded Manta suppresses hit-opacity flashes');
  assert.notDeepEqual(report.flashing.loadedManta.normalIdle,report.flashing.loadedManta.normalHit,'normal Manta hit-opacity feedback remains');
  await art.close();
  const slow=await newPage();
  await slow.addInitScript(()=>{
    const NativeImage=window.Image;
    window.Image=class extends NativeImage{
      set src(value){const delay=value.includes('astra-flight-frames-v2')?9500:value.includes('astra-flight-up')?10500:0;if(delay){this.queuedSrc=value;setTimeout(()=>{super.src=value;},delay);}else super.src=value;}
      get src(){return super.src||this.queuedSrc||'';}
    };
  });
  await slow.goto(url);await slow.click('#classicMode');await slow.waitForFunction(()=>game.started&&!game.loading,{},{timeout:12000});
  assert.equal(await slow.evaluate(()=>game.assetFailures),2,'two slow images enter fallback mode');
  await slow.click('#dismissArtwork');
  await slow.waitForFunction(()=>game.assetFailures===1,{},{timeout:4000});
  assert(await slow.locator('#assetNotice').isHidden(),'partial recovery preserves dismissed warning');
  await slow.waitForFunction(()=>game.assetFailures===0,{},{timeout:4000});
  report.slowLoad=await slow.evaluate(()=>({failures:game.assetFailures,pending:game.failedArtwork.length,noticeHidden:document.getElementById('assetNotice').hidden,flightLoaded:SPRITES.astraFlight.naturalWidth>0,upLoaded:SPRITES.astraFlightUp.naturalWidth>0,retryFlags:[SPRITES.astraFlight.retryLoad,SPRITES.astraFlightUp.retryLoad]}));
  assert(report.slowLoad.flightLoaded&&report.slowLoad.upLoaded&&report.slowLoad.noticeHidden);
  assert.deepEqual(report.slowLoad.retryFlags,[false,false]);
  await slow.close();
  const retry=await newPage();
  await retry.addInitScript(()=>{
    const NativeImage=window.Image;
    window.Image=class extends NativeImage{
      set src(value){if(value.includes('stage2-alien-world')||value.includes('stage2-facades')){this.attempts=(this.attempts||0)+1;this.queuedSrc=value;if(this.attempts===1){queueMicrotask(()=>this.dispatchEvent(new Event('error')));return;}setTimeout(()=>{super.src=value;},40);}else super.src=value;}
      get src(){return super.src||this.queuedSrc||'';}
    };
  });
  await retry.goto(url);await retry.click('#stage2Mode');await retry.waitForFunction(()=>game.started&&!game.loading);
  assert.equal(await retry.evaluate(()=>game.assetFailures),2);
  await retry.evaluate(()=>{window.originalHero=game.activeHero;});await retry.click('#retryArtwork');
  await retry.waitForFunction(()=>!game.artworkRetrying&&game.assetFailures===0);
  report.retry=await retry.evaluate(()=>({failures:game.assetFailures,sameHero:game.activeHero===window.originalHero,noticeHidden:document.getElementById('assetNotice').hidden}));
  assert(report.retry.sameHero&&report.retry.noticeHidden,'manual Retry and automatic recovery coexist without resetting the hero');
  report.sessionGuard=await retry.evaluate(async()=>{
    const image=SPRITES.astraFlight,decode=image.decode;let resolve;
    game.failedArtwork=[image];game.assetFailures=1;image.decode=()=>new Promise(done=>{resolve=done;});
    const pending=game.recoverArtwork(image);
    game.returnToMainMenu();await game.requestStartMode('stage3');
    // The shared image also appears in the new session: an old decode must not edit it.
    game.failedArtwork=[image];game.assetFailures=1;const current=game.failedArtwork;
    resolve();await pending;image.decode=decode;
    const unchanged=game.assetFailures===1&&game.failedArtwork===current;
    await game.recoverArtwork(image);
    return{unchanged,currentSessionRecovered:game.assetFailures===0};
  });
  assert(report.sessionGuard.unchanged&&report.sessionGuard.currentSessionRecovered,'old recovery cannot mutate a new artwork session');
  await retry.close();
  assert.deepEqual(report.errors,[]);report.passed=true;
  console.log('Audit-fix browser regressions: PASS (all-mode focus, flashing/fallbacks, late loads, Retry and stage switches)');
}finally{
  await fs.writeFile(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();
}
