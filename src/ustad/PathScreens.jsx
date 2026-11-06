import {useEffect,useMemo,useRef,useState} from 'react';
import {Art,BrandMark,Icon} from './ExplorerArt.jsx';
import {Explain} from './shared.jsx';
import {classes} from './adventureContent.js';
import {defaultAdventure} from './adventureEngine.js';
import {shuffle,seededRandom} from './engine.js';
import {words} from './content.js';
import {useNarration} from './useNarration.js';
import {playEffect,completionId} from './soundEngine.js';
import {useAutoNext} from './learnerPrefs.js';
import {TapWords,HearSentence,PashtoHelp,CelebrationBurst,useAutoInstruction} from './SoundKit.jsx';
import {pathLessons,pathState,currentLesson,canOpen,earnedBadges,learnedSoFar,resumeStep,lessonDone} from './pathModel.js';
const activityIcon={watch:'👀',ideas:'💡',listen:'👂',match:'🧩',trace:'✏️',say:'🗣️',quiz:'⭐',game:'🎮'};
const statusLabel={done:'Completed',current:'Continue here',next:'Up next',open:'Ready to explore',later:'Unlocks later'};
const pictureOf=en=>words.find(w=>w.en===en);
function Say({text,language,className=''}){useAutoInstruction(text);return <><p className={className}>{text}</p><Explain text={text} language={language}/></>;}
// Home: the one main action.
export function ContinueAdventure({profile,language,go}){
 const lesson=currentLesson(profile),step=resumeStep(profile,lesson),level=classes[lesson.classIndex],done=pathState(profile).filter(l=>l.status==='done').length;
 return <section className="continue-adventure"><div className="continue-art" aria-hidden="true"><span>{lesson.emoji}</span><BrandMark size={54}/></div><div className="continue-copy"><p className="section-kicker">CLASS {lesson.classIndex+1} · {level.title.toUpperCase()} · {done} OF {pathLessons.length} LESSONS DONE</p><h2>{lesson.title}</h2><Explain text={lesson.title} language={language} inline/><p>{step?`Step ${step+1} of ${lesson.activities.length} · Your place is saved.`:lesson.kind==='review'?'A review adventure with familiar games.':'A new adventure is waiting for you.'}</p><div className="continue-steps" aria-hidden="true">{lesson.activities.map((a,i)=><span key={i} className={i<step?'step-done':i===step?'step-now':''}>{activityIcon[a.type]}</span>)}</div></div><div className="continue-actions"><button className="primary continue-main" onClick={()=>go('path-lesson',lesson.index)}>Continue My Adventure <Icon name="arrow" size={20}/><Explain text="Continue My Adventure" language={language} inline/></button><button className="text-button" onClick={()=>go('journey')}>See my adventure map</button></div></section>;
}
// The lesson that a just-finished lesson unlocked; the map animates it once, then forgets it.
let pendingUnlock=null;
function markUnlocked(id){pendingUnlock=id;}
const TRAIL_X=[50,78,50,22];
// Positions are in row units; CSS sets the row height (taller on phones).
const ROW=1;
function prefersReducedMotion(profile){return !!profile.adventure?.reducedMotion||(typeof window!=='undefined'&&!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);}
// Smooth S-curves through every node centre; x is a percentage of the trail width, y is in pixels.
function trailPath(points){return points.map((p,i)=>i?`C ${points[i-1].x} ${points[i-1].y+ROW/2}, ${p.x} ${p.y-ROW/2}, ${p.x} ${p.y}`:`M ${p.x} ${p.y}`).join(' ');}
function Trail({lessons,current,unlocking,language,go,reduced}){
 const points=lessons.map((l,i)=>({x:TRAIL_X[i%TRAIL_X.length],y:i*ROW+ROW/2}));
 const rows=lessons.length,lastWalked=lessons.reduce((n,l,i)=>l.status==='done'?i:n,-1);
 const grow=lessons.findIndex(l=>l.id===unlocking);
 const walked=points.slice(0,(grow>0?grow-1:lastWalked+1)+1);
 return <div className="trail" style={{'--rows':rows}}>
  <svg className="trail-line" viewBox={`0 0 100 ${rows}`} preserveAspectRatio="none" aria-hidden="true">
   <path d={trailPath(points)} className="trail-road"/>
   <path d={trailPath(points)} className="trail-dashes"/>
   {walked.length>1&&<path d={trailPath(walked)} className="trail-walked"/>}
   {grow>0&&<path d={trailPath(points.slice(grow-1,grow+1))} className="trail-walked trail-grow"/>}
  </svg>
  <ol className="trail-nodes">{lessons.map((l,i)=>{
   const isUnlocking=l.id===unlocking&&!reduced,side=points[i].x>60?'left':points[i].x<40?'right':'right';
   return <li key={l.id} data-lesson={l.id} className={`trail-node status-${l.status} side-${side} ${l.kind==='review'?'node-review':''} ${isUnlocking?'node-unlocking':''} ${l.index===current.index?'node-current':''}`} style={{'--x':points[i].x,'--i':i}}>
    <button disabled={!canOpen(l)} onClick={()=>go('path-lesson',l.index)} aria-label={`${l.title}: ${statusLabel[l.status]}`} aria-current={l.index===current.index?'step':undefined}>
     <span className="trail-marker" aria-hidden="true"><span className="trail-icon">{l.status==='done'?'✓':l.status==='later'?'🔒':l.emoji}</span>{isUnlocking&&<span className="trail-lock">🔒</span>}{l.index===current.index&&<span className="trail-ring"/>}</span>
     <span className="trail-label"><small>{l.kind==='review'?'REVIEW ADVENTURE':`LESSON ${l.index+1}`}</small><strong>{l.title}</strong><Explain text={l.title} language={language} inline/><em className={`path-status status-${l.status}`}>{statusLabel[l.status]}<Explain text={statusLabel[l.status]} language={language} inline/></em>{l.practice&&<em className="path-status status-practice">Practice again</em>}{l.index===current.index&&<span className="trail-start">Start <Icon name="arrow" size={16}/></span>}</span>
    </button>
   </li>;})}</ol>
 </div>;
}
export function AdventureMap({profile,language,go}){
 const state=pathState(profile),current=currentLesson(profile),badges=earnedBadges(profile),learned=learnedSoFar(profile),done=state.filter(l=>l.status==='done').length,practice=state.filter(l=>l.practice);
 const root=useRef(null),[unlocking]=useState(()=>pendingUnlock&&state.find(l=>l.id===pendingUnlock&&l.status!=='later')?pendingUnlock:null);
 const reduced=prefersReducedMotion(profile);
 useEffect(()=>{
  const map=root.current;if(!map)return;
  const nodeFor=id=>map.querySelector(`[data-lesson="${id}"]`);
  const timers=[];
  // Open at the current lesson; after an unlock, start at the finished lesson and glide to the new one.
  if(unlocking&&!reduced){
   const target=nodeFor(unlocking),before=target?.previousElementSibling;
   (before||target)?.scrollIntoView?.({block:'center',behavior:'instant'});
   timers.push(setTimeout(()=>target?.scrollIntoView?.({block:'center',behavior:'smooth'}),700));
  }else nodeFor(current.id)?.scrollIntoView?.({block:'center',behavior:'instant'});
  timers.push(setTimeout(()=>{pendingUnlock=null;},2400));
  // Nodes fade up as they scroll into view.
  if(reduced||typeof IntersectionObserver==='undefined')return()=>timers.forEach(clearTimeout);
  map.classList.add('reveal-ready');
  const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target);}},{rootMargin:'0px 0px -8% 0px'});
  for(const el of map.querySelectorAll('.trail-node,.path-class-head'))observer.observe(el);
  return()=>{observer.disconnect();timers.forEach(clearTimeout);};
 },[current.id,unlocking,reduced]);
 return <section className={`adventure-path ${reduced?'map-still':''}`} ref={root}>
  <div className="explorer-page-title"><p className="section-kicker">ONE CONNECTED ADVENTURE</p><h1>My adventure map</h1><Explain text="My adventure map" language={language}/></div>
  <div className="path-summary">
   <div className="path-summary-main"><strong>{done} <small>/ {pathLessons.length}</small></strong><span>lessons completed</span><div className="class-track" role="progressbar" aria-label="Lessons completed" aria-valuenow={done} aria-valuemax={pathLessons.length}><span style={{width:`${done/pathLessons.length*100}%`}}/></div><button className="primary" onClick={()=>go('path-lesson',current.index)}>Continue My Adventure <Icon name="arrow" size={18}/></button></div>
   <div><h2>What have I learned?</h2><Explain text="What have I learned?" language={language} inline/>{learned.length?<ul className="learned-list">{learned.map(l=><li key={l}>✓ {l}<Explain text={l} language={language} inline/></li>)}</ul>:<p className="muted">Finish your first lesson to see it here.</p>}</div>
   <div><h2>My badges</h2><Explain text="My badges" language={language} inline/>{badges.length?<div className="path-badges">{badges.map(b=><span key={b.name} title={b.lesson}><b aria-hidden="true">{b.emoji}</b>{b.name}</span>)}</div>:<p className="muted">Your first badge is waiting after “Meet your new friends”.</p>}</div>
  </div>
  {practice.length>0&&<div className="path-practice"><span aria-hidden="true">💪</span><div><strong>Extra practice</strong><Explain text="Extra practice" language={language} inline/><p>These lessons were tricky. Playing them again helps them stick.</p></div><div className="button-row">{practice.slice(0,3).map(l=><button key={l.id} className="secondary" onClick={()=>go('path-lesson',l.index)}>{l.emoji} {l.title}</button>)}</div></div>}
  <div className="trail-legend" aria-label="Map key"><span className="legend-done">✓ Completed</span><span className="legend-current">▶ Continue here</span><span className="legend-next">Up next</span><span className="legend-later">🔒 Unlocks later</span></div>
  {classes.map((level,ci)=>{const list=state.filter(l=>l.classIndex===ci);return <section key={level.id} className={`path-class ${level.color}`}>
   <div className="path-class-head"><span className="class-emblem">{level.icon}</span><div><span className="small-chip">CLASS {ci+1} · {level.stage.toUpperCase()} · {level.cefr}</span><h2>{level.title} — {level.subtitle}</h2><Explain text={level.subtitle} language={language} inline/></div><span className="path-class-count">{list.filter(l=>l.status==='done').length}/{list.length}</span></div>
   <Trail lessons={list} current={current} unlocking={unlocking} language={language} go={go} reduced={reduced}/>
   {ci<4&&<div className="path-extras"><span>Optional extras:</span><button className="text-button" onClick={()=>go('story-library')}>📖 Stories</button><button className="text-button" onClick={()=>go('picture-words',0)}>🖼️ Picture words</button><button className="text-button" onClick={()=>go('games')}>🎮 Games</button></div>}
  </section>;})}
  <p className="muted">Lessons unlock one by one after practice. A grown-up can choose the starting class or unlock every lesson in the parent area.</p>
 </section>;
}
function PathQuestion({question,tiles=false,join='',language,narration,onPass,pictures=false}){
 const [choice,setChoice]=useState(''),[placed,setPlaced]=useState([]),[wrong,setWrong]=useState(0),[passed,setPassed]=useState(false);
 useAutoInstruction(question.prompt);
 const easier=wrong>=2;
 const all=useMemo(()=>shuffle(question.options.map((label,id)=>({label,id})),seededRandom(question.prompt)),[question]);
 const options=easier&&!tiles?all.filter(o=>o.label===question.answer||o.label===all.find(x=>x.label!==question.answer).label):all;
 const answer=tiles?placed.map(o=>o.label).join(join):choice;
 function check(){if(passed)return;if(answer===question.answer){playEffect('correct');setPassed(true);onPass({attempts:wrong+1,needsReview:wrong>0});}else{setWrong(w=>w+1);setChoice('');setPlaced([]);}}
 return <div className="path-question">
  {question.remember&&<p className="path-remember">🔁 Remember this from before? <small>{question.remember}</small><Explain text="Remember this from before?" language={language} inline/></p>}
  <h3>{question.prompt}</h3><Explain text={question.prompt} language={language}/>
  {narration.available&&<button className="text-button" onClick={()=>narration.play(question.prompt)}>◖ Hear the question</button>}<PashtoHelp text={question.prompt} language={language}/>
  {tiles&&<div className="train-answer" dir="ltr" aria-live="polite">{placed.length?placed.map(o=><button key={o.id} disabled={passed} onClick={()=>setPlaced(p=>p.filter(t=>t.id!==o.id))}>{o.label}</button>):<span>Tap the tiles to build your answer.<Explain text="Tap the tiles to build your answer." language={language} inline/></span>}</div>}
  {easier&&!passed&&tiles&&<p className="path-easier-tip">It starts with: <strong dir="ltr">{question.answer.split(join||'').slice(0,1).join(join)}</strong></p>}
  <div className={`adventure-options ${tiles?'train-tiles':''} ${pictures?'path-picture-options':''}`} role="group" aria-label="Answer choices">{options.map(o=>{const pic=pictures&&pictureOf(o.label);return <button key={o.id} className={!tiles&&choice===o.label?'option-selected':''} disabled={passed||tiles&&placed.some(t=>t.id===o.id)} aria-label={pic?`Picture: option ${all.indexOf(o)+1}`:undefined} onClick={()=>tiles?setPlaced(p=>[...p,o]):setChoice(o.label)}>{pic?<span className="path-picture">{pic.emoji}</span>:<><span dir="ltr">{o.label}</span>{!tiles&&<Explain text={o.label} language={language} inline/>}</>}</button>;})}</div>
  {!passed&&<button className="primary" disabled={!answer||tiles&&placed.length!==all.length} onClick={check}>Check my answer <Icon name="check" size={18}/><Explain text="Check my answer" language={language} inline/></button>}
  {wrong>0&&!passed&&<div className="adventure-hint"><p>💡 {question.hint}</p><Explain text={question.hint} language={language}/>{easier&&<><p>Let’s make it easier. Try again with fewer choices.</p><Explain text="Let’s make it easier. Try again with fewer choices." language={language}/></>}</div>}
  {passed&&<div className="adventure-answer answer-success" role="status"><p>✓ {wrong?'You kept trying and found it!':'You got it on the first try!'}</p><Explain text={wrong?'You kept trying and found it!':'You got it on the first try!'} language={language}/></div>}
 </div>;
}
function Questions({activity,language,narration,onDone,pictures=false}){
 const [n,setN]=useState(0),[passed,setPassed]=useState(false),results=useRef([]);
 const qs=activity.questions,last=n===qs.length-1;
 const advance=()=>{if(last)onDone({attempts:results.current.reduce((s,r)=>s+r.attempts,0),needsReview:results.current.some(r=>r.needsReview)});else{setN(x=>x+1);setPassed(false);}};
 useAutoNext(passed,advance);
 return <><span className="small-chip">{n+1} OF {qs.length}</span><PathQuestion key={n} question={qs[n]} tiles={activity.tiles} join={activity.join} pictures={pictures} language={language} narration={narration} onPass={r=>{results.current.push(r);setPassed(true);}}/>{passed&&<button className="primary path-next" onClick={advance}>{last?'Finish this step':'Next question'} <Icon name="arrow" size={18}/></button>}</>;
}
function ListenTap({activity,language,narration,onDone}){
 const questions=activity.words.map(en=>({prompt:'Listen, then tap the picture.',options:activity.choices,answer:en,hint:`Listen again. Look for ${pictureOf(en)?.emoji||''}.`,say:en}));
 const [n,setN]=useState(0),[passed,setPassed]=useState(false),results=useRef([]);
 const q=questions[n],last=n===questions.length-1;
 const advance=()=>{if(last)onDone({attempts:results.current.reduce((s,r)=>s+r.attempts,0),needsReview:results.current.some(r=>r.needsReview)});else{setN(x=>x+1);setPassed(false);}};
 useAutoNext(passed,advance);
 return <><div className="path-listen"><button className="primary" onClick={()=>narration.play(q.say)} disabled={!narration.available}><Icon name="sound" size={20}/> Hear the word</button>{!narration.available&&<p className="muted">Audio is unavailable. Ask a grown-up to read the word: <strong dir="ltr">{q.say}</strong></p>}</div><PathQuestion key={n} question={{...q,prompt:`Listen, then tap the picture.`,hint:q.hint}} pictures language={language} narration={{available:false}} onPass={r=>{results.current.push(r);setPassed(true);narration.play(q.say);}}/>{passed&&<button className="primary path-next" onClick={advance}>{last?'Finish this step':'Next word'} <Icon name="arrow" size={18}/></button>}</>;
}
function Match({activity,language,narration,onDone}){
 const left=activity.pairs.map(([w])=>w),right=useMemo(()=>shuffle(activity.pairs.map(([w,e])=>({w,e})),seededRandom(activity.pairs.join())),[activity]);
 const [pick,setPick]=useState(null),[matched,setMatched]=useState([]),[miss,setMiss]=useState(0),[shake,setShake]=useState('');
 const done=matched.length===left.length;
 function choosePicture(item){if(!pick||matched.includes(item.w))return;if(item.w===pick){playEffect('correct');setMatched(m=>[...m,item.w]);narration.play(item.w);setPick(null);}else{setMiss(m=>m+1);setShake(item.w);setTimeout(()=>setShake(''),450);}}
 return <><Say text="Tap a word, then its picture." language={language} className="path-instruction-line"/><div className="path-match"><div>{left.map(w=><button key={w} dir="ltr" className={`${pick===w?'option-selected':''} ${matched.includes(w)?'pair-done':''}`} disabled={matched.includes(w)} onClick={()=>{setPick(w);narration.play(w);}}>{w}</button>)}</div><div>{right.map(item=><button key={item.w} aria-label={`Picture for ${matched.includes(item.w)?item.w:'a word'}`} className={`path-match-picture ${matched.includes(item.w)?'pair-done':''} ${shake===item.w?'pw-wrong':''}`} disabled={matched.includes(item.w)} onClick={()=>choosePicture(item)}>{item.e}</button>)}</div></div>{miss>0&&!done&&<div className="adventure-hint"><p>💡 Say the word aloud, then look for its picture.</p><Explain text="Say the word aloud, then look for its picture." language={language}/></div>}{done&&<button className="primary path-next" onClick={()=>onDone({attempts:left.length+miss,needsReview:miss>1})}>Finish this step <Icon name="arrow" size={18}/></button>}</>;
}
function Trace({activity,language,onDone}){
 const canvas=useRef(),drawing=useRef(false),[strokes,setStrokes]=useState(0);
 function draw(e){const c=canvas.current,r=c.getBoundingClientRect(),ctx=c.getContext('2d'),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;if(e.type==='pointerdown'){drawing.current=true;c.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(x,y);}else if(drawing.current){ctx.strokeStyle='#1685e8';ctx.lineWidth=10;ctx.lineCap='round';ctx.lineTo(x,y);ctx.stroke();}}
 return <><Say text="Trace the letter with your finger." language={language} className="path-instruction-line"/><div className="trace path-trace"><span>{activity.letter} {activity.letter.toLowerCase()}</span><canvas width="600" height="260" ref={canvas} aria-label={`Drawing area for ${activity.letter}`} onPointerDown={draw} onPointerMove={draw} onPointerUp={()=>{drawing.current=false;setStrokes(s=>s+1);}} onPointerCancel={()=>drawing.current=false}/></div><div className="button-row"><button className="secondary" onClick={()=>{canvas.current.getContext('2d').clearRect(0,0,600,260);setStrokes(0);}}>↻ Clear</button><button className="primary" onClick={()=>onDone({attempts:1,needsReview:false})}>{strokes?'I traced it':'I traced it in the air'} <Icon name="check" size={18}/></button></div></>;
}
function SayIt({activity,language,onDone}){
 return <div className="path-say"><span className="path-say-bubble" dir="ltr"><TapWords text={activity.text}/></span><Explain text={activity.text} language={language}/><div className="button-row"><HearSentence text={activity.text}/></div><PashtoHelp text={activity.text} language={language}/><Say text="Listen, then say it aloud. Say it to a grown-up or a toy friend!" language={language} className="path-instruction-line"/><button className="primary" onClick={()=>onDone({attempts:1,needsReview:false})}>I said it! <Icon name="check" size={18}/><Explain text="I said it!" language={language} inline/></button></div>;
}
function Watch({activity,language,narration,onDone,reducedMotion}){
 return <><div className={`path-scene ${reducedMotion?'pw-still':''}`}><Art kind="forest"/><span className="path-scene-emoji" aria-hidden="true">{activity.emoji}</span></div><div className="scene-caption"><p><TapWords text={activity.text}/></p><Explain text={activity.text} language={language}/><PashtoHelp text={activity.text} language={language}/></div><div className="button-row"><button className="secondary" disabled={!narration.available} onClick={()=>narration.play(activity.listen||activity.text)}><Icon name="sound" size={18}/> Listen</button><button className="primary" onClick={()=>onDone({attempts:0,needsReview:false})}>I watched <Icon name="arrow" size={18}/></button></div></>;
}
function Ideas({activity,language,narration,onDone}){
 return <div className="unit-word-bank"><h2>Key ideas</h2><Explain text="Key ideas" language={language} inline/><ul className="unit-points">{activity.points.map(p=><li key={p}>{p}</li>)}</ul><h2>Listen and repeat</h2><Explain text="Listen and repeat" language={language} inline/><div className="unit-examples" dir="ltr">{activity.examples.map(e=>narration.available?<button key={e} onClick={()=>narration.play(e)}>◖ {e}</button>:<p key={e}>{e}</p>)}</div><button className="primary" onClick={()=>onDone({attempts:0,needsReview:false})}>I understand <Icon name="arrow" size={18}/></button></div>;
}
const activityTitle={watch:'Watch and listen',ideas:'Learn the ideas',listen:'Listen and tap',match:'Match the pairs',trace:'Trace the letter',say:'Say it aloud'};
export function PathLesson({index,profile,language,onEvent,onSettings,onBreak,go}){
 const lesson=pathLessons[index%pathLessons.length],settings={...defaultAdventure,...profile.adventure},state=pathState(profile)[lesson.index];
 const [step,setStep]=useState(()=>resumeStep(profile,lesson)),[finished,setFinished]=useState(null),results=useRef([]);
 const narration=useNarration({enabled:settings.audio});
 if(!canOpen(state))return <section className="activity"><span className="big-emoji">🔒</span><h2>This adventure unlocks later</h2><Explain text="This adventure unlocks later" language={language}/><p>Finish the lessons before it first. Every step helps you get ready.</p><button className="primary" onClick={()=>go('path-lesson',currentLesson(profile).index)}>Continue My Adventure</button></section>;
 const activity=lesson.activities[step],title=activity&&(activity.title||activityTitle[activity.type]);
 function done(result){
  narration.stop();results.current.push(result);
  if(step<lesson.activities.length-1){setStep(step+1);onSettings({pathResume:{lesson:lesson.id,step:step+1}});window.scrollTo?.({top:0,behavior:'smooth'});return;}
  const attempts=results.current.reduce((s,r)=>s+r.attempts,0),needsReview=results.current.some(r=>r.needsReview);
  onEvent('path-'+lesson.id,{attempts,needsReview});if(lesson.unitId)onEvent('review-'+lesson.unitId,{attempts,needsReview});
  onSettings({pathResume:null});if(pathLessons[lesson.index+1]&&!lessonDone(profile,pathLessons[lesson.index+1]))markUnlocked(pathLessons[lesson.index+1].id);setFinished({practised:results.current.length,struggled:needsReview,id:completionId()});window.scrollTo?.({top:0,behavior:'smooth'});
 }
 if(finished)return <Celebrate lesson={lesson} language={language} practised={finished.practised} struggled={finished.struggled} id={finished.id} go={go} onBreak={onBreak}/>;
 const props={activity,language,narration,onDone:done,reducedMotion:settings.reducedMotion};
 return <section className="path-lesson">
  <div className="lesson-topline"><button className="text-button" onClick={()=>go('journey')}>← My adventure map</button><button className="secondary path-break" onClick={()=>{narration.stop();onSettings({pathResume:{lesson:lesson.id,step}});onBreak();}}>🌿 Take a break<Explain text="Take a break" language={language} inline/></button></div>
  <p className="section-kicker">{lesson.kind==='review'?'REVIEW ADVENTURE':`CLASS ${lesson.classIndex+1} · LESSON ${lesson.index+1}`}</p><h1>{lesson.title}</h1><Explain text={lesson.title} language={language}/>
  <ol className="path-steps" aria-label="Lesson steps">{lesson.activities.map((a,i)=><li key={i} className={i<step?'step-done':i===step?'step-now':''} aria-current={i===step?'step':undefined}><span aria-hidden="true">{i<step?'✓':activityIcon[a.type]}</span><small>{a.title||activityTitle[a.type]}</small></li>)}</ol>
  <section className="path-activity" key={step}><div className="path-activity-head"><span aria-hidden="true">{activityIcon[activity.type]}</span><div><h2>{title}</h2><Explain text={title} language={language} inline/></div><span className="small-chip">STEP {step+1} OF {lesson.activities.length}</span></div>
   {activity.type==='watch'&&<Watch {...props}/>}{activity.type==='ideas'&&<Ideas {...props}/>}{activity.type==='listen'&&<ListenTap {...props}/>}{activity.type==='match'&&<Match {...props}/>}{activity.type==='trace'&&<Trace {...props}/>}{activity.type==='say'&&<SayIt {...props}/>}{['quiz','game'].includes(activity.type)&&<Questions {...props}/>}
  </section>
 </section>;
}
function Celebrate({lesson,language,practised,struggled,id,go,onBreak}){
 const next=lesson.next,teaser=next&&`Next, help ${next.friend} with “${next.title}”!`;
 return <section className="path-celebrate"><CelebrationBurst id={id}/><Art kind="rewards"/><span className="pill">LESSON COMPLETE</span><h1>Lesson complete!</h1><Explain text="Lesson complete!" language={language}/>
  <div className="path-learned"><h2>What you learned</h2><Explain text="What you learned" language={language} inline/><p className="path-learned-line">🌟 {lesson.learned}</p><Explain text={lesson.learned} language={language}/><p>You practised {practised} activities.{struggled?' Some parts were tricky, and you kept going. That is how we grow!':''}</p></div>
  {lesson.badge&&<div className="path-new-badge"><span aria-hidden="true">🏅</span><div><small>NEW BADGE</small><strong>{lesson.badge}</strong></div></div>}
  {next?<div className="path-next-teaser"><span aria-hidden="true">{pathLessons[lesson.index+1].emoji}</span><div><small>NEXT ADVENTURE</small><strong>{teaser}</strong><Explain text={teaser} language={language}/></div></div>:<p>You finished every adventure. Amazing!</p>}
  <div className="button-row">{next&&<button className="primary" onClick={()=>go('journey')}>Next adventure <Icon name="arrow" size={18}/><Explain text="Next adventure" language={language} inline/></button>}<button className="secondary" onClick={onBreak}>🌿 Take a break<Explain text="Take a break" language={language} inline/></button><button className="text-button" onClick={()=>go('journey')}>My adventure map</button></div>
 </section>;
}
