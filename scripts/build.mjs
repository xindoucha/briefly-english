import {mkdir, cp, rm} from 'node:fs/promises';
await rm('dist', {recursive:true, force:true});
await mkdir('dist', {recursive:true});
for (const name of ['index.html','src','CNAME','.nojekyll']) await cp(name, `dist/${name}`, {recursive:true});
console.log('Built static website in dist/');
// Large media is intentionally ignored by Git. Include only when explicitly packaging locally.
if (process.argv.includes('--with-media')) await cp('media','dist/media',{recursive:true});
