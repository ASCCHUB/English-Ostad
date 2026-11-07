import {useEffect,useRef,useState} from 'react';
import {speak,stopSpeech,playEffect,useAudio} from '../soundEngine.js';
import {playCourseClip,hasRecording,loadRecordingManifest,slowBlend} from '../firstSteps/audio.js';
import {Bi,UrduSpeaker} from '../firstSteps/Bilingual.jsx';
import {urduGameUi} from '../locales/ur.js';
import {Pic,Group,Scene} from './GameArt.jsx';
import {artSvg} from './art.js';
import {games,loadBank,approved,ui} from './catalog.js';
import {gameState,startRound,recordAnswer,advance,finishRound,currentLevel,nextPart,levelDone,reviewCandidates,skillsToPractise,totalStars,answeredCount,independentCount,ROUND_SIZE} from './progress.js';
import './games.css';

const NUM=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];
// "You matched five lowercase letters!" — what each skill's practice is called in the round summary.
const SKILL_DONE={uppercase:'found # uppercase letters','lowercase':'found # lowercase letters','match-case':'matched # big and small letter partners','letters-in-words':'spotted letters in # words','alphabet-order':'put # letters in alphabet order',
 'sound-letter':'matched # sounds to letters','initial-sound':'heard # first sounds','final-sound':'heard # last sounds',vowel:'heard # middle vowel sounds',blend:'blended # words',
 'food-words':'named # foods','animal-words':'named # animals','follow-instructions':'followed # English instructions',colors:'chose # colours',quantities:'counted food for # animals',actions:'learned # action words','which-animal':'matched # animals to their food','two-steps':'followed # two-step instructions',
 counting:'counted # groups','match-quantity':'matched # numbers to groups','number-names':'read # number names','number-spelling':'spelled # number words',compare:'compared # pairs of groups',sequences:'finished # number patterns',addition:'solved # adding questions',
 objects:'found # things for Fox',describing:'found # big and small things',positions:'found # things by their place','color-position':'used colour and place # times',sentences:'read and built # sentences'};
const skillLine=(skill,n)=>`You ${(SKILL_DONE[skill]||'practised # questions').replace('#',NUM[n]||n)}!`.replace(/ 1 (\w+)s\b/,' 1 $1');
// English inside a Pashto line keeps its own direction.
export function PsText({text,className='',lang='ps'}){
 const parts=String(text||'').split(/([A-Za-z0-9][A-Za-z0-9 ,.'’\-–/]*[A-Za-z0-9.]|[A-Za-z0-9])/);
 return <span className={`gm-ps ${className}`} lang={lang} dir="rtl">{parts.map((p,i)=>i%2?<bdi key={i} dir="ltr" lang="en">{p}</bdi>:p)}</span>;
}
const urPraise={[approved.firstTry]:urduGameUi.firstTry,[approved.keptTrying]:urduGameUi.keptTrying};
function PsOnly({text}){const {language}=useAudio();if(['ur','rur'].includes(language))return urPraise[text]?<p className="gm-praise"><PsText text={urPraise[text]} lang="ur"/></p>:null;return language==='en'?null:<p className="gm-praise"><PsText text={text}/></p>;}
function sayEnglish(text,voiceOn){if(voiceOn&&text)return speak(text,{kind:'sentence',rate:.85});return Promise.resolve('off');}

// ---------- the whole game: level map → rounds → summary ----------
export default function GameScreen({gameId,profile,settings,onSettings,onSave,go,startNow=false}){
 const game=games.find(g=>g.id===gameId)||games[0];
 const [bank,setBank]=useState(null),[failed,setFailed]=useState(false);
 const state=gameState(profile,game.id);
 const [view,setView]=useState(startNow&&state.current?'play':'map'),[summary,setSummary]=useState(null),[parent,setParent]=useState(false);
 const finishing=useRef(false);
 useEffect(()=>{let live=true;loadBank(game.id).then(b=>{if(live)setBank({...b,byId:Object.fromEntries(b.questions.map(q=>[q.id,q]))});}).catch(()=>live&&setFailed(true));loadRecordingManifest();return()=>{live=false;stopSpeech();};},[game.id]);
 const save=fn=>onSave(game.id,fn);
 if(failed)return <section className="gm-screen"><p role="alert">This game could not load. Check your connection and try again.</p><button className="gm-btn" onClick={()=>go('games')}>Back to games</button></section>;
 if(!bank)return <section className="gm-screen"><p role="status">Opening {game.title}…</p></section>;
 const begin=opts=>{finishing.current=false;setSummary(null);save(s=>startRound(s,bank,opts));setView('play');};
 const finish=()=>{if(finishing.current)return;finishing.current=true;const {state:next,summary:sum}=finishRound(gameState(profile,game.id));if(!sum){finishing.current=false;return;}save(()=>next);setSummary(sum);setView('summary');};
 const mascot=game.id==='fox-apple'?'/explorers/avatar-fox.png':`/explorers/avatar-${['fox','bunny','turtle'].includes(settings.avatar)?settings.avatar:'fox'}.png`;
 return <section className={`gm-screen gm-accent-${game.accent}`} data-no-support>
  {view==='map'&&<LevelMap game={game} bank={bank} state={state} parent={parent} onParent={()=>setParent(true)} onPlay={begin} onResume={()=>setView('play')} go={go}/>}
  {view==='play'&&state.current&&<RoundPlayer key={state.current.kind+state.current.level+'-'+state.current.part+state.current.ids.join()} game={game} bank={bank} round={state.current} settings={settings} onSettings={onSettings} mascot={mascot}
    onAnswer={(id,outcome,skill)=>save(s=>recordAnswer(s,id,outcome,skill))} onNext={()=>save(advance)} onFinish={finish} onExit={()=>{stopSpeech();setView('map');}}/>}
  {view==='play'&&!state.current&&!summary&&<LevelMap game={game} bank={bank} state={state} parent={parent} onParent={()=>setParent(true)} onPlay={begin} onResume={()=>{}} go={go}/>}
  {view==='summary'&&summary&&<RoundSummary game={game} bank={bank} summary={summary} state={state} mascot={mascot} onContinue={()=>begin({})} onReview={ids=>begin({review:true,ids})} onBreak={()=>{stopSpeech();setView('break');}} onMap={()=>setView('map')}/>}
  {view==='break'&&<div className="gm-break"><img src={mascot} alt=""/><Bi as="h2" en="Time for a little break" ps={approved.takeBreak}/><Bi as="p" en="Your place is saved. Come back whenever you are ready." ps={approved.placeSaved}/><div className="gm-row"><button className="gm-btn gm-primary" onClick={()=>go('games')}><Bi en="Back to games" ps={approved.back}/></button><button className="gm-btn" onClick={()=>setView('map')}><Bi en="See my levels" ps="زما درجې"/></button></div></div>}
 </section>;
}

// ---------- level map ----------
function LevelMap({game,bank,state,parent,onParent,onPlay,onResume,go}){
 const level=currentLevel(state),part=nextPart(state,level),review=reviewCandidates(state),weak=skillsToPractise(state);
 const skillName=Object.fromEntries(bank.questions.map(q=>[q.skill,q.skillLabel]));
 const [gate,setGate]=useState(null);
 const c=state.current,info=bank.levels[level-1];
 return <div className="gm-map">
  <div className="gm-map-top"><button className="gm-btn gm-ghost" onClick={()=>go('games')}>← <Bi en="All games" ps={approved.play}/></button></div>
  <header className="gm-map-head"><span className="gm-icon gm-icon-lg" dangerouslySetInnerHTML={{__html:artSvg(game.icon)}}/><div><Bi as="h1" en={game.title} ps={game.ps}/><p lang="en">{game.skill}</p></div></header>
  <div className="gm-stats"><span><b>{answeredCount(state)}</b> / {game.questions} questions done</span><span><b>{independentCount(state)}</b> on the first try</span><span>★ <b>{totalStars(state)}</b> stars</span></div>
  <div className="gm-next-card">
   {c?<><Bi as="h2" en={c.kind==='review'?'Your review round is waiting':`Level ${c.level} · Round ${c.part} is waiting`} ps={approved.continueLearning}/><p>{Object.keys(c.results).length} of {c.ids.length} done</p><button className="gm-btn gm-primary gm-big" onClick={onResume}><Bi en="Continue" ps={ui.continuePlaying}/></button></>
   :<><Bi as="h2" en={`Level ${level} · Round ${part}`} ps={`درجه ${level} · پړاو ${part}`}/><p>{info.title} · Class {info.class}</p><button className="gm-btn gm-primary gm-big" onClick={()=>onPlay({level,part})}><Bi en={answeredCount(state)?'Play next round':'Start'} ps={approved.start}/></button></>}
  </div>
  {!c&&review.length>0&&<div className="gm-review-card"><Bi as="h3" en="Review: questions that needed help" ps={ui.review}/><Bi as="p" en={`${review.length} question${review.length>1?'s':''} to try again, with help ready.`} ps={ui.reviewNote}/>{weak.length>0&&<p className="gm-muted">Practise more: {weak.map(s=>skillName[s]||s).join(', ')}</p>}<button className="gm-btn" onClick={()=>onPlay({review:true})}><Bi en="Start review" ps={ui.review}/></button></div>}
  <h2 className="gm-sub">Levels</h2>
  <ol className="gm-levels">{bank.levels.map(l=>{const done=levelDone(state,l.level),open=l.level<=state.unlocked||parent,stars=[1,2].map(p=>state.rounds[`${l.level}-${p}`]?.stars||0);
   return <li key={l.level}><button className={`gm-level ${done?'gm-done':''} ${l.level===level?'gm-current':''}`} disabled={!open||!!c} onClick={()=>onPlay({level:l.level,part:nextPart(state,l.level)})} aria-label={`Level ${l.level}: ${l.title}${open?'':' (locked)'}`}>
    <span className="gm-level-n">{open?l.level:'🔒'}</span><span className="gm-level-t">{l.title}<small>Class {l.class} · {l.questions} questions</small></span><span className="gm-level-s" aria-label={`${stars[0]+stars[1]} stars`}>{stars.map((s,i)=><span key={i} className={s?'':'gm-dim'}>{'★'.repeat(Math.max(s,1))}</span>)}</span></button></li>;})}</ol>
  {c&&<p className="gm-muted">Finish or continue the waiting round to choose another level.</p>}
  <div className="gm-parent">{parent?<Bi as="p" en="Grown-up mode: every level can be chosen." ps="د مشرانو د پاره: هره درجه پرانیستې ده."/>:gate===null?<button className="gm-btn gm-ghost" onClick={()=>setGate('')}><Bi en="Grown-ups: choose any level" ps="مشران: هره درجه غوره کړئ"/></button>:
   <form onSubmit={e=>{e.preventDefault();if(gate.trim()==='68'){onParent();setGate(null);}else setGate('');}}><label>Grown-up check: what is 17 × 4?<input inputMode="numeric" value={gate} onChange={e=>setGate(e.target.value)} autoFocus/></label><button className="gm-btn">OK</button></form>}</div>
  {game.id==='fox-apple'&&<p className="gm-muted"><button className="gm-link" onClick={()=>go('fox-game',0)}>Visit Fox's 3D garden (the first Fox adventure)</button></p>}
 </div>;
}

// ---------- one round of five ----------
function RoundPlayer({game,bank,round,settings,onSettings,mascot,onAnswer,onNext,onFinish,onExit}){
 const [paused,setPaused]=useState(false),[showSettings,setShowSettings]=useState(false);
 const done=round.index>=round.ids.length;
 useEffect(()=>{if(done)onFinish();},[done]);
 if(done)return <p role="status">Counting your stars…</p>;
 const q=bank.byId[round.ids[round.index]];
 if(!q)return <p role="alert">This question is missing. <button className="gm-btn" onClick={onNext}>Skip</button></p>;
 return <div className={`gm-round gm-scene-${q.scene||game.id}`}>
  <div className="gm-toolbar">
   <button className="gm-btn gm-ghost" onClick={onExit} aria-label="Exit to levels">✕ <span>Exit</span></button>
   <span className="gm-progress" aria-label={`Question ${round.index+1} of ${round.ids.length}`}>{round.kind==='review'&&<b className="gm-tag">Review</b>}<span lang="en">{round.index+1} of {round.ids.length}</span><span className="gm-dots" aria-hidden="true">{round.ids.map((id,i)=><i key={id} className={i<round.index?'gm-dot-done':i===round.index?'gm-dot-now':''}/>)}</span></span>
   <button className="gm-btn gm-ghost" onClick={()=>{stopSpeech();setPaused(true);}} aria-label="Pause">❚❚ <span>Pause</span></button>
   <button className="gm-btn gm-ghost" aria-expanded={showSettings} onClick={()=>setShowSettings(v=>!v)} aria-label="Sound and display settings">⚙</button>
  </div>
  {showSettings&&<div className="gm-settings" role="group" aria-label="Sound and display">
   {[['audio','Voice','اواز'],['effects','Sound effects','کوچني اوازونه'],['captions','Captions','لیکلي الفاظ'],['reducedMotion','Less motion','لږ حرکت']].map(([k,en,ps])=><label key={k}><input type="checkbox" checked={!!settings[k]} onChange={e=>onSettings({[k]:e.target.checked})}/><Bi en={en} ps={ps}/></label>)}
  </div>}
  <Question key={q.id} q={q} settings={settings} mascot={mascot} answered={round.results[q.id]} last={round.index===round.ids.length-1} onAnswer={onAnswer} onNext={onNext} paused={paused}/>
  {paused&&<div className="gm-pause" role="dialog" aria-modal="true" aria-label="Paused"><div><Bi as="h2" en="Paused" ps={ui.paused}/><Bi as="p" en="Your place is saved." ps={approved.placeSaved}/><button className="gm-btn gm-primary gm-big" autoFocus onClick={()=>setPaused(false)}><Bi en="Resume" ps="جاري یې کړئ"/></button><button className="gm-btn" onClick={onExit}><Bi en="Exit to levels" ps={approved.back}/></button></div></div>}
 </div>;
}

// ---------- one question ----------
function Question({q,settings,mascot,answered,last,onAnswer,onNext,paused}){
 const audio=useAudio(),voiceOn=settings.audio!==false&&!settings.muted,captions=settings.captions!==false;
 const [attempts,setAttempts]=useState(0),[hint,setHint]=useState(false),[phase,setPhase]=useState(answered?(answered==='shown'?'shown':'correct'):'ask');
 const [wrong,setWrong]=useState([]),[bubble,setBubble]=useState(''),[picked,setPicked]=useState(null),[step,setStep]=useState(0),[placed,setPlaced]=useState([]),[ps,setPs]=useState(false);
 const busy=useRef(false),timers=useRef([]),recorded=useRef(!!answered);
 const later=(fn,ms)=>{timers.current.push(setTimeout(fn,ms));};
 useEffect(()=>()=>{timers.current.forEach(clearTimeout);stopSpeech();},[]);
 useEffect(()=>{if(paused)stopSpeech();},[paused]);
 const say=(text,caption=text)=>{if(captions||!voiceOn)setBubble(caption);return sayEnglish(text,voiceOn);};
 const playSound=s=>{if(!s)return;if(hasRecording(s.recording))playCourseClip(s.recording);};
 const instruction=()=>{stopSpeech();sayEnglish(q.say,voiceOn).then(r=>{if(r==='ended'&&q.prompt?.sound)playSound(q.prompt.sound);});};
 useEffect(()=>{if(audio.autoInstructions&&phase==='ask')later(instruction,350);},[]);
 const correctId=q.activity==='feed'?q.answer[Math.min(step,q.answer.length-1)].food:q.answer;
 function record(outcome){if(recorded.current)return;recorded.current=true;onAnswer(q.id,outcome,q.skill);}
 function success(){busy.current=true;record(attempts===0&&!hint?'first':'hint');setPhase('correct');setPicked(null);
  if(settings.effects!==false)playEffect('correct');later(()=>{say(q.feedback);busy.current=false;},450);}
 function demonstrate(){record('shown');setPhase('shown');setPicked(null);if(q.activity==='order')setPlaced(q.answer.map(t=>q.options.find(o=>o.text===t).id));say(`Watch: ${q.feedback}`,`Look: ${q.feedback}`);}
 function miss(id){const n=attempts+1;setAttempts(n);if(id&&q.activity!=='order')setWrong(w=>[...w,id]);setPicked(null);
  if(n>=2){demonstrate();return;}
  setHint(true);say(`Let's try together. ${q.hint}`,'Let’s try together.');}
 const ready=phase==='ask'&&!paused&&!busy.current;
 function choose(id){if(!ready||wrong.includes(id))return;if(id===q.answer)success();else miss(id);}
 function feed(foodId,animal){if(!ready||wrong.includes(foodId))return;const s=q.answer[step];
  if(foodId===s.food&&animal===s.animal){if(step+1<q.answer.length){setStep(step+1);setPicked(null);if(settings.effects!==false)playEffect('correct');say(`Yes! Now the ${q.answer[step+1].animal}.`);}else success();}
  else miss(foodId===s.food?null:foodId);}
 function place(id){if(!ready)return;const o=q.options.find(x=>x.id===id);if(placed.includes(id)){setPlaced(p=>p.filter(x=>x!==id));return;}sayEnglish(o.text.replace(/\.$/,''),voiceOn);setPlaced(p=>[...p,id]);}
 function checkOrder(){if(!ready)return;const words=placed.map(id=>q.options.find(o=>o.id===id).text);if(words.join(' ')===q.answer.join(' '))success();else{let keep=0;while(keep<words.length&&words[keep]===q.answer[keep])keep++;setPlaced(p=>p.slice(0,keep));miss(null);}}
 const finished=phase!=='ask';
 const reveal=o=>finished&&o.label;
 const optionClass=o=>`gm-option ${wrong.includes(o.id)?'gm-wrong':''} ${finished&&o.id===correctId?'gm-right':''} ${phase==='shown'&&o.id===correctId?'gm-demo':''} ${picked===o.id?'gm-picked':''}`;
 const optionBody=o=><>{o.picture&&<Pic src={o.picture} size={o.size}/>}{o.group&&<Group picture={o.group.picture} count={o.group.count}/>}{o.scene&&<Scene scene={o.scene}/>}{o.sound&&<span className="gm-sound-label" lang="en">{o.label}</span>}{o.text!==undefined&&!o.sound&&<span className={`gm-option-text ${o.sentence?'gm-sentence':''}`} lang="en" dir="ltr">{o.text}</span>}{reveal(o)&&!o.sentence&&!o.sound&&o.text===undefined&&<span className="gm-option-label" lang="en">{o.label}</span>}</>;
 const p=q.prompt||{};
 const mood=phase==='correct'?'happy':attempts>0&&phase==='ask'?'thinking':'idle';
 return <div className="gm-question" data-qid={q.id} data-phase={phase}>
  <div className="gm-stage">
   <figure className={`gm-mascot gm-${mood} ${settings.reducedMotion?'gm-still':''}`}><img src={mascot} alt=""/></figure>
   <div className="gm-task">
    <p className="gm-instruction" lang="en" dir="ltr">{q.instruction.en}</p>
    <PsLine q={q} open={ps} onToggle={()=>setPs(v=>!v)}/>
    <div className="gm-task-tools"><button className="gm-btn gm-round-btn" onClick={instruction} aria-label="Hear the instruction again">🔊<span>Listen</span></button><button className="gm-btn gm-round-btn" disabled={finished} onClick={()=>{setHint(true);sayEnglish(q.hint,voiceOn);}} aria-label="Hint">💡<span>Hint</span></button></div>
    {hint&&!finished&&<p className="gm-hint" lang="en">{q.hint}</p>}
   </div>
   {bubble&&!finished&&<p className="gm-bubble" aria-live="polite" lang="en">{bubble}</p>}
  </div>
  <Prompt q={q} p={p} voiceOn={voiceOn} playSound={playSound} finished={finished} feedHandlers={{feed,picked,step,ready,demo:phase==='shown',voiceOn}}/>
  {q.activity==='word-tap'&&<div className="gm-word-tiles" role="group" aria-label="Letters of the word">{q.options.map(o=><button key={o.id} data-option={o.id} className={optionClass(o)} disabled={finished&&o.id!==correctId} onClick={()=>choose(o.id)} lang="en">{o.text}</button>)}</div>}
  {['choice','letter-grid','feed-to'].includes(q.activity)&&<div className={`gm-options gm-n${q.options.length} ${q.activity==='letter-grid'?'gm-grid':''} ${q.options.some(o=>o.scene)?'gm-scenes':''} ${q.options.some(o=>o.sentence)?'gm-sentences':''}`} role="group" aria-label="Choices">
   {q.options.map(o=><button key={o.id} data-option={o.id} className={optionClass(o)} disabled={wrong.includes(o.id)||(finished&&o.id!==correctId)} aria-label={o.text||(finished?o.label:`Choice ${q.options.indexOf(o)+1}`)} onClick={()=>choose(o.id)}>{optionBody(o)}</button>)}
  </div>}
  {q.options.some(o=>o.sound&&hasRecording(o.sound.recording))&&<div className="gm-words" aria-label="Hear each sound">{q.options.filter(o=>o.sound&&hasRecording(o.sound.recording)).map(o=><button key={o.id} className="gm-word" onClick={()=>playSound(o.sound)}>🔊 {o.label}</button>)}</div>}
  {q.activity==='feed'&&<div className={`gm-options gm-n${q.options.length} gm-food`} role="group" aria-label="Food to give">
   {q.options.map(o=><FoodButton key={o.id} o={o} className={optionClass(o)} disabled={wrong.includes(o.id)||finished} onPick={()=>{if(ready)setPicked(picked===o.id?null:o.id);}} onDrop={animal=>feed(o.id,animal)} reduced={settings.reducedMotion}>{optionBody(o)}</FoodButton>)}
  </div>}
  {q.activity==='order'&&<div className="gm-order">
   <div className="gm-order-line" aria-label="Your sentence">{placed.length?placed.map(id=>{const o=q.options.find(x=>x.id===id);return <button key={id} className="gm-tile gm-placed" onClick={()=>place(id)} lang="en">{o.text}</button>;}):<span className="gm-muted">Tap the words in order.</span>}</div>
   <div className="gm-order-pool">{q.options.filter(o=>!placed.includes(o.id)).map(o=><button key={o.id} data-option={o.id} className="gm-tile" onClick={()=>place(o.id)} lang="en">{o.text}</button>)}</div>
   {!finished&&<button className="gm-btn gm-primary" disabled={placed.length!==q.options.length} onClick={checkOrder}><Bi en="Check" ps="جواب چیک کړئ"/></button>}
  </div>}
  {phase==='ask'&&attempts>0&&<p className="gm-together" role="status"><Bi en="Let’s try together." ps={ui.tryTogether}/></p>}
  {finished&&<div className={`gm-feedback ${phase==='shown'?'gm-feedback-shown':''}`} role="status">
   <p lang="en">{phase==='shown'?<><b>Look:</b> {q.feedback}</>:<><b>{attempts===0&&!hint?'You got it on the first try!':'You kept trying and found it!'}</b> {q.feedback}</>}</p>
   {phase==='correct'&&<PsOnly text={attempts===0&&!hint?approved.firstTry:approved.keptTrying}/>}
   <WordButtons q={q} voiceOn={voiceOn}/>
   <button className="gm-btn gm-primary gm-big" autoFocus onClick={()=>{stopSpeech();onNext();}}>{last?<Bi en="See what you learned" ps={approved.whatLearned}/>:<Bi en="Next" ps={approved.next}/>}</button>
  </div>}
 </div>;
}
// Pashto help: the drafted explanation plus word meanings, hidden until tapped (absent with English only).
// Urdu help (learner chose Urdu): the question's Urdu line with a speaker. Drafts, see docs/URDU.md.
function UrLine({q,open,onToggle}){
 const ur=q.instruction.ur?.text;if(!ur)return null;
 return <div className="gm-ps-help">{['choice','letter-grid','feed-to'].includes(q.activity)&&<PsText className="gm-ps-ask" text={urduGameUi.ask} lang="ur"/>}
  <button className="gm-btn gm-ghost gm-ps-toggle" aria-expanded={open} onClick={onToggle}><PsText text={urduGameUi.help} lang="ur"/></button>
  {open&&<div className="gm-ps-box"><PsText text={ur} lang="ur"/><UrduSpeaker text={ur}/></div>}
 </div>;
}
function PsLine({q,open,onToggle}){
 const {language}=useAudio();
 if(language==='en')return null;
 if(['ur','rur'].includes(language))return <UrLine q={q} open={open} onToggle={onToggle}/>;
 return <div className="gm-ps-help">{['choice','letter-grid','feed-to'].includes(q.activity)&&<PsText className="gm-ps-ask" text={approved.whichCorrect}/>}
  <button className="gm-btn gm-ghost gm-ps-toggle" aria-expanded={open} onClick={onToggle}><PsText text={approved.pashtoHelp}/></button>
  {open&&<div className="gm-ps-box"><PsText text={q.instruction.ps.text}/>{q.gloss.length>0&&<ul className="gm-gloss">{q.gloss.map(g=><li key={g.en}><bdi lang="en" dir="ltr">{g.en}</bdi> — <PsText text={g.ps}/></li>)}</ul>}</div>}
 </div>;
}
// English learning words of the question: tap to hear each one.
function WordButtons({q,voiceOn}){
 const words=[...new Set([q.prompt?.word,q.blendWord,q.prompt?.wordAudio,...q.options.filter(o=>o.label&&!o.scene&&!o.sound&&!o.group).map(o=>o.label)].filter(Boolean))].slice(0,6);
 if(!words.length)return null;
 return <div className="gm-words" aria-label="Tap a word to hear it">{words.map(w=><button key={w} className="gm-word" lang="en" onClick={()=>sayEnglish(w,voiceOn)}>🔊 {w}</button>)}</div>;
}
// What the question shows above the choices.
function Prompt({q,p,voiceOn,playSound,finished,feedHandlers}){
 const parts=[];
 if(p.letterName)parts.push(<p key="ln" className="gm-search-note" lang="en">Look carefully at every letter.</p>);
 if(p.big)parts.push(<span key="big" className="gm-big-text" lang="en" dir="ltr">{p.big}</span>);
 if(p.sub)parts.push(<span key="sub" className="gm-sub-text" lang="en">{p.sub}</span>);
 if(p.picture)parts.push(<span key="pic" className="gm-prompt-pic"><Pic src={p.picture} size="lg"/></span>);
 if(p.word&&q.activity!=='word-tap')parts.push(<button key="w" className="gm-word gm-word-lg" lang="en" onClick={()=>sayEnglish(p.word,voiceOn)}>🔊 {p.word}</button>);
 if(q.activity==='word-tap'&&p.picture)parts.push(<button key="wa" className="gm-word" lang="en" onClick={()=>sayEnglish(p.word||q.options.map(o=>o.text).join(''),voiceOn)}>🔊 Hear the word</button>);
 if(p.wordAudio)parts.push(<button key="wa" className="gm-word gm-word-lg" lang="en" onClick={()=>sayEnglish(p.wordAudio,voiceOn)} aria-label={`Hear the word ${p.wordAudio}`}>🔊 {finished||!q.revealWord?p.wordAudio:'Hear the word'}</button>);
 if(p.sound)parts.push(<SoundPrompt key="snd" s={p.sound} hide={p.hideGrapheme&&!finished} voiceOn={voiceOn} playSound={playSound}/>);
 if(p.sounds)parts.push(<div key="blend" className="gm-blend">{p.sounds.map((s,i)=><button key={i} className="gm-sound-tile" onClick={()=>playSound(s)} lang="en" aria-label={`Sound ${s.grapheme}`}>{s.grapheme}{hasRecording(s.recording)&&<small aria-hidden="true">🔊</small>}</button>)}{q.blendWord&&slowBlend(q.blendWord)&&hasRecording(slowBlend(q.blendWord))&&<button className="gm-word" onClick={()=>playCourseClip(slowBlend(q.blendWord))}>🔊 Blend slowly</button>}</div>);
 if(p.sequence)parts.push(<span key="seq" className="gm-sequence" lang="en" dir="ltr">{p.sequence.map((x,i)=><span key={i} className={x===null?'gm-gap':''}>{x===null?'?':x}</span>)}</span>);
 if(p.group)parts.push(<span key="g" className="gm-prompt-group"><Group picture={p.group.picture} count={p.group.count}/></span>);
 if(p.groups)parts.push(<span key="gs" className="gm-add">{p.groups.map((g,i)=><span key={i} className="gm-add-part">{i>0&&<b aria-hidden="true">+</b>}<Group picture={g.picture} count={g.count}/></span>)}</span>);
 if(p.scene)parts.push(<span key="sc" className="gm-prompt-scene"><Scene scene={p.scene} big/></span>);
 if(p.food)parts.push(<span key="f" className="gm-carry"><Pic src={p.food.picture} size="lg"/><button className="gm-word" lang="en" onClick={()=>sayEnglish(p.food.label,voiceOn)}>🔊 {p.food.label}</button></span>);
 if(p.animals)parts.push(<Animals key="an" q={q} animals={p.animals} {...feedHandlers}/>);
 return parts.length?<div className="gm-prompt">{parts}</div>:null;
}
// A phoneme plays only from a real recording. Without one, the screen offers a key word instead (device speech
// says whole words correctly but must never stand in for a letter sound).
function SoundPrompt({s,hide,voiceOn,playSound}){
 const recorded=hasRecording(s.recording);
 return <div className="gm-sound-prompt">
  {recorded?<button className="gm-btn gm-primary gm-big" onClick={()=>playSound(s)}>🔊 Hear the sound{!hide&&<> /{s.grapheme}/</>}</button>:!hide&&<span className="gm-sound-tile gm-sound-lg" lang="en">/{s.grapheme}/</span>}
  {!recorded&&s.example&&<div className="gm-sound-fallback"><Pic src={s.examplePicture}/><p lang="en">{hide?'The sound at the start of':'This sound starts'} <button className="gm-word" onClick={()=>sayEnglish(s.example,voiceOn)}>🔊 {s.example}</button></p><small className="gm-muted">Recorded letter sounds are coming. Until then, listen to the first sound of the word, or ask a grown-up to say it.</small></div>}
 </div>;
}
// Animals to feed: tap a food, then tap the animal (or drag the food onto it).
function Animals({q,animals,feed,picked,step,ready,demo,voiceOn}){
 const next=q.answer[Math.min(step,q.answer.length-1)];
 return <div className="gm-animals">{animals.map(a=>{const fed=q.answer.slice(0,step).some(s=>s.animal===a.id);return <button key={a.id} data-animal={a.id} className={`gm-animal ${picked?'gm-ready':''} ${fed?'gm-fed':''} ${demo&&a.id===next.animal?'gm-demo':''}`} disabled={!ready} onClick={()=>{if(picked)feed(picked,a.id);else sayEnglish(a.id,voiceOn);}} aria-label={picked?`Feed the ${a.id}`:`The ${a.id}`}>
  <Pic src={a.picture} size="lg"/><span lang="en">{a.id}</span>{fed&&<span className="gm-yum" aria-hidden="true">✓</span>}</button>;})}
  {picked&&animals.length===1&&<button className="gm-btn gm-primary gm-big gm-feed-btn" onClick={()=>feed(picked,animals[0].id)}><Bi en={`Feed the ${animals[0].id}`} ps={ui.feed}/></button>}
  {!picked&&ready&&<p className="gm-muted gm-feed-note" lang="en">{q.answer.length>1&&step>0?`Now: the ${next.animal}. `:''}Tap a food, then tap the animal. You can also drag the food.</p>}
 </div>;
}
// Tap to choose; or drag onto an animal. Dragging is optional and never required.
function FoodButton({o,className,disabled,onPick,onDrop,children,reduced}){
 const drag=useRef(null),[ghost,setGhost]=useState(null);
 return <><button data-option={o.id} className={className} disabled={disabled} aria-label={`Choose this food${o.label&&disabled?': '+o.label:''}`}
  onPointerDown={e=>{if(disabled)return;drag.current={x:e.clientX,y:e.clientY,moved:false,id:e.pointerId};}}
  onPointerMove={e=>{const d=drag.current;if(!d)return;if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)>12){d.moved=true;try{e.currentTarget.setPointerCapture(d.id);}catch{/* optional */}}if(d.moved)setGhost({x:e.clientX,y:e.clientY});}}
  onPointerUp={e=>{const d=drag.current;drag.current=null;setGhost(null);if(d?.moved){const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-animal]');if(el)onDrop(el.dataset.animal);}}}
  onPointerCancel={()=>{drag.current=null;setGhost(null);}}
  onClick={()=>{if(!drag.current?.moved)onPick();}}>{children}</button>
  {ghost&&<span className={`gm-drag ${reduced?'gm-still':''}`} style={{left:ghost.x,top:ghost.y}} aria-hidden="true">{o.picture?<Pic src={o.picture}/>:o.group?<Group picture={o.group.picture} count={o.group.count} small/>:null}</span>}</>;
}

// ---------- end of round ----------
function RoundSummary({game,bank,summary,state,mascot,onContinue,onReview,onBreak,onMap}){
 const qs=summary.ids.map(id=>bank.byId[id]).filter(Boolean),bySkill={};
 for(const q of qs)(bySkill[q.skill]||=[]).push(q);
 const practiced=[...new Set(qs.map(q=>q.practiced))];
 const nextLevel=currentLevel(state),nextInfo=bank.levels[nextLevel-1],part=nextPart(state,nextLevel);
 const allDone=bank.levels.every(l=>levelDone(state,l.level));
 useEffect(()=>{const t=setTimeout(()=>{playEffect('celebrate');},300);return()=>clearTimeout(t);},[]);
 return <div className="gm-summary">
  <img className="gm-summary-mascot" src={mascot} alt=""/>
  <Bi as="h2" en={summary.kind==='review'?'Review finished!':'Well done, you completed the task!'} ps={approved.taskDone}/>
  <ul className="gm-done-list">{Object.entries(bySkill).map(([skill,list])=><li key={skill} lang="en">{skillLine(skill,list.length)}</li>)}</ul>
  <p lang="en"><b>{summary.first}</b> on your own · <b>{summary.helped}</b> with a little help{summary.shown?` (we looked at ${summary.shown} together)`:''}.</p>
  {summary.kind==='level'&&<p className="gm-stars" aria-label={`${summary.stars} of 3 stars`}>{[1,2,3].map(i=><span key={i} className={i<=summary.stars?'':'gm-dim'}>★</span>)}</p>}
  {summary.improved&&<p lang="en">Better than last time! +{summary.newStars} star{summary.newStars>1?'s':''}.</p>}
  {summary.kind==='level'&&!summary.newStars&&!summary.improved&&state.rounds[`${summary.level}-${summary.part}`]&&summary.stars<=state.rounds[`${summary.level}-${summary.part}`].stars&&<p className="gm-muted" lang="en">Great practice. Your best stars for this round are kept.</p>}
  {summary.badge&&<p className="gm-badge"><span aria-hidden="true">🏅</span> <Bi en={`New badge: ${game.title} explorer ${summary.badge.split('-')[1]}`} ps={approved.newBadge}/></p>}
  {summary.unlocked&&<p className="gm-unlock" lang="en">Level {summary.unlocked} is open now!</p>}
  <div className="gm-practised"><Bi as="h3" en="What you practised" ps={approved.whatLearned}/><p lang="en">{practiced.join(' · ')}</p></div>
  {summary.offerReview&&<div className="gm-review-card"><Bi as="p" en="Some of these needed help. Want a short review together?" ps={ui.reviewNote}/><button className="gm-btn" onClick={()=>onReview(summary.offerReview)}><Bi en="Review together" ps={ui.review}/></button></div>}
  {!allDone&&<p className="gm-next-preview" lang="en">Next: Level {nextLevel} · Round {part} — {nextInfo.title}</p>}
  <div className="gm-row">{!allDone&&<button className="gm-btn gm-primary gm-big" autoFocus onClick={onContinue}><Bi en="Continue" ps={approved.continueLearning}/></button>}<button className="gm-btn gm-big" onClick={onBreak}><Bi en="Take a break" ps={approved.takeBreak}/></button><button className="gm-btn gm-ghost" onClick={onMap}><Bi en="My levels" ps="زما درجې"/></button></div>
 </div>;
}
export {ROUND_SIZE};
