// Real-browser asset registration, geometry/fallback checks and visual captures.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import http from 'node:http';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.join(root,'artifacts','attack-vfx-audit');await fs.mkdir(out,{recursive:true});
// Same-origin HTTP is required for pixel inspection; file:// taints Canvas.
const server=http.createServer(async(req,res)=>{
  try{
    if(req.url==='/favicon.ico'){res.writeHead(204);res.end();return;}
    const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const data=await fs.readFile(filename);res.setHeader('Content-Type',filename.endsWith('.png')?'image/png':filename.endsWith('.mp3')?'audio/mpeg':'text/html');res.end(data);
  }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');
  const result=await page.evaluate(async()=>{
    const checks=[];
    for(const mode of ['classic','stage2','stage3','training']){
      const assets=stageAssets(mode);
      if(!assets.includes(SPRITES.bossSlamEnergy))throw new Error(mode+' omits blast sprites');
      if(assets.includes(SPRITES.heliarchCoreEnergy)!==['stage3','training'].includes(mode))throw new Error(mode+' wrong solar preload scope');
    }
    await game.requestStartMode('training');game.paused=true;
    for(const name of ['bossSlamEnergy','foundryZoneEnergy','heliarchCoreEnergy']){
      const image=SPRITES[name];if(!image.complete||!image.naturalWidth)throw new Error(name+' did not load');
      checks.push({asset:name,width:image.naturalWidth,height:image.naturalHeight});
    }
    // Textures cannot visually extend beyond the circular AOE or laser band.
    const probe=document.createElement('canvas');probe.width=500;probe.height=400;const c=probe.getContext('2d');
    for(const kind of ['slam','foundry']){
      c.clearRect(0,0,500,400);drawAreaAttackVfx(c,kind,kind==='slam'?3:2,250,200,110,1);
      const pixels=c.getImageData(0,0,500,400).data;let visible=0;
      for(let y=0;y<400;y++)for(let x=0;x<500;x++)if(pixels[(y*500+x)*4+3]){visible++;if(Math.hypot(x+.5-250,y+.5-200)>112)throw new Error(kind+' artwork exceeds its radius');}
      if(visible<1000)throw new Error(kind+' artwork empty');
    }
    c.clearRect(0,0,500,400);drawCoreBeamVfx(c,50,200,0,400,26,1);
    const pixels=c.getImageData(0,0,500,400).data;let visible=0;
    for(let y=0;y<400;y++)for(let x=0;x<500;x++)if(pixels[(y*500+x)*4+3]){visible++;if(y<187||y>212||x<50||x>449)throw new Error('laser texture exceeds its damaging band');}
    if(visible<1000)throw new Error('laser artwork empty');
    const drawAttacks=()=>{
      new BossBlast(180,180,1,2).draw(c);
      new FoundryHazard(200,200,100,.72,.62,18,'boss').draw(c);
      const zone=new FoundryHazard(200,200,100,.72,.62,18,'boss');zone.life=.3;zone.draw(c);
      new Stage3Projectile(250,200,500,0,17,'boss-core').draw(c);
      const beam=new HeliarchSweep({dead:false,cx:50,cy:200},0);beam.draw(c);beam.life=.43;beam.draw(c);
      const flash=new Stage3BossEffect(0,250,200,130,.24,{coreFrame:1});flash.age=.05;flash.draw(c);
    };
    for(const reduced of [false,true]){
      game.settings.reducedMotion=reduced;game.settings.reducedFlashing=reduced;game.settings.quality=reduced?'low':'high';drawAttacks();
    }
    // Force missing images only for drawing; native cues must still render.
    const images=[SPRITES.bossSlamEnergy,SPRITES.foundryZoneEnergy,SPRITES.heliarchCoreEnergy];
    for(const image of images)Object.defineProperty(image,'complete',{configurable:true,value:false});
    try{c.clearRect(0,0,500,400);drawAttacks();if(!c.getImageData(0,0,500,400).data.some((v,i)=>i%4===3&&v>0))throw new Error('fallback drawings empty');}
    finally{for(const image of images)delete image.complete;}
    game.settings.reducedMotion=false;game.settings.reducedFlashing=false;game.settings.quality='high';
    return{assets:checks,circleClipping:true,beamClipping:true,reducedSettings:true,fallbacks:true};
  });
  const gallery=async(kind,file)=>{
    await page.evaluate(kind=>{
      for(const id of ['mainMenu','trainingHud','controls','actions'])document.getElementById(id).style.display='none';const c=game.ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle='#102133';c.fillRect(0,0,1280,800);c.textAlign='center';c.font='16px system-ui';c.fillStyle='#d9f5ff';
      if(kind==='slams')for(let stage=1;stage<=3;stage++){
        const x=220+(stage-1)*420;c.save();c.translate(x,240);c.scale(170/bossBlastRadius(stage,1),170/bossBlastRadius(stage,1));drawBossBlastWarning(c,0,0,stage,1,.85);c.restore();const blast=new BossBlast(x,600,stage,1);blast.radius=170;blast.draw(c);c.fillStyle='#d9f5ff';c.fillText(['Prism Warden','Astral Devourer','Heliarch Zero'][stage-1],x,30);
      }
      if(kind==='foundry')for(let i=0;i<4;i++){
        const x=180+(i%2)*640,y=230+Math.floor(i/2)*360,zone=new FoundryHazard(x,y,150,.72,.62,18,'boss');zone.life=[.8,.6,.36,.12][i];zone.draw(c);c.fillStyle='#d9f5ff';c.fillText(['Warning','Ignition','Active','Collapse'][i],x+230,y);
      }
      if(kind==='core'){
        const beam=new HeliarchSweep({dead:false,cx:100,cy:190},0);beam.life=.43;beam.draw(c);
        for(let i=0;i<5;i++)new Stage3Projectile(270+i*160,460,500,0,17,'boss-core').draw(c);
        const flash=new Stage3BossEffect(0,270,660,260,.24,{coreFrame:1});flash.age=.05;flash.draw(c);drawCoreAttackVfx(c,3,920,660,260);
        c.fillStyle='#d9f5ff';c.fillText('Chest beam / core volley / emitter and endpoint flares',640,35);
      }
    },kind);
    await page.screenshot({path:path.join(out,file)});
  };
  await gallery('slams','slam-energy.png');await gallery('foundry','solar-zones.png');await gallery('core','solar-core.png');
  await page.evaluate(()=>{
    game.spawnTrainingBoss('heliarch');game.paused=true;game.setGodMode(true);document.getElementById('trainingHud').style.display='none';document.getElementById('controls').style.display='none';
    const b=game.activeBoss,h=game.activeHero;b.phase=3;b.setState('core-fire',.9);b.fireCoreBolts(game);game.trainingBossEffects.at(-1).age=.05;
    for(const p of game.trainingProjectiles){p.x+=p.vx*.38;p.y+=p.vy*.38;}
    game.trainingHazards.push(new FoundryHazard(b.cx-280,b.cy-140,120,.72,.62,18,'boss'));game.trainingHazards.at(-1).life=.36;
    h.x=b.cx-420;h.y=b.cy-110;game.camera.x=b.cx-820;game.camera.y=b.cy-390;game.draw();
  });await page.screenshot({path:path.join(out,'heliarch-attacks-in-game.png')});
  assert.deepEqual(errors,[]);await fs.writeFile(path.join(out,'report.json'),JSON.stringify({...result,errors,passed:true},null,2));console.log('Attack VFX audit: PASS (assets, clipping, low/reduced settings, missing-image fallbacks, browser captures)');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
