import {useEffect,useRef,useState} from 'react';
import {languages} from './content.js';
import {Icon} from './ExplorerArt.jsx';
import WordPicture from './WordPicture.jsx';
import './gettingStarted.css';
export const GUIDE_VERSION='guide-2';
export const guideKey=id=>'english-ustad-'+GUIDE_VERSION+'-'+id;
export function needsGuide(id){try{return localStorage.getItem(guideKey(id))!=='done';}catch{return true;}}
const titles=['Your adventure, your language','Listen. Look. Try!','Choose your first adventure'];
const pashto=['خپله ژبه غوره کړئ','واورئ، وګورئ او کوشش وکړئ','خپل لومړی سبق شروع کړئ'];
const basics=[
 ['Tap Listen to hear. Tap a picture or letter to answer.','د اواز لپاره واورئ کېکاږئ. د جواب لپاره په تصویر یا ټکي ګوته کېږدئ.'],
 ['For writing: tap 1, 2, 3, 4 in order, then draw the letter.','د لیکلو لپاره په ۱، ۲، ۳، ۴ په ترتیب ګوته کېږدئ، بیا ټکی ولیکئ.'],
 ['Tap Next when you finish. Tap the back arrow to go back.','چې خلاص شئ، مخکې لاړ شئ کېکاږئ. د بېرته تلو لپاره د شا غشی کېکاږئ.'],
 ['Open the menu to change student, see the competition, or read this help again.','د زده کوونکي بدلولو، سیالۍ یا د دې لارښود لپاره مېنو پرانیزئ.'],
 ['Your place saves automatically. Each student continues their own lessons.','ستاسو ځای پخپله محفوظېږي. هر زده کوونکی خپل سبقونه جاري ساتي.']
];
export default function GettingStarted({profileId,language,onLanguage,onClose,onStart,onLesson,onListen,onStop,colorMode='light'}){
 const [step,setStep]=useState(0),[answer,setAnswer]=useState(''),panel=useRef(null),heading=useRef(null),ps=['ps','rps','all'].includes(language);
 const correct=answer==='apple';
 useEffect(()=>{const before=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=overflow;onStop?.();before?.focus?.();};},[]);
 useEffect(()=>{onStop?.();heading.current?.focus();panel.current?.scrollTo?.(0,0);},[step]);
 function done(action){onStop?.();try{localStorage.setItem(guideKey(profileId),'done');}catch{}if(action==='exam')onStart();else if(action==='lesson')onLesson();else onClose();}
 function keydown(e){if(e.key==='Escape')done();if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not(:disabled),select')],first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}
 const help=text=>ps&&<p className="guide-pashto" lang="ps" dir="rtl">{text}</p>;
 return <div className="getting-started-backdrop" onKeyDown={keydown}><section className="getting-started-dialog" data-color-mode={colorMode} ref={panel} role="dialog" aria-modal="true" aria-labelledby="getting-started-title" data-no-support>
  <div className="getting-started-top"><span>YOUR FIRST LITTLE ADVENTURE</span><button type="button" onClick={()=>done()} aria-label="Close the guide"><Icon name="close"/></button></div>
  <div className="getting-started-progress" aria-label={`Step ${step+1} of 3`}>{titles.map((title,i)=><span key={title} className={i<=step?'reached':''}/>)}</div>
  <div className="guide-fox"><img src="/explorers/avatar-fox.png" alt="Your friendly fox guide"/><span>{step===0?'Hello, explorer!':step===1?'Try one with me.':'You are ready!'}</span></div>
  <h2 id="getting-started-title" ref={heading} tabIndex={-1}>{titles[step]}</h2>{help(pashto[step])}
  {step===0&&<><p>Choose your name before learning. Each student has their own lessons and progress. Then choose the language that helps you.</p><label className="getting-started-language">Help language<select value={language} onChange={e=>onLanguage(e.target.value)}>{Object.entries(languages).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><div className="guide-mini-path"><span><Icon name="sound"/> Listen</span><span><Icon name="game"/> Try</span><span><Icon name="star"/> Grow</span></div></>}
  {step===1&&<><p>Tap Listen, then find the apple. This is practice, so take your time.</p>{help('واورئ، بیا مڼه غوره کړئ. دا یوازې مشق دی.')}<button className="primary guide-listen" type="button" onClick={()=>onListen?.('Apple. Tap the apple.')}><Icon name="sound"/> Listen</button><div className="guide-pictures" role="group" aria-label="Find the apple">{['apple','ball','book'].map(word=><button type="button" key={word} disabled={correct} aria-label={word} aria-pressed={answer===word} className={answer===word?(correct?'is-correct':'try-again'):''} onClick={()=>{onStop?.();setAnswer(word);}}><WordPicture word={word} size={95}/>{correct&&word==='apple'&&<Icon name="check"/>}</button>)}</div><p className="guide-feedback" role="status">{correct?'Yes! Apple. You did it!':answer?'Good try! Look for the red fruit.':'One tap is all it takes.'}</p>{correct&&help('شاباش! دا مڼه ده.')}</>}
  {step===2&&<><p>Start with the first lesson, or try the Quick exam if you already know some English.</p>{help('که انګلیسي مو نوې شروع کړې وي، لومړی سبق شروع کړئ. که لږه درځي، خپل امتحان واخلئ.')}<ol className="guide-easy-steps">{basics.map(([en,meaning])=><li key={en}>{en}{help(meaning)}</li>)}</ol><div className="guide-start-choices"><button className="primary" onClick={()=>done('lesson')}><Icon name="book"/><span>Start my first lesson{ps&&<small lang="ps" dir="rtl">لومړی سبق شروع کړئ</small>}</span><Icon name="arrow"/></button><button className="secondary" onClick={()=>done('exam')}><Icon name="sparkle"/><span>Quick exam{ps&&<small lang="ps" dir="rtl">خپل انګلش امتحان واخلئ</small>}</span><Icon name="arrow"/></button></div><p className="guide-save-note">Progress saves on this device. Menu keeps help and settings out of your way.</p></>}
  <div className="getting-started-actions">{step>0&&<button className="secondary" type="button" onClick={()=>setStep(step-1)}>Back</button>}{step<2&&<button className="primary" type="button" disabled={step===1&&!correct} onClick={()=>setStep(step+1)}>{step===0?'Let’s try it':'Choose my lesson'}<Icon name="arrow"/></button>}<button className="text-button" type="button" onClick={()=>done()}>Skip introduction</button></div>
 </section></div>;
}
