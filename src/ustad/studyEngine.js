import {completeActivity,seededRandom,shuffle} from './engine.js';
import {validateLearning} from './studyValidation.js';
export {STUDY_TYPES} from './studyValidation.js';
export function normalizeText(text){return String(text).trim().replace(/\s+/g,' ').replace(/[’‘]/g,"'");}
export function checkSpelling(answer,expected){const value=normalizeText(answer);const correct=value.toLowerCase()===expected.toLowerCase();let at=0;while(at<Math.min(value.length,expected.length)&&value[at].toLowerCase()===expected[at].toLowerCase())at++;return {correct,expected,issue:correct?'':value.length!==expected.length?`This word needs ${expected.length} letters. Look at ${expected}.`:`Look again at letter ${at+1}. The correct spelling is ${expected}.`};}
export function checkSentence(answer,expected){const value=normalizeText(answer),target=normalizeText(expected),body=value.replace(/[.!?]+$/,''),targetBody=target.replace(/[.!?]+$/,''),issues=[];if(body.toLowerCase()!==targetBody.toLowerCase())issues.push('words');if(body.toLowerCase()===targetBody.toLowerCase()&&body!==targetBody)issues.push('capital');if(value.slice(body.length)!==target.slice(targetBody.length))issues.push('punctuation');return {correct:issues.length===0,issues,expected:target,message:issues.includes('words')?'For this exercise, use the words from the sentence you practiced.':issues.includes('capital')?'Match the capital letters in the example: start with a capital, use capital I, and keep other words lowercase unless they are names.':issues.includes('punctuation')?`End this sentence with ${target.endsWith('?')?'a question mark (?)':target.endsWith('!')?'an exclamation mark (!)':'one full stop (.)'}.`:'A complete sentence. Wonderful writing!'};}
export function letterPuzzle(word){const position=Math.floor(word.length/2),answer=word[position].toLowerCase(),others=[...'aeioubcdfghjklmnpqrstvwxyz'].filter(c=>c!==answer).slice(0,2);return {prompt:word.slice(0,position)+'_'+word.slice(position+1),answer,position,options:shuffle([answer,...others],seededRandom(word+'missing'))};}
export function studyTiles(text,seed=''){return shuffle(text.map((label,id)=>({id,label})),seededRandom(seed));}
export function blankCheckpoint(itemId){return {itemId,step:0,unlocked:0,answers:[],passed:[],finished:false};}
export function checkpointAnswer(checkpoint,key,correct){return {...checkpoint,answers:checkpoint.answers.some(a=>a.key===key)?checkpoint.answers:[...checkpoint.answers,{key,correct}],passed:correct?[...new Set([...checkpoint.passed,key])]:checkpoint.passed};}
export function saveCheckpoint(profile,type,checkpoint){return {...profile,learning:{...profile.learning,[type]:checkpoint}};}
export function finishStudy(profile,type,checkpoint,label,now=new Date()){
 const old=profile.learning?.[type];if(old?.itemId===checkpoint.itemId&&old.finished)return profile;
 validateLearning({[type]:{...checkpoint,finished:true}});
 const completed=completeActivity(profile,`study-${type}-${checkpoint.itemId}`,now),score=checkpoint.answers.filter(a=>a.correct).length;
 const result={date:now.toISOString(),mode:`${type}-course`,score,total:checkpoint.answers.length,review:score===checkpoint.answers.length?[]:[label]};
 return {...saveCheckpoint(completed,type,{...checkpoint,finished:true}),results:result.total?[...completed.results,result]:completed.results};
}
