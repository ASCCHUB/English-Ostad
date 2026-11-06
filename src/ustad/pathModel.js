import {lessonPreview} from './lessonPreview.js';
import {outlineLessons} from './firstSteps/state.js';
// One connected learning path: Class → Lesson → Activities → Review → Next.
// Lessons are built from the existing classes and units, with a letter-by-letter
// beginner start and a review adventure after every class.
import {classes,units,adventureGames} from './adventureContent.js';
import {alphabet,words} from './content.js';
const q=(prompt,options,answer,hint,easy)=>({prompt,options,answer,hint,easy});
const friends=['Bunny','Turtle','Fox'];
const byEn=en=>words.find(w=>w.en===en);
// Picture words that suit each unit's listening and matching activities.
const unitWords={garden:['Red','Blue','Green'],hello:['Mother','Father','Baby'],animal:['Rabbit','Turtle','Fox'],home:['Mother','Bread','Shirt'],school:['Book','Pencil','Bag'],iam:['Happy','Sad','Tired'],this:['Cat','Dog','Bird'],like:['Apple','Banana','Mango'],blend:['Cat','Sun','Dog'],read:['Cat','Dog','Fish'],ask:['Happy','Sad','Hungry'],story:['Star','Moon','Sun'],everyday:['Bus','Shop','Water'],write:['Pencil','Book','Pen']};
const sayLine={garden:'A red flower.',hello:'Hello! My name is Sara.',animal:'The rabbit finds a carrot.',home:'This is my book.',school:'I have a pencil.',iam:'I am happy.',this:'This is a cat.',like:'I like apples.',blend:'cat',read:'This is a cat.',ask:'Are you happy?',story:'The fox finds a lost star.',everyday:'An apple, please.',write:'I like my school.'};
function letterLesson(letter){
 const a=alphabet.find(x=>x.letter===letter),word=a.word,others=['A','B','C','D','M','S','T'].filter(l=>l!==letter).slice(0,2);
 const pics=[word,...['Sun','Dog','Fish','Book'].map(byEn).filter(w=>w&&w.en[0]!==letter)].slice(0,3);
 return {id:`letter-${letter.toLowerCase()}`,kind:'core',classIndex:0,emoji:word.emoji,title:`${letter} is for ${word.en}`,
  activities:[
   {type:'watch',emoji:letter,text:`This is the letter ${letter}. Big ${letter} and small ${letter.toLowerCase()}. ${letter} is for ${word.en.toLowerCase()}.`,listen:`${letter}. ${word.en}.`},
   {type:'quiz',title:'Find the letter',questions:[q(`Find big ${letter}.`,[letter,...others],letter,`Look for the shape of ${letter}.`),q(`Find small ${letter.toLowerCase()}.`,[letter.toLowerCase(),...others.map(o=>o.toLowerCase())],letter.toLowerCase(),`Small ${letter.toLowerCase()} is the same letter as big ${letter}.`)]},
   {type:'listen',title:'Listen and tap',words:[word.en],choices:pics.map(w=>w.en)},
   {type:'match',title:`Words that begin with ${letter}`,pairs:[word,...words.filter(w=>w.en[0]===letter&&w.id!==word.id)].slice(0,3).map(w=>[w.en,w.emoji])},
   {type:'trace',letter},
   {type:'quiz',title:'Quick review',questions:[q(`Which letter begins ${word.en.toLowerCase()}?`,[letter,...others],letter,`Say ${word.en.toLowerCase()}. Listen to the first sound.`)]}
  ],
  learned:`You can recognize ${letter} and say ${word.en.toLowerCase()}!`};
}
const prelude=[
 {id:'meet-friends',kind:'core',classIndex:0,emoji:'👋',title:'Meet your new friends',
  activities:[
   {type:'watch',emoji:'🐇 🦊 🐢',text:'Meet Bunny, Fox and Turtle. They are learning English too. They will explore with you!',listen:'Hello! I am Bunny. I am Fox. I am Turtle.'},
   {type:'say',text:'Hello!'},
   {type:'quiz',title:'Your turn',questions:[q('How do we greet a friend?',['Hello!','Good night.','Thank you.'],'Hello!','We say hello when we meet.')]}
  ],
  learned:'You said your first English word: Hello!',badge:'First Steps'},
 letterLesson('A'),letterLesson('B'),letterLesson('C'),
 {id:'review-abc',kind:'review',classIndex:0,emoji:'🎁',title:'ABC review adventure',
  activities:[
   {type:'match',title:'Match the pairs',pairs:[['A','🍎'],['B','⚽'],['C','🐈']]},
   {type:'quiz',title:'Mixed practice',questions:[q('Which letter begins ball?',['A','B','C'],'B','Say ball. Listen to the first sound.'),q('Which letter begins cat?',['C','A','B'],'C','Say cat. Listen to the first sound.'),q('Which letter begins apple?',['B','C','A'],'A','Say apple. Listen to the first sound.')]},
   {type:'game',title:'Word train',tiles:true,join:'',questions:[q('Build cat.',['t','c','a'],'cat','Start with c, then a, then t.')]}
  ],
  learned:'You can recognize A, B and C!',badge:'ABC Starter'}
];
function unitLesson(unit){
 const game=adventureGames[unit.game],kind=unit.route,pictures=(unitWords[unit.id]||[]).map(byEn).filter(Boolean);
 const check=unit.check||q(`Find ${unit.objects[0].split(' ').slice(1).join(' ').toLowerCase()}.`,unit.objects,unit.objects[0],`Look for ${unit.objects[0]}. Listen to the word and try again.`);
 const watch={type:'watch',emoji:unit.emoji,text:unit.concept,listen:unit.concept};
 const ideas=unit.points&&{type:'ideas',points:unit.points,examples:unit.examples};
 const listen=pictures.length===3&&{type:'listen',title:'Listen and tap',words:pictures.map(w=>w.en),choices:pictures.map(w=>w.en)};
 const match=pictures.length===3&&{type:'match',title:'Match the pairs',pairs:pictures.map(w=>[w.en,w.emoji])};
 const say={type:'say',text:unit.examples?.[0]||sayLine[unit.id]||unit.title};
 const quiz={type:'quiz',title:'Your turn',questions:[check]};
 const play={type:'game',title:game.title,emoji:game.emoji,tiles:!!game.tiles,join:game.join||'',questions:game.questions.slice(0,3)};
 const review=game.tiles?{type:'game',title:'Quick review',tiles:true,join:game.join||'',questions:[game.questions.at(-1)]}:{type:'quiz',title:'Quick review',questions:[game.questions.at(-1)]};
 // Activities suit the skill: picture words for vocabulary, building for sentences, ideas for grammar.
 const plan=ideas?(review.type==='game'?[watch,ideas,play,quiz,review]:[watch,ideas,quiz,play,review])
  :['vocabulary','discover','alphabet'].includes(kind)&&listen?[watch,listen,match,say,review]
  :['sentences','word-families'].includes(kind)?[watch,quiz,play,say,review]
  :kind==='speaking'?[watch,listen||quiz,play,say,review]
  :[watch,play,say,review];
 return {id:'unit-'+unit.id,unitId:unit.id,kind:'core',classIndex:unit.classIndex,emoji:unit.emoji,title:unit.title,activities:plan.filter(Boolean),learned:`You learned: ${unit.title}`};
}
function classReview(c,i){
 const list=units.filter(u=>u.classIndex===i),questions=list.map(u=>adventureGames[u.game].questions[1]).filter(Boolean);
 const pictures=[...new Set(list.flatMap(u=>unitWords[u.id]||[]))].map(byEn).filter(Boolean);
 return {id:'review-'+c.id,kind:'review',classIndex:i,emoji:'🎁',title:`${c.title} review adventure`,
  activities:[pictures.length>=3?{type:'match',title:'Match the pairs',pairs:pictures.slice(0,3).map(w=>[w.en,w.emoji])}:null,list.every(u=>u.points)?{type:'ideas',title:'Remember the big ideas',points:list.map(u=>u.points[0]),examples:list.map(u=>u.examples[0])}:null,{type:'quiz',title:'Mixed practice',questions:questions.filter(x=>!adventureGames.find(g=>g.questions.includes(x)).tiles)},{type:'say',text:list.map(u=>u.examples?.[0]||sayLine[u.id]).find(Boolean)||c.subtitle},...questions.filter(x=>adventureGames.find(g=>g.questions.includes(x)).tiles).slice(0,1).map(x=>{const g=adventureGames.find(gg=>gg.questions.includes(x));return {type:'game',title:g.title,tiles:true,join:g.join||'',questions:[x]};})].filter(a=>a&&(a.type!=='quiz'||a.questions.length)),
  learned:`You finished the ${c.title} class!`,badge:`${c.title} Badge`};
}
const ordered=classes.flatMap((c,i)=>[...(i===0?prelude:[]),...units.filter(u=>u.classIndex===i&&!(i===0&&u.id==='apple')).map(unitLesson),classReview(c,i)]);
// Spaced recall: a core lesson's final quiz also asks one question from two core lessons earlier.
const choiceQuestions=l=>l.activities.filter(a=>a.type==='quiz').flatMap(a=>a.questions);
export const pathLessons=ordered.map((lesson,index,all)=>{
 const next=all[index+1],core=all.slice(0,index).filter(l=>l.kind==='core'),earlier=core.at(-2);
 let activities=lesson.activities;
 const recall=lesson.kind==='core'&&earlier&&choiceQuestions(earlier)[0];
 if(recall){const last=activities.map(a=>a.type).lastIndexOf('quiz');if(last>=0)activities=activities.map((a,i)=>i===last?{...a,title:'Quick review',questions:[...a.questions,{...recall,remember:earlier.title}]}:a);}
 return {...lesson,activities,index,next:next?{title:next.title,friend:friends[index%friends.length]}:null};
});
export const lessonIndex=id=>pathLessons.findIndex(l=>l.id===id);
export function lessonDone(profile,lesson){return !!profile.adventure?.events?.['path-'+lesson.id];}
export function needsPractice(profile,lesson){return !!profile.adventure?.events?.['path-'+lesson.id]?.needsReview;}
// One learning path (2026-10-28): the 110-lesson course is Classes 1–4, so these adventure lessons for old Classes
// 1–4 are extra practice (always open, never blocking). Old Classes 5–10 are Classes 5–10 and open, in order, once the
// course is finished (or a grown-up unlocks them, or the learner was already placed there).
const FIRST_ADVENTURE_CLASS=4;
const courseFinished=profile=>{const mastered=profile.firstSteps?.mastered||{};return outlineLessons.every(l=>mastered[l.id]);};
// Status labels: done, current ("Continue here"), next ("Up next"), open (extra practice, or unlocked by a grown-up or start level), later ("Unlocks later").
export function pathState(profile){
 const settings=profile.adventure||{},startClass=Math.max(FIRST_ADVENTURE_CLASS,settings.classIndex||0);
 const start=pathLessons.findIndex(l=>l.classIndex===startClass);
 const reached=courseFinished(profile)||(settings.classIndex||0)>=FIRST_ADVENTURE_CLASS||pathLessons.some(l=>l.classIndex>=FIRST_ADVENTURE_CLASS&&lessonDone(profile,l));
 const current=reached?pathLessons.findIndex((l,i)=>i>=start&&!lessonDone(profile,l)):-1;
 let upNext=-1;if(current>=0)upNext=pathLessons.findIndex((l,i)=>i>current&&!lessonDone(profile,l));
 return pathLessons.map((lesson,i)=>{
  const extra=lesson.classIndex<FIRST_ADVENTURE_CLASS;
  const status=lessonDone(profile,lesson)?'done':extra?'open':i===current?'current':i===upNext?'next':lessonPreview||settings.unlockAll||(reached&&i<start)?'open':'later';
  return {...lesson,status,extra,practice:needsPractice(profile,lesson)};
 });
}
export function currentLesson(profile){const state=pathState(profile);return state.find(l=>l.status==='current')||state.find(l=>l.status!=='done')||state.at(-1);}
export function canOpen(lesson){return lesson.status!=='later';}
export function earnedBadges(profile){return pathLessons.filter(l=>l.badge&&lessonDone(profile,l)).map(l=>({name:l.badge,emoji:l.kind==='review'?'🏅':'🌟',lesson:l.title}));}
export function learnedSoFar(profile,count=3){return pathLessons.filter(l=>lessonDone(profile,l)).slice(-count).reverse().map(l=>l.learned);}
// Resume point for the lesson in progress; activity steps outside the lesson fall back to the start.
export function resumeStep(profile,lesson){const r=profile.adventure?.pathResume;return r&&r.lesson===lesson.id&&r.step<lesson.activities.length?r.step:0;}
