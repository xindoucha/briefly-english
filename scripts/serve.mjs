import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
const root = resolve(process.argv.includes('--dist') ? 'dist' : '.');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.vtt':'text/vtt','.mp4':'video/mp4','.mp3':'audio/mpeg','.webm':'video/webm'};
export function parseRange(header, size) {
  const match=/^bytes=(\d*)-(\d*)$/.exec(header);
  if(!match || (!match[1]&&!match[2]))return null;
  let start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
  let end=match[1]?(match[2]?Math.min(Number(match[2]),size-1):size-1):size-1;
  return Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<=end&&start<size?{start,end}:null;
}
export const server = createServer(async (req, res) => {
  try {
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'}).end();return;}
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (/(^|\/)\./.test(pathname) || /(^|\/)(node_modules|docs|scripts|tests|media-source)(\/|$)/.test(pathname)) { res.writeHead(404).end(); return; }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const {size}=await stat(file);
    const headers={'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Accept-Ranges':'bytes'};
    let start=0,end=size-1,status=200;
    if(req.headers.range && req.method==='GET'){
      const range=parseRange(req.headers.range,size);
      if(!range){res.writeHead(416,{...headers,'Content-Range':`bytes */${size}`}).end();return;}
      ({start,end}=range);status=206;headers['Content-Range']=`bytes ${start}-${end}/${size}`;
    }
    res.writeHead(status,{...headers,'Content-Length':size?end-start+1:0});
    if(req.method==='HEAD'||!size){res.end();return;}
    const stream=createReadStream(file,{start,end});
    stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  } catch { if(!res.headersSent)res.writeHead(404).end('Not found');else res.destroy(); }
});
if(process.argv[1] && resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname))server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + server.address().port));
