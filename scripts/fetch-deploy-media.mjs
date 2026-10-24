import {mkdtemp,mkdir,rm,stat,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {lessons} from '../src/data.js';
const url='https://github.com/xindoucha/briefly-english/releases/download/media-v1/first-briefing-media-v1.tar';
const expected='461355159c730f9577017d11b9e0d56849efe546e898f17ff793b92d7a03972b';
const temporary=await mkdtemp(join(tmpdir(),'briefly-deploy-media-'));
try {
 const archive=join(temporary,'media.tar');
 const download=spawnSync('curl',['--fail','--location','--show-error','--retry','3','--connect-timeout','30','--max-time','600','--output',archive,url],{stdio:'inherit'});
 if(download.status!==0)throw new Error('Cannot fetch media release; deployment stopped');
 const hash=createHash('sha256');for await(const chunk of createReadStream(archive))hash.update(chunk);
 if(hash.digest('hex')!==expected)throw new Error('Media archive checksum mismatch; deployment stopped');
 await mkdir('media',{recursive:true});
 const unpack=spawnSync('tar',['-xf',archive,'-C','media'],{stdio:'inherit'});
 if(unpack.status!==0)throw new Error('Cannot unpack media');
 const root='media/first-briefing';
 const files=['full-720p.mp4','full-audio.mp3',...lessons.flatMap(({id})=>[`clips/${id}.mp4`,`clips/${id}.mp3`])];
 for(const file of files)if((await stat(join(root,file))).size===0)throw new Error(`Empty media: ${file}`);
 const manifest=JSON.parse(await readFile(join(root,'manifest.json'),'utf8'));
 for(const lesson of lessons)if(!manifest.clips.some(clip=>clip.id===lesson.id&&clip.start===lesson.start&&clip.end===lesson.end))throw new Error('Media timeline differs from course data');
 console.log('Verified release checksum and all 18 media files.');
}finally{await rm(temporary,{recursive:true,force:true});}
