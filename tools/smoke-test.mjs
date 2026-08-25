import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script,'index.html must contain a game script');

for(const match of html.matchAll(/loadSprite\('([^']+)'/g))assert(fs.existsSync(path.join(root,match[1])),`missing sprite: ${match[1]}`);
assert(fs.existsSync(path.join(root,'Background OST.mp3')),'missing background OST');

class MockElement {
  constructor(id=''){this.id=id;this.value='0';this.textContent='';this.inert=false;this.attributes=new Map();this.classList={toggle(){},add(){},remove(){}};}
  addEventListener(){} setAttribute(k,v){this.attributes.set(k,String(v));} closest(){return null;} contains(){return false;} focus(){} requestFullscreen(){document.fullscreenElement=this;}
}

let saveCalls=0;
const gradient={addColorStop(){}};
const context2d=new Proxy({
  setTransform(){},createLinearGradient(){return gradient;},save(){saveCalls++;},restore(){},measureText(){return{width:0}}
},{get(target,key){if(key in target)return target[key];return()=>{};},set(target,key,value){target[key]=value;return true;}});
const elements=new Map();
const canvas=new MockElement('game');canvas.width=0;canvas.height=0;canvas.style={};canvas.getContext=()=>context2d;canvas.getBoundingClientRect=()=>({left:0,top:0});
elements.set('game',canvas);
const element=id=>{if(!elements.has(id))elements.set(id,new MockElement(id));return elements.get(id);};

const storage=new Map();
const document={
  activeElement:null,hidden:false,fullscreenElement:null,documentElement:new MockElement('documentElement'),
  getElementById:element,addEventListener(){},exitFullscreen(){this.fullscreenElement=null;}
};
const localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value))};
class MockImage {constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;this.listeners=new Map();this._src='';}addEventListener(type,fn){this.listeners.set(type,fn);}set src(value){this._src=value;}get src(){return this._src;}}
class MockAudio {constructor(src){this.src=src;this.loop=false;this.preload='';this.volume=1;this.muted=false;this.paused=true;}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}}
class MockAudioContext {
  constructor(){this.currentTime=0;this.state='running';this.destination={};}
  resume(){this.state='running';return Promise.resolve();}
  createGain(){return{gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},disconnect(){}};}
  createOscillator(){return{type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},disconnect(){},start(){},stop(){},addEventListener(){}};}
}

const sandbox={
  console,Math,JSON,Number,Boolean,Set,Map,Object,Array,String,Date,Error,Promise,
  innerWidth:1280,innerHeight:720,devicePixelRatio:1,performance:{now:()=>1000},
  document,localStorage,Image:MockImage,Audio:MockAudio,AudioContext:MockAudioContext,webkitAudioContext:MockAudioContext,
  Element:MockElement,addEventListener(){},requestAnimationFrame(){},setTimeout,clearTimeout
};
sandbox.window=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(`${script}\n;globalThis.__test={CFG,AudioFX,PrismWarden,Player,GroundEnemy,game};`,sandbox,{filename:'index.html'});

const {CFG,AudioFX,PrismWarden,GroundEnemy,game}=sandbox.__test;
game.audio.muted=true;

assert.equal(CFG.ultimateMaxCharges,3);
assert.equal(CFG.ultimateRadius,440);

game.mode='classic';game.started=true;game.reset();game.audio.muted=true;
game.input.keys.add(' ');game.input.pressed.add(' ');
game.player.updateBeamCharge(.4,game);
game.input.pressed.clear();game.input.keys.delete(' ');game.input.released.add(' ');
game.player.updateBeamCharge(.016,game);
assert.equal(game.player.chargingBeam,false,'releasing Space must end beam charging');
assert.equal(game.beams.length,1,'releasing a charged Space must fire one super beam');

const boss=new PrismWarden(4360,800);boss.phase=2;boss.hp=1000;boss.attackSerial=0;game.player.x=4720;
boss.chooseAttack(game);assert.equal(boss.state,'slam-windup');assert(boss.slamLiftY<=boss.slamTargetY,'slam windup must remain above its landing point');
game.encounterState='boss-fight';boss.stateTimer=0;boss.update(.016,game);assert.equal(boss.state,'slam-drop');assert(boss.slamTargetY>=boss.slamStartY,'slam drop must never interpolate upward');

game.projectiles.push({});game.shockwaves.push({});boss.kill(game);
assert.equal(game.projectiles.length,0,'boss death must clear projectiles');
assert.equal(game.shockwaves.length,0,'boss death must clear shockwaves');

game.reset();const fallen=new GroundEnemy(100,CFG.worldH+100);fallen.update(.016,game);assert.equal(fallen.dead,true,'fallen enemies must not block stage progression');

game.mode='god';game.reset();game.player.y=CFG.worldH+100;game.player.update(.016,game);
assert.equal(game.player.y,game.player.spawnY,'God Mode must recover from the void');
game.player.flying=true;game.player.y=-80;game.player.vy=-300;game.player.update(.016,game);
assert.equal(game.player.y,20,'player must remain inside the top world boundary');

game.player.dead=true;game.player.invuln=1;game.player.deathAt=sandbox.performance.now();saveCalls=0;game.player.draw(context2d,game);
assert(saveCalls>0,'death animation must render even while invulnerability is active');

game.mode='classic';game.reset();game.started=true;game.player.dead=true;game.input.pressed.add('escape');game.update(.016);
assert.equal(game.paused,true,'Escape must open the menu after death');
game.input.keys.add('shift');game.projectiles.push({});game.restart();
assert.equal(game.input.keys.size,0,'restart must clear held input');assert.equal(game.projectiles.length,0,'restart must clear active attacks');assert.equal(game.player.dead,false);

game.particles.length=0;game.burst(0,0,'#fff',Number.MAX_SAFE_INTEGER,100);assert.equal(game.particles.length,520,'particle count must be capped');

game.audio.setMusicVolume(.23);game.audio.setSfxVolume(.41);game.audio.setMuted(true);
const restoredAudio=new AudioFX();assert.equal(restoredAudio.musicVolume,.23);assert.equal(restoredAudio.sfxVolume,.41);assert.equal(restoredAudio.muted,true);

console.log('Mastra Vanguard smoke tests: PASS');
