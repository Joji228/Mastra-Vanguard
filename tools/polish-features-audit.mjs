// Optional Chrome QA for the audit fixes. No runtime dependency is added to the game.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.join(root,'artifacts','polish-features-audit');
await fs.mkdir(out,{recursive:true});
// Isolated test browser permits reading local sprite pixels; gameplay never needs this flag.
const browser=await chromium.launch({headless:true,args:['--allow-file-access-from-files'],...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={errors,events:[]};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.click('#trainingMode');await page.waitForFunction(()=>game.started&&!game.loading);
  await page.keyboard.down('ShiftLeft');await page.keyboard.down('ShiftRight');await page.keyboard.up('ShiftLeft');
  assert(await page.evaluate(()=>game.input.down('shift')));await page.keyboard.up('ShiftRight');
  assert(!await page.evaluate(()=>game.input.down('shift')));
  await page.click('#trainingDummy');
  assert(await page.evaluate(()=>game.trainingEnemies.some(e=>e.immovable)));
  await page.check('#trainingHitboxes');assert(await page.evaluate(()=>game.trainingDebug));
  report.damage=await page.evaluate(()=>{
    game.paused=true;game.setGodMode(false);const target=game.trainingEnemies.find(e=>e.immovable),h=game.activeHero;
    game.resetTrainingDamage();Object.assign(h,{x:target.x-180,y:target.y+40,flying:true,vx:0,vy:0});
    for(let i=0;i<240;i++){game.trainingTime=i/120;game.input.mouse.x=target.x+26-game.camera.x;game.input.mouse.y=target.y+42-game.camera.y;h.fireHeatVision(SIM_STEP,game);}
    const result={damage:game.trainingDamage,dps:game.trainingDps(),score:game.score,targetSurvives:!target.dead};
    game.syncTrainingDamage();game.draw();return result;
  });
  assert(Math.abs(report.damage.damage-410)<1);assert(report.damage.dps>185&&report.damage.dps<220);assert.equal(report.damage.score,0);assert(report.damage.targetSurvives);
  await page.screenshot({path:path.join(out,'range-hitboxes.png')});
  await page.click('#trainingResetDamage');assert.equal(await page.evaluate(()=>game.trainingDamage),0);
  await page.click('#trainingReset');assert(!await page.evaluate(()=>game.trainingDebug));assert(!await page.locator('#trainingHitboxes').isChecked());
  for(const mode of ['classic','stage2','stage3']){
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);game.setGodMode(true);game.paused=true;},mode);
    const row=await page.evaluate(mode=>{
      const event=game.bonusEvent,h=game.activeHero,score=game.score;game.activeEnemies.length=0;
      if(mode==='classic'){Object.assign(h,{x:event.x,y:event.y,guardTimer:1});event.update(.4,game);}
      else{Object.assign(h,{x:event.x-180,y:event.y,flying:true});game.input.mouse.x=event.x+27-game.camera.x;game.input.mouse.y=event.y+26-game.camera.y;for(let i=0;i<60&&!event.completed;i++)h.fireHeatVision(SIM_STEP,game);}
      if(event.completed)event.complete(game);return{mode,kind:event.kind,completed:event.completed,bonus:game.score-score,kills:game.runStats.kills,obsoleteLoaded:['astraFrames','astraAim','astraBeam'].some(k=>SPRITES[k].src)};
    },mode);
    assert(row.completed&&row.bonus===300&&row.kills===0&&!row.obsoleteLoaded,JSON.stringify(row));report.events.push(row);
    await page.evaluate(()=>{const kind=game.mode;game.restart();const event=game.bonusEvent;game.activeHero.x=event.x-200;game.activeHero.y=event.y-100;game.camera.x=event.x-650;game.camera.y=event.y-450;game.paused=true;game.intro=0;game.draw();});
    await page.screenshot({path:path.join(out,mode+'-optional-event.png')});
  }
  await page.evaluate(async()=>{game.returnToMainMenu();await game.requestStartMode('training');game.paused=true;});
  report.stalker=await page.evaluate(()=>{
    const frames=SPRITES.stage2Stalker.walkFrames;
    const reference=frames[0].getContext('2d').getImageData(0,0,432,144).data;
    // Canvas clipping can introduce one-byte color rounding without moving any pixel.
    let stable=true;for(const frame of frames){const pixels=frame.getContext('2d').getImageData(0,0,432,144).data;for(let i=0;i<pixels.length;i++)if(Math.abs(pixels[i]-reference[i])>1){stable=false;break;}}
    return{frames:frames.length,torsoStable:stable};
  });
  assert.equal(report.stalker.frames,16);
  await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=800;canvas.style.cssText='position:fixed;inset:0;z-index:100;background:#11283d;';document.body.append(canvas);
    const c=canvas.getContext('2d');c.fillStyle='#11283d';c.fillRect(0,0,1280,800);c.fillStyle='#effaff';c.font='bold 17px system-ui';
    for(let i=0;i<4;i++){c.fillText('STALKER WALK '+i*4,25+i*320,30);c.drawImage(SPRITES.stage2Stalker.walkFrames[i*4],i*320,55,324,240);}
    const h=game.activeHero,cases=[['IDLE',true,0,0],['JUMP',false,-500,.3],['FALL',false,500,-.12],['LAND',true,0,0]];
    for(let i=0;i<cases.length;i++){const [label,ground,vy,fold]=cases[i];h.reset();Object.assign(h,{onGround:ground,vy,airLegFold:fold,landingPose:i===3?.18:0,x:0,y:0,anim:0});c.fillText(label,25+i*320,370);c.save();c.translate(200+i*320,480);c.scale(2,2);h.draw(c,game);c.restore();}
  });
  await page.screenshot({path:path.join(out,'animation-review.png')});
  assert(report.stalker.torsoStable,'walking must not move or crossfade the torso');
  assert.deepEqual(errors,[]);report.passed=true;await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('Audit polish browser checks: PASS');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
