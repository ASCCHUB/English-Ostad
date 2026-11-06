import {validateAssessment} from './startingAssessment.js';
import {validateCourse} from './firstSteps/state.js';
import {validateFoxLessons} from './foxLessonModel.js';
import {validateLearning} from './studyValidation.js';
import {validateAdventure} from './adventureSettings.js';
import {validateAdult} from './adultPractice.js';
export const freshProfile = (name='Little Explorer')=>({id:globalThis.crypto?.randomUUID?.()||String(Date.now()),name,level:'Little Learner',xp:0,completed:[],results:[],words:{},days:[],minutes:0});
export function recordWord(profile,id,correct,now=Date.now(),mode='practice') {
 const old=profile.words[id]||{correct:0,attempts:0};
 const next={correct:old.correct+(correct?1:0),attempts:old.attempts+1,due:now+(correct?Math.min(7,old.correct+1):0.1)*86400000};
 const stat=profile.skillStats?.[mode]||{correct:0,attempts:0};
 return {...profile,words:{...profile.words,[id]:next},skillStats:{...profile.skillStats,[mode]:{correct:stat.correct+(correct?1:0),attempts:stat.attempts+1}}};
}
export function skillAccuracy(profile,mode){const stat=profile.skillStats?.[mode];return stat?.attempts?Math.round(stat.correct/stat.attempts*100):null;}
export function seededRandom(seed){let state=2166136261;for(const c of seed)state=Math.imul(state^c.charCodeAt(0),16777619);return ()=>{state=(Math.imul(1664525,state)+1013904223)|0;return (state>>>0)/4294967296;};}
export function wordStage(word){return !word?'New':word.correct>=5?'Confident':word.correct>=2?'Practicing':'Learning';}
export function scoreAnswers(answers){return answers.filter(Boolean).length;}
export function streak(days,today=new Date()){let count=0;const d=new Date(today);if(!days.includes(d.toLocaleDateString('en-CA')))d.setDate(d.getDate()-1);while(days.includes(d.toLocaleDateString('en-CA'))){count++;d.setDate(d.getDate()-1);}return count;}
export function shuffle(items, random=Math.random) {
  const copy=[...items];
  for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
  return copy;
}
export function makeQuiz(items,mode='picture',count=5,random=Math.random){
  const unique=[...new Map(items.map(w=>[w.id,w])).values()];
  return shuffle(unique,random).slice(0,count).map(w=>({word:w,mode,options:shuffle([w,...shuffle(unique.filter(x=>x.id!==w.id),random).slice(0,2)],random)}));
}

export const LEVELS=['Little Learner','Beginner','Young Explorer'];
export function practicePool(words,profile,review=false,now=Date.now()) {
  const limit=profile.level==='Little Learner'?4:profile.level==='Beginner'?6:Infinity;
  const suitable=words.filter(w=>w.en.length<=limit);
  if(!review)return suitable;
  const due=words.filter(w=>profile.words[w.id]?.due<=now).sort((a,b)=>profile.words[a.id].due-profile.words[b.id].due);
  // Keep even one due word in a review; fill the rest with suitable words.
  return [...due,...suitable.filter(w=>!due.some(d=>d.id===w.id))];
}
export function makePractice(items,{mode='picture',profile,count=5,review=false,random=Math.random,now=Date.now()}={}) {
  const pool=practicePool(items,profile,review,now);
  const due=review?pool.filter(w=>profile.words[w.id]?.due<=now):[];
  const picked=[...due.slice(0,count),...shuffle(pool.filter(w=>!due.includes(w)),random)].slice(0,count);
  return picked.map(w=>{
    const base={word:w,mode,answer:w.en};
    if(mode==='order')return {...base,tiles:shuffle([...w.en.toLowerCase()].map((label,id)=>({id,label})),random),answer:w.en.toLowerCase()};
    if(mode==='letter'){
      const answer=w.en[0].toUpperCase();
      return {...base,answer,options:shuffle([answer,...shuffle([...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter(l=>l!==answer),random).slice(0,2)],random)};
    }
    if(mode==='missing'){
      const position=Math.floor(random()*w.en.length),answer=w.en[position].toLowerCase();
      return {...base,answer,prompt:w.en.slice(0,position)+'_'+w.en.slice(position+1),options:shuffle([answer,...shuffle([...'abcdefghijklmnopqrstuvwxyz'].filter(l=>l!==answer),random).slice(0,2)],random)};
    }
    return {...base,options:shuffle([w.en,...shuffle(pool.filter(o=>o.id!==w.id),random).slice(0,2).map(o=>o.en)],random)};
  });
}
export function completeActivity(profile,id,now=new Date()) {
  const date=now.toLocaleDateString('en-CA');
  const log=profile.activityLog||[];
  return {...profile,xp:profile.xp+(profile.completed.includes(id)?0:10),completed:[...new Set([...profile.completed,id])],
    activityLog:log.some(a=>a.id===id&&a.date===date)?log:[...log,{id,date}],days:[...new Set([...profile.days,date])]};
}
export function accuracy(results,mode) {
  const selected=results.filter(r=>!mode||r.mode===mode);
  const total=selected.reduce((n,r)=>n+r.total,0);
  return total?Math.round(selected.reduce((n,r)=>n+r.score,0)/total*100):null;
}

// Copy only known fields. Never trust a backup just because JSON.parse succeeds.
export function validateSaved(input) {
  const fail=()=>{throw new Error('Invalid progress backup');};
  const integer=(n)=>Number.isSafeInteger(n)&&n>=0;
  const list=(a)=>Array.isArray(a)&&a.length<=20000;
  const object=(o)=>o&&typeof o==='object'&&!Array.isArray(o);
  if(!object(input)||!Array.isArray(input.profiles)||input.profiles.length<1||input.profiles.length>20)fail();
  const profiles=input.profiles.map(p=>{
    if(!object(p)||typeof p.id!=='string'||!p.id||typeof p.name!=='string'||!p.name.trim()||p.name.length>30||!LEVELS.includes(p.level)||!integer(p.xp)||!list(p.completed)||!p.completed.every(x=>typeof x==='string')||!list(p.days)||!p.days.every(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x))||!object(p.words)||!list(p.results))fail();
    const wordEntries=Object.entries(p.words);
    if(wordEntries.length>5000)fail();
    const words=Object.fromEntries(wordEntries.map(([id,w])=>{
      if(!/^word-\d+$/.test(id)||!object(w)||!integer(w.correct)||!integer(w.attempts)||w.correct>w.attempts||!Number.isFinite(w.due)||w.due<0)fail();
      return [id,{correct:w.correct,attempts:w.attempts,due:w.due}];
    }));
    const results=p.results.map(r=>{
      if(!object(r)||typeof r.date!=='string'||!Number.isFinite(Date.parse(r.date))||typeof r.mode!=='string'||!integer(r.score)||!integer(r.total)||r.total<1||r.score>r.total||!list(r.review)||!r.review.every(x=>typeof x==='string'))fail();
      return {date:r.date,mode:r.mode,score:r.score,total:r.total,review:r.review};
    });
    const activityLog=p.activityLog||[];
    if(!list(activityLog)||!activityLog.every(a=>object(a)&&typeof a.id==='string'&&typeof a.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(a.date)))fail();
    const skillStats={};
    if(p.skillStats!==undefined){if(!object(p.skillStats))fail();for(const [key,stat] of Object.entries(p.skillStats)){if(!['practice','spelling','order','audio','picture','missing'].includes(key)||!object(stat)||!integer(stat.correct)||!integer(stat.attempts)||stat.correct>stat.attempts)fail();skillStats[key]={correct:stat.correct,attempts:stat.attempts};}}
    const resume=['alphabet','phonics','vocabulary','spelling','reading','writing','speaking','grammar','stories','sentences','word-families'].includes(p.resume)?p.resume:'alphabet';
    const resumeLimit=({vocabulary:1000,spelling:1000,alphabet:26,writing:26,sentences:21,'word-families':8,reading:12}[resume]||100);
    return {startingAssessment:validateAssessment(p.startingAssessment),firstSteps:validateCourse(p.firstSteps),foxLessons:validateFoxLessons(p.foxLessons),adult:validateAdult(p.adult),adventure:validateAdventure(p.adventure),learning:validateLearning(p.learning),id:p.id,name:p.name.trim(),level:p.level,xp:p.xp,completed:[...p.completed],days:[...p.days],words,results,skillStats,activityLog:activityLog.map(a=>({id:a.id,date:a.date})),minutes:Number.isFinite(p.minutes)&&p.minutes>=0?p.minutes:0,resume,resumeIndex:integer(p.resumeIndex)&&p.resumeIndex<resumeLimit?p.resumeIndex:0};
  });
  if(new Set(profiles.map(p=>p.id)).size!==profiles.length)fail();
  return {profiles,active:integer(input.active)&&input.active<profiles.length?input.active:0,language:['en','ps','rps','ur','rur','all'].includes(input.language)?input.language:'ps',goal:[2,3,5,7].includes(input.goal)?input.goal:3};
}
