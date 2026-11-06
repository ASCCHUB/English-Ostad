import test from 'node:test';
import assert from 'node:assert/strict';
import {course,lessons,taskTiles,taskOptions,recordings} from './firstSteps/tasks.js';
import {freshCourse,freshSession,outlineLessons,changeCourse,validateCourse,isUnlocked,continueIndex,grade} from './firstSteps/state.js';
import {mergeCourseProfile} from './firstSteps/profile.js';
import {freshProfile} from './engine.js';
import {persistCourse,hydrateCourse} from './firstSteps/store.js';
import {sceneFor} from './firstSteps/scenes.js';
import {placementParts} from './firstSteps/placement.js';
import {transition} from './firstSteps/state.js';
function step(p,i,e){const task=lessons[i].tasks[(p.lessons[lessons[i].id]||freshSession()).cursor];return changeCourse(p,i,{...e,taskId:task?.id});}
function solve(p,i,{wrong=false}={}){
 const id=lessons[i].id;let session=p.lessons[id]||freshSession(),task=lessons[i].tasks[session.cursor],meta=outlineLessons[i].tasks[session.cursor];
 for(const clip of [...meta.clips,meta.requiresDelivery?meta.deliveryClip:null].filter(Boolean))p=step(p,i,{type:'DELIVERED',id:clip,source:'audio'});
 if(task.mode==='choice'){
  if(wrong){const other=task.options.find(o=>o.id!==task.answer);p=step(p,i,{type:'ANSWER',value:other.id,answer:other.id});}
  p=step(p,i,{type:'ANSWER',value:task.answer});
 }else if(task.mode==='build'){
  for(let n=0;n<task.tokens.length;n++)p=step(p,i,{type:'PLACE',id:String(n)});
  if(wrong)p=step(p,i,{type:'HINT'});
  p=step(p,i,{type:'ANSWER'});
 }else if(task.mode==='trace'){for(let n=0;n<4;n++)p=step(p,i,{type:'DOT',index:n});p=step(p,i,{type:'STROKE',points:[[0.3,0.3],[0.5,0.6],[0.7,0.8]]});}
 p=step(p,i,{type:'NEXT'});return p;
}
test('every lesson and task can complete cumulatively, preserving valid checkpoints',()=>{
 let p=freshCourse();let count=0;
 for(let i=0;i<lessons.length;i++){assert.ok(isUnlocked(p,i));let guard=0;while(p.lessons[lessons[i].id]?.status!=='completed'){assert.ok(guard++<80,lessons[i].id);p=solve(p,i);p=validateCourse(JSON.parse(JSON.stringify(p)));count++;}assert.ok(p.mastered[lessons[i].id]);if(i+1<79)assert.ok(isUnlocked(p,i+1));}
 assert.equal(count,lessons.reduce((n,l)=>n+l.tasks.length,0));assert.equal(Object.keys(p.mastered).length,lessons.length);
});
test('progress saved under the previous course version keeps finished lessons and restarts lessons in progress',()=>{
 let p=freshCourse();for(let i=0;i<2;i++)while(p.lessons[lessons[i].id]?.status!=='completed')p=solve(p,i);
 p=solve(p,2);const old={...JSON.parse(JSON.stringify(p)),version:'first-steps-2026-10-26-v1'};
 for(const m of Object.values(old.mastered))m.taskCount=1;
 const migrated=validateCourse(old);
 assert.deepEqual(Object.keys(migrated.mastered).sort(),[lessons[0].id,lessons[1].id].sort());assert.equal(migrated.mastered[lessons[0].id].taskCount,lessons[0].tasks.length);
 assert.deepEqual(migrated.lessons,{});assert.ok(isUnlocked(migrated,2));assert.ok(!isUnlocked(migrated,3));
});
test('every phrase, sentence, story and check answer uses only words taught by then',async()=>{
 const {execFileSync}=await import('node:child_process');assert.match(execFileSync(process.execPath,['scripts/audit-taught-words.mjs'],{encoding:'utf8'}),/uses only taught words/);
});
test('watching, Continue spam, undelivered sound prompts and forged answer payloads cannot unlock',()=>{
 // Watch-only steps (the intro, reading direction) may move on; the first step that needs listening stops Continue spam.
 let p=freshCourse();for(let i=0;i<lessons[0].tasks.length&&!lessons[0].tasks[p.lessons['L1-01']?.cursor||0].requiredClips?.length;i++)p=step(p,0,{type:'NEXT'});const before=p;p=step(p,0,{type:'NEXT'});assert.equal(p,before);assert.equal(isUnlocked(p,1),false);
 const check=lessons[0].tasks.find(t=>t.stage==='check'&&t.mode==='choice'),meta=outlineLessons[0],cursor=lessons[0].tasks.indexOf(check);let s={...freshSession(),cursor,solved:meta.tasks.slice(0,cursor).map(t=>t.id)};
 p={...freshCourse(),lessons:{[meta.id]:s}};assert.equal(step(p,0,{type:'ANSWER',value:check.answer}),p);
 p=step(p,0,{type:'DELIVERED',id:check.cue.audioId,source:'audio'});const wrong=check.options.find(o=>o.id!==check.answer).id;p=step(p,0,{type:'ANSWER',value:wrong,answer:wrong});assert.equal(p.lessons[meta.id].first[check.id],false);
});
test('first wrong answers and help remain wrong for scoring; a retry uses a fresh round',()=>{
 let p=freshCourse();let guard=0;while(p.lessons[lessons[0].id]?.status!=='retry'){assert.ok(guard++<60);const s=p.lessons[lessons[0].id]||freshSession(),t=lessons[0].tasks[s.cursor];p=solve(p,0,{wrong:t.stage==='check'});}
 assert.equal(isUnlocked(p,1),false);assert.equal(grade(p.lessons[lessons[0].id],outlineLessons[0]).correct,0);p=step(p,0,{type:'RETRY'});assert.equal(p.lessons[lessons[0].id].round,1);for(const t of lessons[0].tasks.filter(t=>t.stage==='check'))assert.equal(p.lessons[lessons[0].id].tries[t.id],undefined,'Fresh checks must not reveal old modeled answers.');
 while(p.lessons[lessons[0].id].status!=='completed')p=solve(p,0);assert.equal(isUnlocked(p,1),true);
});
test('resume restores the same activity, selected tiles and first attempt after an interruption',()=>{
 let p=freshCourse();while(lessons[0].tasks[(p.lessons[lessons[0].id]||freshSession()).cursor].mode!=='build')p=solve(p,0);
 p=step(p,0,{type:'PLACE',id:'0'});const s=p.lessons[lessons[0].id],restored=validateCourse(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.lessons[lessons[0].id].placed,['0']);assert.equal(restored.lessons[lessons[0].id].cursor,s.cursor);assert.equal(continueIndex(restored),0);
 const oldTask=lessons[0].tasks[s.cursor].id;p=solve({...p,lessons:{...p.lessons,[lessons[0].id]:{...s,placed:[]}}},0);const next=changeCourse(p,0,{type:'NEXT',taskId:oldTask});assert.equal(next,p);
});
test('mastery points are awarded once, replay keeps later lessons unlocked, profiles stay separate',()=>{
 let p=freshCourse();while(p.lessons[lessons[0].id]?.status!=='completed')p=solve(p,0);const base=freshProfile('A'),other=freshProfile('B'),one=mergeCourseProfile(base,p);assert.equal(one.xp,10);assert.equal(mergeCourseProfile(one,p).xp,10);assert.equal(other.firstSteps,undefined);
 p=changeCourse(p,0,{type:'REPLAY'});assert.ok(isUnlocked(p,1));assert.ok(p.mastered[lessons[0].id]);assert.equal(p.lessons[lessons[0].id].cursor,0);assert.equal(mergeCourseProfile(one,p).xp,10);assert.doesNotThrow(()=>validateCourse(p));
});
test('backup validation rejects skipped work, forged completion, invalid tiles and corrupt placement',()=>{
 for(const mutation of [p=>p.startIndex=32,p=>p.lessons.bad=freshSession(),p=>p.lessons['L1-01']={...freshSession(),status:'completed'},p=>p.lessons['L1-01']={...freshSession(),placed:['999']},p=>p.mastered['L1-01']={first:{},taskCount:1,promptMode:'recorded_or_device'}]){const p=freshCourse();mutation(p);assert.throws(()=>validateCourse(p));}
});
test('choice positions and unique tile identities are stable per attempt and change between rounds',()=>{
 for(const task of lessons[0].tasks.filter(t=>!t.options&&!t.tokens)){assert.deepEqual(taskOptions(task,'empty'),[]);assert.deepEqual(taskTiles(task,'empty'),[]);}
 const task=lessons[2].tasks.find(t=>t.mode==='choice'&&t.options.length>2);assert.deepEqual(taskOptions(task,'a'),taskOptions(task,'a'));const variants=new Set(Array.from({length:8},(_,i)=>JSON.stringify(taskOptions(task,String(i)))));assert.ok(variants.size>1);
 for(const l of lessons)for(const t of l.tasks){if(t.mode==='build'){const tiles=taskTiles(t,'x');assert.equal(new Set(tiles.map(t=>t.id)).size,tiles.length);assert.ok(t.pool.length>=t.tokens.length);}if(t.mode==='choice')assert.equal(t.options.filter(o=>o.id===t.answer).length,1);}
});
test('all assessment sound/name targets, required recordings and instruction scripts are configured',()=>{
 for(const l of lessons){const checks=l.tasks.filter(t=>t.stage==='check');assert.equal(checks.length,5);assert.ok(checks.some(t=>t.constructed));for(const t of l.tasks){assert.ok(t.instructionPs);for(const id of [...(t.requiredClips||[]),t.cue?.audioId].filter(Boolean))assert.ok(recordings[id],l.id+':'+id);}}
 assert.equal(course.reviewStatus,'pending_review');assert.ok(Object.values(recordings).every(r=>r.file===null&&r.status==='pending_recording'));
});
test('live-reader receipts require the parent preference; pictures introduce oral names before scoring',()=>{
 let p=freshCourse();p=solve(p,0);while(!lessons[0].tasks[p.lessons['L1-01'].cursor].requiredClips?.length)p=solve(p,0);const task=lessons[0].tasks[p.lessons['L1-01'].cursor],id=task.requiredClips[0];assert.equal(step(p,0,{type:'DELIVERED',id,source:'live_reader'}),p);p={...p,liveReader:true};p=step(p,0,{type:'DELIVERED',id,source:'live_reader'});assert.ok(p.lessons['L1-01'].listened.includes(id));
 const picture=lessons[0].tasks.find(t=>t.stage==='check'&&t.options?.some(o=>o.picture));assert.equal(picture.preClips.length,3);assert.equal(new Set(picture.options.map(o=>o.picture)).size,3);
});
test('sentence scenes carry the intended subject, feeling, object and location',()=>{
 assert.equal(sceneFor('This is my mum.').people[0].id,'mum');assert.equal(sceneFor('I like apples.').object,'apples');assert.equal(sceneFor('I like apples.').action,'like');assert.equal(sceneFor('The ball is in the box.').place,'box');assert.equal(sceneFor('Ali is sad.').feeling,'sad');assert.equal(sceneFor('We go to school.').people.length,2);
});
test('checkpoint writes are synchronous and isolated even when IndexedDB is unavailable',async()=>{
 const saved=globalThis.localStorage,entries=new Map();globalThis.localStorage={setItem:(k,v)=>entries.set(k,v),getItem:k=>entries.get(k)||null};
 try{let p=step(freshCourse(),0,{type:'NEXT'});const promise=persistCourse('child-a',p);assert.equal(hydrateCourse({id:'child-a'}).revision,p.revision);assert.equal(hydrateCourse({id:'child-b'}).revision,0);await promise.catch(()=>{});globalThis.localStorage.setItem=()=>{throw Error('quota');};assert.throws(()=>persistCourse('child-a',p),/quota/);assert.equal(hydrateCourse({id:'child-a'}).revision,p.revision);}finally{globalThis.localStorage=saved;}
});
test('placement checks cover every preceding level and grant access without invented mastery',()=>{
 for(const level of [2,3,4,5]){const parts=placementParts(level);assert.equal(parts.length,level-1);const scores=[];
  for(const part of parts){let s=freshSession();for(const t of part.lesson.tasks){const m=part.meta.tasks[s.cursor],act=e=>{s=transition(s,{...e,taskId:t.id},part.meta,true);};for(const id of [m.deliveryClip,...m.clips].filter(Boolean))act({type:'DELIVERED',id,source:'live_reader'});if(t.mode==='choice')act({type:'ANSWER',value:t.answer});if(t.mode==='build'){for(let i=0;i<t.tokens.length;i++)act({type:'PLACE',id:String(i)});act({type:'ANSWER'});}act({type:'NEXT'});}assert.equal(s.status,'completed',part.lesson.id);const result=grade(s,part.meta);assert.ok(result.passed);scores.push({level:part.level,correct:result.correct,constructed:true});}
  const index=lessons.findIndex(l=>l.level===level),p=validateCourse({...freshCourse(),startIndex:index,placement:{level,scores,date:'2026-10-26T00:00:00.000Z'}});assert.ok(isUnlocked(p,index));assert.equal(isUnlocked(p,index+1),false);assert.equal(Object.keys(p.mastered).length,0);assert.equal(continueIndex(p),index);
 }
});
test('sentence conventions assess capitals, spaces and full stops without premature punctuation grading',()=>{
 const lesson=lessons.find(l=>l.assessmentKind==='sentence_conventions'),checks=lesson.tasks.filter(t=>t.stage==='check');assert.equal(checks.length,5);assert.ok(checks.some(t=>t.constructed));assert.ok(checks.some(t=>t.options?.some(o=>o.text==='I likeapples.')));assert.ok(checks.some(t=>t.options?.some(o=>o.text==='this is a cat.')));assert.ok(checks.some(t=>t.options?.some(o=>o.text==='This is a cat')));
 const early=lessons.find(l=>l.id==='L4-03').tasks.find(t=>t.mode==='build');assert.equal(early.autoPunctuation,'.');assert.ok(!early.tokens.includes('.'));const later=lesson.tasks.find(t=>t.mode==='build');assert.ok(later.tokens.includes('.'));
});
test('every task in a lesson has its own id (progress is saved by task id)',()=>{
 for(const l of lessons){const ids=l.tasks.map(t=>t.id);assert.equal(new Set(ids).size,ids.length,l.id);}
});

test('back restores a previous activity without losing scores or mastery',()=>{const meta=outlineLessons[0];const s={...freshSession(),cursor:3,first:{[meta.tasks[1].id]:false},tries:{[meta.tasks[1].id]:2},placed:['0'],currentSolved:true};const back=transition(s,{type:'BACK',cursor:1},meta);assert.equal(back.cursor,1);assert.deepEqual(back.first,s.first);assert.deepEqual(back.tries,s.tries);assert.deepEqual(back.placed,[]);assert.equal(back.currentSolved,false);assert.equal(transition(freshSession(),{type:'BACK'},meta).cursor,0);});

test('back checkpoints retain later first attempts through save and resume',()=>{let p=freshCourse();const l=lessons[0];for(let n=0;n<l.tasks.length&&((p.lessons[l.id]||freshSession()).cursor<l.checkStart+2);n++)p=solve(p,0);const before=p.lessons[l.id];p=changeCourse(p,0,{type:'BACK',cursor:Math.max(0,l.checkStart-1)});const restored=validateCourse(p);assert.equal(restored.lessons[l.id].cursor,Math.max(0,l.checkStart-1));assert.deepEqual(restored.lessons[l.id].first,before.first);});

test('tracing requires ordered dots followed by drawing before Next',()=>{const index=outlineLessons.findIndex(l=>l.tasks.some(t=>t.mode==='trace')),meta=outlineLessons[index],cursor=meta.tasks.findIndex(t=>t.mode==='trace');let s={...freshSession(),cursor};const draw={type:'STROKE',points:[[0.3,0.3],[0.5,0.6],[0.7,0.8]]};assert.equal(transition(s,draw,meta),s);assert.equal(transition(s,{type:'DOT',index:2},meta),s);for(let n=0;n<4;n++)s=transition(s,{type:'DOT',index:n},meta);assert.equal(transition(s,{type:'NEXT'},meta),s);assert.equal(transition(s,{type:'STROKE',points:[[0.5,0.5],[0.501,0.501]]},meta),s);s=transition(s,draw,meta);assert.equal(s.strokes.length,1);assert.equal(transition(s,{type:'NEXT'},meta).cursor,cursor+1);});

test('tapping retry feedback clears the draft but preserves the question, audio and attempts',()=>{const meta=outlineLessons.find(l=>l.tasks.some(t=>t.mode==='build')),cursor=meta.tasks.findIndex(t=>t.mode==='build'),t=meta.tasks[cursor];const s={...freshSession(),cursor,placed:['0','1'],chosen:'wrong',first:{[t.id]:false},tries:{[t.id]:2},listened:['heard']};const next=transition(s,{type:'TRY_AGAIN'},meta);assert.equal(next.cursor,cursor);assert.deepEqual(next.placed,[]);assert.equal(next.chosen,null);assert.deepEqual(next.first,s.first);assert.deepEqual(next.tries,s.tries);assert.deepEqual(next.listened,s.listened);assert.equal(transition({...s,currentSolved:true},{type:'TRY_AGAIN'},meta).currentSolved,true);});
