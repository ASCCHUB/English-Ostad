import {useEffect,useRef,useState} from 'react';
import {Bi} from './firstSteps/Bilingual.jsx';
import {MAX_STUDENTS,studentStandings} from './students.js';
import './students.css';
export default function Students({profiles,active,onSelect,onAdd,onRename,onClose}){
 const [name,setName]=useState(''),[tab,setTab]=useState('students'),[rename,setRename]=useState(profiles[active].name);
 const panel=useRef(null),close=useRef(null);
 useEffect(()=>{panel.current?.scrollTo(0,0);},[tab]);
 useEffect(()=>{const before=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();return()=>{document.body.style.overflow=overflow;before?.focus?.();};},[]);
 function keys(e){if(e.key==='Escape')onClose();if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not(:disabled),input')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}
 return <div className="students-backdrop" onKeyDown={keys}><section className="students-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby="students-title" data-no-support>
  <div className="students-heading"><Bi as="h2" id="students-title" en="Who is learning?" ps="څوک سبق لولي؟"/><button ref={close} className="secondary" onClick={onClose} aria-label="Close students">×</button></div>
  <Bi as="p" en="Tap your name. Your lessons and progress stay separate." ps="په خپل نوم ګوته کېږدئ. د هر زده کوونکي سبقونه او پرمختګ جلا محفوظېږي."/>
  <div className="students-tabs"><button className={tab==='students'?'primary':'secondary'} onClick={()=>setTab('students')}><Bi en="Students" ps="زده کوونکي"/></button><button className={tab==='competition'?'primary':'secondary'} onClick={()=>setTab('competition')}><Bi en="Friendly competition" ps="دوستانه سیالي"/></button></div>
  {tab==='students'?<>
   <div className="students-list">{profiles.map((p,i)=><button className="secondary student-card" key={p.id} onClick={()=>onSelect(p.id)} aria-label={`Learn as ${p.name}`}><span className="student-number" aria-hidden="true">{i+1}</span><span><b>{p.name}</b><Bi en={i===active?'Continue my lessons':'Open my lessons'} ps="زما سبقونه پرانیزئ"/></span>{i===active&&<span aria-label="Current student">✓</span>}</button>)}</div>
   <form onSubmit={e=>{e.preventDefault();if(name.trim()){onAdd(name);setName('');}}}><Bi as="h3" en="Add another student" ps="بل زده کوونکی شامل کړئ"/><label htmlFor="new-student"><Bi en="Student’s name" ps="د زده کوونکي نوم"/></label><input id="new-student" value={name} onChange={e=>setName(e.target.value)} maxLength={40} autoComplete="off"/><button className="primary" disabled={!name.trim()||profiles.length>=MAX_STUDENTS}><Bi en="Add student and start" ps="زده کوونکی شامل او سبق شروع کړئ"/></button>{profiles.length>=MAX_STUDENTS&&<p role="status">Up to {MAX_STUDENTS} students can use this device.</p>}</form>
   <details><summary><Bi en="Change my name" ps="خپل نوم بدل کړئ"/></summary><form onSubmit={e=>{e.preventDefault();if(rename.trim())onRename(rename.trim());}}><label htmlFor="student-rename"><Bi en="My name" ps="زما نوم"/></label><input id="student-rename" value={rename} onChange={e=>setRename(e.target.value)} maxLength={40}/><button className="secondary" disabled={!rename.trim()}><Bi en="Save name" ps="نوم محفوظ کړئ"/></button></form></details>
  </>:<>
   <Bi as="p" en="Earn one star for each beginner lesson you finish. Replaying a lesson does not add extra stars. Equal stars share a place. Everyone can improve!" ps="هر مکمل شوي سبق ته یو ستوری ترلاسه کړئ. د هماغه سبق بیا کولو ته بل ستوری نه ورکول کېږي. برابر ستوري، برابر مقام لري. هر څوک پرمختګ کولی شي!"/>
   <ol className="student-standings">{studentStandings(profiles).map(p=><li key={p.id}><span>{p.rank}.</span><b>{p.name}</b><span aria-label={`${p.stars} lesson stars`}>★ {p.stars}</span></li>)}</ol>
   {profiles.length<2&&<Bi as="p" en="Add a second student to learn and compete together." ps="دویم زده کوونکی شامل کړئ، یو ځای سبق ولولئ او سیالي وکړئ."/>}
  </>}
  <Bi as="p" className="students-note" en="Students and competition are shared on this device. No account is needed." ps="زده کوونکي او سیالي په همدې وسیله کې دي. اکاونټ ته اړتیا نشته."/>
 </section></div>;
}
