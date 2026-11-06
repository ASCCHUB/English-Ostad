import test from 'node:test';
import assert from 'node:assert/strict';
import {assessmentSkills,assessmentQuestions,assessmentQuestion,instructionFor,assessmentOptions,startAssessment,skipAssessment,submitAssessment,validateAssessment,assessmentRecommendation,assessmentPlacement} from './startingAssessment.js';
import {freshCourse,validateCourse,outlineLessons,isUnlocked,skippedByTest,setStartingLesson} from './firstSteps/state.js';
import {wordPhoto} from './wordPhotos.js';
import course from './firstSteps/course.json' with {type:'json'};
const date='2026-10-28T07:00:00.000Z';
// Answer every question of the first `passing` skills correctly, then everything wrong.
function run(passing){let s=startAssessment(date);while(s.status==='active'){const q=assessmentQuestion(s),skill=Math.floor(s.answers.length/3);s=submitAssessment(s,skill<passing?q.answer:'',date);}return s;}
const firstOfGroup=id=>course.levels.flatMap(l=>l.units).find(u=>u.id===id).lessonIds[0];
test('every question works for a non-reader: picture, spoken English, English and Pashto instruction, tap to answer',()=>{
 for(const q of assessmentQuestions){
  const ins=instructionFor(q);assert.ok(ins.en&&ins.ps,q.id);
  assert.ok(q.picture||q.kind==='sentence'||q.kind==='story',q.id);
  if(q.picture)assert.ok(wordPhoto(q.picture),`${q.id}: picture ${q.picture}`);
  if(['onset','hear'].includes(q.kind))assert.ok(q.word,`${q.id} speaks its word`);
  if(q.kind==='story')assert.ok(q.question&&q.questionPs,q.id);
  if(['sentence','story'].includes(q.kind))for(const o of q.options)assert.ok(wordPhoto(o),`${q.id}: picture answer ${o}`);
  assert.equal(q.options.length,3);assert.equal(q.options.filter(o=>o===q.answer).length,1,q.id);
 }
});
test('letter SOUNDS are tested (first sound of a spoken picture word), not only letter names',()=>{
 const sounds=assessmentSkills.slice(0,3).flatMap(s=>s.questions);
 assert.ok(sounds.length>=9&&sounds.every(q=>q.kind==='onset'&&q.word.startsWith(q.answer)));
});
test('each skill has at least 3 questions, and answer positions vary',()=>{
 for(const s of assessmentSkills)assert.ok(s.questions.length>=3,s.id);
 const positions=new Set(assessmentQuestions.map(q=>assessmentOptions(q,'learner-1').indexOf(q.answer)));
 assert.ok(positions.size>=3,'the right answer appears in different places');
 for(const q of assessmentQuestions)assert.deepEqual([...assessmentOptions(q,'x')].sort(),[...q.options].sort());
});
test('stops early when the first answers are mostly wrong and starts at Level 1 Lesson 1',()=>{
 const s=run(0),r=assessmentRecommendation(s);
 assert.ok(s.answers.length<=5);assert.equal(r.startIndex,0);assert.equal(r.lessonId,'L1-01');
 // 1 of the first 5 right: still the very beginning.
 let t=startAssessment(date);for(const a of ['', '', assessmentQuestions[2].answer])t=submitAssessment(t,a,date);
 assert.equal(t.status,'completed');assert.equal(assessmentRecommendation(t).startIndex,0);
});
test('places the child at the start of the last group they passed (one group before the first gap)',()=>{
 for(let passing=1;passing<=assessmentSkills.length;passing++){
  const s=run(passing),r=assessmentRecommendation(s),expected=firstOfGroup(assessmentSkills[passing-1].startGroup);
  assert.equal(r.lessonId,expected,`passing ${passing} skills`);assert.equal(outlineLessons[r.startIndex].id,expected);
  assert.equal(s.answers.length,Math.min(assessmentQuestions.length,(passing+1)*3));
 }
});
test('lessons before the start are open and "skipped by test", never completed',()=>{
 const s=run(4),r=assessmentRecommendation(s);
 const progress=validateCourse({...freshCourse(),revision:1,startIndex:r.startIndex,resume:r.lessonId,placement:assessmentPlacement(s)});
 assert.equal(Object.keys(progress.mastered).length,0);
 for(let i=0;i<r.startIndex;i++){assert.ok(isUnlocked(progress,i));assert.ok(skippedByTest(progress,i));}
 assert.equal(skippedByTest(progress,r.startIndex),false);assert.equal(isUnlocked(progress,r.startIndex+1),false);
});
test('a grown-up can change the starting lesson; the check result is kept',()=>{
 const s=run(2),placed=validateCourse({...freshCourse(),revision:1,startIndex:assessmentRecommendation(s).startIndex,resume:assessmentRecommendation(s).lessonId,placement:assessmentPlacement(s)});
 const moved=validateCourse(setStartingLesson(placed,40,date));
 assert.equal(moved.startIndex,40);assert.equal(moved.placement.source,'parent');assert.equal(moved.placement.assessment.status,'completed');
 assert.ok(isUnlocked(moved,40)&&skippedByTest(moved,39));
 const back=validateCourse(setStartingLesson(moved,0,date));assert.equal(back.startIndex,0);
});
test('saved checks validate; skipping starts at Lesson 1; a first-version result is replaced by a fresh check',()=>{
 const s=run(3);assert.deepEqual(validateAssessment(JSON.parse(JSON.stringify(s))),s);
 assert.equal(assessmentRecommendation(skipAssessment(date)).startIndex,0);
 assert.equal(validateAssessment({version:'starting-check-1',status:'completed',answers:['a'],draft:'',startedAt:date,completedAt:date}).status,'intro');
 assert.throws(()=>submitAssessment(startAssessment(date),'not an option'));
});
