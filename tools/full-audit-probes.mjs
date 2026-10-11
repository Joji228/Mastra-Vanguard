// Read-only diagnostic probes. Findings are recorded, not treated as passing regressions.
// Uses the same optional, existing Playwright installation as the other browser audits.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=path.join(root,'artifacts','full-audit-2026-10-11');
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const page=await browser.newPage({viewport:{width:1280,height:800}});
const report={date:'2026-10-11',errors:[],focus:[],bossPositions:[],assets:[]};
page.on('pageerror',e=>report.errors.push(e.message));
try{
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  await page.click('#classicMode');await page.waitForFunction(()=>game.started&&!game.loading);
  await page.evaluate(()=>{game.setGodMode(true);game.activeHero.x=120;game.activeHero.y=700;game.activeHero.flying=true;game.activeHero.vx=0;game.activeHero.vy=0;});
  const testMovement=async label=>{
    await page.evaluate(()=>{game.activeHero.vx=0;game.activeHero.vy=0;});
    const before=await page.evaluate(()=>({x:game.activeHero.x,focus:document.activeElement.id,paused:game.paused}));
    await page.keyboard.down('d');const accepted=await page.evaluate(()=>game.input.down('d'));await page.waitForTimeout(250);await page.keyboard.up('d');
    const after=await page.evaluate(()=>({x:game.activeHero.x,focus:document.activeElement.id,paused:game.paused}));
    report.focus.push({label,before,after,keyAccepted:accepted,deltaX:after.x-before.x});
  };
  await testMovement('before clicking Sound');
  await page.click('#mute');await testMovement('after clicking Sound');
  await page.mouse.click(600,400);await testMovement('after clicking game canvas');
  await page.keyboard.press('Escape');await page.click('#resumeGame');await testMovement('after pause/resume');
  // Inventory compressed delivery bytes and nominal decoded RGBA storage.
  const html=await fs.readFile(path.join(root,'index.html'),'utf8');
  for(const match of html.matchAll(/loadSprite\('([^']+)'/g)){
    const png=await fs.readFile(path.join(root,match[1]));
    const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
    report.assets.push({file:match[1],bytes:png.length,width,height,rgbaBytes:width*height*4});
  }
  for(const mode of ['classic','stage2','stage3','training']){
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);game.paused=true;},mode);
    report[mode+'Memory']=await page.evaluate(()=>({
      required:stageAssets(game.mode).map(i=>i.pendingSrc),
      loadedImages:Object.values(SPRITES).filter(i=>i.naturalWidth).map(i=>i.pendingSrc),
      tintBytes:Object.values(SPRITES).reduce((n,i)=>n+[...(i.tints?.values()||[])].reduce((a,c)=>a+c.width*c.height*4,0),0)
    }));
    if(mode==='training')continue;
    const results=await page.evaluate(mode=>{
      const originalRandom=Math.random,rows=[];
      try{for(const seedStart of [12345,42,2026])for(const position of ['ground','high-hover','right-hover']){
        let seed=seedStart;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
        game.setGodMode(false);game.restart();game.activeEnemies.length=0;
        const h=game.activeHero,left=mode==='classic'?3975:mode==='stage2'?4970:STAGE3.arenaLeft,floor=mode==='stage3'?1560:1450;
        Object.assign(h,{x:position==='right-hover'?game.worldConfig.worldW-h.w-20:left+140,y:position==='ground'?floor-h.h:20,onGround:position==='ground',flying:position!=='ground',vx:0,vy:0});
        if(mode==='classic')game.startBossIntro();else if(mode==='stage2')game.startStage2BossIntro();else game.startStage3BossIntro();
        game.paused=false;let ticks=0;
        for(;ticks<120*45&&!h.dead&&!game.victory;ticks++){
          const b=game.activeBoss,bounds=b.beamHitbox?b.beamHitbox():b;
          game.input.mouse.x=bounds.x+bounds.w/2-game.camera.x;game.input.mouse.y=bounds.y+bounds.h/2-game.camera.y;
          if(position!=='ground'&&h.flying)game.input.keys.add('w');else game.input.keys.delete('w');
          if(ticks%156===0){game.input.pressed.add(' ');game.input.keys.add(' ');}
          if(ticks%156===155){game.input.keys.delete(' ');game.input.released.add(' ');}
          if(h.guardCd<=0)game.input.pressed.add('q');
          game.update(SIM_STEP);
        }
        rows.push({mode,seed:seedStart,position,seconds:ticks/120,damageTaken:game.runStats.damage,heroHp:h.hp,bossHp:game.activeBoss.hp,bossDefeated:game.activeBoss.dead,godMode:game.isGodMode});
        game.paused=true;game.input.clear();
      }}finally{Math.random=originalRandom;}
      return rows;
    },mode);
    report.bossPositions.push(...results);
  }
  // Capture alpha assigned to boss phase rings while Reduced Flashing is on.
  report.reducedFlashing=await page.evaluate(()=>{
    game.settings.reducedFlashing=true;game.settings.reducedMotion=true;
    const rows=[];
    for(const Boss of [AstralDevourer,HeliarchZero]){
      const b=new Boss(5300,500);b.phase=2;b.state='recover';
      const alpha=[];const ctx=new Proxy({save(){},restore(){},drawImage(){},beginPath(){},arc(){},stroke(){},ellipse(){},fill(){},translate(){},rotate(){},scale(){},fillRect(){},moveTo(){},arcTo(){},closePath(){}},{
        get(o,k){return k in o?o[k]:()=>{};},
        set(o,k,v){if(k==='globalAlpha')alpha.push(v);o[k]=v;return true;}
      });
      for(const t of [0,Math.PI/16,3*Math.PI/16]){b.anim=t;b.draw(ctx);}
      rows.push({boss:Boss.name,assignedAlphas:alpha});
    }
    return rows;
  });
  report.fallbackFlash=await page.evaluate(()=>{
    game.settings.reducedFlashing=true;const b=new PrismWarden(4400,800),rows=[];
    const styles=[];const ctx=new Proxy({},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){if(k==='fillStyle')styles.push(v);o[k]=v;return true;}});
    for(const flash of [0,.04]){b.flash=flash;styles.length=0;b.drawFallback(ctx);rows.push({flash,fillStyles:[...styles]});}
    return rows;
  });
  // Simulate one successful image arriving after the loader's eight-second deadline.
  const slow=await browser.newPage();
  await slow.addInitScript(()=>{
    const NativeImage=window.Image;
    window.Image=class extends NativeImage{
      set src(value){if(value.includes('astra-flight-frames-v2')){this.queuedSrc=value;setTimeout(()=>{super.src=value;},9500);}else super.src=value;}
      get src(){return super.src||this.queuedSrc||'';}
    };
  });
  await slow.goto(pathToFileURL(path.join(root,'index.html')).href);
  const loadStart=Date.now();await slow.click('#classicMode');await slow.waitForFunction(()=>game.started&&!game.loading,{},{timeout:12000});
  const atStart=await slow.evaluate(()=>({failures:game.assetFailures,imageLoaded:SPRITES.astraFlight.naturalWidth>0,noticeVisible:!document.getElementById('assetNotice').hidden}));
  const elapsedMs=Date.now()-loadStart;
  await slow.waitForFunction(()=>SPRITES.astraFlight.naturalWidth>0,{},{timeout:4000});
  const afterArrival=await slow.evaluate(()=>({failures:game.assetFailures,imageLoaded:SPRITES.astraFlight.naturalWidth>0,noticeVisible:!document.getElementById('assetNotice').hidden}));
  report.slowLoad={method:'One Image.src assignment delayed 9.5s; local file, successful decode',elapsedMs,atStart,afterArrival};
  await slow.close();
  await page.evaluate(async()=>{game.returnToMainMenu();await game.requestStartMode('stage2');game.paused=true;game.startStage2BossIntro();game.stage2Encounter='boss-fight';game.activeBoss.phase=2;game.activeBoss.state='recover';game.activeHero.flying=true;game.activeHero.x=5100;game.activeHero.y=500;game.draw();});
  await page.screenshot({path:path.join(out,'stage2-review.png')});
  await fs.writeFile(path.join(out,'probes.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({focus:report.focus,bossPositions:report.bossPositions,reducedFlashing:report.reducedFlashing,fallbackFlash:report.fallbackFlash,slowLoad:report.slowLoad,errors:report.errors},null,2));
}finally{await browser.close();}
