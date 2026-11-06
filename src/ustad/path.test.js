import test from 'node:test';
import assert from 'node:assert/strict';
import {pathLessons,pathState,currentLesson,canOpen,earnedBadges,learnedSoFar,resumeStep} from './pathModel.js';
import {pathUiText,beginnerPathText} from './pathCopy.js';
import {support} from './supportCopy.js';
import {logAdventure,validateAdventure,defaultAdventure} from './adventureEngine.js';
import {freshProfile,validateSaved} from './engine.js';
import {classes} from './adventureContent.js';
import {outlineLessons} from './firstSteps/state.js';
const learner=(patch={})=>{const p=freshProfile('Sara');return {...p,adventure:{...defaultAdventure,events:{},...patch}};};
const finish=(p,lesson,needsReview=false)=>logAdventure(p,'path-'+lesson.id,{attempts:needsReview?3:1,needsReview});
test('the path starts with friends and letters, covers every class and ends each class with a review',()=>{
 assert.deepEqual(pathLessons.slice(0,5).map(l=>l.id),['meet-friends','letter-a','letter-b','letter-c','review-abc']);
 assert.equal(new Set(pathLessons.map(l=>l.id)).size,pathLessons.length);
 for(let i=0;i<classes.length;i++){const list=pathLessons.filter(l=>l.classIndex===i);assert.ok(list.length>=3);assert.equal(list.at(-1).kind,'review');}
 for(const l of pathLessons){assert.ok(l.activities.length>=3&&l.activities.length<=6,l.id);assert.ok(l.learned);for(let i=1;i<l.activities.length;i++)if(l.activities[i].type===l.activities[i-1].type&&l.activities[i].type!=='quiz')assert.fail(`${l.id} repeats ${l.activities[i].type}`);}
 assert.deepEqual(pathLessons[1].activities.map(a=>a.type),['watch','quiz','listen','match','trace','quiz']);
});
test('every question has one correct answer and tiles rebuild the answer',()=>{
 for(const l of pathLessons)for(const a of l.activities){
  for(const q of a.questions||[]){if(a.tiles)assert.equal(q.options.join(a.join).split('').sort().join(''),q.answer.split('').sort().join(''),l.id);else assert.equal(q.options.filter(o=>o===q.answer).length,1,`${l.id}: ${q.prompt}`);}
  if(a.pairs)assert.equal(new Set(a.pairs.map(p=>p[1])).size,a.pairs.length,l.id);
  if(a.type==='listen')for(const w of a.words)assert.ok(a.choices.includes(w));
 }
});
test('old Classes 1–4 are open extra practice; Class 5 waits for the course, then unlocks in order',()=>{
 const first5=pathLessons.findIndex(l=>l.classIndex===4);
 let p=learner(),state=pathState(p);
 assert.ok(state.slice(0,first5).every(l=>l.status==='open'&&l.extra),'old Class 1–4 lessons are extra practice');
 assert.ok(state.slice(first5).every(l=>l.status==='later'),'Class 5 onward waits for the 110-lesson course');assert.equal(canOpen(state[first5]),false);
 p={...p,firstSteps:{mastered:Object.fromEntries(outlineLessons.map(l=>[l.id,{}]))}};state=pathState(p);
 assert.deepEqual(state.slice(first5,first5+3).map(l=>l.status),['current','next','later']);
 p=finish(p,pathLessons[first5]);state=pathState(p);
 assert.deepEqual(state.slice(first5,first5+3).map(l=>l.status),['done','current','next']);
 assert.equal(currentLesson(p).id,pathLessons[first5+1].id);assert.equal(learnedSoFar(p)[0],pathLessons[first5].learned);
 p=finish(p,pathLessons[0]);assert.equal(earnedBadges(p)[0].name,'First Steps');
 assert.ok(canOpen(pathState(p)[0]),'completed lessons stay available for replay');
});
test('grown-ups choose the starting class or unlock every lesson',()=>{
 const start=learner({classIndex:5}),first=pathLessons.find(l=>l.classIndex===5);
 assert.equal(currentLesson(start).id,first.id);assert.equal(pathState(start)[0].status,'open');
 assert.ok(pathState(learner({unlockAll:true})).every(canOpen));
});
test('tricky lessons are flagged for extra practice, and spaced recall brings earlier questions back',()=>{
 const p=finish(learner(),pathLessons[0],true);assert.equal(pathState(p)[0].practice,true);
 assert.ok(pathLessons.filter(l=>l.kind==='core').slice(2).some(l=>l.activities.some(a=>a.questions?.some(q=>q.remember))));
});
test('the resume point is validated, survives backup and falls back for another lesson',()=>{
 const lesson=pathLessons[1],p=learner({pathResume:{lesson:lesson.id,step:3}});
 assert.equal(resumeStep(p,lesson),3);assert.equal(resumeStep(p,pathLessons[2]),0);
 const restored=validateSaved(JSON.parse(JSON.stringify({profiles:[p],active:0,language:'ps',goal:3}))).profiles[0];
 assert.deepEqual(restored.adventure.pathResume,{lesson:lesson.id,step:3});
 for(const bad of [{lesson:'Bad Id',step:1},{lesson:'letter-a',step:-1},{lesson:'letter-a',step:1.5},'letter-a'])assert.throws(()=>validateAdventure({...defaultAdventure,pathResume:bad}));
 assert.throws(()=>validateAdventure({...defaultAdventure,unlockAll:'yes'}));
});
test('every lesson in every class, including advanced ideas, examples, questions and hints, has all support languages',()=>{
 for(const l of pathLessons)for(const a of l.activities)for(const text of [a.text,...(a.points||[]),...(a.examples||[]),...(a.questions||[]).flatMap(q=>[q.prompt,q.hint])].filter(Boolean)){const item=support(text);assert.ok(item,`${l.id}: ${text}`);for(const k of ['ps','rps','ur','rur'])assert.ok(item[k],`${text}: ${k}`);}
});
test('counters, level labels and · separated labels are translated with their numbers',()=>{
 assert.equal(support('STEP 2 OF 6').ur,'مرحلہ 2 / 6');assert.equal(support('0 of 3 pairs found').ur,'3 میں سے 0 جوڑے مل گئے');
 assert.equal(support('CLASS 7 · INTERMEDIATE · B1').ur,'کلاس 7 · درمیانہ درجہ · B1');assert.ok(support('▶ Animate the scene'));assert.ok(support('BIG ADVENTURES. LITTLE STEPS.'));
 assert.equal(support('Totally unknown words here'),null);
});
test('every beginner path instruction, question, summary and teaser has all support languages',()=>{
 for(const text of [...pathUiText,...beginnerPathText()].filter(t=>!/^\d+$/.test(t))){const item=support(text);assert.ok(item,`missing: ${text}`);for(const k of ['ps','rps','ur','rur'])assert.ok(item[k],`${text}: ${k}`);}
});
