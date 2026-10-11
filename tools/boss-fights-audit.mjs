// Optional real-Chrome boss mechanics, visual captures and repeatable balance probes.
// Uses the existing Playwright/browser installation, no player dependency.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd(),out=path.join(root,'artifacts','boss-fights-audit');await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const page=await browser.newPage({viewport:{width:1280,height:800}}),errors=[],report={errors,baselines:[],mechanics:[]};
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
try{
  await page.goto(pathToFileURL(path.join(root,'index.html')).href);
  for(const [mode,type] of [['classic','warden'],['stage2','devourer'],['stage3','heliarch']]){
    await page.evaluate(async mode=>{game.returnToMainMenu();await game.requestStartMode(mode);game.paused=true;},mode);
    const data=await page.evaluate(mode=>{
      const originalRandom=Math.random;let seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const rows=[];
      try{for(const strategy of ['click','full-charge','air-hover-charge']){
        seed=12345;game.setGodMode(false);game.restart();game.activeEnemies.length=0;game.paused=false;
        const h=game.activeHero,left=mode==='classic'?3975:mode==='stage2'?4970:STAGE3.arenaLeft,floor=mode==='stage3'?STAGE3.arenaFloor:1450;
        Object.assign(h,{x:left+140,y:floor-h.h-(strategy==='air-hover-charge'?320:0),onGround:strategy!=='air-hover-charge',flying:strategy==='air-hover-charge',vx:0,vy:0});
        if(mode==='classic')game.startBossIntro();else if(mode==='stage2')game.startStage2BossIntro();else game.startStage3BossIntro();
        let ticks=0;const states=new Set();
        for(;ticks<120*60&&!h.dead&&!game.victory;ticks++){
          const b=game.activeBoss,bounds=b.beamHitbox?b.beamHitbox():b;states.add(b.state);game.input.mouse.x=bounds.x+bounds.w/2-game.camera.x;game.input.mouse.y=bounds.y+bounds.h/2-game.camera.y;
          game.input.mouse.down=strategy==='click';
          if(strategy!=='click'){
            if(ticks%156===0){game.input.pressed.add(' ');game.input.keys.add(' ');}
            if(ticks%156===155){game.input.keys.delete(' ');game.input.released.add(' ');}
          }
          if(h.guardCd<=0)game.input.pressed.add('q');game.update(SIM_STEP);
        }
        rows.push({mode,strategy,seconds:Number((ticks/120).toFixed(2)),heroHp:Number(h.hp.toFixed(1)),damageTaken:game.runStats.damage,bossHp:Number(game.activeBoss.hp.toFixed(1)),bossDefeated:game.activeBoss.dead,states:[...states]});
        game.input.clear();game.paused=true;
      }}finally{Math.random=originalRandom;}
      return rows;
    },mode);report.baselines.push(...data);
    assert(data.every(row=>row.states.some(s=>s.includes('windup')||s==='ranged')),'each baseline reaches combat');
    await page.evaluate(async()=>{game.returnToMainMenu();await game.requestStartMode('training');game.paused=true;});
    report.mechanics.push(await page.evaluate(type=>{
      game.setGodMode(false);game.spawnTrainingBoss(type);game.paused=true;game.trainingEnemies.length=0;
      const boss=game.activeBoss,hero=game.activeHero,floor=type==='warden'?1354:type==='devourer'?1450:STAGE3.arenaFloor;
      boss.phase=3;boss.hp=boss.maxHp*.25;boss.x=type==='warden'?4300:type==='devourer'?5600:6300;boss.slamX=boss.x;boss.hoverX=boss.x;
      if(type==='warden'){boss.slamTargetY=floor-boss.h;boss.slamStartY=boss.slamTargetY;boss.setState('slam-drop',0);boss.update(SIM_STEP,game);}else boss.slamImpact(game);
      Object.assign(hero,{x:boss.cx-hero.w/2,y:floor-320-hero.h,hp:100,invuln:0,guardTimer:0,flying:true});
      const wave=game.trainingShockwaves.at(-1),count=game.trainingShockwaves.length;
      for(let i=0;i<120;i++)wave.update(SIM_STEP,game);
      const damage=100-hero.hp;if(count!==1||damage<=0)throw new Error(type+' slam failed airborne damage');
      return{type,count,airborneDamage:damage,radius:wave.maxRadius};
    },type));
    // Capture attack warnings and every authored pose at real game scale.
    await page.evaluate(type=>{
      game.spawnTrainingBoss(type);game.paused=true;game.setGodMode(true);document.getElementById('trainingHud').style.display='none';document.getElementById('controls').style.display='none';const b=game.activeBoss,h=game.activeHero,floor=type==='warden'?1354:type==='devourer'?1450:STAGE3.arenaFloor;
      b.phase=2;b.hp=b.maxHp*.55;b.slamX=b.x;b.hoverX=b.x;b.slamTargetY=floor-b.h;b.slamFloor=floor;b.setState('slam-windup',.7);
      h.x=b.cx-400;h.y=floor-350;h.flying=true;h.invuln=0;game.camera.x=b.cx-720;game.camera.y=floor-720;game.draw();
    },type);
    await page.screenshot({path:path.join(out,type+'-slam-warning.png')});
    const poseStates=type==='warden'?['hover','dash','ranged','slam-impact']:type==='devourer'?['hover','bolts-windup','dash','slam-windup','slam-impact','phase']:['hover','lance-windup','lance-fire','dash','foundry-windup','core-windup','slam-impact'];
    await page.evaluate(({type,states})=>{
      const c=game.ctx,b=game.activeBoss;c.setTransform(1,0,0,1,0,0);c.fillStyle='#102133';c.fillRect(0,0,1280,800);c.font='bold 16px system-ui';c.fillStyle='#e0f6ff';c.fillText(type.toUpperCase()+' / POSE REGISTRATION',30,30);
      states.forEach((state,i)=>{
        const x=60+(i%4)*305,y=90+Math.floor(i/4)*350;b.state=state;b.stateAge=.2;b.stateDuration=1;b.stateTimer=.5;b.phase=1;b.anim=0;b.facing=1;b.vx=state==='dash'?900:0;b.vy=0;b.x=0;b.y=0;b.slamX=0;b.hoverX=0;
        c.save();c.translate(x+142-b.cx*.65,y+80);c.scale(.65,.65);
        if(state==='slam-impact')c.translate(0,-(type==='warden'?1354:type==='devourer'?1450:STAGE3.arenaFloor)+240);
        if(type==='heliarch'&&state==='slam-impact')b.y=STAGE3.arenaFloor-b.h;b.slamTargetY=1354-b.h;b.draw(c);c.restore();c.textAlign='left';c.fillStyle='#e0f6ff';c.fillText(state,x+10,y+305);
      });
    },{type,states:poseStates});
    await page.screenshot({path:path.join(out,type+'-poses.png')});
  }
  // Verify full-volume culling keeps an airborne blast visible when its origin is below the camera.
  await page.evaluate(()=>{
    game.spawnTrainingBoss('heliarch');game.paused=true;game.setGodMode(true);const b=game.activeBoss;b.phase=3;b.slamX=b.x;b.slamImpact(game);game.trainingShockwaves[0].update(.45,game);game.camera.x=b.cx-640;game.camera.y=STAGE3.arenaFloor-880;game.draw();
  });await page.screenshot({path:path.join(out,'airborne-blast.png')});
  assert.deepEqual(errors,[]);report.passed=true;report.note='Scripted stationary strategies with normal health and Guard. These measure pressure and completion; human playtesting decides final difficulty.';
  await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
