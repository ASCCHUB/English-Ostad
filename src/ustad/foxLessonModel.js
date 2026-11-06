import {lessonPreview} from './lessonPreview.js';
export const FOX_STATES=['idle','introducing','demonstrating','waiting','encouraging','celebrating','completed'];
const object=(id,label,kind,colour)=>({id,label,kind,colour});
export const foxLessons=[
 {id:'apple',title:'Help Fox Find the Apple',word:'apple',target:'apple',intro:'Hello! I am Fox. Can you help me find an apple?',demo:'This is an apple. Apple.',ask:'Can you find the apple? Tap it.',hint:'Good try. An apple is a red fruit with a little green leaf. Try again.',success:'You found the apple! Thank you for helping me.',review:'Apple. I found an apple. Say apple with me.',ps:'مڼه پیدا کړه. د مڼې په تصویر ګوته کېږده.',objects:[object('apple','Apple','apple','#d84739'),object('ball','Ball','ball','#398edb'),object('book','Book','book','#e8b449')]},
 {id:'red',title:'Help Fox Find Red',word:'red',target:'red',intro:'Hello again! Let us find a colour.',demo:'This ball is red. Red.',ask:'Tap the red ball.',hint:'Look for the ball that is the same colour as a red apple.',success:'Yes! This ball is red.',review:'Red. The ball is red. Say red with me.',ps:'سور بال پیدا کړه. په سور بال ګوته کېږده.',objects:[object('blue','Blue ball','ball','#398edb'),object('red','Red ball','ball','#d84739'),object('green','Green ball','ball','#5c9a5d')]},
 {id:'rabbit',title:'Help Fox Find the Rabbit',word:'rabbit',target:'rabbit',intro:'Let us find one of our animal friends.',demo:'This is a rabbit. Rabbit.',ask:'Can you find the rabbit?',hint:'A rabbit has long ears and soft white fur.',success:'You found the rabbit. Well done!',review:'Rabbit. This is a rabbit. Say rabbit with me.',ps:'سویه پیدا کړه. د سویې په تصویر ګوته کېږده.',objects:[object('turtle','Turtle','turtle','#64885b'),object('rabbit','Rabbit','rabbit','#f5efdf'),object('fox','Fox','fox','#d97830')]},
 {id:'three',title:'Help Fox Count Three',word:'three',target:'three',intro:'Let us count some apples together.',demo:'One, two, three. Three apples.',ask:'Tap the group with three apples.',hint:'Count each apple once. One, two, three.',success:'Yes! You counted three apples.',review:'Three. There are three apples. Say three with me.',ps:'درې مڼې پیدا کړه. په درې مڼو ګوته کېږده.',objects:[object('one','One apple','one','#d84739'),object('two','Two apples','two','#d84739'),object('three','Three apples','three','#d84739')]},
 {id:'book',title:'Help Fox Find the Book',word:'book',target:'book',intro:'Let us find something we can read.',demo:'This is a book. Book.',ask:'Find the book and tap it.',hint:'A book has pages. We can open it and read.',success:'You found the book! Let us read together.',review:'Book. I can read a book. Say book with me.',ps:'کتاب پیدا کړه. د کتاب په تصویر ګوته کېږده.',objects:[object('ball','Ball','ball','#398edb'),object('book','Book','book','#e8b449'),object('apple','Apple','apple','#d84739')]}
];
export const FOX_PHASES=['idle','introducing','demonstrating','waiting','encouraging','celebrating','review','completed'];
export const FOX_DURATIONS={introducing:3200,demonstrating:2600,encouraging:1900,celebrating:4200};
export function newFoxSession(){return {phase:'idle',attempts:0,mistakes:0,found:false,paused:false,epoch:0,sequence:0};}
export function foxCharacterState(phase){return phase==='review'?'celebrating':phase;}
export function foxTransition(state,event,lesson){
 if(event.type==='RESTART')return {...newFoxSession(),phase:'introducing',epoch:state.epoch+1,sequence:state.sequence+1,attempts:state.attempts,mistakes:state.mistakes};
 if(event.type==='PAUSE')return state.paused?state:{...state,paused:true,epoch:state.epoch+1};
 if(event.type==='RESUME')return !state.paused?state:{...state,paused:false,epoch:state.epoch+1};
 if(event.type==='INVALIDATE')return {...state,epoch:state.epoch+1};
 if(state.paused)return state;
 if(event.type==='START'&&state.phase==='idle')return {...state,phase:'introducing',epoch:state.epoch+1};
 if(event.type==='PICK'&&state.phase==='waiting'&&lesson.objects.some(o=>o.id===event.id)){
  const correct=event.id===lesson.target;return {...state,phase:correct?'celebrating':'encouraging',found:correct,attempts:state.attempts+1,mistakes:state.mistakes+(correct?0:1),epoch:state.epoch+1};
 }
 if(event.type==='ADVANCE'&&event.epoch===state.epoch&&event.phase===state.phase){const next={introducing:'demonstrating',demonstrating:'waiting',encouraging:'waiting',celebrating:'review'}[state.phase];return next?{...state,phase:next,epoch:state.epoch+1}:state;}
 if(event.type==='COMPLETE'&&state.phase==='review'&&state.found)return {...state,phase:'completed',epoch:state.epoch+1};
 return state;
}
export function foxCheckpoint(state){return {version:1,phase:state.phase,attempts:state.attempts,mistakes:state.mistakes,found:state.found};}
export function validateFoxLessons(input){
 if(input===undefined)return {};
 const fail=()=>{throw Error('Invalid fox lesson progress');};
 if(!input||typeof input!=='object'||Array.isArray(input))fail();const output={};
 for(const [id,s] of Object.entries(input)){
  if(!foxLessons.some(l=>l.id===id)||!s||s.version!==1||!FOX_PHASES.includes(s.phase)||!Number.isSafeInteger(s.attempts)||s.attempts<0||!Number.isSafeInteger(s.mistakes)||s.mistakes<0||s.mistakes>s.attempts||typeof s.found!=='boolean'||s.found!==['celebrating','review','completed'].includes(s.phase)||s.found&&s.attempts<=s.mistakes)fail();
  output[id]={version:1,phase:s.phase,attempts:s.attempts,mistakes:s.mistakes,found:s.found};
 }
 return output;
}
export function restoreFoxSession(checkpoint){
 if(!checkpoint)return newFoxSession();const s={...newFoxSession(),...checkpoint};
 // Never resume halfway through a timed animation or speech utterance.
 if(s.phase==='celebrating')s.phase='review';else if(s.phase==='introducing'||s.phase==='demonstrating')s.phase='idle';else if(s.phase==='encouraging')s.phase='waiting';return s;
}
export function foxLessonUnlocked(profile,index){return lessonPreview&&index>=0&&index<foxLessons.length||index===0||profile.completed.includes('fox-game-'+foxLessons[index-1]?.id);}
export function foxCaption(lesson,phase){return ({idle:'Ready to help Fox?',introducing:lesson.intro,demonstrating:lesson.demo,waiting:lesson.ask,encouraging:lesson.hint,celebrating:lesson.success,review:lesson.review,completed:`You learned ${lesson.word}. Your progress is saved.`})[phase];}
