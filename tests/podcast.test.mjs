import test from 'node:test';
import assert from 'node:assert/strict';
import {connectPodcast} from '../src/podcast.js';
test('podcast restores progress, clamps system seeking and removes system handlers on disposal',()=>{
 const player=new EventTarget();Object.assign(player,{duration:100,currentTime:0,playbackRate:1,play:()=>Promise.resolve(),pause:()=>{}});
 let saved='42';const actions={};
 const session={setActionHandler:(action,handler)=>actions[action]=handler,setPositionState:()=>{}};
 const dispose=connectPodcast(player,'episode',{storage:{getItem:()=>saved,setItem:(_,value)=>saved=value},session});
 player.dispatchEvent(new Event('loadedmetadata'));assert.equal(player.currentTime,42);
 actions.seekforward({seekOffset:200});assert.equal(player.currentTime,100);
 actions.seekbackward({seekOffset:200});assert.equal(player.currentTime,0);
 player.currentTime=60;player.dispatchEvent(new Event('pause'));assert.equal(saved,'60');
 dispose();assert.ok(Object.values(actions).every(handler=>handler===null));
});
test('podcast remains usable when browser storage is blocked and system controls unavailable',()=>{
 const player=new EventTarget();Object.assign(player,{duration:100,currentTime:0,playbackRate:1});
 const dispose=connectPodcast(player,'episode',{storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
 assert.doesNotThrow(()=>{player.dispatchEvent(new Event('loadedmetadata'));player.currentTime=10;player.dispatchEvent(new Event('timeupdate'));dispose();});
});
test('closing a podcast before metadata arrives does not overwrite saved progress',()=>{
 const player=new EventTarget();Object.assign(player,{currentTime:0,duration:NaN});let saved='42';
 const dispose=connectPodcast(player,'episode',{storage:{getItem:()=>saved,setItem:(_,value)=>saved=value}});dispose();assert.equal(saved,'42');
});
