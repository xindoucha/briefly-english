import {lessons, courses, getCourse, courseSegments, courseForSegment, courseProgress, segmentUrl, source as initialSource, steps, duration, sentenceAt, formatTime} from './data.js';
import {getPronunciation, pronunciationReference} from './pronunciation.js';
import {createSpeechController} from './speech.js';
import {transcriptText} from './transcript.js';
import {readState, writeState, toggleFavorite, emptyState, STORAGE_KEY} from './storage.js';
import {saveRecording, allRecordings, deleteRecording, clearRecordings} from './recordings.js';
import {connectPodcast} from './podcast.js';
import {createLocalPlayer, clipMedia} from './local-media.js';
import {createYouTubePlayer} from './youtube.js';

const $ = selector => document.querySelector(selector);
const app = $('#app');
let source=initialSource;
let disconnectPodcast;
let state;
try { state = readState(localStorage); } catch { state = emptyState(); }
let filter = '全部', activeLesson, currentLine = 0, currentStep = 0;
let loop = false, chinese = false, subtitles = true, video, timer, recordingTimer;
let recorder, stream, recordingPending = false, recordingStarted, currentBlob, blobUrl, clipKey, recordingEpoch = 0;
let audio, comparePlaying = false, playbackTime = 0;
let toastTimer, routeEpoch = 0;
let mediaWaitTimer, youtubeLoading = false, youtubeTried = false;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const icon = (name, size = 20) => {
  const paths = {
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H4z"/><path d="M13 7a3 3 0 0 1 3-3h5v14h-4a4 4 0 0 0-4 3"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    back: '<path d="m14 6-6 6 6 6"/>',
    play: '<path d="m8 5 12 7-12 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    mic: '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
    repeat: '<path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L20 5"/>',
    sound: '<path d="m11 5-6 4H2v6h3l6 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"/>',
    external: '<path d="M14 3h7v7m0-7L10 14M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.play}</svg>`;
};
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}
function persist() {
  try { writeState(localStorage, state); return true; }
  catch { toast('当前浏览器无法保存进度。你仍可继续学习。'); return false; }
}
function remember() {
  if (!activeLesson) return;
  state.last = activeLesson.id;
  const previous = state.progress[activeLesson.id] || {};
  state.progress[activeLesson.id] = {...previous, step: currentStep, line: currentLine};
  persist();
}
function header(section = 'learn', lesson = false, parent = '#/') {
  return `<header class="header"><div class="header-inner"><a class="brand" href="#/" aria-label="Briefly 首页"><span class="brand-icon">b<span>·</span></span>briefly<span class="beta">体验版</span></a>${lesson ? '<a class="back-link" href="'+parent+'">' + icon('back') + '返回本期课程</a>' : `<nav aria-label="主要导航">${[['learn','book','学习','#/'],['saved','heart','收藏','#/saved'],['me','user','我的','#/me']].map(([id, ico, name, url]) => `<a href="${url}" class="${section === id ? 'active' : ''}" ${section === id ? 'aria-current="page"' : ''}>${icon(ico)}<span>${name}</span></a>`).join('')}</nav><span class="header-note">A little practice. A clearer voice.</span>`}</div></header>`;
}
function footer() { return `<footer class="footer"><span class="mini-brand">briefly.</span><span>真实语境 · 独立学习项目，与白宫无隶属关系</span><a href="#/about">素材与隐私说明 ${icon('external',14)}</a></footer>`; }
function card(segment) {
  const progress=state.progress[segment.id];
  return `<a class="segment-card" href="${segmentUrl(segment)}"><span class="segment-number">${segment.number}</span><div class="segment-card-content"><div class="card-meta"><span>${segment.category} · ${segment.level}</span><span>${formatTime(segment.start)} — ${formatTime(segment.end)}</span></div><h3>${segment.title}</h3><p>${segment.description}</p><div class="card-bottom"><span>${duration(segment)} 秒原片 · 约 ${segment.minutes} 分钟练习</span><span>${progress?.completed?icon('check',14)+' 已完成':progress?'继续 · '+steps[progress.step||0]:'开始练习 →'}</span></div></div></a>`;
}
function courseCard(course) {
  const progress=courseProgress(course.id,state.progress);
  return `<a class="course-card episode-card" href="#/course/${course.id}"><div class="course-art art-01" aria-hidden="true"><span class="art-series">THE BRIEFING SERIES · EPISODE ${course.number}</span><span class="art-quote">One briefing.<br>Many ways to speak.</span><span class="art-number">${course.number}</span><span class="art-play">${icon('arrow',18)}</span></div><div class="card-body"><div class="card-meta"><span>第 ${course.number} 期 · ${course.date}</span><span>${formatTime(course.durationSeconds)} 完整视频</span></div><h3>${course.title}</h3><p>${course.description}</p><div class="episode-progress"><div><i style="width:${progress.percent}%"></i></div><span>${progress.completed} / ${progress.total} 个片段已完成</span></div><div class="card-bottom"><span>${course.speaker}</span><span>查看本期课程 →</span></div></div></a>`;
}
function renderCourse(course) {
  disconnectPodcast?.();disconnectPodcast=null;
  document.querySelectorAll('#podcast-player, #full-video-panel video').forEach(player=>player.pause());
  activeLesson=null;
  const items=courseSegments(course.id),progress=courseProgress(course.id,state.progress);
  const last=items.find(item=>item.id===state.last),next=last||items.find(item=>!state.progress[item.id]?.completed)||items[0];
  app.innerHTML=`${header()}<main id="main" class="container course-page" tabindex="-1"><a class="back-link" href="#/">${icon('back',17)} 全部课程</a><div class="course-intro"><div><div class="eyebrow">THE BRIEFING SERIES · EPISODE ${course.number}</div><h1>第 ${course.number} 期 · ${course.title}</h1><p class="course-subtitle">${course.subtitle} · ${course.date}</p><p>${course.description}</p><div class="course-badges"><span>${items.length} 个学习片段</span><span>${formatTime(course.durationSeconds)} 原片</span><span>字幕参考公开时间轴</span></div><div class="course-actions"><a class="button primary" href="${segmentUrl(next)}">${last?'继续上次片段':'开始本期练习'} ${icon('arrow',17)}</a><button class="button secondary" data-action="full-video" data-id="${course.id}" aria-expanded="false">${icon('play',17)} 观看完整视频</button><button class="button secondary" data-action="full-audio" data-id="${course.id}" aria-expanded="false">${icon('sound',17)} 收听整期</button><a class="text-link" href="${course.source.mediaRoot}/full-audio.mp3" download="briefly-episode-01.mp3">下载整期 MP3 ↓</a></div></div><aside class="course-progress-box"><span class="label">本期学习进度</span><strong>${progress.completed}<small> / ${progress.total}</small></strong><span>个片段已完成</span><div class="progress-track"><i style="width:${progress.percent}%"></i></div><p>${last?'当前片段：'+last.title+' · '+steps[state.progress[last.id]?.step||0]:'按顺序练习，也可以从感兴趣的片段开始。'}</p></aside></div><div id="full-video-panel" class="full-video-panel" hidden></div><section id="podcast-panel" class="podcast-panel" hidden></section><section class="course-directory"><div class="section-heading"><div><div class="eyebrow">CHOOSE A MOMENT TO PRACTICE</div><h2>本期片段目录</h2></div><p>按原片时间排列 · 每个片段都可单独学习</p></div><div class="filters" role="group" aria-label="按片段能力筛选">${['全部',...new Set(items.map(item=>item.category))].map(category=>`<button class="chip ${filter===category?'selected':''}" data-action="filter" data-value="${category}" aria-pressed="${filter===category}">${category}</button>`).join('')}</div><div class="segment-grid">${items.filter(item=>filter==='全部'||item.category===filter).map(card).join('')}</div></section><div class="course-source"><p>一场原片，一期课程；片段保留独立标识与学习进度。部分片段为陈述节选，问答片段标明记者与发言人。</p><a href="${course.source.official}" target="_blank" rel="noopener noreferrer">官方原片 ↗</a> · <a href="${course.source.subtitles}" target="_blank" rel="noopener noreferrer">字幕与时间轴来源 ↗</a><p>英文和时间轴尚待人工复听。发音技巧解释常见规律，不是已核验的个人发音转写。</p></div></main>${footer()}`;
}
function renderHome() {
  activeLesson = null;
  const last = lessons.find(item => item.id === state.last);
  app.innerHTML = `${header()}<main id="main" class="home container" tabindex="-1"><section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="tiny-line"></span> REAL ENGLISH. YOUR OWN VOICE.</div><h1>听见真实英语，<br>说出<span class="accent">自己的表达。</span></h1><p>从一段白宫记者会开始。听懂、模仿，再用自己的话回答。<br class="desktop-break">每天留一点时间，让开口更自然。</p><a class="button primary" href="${last?segmentUrl(last):'#/course/'+courses[0].id}">${last ? '继续我的练习' : '查看第一期课程'} ${icon('arrow',18)}</a><span class="hero-caption">无需注册 · 进度保存在本机</span></div><div class="hero-visual" aria-hidden="true"><div class="visual-top"><span>LISTEN CLOSELY.</span><span>EPISODE 01 · 08 MOMENTS</span></div><div class="big-quote">“</div><div class="visual-words">A clearer voice<br>starts with<br><em>a closer listen.</em></div><div class="wave">${Array.from({length:35},(_,i)=>`<i style="--h:${[14,25,40,21,46,58,30,65,85,55,34,72,100,61,38,83,55,31,64,92,60,41,76,47,29,55,38,20,35,49,26,18,30,16,10][i]}%"></i>`).join('')}</div><div class="visual-bottom"><span>THE ART OF SPEAKING</span><span>listen → speak</span></div></div></section>
    <section class="method" aria-label="学习方法">${[['01','听懂','在真实语境里捕捉意思'],['02','模仿','跟上重音、连读与节奏'],['03','活用','把好表达带进日常'],['04','开口','用自己的话回答问题']].map(([n,t,d])=>`<div><span class="method-number">${n}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}</section>
    ${last ? `<section class="continue"><span class="continue-icon">${icon('play')}</span><div><span class="muted">继续上次的练习</span><h3>${last.title}</h3></div><a class="text-link" href="${segmentUrl(last)}">${steps[state.progress[last.id]?.step || 0]} ${icon('arrow',18)}</a></section>` : ''}
    <section class="library"><div class="section-heading"><div><div class="eyebrow">ONE VIDEO. ONE COURSE.</div><h2>按期学习，逐段开口<span class="count">${courses.length.toString().padStart(2,'0')} </span></h2></div><p>每期一场完整视频 · ${lessons.length} 个精选片段</p></div><div class="episode-grid">${courses.map(courseCard).join('')}</div><p class="source-notice">${icon('globe',16)} 一期课程对应一场记者会。英文与时间轴参考公开字幕，待人工复听；翻译、发音技巧和迁移练习为本站编写。</p></section>
    <section class="bottom-banner"><div><div class="eyebrow">LESS SCROLLING, MORE SPEAKING.</div><h2>不只听懂，还要说得出来。</h2><p>每课一个表达目标，一段属于你自己的回答。</p></div><a href="#/course/first-briefing" class="round-link" aria-label="查看第一期课程">${icon('arrow',30)}</a></section></main>${footer()}`;
}
function renderLesson(lesson) {
  activeLesson = lesson;
  const course=courseForSegment(lesson);source=course.source;
  youtubeTried = false;
  const progress = state.progress[lesson.id];
  currentStep = Math.max(0, Math.min(3, Number(progress?.step) || 0));
  currentLine = Math.max(0, Math.min(lesson.lines.length - 1, Number(progress?.line) || 0));
  playbackTime = lesson.start;
  loop = false;
  app.innerHTML = `${header('learn',true,'#/course/'+course.id)}<main id="main" class="container lesson-main" tabindex="-1"><div class="lesson-heading"><div class="eyebrow">第 ${course.number} 期 / 学习片段 ${lesson.number} · ${courseSegments(course.id).length} 段</div><h1>${lesson.title}</h1><p>${lesson.english}</p><details class="fragment-context"><summary>片段语境与本期进度</summary><p>${lesson.context||lesson.description}</p><p id="fragment-progress">第 ${course.number} 期 · 已完成 ${courseProgress(course.id,state.progress).completed} / ${courseSegments(course.id).length} 个片段 · 当前练到「${steps[currentStep]}」</p><a href="#/course/${course.id}" class="text-link">查看本期全部片段 →</a></details></div><div class="lesson-layout"><section class="media-column" aria-label="视频与原文"><div class="video-shell"><video id="video" controls playsinline preload="none" aria-label="莱维特记者会原片"><source src="${clipMedia(source,lesson)}" type="video/mp4"></video><div id="video-cover" class="video-cover"><span class="eyebrow">JANUARY 28, 2025 · THE WHITE HOUSE</span><strong>${lesson.english}</strong><button class="cover-play" data-action="play">${icon('play',28)}<span>播放原片</span></button><small>片段 ${formatTime(lesson.start)} — ${formatTime(lesson.end)}</small></div><div class="audio-cover" hidden><span>${icon('sound',48)}</span><strong>专注声音，跟上节奏。</strong><p>独立音频文件 · 节省流量</p></div></div><div class="media-toolbar"><button id="transport" class="plain transport" data-action="play" aria-label="播放">${icon('play',17)}</button><button class="plain" data-action="audio" aria-pressed="false">${icon('sound',17)} <span>专注音频</span></button><span id="time-label">0:00 / ${formatTime(duration(lesson))}</span><label class="speed-label">语速 <select id="speed" aria-label="播放速度"><option value="0.75">0.75×</option><option value="0.85">0.85×</option><option value="1" selected>1×</option><option value="1.15">1.15×</option></select></label></div><div id="media-error" class="notice" hidden>视频加载较慢或暂时不可用。可重试或切换官方 YouTube。<button class="text-link" data-action="retry">重新加载</button> · <a href="${source.youtube}&t=${Math.floor(lesson.start)}s" target="_blank" rel="noopener noreferrer">打开官方视频 ↗</a></div><div class="source-row"><span>Karoline Leavitt <span class="muted">· ${source.date}</span></span><a href="${source.official}" target="_blank" rel="noopener noreferrer">原片来源 ${icon('external',13)}</a></div><details class="transcript" open><summary>完整片段字幕 <span>可选中文字复制</span></summary><div class="transcript-settings"><button class="chip small" data-action="subtitles" aria-pressed="${subtitles}">英文 ${subtitles?'开':'关'}</button><button class="chip small" data-action="chinese" aria-pressed="${chinese}">中文 ${chinese?'开':'关'}</button><button class="plain" data-action="copy-transcript">复制字幕</button><button class="plain" data-action="follow">当前句 ↓</button></div><div id="transcript-lines"></div></details><div class="media-alternative"><span>播放遇到问题？</span><button class="text-link" data-action="youtube">使用 YouTube 播放</button></div><details class="source-details"><summary>素材与字幕说明</summary><p>视频制作：The White House。本站播放由 Wikimedia Commons 原文件转制的视频和独立音频，YouTube 作为手动备用入口；其文件页标注为美国联邦政府公有领域作品。英文与时间轴参考公开字幕，尚待人工复听；中文、发音提示及练习为本站编写。</p><p><a href="${source.commons}" target="_blank" rel="noopener noreferrer">媒体与许可记录 ↗</a> · <a href="${source.subtitles}" target="_blank" rel="noopener noreferrer">字幕记录 ↗</a></p><p>原片中的政策观点属于发言人，不代表本站立场。第三方媒体服务可能接收播放请求。</p></details></section><section class="practice-column" aria-label="学习练习"><div class="step-tabs" role="tablist" aria-label="学习步骤">${steps.map((step,i)=>`<button id="tab-${i}" role="tab" aria-controls="practice-panel" data-action="step" data-step="${i}"><span>0${i+1}</span>${step}</button>`).join('')}</div><div id="practice-panel" role="tabpanel" tabindex="0"></div><div class="step-bottom"><button class="plain" id="previous-step" data-action="previous-step">${icon('back',16)} 上一步</button><span id="step-position"></span><button class="text-link" id="next-step" data-action="next-step">下一步 ${icon('arrow',17)}</button></div></section></div></main>${footer()}`;
  video = createLocalPlayer($('#video'),lesson);
  const nativeVideo=video;
  video.addEventListener('loadedmetadata', () => {
    if(video!==nativeVideo)return;
    if (video.currentTime < lesson.start || video.currentTime >= lesson.end) video.currentTime = lesson.lines[currentLine].start;
  });
  video.addEventListener('play', () => { if(video!==nativeVideo)return;stopAudio(); $('#video-cover').hidden = true; updatePlayButton(); });
  video.addEventListener('playing', () => { if(video!==nativeVideo)return;clearTimeout(mediaWaitTimer); if($('#media-error'))$('#media-error').hidden=true; });
  video.addEventListener('waiting', () => {
    if(video!==nativeVideo)return;
    clearTimeout(mediaWaitTimer);
    mediaWaitTimer=setTimeout(()=>{if($('#media-error'))$('#media-error').hidden=false;},10000);
  });
  video.addEventListener('pause', updatePlayButton);
  video.addEventListener('ended',()=>{if(video!==nativeVideo)return;if(loop)playFrom(lesson.lines[currentLine].start);else if(comparePlaying){comparePlaying=false;playRecording();}});
  video.addEventListener('timeupdate', tick);
  video.addEventListener('error', () => { if(video===nativeVideo&&$('#media-error'))$('#media-error').hidden = false; });
  $('#speed').addEventListener('change', event => { video.playbackRate = Number(event.target.value); });
  timer = setInterval(tick, 100);
  renderTranscript(); renderPanel(); remember();
}
function renderTranscript() {
  if (!activeLesson || !$('#transcript-lines')) return;
  $('#transcript-lines').innerHTML=activeLesson.lines.map((line,i)=>`<div class="transcript-line ${currentLine===i?'current':''}"><button class="line-time plain" data-action="line" data-index="${i}" aria-label="播放第 ${i+1} 句，${formatTime(line.start)}" ${currentLine===i?'aria-current="true"':''}>${icon('play',12)}<span>${formatTime(line.start)}</span></button><div class="caption-content"><small>${line.speaker==='The Press'?'记者':'LEAVITT'}</small>${subtitles?`<p class="caption-text" lang="en">${escape(line.en)}</p>`:'<p class="muted">英文已隐藏 · 点击左侧按钮聆听</p>'}${chinese?`<p class="translation">${line.zh}</p>`:''}<div class="caption-actions"><button class="plain" data-action="copy-line" data-index="${i}" aria-label="复制第 ${i+1} 句字幕">复制</button><button class="plain" data-action="show-pronunciation" data-index="${i}">发音技巧</button></div></div></div>`).join('');
}
function renderPronunciation(segment,index) {
  const rules=getPronunciation(segment,index);
  return `<details class="pronunciation-module" id="pronunciation-tips" open><summary>${icon('sound',18)} 发音技巧 <span>${rules.length} 个听辨重点</span></summary><p class="pronunciation-legend">‿ 表示衔接，/ 表示分组；大写提示重音。以下为常见读法提示，尚未逐句核验她在原声中的实际读法。</p>${rules.map(rule=>`<article class="sound-rule"><div><span class="tag">${rule.type}</span><span class="sound-status">常见规律 · 待原声核验</span></div><h4 lang="en">${escape(rule.phrase)}</h4><p class="heard-form">${escape(rule.heard)}</p><dl><dt>为什么难听清</dt><dd>${rule.why}</dd><dt>怎么练</dt><dd>${rule.practice}</dd></dl></article>`).join('')}<div class="sound-actions"><button class="text-link" data-action="pronunciation-play">${icon('play',16)} 回听本句原声</button><a href="${pronunciationReference}" target="_blank" rel="noopener noreferrer">了解连贯语流 ↗</a></div></details>`;
}
function highlightTranscript() {
  if(!$('#transcript-lines'))return;
  $('#transcript-lines').querySelectorAll('.transcript-line').forEach((row,index)=>{
    row.classList.toggle('current',index===currentLine);
    const button=row.querySelector('[data-action="line"]');
    if(index===currentLine)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');
  });
}
async function copyText(text) {
  if(!text){toast('当前字幕已隐藏，请先打开英文或中文。');return;}
  try {
    if(!navigator.clipboard?.writeText)throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);toast('字幕已复制');
  } catch {
    const input=document.createElement('textarea');input.value=text;input.setAttribute('aria-label','待复制字幕');
    input.style.cssText='position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';
    document.body.append(input);input.select();
    try{if(!document.execCommand('copy'))throw new Error('copy failed');toast('字幕已复制');}
    catch{toast('无法自动复制。字幕支持直接选中文字复制。');}
    finally{input.remove();}
  }
}
function speechChanged(key,error) {
  document.querySelectorAll('[data-action="speak-example"]').forEach(button=>{
    const active=button.dataset.key===key;
    button.setAttribute('aria-pressed',String(active));
    button.innerHTML=icon(active?'pause':'sound',16)+(active?' 停止朗读':' 朗读例句');
  });
  if(error&&error!=='canceled'&&error!=='interrupted')toast('语音暂时不可用，请检查系统是否安装英语语音后重试。');
}
const speech=createSpeechController({onChange:speechChanged});

function renderPanel() {
  if (!activeLesson) return;
  const lesson = activeLesson, line = lesson.lines[currentLine];
  const panel = $('#practice-panel');
  const course=courseForSegment(lesson);
  if($('#fragment-progress'))$('#fragment-progress').textContent='第 '+course.number+' 期 · 已完成 '+courseProgress(course.id,state.progress).completed+' / '+courseSegments(course.id).length+' 个片段 · 当前练到「'+steps[currentStep]+'」';
  $('.step-tabs').querySelectorAll('button').forEach((button,i) => {
    button.setAttribute('aria-selected', String(i===currentStep)); button.tabIndex=i===currentStep?0:-1;
  });
  panel.setAttribute('aria-labelledby', `tab-${currentStep}`);
  $('#previous-step').disabled = currentStep===0;
  $('#step-position').textContent = `${currentStep+1} / 4`;
  $('#next-step').innerHTML = currentStep===3 ? `完成本片段 ${icon('check',17)}` : `下一步 ${icon('arrow',17)}`;
  if (currentStep===0) {
    panel.innerHTML = `<div class="panel-eyebrow">LISTEN FOR MEANING</div><h2>先听，抓住大意。</h2><p class="panel-intro">先不看翻译，听一遍原片。无需听懂每个词，留意她如何组织表达。</p><button class="button primary wide" data-action="restart">${icon('play',18)} 从片段开头播放</button><div class="question-block"><span class="label">听力小检查</span><h3>${lesson.comprehension}</h3><div class="answer-options">${lesson.options.map((answer,i)=>`<button data-action="answer" data-index="${i}" aria-pressed="false"><span>${String.fromCharCode(65+i)}</span>${answer}</button>`).join('')}</div><p id="answer-feedback" class="muted" role="status">选一个答案，或直接进入模仿练习。</p></div><div class="tip-box">${icon('sound',19)}<p>先关注句子中的重音词。它们通常承载着主要意思。</p></div>`;
  } else if (currentStep===1) {
    const key = `${lesson.id}:line:${currentLine}`;
    panel.innerHTML = `<div class="panel-eyebrow">FIND YOUR RHYTHM</div><div class="panel-title-row"><h2>一句一句，练出节奏。</h2><span class="muted">${currentLine+1} / ${lesson.lines.length}</span></div><div class="sentence-card"><span class="label">${line.speaker==='The Press'?'THE PRESS':'KAROLINE LEAVITT'}</span><p class="sentence" lang="en">${escape(line.en)}</p><details><summary>查看翻译</summary><p class="muted">${line.zh}</p></details><p class="sentence-tip">${line.tip}</p><button class="favorite-button ${state.favorites.includes(key)?'is-saved':''}" data-action="favorite" data-key="${key}" aria-pressed="${state.favorites.includes(key)}">${icon('heart',17)} ${state.favorites.includes(key)?'已收藏':'收藏这句'}</button></div><div class="sentence-controls"><button class="icon-button" data-action="previous-line" aria-label="上一句" ${currentLine===0?'disabled':''}>${icon('back')}</button><button class="button secondary" id="play-button" data-action="play">${icon('play',18)} 播放原声</button><button class="icon-button" data-action="next-line" aria-label="下一句" ${currentLine===lesson.lines.length-1?'disabled':''}>${icon('arrow')}</button><button class="icon-button ${loop?'enabled':''}" data-action="loop" aria-label="单句循环" aria-pressed="${loop}">${icon('repeat')}</button></div>${renderPronunciation(lesson,currentLine)}<div class="record-section"><span class="label">听一遍，再试着跟读</span><div id="record-area"></div></div>`;
    loadClip(key);
  } else if (currentStep===2) {
    panel.innerHTML = `<div class="panel-eyebrow">MAKE IT YOURS</div><h2>把表达带进日常。</h2><p class="panel-intro">理解语气和使用场景，再试着换成你自己的内容。</p><div class="expression-list">${lesson.expressions.map((item,i)=>{const key=`${lesson.id}:expression:${i}`;return `<article class="expression"><div class="expression-top"><span class="tag">${item.tone}</span><button class="icon-button ${state.favorites.includes(key)?'is-saved':''}" aria-label="${state.favorites.includes(key)?'取消收藏':'收藏'}表达 ${escape(item.phrase)}" aria-pressed="${state.favorites.includes(key)}" data-action="favorite" data-key="${key}">${icon('heart',18)}</button></div><h3 lang="en">${escape(item.phrase)}</h3><p>${item.meaning}</p><p class="expression-note">${item.note}</p><div class="example"><span class="label">迁移例句 · 本站编写</span><p lang="en">${escape(item.example)}</p><div class="example-speech"><button class="plain" data-action="speak-example" data-key="${lesson.id}:example:${i}" data-index="${i}" aria-pressed="false">${icon('sound',16)} 朗读例句</button><label>语速 <select aria-label="例句 ${i+1} 朗读速度" data-example-speed="${i}"><option value="1">正常</option><option value="0.8">慢速</option></select></label></div><small class="speech-disclaimer">浏览器合成语音 · 优先美式英语 · 非莱维特原声</small></div></article>`;}).join('')}</div>`;
  } else {
    panel.innerHTML = `<div class="panel-eyebrow">YOUR TURN TO SPEAK</div><h2>这一次，用你的话说。</h2><p class="panel-intro">离开原文，试着回答一个新的问题。表达清楚比逐字完美更重要。</p><div class="speak-prompt"><span class="label">你的情境</span><h3>${lesson.question}</h3><span class="muted">建议 30–60 秒，不设硬性时限</span></div><details class="hint"><summary>需要一点思路？</summary><p>${lesson.hint}</p></details><details class="hint"><summary>查看参考回答</summary><p lang="en">${lesson.answer}</p><small class="muted">本站编写，仅为示例。</small></details><div id="record-area"></div><fieldset class="self-check"><legend>说完后，问问自己</legend>${['我直接回应了问题','我用到了目标表达','我让重点听起来更清楚'].map(t=>`<label><input type="checkbox">${t}</label>`).join('')}</fieldset>`;
    loadClip(`${lesson.id}:answer`);
  }
}
function tick() {
  if (!video || !activeLesson || !Number.isFinite(video.currentTime)) return;
  const lesson = activeLesson;
  playbackTime = video.currentTime;
  if (!video.paused && !video.seeking && video.readyState >= 2) {
    if (loop && playbackTime >= lesson.lines[currentLine].end) video.currentTime = lesson.lines[currentLine].start;
    else if (!loop && currentStep===1 && !comparePlaying && playbackTime >= lesson.lines[currentLine].end - 0.02) video.pause();
    else if (!loop && playbackTime >= lesson.end - 0.03) { video.pause(); if (comparePlaying) { comparePlaying=false; playRecording(); } }
    else if (!loop && !comparePlaying) {
      const index = sentenceAt(lesson,playbackTime);
      if (index >= 0 && index!==currentLine && currentStep!==1) { currentLine=index; highlightTranscript(); }
    }
    if (comparePlaying && playbackTime >= lesson.lines[currentLine].end - 0.02) {
      video.pause(); comparePlaying=false; playRecording();
    }
  }
  const label = $('#time-label');
  if (label) label.textContent=`${formatTime(Math.min(lesson.end-lesson.start,Math.max(0,playbackTime-lesson.start)))} / ${formatTime(duration(lesson))}`;
}
function updatePlayButton() {
  const button = $('#play-button');
  if (button && video) button.innerHTML=icon(video.paused?'play':'pause',18)+(video.paused?' 播放原声':' 暂停原声');
  const transport=$('#transport');
  if(transport&&video){transport.innerHTML=icon(video.paused?'play':'pause',17);transport.setAttribute('aria-label',video.paused?'播放':'暂停');}
}
async function playFrom(time) {
  if (!video || recordingPending || recorder?.state==='recording') { if (recordingPending || recorder?.state==='recording') toast('先结束录音，再播放原声。'); return; }
  if(youtubeLoading){toast('播放器正在连接，请稍候。');return;}
  stopAudio();
  try {
    if (time !== undefined) video.currentTime=time;
    else if(video.currentTime>=activeLesson.end-0.1)video.currentTime=activeLesson.start;
    if (!video.currentSrc) video.load();
    await video.play();
    $('#video-cover').hidden=true;
  } catch(error) { if(error.name==='AbortError')return; if ($('#media-error')) $('#media-error').hidden=false; toast('暂时无法播放。可尝试重新加载或打开官方视频。'); }
}
async function switchYouTube(button) {
  if(youtubeLoading || video?.isYouTube)return;
  if(recordingPending||recorder?.state==='recording'){toast('请先结束录音。');return;}
  const epoch=routeEpoch, start=activeLesson.lines[currentLine].start;
  youtubeLoading=true;button.disabled=true;button.textContent='正在连接 YouTube…';
  youtubeTried=true;
  video?.pause();stopAudio();
  const container=document.createElement('div');container.id='youtube-player';
  $('.video-shell').append(container);
  try {
    const adapter=await createYouTubePlayer('youtube-player',start,status=>{
      if(epoch!==routeEpoch)return;
      if(status===1){stopAudio();if($('#video-cover'))$('#video-cover').hidden=true;}
      if(status===-2&&$('#media-error'))$('#media-error').hidden=false;
      updatePlayButton();
    },source.videoId);
    if(epoch!==routeEpoch){adapter.destroy();return;}
    video.pause();video.removeAttribute('src');video.querySelector('source')?.removeAttribute('src');video.load();
    $('#video').hidden=true;$('#video-cover').hidden=true;video=adapter;
    $('.video-shell').classList.add('youtube-mode');
    $('#media-error').hidden=true;
    $('#speed').innerHTML=adapter.rates.map(rate=>`<option value="${rate}" ${rate===1?'selected':''}>${rate}×</option>`).join('');
    button.textContent='已切换 YouTube';
    toast('已连接官方 YouTube。点击播放器开始播放。');
  } catch {
    if(epoch!==routeEpoch)return;
    $('#youtube-player')?.remove();button.disabled=false;button.textContent='使用 YouTube 播放';
    toast('YouTube 暂时不可用。仍可通过来源链接观看原片。');
  } finally {if(epoch===routeEpoch)youtubeLoading=false;}
}
function stopAudio() { speech.stop(); if (audio) { audio.pause(); audio=null; } }
async function chooseLine(index, play=true) {
  if (recorder?.state==='recording' || recordingPending) { toast('请先停止当前录音。'); return; }
  comparePlaying=false; stopAudio(); video?.pause();
  currentLine=Math.max(0,Math.min(activeLesson.lines.length-1,index));
  renderTranscript(); if(currentStep===1) renderPanel(); remember();
  if (play) await playFrom(activeLesson.lines[currentLine].start);
}
async function loadClip(key) {
  clipKey=key; currentBlob=null;
  const epoch=recordingEpoch;
  if(blobUrl) {URL.revokeObjectURL(blobUrl);blobUrl=null;}
  renderRecorder();
  try {
    const clips=await allRecordings();
    if(clipKey!==key || epoch!==recordingEpoch || recordingPending || recorder?.state==='recording' || !$('#record-area')) return;
    const found=clips.find(clip=>clip.id===key);
    if(found) { currentBlob=found.blob;blobUrl=URL.createObjectURL(currentBlob);renderRecorder(); }
  } catch { /* Recording remains usable in memory. Saving reports errors separately. */ }
}
function renderRecorder() {
  const area=$('#record-area'); if(!area) return;
  const recording=recorder?.state==='recording';
  area.innerHTML=`<div class="recorder ${recording?'recording':''}"><button class="button ${recording?'danger':'primary'} wide" data-action="record" ${recordingPending?'disabled':''}>${recording?'<span class="record-dot"></span>':icon('mic',19)} ${recording?'停止录音':recordingPending?'等待麦克风…':currentBlob?'重新录音':'开始录音'}<span id="record-time">${recording?formatTime((Date.now()-recordingStarted)/1000):''}</span></button>${currentBlob&&!recording?`<div class="record-actions"><button class="plain" data-action="play-recording">${icon('play',16)} 我的录音</button>${currentStep===1?'<button class="plain" data-action="compare">原声 → 我的录音</button>':''}<button class="plain" data-action="save-recording">保存到本机</button><button class="plain" data-action="download-recording">导出</button><button class="plain" data-action="delete-current-recording">删除</button></div>`:''}<p class="record-privacy">${recording?'正在录音 · 再次点击结束':currentBlob?'录音已就绪，可回放或保存。未保存的新录音离开本句后会丢失。':'点击后请求麦克风。录音只在本机处理，不上传。'}</p></div>`;
}
async function startRecording() {
  if(recorder?.state==='recording') {recorder.stop();return;}
  if(recordingPending) return;
  if(!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {toast('当前浏览器不支持录音。请使用 HTTPS 或 localhost，并尝试新版 Safari / Chrome。');return;}
  video?.pause();stopAudio();comparePlaying=false;
  const epoch=++recordingEpoch, key=clipKey;
  recordingPending=true;renderRecorder();
  try {
    const nextStream=await navigator.mediaDevices.getUserMedia({audio:true});
    if(epoch!==recordingEpoch || key!==clipKey || !$('#record-area')) {nextStream.getTracks().forEach(t=>t.stop());return;}
    stream=nextStream;
    const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(type=>MediaRecorder.isTypeSupported(type));
    recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);
    const chunks=[];const recordingKey=clipKey;
    recorder.addEventListener('dataavailable',event=>{if(event.data.size) chunks.push(event.data);});
    recorder.addEventListener('error',()=>{stopRecording();toast('录音中断，请重试。');});
    recorder.addEventListener('stop',()=>{
      stream?.getTracks().forEach(track=>track.stop());clearInterval(recordingTimer);
      if(recordingEpoch!==epoch || clipKey!==recordingKey) return;
      const type=chunks[0]?.type || mime || 'audio/webm';
      currentBlob=new Blob(chunks,{type});
      if(blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl=URL.createObjectURL(currentBlob);renderRecorder();
    });
    recordingPending=false;recordingStarted=Date.now();recorder.start();renderRecorder();
    recordingTimer=setInterval(()=>{const label=$('#record-time');if(label) label.textContent=formatTime((Date.now()-recordingStarted)/1000);},250);
  } catch(error) {
    recordingPending=false;stream?.getTracks().forEach(t=>t.stop());
    if(epoch===recordingEpoch) {toast(error.name==='NotAllowedError'?'麦克风未获允许。你仍可听原声、看提示并自行跟读。':'无法打开麦克风，请检查设备是否可用。');renderRecorder();}
  }
}
function stopRecording() {
  recordingPending=false;
  if(recorder?.state==='recording') recorder.stop();
  stream?.getTracks().forEach(track=>track.stop());clearInterval(recordingTimer);
}
function playRecording() {
  if(!blobUrl) return;
  video?.pause();stopAudio();audio=new Audio(blobUrl);
  audio.play().catch(()=>toast('录音无法回放，请尝试导出或重新录制。'));
}
async function saveCurrentRecording() {
  if(!currentBlob || !clipKey) return;
  try {
    await saveRecording({id:clipKey,lessonId:activeLesson.id,title:currentStep===3?'开口回答':activeLesson.lines[currentLine].en,blob:currentBlob,createdAt:Date.now()});
    toast('已保存到当前浏览器，可在「我的」中回放。');
  } catch {toast('本机保存失败，可能没有足够空间。可用「导出」保留录音。');}
}
function downloadBlob(blob,name) {
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function extension(blob) {return blob.type.includes('mp4')?'m4a':'webm';}
function renderSaved() {
  activeLesson=null;
  const entries=state.favorites.flatMap(key=>{
    const [id,type,index]=key.split(':'),lesson=lessons.find(l=>l.id===id);
    if(!lesson)return [];
    const item=type==='line'?lesson.lines[Number(index)]:lesson.expressions[Number(index)];
    return item?[{key,lesson,item,type,index:Number(index)}]:[];
  });
  app.innerHTML=`${header('saved')}<main id="main" class="container inner-page" tabindex="-1"><div class="eyebrow">WORDS WORTH KEEPING</div><h1>我的表达收藏<span class="count">${entries.length.toString().padStart(2,'0')}</span></h1><p class="page-intro">把想说的话留下来，下次开口就多一点把握。</p>${entries.length?`<div class="saved-grid">${entries.map(({key,lesson,item,type,index})=>`<article class="saved-card"><div class="saved-top"><span class="tag">${type==='line'?'原声句子':item.tone}</span><button class="icon-button is-saved" data-action="favorite" data-key="${key}" aria-label="取消收藏">${icon('heart')}</button></div><h2 lang="en">${escape(item.en||item.phrase)}</h2><p>${item.zh||item.meaning}</p><a href="${segmentUrl(lesson)}" class="text-link" data-action="review" data-id="${lesson.id}" data-step="${type==='line'?1:2}" data-index="${index}">${lesson.title} ${icon('arrow',17)}</a></article>`).join('')}</div>`:`<div class="empty-state"><span class="empty-icon">${icon('heart',36)}</span><h2>下一句好表达，留给自己。</h2><p>学习时点击爱心，就能在这里找到收藏的句子和表达。</p><a href="#/" class="button primary">去选一节课 ${icon('arrow',18)}</a></div>`}</main>${footer()}`;
}
async function renderMe() {
  activeLesson=null;const epoch=routeEpoch;
  const completed=lessons.filter(l=>state.progress[l.id]?.completed).length;
  app.innerHTML=`${header('me')}<main id="main" class="container inner-page" tabindex="-1"><div class="eyebrow">A PRACTICE THAT IS YOURS</div><h1>一点一点，找到自己的声音。</h1><p class="page-intro">学习记录保存在当前浏览器，无需账号。</p><div class="stats"><div><strong>${completed}<small> / ${lessons.length}</small></strong><span>已完成片段</span></div><div><strong>${state.favorites.length}</strong><span>收藏的表达</span></div><div><strong id="record-count">—</strong><span>本机录音</span></div></div><section class="profile-section"><div class="section-heading"><h2>学习片段足迹</h2><a class="text-link" href="#/course/first-briefing">本期完成 ${courseProgress('first-briefing',state.progress).completed} / ${courseProgress('first-briefing',state.progress).total} 段 →</a></div><div class="history">${lessons.map(l=>`<a href="${segmentUrl(l)}"><span class="history-number">${l.number}</span><div><strong>${l.title}</strong><span>${state.progress[l.id]?.completed?'已完成 · 可以再练一次':state.progress[l.id]?`练习到「${steps[state.progress[l.id].step]||steps[0]}」`:'还没开始'}</span></div>${icon(state.progress[l.id]?.completed?'check':'arrow',19)}</a>`).join('')}</div></section><section class="profile-section"><h2>我的录音</h2><p class="muted">只保存在本机。清除浏览器数据后可能丢失，重要录音建议导出。</p><div id="recording-list" aria-live="polite">正在读取本机录音…</div></section><section class="data-settings"><div><h3>你的数据，由你掌握。</h3><p>没有录音上传或分析跟踪。进度不会自动同步到其他设备。</p><a class="text-link" href="#/about">了解素材与隐私说明 ${icon('external',14)}</a></div><button class="button secondary" data-action="clear-data">清除本机学习数据</button></section></main>${footer()}`;
  try {
    const clips=await allRecordings(); if(epoch!==routeEpoch)return;
    $('#record-count').textContent=clips.length;
    $('#recording-list').innerHTML=clips.length?clips.sort((a,b)=>b.createdAt-a.createdAt).map(clip=>`<article class="recording-item"><div><strong>${escape(clip.title)}</strong><span>${new Date(clip.createdAt).toLocaleDateString('zh-CN')}</span></div><div class="record-actions"><button class="plain" data-action="stored-play" data-key="${escape(clip.id)}">${icon('play',16)} 回放</button><button class="plain" data-action="stored-download" data-key="${escape(clip.id)}">导出</button><button class="plain" data-action="stored-delete" data-key="${escape(clip.id)}">删除</button></div></article>`).join(''):'<div class="small-empty">还没有保存的录音。完成跟读后，点击「保存到本机」。</div>';
  } catch {if(epoch===routeEpoch){$('#record-count').textContent='不可用';$('#recording-list').textContent='无法读取本机录音存储。你仍可即时录音并导出。';}}
}
function renderAbout() {
  activeLesson=null;
  app.innerHTML=`${header()}<main id="main" class="container inner-page prose" tabindex="-1"><div class="eyebrow">BEHIND THE PRACTICE</div><h1>关于素材与隐私</h1><h2>独立的英语学习项目</h2><p>Briefly 通过真实记者会片段帮助学习者练习听力、发音与表达。与白宫、发言人及素材平台没有隶属或背书关系。原始发言中的观点不代表本站观点，政治陈述未在本站逐条核验。</p><h2>素材与字幕</h2><p>首批片段来自 2025 年 1 月 28 日记者会，制作主体为 The White House。媒体母版来自 Wikimedia Commons，本站播放转码后的文件，其文件页标注为美国联邦政府公有领域作品。完整来源与许可记录均在课程页提供。</p><p>英文与时间轴参考公开字幕，目前尚待人工复听。中文翻译、发音提示、情境题与迁移例句为本站编写。当前第 1 期课程包含 ${lessons.length} 个学习片段，既有短句也有问答。发音技巧是常见连贯语流规律提示，尚非逐句音频转写。</p><p><a href="${source.official}" target="_blank" rel="noopener noreferrer">官方原片页面 ↗</a><br><a href="${source.commons}" target="_blank" rel="noopener noreferrer">视频文件与许可记录 ↗</a><br><a href="${source.subtitles}" target="_blank" rel="noopener noreferrer">公开字幕记录 ↗</a></p><h2>例句语音</h2><p>迁移例句使用浏览器和系统的语音合成，优先选择美式英语声线，不模仿莱维特。语音可用性由设备决定；部分系统语音可能联网处理文本。本站不上传个人录音。</p><h2>本机数据</h2><p>收藏与学习进度保存在 localStorage，主动保存的录音存放于 IndexedDB。本站没有账号、录音上传、广告分析或服务器数据库。清除浏览器数据、使用隐私模式或更换设备，可能无法保留记录。</p><p>访问网站时，托管服务可能记录正常访问日志；本站视频和音频从当前站点加载；只有手动切换 YouTube 时才加载其播放器 API 和隐私增强嵌入。在新窗口打开来源会访问相应第三方平台。本站不会默认请求麦克风，只有点击录音后才请求。</p><h2>浏览器支持</h2><p>录音需要 HTTPS 或 localhost，以及支持 MediaRecorder 的浏览器。本站视频采用 MP4（H.264 / AAC），独立音频为 MP3。可下载整期音频离线收听；手机浏览器后台播放能力依设备而定。</p><a class="button primary" href="#/">返回学习 ${icon('arrow',18)}</a></main>${footer()}`;
}
function finishLesson() {
  if(recorder?.state==='recording'||recordingPending){toast('请先结束录音，并保存或导出需要保留的内容。');return;}
  const lesson=activeLesson;
  const course=courseForSegment(lesson);
  state.progress[lesson.id]={...state.progress[lesson.id],completed:true,step:3,line:currentLine};persist();
  cleanup();activeLesson=null;
  const items=courseSegments(course.id);
  const next=items[items.findIndex(item=>item.id===lesson.id)+1];
  app.innerHTML=`${header('learn',true,'#/course/'+course.id)}<main id="main" class="container completion" tabindex="-1"><span class="completion-check">${icon('check',40)}</span><div class="eyebrow">ONE MORE STEP FORWARD</div><h1>今天，多了一点表达的底气。</h1><p>你已标记完成片段「${lesson.title}」。<br>本期完成 ${courseProgress(course.id,state.progress).completed} / ${courseSegments(course.id).length} 段。<br>下次遇到相似情境，试着用上今天的表达。</p><div class="complete-expressions">${lesson.expressions.map(item=>`<span lang="en">${escape(item.phrase)}</span>`).join('')}</div><div class="complete-actions"><a class="button primary" href="${next?segmentUrl(next):'#/course/'+course.id}">${next?'下一个片段':'返回本期课程'} ${icon('arrow',18)}</a><button class="button secondary" data-action="again" data-id="${lesson.id}">再练一次</button></div><a class="text-link" href="#/saved">回顾我的收藏</a></main>${footer()}`;
  $('#main').focus();
}
function cleanup() {
  disconnectPodcast?.();disconnectPodcast=null;
  document.querySelectorAll('#podcast-player, #full-video-panel video').forEach(player=>{player.pause();player.removeAttribute('src');player.load();});
  recordingEpoch++;clipKey=null;stopRecording();comparePlaying=false;stopAudio();
  clearInterval(timer);clearTimeout(mediaWaitTimer);youtubeLoading=false;
  if(video){video.pause();if(video.isYouTube)video.destroy();else{video.removeAttribute('src');video.querySelector('source')?.removeAttribute('src');video.load();}video=null;}
  if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}currentBlob=null;
}
function route() {
  cleanup();routeEpoch++;
  const path=location.hash.replace(/^#\/?/,'').split('/');
  if(path[0]==='course') {
    const course=getCourse(path[1]);
    if(!course){renderHome();toast('找不到这期课程，已返回课程库。');}
    else if(path[2]==='segment'){
      const segment=courseSegments(course.id).find(item=>item.id===path[3]);
      if(segment)renderLesson(segment);else{filter='全部';renderCourse(course);toast('找不到这个学习片段，已返回本期目录。');}
    } else {filter='全部';renderCourse(course);}
  } else if(path[0]==='lesson') {
    const lesson=lessons.find(l=>l.id===path[1]);
    if(lesson) renderLesson(lesson); else {renderHome();toast('找不到这节课程，已返回素材库。');}
  } else if(path[0]==='saved')renderSaved();
  else if(path[0]==='me')renderMe();
  else if(path[0]==='about')renderAbout();
  else renderHome();
  window.scrollTo(0,0);$('#main')?.focus({preventScroll:true});
}
async function setStep(step) {
  if(recordingPending||recorder?.state==='recording'){toast('请先结束当前录音。');return;}
  video?.pause();stopAudio();comparePlaying=false;loop=false;
  currentStep=Math.max(0,Math.min(3,step));renderPanel();remember();
}
app.addEventListener('click',async event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='filter'){filter=button.dataset.value;const course=getCourse(location.hash.split('/')[2]);if(course)renderCourse(course);else renderHome();}
  else if(action==='step')setStep(Number(button.dataset.step));
  else if(action==='previous-step')setStep(currentStep-1);
  else if(action==='next-step'){if(currentStep===3)finishLesson();else setStep(currentStep+1);}
  else if(action==='again'){state.progress[button.dataset.id]={...state.progress[button.dataset.id],step:0,line:0};persist();const segment=lessons.find(item=>item.id===button.dataset.id);const target=segmentUrl(segment);if(location.hash===target)route();else location.hash=target;}
  else if(action==='play'){comparePlaying=false;if(video.paused)playFrom(currentStep===1?activeLesson.lines[currentLine].start:undefined);else video.pause();}
  else if(action==='restart'){comparePlaying=false;loop=false;playFrom(activeLesson.start);}
  else if(action==='line')chooseLine(Number(button.dataset.index));
  else if(action==='previous-line')chooseLine(currentLine-1);
  else if(action==='next-line')chooseLine(currentLine+1);
  else if(action==='loop'){loop=!loop;button.classList.toggle('enabled',loop);button.setAttribute('aria-pressed',String(loop));toast(loop?'单句循环已开启':'单句循环已关闭');}
  else if(action==='chinese'||action==='subtitles'){
    if(action==='chinese')chinese=!chinese;else subtitles=!subtitles;
    const enabled=action==='chinese'?chinese:subtitles;
    button.textContent=`${action==='chinese'?'中文':'英文'} ${enabled?'开':'关'}`;button.setAttribute('aria-pressed',String(enabled));renderTranscript();
  }
  else if(action==='follow')$('#transcript-lines .current')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  else if(action==='favorite'){
    state=toggleFavorite(state,button.dataset.key);persist();
    const saved=state.favorites.includes(button.dataset.key);
    button.classList.toggle('is-saved',saved);button.setAttribute('aria-pressed',String(saved));
    if(location.hash==='#/saved')renderSaved();else if(currentStep===1)button.innerHTML=`${icon('heart',17)} ${saved?'已收藏':'收藏这句'}`;
    toast(saved?'已加入收藏':'已取消收藏');
  }
  else if(action==='review'){
    state.progress[button.dataset.id]={...state.progress[button.dataset.id],step:Number(button.dataset.step),line:Number(button.dataset.index)};persist();
  }
  else if(action==='answer'){
    const correct=Number(button.dataset.index)===activeLesson.correct;
    $('.answer-options').querySelectorAll('button').forEach(item=>{item.classList.remove('correct','incorrect');item.setAttribute('aria-pressed',String(item===button));});
    button.classList.add(correct?'correct':'incorrect');$('#answer-feedback').textContent=correct?'理解正确！接下来，留意她的语气与节奏。':'再听一遍试试，或选择另一个答案。';
  }
  else if(action==='audio'){
    if(video.isYouTube){toast('当前使用 YouTube，请重新进入片段后切换本站音频。');return;}
    if(recordingPending||recorder?.state==='recording'){toast('请先结束录音。');return;}
    const enabled=button.getAttribute('aria-pressed')!=='true',playing=!video.paused;
    video.setSource(clipMedia(source,activeLesson,enabled));
    if(playing)playFrom();
    button.setAttribute('aria-pressed',String(enabled));button.querySelector('span').textContent=enabled?'返回视频':'专注音频';$('.video-shell').classList.toggle('audio-mode',enabled);$('.audio-cover').hidden=!enabled;
  }
  else if(action==='retry'){if(!video.isYouTube)video.load();$('#media-error').hidden=true;playFrom(activeLesson.lines[currentLine].start);}
  else if(action==='youtube')switchYouTube(button);
  else if(action==='copy-line')copyText(transcriptText(activeLesson,{english:subtitles,chinese,index:Number(button.dataset.index)}));
  else if(action==='copy-transcript')copyText(transcriptText(activeLesson,{english:subtitles,chinese}));
  else if(action==='show-pronunciation'){
    if(recordingPending||recorder?.state==='recording'){toast('请先停止当前录音。');return;}
    await chooseLine(Number(button.dataset.index),false);await setStep(1);
    $('#pronunciation-tips')?.scrollIntoView({block:'start',behavior:'smooth'});
  }
  else if(action==='pronunciation-play'){loop=false;comparePlaying=false;playFrom(activeLesson.lines[currentLine].start);}
  else if(action==='speak-example'){
    if(recordingPending||recorder?.state==='recording'){toast('请先停止录音，再朗读例句。');return;}
    if(speech.current===button.dataset.key){speech.stop();return;}
    video?.pause();comparePlaying=false;stopAudio();
    const index=Number(button.dataset.index),rate=Number(document.querySelector('[data-example-speed="'+index+'"]').value);
    if(!speech.speak(button.dataset.key,activeLesson.expressions[index].example,rate))toast('当前浏览器无法朗读，请尝试安装英语语音或换用 Safari / Chrome。');
  }
  else if(action==='full-video'){
    const panel=$('#full-video-panel'),course=getCourse(button.dataset.id),open=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(open));panel.hidden=!open;
    document.querySelector('#podcast-player')?.pause();
    panel.querySelector('video')?.pause();
    panel.innerHTML=open?'<video controls playsinline preload="metadata" aria-label="本期完整记者会" src="'+course.source.mediaRoot+'/full-720p.mp4"></video>':'';
  }
  else if(action==='full-audio'){
    const panel=$('#podcast-panel'),course=getCourse(button.dataset.id),open=button.getAttribute('aria-expanded')!=='true';
    button.setAttribute('aria-expanded',String(open));panel.hidden=!open;
    document.querySelector('#full-video-panel video')?.pause();
    disconnectPodcast?.();disconnectPodcast=null;
    $('#podcast-player')?.pause();
    panel.innerHTML=open?'<h2>随身听 · 第 '+course.number+' 期</h2><p>完整记者会原声 · 可下载 MP3 离线收听</p><audio id="podcast-player" controls preload="metadata" src="'+course.source.mediaRoot+'/full-audio.mp3"></audio><div class="podcast-controls"><button class="chip" data-action="podcast-seek" data-seconds="-15">后退 15 秒</button><button class="chip" data-action="podcast-seek" data-seconds="15">前进 15 秒</button><label class="podcast-speed"><span>语速</span><span class="podcast-speed-select"><select id="podcast-speed" aria-label="整期音频播放速度"><option value="0.75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></span></label></div><p class="muted">播放位置保存在本机；锁屏播放依设备支持。当前提供音频下载，尚未提供播客 RSS 订阅。</p>':'';
    if(open){
      const player=$('#podcast-player'),key='briefly-podcast-'+course.id;
      player.addEventListener('error',()=>toast('本站音频暂时不可用，请确认媒体文件已准备好。'));
      let storage;try{storage=localStorage;}catch{}
      disconnectPodcast=connectPodcast(player,key,{storage,session:navigator.mediaSession,Metadata:window.MediaMetadata});
      $('#podcast-speed').addEventListener('change',e=>player.playbackRate=Number(e.target.value));
    }
  }
  else if(action==='podcast-seek'){const player=$('#podcast-player');if(player&&Number.isFinite(player.duration))player.currentTime=Math.max(0,Math.min(player.duration,player.currentTime+Number(button.dataset.seconds)));}
  else if(action==='record')startRecording();
  else if(action==='play-recording'){comparePlaying=false;playRecording();}
  else if(action==='compare'){if(!currentBlob)return;loop=false;comparePlaying=true;await playFrom(activeLesson.lines[currentLine].start);}
  else if(action==='save-recording')saveCurrentRecording();
  else if(action==='download-recording'){if(currentBlob)downloadBlob(currentBlob,`briefly-${activeLesson.id}.${extension(currentBlob)}`);}
  else if(action==='delete-current-recording'){
    stopAudio();try{await deleteRecording(clipKey);}catch{toast('未能删除本机保存的录音，请在「我的」中重试。');return;}
    currentBlob=null;if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=null;renderRecorder();toast('录音已删除');
  }
  else if(action.startsWith('stored-')){
    try{
      const clip=(await allRecordings()).find(item=>item.id===button.dataset.key);if(!clip)return;
      if(action==='stored-play'){stopAudio();if(blobUrl)URL.revokeObjectURL(blobUrl);blobUrl=URL.createObjectURL(clip.blob);playRecording();}
      else if(action==='stored-download')downloadBlob(clip.blob,`briefly-${clip.lessonId}.${extension(clip.blob)}`);
      else if(action==='stored-delete'&&confirm('删除这条本机录音？此操作无法撤销。')){stopAudio();await deleteRecording(clip.id);renderMe();toast('录音已删除');}
    }catch{toast('本机录音操作失败，请重试。');}
  }
  else if(action==='clear-data'&&confirm('清除当前浏览器的学习进度、收藏和所有保存的录音？此操作无法撤销。')){
    try{stopAudio();await clearRecordings();localStorage.removeItem(STORAGE_KEY);state=emptyState();renderMe();toast('本机学习数据已清除');}catch{toast('清除未完成，请检查浏览器存储设置并重试。');}
  }
});
document.addEventListener('keydown',event=>{
  if(!activeLesson||event.altKey||event.ctrlKey||event.metaKey||event.shiftKey)return;
  const tab=event.target.closest('[role="tab"]');
  if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?3:(currentStep+(event.key==='ArrowRight'?1:3))%4;
    setStep(next);$(`#tab-${currentStep}`)?.focus();return;
  }
  if(event.target.closest('input,textarea,select,button,a,summary,[contenteditable="true"]'))return;
  if(recordingPending||recorder?.state==='recording')return;
  if(!window.getSelection()?.isCollapsed)return;
  if(event.code==='Space'){event.preventDefault();if(video.paused)playFrom();else video.pause();}
  else if(event.key==='ArrowLeft'){event.preventDefault();chooseLine(currentLine-1);}
  else if(event.key==='ArrowRight'){event.preventDefault();chooseLine(currentLine+1);}
  else if(event.key.toLowerCase()==='l'&&currentStep===1){event.preventDefault();$('[data-action="loop"]')?.click();}
});
window.addEventListener('hashchange',route);
document.querySelector('.skip').addEventListener('click',event=>{event.preventDefault();$('#main')?.focus();});
window.addEventListener('pagehide',cleanup);
route();
