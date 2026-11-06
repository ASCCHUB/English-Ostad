export const STUDY_TYPES=['spelling','sentences','reading','families','adult'];
export function validateLearning(input){
 const fail=()=>{throw Error('Invalid saved lesson progress');};
 if(input===undefined)return {};
 if(!input||typeof input!=='object'||Array.isArray(input))fail();
 const output={};const stepCounts={spelling:6,sentences:6,reading:4,families:3,adult:5};
 for(const [type,state] of Object.entries(input)){
  if(!STUDY_TYPES.includes(type)||!state||typeof state!=='object'||typeof state.itemId!=='string'||!/^[-a-z0-9]+$/.test(state.itemId)||state.itemId.length>80||!Number.isInteger(state.step)||state.step<0||state.step>=stepCounts[type]||!Number.isInteger(state.unlocked)||state.unlocked<state.step||state.unlocked>=stepCounts[type]||typeof state.finished!=='boolean'||!Array.isArray(state.answers)||state.answers.length>12||!state.answers.every(a=>a&&typeof a.key==='string'&&/^[-a-z0-9]+$/.test(a.key)&&a.key.length<40&&typeof a.correct==='boolean')||!Array.isArray(state.passed)||state.passed.length>12||!state.passed.every(key=>typeof key==='string'&&/^[-a-z0-9]+$/.test(key)&&key.length<40))fail();
  if(new Set(state.answers.map(a=>a.key)).size!==state.answers.length||new Set(state.passed).size!==state.passed.length||!state.passed.every(key=>state.answers.some(a=>a.key===key)))fail();
  const required={spelling:['missing','build','dictation'],sentences:['gap','order','write'],reading:['meaning'],families:['family-choice','family-write'],adult:['missing','dictation','context']}[type];
  if(!state.answers.every(a=>required.includes(a.key)))fail();
  const gates={spelling:[[3,'missing'],[4,'build'],[5,'dictation']],sentences:[[3,'gap'],[4,'order'],[5,'write']],reading:[[3,'meaning']],families:[[2,'family-choice']],adult:[[3,'missing'],[4,'dictation']]}[type];
  if(gates.some(([at,key])=>state.unlocked>=at&&!state.passed.includes(key)))fail();
  if(state.finished&&(!required.every(key=>state.passed.includes(key))||state.step!==stepCounts[type]-1))fail();
  output[type]={itemId:state.itemId,step:state.step,unlocked:state.unlocked,answers:state.answers.map(a=>({key:a.key,correct:a.correct})),passed:[...state.passed],finished:state.finished};
 }
 return output;
}
