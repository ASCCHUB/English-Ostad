import {lessonPreview} from './lessonPreview.js';
// One learning path of 10 classes (approved 2026-10-28).
//  Classes 1–4 are the 110-lesson First Steps course: Class 1 = Level 1, Class 2 = Level 2, Class 3 = Level 3,
//  Class 4 = Levels 4–5. Classes 5–10 are the earlier adventure classes, unchanged, and open after Class 4.
//  Old Class 1–4 units and the old separate sections are not deleted: they appear as extra practice inside the
//  matching class (or are left out as duplicates of a course lesson), and topics have their own library.
import {course,words as courseWords,gpcs} from './firstSteps/tasks.js';
import {continueIndex,isUnlocked,outlineLessons} from './firstSteps/state.js';
import {hydrateCourse} from './firstSteps/store.js';
import {classes as oldClasses,adventureGames} from './adventureContent.js';
import {pathState,lessonIndex} from './pathModel.js';
import {words as vocabulary} from './content.js';
import {readingLessons,sentenceLessons,wordFamilies} from './studyContent.js';
import {stories} from './curriculum.js';

const lessonAt=id=>course.lessons.findIndex(l=>l.id===id);
// ---------- Can the child read this word yet? (the same rule as the course audit) ----------
// A word is readable after a lesson when it is decodable with sound patterns taught by then, or it is an
// exception word taught by then. Words outside the course word list are never treated as readable.
// Words outside the course list are spelled out with the course's sound patterns (black = b-l-a-ck).
const digraphs=['sh','ch','th','ck','ng','ff','ll','ss','zz','pp','tt','ee','oo','ai','oa','ar','qu'];
// Only one-syllable words (plus seven: two short e's, both taught); untaught vowel pairs (ou, ea, ey, ow …) and a
// vowel y (baby, honey) are never spelled out, so house, tiger and banana stay heard-only.
const multiSyllableOk=new Set(['seven']),irregular=new Set(['one','two','four','eight','ice','door','chef','salt','walk','watch','egg','what','who']);
const untaughtPattern=/ow|ou|ir|or|er|ur|ear|air|wh|wr|ph|tch|nk|gg|dd|bb|alk|alt|aw|ew|oy|oi|igh|kn|ce$|ge$/;
function segmentsOf(word){const w=word.toLowerCase();if(!/^[a-z]+$/.test(w))return null;
 const vowelGroups=(w.replace(/(ee|oo|ai|oa)/g,'V').replace(/([aio])[^aeiouV]e$/,'$1').match(/[aeiouV]+/g)||[]);
 if(irregular.has(w)||untaughtPattern.test(w)||/y/.test(w.slice(1))||vowelGroups.some(g=>g.length>1&&g!=='V')||(vowelGroups.length>1&&!multiSyllableOk.has(w)))return null;const out=[];let core=w,tail=null;const split=w.match(/^(.*)([aio])([^aeiou])e$/);if(split&&!/[^aeiou]le$/.test(w)){core=split[1];tail=[split[2]+'_e',split[3]];}
 for(let i=0;i<core.length;){const d=digraphs.find(x=>core.startsWith(x,i));const g=d==='th'?(gpcs.th?'th':'th-voiced'):d==='oo'?'oo-long':d||core[i];i+=(d||core[i]).length;out.push(g);}if(tail)out.push(...tail);return out.every(g=>gpcs[g])?out:null;}
const clusterLesson={initial:lessonAt('L3-15'),final:lessonAt('L3-14')};
export function readableBy(index,word){
 const id=String(word).toLowerCase(),w=courseWords[id];
 const seen=lesson=>{const i=lessonAt(lesson);return i>=0&&i<=index;};
 if(w&&w.category!=='decodable'&&w.category!=='oral_picture')return seen(w.introducedAt);
 // Picture words and words outside the list are spelled out with the taught patterns (irregular ones are refused).
 const segments=w?.category==='decodable'?w.segments:segmentsOf(id);if(!segments)return false;
 if(!segments.every(g=>seen(gpcs[g]?.introducedAt)))return false;
 // Two consonants together are taught in Class 3: at the end of a word in L3-14, at the start in L3-15.
 const single=g=>g.length===1&&!'aeiouy'.includes(g);
 for(let i=0;i+1<segments.length;i++)if(single(segments[i])&&single(segments[i+1])&&index<(i===0?clusterLesson.initial:clusterLesson.final))return false;
 return true;
}
const tokens=s=>String(s).match(/[A-Za-z]+/g)||[];
export const sentenceReadable=(index,sentence,extra=[])=>tokens(sentence).every(t=>readableBy(index,t)||extra.includes(t.toLowerCase()));
// In a topic unit, the words it teaches (days, months) count as readable too.
export const unitWordReadable=(index,u,word)=>readableBy(index,word)||u.teaches.includes(String(word).toLowerCase());

// ---------- Topics (12), built from the old Picture words plus new words ----------
const fromVocabulary=(...categories)=>vocabulary.filter(w=>categories.includes(w.category)).map(w=>({en:w.en,ps:w.ps}));
// New topic words: Pashto drafts, marked check for the owner's review.
const draft=(en,ps)=>({en,ps,psStatus:'check'});
const extraNumbers=[['Eleven','یوولس'],['Twelve','دولس'],['Thirteen','دیارلس'],['Fourteen','څوارلس'],['Fifteen','پنځلس'],['Sixteen','شپاړس'],['Seventeen','اوولس'],['Eighteen','اتلس'],['Nineteen','نولس'],['Twenty','شل']].map(([en,ps])=>draft(en,ps));
export const topics=[
 {id:'colours',en:'Colours',ps:'رنګونه',icon:'red',words:fromVocabulary('Colors')},
 {id:'numbers',en:'Numbers 1–20',ps:'شمېرې ۱–۲۰',icon:'five',words:[...fromVocabulary('Numbers'),...extraNumbers]},
 {id:'shapes',en:'Shapes',ps:'شکلونه',icon:'star',words:[draft('Circle','دایره'),draft('Square','مربع'),draft('Triangle','مثلث'),draft('Rectangle','مستطیل'),draft('Heart','زړه'),{en:'Star',ps:'ستوری'}]},
 {id:'days',en:'Days of the week',ps:'د اونۍ ورځې',icon:'sun',words:[['Monday','پیر'],['Tuesday','منګل'],['Wednesday','بده'],['Thursday','زیارت'],['Friday','جمعه'],['Saturday','خالي'],['Sunday','اتوار']].map(([en,ps])=>draft(en,ps)),noPictures:true},
 {id:'months',en:'Months',ps:'میاشتې',icon:'moon',words:[['January','جنوري'],['February','فروري'],['March','مارچ'],['April','اپرېل'],['May','مئ'],['June','جون'],['July','جولائي'],['August','اګست'],['September','سپتمبر'],['October','اکتوبر'],['November','نومبر'],['December','دسمبر']].map(([en,ps])=>draft(en,ps)),noPictures:true},
 {id:'family',en:'Family',ps:'کورنۍ',icon:'mother',words:fromVocabulary('Family')},
 {id:'body',en:'My body',ps:'زما بدن',icon:'hand',words:fromVocabulary('Body')},
 {id:'animals',en:'Animals',ps:'ځناور',icon:'cat',words:fromVocabulary('Animals')},
 {id:'food',en:'Food',ps:'خوراک',icon:'apple',words:fromVocabulary('Food','Fruits','Vegetables')},
 {id:'clothes',en:'Clothes',ps:'کالي',icon:'shirt',words:fromVocabulary('Clothes')},
 {id:'weather',en:'Weather',ps:'موسم',icon:'rain',words:[...fromVocabulary('Weather'),{en:'Sun',ps:'لمر'},{en:'Rain',ps:'باران'}]},
 {id:'school',en:'School',ps:'سکول',icon:'book',words:[...fromVocabulary('School'),{en:'Desk',ps:'مېز'},{en:'Teacher',ps:'استاذ'}]}
];
export const topicById=Object.fromEntries(topics.map(t=>[t.id,t]));

// ---------- Topic units inside the classes ----------
// Class 1: listen and say (no reading). Class 2: only words the child can read. Class 3: words after their spelling
// is taught. Class 4: sentences; days, months and o'clock are taught as tricky words in the unit itself.
// A word or sentence is shown to read only when readableBy() allows it at that point; otherwise it is heard.
const unit=(id,after,topic,en,ps,mode,{words,sentences=[],teaches=[]}={})=>({id:'topic-'+id,after,topic,en,ps,mode,words,sentences,teaches});
export const topicUnits=[
 unit('c1-colours','L1-R1','colours','Listen and say: colours','واورئ او ووایئ: رنګونه','listen',{words:['Red','Blue','Yellow','Green','Black','White']}),
 unit('c1-numbers','L1-R2','numbers','Listen and say: numbers 1–10','واورئ او ووایئ: شمېرې ۱–۱۰','listen',{words:['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten']}),
 unit('c1-family','L1-R3','family','Listen and say: family','واورئ او ووایئ: کورنۍ','listen',{words:['Mother','Father','Brother','Sister','Baby','Grandmother','Grandfather']}),
 unit('c1-body','L1-R4','body','Listen and say: my body','واورئ او ووایئ: زما بدن','listen',{words:['Head','Eye','Ear','Nose','Mouth','Hand','Leg','Foot']}),
 unit('c1-animals','L1-R5','animals','Listen and say: animals','واورئ او ووایئ: ځناور','listen',{words:['Cat','Dog','Cow','Goat','Hen','Duck','Fish','Bird']}),
 unit('c1-food','L1-R6','food','Listen and say: food','واورئ او ووایئ: خوراک','listen',{words:['Apple','Banana','Bread','Milk','Rice','Egg','Water','Mango']}),
 unit('c1-shapes','L1-R7','shapes','Listen and say: shapes and more colours','واورئ او ووایئ: شکلونه او نور رنګونه','listen',{words:['Circle','Square','Triangle','Star','Heart','Brown','Pink','Purple']}),
 unit('c2-things','L2-R1','school','Read: my things','ولولئ: زما شیان','read',{words:['Bag','Hat','Cap','Map','Pan','Fan','Van','Jam']}),
 unit('c2-animals','L2-R2','animals','Read: animals and numbers','ولولئ: ځناور او شمېرې','read',{words:['Cat','Dog','Fox','Six','Pot','Box']}),
 unit('c2-colours','L2-R3','colours','Read: colours, numbers and animals','ولولئ: رنګونه، شمېرې او ځناور','read',{words:['Red','Ten','Six','Hen','Bug','Leg','Cup']}),
 unit('c2-home','L2-R4','family','Read: my family and home','ولولئ: زما کورنۍ او کور','read',{words:['Mum','Dad','Bed','Cup','Pot','Mat']}),
 unit('c2-school','L2-R5','school','Read: school and weather','ولولئ: سکول او موسم','read',{words:['Pen','Bag','Box','Bus','Sun','Hot']}),
 unit('c3-animals','L3-R1','animals','Read: animals','ولولئ: ځناور','read',{words:['Fish','Duck','Moth','Seven']}),
 unit('c3-weather','L3-R2','weather','Read: weather and food','ولولئ: موسم او خوراک','read',{words:['Rain','Moon','Food','Sheep','Goat','Star','Coat']}),
 unit('c3-colours','L3-R3','colours','Read: colours','ولولئ: رنګونه','read',{words:['Green','Black','Red','Hand','Milk','Frog']}),
 unit('c3-numbers','L3-R4','numbers','Read: numbers and clothes','ولولئ: شمېرې او کالي','read',{words:['Three','Five','Nine','Seven','Coat','Sock','Dress','Nose']}),
 unit('c3-school','L3-R5','school','Read: school and food','ولولئ: سکول او خوراک','read',{words:['School','Rice','Bread','Milk','Feet']}),
 unit('c4-days','L4-R1','days','Days of the week','د اونۍ ورځې','sentences',{words:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],sentences:['Today is Friday.','Today is Monday.','Is it Sunday?','Yes, it is.'],teaches:['today','monday','tuesday','wednesday','thursday','friday','saturday','sunday']}),
 unit('c4-weather','L4-R2','weather','Weather and time','موسم او وخت','sentences',{words:['Sun','Rain','Hot','Wet'],sentences:['It is hot.','The sun is hot.','It is wet.','It is six o\'clock.'],teaches:['o','clock']}),
 unit('c4-months','L5-04','months','Months of the year','د کال میاشتې','sentences',{words:['January','March','May','July','October','December'],sentences:['It is May.','It is not May.','Is it March?','No, it is not.'],teaches:['january','february','march','april','may','june','july','august','september','october','november','december']}),
 unit('c4-food','L5-R1','food','Food, clothes and I like…','خوراک، کالي او «I like…»','sentences',{words:['Rice','Bread','Milk','Apples','Coat','Hat'],sentences:['I like rice.','I like apples.','I have a red coat.','I have a hat.']}),
 unit('c4-numbers','L5-R1','numbers','Numbers 11–20','شمېرې ۱۱–۲۰','listen',{words:['Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty']})
];
export const topicUnitById=Object.fromEntries(topicUnits.map(u=>[u.id,u]));
export const topicWord=(topicId,en)=>topicById[topicId]?.words.find(w=>w.en===en)||vocabulary.find(w=>w.en===en)||{en,ps:''};

// ---------- The 10 classes ----------
const coursePs=['ټکي او اوازونه','اوازونه او لفظونه','د لفظونو لیکل','جملې او قیصې'];
export const pathClasses=[
 ...[[1],[2],[3],[4,5]].map((levels,i)=>({number:i+1,source:'course',levels,
   en:i===3?'Sentences and stories':course.levels.find(l=>l.number===levels[0]).title,ps:coursePs[i],
   lessonIds:course.lessons.filter(l=>levels.includes(l.level)).map(l=>l.id)})),
 ...oldClasses.slice(4).map((c,i)=>({number:i+5,source:'adventure',classIndex:i+4,en:c.title,subtitle:c.subtitle,ps:''}))
];
// ---------- Games: each of the 25 belongs to one class (grammar games in Classes 6–10) ----------
export const gamesByClass={1:['letter-hunt','sound-safari','feed-animal','number-adventure','fox'],2:['word-train'],3:['color-garden'],4:['sentence-builder','story-detective','everyday-english'],5:[],
 6:['time-machine','compare-contest','future-planner'],7:['ever-explorer','reason-bridge','advice-desk'],8:['meanwhile','who-which','polite-pro'],9:['what-if','news-desk','message-relay'],10:['idiom-island','debate-club','tense-detective']};
export const gameEntry=id=>id==='fox'?{id,title:'Help Fox Find the Apple',emoji:'🦊',goal:'Listen, look and choose',page:'fox-game',index:0}:(()=>{const i=adventureGames.findIndex(g=>g.id===id),g=adventureGames[i];return {id,title:g.title,emoji:g.emoji,goal:g.goal,page:'play-game',index:i};})();

// ---------- Old content → extra practice inside the matching class ----------
// Duplicates of a course lesson are left out: Meet your friends, A/B/C, ABC review (Class 1 letter lessons),
// This is a cat (L4-03), Build a little word (Class 2), the old Starter–Builder reviews (class reviews).
const pathExtra=(id,why)=>({kind:'path',id,why});
const readingFits=(text)=>sentenceReadable(course.lessons.length-1,text);
// Sentence workshop: sentences a child can read by the end of Class 4 go there; past and future go to Class 6;
// the rest to Class 5.
const workshop=sentenceLessons.map((l,i)=>({kind:'page',page:'sentences',index:i,en:l.en,why:'Sentence workshop',cls:/yesterday|tomorrow|played|will /i.test(l.en)?6:readingFits(l.en)?4:5}));
export const extraPractice={
 1:[pathExtra('unit-garden','Colours, shapes and counting'),pathExtra('unit-animal','Animal picnic'),pathExtra('unit-home','My family and my day'),pathExtra('unit-school','My classroom and numbers'),{kind:'page',page:'alphabet',index:0,en:'All letters A–Z',why:'Alphabet'}],
 2:[...wordFamilies.map((f,i)=>({kind:'page',page:'word-families',index:i,en:`Word family: -${f.ending}`,why:'Word families'})),{kind:'spell',level:2,why:'Spelling school'}],
 3:[{kind:'spell',level:3,why:'Spelling school'}],
 4:[pathExtra('unit-hello','Hello, new friends'),pathExtra('unit-iam','I am happy'),pathExtra('unit-like','Things I like'),pathExtra('unit-read','A sentence, a little story'),pathExtra('unit-ask','Questions we can ask'),
  ...workshop.filter(x=>x.cls===4),
  ...readingLessons.map((r,i)=>({kind:'page',page:'reading',index:i,en:r.en||r.title,why:'Read and understand',fits:readingFits(r.en||r.title||'')})).filter(x=>x.fits),
  ...stories.slice(0,5).map((s,i)=>({kind:'page',page:'story-player',index:i,en:s.title,why:'Story corner',fits:s.lines?.every(line=>readingFits(line.en||line))})).filter(x=>x.fits)],
 5:[{kind:'page',page:'story-player',index:5,en:'The Lost Star',why:'Story corner'},...workshop.filter(x=>x.cls===5),
  ...readingLessons.map((r,i)=>({kind:'page',page:'reading',index:i,en:r.en||r.title,why:'Read and understand',fits:readingFits(r.en||r.title||'')})).filter(x=>!x.fits),
  ...stories.slice(0,5).map((s,i)=>({kind:'page',page:'story-player',index:i,en:s.title,why:'Story corner',fits:s.lines?.every(line=>readingFits(line.en||line))})).filter(x=>!x.fits)],
 6:workshop.filter(x=>x.cls===6)
};
// Spelling practice: the spelling-school words a child can read by the end of that level.
export function spellWords(level){const end=Math.max(...course.lessons.map((l,i)=>l.level===level?i:-1));return vocabulary.map((w,i)=>({...w,index:i})).filter(w=>readableBy(end,w.en));}

// ---------- Progress, from one place ----------
export function classProgress(profile){
 const course_=hydrateCourse(profile),next=continueIndex(course_),adventure=pathState(profile);
 return pathClasses.map(c=>{
  if(c.source==='course'){
   const idx=c.lessonIds.map(id=>outlineLessons.findIndex(l=>l.id===id)),done=c.lessonIds.filter(id=>course_.mastered[id]).length;
   return {...c,total:c.lessonIds.length,done,unlocked:idx.some(i=>isUnlocked(course_,i)),current:idx.includes(next)&&done<c.lessonIds.length};
  }
  const lessons=adventure.filter(l=>l.classIndex===c.classIndex),done=lessons.filter(l=>l.status==='done').length;
  return {...c,total:lessons.length,done,unlocked:lessons.some(l=>l.status!=='later'),current:lessons.some(l=>l.status==='current'),lessons};
 }).map((c,i,all)=>({...c,complete:c.done===c.total,current:c.current&&!all.slice(0,i).some(x=>x.current)}));
}
export function currentClass(profile){const list=classProgress(profile);return (list.find(c=>c.current)||list.find(c=>c.unlocked&&!c.complete)||list[0]).number;}
// Games for the current and completed classes only.
export function playableGames(profile){const progress=classProgress(profile),now=currentClass(profile);return progress.filter(c=>lessonPreview||c.number<=now||c.complete).flatMap(c=>gamesByClass[c.number].map(id=>({...gameEntry(id),classNumber:c.number})));}
// A topic unit is reached once the lesson it follows is passed (or a later lesson is open).
export function topicUnitReached(profile,u){const p=hydrateCourse(profile),i=outlineLessons.findIndex(l=>l.id===u.after);return lessonPreview||!!p.mastered[u.after]||isUnlocked(p,i+1);}
export function topicReached(profile,topicId){return topicUnits.some(u=>u.topic===topicId&&topicUnitReached(profile,u));}
export const pathLessonIndex=lessonIndex;
