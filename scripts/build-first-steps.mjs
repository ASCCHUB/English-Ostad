// Builds the app's First Steps data from the approved Phase 1 curriculum, which stays the single
// source of truth: docs/beginner-course-phase1/curriculum.json and audio-manifest.json.
//   src/ustad/firstSteps/course.json   lessons, words, sounds and audio entries the app needs
//   src/ustad/firstSteps/outline.json  the task list each lesson's progress is checked against
// Planning-only fields (objectives, reviewer sign-off, durations) stay in the curriculum file.
// Usage: node scripts/build-first-steps.mjs          rebuild both files
//        node scripts/build-first-steps.mjs --check  fail if the app files differ from the curriculum
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),read=async p=>JSON.parse(await readFile(new URL(p,root),'utf8'));
const curriculum=await read('docs/beginner-course-phase1/curriculum.json'),manifest=await read('docs/beginner-course-phase1/audio-manifest.json');
const VERSION='first-steps-2026-10-27-v2';
export function buildCourse(){
 return {
  version:VERSION,reviewStatus:curriculum.status,
  levels:curriculum.levels.map(l=>({number:l.number,title:l.title,units:l.units.map(u=>({id:u.id,lessonIds:u.lessonIds,title:u.title}))})),
  alphabet:curriculum.alphabetDisplay,words:curriculum.lexicon,gpcs:curriculum.graphemePhonemeCorrespondences,
  lessons:curriculum.lessons.map(({objectives,prerequisiteLessonIds,prerequisiteSkills,durationMinutes,review,focus,...lesson})=>({...lesson,activities:lesson.activities.map(({englishAudioIds,review,...activity})=>activity)})),
  audio:manifest.recordings.map(r=>({id:r.id,language:r.language,text:r.text,kind:r.kind,recordingNotes:r.recordingNotes,...(r.artistCue?{artistCue:r.artistCue}:{}),...(r.wordId?{wordId:r.wordId}:{}),file:r.file,alignment:r.alignmentFile,status:r.recordingStatus}))
 };
}
// The outline is compiled from the lessons by the app's own task builder (tasks.js).
export async function buildOutline(){
 const {lessons,words}=await import(new URL('src/ustad/firstSteps/tasks.js',root));wordAudio=id=>words[id]?.audioId;
 // Level 5's outcome is building a sentence independently, so its sentence-building check must be correct.
 const requiredIds=l=>l.level===5?l.tasks.filter(t=>t.stage==='check'&&t.domain==='sentence').map(t=>t.id):[];
 return {version:VERSION,lessons:lessons.map(l=>({id:l.id,level:l.level,checkStart:l.checkStart,requiredDomains:l.assessment.requiredCorrectDomains||[],requiredIds:requiredIds(l),tasks:l.tasks.map(outlineTask)}))};
}
let wordAudio=()=>null;
function outlineTask(t){
 const out={id:t.id,mode:t.mode,stage:t.stage,constructed:t.constructed,domain:t.domain,answer:t.answer};
 if(t.tokens)out.tokens=t.tokens;if(t.pool)out.pool=t.pool;if(t.options)out.options=t.options.map(o=>o.id);
 out.requiresDelivery=!!t.cue?.requiresDelivery;if(t.cue&&'audioId' in t.cue||out.requiresDelivery)out.deliveryClip=t.cue?.audioId??null;
 // Clips the learner must hear before moving on (blend: each sound, then the word; picture choices: each option).
 out.clips=t.mode==='blend'?[...t.requiredClips,wordAudio(t.wordId)].filter(Boolean):t.requiredClips||t.preClips||[];
 return out;
}
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
const same=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
if(import.meta.url===`file:///${process.argv[1].replaceAll('\\','/').replace(/^\//,'')}`||process.argv[1]?.endsWith('build-first-steps.mjs')){
 const course=buildCourse(),coursePath=new URL('src/ustad/firstSteps/course.json',root),outlinePath=new URL('src/ustad/firstSteps/outline.json',root);
 if(process.argv.includes('--check')){
  const problems=[];
  if(!same(course,JSON.parse(await readFile(coursePath,'utf8'))))problems.push('course.json');
  if(!same(await buildOutline(),JSON.parse(await readFile(outlinePath,'utf8'))))problems.push('outline.json');
  if(problems.length){console.error(`${problems.join(' and ')} no longer match the approved curriculum. Run: node scripts/build-first-steps.mjs`);process.exit(1);}
  console.log('course.json and outline.json match the approved Phase 1 curriculum.');
 }else{
  await writeFile(coursePath,JSON.stringify(course));
  await writeFile(outlinePath,JSON.stringify(await buildOutline()));
  console.log(`Built First Steps data: ${course.lessons.length} lessons, ${course.words.length} words, ${course.audio.length} audio entries.`);
 }
}
