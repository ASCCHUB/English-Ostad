import {useEffect,useRef} from 'react';
import WordPicture from './WordPicture.jsx';
import {Bi} from './firstSteps/Bilingual.jsx';
import {sayWord} from './firstSteps/audio.js';
import {pathClasses} from './learningPath.js';
import {freshAssessment,startAssessment,skipAssessment,assessmentQuestion,assessmentQuestions,assessmentSkills,skillOf,instructionFor,assessmentRecommendation,assessmentOptions,submitAssessment} from './startingAssessment.js';
import './startingAssessment.css';
// Where a lesson sits in the one path: "Class 2 · Lesson 5".
export function classLesson(lessonId){const c=pathClasses.find(x=>x.lessonIds?.includes(lessonId));return c?{classNumber:c.number,lesson:c.lessonIds.indexOf(lessonId)+1,en:c.en,ps:c.ps}:null;}
export function StartingAssessmentEntry({profile,go}){
 return <section className="starting-entry quick-exam-entry" data-no-support><button className="secondary quick-exam-button" onClick={()=>go('level-check')}><Bi en="Quick exam" ps="خپل انګلش امتحان واخلئ"/></button></section>;
}
export default function StartingAssessment({profile,onSave,onFinish,go}){
 const state=profile.startingAssessment||freshAssessment(),locked=useRef(false),heading=useRef(null);
 const question=assessmentQuestion(state);
 useEffect(()=>{locked.current=false;heading.current?.focus();
  // The word (or the story question) is spoken once by itself; the Listen button repeats it.
  if(question){const text=question.word||question.question;if(text){const t=setTimeout(()=>sayWord(text),350);return()=>clearTimeout(t);}}
 },[state.answers.length,state.status]);// eslint-disable-line react-hooks/exhaustive-deps
 function answer(response){if(locked.current||state.status!=='active')return;locked.current=true;const next=submitAssessment(state,response);if(next.status==='completed')onFinish(next);else onSave(next);}
 if(state.status==='intro')return <section className="starting-check" data-no-support>
  <h1 ref={heading} tabIndex={-1}><Bi en="Quick exam" ps="خپل انګلش امتحان واخلئ"/></h1>
  <Bi as="p" en="Listen, look at the pictures and tap. This quick check helps choose your starting lesson." ps="واورئ، تصویرونه وګورئ او ګوته کېږدئ. دا لنډ مشق ستاسو د شروع سبق معلوموي."/>
  <Bi as="p" en="A grown-up may explain, but should not give the answers." ps="یو مشر کولی شي چې لارښوونه وکړي، خو جوابونه دې نه ورښيي."/>
  <div className="button-row"><button className="primary" onClick={()=>onSave(startAssessment())}><Bi en="Start" ps="شروع یې کړئ"/></button><button className="secondary" onClick={()=>onFinish(skipAssessment())}><Bi en="I’m new: start from Lesson 1" ps="زه نوی یم: له اول سبق نه شروع کوم"/></button><button className="text-button" onClick={()=>go('home')}><Bi en="Not now" ps="اوس نه"/></button></div>
 </section>;
 if(['completed','skipped'].includes(state.status)){
  const r=assessmentRecommendation(state),place=classLesson(r.lessonId);
  return <section className="starting-check" data-no-support><h1 ref={heading} tabIndex={-1}><Bi en="Your starting point" ps="ستاسو د شروع ځای"/></h1>
   <p className="starting-result"><Bi en={`Class ${place.classNumber} · Lesson ${place.lesson}`} ps={`ټولګی ${place.classNumber} · سبق ${place.lesson}`}/></p>
   {r.stoppedEarly&&<Bi as="p" en="We stopped early and will start from the very beginning, step by step." ps="مونږ ژر ودرېدو او له بالکل شروع نه به قدم په قدم پیل کوو."/>}
   {r.startIndex>0&&<Bi as="p" en="Lessons before this are open and marked “skipped by test”. They do not count as completed." ps="له دې نه مخکې سبقونه پرانیستي دي او «د ازموینې له مخې پرېښودل شوي» لیکل شوي. مکمل نه ګڼل کېږي."/>}
   {state.status==='completed'&&<ul className="starting-skills">{r.results.map(x=>{const s=assessmentSkills.find(k=>k.id===x.skill);return <li key={x.skill}><span aria-hidden="true">{x.passed?'✓':'•'}</span> <Bi en={`${s.en}: ${x.correct} of 3`} ps={`${s.ps}: ${x.correct} له ۳`}/></li>;})}</ul>}
   <div className="button-row"><button className="primary" onClick={()=>go('beginner-lesson',r.startIndex)}><Bi en="Open my lesson" ps="زما سبق پرانیزئ"/></button><button className="secondary" onClick={()=>onSave(startAssessment())}><Bi en="Check again" ps="بیا یې وګورئ"/></button><button className="text-button" onClick={()=>go('home')}><Bi en="Home" ps="کور"/></button></div></section>;
 }
 const skill=skillOf(question),ins=instructionFor(question),number=state.answers.length+1;
 return <section className="starting-check starting-question" data-no-support>
  <div className="starting-top"><button className="fs-icon" onClick={()=>go('home')} aria-label="Save and leave · محفوظ یې کړئ او ووځئ">←</button><span className="fs-count">{number}</span><div className="fs-bar" role="progressbar" aria-label="Starting check" aria-valuemin={0} aria-valuemax={assessmentQuestions.length} aria-valuenow={number-1}><span style={{width:`${(number-1)/assessmentQuestions.length*100}%`}}/></div></div>
  <h1 ref={heading} tabIndex={-1} className="starting-instruction"><Bi en={ins.en} ps={ins.ps}/></h1>
  {skill.passage&&<p className="starting-passage" lang="en" dir="ltr">{skill.passage}</p>}
  {question.kind==='story'&&<p className="starting-story-question"><span lang="en" dir="ltr">{question.question}</span> <span className="fs-ps" lang="ps" dir="rtl">{question.questionPs}</span></p>}
  {question.kind==='sentence'&&<p className="starting-sentence" lang="en" dir="ltr">{question.text}</p>}
  {question.picture&&<div className="starting-picture" aria-hidden="true"><WordPicture word={question.picture} size={120}/></div>}
  {(question.word||question.question)&&<button className="primary starting-listen" onClick={()=>sayWord(question.word||question.question)}><span aria-hidden="true">🔊 </span><Bi en="Listen" ps="واورئ"/></button>}
  <div className={`starting-options starting-${question.kind}`} role="group" aria-label="Choose your answer">{assessmentOptions(question,profile.id).map(option=>['sentence','story'].includes(question.kind)
   ?<button key={option} onClick={()=>answer(option)} aria-label={`Picture: ${option}`}><WordPicture word={option} size={84}/></button>
   :<button key={option} onClick={()=>answer(option)} lang="en" dir="ltr">{option}</button>)}</div>
  <button className="secondary starting-skip" onClick={()=>answer('')}><Bi en="I don’t know yet" ps="لا یې نه پوهېږم"/></button>
 </section>;
}
// Parent area: a short result summary and the starting lesson, which a grown-up may change.
export function StartingSummary({progress,lessons,onChange}){
 const placement=progress.placement,assessment=placement?.assessment;
 let result=null;try{result=assessment&&['completed','skipped'].includes(assessment.status)?assessmentRecommendation(assessment):null;}catch{result=null;}
 const start=lessons[progress.startIndex],place=classLesson(start.id),skipped=lessons.filter((l,i)=>i<progress.startIndex&&!progress.mastered[l.id]).length;
 const label=(l,i)=>{const p=classLesson(l.id);return `Class ${p.classNumber} · Lesson ${p.lesson} · ${l.content.letters.length?l.content.letters.join(' '):l.title}${i===progress.startIndex?' (current start)':''}`;};
 return <div className="starting-summary"><h3>Starting level</h3>
  {result?<p>Starting check{assessment.completedAt?` (${assessment.completedAt.slice(0,10)})`:''}: {assessment.status==='skipped'?'skipped, started from the beginning.':`${result.answered} questions${result.stoppedEarly?', stopped early':''}.`}</p>:<p>No starting check yet.</p>}
  {result&&assessment.status==='completed'&&<ul>{result.results.map(x=><li key={x.skill}>{assessmentSkills.find(k=>k.id===x.skill).en}: {x.correct} of 3 {x.passed?'✓ passed':'– practise here'}</li>)}</ul>}
  <p><strong>Starts at: Class {place.classNumber} · Lesson {place.lesson}</strong>{placement?.source==='parent'?' (chosen by a grown-up)':''}. {skipped?`${skipped} earlier lessons are open and marked “skipped by test” (not completed, no stars).`:''}</p>
  <label>Change the starting lesson<select value={progress.startIndex} onChange={e=>onChange(Number(e.target.value))}>{lessons.map((l,i)=><option key={l.id} value={i}>{label(l,i)}</option>)}</select></label>
  <p className="muted">Moving the start later opens the lessons before it as “skipped by test”. Moving it earlier keeps every lesson the child has already passed.</p>
 </div>;
}
