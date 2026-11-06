import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCourse,buildOutline} from '../../scripts/build-first-steps.mjs';
// The approved Phase 1 curriculum is the single source of truth for the First Steps course.
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
const app=name=>JSON.parse(readFileSync(new URL(`./firstSteps/${name}`,import.meta.url),'utf8'));
const curriculum=JSON.parse(readFileSync(new URL('../../docs/beginner-course-phase1/curriculum.json',import.meta.url),'utf8'));
test('the app course data is built from the approved curriculum, unchanged',async()=>{
 assert.deepEqual(sorted(app('course.json')),sorted(buildCourse()),'course.json differs: run node scripts/build-first-steps.mjs');
 assert.deepEqual(sorted(app('outline.json')),sorted(await buildOutline()),'outline.json differs: run node scripts/build-first-steps.mjs');
});
test('lesson order, sound order and word lists follow the approved curriculum',()=>{
 const course=app('course.json');
 assert.deepEqual(course.lessons.map(l=>l.id),curriculum.lessons.map(l=>l.id));
 assert.deepEqual(course.gpcs.map(g=>g.id),curriculum.graphemePhonemeCorrespondences.map(g=>g.id));
 assert.deepEqual(course.words.map(w=>w.id),curriculum.lexicon.map(w=>w.id));
 assert.deepEqual(curriculum.soundIntroductionOrder.slice(0,5),['s','a','t','p','i']);
});
test('every English and Pashto entry in the approved curriculum stays pending review with sign-off fields',()=>{
 let entries=0;
 const walk=x=>{if(Array.isArray(x))x.forEach(walk);else if(x&&typeof x==='object'){if(x.review&&typeof x.review==='object'&&'status' in x.review){entries++;assert.equal(x.review.status,'pending_review');for(const role of ['english','pashto','phonics'])assert.ok(role in x.review&&'reviewer' in x.review[role]&&'signedAt' in x.review[role]);}Object.values(x).forEach(walk);}};
 walk(curriculum.lessons);walk(curriculum.lexicon);
 assert.ok(entries>1000,`${entries} review records`);
});
