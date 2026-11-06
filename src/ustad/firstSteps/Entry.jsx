import {continueIndex,lessonPlace} from './state.js';
import {hydrateCourse} from './store.js';
import {Bi} from './Bilingual.jsx';
import './firstSteps.css';
// English on the left, with its Pashto line underneath (hidden when "English only" is chosen).
// big (home screen): one large Continue button; the lesson map sits underneath, so no second button.
export function FirstStepsEntry({profile,go,big=false}){
 const p=hydrateCourse(profile),index=continueIndex(p),place=lessonPlace(index);
 const next=<button className={`primary ${big?'fs-continue-big':''}`} onClick={()=>go('beginner-lesson',index)}><Bi en={`Continue: Level ${place.level} · Lesson ${place.number}`} ps={`جاري یې کړئ: درجه ${place.level} · سبق ${place.number}`}/></button>;
 return <section className={`fs-entry ${big?'fs-entry-big':''}`} data-no-support><img src="/explorers/avatar-fox.png" alt=""/><div><Bi as="h2" en="English from the start" ps="د شروع نه انګلیزي"/><Bi as="p" en="Letters, sounds, words and short sentences, step by step." ps="ټکي، اوازونه، لفظونه او لنډې جملې — قدم په قدم."/><Bi as="small" en={`${place.levels} levels · ${place.total} lessons`} ps={`${place.levels} درجې · ${place.total} سبقونه`}/></div><div className="fs-entry-actions">{next}{!big&&<button className="secondary" onClick={()=>go('beginner')}><Bi en="See all lessons" ps="ټول سبقونه وګورئ"/></button>}</div></section>;
}
