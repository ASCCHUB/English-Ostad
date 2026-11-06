import {validateAssessment,assessmentRecommendation,assessmentPlacement} from '../startingAssessment.js';
import {lessonPreview} from '../lessonPreview.js';
import outline from './outline.json' with {type:'json'};
export const COURSE_VERSION=outline.version;
export const outlineLessons=outline.lessons;
// Where a lesson sits for the child: "Level 2 · Lesson 5 of 26" (numbers count within the level).
export function lessonPlace(index){const l=outline.lessons[index]||outline.lessons[0],inLevel=outline.lessons.filter(x=>x.level===l.level);return {level:l.level,number:inLevel.indexOf(l)+1,ofLevel:inLevel.length,total:outline.lessons.length,levels:new Set(outline.lessons.map(x=>x.level)).size};}
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function freshSession(){return {cursor:0,solved:[],first:{},tries:{},placed:[],dots:0,strokes:[],status:'active',round:0,history:[],listened:[],chosen:null,currentSolved:false};}
export function freshCourse(){return {version:COURSE_VERSION,revision:0,startIndex:0,liveReader:false,lessons:{},mastered:{},resume:null,placement:null};}
export function grade(session,meta){const checks=meta.tasks.filter(t=>t.stage==='check'),correct=checks.filter(t=>session.first[t.id]===true);return {correct:correct.length,total:checks.length,passed:checks.length===5&&correct.length>=4&&correct.some(t=>t.constructed)&&meta.requiredDomains.every(d=>correct.some(t=>t.domain===d))&&meta.requiredIds.every(id=>correct.some(t=>t.id===id))};}
const resetInput=s=>({...s,placed:[],dots:0,strokes:[],listened:[],chosen:null,currentSolved:false});
export function transition(session,event,meta,liveReader=false){
 const t=meta.tasks[session.cursor];if(!t||session.status==='completed')return session;
 if(event.taskId&&event.taskId!==t.id)return session;
 if(event.type==='RETRY'&&session.status==='retry'){const cursor=Math.max(0,meta.checkStart-2),keep=([id])=>!meta.tasks.some(t=>t.id===id&&t.stage==='check'),first=Object.fromEntries(Object.entries(session.first).filter(keep)),tries=Object.fromEntries(Object.entries(session.tries).filter(keep));return resetInput({...session,cursor,first,tries,solved:session.solved.slice(0,cursor),status:'active',round:session.round+1});}
 if(session.status!=='active')return session;
 if(event.type==='TRY_AGAIN'&&!session.currentSolved&&['choice','build'].includes(t.mode))return {...session,placed:[],chosen:null};
 if(event.type==='BACK'&&session.cursor>0){const cursor=Number.isInteger(event.cursor)&&event.cursor>=0&&event.cursor<session.cursor?event.cursor:session.cursor-1;return resetInput({...session,cursor,solved:session.solved.slice(0,cursor),reviewedThrough:Math.max(session.reviewedThrough||0,session.cursor)});}
 if(event.type==='HINT'&&t.stage==='check'&&!own(session.first,t.id))return {...session,first:{...session.first,[t.id]:false}};
 if(event.type==='DELIVERED'){if(event.source==='live_reader'&&!liveReader)return session;const allowed=[...t.clips,t.deliveryClip].filter(Boolean);if(!allowed.includes(event.id)||session.listened.includes(event.id))return session;return {...session,listened:[...session.listened,event.id]};}
 if(event.type==='PLACE'&&t.mode==='build'&&!session.currentSolved){if(!/^\d+$/.test(event.id)||Number(event.id)>=(t.pool||t.tokens).length||session.placed.includes(event.id))return session;return {...session,placed:[...session.placed,event.id]};}
 if(event.type==='UNDO'&&!session.currentSolved)return {...session,placed:session.placed.slice(0,-1)};
 if(event.type==='DOT'&&t.mode==='trace'&&event.index===session.dots&&session.dots<4)return {...session,dots:session.dots+1};
 if(event.type==='STROKE'&&t.mode==='trace'&&session.dots===4&&Array.isArray(event.points)&&event.points.length>1&&event.points.length<=500&&event.points.every(p=>Array.isArray(p)&&p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1) )&&event.points.slice(1).reduce((distance,p,i)=>distance+Math.hypot(p[0]-event.points[i][0],p[1]-event.points[i][1]),0)>=0.2){const count=Math.min(80,event.points.length),line=Array.from({length:count},(_,i)=>event.points[Math.round(i*(event.points.length-1)/(count-1))].map(n=>Math.round(n*1000)/1000));return {...session,strokes:[...session.strokes.slice(-5),line]};}
 if(event.type==='ANSWER'&&['choice','build'].includes(t.mode)&&!session.currentSolved){
  if(t.requiresDelivery&&!session.listened.includes(t.deliveryClip)||t.mode==='choice'&&t.clips.some(id=>!session.listened.includes(id)))return session;
  let correct;
  if(t.mode==='build'){if(session.placed.length!==t.tokens.length)return session;correct=session.placed.every((id,i)=>(t.pool||t.tokens)[Number(id)]===t.tokens[i]);}
  else{if(!t.options.includes(event.value))return session;correct=event.value===t.answer;}
  const first=own(session.first,t.id)?session.first:{...session.first,[t.id]:correct};
  return {...session,first,tries:{...session.tries,[t.id]:(session.tries[t.id]||0)+1},currentSolved:correct,chosen:t.mode==='choice'?event.value:null};
 }
 if(event.type==='NEXT'){
  const ready=['observe','read'].includes(t.mode)||t.mode==='celebrate'&&grade(session,meta).passed||['choice','build'].includes(t.mode)&&session.currentSolved||t.mode==='trace'&&(session.dots===4&&session.strokes.length>0)||['listen','blend','vocab'].includes(t.mode)&&t.clips.length>0&&t.clips.every(id=>session.listened.includes(id));
  if(!ready)return session;const cursor=session.cursor+1,next=resetInput({...session,cursor,solved:[...session.solved,t.id]});
  if(t.stage==='check'&&meta.tasks[cursor]?.stage!=='check'){const result=grade(next,meta);next.history=[...next.history.slice(-19),{...result,round:session.round}];if(!result.passed)next.status='retry';}
  if(cursor===meta.tasks.length){if(!grade(next,meta).passed)return session;next.status='completed';}
  return next;
 }
 return session;
}
export function isUnlocked(progress,index){return index>=0&&index<outline.lessons.length&&(lessonPreview||index<=progress.startIndex||!!progress.mastered[outline.lessons[index].id]||!!progress.mastered[outline.lessons[index-1].id]);}
export function continueIndex(progress){const resume=outline.lessons.findIndex(l=>l.id===progress.resume);if(resume>=0&&isUnlocked(progress,resume)&&progress.lessons[progress.resume]?.status!=='completed')return resume;const next=outline.lessons.findIndex((l,i)=>i>=progress.startIndex&&isUnlocked(progress,i)&&!progress.mastered[l.id]);return next<0?progress.startIndex:next;}
export function changeCourse(progress,index,event,answer){if(!isUnlocked(progress,index))return progress;const meta=outline.lessons[index],old=progress.lessons[meta.id]||freshSession();if(event.type==='REPLAY'&&progress.mastered[meta.id])return {...progress,revision:progress.revision+1,resume:meta.id,lessons:{...progress.lessons,[meta.id]:freshSession()}};const next=transition(old,{...event,answer},meta,progress.liveReader);return next===old?progress:{...progress,revision:progress.revision+1,resume:meta.id,lessons:{...progress.lessons,[meta.id]:next},mastered:next.status==='completed'?{...progress.mastered,[meta.id]:{first:Object.fromEntries(meta.tasks.filter(t=>t.stage==='check').map(t=>[t.id,next.first[t.id]])),taskCount:meta.tasks.length,promptMode:progress.liveReader?'live_reader':'recorded_or_device'}}:progress.mastered};}
// Progress saved under an earlier course version: finished lessons that still exist stay finished
// (their check answers carry over), lessons in progress start again, and a placement start is kept.
function migrateCourse(input){
 const out={...freshCourse(),revision:Number.isSafeInteger(input.revision)?input.revision:0,liveReader:input.liveReader===true};
 for(const [id,c] of Object.entries(input.mastered&&typeof input.mastered==='object'?input.mastered:{})){const meta=outline.lessons.find(l=>l.id===id),checks=meta?.tasks.filter(t=>t.stage==='check').map(t=>t.id)||[];if(!meta||!c?.first||Object.keys(c.first).length!==5||!Object.keys(c.first).every(k=>checks.includes(k)))continue;const kept={first:{...c.first},taskCount:meta.tasks.length,promptMode:['live_reader','recorded_or_device'].includes(c.promptMode)?c.promptMode:'recorded_or_device'};if(grade(kept,meta).passed)out.mastered[id]=kept;}
 const p=input.placement;if(p&&Number.isSafeInteger(p.level)&&(p.level>=2||p.source==='starting-check'&&p.level===1)&&p.level<=5){const start=outline.lessons.findIndex(l=>l.level===p.level);if(start>=0){out.placement=p;out.startIndex=start;}}
 if(outline.lessons.some(l=>l.id===input.resume))out.resume=input.resume;
 return out;
}
// Lessons before the starting point are open but "skipped by test": never counted as completed (no stars or badges).
export function skippedByTest(progress,index){return !!progress.placement&&index<progress.startIndex&&!progress.mastered[outline.lessons[index]?.id];}
// A grown-up changes the starting lesson (parent area). The starting-check result stays for the summary.
export function setStartingLesson(progress,startIndex,now=new Date().toISOString()){
 if(!Number.isSafeInteger(startIndex)||startIndex<0||startIndex>=outline.lessons.length)return progress;
 const assessment=progress.placement?.assessment;
 return {...progress,revision:progress.revision+1,startIndex,resume:outline.lessons[startIndex].id,placement:{source:'parent',startIndex,level:outline.lessons[startIndex].level,date:now,...(assessment?{assessment}:{})}};
}
export function validateCourse(input){
 if(input===undefined)return freshCourse();
 if(input&&typeof input==='object'&&typeof input.version==='string'&&input.version!==COURSE_VERSION&&input.version.startsWith('first-steps-'))input=migrateCourse(input);
 const fail=()=>{throw Error('Invalid First Steps progress');},object=o=>o&&typeof o==='object'&&!Array.isArray(o),int=(n,max=100000)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 if(!object(input)||input.version!==COURSE_VERSION||!int(input.revision,Number.MAX_SAFE_INTEGER)||!int(input.startIndex,outline.lessons.length-1)||typeof input.liveReader!=='boolean'||!object(input.lessons)||Object.keys(input.lessons).length>outline.lessons.length||!object(input.mastered)||Object.keys(input.mastered).length>outline.lessons.length||input.resume!==null&&!outline.lessons.some(l=>l.id===input.resume))fail();
 const output={...freshCourse(),revision:input.revision,startIndex:input.startIndex,liveReader:input.liveReader,resume:input.resume};
 for(const [id,c] of Object.entries(input.mastered)){const meta=outline.lessons.find(l=>l.id===id);if(!meta||!object(c)||!object(c.first)||Object.keys(c.first).length!==5||c.taskCount!==meta.tasks.length||!['live_reader','recorded_or_device'].includes(c.promptMode)||!grade(c,meta).passed||Object.entries(c.first).some(([k,v])=>!meta.tasks.some(t=>t.stage==='check'&&t.id===k)||typeof v!=='boolean'))fail();output.mastered[id]={first:{...c.first},taskCount:c.taskCount,promptMode:c.promptMode};}
 for(const [id,s] of Object.entries(input.lessons)){
  const meta=outline.lessons.find(l=>l.id===id);if(!meta||!object(s)||!int(s.cursor,meta.tasks.length)||!Array.isArray(s.solved)||s.solved.length!==s.cursor||s.solved.some((v,i)=>v!==meta.tasks[i].id)||!['active','retry','completed'].includes(s.status)||!int(s.round)||!object(s.first)||!object(s.tries)||typeof s.currentSolved!=='boolean'||!Array.isArray(s.placed)||new Set(s.placed).size!==s.placed.length||!int(s.dots,4)||!Array.isArray(s.strokes)||s.strokes.length>20||!Array.isArray(s.listened)||s.listened.length>100||!s.listened.every(v=>typeof v==='string')||!Array.isArray(s.history)||s.history.length>20)fail();
  for(const [k,v] of Object.entries(s.first))if(!meta.tasks.some(t=>t.id===k)||typeof v!=='boolean')fail();
  for(const [k,v] of Object.entries(s.tries))if(!meta.tasks.some(t=>t.id===k)||!int(v))fail();
  if(s.strokes.some(line=>!Array.isArray(line)||line.length>500||line.some(p=>!Array.isArray(p)||p.length!==2||p.some(n=>!Number.isFinite(n)||n<0||n>1))))fail();
  const current=meta.tasks[s.cursor];if(s.placed.some(v=>typeof v!=='string'||!/^\d+$/.test(v)||!current?.tokens||Number(v)>=(current.pool||current.tokens).length))fail();
  const clips=current?[...current.clips,current.deliveryClip].filter(Boolean):[];
  if(new Set(s.listened).size!==s.listened.length||s.listened.some(id=>!clips.includes(id))||s.chosen!==null&&s.chosen!==undefined&&(typeof s.chosen!=='string'||!current?.options?.includes(s.chosen)))fail();
  if(meta.tasks.slice(0,s.cursor).some(t=>t.stage==='check'&&typeof s.first[t.id]!=='boolean')||Object.keys(s.first).some(id=>meta.tasks.findIndex(t=>t.id===id)>Math.max(s.cursor,Number.isInteger(s.reviewedThrough)&&s.reviewedThrough<meta.tasks.length?s.reviewedThrough:0)&&meta.tasks.find(t=>t.id===id)?.stage==='check'))fail();
  if(s.currentSolved&&(!current||!['choice','build'].includes(current.mode)||current.mode==='choice'&&s.chosen!==current.answer||current.mode==='build'&&(s.placed.length!==current.tokens.length||s.placed.some((id,i)=>(current.pool||current.tokens)[Number(id)]!==current.tokens[i]))))fail();
  if(s.status==='completed'&&(s.cursor!==meta.tasks.length||!grade(s,meta).passed)||s.status!=='completed'&&!current||s.status==='retry'&&(current?.stage!=='celebration'||grade(s,meta).passed))fail();
  if(s.history.some(h=>!object(h)||!int(h.correct,5)||h.total!==5||typeof h.passed!=='boolean'||!int(h.round)))fail();
  output.lessons[id]={...(Number.isInteger(s.reviewedThrough)&&s.reviewedThrough>=0&&s.reviewedThrough<meta.tasks.length?{reviewedThrough:s.reviewedThrough}:{}),cursor:s.cursor,solved:[...s.solved],first:{...s.first},tries:{...s.tries},placed:[...s.placed],dots:s.dots,strokes:s.strokes.map(l=>l.map(p=>[...p])),status:s.status,round:s.round,history:s.history.map(h=>({correct:h.correct,total:5,passed:h.passed,round:h.round})),listened:[...s.listened],chosen:s.chosen??null,currentSolved:s.currentSolved};
 }
 // A grown-up chose the starting lesson (parent area); the check's result, if any, is kept for the summary.
 if(input.placement?.source==='parent'){
  const p=input.placement;if(!int(p.startIndex,outline.lessons.length-1)||input.startIndex!==p.startIndex||typeof p.date!=='string'||!Number.isFinite(Date.parse(p.date)))fail();
  let check=null;try{check=p.assessment?validateAssessment(p.assessment):null;}catch{check=null;}
  output.placement={source:'parent',startIndex:p.startIndex,level:outline.lessons[p.startIndex].level,date:p.date,...(check&&check.status!=='intro'?{assessment:check}:{})};
 }else if(input.placement?.source==='starting-check'&&input.placement.assessment?.version==='starting-check-1'){
  // A first-version check: keep the child's starting lesson as if a grown-up chose it.
  output.placement={source:'parent',startIndex:input.startIndex,level:outline.lessons[input.startIndex].level,date:input.placement.date||new Date(0).toISOString()};
 }else if(input.placement?.source==='starting-check'){
  const check=validateAssessment(input.placement.assessment),r=assessmentRecommendation(check);
  if(input.placement.level!==r.level||input.startIndex!==r.startIndex||input.placement.date!==check.completedAt)fail();
  output.placement=assessmentPlacement(check);
 }else if(input.placement!==null){const p=input.placement;if(!object(p)||!int(p.level,5)||p.level<2||!Array.isArray(p.scores)||p.scores.length!==p.level-1||p.scores.some((s,i)=>!object(s)||s.level!==i+1||!int(s.correct,5)||s.correct<4||s.constructed!==true)||typeof p.date!=='string'||!Number.isFinite(Date.parse(p.date)))fail();const expected=outline.lessons.findIndex(l=>l.level===p.level);if(input.startIndex!==expected)fail();output.placement={level:p.level,scores:p.scores.map(s=>({level:s.level,correct:s.correct,constructed:true})),date:p.date};}else if(input.startIndex!==0)fail();
 // A parent can move the starting point backwards. Preserve later checkpoints
 // while their lessons are locked; saved work itself never unlocks a lesson.
 return output;
}
