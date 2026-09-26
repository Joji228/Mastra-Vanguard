// Optional real-browser regressions for flight presentation and windowed HUD.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.join(root,'artifacts','flight-hud-audit');
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const page=await browser.newPage({viewport:{width:960,height:540}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.click('#trainingMode');
  await page.waitForFunction(()=>game.started&&!game.loading);
  await page.evaluate(()=>{game.setGodMode(true);Object.assign(game.activeHero,{x:4000,y:3000,flying:true,onGround:false,vx:0,vy:0});});
  await page.keyboard.down('w');await page.keyboard.down('d');await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>game.activeHero.flightPoseForRender()),'side','W+D must use sideways flight');
  await page.keyboard.up('d');await page.waitForFunction(()=>game.activeHero.flightPoseForRender()==='up',null,{timeout:3000});
  assert.equal(await page.evaluate(()=>game.activeHero.flightPoseForRender()),'up','W alone settles into upward flight');
  await page.keyboard.up('w');await page.keyboard.down('s');await page.keyboard.down('a');await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>game.activeHero.flightPoseForRender()),'side','S+A must use sideways flight');
  await page.keyboard.up('a');await page.waitForFunction(()=>game.activeHero.flightPoseForRender()==='down',null,{timeout:3000});
  assert.equal(await page.evaluate(()=>game.activeHero.flightPoseForRender()),'down','S alone settles into downward flight');
  await page.keyboard.up('s');
  await page.evaluate(()=>{game.paused=true;game.intro=0;});
  for(const [width,height] of [[1366,650],[960,540],[800,450],[640,360],[480,300]]){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(80);
    const result=await page.evaluate(()=>{
      game.resize();game.setGodMode(true);
      const hero=game.activeHero;hero.chargingBeam=true;hero.beamCharge=.8;game.draw();
      const rect=id=>{const r=document.querySelector(id).getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom};};
      const layout=game.hudLayout();
      return{actions:rect('#actions'),controls:rect('#controls'),range:rect('#trainingHud'),layout,w:game.w,h:game.h};
    });
    for(const key of ['actions','controls','range']){
      const box=result[key];assert(box.x>=0&&box.y>=0&&box.right<=width+1&&box.bottom<=height+1,key+' must fit '+width+'x'+height);
    }
    assert(result.controls.right<=result.range.x,'controls must not sit behind range panel');
    assert(result.layout.panelX+result.layout.panelWidth<=width,'canvas mission HUD must fit');
    await page.screenshot({path:path.join(out,'hud-'+width+'x'+height+'.png')});
  }
  for(const mode of ['classic','stage2','stage3']){
    await page.setViewportSize({width:800,height:450});
    await page.evaluate(mode=>game.requestStartMode(mode),mode);
    await page.waitForFunction(()=>game.started&&!game.loading);
    await page.evaluate(()=>{game.paused=true;game.intro=0;game.activeHero.chargingBeam=true;game.activeHero.beamCharge=.8;if(game.isStage3)game.startStage3BossIntro();else if(game.isStage2)game.startStage2BossIntro();else game.startBossIntro();game.draw();});
    await page.screenshot({path:path.join(out,mode+'-windowed-boss.png')});
  }
  await page.setViewportSize({width:1200,height:800});
  await page.evaluate(()=>{
    game.resize();game.draw=()=>{};const c=game.ctx,h=game.activeHero;
    document.querySelector('#trainingHud').hidden=true;document.querySelector('#controls').style.display='none';document.querySelector('#actions').style.display='none';
    c.fillStyle='#13243a';c.fillRect(0,0,game.w,game.h);
    const cases=[
      ['COAST',600,0,0,false],['FIRE FORWARD',600,0,0,true],
      ['AIM UP',600,0,-Math.PI/2,true],['AIM BEHIND',600,0,Math.PI,true],
      ['DIAGONAL UP',500,-600,-.6,true],['STRAIGHT UP',0,-600,-Math.PI/2,true],
      ['DIAGONAL DOWN',500,600,.6,true],['STRAIGHT DOWN',0,600,Math.PI/2,true]
    ];
    for(let i=0;i<cases.length;i++){
      const [label,vx,vy,aim,shoot]=cases[i],x=150+(i%4)*300,y=170+Math.floor(i/4)*340;
      h.reset();Object.assign(h,{x:x-16,y:y-25,flying:true,onGround:false,vx,vy,aimAngle:aim,shootAnim:shoot?.2:0,anim:0,flightCapePhase:0});
      h.updateFlightPose(1/60,vx?1:0);h.draw(c,game);
      if(shoot){const o=h.beamOrigin();c.strokeStyle='#ff96d8';c.lineWidth=3;c.beginPath();c.moveTo(o.x,o.y);c.lineTo(o.x+Math.cos(aim)*100,o.y+Math.sin(aim)*100);c.stroke();}
      c.fillStyle='#ffffff';c.font='bold 14px system-ui';c.textAlign='center';c.fillText(label,x,y+80);
    }
  });
  await page.screenshot({path:path.join(out,'flight-poses.png')});
  assert.deepEqual(errors,[]);
  console.log('Flight/HUD browser checks: PASS; screenshots in '+out);
}finally{await browser.close();}

