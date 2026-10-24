// Optional system media controls; unsupported browsers retain native audio controls.
export function connectPodcast(player, key, {storage, session, Metadata} = {}) {
  let lastSaved=0,ready=false;
  const listeners=[];
  const listen=(event,fn)=>{player.addEventListener(event,fn);listeners.push([event,fn]);};
  const save=()=>{if(!ready)return;try{storage?.setItem(key,String(player.currentTime));}catch{}};
  const seek=time=>{if(Number.isFinite(player.duration))player.currentTime=Math.max(0,Math.min(player.duration,time));};
  const position=()=>{try{if(Number.isFinite(player.duration)&&player.duration>0)session?.setPositionState?.({duration:player.duration,playbackRate:player.playbackRate,position:Math.max(0,Math.min(player.duration,player.currentTime))});}catch{}};
  listen('loadedmetadata',()=>{ready=true;try{const time=Number(storage?.getItem(key));if(time>0&&time<player.duration-5)player.currentTime=time;}catch{}position();});
  listen('timeupdate',()=>{if(Math.abs(player.currentTime-lastSaved)>=3){lastSaved=player.currentTime;save();}position();});
  listen('pause',()=>{save();if(session)session.playbackState='paused';});
  listen('play',()=>{if(session){if(Metadata)session.metadata=new Metadata({title:'第 01 期 · 莱维特首次白宫记者会',artist:'The White House',album:'Briefly English'});session.playbackState='playing';}position();});
  listen('ratechange',position);
  const actions={play:()=>player.play().catch(()=>{}),pause:()=>player.pause(),seekbackward:details=>seek(player.currentTime-(details.seekOffset||15)),seekforward:details=>seek(player.currentTime+(details.seekOffset||15)),seekto:details=>seek(details.seekTime)};
  const installed=[];
  for(const [action,handler]of Object.entries(actions)){try{session?.setActionHandler(action,handler);installed.push(action);}catch{}}
  return ()=>{save();for(const [event,fn]of listeners)player.removeEventListener(event,fn);for(const action of installed){try{session?.setActionHandler(action,null);}catch{}}if(session){session.playbackState='none';session.metadata=null;}};
}
