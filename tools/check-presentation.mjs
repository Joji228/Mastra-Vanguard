// Dependency-free checks for the README showcase and its local documentation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const documents=['README.md','docs/DEVELOPMENT.md','docs/PRESENTATION.md','docs/PLAYING.md'];
let links=0;
for(const file of documents) {
  const source=fs.readFileSync(path.join(root,file),'utf8');
  assert.equal((source.match(/<details>/g)||[]).length,(source.match(/<\/details>/g)||[]).length,`${file}: unbalanced expandable sections`);
  assert.equal((source.match(/^```/gm)||[]).length%2,0,`${file}: unbalanced code fences`);
  const targets=[...source.matchAll(/\]\(([^)\s]+)\)/g),...source.matchAll(/(?:href|src)="([^"]+)"/g)];
  for(const [,target] of targets) {
    if(/^(?:https?:|#)/.test(target))continue;
    const resolved=path.resolve(path.dirname(path.join(root,file)),decodeURIComponent(target.split('#')[0]));
    assert(!path.relative(root,resolved).startsWith('..'),`${file}: link escapes repository`);
    assert(fs.existsSync(resolved),`${file}: missing ${target}`);links++;
  }
}
const readme=fs.readFileSync(path.join(root,'README.md'),'utf8');
const version=fs.readFileSync(path.join(root,'index.html'),'utf8').match(/const VERSION='([^']+)'/)[1];
assert(readme.includes(`Current version: ${version}`),'README version must match game');
assert(readme.includes('https://joji228.github.io/Mastra-Vanguard/'),'README must link to existing play URL');
assert(readme.includes('actions/workflows/smoke.yml/badge.svg'),'CI badge must target the real workflow');
assert(fs.existsSync(path.join(root,'.github/workflows/smoke.yml')),'Missing workflow for CI badge');
assert(!readme.includes('Jump in'),'Keep the play call-to-action concise');
assert(readme.includes('alt="Play Mastra Vanguard online"'),'Play button must have accessible link text');
const button=fs.readFileSync(path.join(root,'docs/media/play-online.svg'),'utf8');
assert(button.includes('PLAY ONLINE')&&button.includes('width="240" height="52"'),'Play button must retain its label and dimensions');
assert(!/<script|<foreignObject|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(button),'Play button must remain self-contained');

function jpegSize(bytes) {
  assert.equal(bytes.readUInt16BE(0),0xffd8,'Expected a JPEG');
  for(let i=2;i<bytes.length;) {
    assert.equal(bytes[i++],0xff,'Malformed JPEG marker');
    while(bytes[i]===0xff)i++;
    const marker=bytes[i++];
    if(marker===0xd9||marker===0xda)break;
    if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
    const length=bytes.readUInt16BE(i);assert(length>=2&&i+length<=bytes.length,'Malformed JPEG segment');
    if([0xc0,0xc1,0xc2].includes(marker))return {width:bytes.readUInt16BE(i+5),height:bytes.readUInt16BE(i+3)};
    i+=length;
  }
  throw new Error('JPEG frame dimensions missing');
}
let total=0;
for(const name of ['mastra-vanguard-cover','stage1','stage2','stage3','training']) {
  const bytes=fs.readFileSync(path.join(root,'docs/media',name+'.jpg'));
  const {width,height}=jpegSize(bytes);total+=bytes.length;
  assert(bytes.length<450000,`${name}: keep README images lightweight`);
  assert.equal(width,name==='mastra-vanguard-cover'?1600:1440,`${name}: unexpected width`);
  assert.equal(height,name==='mastra-vanguard-cover'?640:900,`${name}: unexpected height`);
  assert(readme.includes(`docs/media/${name}.jpg`),`${name}: unused README asset`);
}
assert(total<1500000,'Presentation media should stay below 1.5 MB');
console.log(`Presentation checks: PASS (${links} local links, version ${version}, five JPEGs / ${(total/1000000).toFixed(2)} MB)`);
