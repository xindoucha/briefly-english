import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,lessons,courseSegments,courseProgress,courseForSegment,segmentUrl} from '../src/data.js';
import {getPronunciation} from '../src/pronunciation.js';
import {transcriptText} from '../src/transcript.js';
import {readState} from '../src/storage.js';
import {chooseEnglishVoice,createSpeechController} from '../src/speech.js';

test('each course owns chronological segments and uses its own video source',()=>{
  for(const course of courses){
    const items=courseSegments(course.id);
    assert.ok(items.length>=8);
    assert.ok(course.source.videoId);
    items.forEach((segment,index)=>{
      assert.equal(courseForSegment(segment),course);
      assert.equal(segment.number,String(index+1).padStart(2,'0'));
      assert.ok(segment.end<=course.durationSeconds);
      if(index)assert.ok(segment.start>=items[index-1].end);
      assert.equal(segmentUrl(segment),`#/course/${course.id}/segment/${segment.id}`);
    });
  }
});
test('legacy favorites and progress survive the hierarchy change without renaming keys',()=>{
  const legacy={favorites:['opening:line:3','invitation:expression:1','update:line:2'],progress:{opening:{step:1,line:3,completed:true},update:{step:2,line:1}},last:'update'};
  const state=readState({getItem:()=>JSON.stringify(legacy)});
  assert.deepEqual(state,legacy);
  for(const key of state.favorites){
    const [id,type,index]=key.split(':');const segment=lessons.find(item=>item.id===id);
    assert.ok(type==='line'?segment.lines[index]:segment.expressions[index]);
  }
  assert.deepEqual(courseProgress(courses[0].id,state.progress),{total:8,completed:1,percent:13});
  assert.deepEqual(courseProgress('unknown',{ghost:{completed:true}}),{total:0,completed:0,percent:0});
});
test('every subtitle has explicit pronunciation guidance without claiming audio verification',()=>{
  for(const segment of lessons)segment.lines.forEach((line,index)=>{
    const notes=getPronunciation(segment,index);assert.ok(notes.length);
    for(const note of notes){
      assert.ok(note.type&&note.phrase&&note.heard&&note.why&&note.practice);
      assert.equal(note.status,'pattern');
    }
  });
});
test('copying subtitles respects visible languages and a single line selection',()=>{
  const segment=lessons[0];
  assert.equal(transcriptText(segment,{index:0}),segment.lines[0].en);
  assert.equal(transcriptText(segment,{english:false,chinese:true,index:0}),segment.lines[0].zh);
  assert.equal(transcriptText(segment,{chinese:true,index:0}),segment.lines[0].en+'\n'+segment.lines[0].zh);
  assert.equal(transcriptText(segment,{english:false,chinese:false}),'');
  assert.equal(transcriptText(segment,{index:999}),'');
  assert.equal(transcriptText(segment).split('\n\n').length,segment.lines.length);
});
test('American English voices take priority while English fallback stays available',()=>{
  const uk={lang:'en-GB',localService:true},usOnline={lang:'en-US',localService:false},usLocal={lang:'en-US',localService:true};
  assert.equal(chooseEnglishVoice([uk,usOnline,usLocal]),usLocal);
  assert.equal(chooseEnglishVoice([uk,usOnline]),usOnline);
  assert.equal(chooseEnglishVoice([{lang:'zh-CN'},uk]),uk);
  assert.equal(chooseEnglishVoice([]),null);
});
function fakeSpeech(){
  const queue=[],events=[];
  const engine={cancelCount:0,cancel(){this.cancelCount++;},getVoices(){return[{lang:'en-US',localService:true}];},speak(utterance){queue.push(utterance);}};
  class Utterance{constructor(text){this.text=text;}}
  const controller=createSpeechController({engine,Utterance,onChange:(key,error)=>events.push({key,error})});
  return{engine,queue,events,controller};
}
test('starting a new example cancels the old one; stale end events do not stop the new example',()=>{
  const {engine,queue,controller}=fakeSpeech();
  assert.equal(controller.speak('a','First example.',.8),true);
  assert.equal(queue[0].rate,.8);assert.equal(queue[0].lang,'en-US');
  controller.speak('b','Second example.');
  assert.equal(engine.cancelCount,2);assert.equal(controller.current,'b');
  queue[0].onend();assert.equal(controller.current,'b');
  queue[1].onend();assert.equal(controller.current,null);
});
test('stopping or a synthesis failure clears the active state',()=>{
  const {controller,queue,events}=fakeSpeech();
  controller.speak('a','An example.');controller.stop();queue[0].onend();assert.equal(controller.current,null);
  controller.speak('b','Another example.');queue[1].onerror({error:'voice-unavailable'});
  assert.deepEqual(events.at(-1),{key:null,error:'voice-unavailable'});
  const unavailable=createSpeechController({engine:null,Utterance:null});
  assert.equal(unavailable.supported,false);assert.equal(unavailable.speak('x','Test.'),false);
});
