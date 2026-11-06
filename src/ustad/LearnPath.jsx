import {useMemo,useState} from 'react';
import WordPicture from './WordPicture.jsx';
import {Bi} from './firstSteps/Bilingual.jsx';
import {SayIt} from './firstSteps/activities.jsx';
import {sayWord} from './firstSteps/audio.js';
import {lessons as courseLessons} from './firstSteps/tasks.js';
import {continueIndex,isUnlocked,lessonPlace,skippedByTest} from './firstSteps/state.js';
import {hydrateCourse} from './firstSteps/store.js';
import {wordPhoto} from './wordPhotos.js';
import {classProgress,topicUnits,topicUnitById,topicUnitReached,topicReached,topics,topicWord,extraPractice,spellWords,playableGames,currentClass,gamesByClass,gameEntry,readableBy,sentenceReadable,unitWordReadable,pathLessonIndex} from './learningPath.js';
import './learnPath.css';

const numberWords={Eleven:11,Twelve:12,Thirteen:13,Fourteen:14,Fifteen:15,Sixteen:16,Seventeen:17,Eighteen:18,Nineteen:19,Twenty:20};
// The furthest lesson the learner has reached: words are readable only up to here.
function readingPoint(profile){const p=hydrateCourse(profile);let at=-1;courseLessons.forEach((l,i)=>{if(p.mastered[l.id])at=i;});return at;}
const shuffle=(list,seed)=>{let n=seed*9301+49297;return list.map(x=>{n=(n*9301+49297)%233280;return [n,x];}).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);};

// ---------- Learn: the class map (the one place that shows progress) ----------
export function LearnMap({profile,go}){
 const list=useMemo(()=>classProgress(profile),[profile]);
 const [open,setOpen]=useState(()=>currentClass(profile));
 const course=hydrateCourse(profile),next=continueIndex(course);
 return <section className="lp-map" data-no-support>
  <Bi as="h2" en="My classes" ps="زما ټولګي"/>
  {list.map(c=><article key={c.number} className={`lp-class ${c.complete?'lp-complete':''} ${c.current?'lp-current':''} ${c.unlocked?'':'lp-locked'}`}>
   <button className="lp-class-head" aria-expanded={open===c.number} onClick={()=>setOpen(open===c.number?0:c.number)}>
    <span className="lp-class-number" aria-hidden="true">{c.complete?'✓':c.unlocked?c.number:'🔒'}</span>
    <span className="lp-class-title"><Bi en={`Class ${c.number} · ${c.en}`} ps={`ټولګی ${c.number}${c.ps?' · '+c.ps:''}`}/><span className="lp-class-count">{c.done} / {c.total} {c.source==='course'?'lessons':'steps'}</span></span>
    <span className="lp-bar" aria-hidden="true"><span style={{width:`${c.total?Math.round(c.done/c.total*100):0}%`}}/></span>
   </button>
   {open===c.number&&<div className="lp-class-body">
    {!c.unlocked&&<Bi as="p" className="lp-note" en={`This class opens after Class ${c.number-1}.`} ps={`دا ټولګی د ${c.number-1} ټولګي نه پس پرانیستل کېږي.`}/>}
    {c.source==='course'?<CourseClass c={c} course={course} next={next} profile={profile} go={go}/>:<AdventureClass c={c} go={go}/>}
    <ExtraShelf number={c.number} unlocked={c.unlocked} go={go}/>
   </div>}
  </article>)}
 </section>;
}
function CourseClass({c,course,next,profile,go}){
 const ids=new Set(c.lessonIds);
 return <div className="lp-lessons">{courseLessons.map((l,at)=>{if(!ids.has(l.id))return null;
  const done=!!course.mastered[l.id],skipped=skippedByTest(course,at),openLesson=isUnlocked(course,at),place=lessonPlace(at),units=topicUnits.filter(u=>u.after===l.id);
  return [<button key={l.id} className={`lp-lesson ${done?'lp-done':''} ${skipped?'lp-skipped':''} ${at===next?'lp-next':''}`} disabled={!openLesson} onClick={()=>go('beginner-lesson',at)}>
    <span aria-hidden="true">{done?'✓':openLesson?'▶':'🔒'} <b className="lp-num" aria-label={`Lesson ${place.number}`}>{place.number}</b></span>
    {l.content.letters.length?<span className="lp-letters" lang="en" dir="ltr">{l.content.letters.join(' ')}</span>:<Bi en={l.title} ps={l.titlePs}/>}{skipped&&<Bi as="small" en="Skipped by test" ps="د ازموینې له مخې پرېښودل شو"/>}
   </button>,
   ...units.map(u=>{const reached=topicUnitReached(profile,u),seen=profile.completed?.includes(u.id);return <button key={u.id} className={`lp-lesson lp-topic ${seen?'lp-done':''}`} disabled={!reached} onClick={()=>go('topic-unit',topicUnits.indexOf(u))}>
    <span aria-hidden="true">{seen?'✓':reached?'★':'🔒'}</span><Bi en={u.en} ps={u.ps}/></button>;})];
 })}</div>;
}
function AdventureClass({c,go}){
 return <div className="lp-lessons">{c.lessons.map(l=><button key={l.id} className={`lp-lesson ${l.status==='done'?'lp-done':''} ${l.status==='current'?'lp-next':''}`} disabled={l.status==='later'} onClick={()=>go('path-lesson',l.index)}>
  <span aria-hidden="true">{l.status==='done'?'✓':l.status==='later'?'🔒':'▶'}</span><b lang="en">{l.title}</b></button>)}</div>;
}
// Extra practice: the best of the old sections, inside the class they belong to.
function ExtraShelf({number,unlocked,go}){
 const items=extraPractice[number]||[];if(!items.length||!unlocked)return null;
 return <details className="lp-extra"><summary><Bi en={`Extra practice (${items.length})`} ps={`نور مشق (${items.length})`}/></summary><div className="lp-extra-list">
  {items.map((x,i)=>x.kind==='spell'?<div key={i} className="lp-spell"><Bi as="p" en="Spell the words you can read" ps="هغه لفظونه ولیکئ چې لوستلی یې شئ"/><div>{spellWords(x.level).map(w=><button key={w.id} onClick={()=>go('spelling',w.index)} lang="en">{w.en.toLowerCase()}</button>)}</div></div>
   :<button key={i} onClick={()=>x.kind==='path'?go('path-lesson',pathLessonIndex(x.id)):go(x.page,x.index)}><small>{x.why}</small><span lang="en">{x.kind==='path'?x.why:x.en}</span></button>)}
 </div></details>;
}

// ---------- Topics library ----------
export function TopicsScreen({profile,go}){
 return <section className="lp-topics" data-no-support><Bi as="h1" en="Topics" ps="موضوعګانې"/><Bi as="p" en="Open any topic to listen. Topics you have reached in your class also have games." ps="هره موضوع پرانیزئ او واورئ. هغه موضوعګانې چې په ټولګي کې ورته رسېدلي یئ، لوبې هم لري."/>
  <div className="lp-topic-grid">{topics.map((t,i)=>{const reached=topicReached(profile,t.id);return <button key={t.id} className={`lp-topic-card ${reached?'lp-reached':''}`} onClick={()=>go('topic',i)}>
   <span className="lp-topic-pic"><WordPicture word={t.icon}/></span><Bi en={t.en} ps={t.ps}/><small>{reached?<Bi en="Listen + games" ps="اوریدل + لوبې"/>:<Bi en="Listen" ps="اوریدل"/>}</small></button>;})}</div>
 </section>;
}
// One topic from the library: everything to listen to; games once the topic is reached in a class.
export function TopicScreen({index,profile,go,complete}){
 const t=topics[index]||topics[0],reached=topicReached(profile,t.id),point=readingPoint(profile);
 const unitLike={id:'topic-library-'+t.id,topic:t.id,mode:'listen',words:t.words.map(w=>w.en),sentences:[],teaches:[]};
 return <TopicView title={{en:t.en,ps:t.ps}} unit={unitLike} readAt={point} games={reached} onBack={()=>go('topics')} complete={complete} back={{en:'All topics',ps:'ټولې موضوعګانې'}}/>;
}
// A topic unit inside a class.
export function TopicUnitScreen({index,profile,go,complete}){
 const u=topicUnits[index]||topicUnits[0],reached=topicUnitReached(profile,u);
 const at=courseLessons.findIndex(l=>l.id===u.after);
 if(!reached)return <section className="lp-topic-view"><Bi as="p" en="Finish the lesson before this topic first." ps="اول د دې موضوع نه مخکې سبق مکمل کړئ."/><button onClick={()=>go('home')}><Bi en="← My classes" ps="← زما ټولګي"/></button></section>;
 return <TopicView title={{en:u.en,ps:u.ps}} unit={u} readAt={at} games onBack={()=>go('home')} complete={complete} back={{en:'My classes',ps:'زما ټولګي'}}/>;
}
function TopicCardPicture({en}){const n=numberWords[en];return n?<span className="lp-numeral" aria-hidden="true">{n}</span>:wordPhoto(en)?<WordPicture word={en}/>:<span className="lp-numeral lp-noun" aria-hidden="true">📅</span>;}
function TopicView({title,unit,readAt,games,onBack,complete,back}){
 const [sayWordId,setSayWord]=useState(null),[game,setGame]=useState(null);
 const cards=unit.words.map(en=>({en,ps:topicWord(unit.topic,en).ps,readable:unit.mode!=='listen'&&unitWordReadable(readAt,unit,en)}));
 const sentences=unit.sentences.filter(s=>sentenceReadable(readAt,s,unit.teaches));
 const readable=cards.filter(c=>c.readable);
 return <section className="lp-topic-view" data-no-support>
  <div className="lp-topic-top"><button className="fs-icon" onClick={onBack} aria-label={`${back.en} · ${back.ps}`}>←</button><Bi as="h1" en={title.en} ps={title.ps}/></div>
  {game?<TopicGame kind={game} cards={game==='read'?readable:cards} sentences={sentences} onDone={()=>{complete?.(unit.id);setGame(null);}} onExit={()=>setGame(null)}/>:<>
  <div className="lp-cards">{cards.map(c=><button key={c.en} className="lp-word-card" onClick={()=>{sayWord(c.en);setSayWord(c.en);}} aria-label={`Hear ${c.en}`}>
   <TopicCardPicture en={c.en}/>{c.readable&&<span className="lp-word" lang="en" dir="ltr">{c.en.toLowerCase()}</span>}{c.ps&&<span className="lp-meaning" lang="ps" dir="rtl">{c.ps}</span>}<span aria-hidden="true">🔊</span></button>)}</div>
  {sentences.length>0&&<div className="lp-sentences">{sentences.map(s=><button key={s} onClick={()=>sayWord(s)} lang="en" dir="ltr">🔊 {s}</button>)}</div>}
  {sayWordId&&wordPhoto(sayWordId)&&<div className="lp-say"><SayIt task={{wordId:sayWordId,audioId:'',noVowelBefore:false}} play={()=>sayWord(sayWordId)}/></div>}
  {games&&<div className="lp-games"><button className="primary" onClick={()=>setGame('listen')}><Bi en="Game: listen and find" ps="لوبه: واورئ او پیدا یې کړئ"/></button>{readable.length>=3&&<button className="primary" onClick={()=>setGame('read')}><Bi en="Game: read and match" ps="لوبه: ولولئ او جوړه یې کړئ"/></button>}{sentences.length>=2&&<button className="primary" onClick={()=>setGame('sentence')}><Bi en="Game: which sentence?" ps="لوبه: کومه جمله؟"/></button>}</div>}
  </>}
 </section>;
}
// Short games: five rounds. Listen and find (hear a word, tap its picture), read and match (read a word the child
// can read, tap its picture), which sentence (hear a sentence, tap the printed one).
function TopicGame({kind,cards,sentences,onDone,onExit}){
 const pool=kind==='sentence'?sentences:cards.filter(c=>kind==='read'||numberWords[c.en]||wordPhoto(c.en)||!kind);
 const rounds=useMemo(()=>shuffle(pool,pool.length).slice(0,5),[pool.length]);// eslint-disable-line react-hooks/exhaustive-deps
 const [round,setRound]=useState(0),[wrong,setWrong]=useState(''),[right,setRight]=useState(false);
 if(pool.length<2)return <Bi as="p" en="This game needs more words." ps="دې لوبې ته نور لفظونه پکار دي."/>;
 const target=rounds[round],id=x=>x.en||x,options=shuffle([target,...shuffle(pool.filter(x=>id(x)!==id(target)),round+3).slice(0,2)],round+7);
 const hear=()=>sayWord(id(target));
 function choose(x){if(right)return;if(id(x)===id(target)){setRight(true);setWrong('');setTimeout(()=>{setRight(false);if(round+1>=rounds.length)onDone();else setRound(round+1);},900);}else setWrong(id(x));}
 return <div className="lp-game"><div className="lp-game-top"><span>{round+1} / {rounds.length}</span><button onClick={onExit}><Bi en="Stop" ps="ودروئ"/></button></div>
  {kind==='read'?<p className="lp-game-word" lang="en" dir="ltr">{id(target).toLowerCase()}</p>:<button className="primary lp-hear" onClick={hear} autoFocus><Bi en="🔊 Listen" ps="🔊 واورئ"/></button>}
  <div className="lp-game-options">{options.map(x=><button key={id(x)} className={`${wrong===id(x)?'lp-wrong':''} ${right&&id(x)===id(target)?'lp-right':''}`} onClick={()=>choose(x)} aria-label={kind==='sentence'?id(x):`Picture: ${id(x)}`}>
   {kind==='sentence'?<span lang="en" dir="ltr">{x}</span>:<TopicCardPicture en={id(x)}/>}</button>)}</div>
  {wrong&&<Bi as="p" className="fs-feedback" en="Good try. Listen again and choose once more." ps="ښه کوشش مو وکړ. بیا واورئ او یو ځل بیا یې غوره کړئ."/>}
 </div>;
}

// ---------- Play: games for the current and completed classes ----------
export function PlayScreen({profile,go}){
 const games=playableGames(profile),now=currentClass(profile),nextClass=Object.keys(gamesByClass).map(Number).find(n=>n>now&&gamesByClass[n].length);
 return <section className="lp-play" data-no-support><Bi as="h1" en="Play" ps="لوبې"/>
  <div className="lp-game-grid">{games.map(g=><button key={g.id} className="lp-game-card" onClick={()=>go(g.page,g.index)}><span className="lp-game-emoji" aria-hidden="true">{g.emoji}</span><span lang="en">{g.title}</span><small>Class {g.classNumber}</small></button>)}</div>
  {nextClass&&<Bi as="p" className="lp-note" en={`More games open in Class ${nextClass}: ${gamesByClass[nextClass].map(id=>gameEntry(id).title).join(', ')}.`} ps={`نورې لوبې په ${nextClass} ټولګي کې پرانیستل کېږي.`}/>}
 </section>;
}
export {readableBy,topicUnitById};
