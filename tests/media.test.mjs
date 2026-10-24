import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRange,server} from '../scripts/serve.mjs';
import {createLocalPlayer} from '../src/local-media.js';
test('media adapter translates original subtitle times and preserves position on audio switch',()=>{
  const handlers={};
  const element={readyState:0,currentTime:0,duration:20,playbackRate:1,addEventListener:(name,fn)=>handlers[name]=fn,pause(){},load(){this.readyState=0;}};
  const player=createLocalPlayer(element,{start:424.61,end:444.61});
  player.currentTime=430;assert.equal(player.currentTime,430);
  element.readyState=1;handlers.loadedmetadata();assert.ok(Math.abs(element.currentTime-5.39)<0.001);
  element.currentTime=8;player.setSource('clip.mp3');element.readyState=1;handlers.loadedmetadata();assert.equal(element.currentTime,8);
});
test('range parser handles open, bounded, suffix and invalid ranges',()=>{
  assert.deepEqual(parseRange('bytes=10-19',100),{start:10,end:19});
  assert.deepEqual(parseRange('bytes=10-',100),{start:10,end:99});
  assert.deepEqual(parseRange('bytes=-10',100),{start:90,end:99});
  for(const input of ['bytes=100-','bytes=20-10','bytes=-0','bytes=-','bytes=0-1,3-4'])assert.equal(parseRange(input,100),null);
});
test('server returns streamed ranges, HEAD and blocks original media',async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const root=`http://127.0.0.1:${server.address().port}`;
  try{
    const range=await fetch(root+'/index.html',{headers:{Range:'bytes=0-9'}});
    assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,10);
    const head=await fetch(root+'/index.html',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');
    assert.equal((await fetch(root+'/media-source/first-briefing.webm')).status,404);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
