import WordPicture from './WordPicture.jsx';
import {useMemo,useState} from 'react';
import {words} from './content.js';
import {shuffle} from './engine.js';
import {Translation,Explain} from './shared.jsx';
import {Icon} from './ExplorerArt.jsx';
import {playEffect,completionId} from './soundEngine.js';
import {HearWord,PashtoHelp,CelebrationBurst,useAutoInstruction} from './SoundKit.jsx';
import {useAutoNext} from './learnerPrefs.js';
// Picture-first vocabulary games for beginners: look & learn, name the picture, find the picture and letter puzzles.
const pictureCategories=['All',...new Set(words.map(w=>w.category))];
const ROUND=5;
const modes=[
 {id:'learn',emoji:'👀',title:'Look & learn',copy:'See the picture, hear the word and learn its meaning.'},
 {id:'name',emoji:'🖼️',title:'Name the picture',copy:'Look at the picture. Choose its English word.'},
 {id:'find',emoji:'🔍',title:'Find the picture',copy:'Listen to the word. Tap the matching picture.'},
 {id:'puzzle',emoji:'🧩',title:'Letter puzzle',copy:'Put the letters in order to spell the picture.'}
];
const cheers=['🎉','⭐','🌟','✨','🎈'];
function Celebrate(){return <div className="pw-confetti" aria-hidden="true">{Array.from({length:10},(_,i)=><span key={i} style={{'--i':i}}>{cheers[i%cheers.length]}</span>)}</div>;}
function Instruction({text,language}){useAutoInstruction(text);return <div className="pw-instruction"><p>{text}</p><Explain text={text} language={language}/></div>;}
function makeRound(pool,mode){
 const list=mode==='puzzle'?pool.filter(w=>w.en.length<=7):pool;
 return shuffle(list).slice(0,ROUND).map(word=>{
  const others=shuffle(words.filter(w=>w.id!==word.id&&w.emoji!==word.emoji&&(pool.length>=4?w.category===word.category:true)));
  const extra=others.length>=3?others:shuffle(words.filter(w=>w.id!==word.id));
  const count=mode==='find'?4:3;
  return {word,options:shuffle([word,...extra.slice(0,count-1)]),tiles:shuffle([...word.en.toLowerCase()].map((label,id)=>({label,id})))};
 });
}
export default function PictureWords({index=0,language,speak,onWord,complete,go,reducedMotion=false,initialMode=null}){
 const category=pictureCategories[index%pictureCategories.length];
 const pool=useMemo(()=>category==='All'?words:words.filter(w=>w.category===category),[category]);
 const [mode,setMode]=useState(initialMode),[round,setRound]=useState(0);
 const motion=reducedMotion?'pw-still':'';
 return <section className={`picture-words ${motion}`}>
  <div className="explorer-page-title"><p className="section-kicker">SEE IT · HEAR IT · KNOW IT</p><h1>Picture words</h1><Explain text="Picture words" language={language}/><p>{pool.length} picture words in {category==='All'?'every group':category}.</p></div>
  <div className="pw-categories" role="group" aria-label="Choose a word group">{pictureCategories.map((c,i)=>{const first=words.find(w=>c==='All'||w.category===c);return <button key={c} className={i===index%pictureCategories.length?'chosen':''} aria-pressed={i===index%pictureCategories.length} onClick={()=>{setMode(null);go('picture-words',i);}}><span aria-hidden="true">{c==='All'?'🌈':<WordPicture word={first.en} size={40}/>}</span>{c==='All'?'All words':c}<Explain text={c==='All'?'All words':c} language={language} inline/></button>;})}</div>
  {!mode?<div className="pw-modes">{modes.map(m=><button key={m.id} className={`pw-mode pw-mode-${m.id}`} onClick={()=>{setMode(m.id);setRound(r=>r+1);}}><span className="pw-mode-emoji" aria-hidden="true">{m.emoji}</span><strong>{m.title}</strong><Explain text={m.title} language={language} inline/><small>{m.copy}</small><Explain text={m.copy} language={language}/><Icon name="arrow" size={20}/></button>)}</div>
  :mode==='learn'?<LearnCards key={category} pool={pool} language={language} speak={speak} onBack={()=>setMode(null)}/>
  :<PictureGame key={category+mode+round} mode={mode} category={category} pool={pool} language={language} speak={speak} onWord={onWord} complete={complete} onAgain={()=>setRound(r=>r+1)} onBack={()=>setMode(null)}/>}
 </section>;
}
function LearnCards({pool,language,speak,onBack}){
 const [i,setI]=useState(0),word=pool[i%pool.length];
 return <div className="pw-stage">
  <div className="pw-topline"><button className="text-button" onClick={onBack}>← All picture games</button><span className="small-chip">{i%pool.length+1} OF {pool.length}</span></div>
  <Instruction text="See the picture, hear the word and learn its meaning." language={language}/>
  <div className="pw-card"><div className="pw-picture" key={word.id} role="img" aria-label={word.en}><WordPicture word={word.en}/></div><h2 dir="ltr"><HearWord word={word.en}/></h2><p className="pron">{word.pron}</p><Translation item={word} language={language}/><PashtoHelp item={word} language={language}/>
   <div className="button-row"><button className="primary" onClick={()=>speak(word.en)}><Icon name="sound" size={18}/> Listen</button><button className="secondary" onClick={()=>speak(word.en,true)}>🐢 Slowly</button></div></div>
  <div className="pw-nav"><button className="secondary" onClick={()=>setI(n=>(n-1+pool.length)%pool.length)}>← Back</button><div className="pw-dots" aria-hidden="true">{pool.slice(0,12).map((w,n)=><span key={w.id} className={n===i%pool.length?'on':''}/>)}</div><button className="primary" onClick={()=>setI(n=>(n+1)%pool.length)}>Next <Icon name="arrow" size={18}/></button></div>
 </div>;
}
function PictureGame({mode,category,pool,language,speak,onWord,complete,onAgain,onBack}){
 const questions=useMemo(()=>makeRound(pool,mode),[pool,mode]);
 const [step,setStep]=useState(0),[picked,setPicked]=useState(null),[wrong,setWrong]=useState([]),[placed,setPlaced]=useState([]),[score,setScore]=useState(0),[done,setDone]=useState(false);
 const q=questions[step],solved=picked===q?.word.id;
 const instruction={name:'Look at the picture. Choose its English word.',find:'Listen to the word. Tap the matching picture.',puzzle:'Put the letters in order to spell the picture.'}[mode];
 function answer(correct){
  if(correct){playEffect('correct');if(!wrong.length)setScore(s=>s+1);onWord?.(q.word.id,!wrong.length);setPicked(q.word.id);speak(q.word.en);}
 }
 function choose(option){if(solved)return;if(option.id===q.word.id)answer(true);else setWrong(w=>[...w,option.id]);}
 function place(tile){if(solved)return;const next=[...placed,tile];setPlaced(next);if(next.length===q.tiles.length){if(next.map(t=>t.label).join('')===q.word.en.toLowerCase())answer(true);else{setWrong(w=>[...w,'tiles']);}}}
 function next(){if(step===questions.length-1){complete?.(`picture-words-${mode}-${category.toLowerCase()}`,false);setDone(completionId());}else{setStep(s=>s+1);setPicked(null);setWrong([]);setPlaced([]);}}
 useAutoNext(!!solved&&!done,next);
 if(!questions.length)return <div className="activity"><p>No words for this game in this group yet. Try another group.</p><button className="secondary" onClick={onBack}>← All picture games</button></div>;
 if(done)return <div className="pw-stage pw-done"><CelebrationBurst id={done}/><span className="pw-big-star" aria-hidden="true">🏆</span><h2>Round complete!</h2><Explain text="Round complete!" language={language}/><p className="pw-score">{'⭐'.repeat(score)}{'☆'.repeat(questions.length-score)}</p><p>{score} of {questions.length} on the first try.</p><h3>What you learned</h3><div className="pw-review">{questions.map(({word})=><button key={word.id} onClick={()=>speak(word.en)}><span aria-hidden="true"><WordPicture word={word.en}/></span><strong dir="ltr">{word.en}</strong><Translation item={word} language={language} inline/></button>)}</div><div className="button-row"><button className="primary" onClick={onAgain}>Play again</button><button className="secondary" onClick={onBack}>More picture games</button></div></div>;
 return <div className={`pw-stage ${wrong.length&&!solved?'pw-oops':''}`}>
  <div className="pw-topline"><button className="text-button" onClick={onBack}>← All picture games</button><span className="small-chip">{step+1} OF {questions.length} · {'⭐'.repeat(score)}</span></div>
  <div className="pw-progress" aria-hidden="true"><span style={{width:`${(step+(solved?1:0))/questions.length*100}%`}}/></div>
  <Instruction text={instruction} language={language}/>
  {mode==='find'?<div className="pw-card"><h2 dir="ltr" className="pw-target">{q.word.en}</h2><button className="primary" onClick={()=>speak(q.word.en)}><Icon name="sound" size={18}/> Hear the word</button></div>
   :<div className="pw-card">{solved&&<Celebrate/>}<div className="pw-picture" key={q.word.id} role="img" aria-label="Picture to name"><WordPicture word={q.word.en}/></div>{mode==='puzzle'&&<><Translation item={q.word} language={language}/><button className="secondary" onClick={()=>speak(q.word.en,true)}><Icon name="sound" size={18}/> Hear it slowly</button></>}</div>}
  {mode==='puzzle'?<><div className="pw-slots" dir="ltr" aria-live="polite">{q.tiles.map((_,n)=><span key={n} className={placed[n]?'filled':''}>{placed[n]?.label||''}</span>)}</div><div className="pw-tiles" dir="ltr">{q.tiles.map(t=><button key={t.id} disabled={solved||placed.some(p=>p.id===t.id)} onClick={()=>place(t)}>{t.label}</button>)}</div>{!solved&&placed.length>0&&<button className="text-button" onClick={()=>{setPlaced([]);}}>↻ Start the word again</button>}</>
  :<div className={`pw-options ${mode==='find'?'pw-picture-options':''}`}>{q.options.map(o=><button key={o.id} disabled={solved} className={solved&&o.id===q.word.id?'pw-right':wrong.includes(o.id)?'pw-wrong':''} onClick={()=>choose(o)} aria-label={mode==='find'?`Picture ${q.options.indexOf(o)+1}`:o.en}>{mode==='find'?<span className="pw-option-picture"><WordPicture word={o.en}/></span>:<span dir="ltr">{o.en}</span>}</button>)}</div>}
  {wrong.length>0&&!solved&&<div className="adventure-hint"><p>💡 Try again! Listen and look closely.</p><Explain text="Try again! Listen and look closely." language={language}/>{mode!=='puzzle'&&<button className="text-button" onClick={()=>speak(q.word.en)}>◖ Hear the word</button>}</div>}
  {solved&&<div className="pw-solved" role="status"><span aria-hidden="true"><WordPicture word={q.word.en}/></span><div><strong dir="ltr"><HearWord word={q.word.en}/></strong><Translation item={q.word} language={language}/><p>Great job!</p><Explain text="Great job!" language={language} inline/></div><button className="primary" onClick={next}>{step===questions.length-1?'See my stars':'Next'} <Icon name="arrow" size={18}/></button></div>}
 </div>;
}
export function PictureWordsBanner({go,language}){return <button className="pw-banner" onClick={()=>go('picture-words',0)}><span className="pw-banner-pictures" aria-hidden="true">{['apple','elephant','bus','rainbow','frog'].map((word,i)=><span key={word} style={{'--i':i}}><WordPicture word={word} size={48}/></span>)}</span><span className="pw-banner-copy"><strong>Picture words</strong><Explain text="Picture words" language={language} inline/><small>{words.length} words with pictures, sounds, puzzles and meanings.</small></span><Icon name="arrow" size={22}/></button>;}
