import {useEffect,useState} from 'react';
import {useAudio} from '../soundEngine.js';
import {course,gpcs} from './tasks.js';
import {Bi} from './Bilingual.jsx';
import {Picture,English} from './parts.jsx';
import Trace from './Trace.jsx';
import {canPlay,soundLetters} from './audio.js';
// Level 1 activity components. Each draws one task from the approved curriculum data and talks
// to the lesson only through `event` (ANSWER, PLACE, UNDO, DOT, DELIVERED) and `play(clipId)`;
// the pass and unlock rules stay in state.js. `ctx` is built by TaskFrame for every task.
const letterNameClip=c=>course.alphabet.find(x=>x.lower===String(c).toLowerCase())?.letterNameAudioId;
const isShape=text=>/^[○△□◇]$/.test(text);
// The sound to hear before answering, plus the grown-up reader option.
function SoundPrompt({task,play,liveReader,teacher}){
 const id=task.cue?.audioId;if(!id)return null;
 // A pure sound with no recording yet shows its letters instead of a silent Listen button.
 if(!canPlay(id))return soundLetters(id)?<div className="fs-prompt"><div className="fs-sound-letter" aria-label={`The sound of ${soundLetters(id)}`}>{soundLetters(id)}</div>{liveReader&&task.cue.requiresDelivery&&<button onClick={()=>teacher([...(task.preClips||[]),id])}><Bi en="A grown-up says the sound" ps="مشر دې اواز ووایي"/></button>}</div>:null;
 return <div className="fs-prompt"><button className="primary fs-big-button" onClick={()=>play(id)}><span aria-hidden="true">🔊</span><Bi en="Listen" ps="واورئ"/></button>{liveReader&&task.cue.requiresDelivery&&<button onClick={()=>teacher([...(task.preClips||[]),task.cue.audioId])}><Bi en="A grown-up says the sound" ps="مشر دې اواز ووایي"/></button>}</div>;
}
// Answer cards: letters, shapes or pictures. Picture choices that must be heard first get a speaker.
function OptionGrid({task,options,session,event,play,word,size='big'}){
 const locked=session.currentSolved||!!task.cue?.requiresDelivery&&!session.listened.includes(task.cue.audioId)||(task.preClips||[]).some(id=>!session.listened.includes(id));
 return <div className={`fs-options fs-options-${size}`}>{options.map(o=><div className="fs-option" key={o.id}>
  <button className={`fs-card ${session.currentSolved&&o.id===task.answer?'fs-done':''} ${isShape(o.text)?'fs-shape':''} ${(session.tries[task.id]||0)>=2&&!session.currentSolved&&o.id===task.answer?'fs-answer-hint':''}`} disabled={locked} onClick={()=>event({type:'ANSWER',value:o.id})} aria-label={o.picture?`Picture: ${o.pictureWord}`:isShape(o.text)?'Shape':`Letter ${o.text}`}>{o.picture?<Picture word={o.pictureWord} emoji={o.picture}/>:o.text}</button>
  {o.audioText&&(!o.audioId||canPlay(o.audioId))?<button className="fs-hear-choice" onClick={()=>o.audioId?play(o.audioId):word(o.audioText)} aria-label={`Hear ${o.audioText}`}>🔊</button>:null}
 </div>)}</div>;
}
// LetterIntro: the fox presents the letter; tapping the letters says the letter name, the sound card
// plays the pure sound, and the picture says its word (the word is not printed before it is taught).
export function LetterIntro({task,play}){
 return <div className="fs-intro">
  <img className="fs-fox fs-fox-hello" src="/explorers/avatar-fox.png" alt=""/>
  {task.letters?.length>0&&<div className="fs-intro-letters">{task.letters.map(l=><button key={l} className="fs-big-letter" onClick={()=>play(letterNameClip(l))} aria-label={`Hear the letter name ${l}`}>{l}</button>)}</div>}
  {task.newGpcs?.length>0&&<div className="fs-model-cards">{task.newGpcs.map(id=>canPlay(gpcs[id].recordingId)?<button key={id} className="fs-grapheme" onClick={()=>play(gpcs[id].recordingId)} aria-label={`Hear the sound of ${gpcs[id].spelling}`}>{gpcs[id].spelling}<small aria-hidden="true">🔊</small></button>:<span key={id} className="fs-grapheme">{gpcs[id].spelling}</span>)}</div>}
  {task.oralPicture&&(canPlay(task.oralPicture.audioId)?<button className="fs-picture-word" onClick={()=>play(task.oralPicture.audioId)}><Picture word={task.oralPicture.text}/><Bi en="Hear the picture word" ps="د تصویر لفظ واورئ"/></button>:<span className="fs-picture-word"><Picture word={task.oralPicture.text}/></span>)}
  {task.reviewLetters?.length>0&&<div className="fs-model-cards">{task.reviewLetters.map(c=><button key={c} className="fs-big-letter fs-small" onClick={()=>play(letterNameClip(c))} aria-label={`Hear the letter name ${c}`}>{c.toUpperCase()} {c}</button>)}</div>}
 </div>;
}
// LetterTap: one button says the letter's name, the other its sound. Both must be heard.
export function LetterTap({task,play,liveReader,teacher}){
 // A tick shows what the child has tapped (the sounds already count as heard when the activity opens).
 const [tapped,setTapped]=useState([]),heard=id=>tapped.includes(id);
 return <div className="fs-lettertap">
  <div className="fs-letter">{task.letter.toUpperCase()} {task.letter}</div>
  <div className="fs-listen">{task.requiredClips.map((id,i)=>!canPlay(id)?<span key={id} className="fs-big-button fs-sound-card"><Bi en="Letter sound" ps="د ټکي اواز"/><b>{soundLetters(id)||task.letter}</b></span>:<button key={id} className={`fs-big-button ${heard(id)?'fs-done':''}`} onClick={()=>{setTapped(list=>list.includes(id)?list:[...list,id]);play(id);}}><span aria-hidden="true">{i===0?'🔤':'🔊'}</span>{i===0?<Bi en="Letter name" ps="د ټکي نوم"/>:<Bi en="Letter sound" ps="د ټکي اواز"/>}{heard(id)&&<span aria-label="heard"> ✓</span>}</button>)}</div>
  {liveReader&&<button onClick={()=>teacher(task.requiredClips)}><Bi en="A grown-up says the name and sound" ps="مشر دې نوم او اواز ووایي"/></button>}
 </div>;
}
// MatchCase: the capital letter waits on the left; tap its small letter on the right.
// It places [capital, small] in order and answers, so the existing build rules score it.
export function MatchCase({task,tiles,session,event}){
 const capital=tiles.find(t=>t.text===task.tokens[0]),choices=tiles.filter(t=>t!==capital);
 const chosen=session.placed.length===2?tiles.find(t=>t.id===session.placed[1]):null;
 function choose(tile){
  if(session.currentSolved)return;
  if(session.placed.length===2)event({type:'UNDO'});
  if(!session.placed.includes(capital.id))event({type:'PLACE',id:capital.id});
  event({type:'PLACE',id:tile.id});event({type:'ANSWER'});
 }
 return <div className="fs-matchcase">
  <div className={`fs-card fs-match-capital ${session.currentSolved?'fs-done':''}`} aria-label={`Capital ${capital.text}`}>{capital.text}</div>
  <span className="fs-match-link" aria-hidden="true">{session.currentSolved?'＝':'↔'}</span>
  <div className="fs-match-choices">{choices.map(t=><button key={t.id} className={`fs-card ${chosen?.id===t.id?(session.currentSolved?'fs-done':'fs-wrong'):''} ${isShape(t.text)?'fs-shape':''} ${(session.tries[task.id]||0)>=2&&!session.currentSolved&&t.text===task.tokens[1]?'fs-answer-hint':''}`} disabled={session.currentSolved} onClick={()=>choose(t)} aria-label={isShape(t.text)?'Shape':`Small letter ${t.text}`}>{t.text}</button>)}</div>
 </div>;
}
// FindLetter: find the shown (or heard) letter among the cards.
export function FindLetter(ctx){
 const {task}=ctx;
 return <div className="fs-findletter"><SoundPrompt {...ctx}/>{task.cue?.text&&<div className="fs-letter fs-target" aria-label={`Find ${task.cue.text}`}>{task.cue.text}</div>}<OptionGrid {...ctx}/></div>;
}
// TraceLetter: trace with a finger, or tap the numbered dots in order. Tapping the letter says its name.
export function TraceLetter({task,session,event,play,paused}){
 return <div className="fs-traceletter"><button className="fs-big-letter fs-small" onClick={()=>play(letterNameClip(task.letter))} aria-label={`Hear the letter name ${task.letter}`}>{task.letter.toUpperCase()} {task.letter}</button><Trace letter={task.letter} session={session} send={event} disabled={paused}/></div>;
}
// PictureSound: hear a sound, then pick the picture whose word begins with it.
export function PictureSound(ctx){
 return <div className="fs-picturesound"><SoundPrompt {...ctx}/><OptionGrid {...ctx} size="pictures"/></div>;
}
// ReviewCheck: the five-item gate. Shows which item this is, then the same answer components
// (answer positions are shuffled for every new check round by taskOptions/taskTiles).
export function ReviewCheck(ctx){
 const {task,lesson}=ctx,checks=lesson.tasks.filter(t=>t.stage==='check'),n=checks.findIndex(t=>t.id===task.id)+1;
 const body=task.mode==='build'?<MatchCase {...ctx}/>:task.options?.some(o=>o.picture)?<PictureSound {...ctx}/>:<FindLetter {...ctx}/>;
 return <div className="fs-reviewcheck"><div className="fs-check-progress" aria-label={`Check item ${n} of ${checks.length}`}>{checks.map((t,i)=><span key={t.id} className={i<n-1?'done':i===n-1?'now':''}/>)}</div>{body}</div>;
}
// Celebration: the fox jumps, confetti falls and the lesson's own achievement is shown and spoken.
export function Celebration({task,word}){
 return <div className="fs-celebration fs-celebrate-burst"><div className="fs-confetti" aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i} style={{'--i':i}}>{['🎉','⭐','🌟','✨'][i%4]}</span>)}</div><img className="fs-fox-jump" src="/explorers/avatar-fox.png" alt=""/><Bi as="p" en={task.achievement.en||(task.achievement.enEditorialGoal?'Well done! '+task.achievement.enEditorialGoal:'Well done!')} ps={task.achievement.ps}/>{task.enTarget&&<English text={task.enTarget} onWord={word}/>}</div>;
}
// PictureWords: each card is a picture, its English word (tap to hear) and its Pashto meaning. The English
// word is printed only once the child can read it (task.cards[].label); before that it is heard, not read.
export function PictureWords({task,play}){
 const {language}=useAudio(),[heard,setHeard]=useState([]);
 return <div className="fs-picturewords">{task.cards.map(card=><button key={card.id} className={`fs-word-card ${heard.includes(card.id)?'fs-done':''}`} onClick={()=>{setHeard(h=>h.includes(card.id)?h:[...h,card.id]);play(card.audioId);}} aria-label={`Hear ${card.id}`}>
  <Picture word={card.id}/>{card.label&&<span className="fs-word-label" lang="en" dir="ltr">{card.label}</span>}
  {language!=='en'&&card.ps&&<span className="fs-word-meaning" lang="ps" dir="rtl">{card.ps}</span>}<span className="fs-word-hear" aria-hidden="true">🔊{heard.includes(card.id)?' ✓':''}</span></button>)}</div>;
}
// SayIt: listen and practise aloud without recording.
export function SayIt({task,play}){
 return <div className="fs-sayit"><button className="fs-word-card" onClick={()=>play(task.audioId)} aria-label={`Hear ${task.wordId}`}><Picture word={task.wordId}/><span className="fs-word-hear" aria-hidden="true">🔊</span></button>
  {task.noVowelBefore&&<p className="fs-word-label" lang="en" dir="ltr">{task.wordId}, not i{task.wordId}</p>}
  <Bi as="p" en="Listen, then say the word aloud." ps="واورئ، بیا لفظ په لوړ اواز ووایئ."/></div>;
}
// ReadingDirection: English is read from left to right. Fox walks along three pictures left to right and
// each one lights up in turn; Pashto, read right to left, is shown for comparison.
export function ReadingDirection({task}){
 const [step,setStep]=useState(0);
 useEffect(()=>{if(step>=4)return;const timer=setTimeout(()=>setStep(s=>s+1),900);return()=>clearTimeout(timer);},[step]);
 return <div className="fs-direction">
  <div className="fs-direction-row" dir="ltr">{task.pictures.map((w,i)=><span key={w} className={`fs-direction-card ${step===i+1?'fs-reading-word':''} ${step>i+1?'fs-done':''}`}><Picture word={w}/></span>)}</div>
  <div className="fs-ltr-arrow" aria-hidden="true"/>
  <Bi as="p" className="fs-direction-label" en="English: left → right" ps="انګلیزي له کیڼ اړخ نه ښي اړخ ته لوستل کېږي."/>
  <p className="fs-direction-compare"><span lang="ps" dir="rtl">پښتو ←</span> <span lang="en" dir="ltr">English →</span></p>
  <button onClick={()=>setStep(0)}><Bi en="Show me again" ps="بیا یې راوښیئ"/></button>
 </div>;
}
// Chant: a short rhythmic line with an action. It plays once by itself; the button repeats it.
export function Chant({task,play}){
 useEffect(()=>{const timer=setTimeout(()=>play(task.audioId),400);return()=>clearTimeout(timer);},[task.id]);// eslint-disable-line react-hooks/exhaustive-deps
 return <div className="fs-chant"><img className="fs-fox fs-fox-hello" src="/explorers/avatar-fox.png" alt=""/><p className="fs-chant-line" lang="en" dir="ltr">{task.chant}</p>
  <button className="primary fs-big-button" onClick={()=>play(task.audioId)}><span aria-hidden="true">🔊</span><Bi en="Hear the chant" ps="ترانه واورئ"/></button>
  <Bi as="p" className="fs-chant-action" en={`Action: ${task.actionEn}`} ps={`حرکت: ${task.actionPs}`}/></div>;
}
// Level 1 activity types from the approved curriculum, mapped to their components.
const level1Activities={ReadingDirection,CharacterExample:LetterIntro,LetterTap,MatchPairs:MatchCase,FindLetter,TraceLetter,InitialSoundPicture:PictureSound,SoundMatch:FindLetter,PictureWords,SayIt,Chant,IndependentCheck:ReviewCheck,Celebration};
const letterPair=task=>task.tokens?.length===2&&task.tokens.every(x=>x.length===1);
// The component for a task, or null to use the general layout (other levels, or any check item that is not a letter pair).
const anyLevelActivities={PictureWords,SayIt};
export function activityFor(lesson,task){if(anyLevelActivities[task.activityType])return anyLevelActivities[task.activityType];if(lesson.level!==1)return null;if(task.activityType==='IndependentCheck'&&task.mode==='build'&&!letterPair(task))return null;return level1Activities[task.activityType]||null;}
