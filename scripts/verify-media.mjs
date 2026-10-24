import {spawnSync} from 'node:child_process';
import {stat} from 'node:fs/promises';
import {lessons,courses} from '../src/data.js';
const root='media/first-briefing';
function probe(path) {
 const result=spawnSync('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height','-of','json',path],{encoding:'utf8'});
 if(result.status!==0)throw new Error(`Cannot probe ${path}: ${result.stderr}`);
 return JSON.parse(result.stdout);
}
for(const item of [{id:'full',start:0,end:courses[0].durationSeconds},...lessons]){
 for(const audio of [false,true]){
  const path=item.id==='full'?`${root}/${audio?'full-audio.mp3':'full-720p.mp4'}`:`${root}/clips/${item.id}.${audio?'mp3':'mp4'}`;
  const info=probe(path),duration=Number(info.format.duration);
  if(Math.abs(duration-(item.end-item.start))>0.2)throw new Error(`Duration mismatch: ${path} (${duration})`);
  if(!info.streams.some(stream=>stream.codec_type==='audio'&&stream.codec_name===(audio?'mp3':'aac')))throw new Error(`Audio codec mismatch: ${path}`);
  if(audio&&info.streams.some(stream=>stream.codec_type==='video'))throw new Error(`Unexpected video: ${path}`);
  if(!audio&&!info.streams.some(stream=>stream.codec_name==='h264'&&stream.height===720))throw new Error(`Video codec mismatch: ${path}`);
  console.log(`${path}: ${duration.toFixed(2)} s, ${((await stat(path)).size/1024/1024).toFixed(2)} MB`);
 }
}
console.log('Verified all 18 media files.');
