import {adultWords} from './adultContent.js';
const ids=new Set(adultWords.map(w=>w.id));
export function validateAdult(input){
 if(input===undefined)return {words:{},lastWord:null};
 const fail=()=>{throw Error('Invalid adult spelling progress');};
 if(!input||typeof input!=='object'||Array.isArray(input)||!input.words||typeof input.words!=='object'||Array.isArray(input.words)||Object.keys(input.words).length>ids.size||input.lastWord!==null&&!ids.has(input.lastWord))fail();
 const words={};
 for(const [id,value] of Object.entries(input.words)){
  if(!ids.has(id)||!value||!Number.isSafeInteger(value.correct)||!Number.isSafeInteger(value.attempts)||value.correct<0||value.attempts<1||value.correct>value.attempts||!Number.isFinite(value.due)||value.due<0||typeof value.lastCorrect!=='boolean')fail();
  words[id]={correct:value.correct,attempts:value.attempts,due:value.due,lastCorrect:value.lastCorrect};
 }
 return {words,lastWord:input.lastWord};
}
export function recordAdultAttempt(profile,id,correct,now=Date.now()){
 if(!ids.has(id))throw Error('Unknown adult word');
 const adult=validateAdult(profile.adult),old=adult.words[id]||{correct:0,attempts:0};
 return {...profile,adult:{...adult,lastWord:id,words:{...adult.words,[id]:{correct:old.correct+(correct?1:0),attempts:old.attempts+1,lastCorrect:correct,due:now+(correct?Math.min(7,2**Math.min(old.correct,3))*86400000:3600000)}}}};
}
export function adultReviewDue(profile,now=Date.now()){return adultWords.filter(word=>{const stat=profile.adult?.words?.[word.id];return stat&&(!stat.lastCorrect||stat.due<=now);});}
export function adultStats(profile){const entries=Object.values(profile.adult?.words||{}),attempts=entries.reduce((n,w)=>n+w.attempts,0),correct=entries.reduce((n,w)=>n+w.correct,0);return {practised:entries.length,attempts,correct,accuracy:attempts?Math.round(correct/attempts*100):null,completed:adultWords.filter(w=>profile.completed.includes('study-adult-'+w.id)).length};}
export function adultCompletion(profile,level){const words=adultWords.filter(w=>w.level===level);return {total:words.length,completed:words.filter(w=>profile.completed.includes('study-adult-'+w.id)).length};}
export function adultNextIndex(index,level){const next=adultWords.findIndex((word,i)=>i>index&&word.level===level);return next>=0?next:adultWords.findIndex(word=>word.level===level+1);}
export function adultResumeIndex(profile){
 const checkpoint=profile.learning?.adult,index=adultWords.findIndex(w=>w.id===checkpoint?.itemId);
 if(index>=0&&!checkpoint.finished)return index;
 const pending=word=>!profile.completed.includes('study-adult-'+word.id);
 const next=adultWords.findIndex((word,i)=>i>index&&pending(word));
 return next>=0?next:adultWords.findIndex(pending);
}
export function adultCheckpoint(profile,id,now=Date.now()){
 const state=profile.learning?.adult;if(state?.itemId!==id)return null;
 const stat=profile.adult?.words?.[id];
 return state.finished&&stat&&(!stat.lastCorrect||stat.due<=now)?null:state;
}
export function filterAdultWords(profile,{level='all',search='',length='all',status='all',sort='course'}={},now=Date.now()){
 const due=new Set(adultReviewDue(profile,now).map(w=>w.id)),query=search.trim().toLowerCase();
 let result=adultWords.filter(w=>(level==='all'||w.level===Number(level))&&(!query||`${w.en} ${w.meaning}`.toLowerCase().includes(query))&&(length==='all'||length==='short'&&w.en.length<=4||length==='medium'&&w.en.length>=5&&w.en.length<=7||length==='long'&&w.en.length>=8)&&(status==='all'||status==='review'&&due.has(w.id)||status==='completed'&&profile.completed.includes('study-adult-'+w.id)||status==='new'&&!profile.completed.includes('study-adult-'+w.id)));
 if(sort!=='course')result=[...result].sort((a,b)=>sort==='az'?a.en.localeCompare(b.en):sort==='short'?a.en.length-b.en.length||a.en.localeCompare(b.en):b.en.length-a.en.length||a.en.localeCompare(b.en));return result;
}
export function checkAdultSpelling(answer,expected){
 const alternatives={colour:['color'],behaviour:['behavior'],organise:['organize'],acknowledgement:['acknowledgment']};
 const value=String(answer).trim().toLowerCase(),target=expected.toLowerCase();
 if(alternatives[target]?.includes(value))return {correct:false,variant:true,issue:`${answer.trim()} is also a standard English spelling. This lesson practises ${expected}; enter that form to complete the exercise.`};
 const correct=value===target;let i=0;while(i<Math.min(value.length,target.length)&&value[i]===target[i])i++;
 return {correct,variant:false,issue:correct?'':value.length!==target.length?`The target spelling ${expected} has ${expected.length} letters. Compare it with your answer, then try again.`:`Check letter ${i+1}. The target spelling is ${expected}.`};
}
