import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const course=JSON.parse(await readFile(new URL('./curriculum.json',import.meta.url),'utf8'));
const audio=JSON.parse(await readFile(new URL('./audio-manifest.json',import.meta.url),'utf8'));
assert.equal(course.phase,1);assert.equal(course.implementationAuthorised,false);assert.equal(course.approval.phase2MayStart,false);
const ids=course.lessons.map(l=>l.id),order=id=>ids.indexOf(id),words=new Map(course.lexicon.map(w=>[w.id,w])),gpcs=new Map(course.graphemePhonemeCorrespondences.map(g=>[g.id,g]));
assert.equal(new Set(ids).size,ids.length);assert.equal(course.levels.length,5);
for(const level of course.levels){const inUnits=level.units.flatMap(u=>u.lessonIds);assert.deepEqual(inUnits,course.lessons.filter(l=>l.level===level.number).map(l=>l.id));assert.ok(level.units.every(u=>u.title));}
for(const l of course.lessons){
 assert.equal(l.objectives.length,1,l.id);assert.equal(l.objectives[0],l.goal);assert.equal(l.review.status,'pending_review');
 assert.ok(l.prerequisiteLessonIds.every(d=>order(d)>=0&&order(d)<order(l.id)),l.id);
 assert.ok(new Set(l.activities.map(a=>a.type)).size>=3,l.id);
 assert.ok(l.activities.every((a,i)=>!i||a.type!==l.activities[i-1].type),l.id);
 assert.equal(l.assessment.items.length,5,l.id);assert.equal(l.assessment.minimumPercent,80);assert.equal(l.assessment.requirePracticeComplete,true);assert.equal(l.assessment.requireConstructedResponse,true);assert.equal(l.assessment.scoreFirstResponseOnly,true);assert.equal(l.assessment.watchingAloneUnlocks,false);
 assert.ok(l.assessment.items.some(q=>q.constructed));
 for(const t of [...l.content.sentences,...(l.content.story?.sentences||[]),...l.content.dialogue.flat()].flatMap(s=>s.match(/[A-Za-z]+/g)||[])){const w=words.get(t.toLowerCase());assert.ok(w,`${l.id}: unknown word ${t}`);assert.ok(order(w.introducedAt)<=order(l.id),`${l.id}: forward word ${t}`);}
}
for(const w of words.values()){
 assert.equal(w.review.status,'pending_review');assert.ok(order(w.introducedAt)>=0);
 if(w.category!=='decodable')continue;
 let spelling='',end='';for(const id of w.segments){const g=gpcs.get(id);assert.ok(g,`${w.id}: unknown GPC ${id}`);assert.ok(order(g.introducedAt)<=order(w.introducedAt),`${w.id}: future GPC ${id}`);if(g.spelling.includes('_')){const p=g.spelling.split('_');spelling+=p[0];end=p[1];}else spelling+=g.spelling;}
 assert.equal(spelling+end,w.id,`GPC assembly ${w.id}`);
}
const recordingIds=new Set(audio.recordings.map(a=>a.id));assert.equal(recordingIds.size,audio.recordings.length);
for(const a of audio.recordings){assert.equal(a.file,null);assert.equal(a.recordingStatus,'pending_recording');assert.equal(a.review.status,'pending_review');}
function references(value){if(!value||typeof value!=='object')return;for(const [key,v] of Object.entries(value)){if(/(?:audioIds?|recordingId|soundId|nameClip|soundClip|wordAudio|wholeWord|sentenceClip|introAudio)$/i.test(key)){for(const id of [].concat(v||[]))if(typeof id==='string')assert.ok(recordingIds.has(id),`${key}: missing ${id}`);}if(v&&typeof v==='object')references(v);}}
references(course);
assert.equal(course.sampleLessons.length,5);
for(const sample of course.sampleLessons){const l=course.lessons.find(l=>l.id===sample.lessonId);assert.ok(l);assert.ok(sample.totalSeconds>=300&&sample.totalSeconds<=480);assert.ok(new Set(sample.steps.map(s=>s.type)).size>=3);for(const step of sample.steps){assert.ok(step.instruction.ps);for(const line of step.englishOnScreen){if(line.includes('_'))continue;for(const token of line.match(/[A-Za-z]+/g)||[]){const w=words.get(token.toLowerCase());if(token.length===1||gpcs.has(token))continue;assert.ok(w,`${sample.lessonId}: unknown sample token ${token}`);assert.ok(order(w.introducedAt)<=order(l.id),`${sample.lessonId}: future sample token ${token}`);}}}}
assert.ok(course.designAudit.passed);
console.log(`Phase 1 design audit passed: ${course.levels.length} levels, ${ids.length} lessons, ${words.size} word entries, ${course.sampleLessons.length} complete sample lessons, ${recordingIds.size} pending recordings. Native linguistic/phonetic review remains required; this is not an app acceptance test.`);
