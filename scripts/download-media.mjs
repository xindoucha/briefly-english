import {spawnSync} from 'node:child_process';
import {mkdir,stat,readFile,writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {source} from '../src/data.js';
const file='media-source/first-briefing.webm',bytes=464139447,md5='199bc47f5b97d8ee2eb22654c3e9163e';
await mkdir('media-source',{recursive:true});
if((await stat(file).catch(()=>({size:0}))).size!==bytes){
 const result=spawnSync('curl',['--location','--fail','--show-error','--connect-timeout','20','--continue-at','-','--dump-header','media-source/download.headers','--output',file,source.media],{stdio:'inherit'});
 if(result.status!==0){const headers=await readFile('media-source/download.headers','utf8').catch(()=>'');const retry=/retry-after:\s*(\d+)/i.exec(headers);throw new Error(retry?`Source rate limited. Wait at least ${retry[1]} seconds before retrying. Partial file retained.`:'Download interrupted. Retry later to resume the partial file.');}
}
if((await stat(file)).size!==bytes)throw new Error('Original size mismatch');
const hash=createHash('md5');for await(const chunk of createReadStream(file))hash.update(chunk);
if(hash.digest('hex')!==md5)throw new Error('Original checksum mismatch; do not transcode this file');
await writeFile('media-source/provenance.json',JSON.stringify({source:source.commons,retrieved:new Date().toISOString(),bytes,md5,license:'File page labels this White House work as US federal-government public domain'},null,2));
console.log('Original downloaded and checksum verified. Run npm run media:prepare.');
