import {useState} from 'react';
import {Bi} from '../firstSteps/Bilingual.jsx';
import {artSvg} from './art.js';
import {games,upcoming,pathStages,filters,bankInfo,gameIndex,ui} from './catalog.js';
import {gameState,currentLevel,answeredCount,totalStars,unfinishedRound} from './progress.js';
import {currentClass,playableGames} from '../learningPath.js';
import {adventureGames} from '../adventureContent.js';
import './games.css';

const Icon=({name,lg})=><span className={`gm-icon ${lg?'gm-icon-lg':''}`} aria-hidden="true" dangerouslySetInnerHTML={{__html:artSvg(name)||''}}/>;
// Games that the five full games replace, and older short games whose full versions are still to come.
const replaced=new Set(['letter-hunt','sound-safari','feed-animal','number-adventure','fox','sentence-builder','story-detective']);

export default function GamesHome({profile,go}){
 const [filter,setFilter]=useState('recommended');
 const now=currentClass(profile);
 const rows=games.map(g=>{const s=gameState(profile,g.id),level=currentLevel(s),levelClass=g.levels[level-1]?.class||1;return {...g,state:s,level,levelClass,done:answeredCount(s),stars:totalStars(s),started:answeredCount(s)>0||!!s.current};});
 const recommended=rows.filter(r=>r.levelClass<=Math.max(now,1)+1&&r.done<r.questions).sort((a,b)=>a.levelClass-b.levelClass||(b.started-a.started));
 const shown=filter==='recommended'?(recommended.length>=2?recommended:rows):rows.filter(r=>r.filters.includes(filter));
 const soon=filter==='recommended'?upcoming:upcoming.filter(u=>u.filters.includes(filter));
 const resume=unfinishedRound(profile),resumeGame=resume&&rows.find(r=>r.id===resume.game);
 const totalDone=rows.reduce((n,r)=>n+r.done,0),totalQuestions=rows.reduce((n,r)=>n+r.questions,0),stars=rows.reduce((n,r)=>n+r.stars,0);
 const extra=playableGames(profile).filter(g=>!replaced.has(g.id)).map(g=>({...g,count:adventureGames.find(a=>a.id===g.id)?.questions.length||0})).filter(g=>g.count>0);
 return <section className="gm-home" data-no-support>
  <header className="gm-home-head"><Bi as="h1" en="Learn through play." ps={ui.learnThroughPlay}/></header>
  <div className="gm-home-stats">
   <span className="gm-stat gm-stat-sky"><small>Class</small><b>{now}</b></span>
   <span className="gm-stat gm-stat-mint"><small>Questions done</small><b>{totalDone}<i> / {totalQuestions}</i></b><span className="gm-bar"><span style={{width:`${Math.round(totalDone/totalQuestions*100)}%`}}/></span></span>
   <span className="gm-stat gm-stat-yellow"><small>Stars</small><b>★ {stars}</b></span>
  </div>
  {resumeGame&&<article className="gm-continue">
   <Icon name={resumeGame.icon}/><div><Bi as="h2" en="Continue playing" ps={ui.continuePlaying}/><p lang="en"><b>{resumeGame.title}</b> · {resume.kind==='review'?'Review round':`Level ${resume.level} · Round ${resume.part}`} · {resume.done} of {resume.ids.length} done</p></div>
   <button className="gm-btn gm-primary gm-big" onClick={()=>go('game-play',gameIndex(resume.game)+5)}><Bi en="Continue" ps={ui.continuePlaying}/></button>
  </article>}
  <nav className="gm-filters" aria-label="Game types">{filters.map(f=><button key={f.id} aria-pressed={filter===f.id} className="gm-chip" onClick={()=>setFilter(f.id)}><Bi en={f.en} ps={f.ps}/></button>)}</nav>
  <div className="gm-cards">{shown.map(g=><article key={g.id} className={`gm-card gm-accent-${g.accent}`}>
   <Icon name={g.icon} lg/>
   <div className="gm-card-body">
    <Bi as="h3" en={g.title} ps={g.ps}/>
    <p className="gm-card-skill" lang="en">{g.skill}</p>
    <p className="gm-card-meta" lang="en">Level {g.level} of {bankInfo.levels} · Class {g.levelClass} · {g.questions} questions</p>
    <span className="gm-bar" aria-label={`${g.done} of ${g.questions} questions done`}><span style={{width:`${Math.round(g.done/g.questions*100)}%`}}/></span>
    <p className="gm-card-progress" lang="en">{g.done} of {g.questions} done · ★ {g.stars}</p>
   </div>
   <button className="gm-btn gm-primary" onClick={()=>go('game-play',gameIndex(g.id)+(g.state.current?5:0))}>{g.started?<Bi en="Continue" ps={ui.continuePlaying}/>:<Bi en="Play" ps="لوبه وکړئ"/>}</button>
  </article>)}</div>
  {soon.length>0&&<><h2 className="gm-sub" lang="en">Coming soon</h2><div className="gm-cards gm-soon">{soon.map(u=><article key={u.id} className="gm-card gm-card-soon" aria-label={`${u.title}, coming soon`}>
   <Icon name={u.icon} lg/><div className="gm-card-body"><Bi as="h3" en={u.title} ps={u.ps}/><p className="gm-card-skill" lang="en">{u.skill}</p></div><span className="gm-tag gm-tag-soon"><Bi en="Coming soon" ps={ui.upcoming}/></span></article>)}</div></>}
  <section className="gm-path" aria-label="Learning path"><h2 className="gm-sub" lang="en">Your learning path</h2>
   <ol>{pathStages.map(s=>{const here=[...games,...upcoming].filter(g=>g.stage===s.id);return <li key={s.id}><Bi as="b" en={s.en} ps={s.ps}/><small lang="en">{here.map(g=>g.title+(games.includes(g)?'':' (soon)')).join(', ')||'Course lessons'}</small></li>;})}</ol>
  </section>
  {extra.length>0&&<details className="gm-extra"><summary lang="en">Short class games ({extra.length})</summary><div className="gm-extra-list">{extra.map(g=><button key={g.id} onClick={()=>go(g.page,g.index)}><span lang="en">{g.title}</span><small lang="en">Class {g.classNumber} · {g.count} questions</small></button>)}</div></details>}
 </section>;
}
