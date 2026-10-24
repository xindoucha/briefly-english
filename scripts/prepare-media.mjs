import {spawnSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import {lessons, source} from '../src/data.js';
const input='media-source/first-briefing.webm', root='media/first-briefing';
await mkdir(`${root}/clips`,{recursive:true});
function encode(args) {
  console.log('Encoding',args.at(-1));
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','warning','-y',...args],{stdio:'inherit'});
  if(result.status!==0)throw new Error('Media encoding failed');
}
const video=['-vf','scale=-2:720','-c:v','libx264','-preset','veryfast','-crf','25','-c:a','aac','-b:a','96k','-movflags','+faststart'];
encode(['-i',input,'-vn','-af','loudnorm=I=-18:TP=-1.5:LRA=11','-c:a','libmp3lame','-b:a','96k','-metadata','title=Briefly English · Episode 01','-metadata','artist=The White House',`${root}/full-audio.mp3`]);
encode(['-i',input,...video,`${root}/full-720p.mp4`]);
for(const lesson of lessons) {
  const trim=['-ss',String(lesson.start),'-i',input,'-t',String(lesson.end-lesson.start)];
  encode([...trim,...video,`${root}/clips/${lesson.id}.mp4`]);
  encode([...trim,'-vn','-af','loudnorm=I=-18:TP=-1.5:LRA=11','-c:a','libmp3lame','-b:a','96k',`${root}/clips/${lesson.id}.mp3`]);
}
await writeFile(`${root}/manifest.json`,JSON.stringify({generated:new Date().toISOString(),source:source.commons,clips:lessons.map(({id,start,end})=>({id,start,end}))},null,2));
console.log('Prepared full video, podcast audio and eight learning clips.');
