import {lessonPreview} from './lessonPreview.js';
import {outlineLessons} from './firstSteps/state.js';
import {adultWords} from './adultContent.js';
import {words} from './content.js';
import {pathLessons} from './pathModel.js';
export const ROUTES=['topics','topic','topic-unit','beginner','beginner-lesson','fox-game','welcome','home','journey','letters','alphabet','phonics','vocabulary','spelling','reading','writing','speaking','grammar','stories','star-story','games','memory','quiz','progress','downloads','parent','sentences','word-families','adult-spelling','adult-lesson','appearance','setup','classes','class-map','adventure-lesson','adventure-game','play-game','discover','discover-lesson','level-check','story-library','story-player','picture-words','path-lesson'];
export function parseExplorerRoute(hash='') {
 const [page,rawIndex]=hash.replace(/^#\/?/,'').split('/');
 if(!ROUTES.includes(page))return null;
 const n=Number(rawIndex||0),limit=({topic:12,'topic-unit':22,'beginner-lesson':outlineLessons.length,'fox-game':5,'adult-lesson':adultWords.length,classes:10,'class-map':10,'adventure-lesson':30,'adventure-game':30,'play-game':24,'discover-lesson':12,'story-player':6,'path-lesson':pathLessons.length,'picture-words':new Set(words.map(w=>w.category)).size+1,vocabulary:words.length,spelling:words.length,alphabet:26,writing:26,sentences:21,'word-families':8,reading:12}[page]||100);
 return {page,index:Number.isInteger(n)&&n>=0&&n<limit?n:0};
}
export const journeyStops=[
 {id:'journey-letters',title:'Meet the letters',page:'letters',index:0},
 {id:'phonics-0',title:'Letter sounds',page:'phonics',index:0},
 {id:'alphabet-A',title:'A is for Apple',page:'alphabet',index:0},
 {id:'alphabet-B',title:'B is for Ball',page:'alphabet',index:1},
 {id:'alphabet-C',title:'C is for Cat',page:'alphabet',index:2}
];
export function journeyState(profile){let firstIncomplete=journeyStops.findIndex(s=>!profile.completed.includes(s.id));if(firstIncomplete<0)firstIncomplete=journeyStops.length;return journeyStops.map((s,i)=>({...s,done:profile.completed.includes(s.id),active:i===firstIncomplete,locked:!lessonPreview&&i>firstIncomplete&&!profile.completed.includes(s.id)}));}
export function explorerBadges(profile){const completed=[...new Set(profile.completed)];return [
 {id:'abc',name:'ABC Explorer',icon:'book',hint:'Practice five different letters',earned:completed.filter(id=>/^alphabet-[A-Z]$/.test(id)).length>=5},
 {id:'animals',name:'Animal Friend',icon:'paw',hint:'Practice five different animal words',earned:words.filter(w=>w.category==='Animals'&&completed.includes('vocabulary-'+w.id)).length>=5},
 {id:'story',name:'Story Star',icon:'star',hint:'Read three stories',earned:completed.filter(id=>id.startsWith('stories-')).length>=3}
];}
export function explorerStars(profile){return Math.floor(profile.xp/10);}
