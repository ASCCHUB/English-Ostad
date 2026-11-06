// Starting check, version 2 (2026-10-28): works for children who cannot read yet.
// Every question has a picture, English audio (the word is spoken) and a Pashto instruction; the child answers by
// tapping. Ten skills follow the course order, three questions each:
//  1–3 letter SOUNDS (hear a picture word, choose the letter it starts with), 4–8 decoding (hear a word, choose
//  its spelling), 9 reading a sentence (choose its picture), 10 reading a tiny story (choose the picture answer).
// A skill passes with 2 of 3. The check stops at the first skill that does not pass, and it stops after 5 answers
// if 4 or more were wrong (start at Level 1 Lesson 1). The child starts one group before the highest passed point:
// at the first lesson of the last course group that skill covers. Lessons before the start are "skipped by test",
// never "completed".
import course from './firstSteps/course.json' with {type:'json'};
import outline from './firstSteps/outline.json' with {type:'json'};
export const ASSESSMENT_VERSION='starting-check-2';
const unitStart=id=>course.levels.flatMap(l=>l.units).find(u=>u.id===id).lessonIds[0];
// Question kinds: onset (picture + spoken word → first letter), hear (picture + spoken word → printed word),
// sentence (printed sentence, not spoken → picture), story (printed story + question → picture).
const onset=(id,word,answer,options)=>({id,kind:'onset',word,picture:word,answer,options});
const hear=(id,word,options)=>({id,kind:'hear',word,picture:word,answer:word,options});
const sentence=(id,text,answer,options)=>({id,kind:'sentence',text,answer,options});
const story=(id,question,questionPs,answer,options)=>({id,kind:'story',question,questionPs,answer,options});
const ins={
 onset:{en:'Listen to the word. Which letter does it start with?',ps:'لفظ واورئ. په کوم ټکي شروع کېږي؟'},
 hear:{en:'Listen to the word. Which one is it?',ps:'لفظ واورئ. سم لفظ کوم یو دی؟'},
 sentence:{en:'Read the sentence. Which picture shows it?',ps:'جمله ولولئ. کوم تصویر یې ښيي؟'},
 story:{en:'Read the story. Then choose the right picture.',ps:'قیصه ولولئ. بیا سم تصویر غوره کړئ.'}
};
export const instructionFor=q=>ins[q.kind];
export const assessmentSkills=[
 {id:'sounds-1',en:'Letter sounds: s a t p i n m d',ps:'د ټکو اوازونه: s a t p i n m d',startGroup:'L1-U2',questions:[onset('s1-sun','sun','s',['s','m','o']),onset('s1-map','map','m',['t','m','a']),onset('s1-pen','pen','p',['p','d','n'])]},
 {id:'sounds-2',en:'Letter sounds: g o c k e u r h',ps:'د ټکو اوازونه: g o c k e u r h',startGroup:'L1-U4',questions:[onset('s2-goat','goat','g',['g','h','e']),onset('s2-hen','hen','h',['r','h','o']),onset('s2-cup','cup','c',['u','c','r'])]},
 {id:'sounds-3',en:'Letter sounds: b f l j v w x y z qu',ps:'د ټکو اوازونه: b f l j v w x y z qu',startGroup:'L1-U7',questions:[onset('s3-ball','ball','b',['b','l','z']),onset('s3-fish','fish','f',['j','f','y']),onset('s3-van','van','v',['v','l','j'])]},
 {id:'blend-1',en:'Reading short a, i, o words',ps:'د a، i، o لنډ لفظونه لوستل',startGroup:'L2-U2',questions:[hear('b1-cat','cat',['cot','cat','cut']),hear('b1-dog','dog',['dig','dug','dog']),hear('b1-map','map',['map','mop','mat'])]},
 {id:'blend-2',en:'Reading short e and u words',ps:'د e او u لنډ لفظونه لوستل',startGroup:'L2-U5',questions:[hear('b2-bed','bed',['bad','bed','bud']),hear('b2-cup','cup',['cap','cop','cup']),hear('b2-hen','hen',['hen','hat','hut'])]},
 {id:'digraphs',en:'Reading sh, ch, th, ck, ng',ps:'د sh، ch، th، ck، ng لوستل',startGroup:'L3-U1',questions:[hear('d-ship','ship',['sip','ship','chip']),hear('d-fish','fish',['fish','fit','fig']),hear('d-duck','duck',['dug','duck','deck'])]},
 {id:'vowel-teams',en:'Reading ee, oo, ai, oa, ar',ps:'د ee، oo، ai، oa، ar لوستل',startGroup:'L3-U2',questions:[hear('v-rain','rain',['ran','run','rain']),hear('v-boat','boat',['boat','bat','bit']),hear('v-sheep','sheep',['ship','sheep','shop'])]},
 {id:'longer-words',en:'Reading frog, cake, kite',ps:'د frog، cake، kite په شان لفظونه لوستل',startGroup:'L3-U4',questions:[hear('w-frog','frog',['fog','frog','flag']),hear('w-cake','cake',['cake','cap','kick']),hear('w-kite','kite',['kit','cat','kite'])]},
 {id:'sentences',en:'Reading a sentence',ps:'جمله لوستل',startGroup:'L4-U5',questions:[sentence('r-pen','This is a pen.','pen',['cat','pen','ball']),sentence('r-hat','I have a hat.','hat',['hat','cup','bed']),sentence('r-apples','I like apples.','apples',['milk','bread','apples'])]},
 {id:'stories',en:'Reading a short story',ps:'لنډه قیصه لوستل',startGroup:'L5-U8',passage:'Ali has a cat. Ayesha has a red ball. The ball is in a box.',questions:[story('t-ayesha','What does Ayesha have?','عایشه سره څه دي؟','ball',['ball','cat','pen']),story('t-where','Where is the ball?','توپ چرته دی؟','box',['bag','box','bed']),story('t-ali','What does Ali have?','علي سره څه دي؟','cat',['cat','dog','hen'])]}
];
export const assessmentQuestions=assessmentSkills.flatMap(s=>s.questions);
export const skillOf=question=>assessmentSkills.find(s=>s.questions.includes(question));
export const freshAssessment=()=>({version:ASSESSMENT_VERSION,status:'intro',answers:[],startedAt:null,completedAt:null});
export const startAssessment=(now=new Date().toISOString())=>({...freshAssessment(),status:'active',startedAt:now});
export const answerCorrect=(question,value)=>value===question.answer;
// Results per skill reached so far (3 answers each).
export function skillResults(answers){return assessmentSkills.filter((_,i)=>answers.length>=(i+1)*3).map((s,i)=>{const correct=s.questions.filter((q,j)=>answerCorrect(q,answers[i*3+j])).length;return {skill:s.id,correct,total:3,passed:correct>=2};});}
// Early stop: after 5 answers, 4 or more wrong.
const stoppedEarly=answers=>answers.length>=5&&assessmentQuestions.slice(0,5).filter((q,i)=>!answerCorrect(q,answers[i])).length>=4;
export function assessmentQuestion(state){return state.status==='active'?assessmentQuestions[state.answers.length]:null;}
export function submitAssessment(state,response,now=new Date().toISOString()){
 if(state.status!=='active')return state;
 const question=assessmentQuestion(state);if(typeof response!=='string'||response!==''&&!question.options.includes(response))throw Error('Invalid starting-check response');
 const answers=[...state.answers,response],results=skillResults(answers);
 const ended=answers.length===assessmentQuestions.length||answers.length%3===0&&!results.at(-1).passed||answers.length===5&&stoppedEarly(answers);
 return {...state,answers,status:ended?'completed':'active',completedAt:ended?now:null};
}
export function skipAssessment(now=new Date().toISOString()){return {...freshAssessment(),status:'skipped',startedAt:now,completedAt:now};}
export function validateAssessment(input){
 if(input===undefined)return undefined;
 // A result from the first version (reading and typing questions) is replaced by a fresh check.
 if(input&&typeof input==='object'&&input.version==='starting-check-1')return freshAssessment();
 const fail=()=>{throw Error('Invalid starting-level check');},date=s=>typeof s==='string'&&Number.isFinite(Date.parse(s));
 if(!input||typeof input!=='object'||input.version!==ASSESSMENT_VERSION||!Array.isArray(input.answers)||input.answers.length>assessmentQuestions.length)fail();
 if(input.status==='intro'){if(input.answers.length||input.startedAt!==null||input.completedAt!==null)fail();return freshAssessment();}
 if(!date(input.startedAt))fail();
 if(input.status==='skipped'){if(input.answers.length||!date(input.completedAt))fail();return skipAssessment(input.completedAt);}
 let state=startAssessment(input.startedAt);
 for(const answer of input.answers){if(state.status!=='active')fail();state=submitAssessment(state,answer,input.completedAt||input.startedAt);}
 if(state.status!==input.status||state.status==='completed'&&!date(input.completedAt)||state.status==='active'&&input.completedAt!==null)fail();
 return state;
}
export function assessmentRecommendation(input){
 const state=validateAssessment(input);if(!state||!['completed','skipped'].includes(state.status))throw Error('Finish the starting check first');
 const results=skillResults(state.answers),early=stoppedEarly(state.answers);
 let passed=-1;for(const [i,r] of results.entries()){if(!r.passed)break;passed=i;}
 const skill=state.status==='skipped'||early||passed<0?null:assessmentSkills[passed];
 const lessonId=skill?unitStart(skill.startGroup):outline.lessons[0].id,startIndex=outline.lessons.findIndex(l=>l.id===lessonId);
 return {level:outline.lessons[startIndex].level,startIndex,lessonId,skill:skill?.id||null,stoppedEarly:early,results,answered:state.answers.length};
}
export function assessmentPlacement(state){const clean=validateAssessment(state),r=assessmentRecommendation(clean);return {source:'starting-check',level:r.level,date:clean.completedAt,assessment:clean};}
// Stable shuffle per learner and question, so the right answer is not always in the same place.
export function assessmentOptions(question,learnerId=''){let n=0;for(const c of question.id+learnerId)n=(Math.imul(n,31)+c.charCodeAt(0))>>>0;const out=[...question.options];for(let i=out.length-1;i>0;i--){n=(Math.imul(n,1664525)+1013904223)>>>0;const j=n%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
