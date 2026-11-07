// Checks a game bank. Used by scripts/check-game-bank.mjs and src/ustad/games.test.js.
// fileExists(publicPath) is passed in so this module stays free of Node APIs.
import {wordPhoto} from '../wordPhotos.js';
import {hasArt,hasPlace} from './art.js';
import {animals,initialSoundWords} from './content/words.js';
import {gpcs} from '../firstSteps/tasks.js';
const firstSound=w=>{const id=Object.entries(initialSoundWords).find(([,l])=>l.includes(w))?.[0];return id?gpcs[id].ipa:null;};
import {approved} from './content/pashto.js';

const SKILL_ACTIVITIES=['choice','letter-grid','word-tap','feed','feed-to','order'];
export function pictureFile(ref){
 if(typeof ref!=='string')return null;
 if(ref.startsWith('photo:'))return wordPhoto(ref.slice(6))?.src||null;
 if(ref.startsWith('art:'))return hasArt(ref.slice(4))?'art':null;
 return null;
}
const optionContent=o=>JSON.stringify([o.text??null,o.picture??null,o.size??null,o.group?[o.group.picture,o.group.count]:null,o.scene?[o.scene.item,o.scene.landmark,o.scene.position]:null,o.sound?.ipa??null]);
const sceneSentence=s=>`The ${s.itemWord} is ${s.position} the ${s.landmarkWord}.`;

export function validateBank(bank,{fileExists=()=>true,recordings={},levels=20,perLevel=10}={}){
 const errors=[],err=(q,msg)=>errors.push(`${q?.id||bank.game}: ${msg}`);
 const qs=bank.questions||[];
 if(qs.length!==levels*perLevel)err(null,`has ${qs.length} questions, expected ${levels*perLevel}`);
 const ids=new Set(),keys=new Set(),fingerprints=new Set();
 for(let level=1;level<=levels;level++){const inLevel=qs.filter(q=>q.level===level);if(inLevel.length!==perLevel)err(null,`level ${level} has ${inLevel.length} questions`);
  for(const round of [1,2])if(inLevel.filter(q=>q.round===round).length!==perLevel/2)err(null,`level ${level} round ${round} is not ${perLevel/2} questions`);}
 const checkPicture=(q,ref,where)=>{const file=pictureFile(ref);if(!file)err(q,`${where}: unknown picture ${ref}`);else if(file!=='art'&&!fileExists(file))err(q,`${where}: missing file ${file}`);};
 const checkScene=(q,sc,where)=>{if(!hasPlace(sc.landmark.replace(/^art:/,''),sc.position))err(q,`${where}: no layout for ${sc.position} the ${sc.landmarkWord}`);};
 const checkSound=(q,s,where)=>{if(!s?.recording||!s.grapheme||!s.ipa)err(q,`${where}: incomplete sound`);else if(Object.keys(recordings).length&&!recordings[s.recording])err(q,`${where}: no recording slot ${s.recording}`);};
 for(const q of qs){
  if(ids.has(q.id))err(q,'duplicate id');ids.add(q.id);
  if(q.game!==bank.game)err(q,'wrong game');
  for(const f of ['class','level','skill','activity','say','hint','feedback','key'])if(q[f]===undefined||q[f]==='')err(q,`missing ${f}`);
  if(!SKILL_ACTIVITIES.includes(q.activity))err(q,`unknown activity ${q.activity}`);
  if(!q.instruction?.en)err(q,'missing English instruction');
  if(!q.instruction?.ps?.text||!['check','approved'].includes(q.instruction.ps.status))err(q,'missing Pashto explanation or status');
  if(!Array.isArray(q.gloss))err(q,'missing Pashto word meanings list');
  if(!q.instruction?.ur?.text||q.instruction.ur.status!=='check'||/{x}/.test(q.instruction.ur.text))err(q,'missing Urdu instruction');
  if(/\/[a-zæɪɒʌ]+\//i.test(q.say))err(q,'spoken text contains a phoneme mark; device speech must not say sounds');
  if(keys.has(q.key))err(q,`duplicate content key ${q.key}`);keys.add(q.key);
  const opts=q.options||[];
  if(opts.length<2)err(q,'fewer than two choices');
  if(new Set(opts.map(o=>o.id)).size!==opts.length)err(q,'duplicate choice ids');
  if(q.activity!=='order'&&q.activity!=='word-tap'&&new Set(opts.map(optionContent)).size!==opts.length)err(q,'two choices look the same');
  const fp=JSON.stringify([q.instruction.en,q.prompt,JSON.stringify(q.answer)]);if(fingerprints.has(fp))err(q,'same question as another');fingerprints.add(fp);
  // Assets
  for(const o of opts){if(o.picture)checkPicture(q,o.picture,'choice');if(o.group)checkPicture(q,o.group.picture,'group');if(o.scene){checkScene(q,o.scene,'choice scene');checkPicture(q,o.scene.item,'scene item');checkPicture(q,o.scene.landmark,'scene landmark');}if(o.sound)checkSound(q,o.sound,'choice sound');}
  const p=q.prompt||{};
  if(p.picture)checkPicture(q,p.picture,'prompt');if(p.group)checkPicture(q,p.group.picture,'prompt group');(p.groups||[]).forEach(g=>checkPicture(q,g.picture,'prompt group'));
  if(p.scene){checkScene(q,p.scene,'prompt scene');checkPicture(q,p.scene.item,'prompt scene');checkPicture(q,p.scene.landmark,'prompt scene');}
  (p.animals||[]).forEach(a=>checkPicture(q,a.picture,'animal'));if(p.food)checkPicture(q,p.food.picture,'food');
  if(p.sound)checkSound(q,p.sound,'prompt sound');(p.sounds||[]).forEach(s=>checkSound(q,s,'blend sound'));
  // Answers
  const byId=Object.fromEntries(opts.map(o=>[o.id,o]));
  if(q.activity==='feed'){
   if(!Array.isArray(q.answer)||!q.answer.length)err(q,'feed answer must be a list of steps');
   const animalIds=(p.animals||[]).map(a=>a.id);
   for(const step of q.answer||[]){if(!byId[step.food])err(q,`answer food ${step.food} is not a choice`);if(!animalIds.includes(step.animal))err(q,`answer animal ${step.animal} is not shown`);}
   if(new Set((q.answer||[]).map(s=>s.food)).size!==(q.answer||[]).length)err(q,'a food is used twice');
   // Wrong foods must be foods the animals do not eat (colour and counting tasks offer the same food).
   if(['follow-instructions','two-steps'].includes(q.skill)){const right=new Set(q.answer.map(s=>s.food));
    for(const o of opts)if(!right.has(o.id)&&animalIds.some(a=>animals[a]?.eats.includes(o.label)))err(q,`distractor ${o.label} is food the animal eats`);
    if(q.skill==='two-steps')for(const s of q.answer){const other=q.answer.find(x=>x!==s);if(animals[other.animal]?.eats.includes(byId[s.food].label))err(q,'second animal also eats the first food');}}
  }else if(q.activity==='order'){
   const texts=opts.map(o=>o.text).sort(),answer=[...(q.answer||[])].sort();
   if(JSON.stringify(texts)!==JSON.stringify(answer))err(q,'word tiles do not make the answer sentence');
  }else{
   if(!byId[q.answer])err(q,`answer ${q.answer} is not a choice`);
  }
  // Distractors are wrong and unambiguous.
  if(q.activity==='choice'||q.activity==='letter-grid'){const a=byId[q.answer];
   if(a?.text!==undefined&&opts.filter(o=>o.text===a.text).length!==1)err(q,'answer text appears more than once');
   const sounds=opts.filter(o=>o.sound);if(sounds.length&&new Set(sounds.map(o=>o.sound.ipa)).size!==sounds.length)err(q,'two sound choices make the same sound');
   if(opts.some(o=>o.group)&&new Set(opts.map(o=>o.group?.count)).size!==opts.length)err(q,'two groups have the same count');
   if(q.prompt?.scene&&opts.every(o=>o.sentence)){const truth=sceneSentence(q.prompt.scene);if(opts.filter(o=>o.text===truth).length!==1||byId[q.answer]?.text!==truth)err(q,'not exactly one true sentence');}
   if(opts.every(o=>o.scene)){const m=/^Find the (?:(\w+) )?(\w+) (under|beside|behind|on|in front of|in) the (\w+)\.$/.exec(q.instruction.en);
    if(!m)err(q,'scene instruction not understood');else{const [,c1,c2,where,lm]=m,color=c2&&c1?c1:null,item=c2;
     const fits=opts.filter(o=>o.scene.itemWord===item&&o.scene.position===where&&o.scene.landmarkWord===lm&&(!color||o.scene.item.endsWith('-'+color)));
     if(fits.length!==1||fits[0].id!==q.answer)err(q,'scene choices: not exactly one matches the instruction');}}
  }
  if(q.skill==='initial-sound'&&p.sound){const same=opts.filter(o=>firstSound(o.label)===p.sound.ipa);if(same.length!==1||same[0].id!==q.answer)err(q,'not exactly one picture starts with the sound');if(opts.some(o=>!firstSound(o.label)))err(q,'a picture has no known first sound');}
  if(q.activity==='feed-to'){const food=p.food?.id;for(const o of opts)if(o.id!==q.answer&&animals[o.label]?.eats.includes(food))err(q,`${o.label} also eats ${food}`);if(!animals[byId[q.answer]?.label]?.eats.includes(food))err(q,'answer animal does not eat this food');}
  if(q.activity==='word-tap'){const t=p.target;if(opts.filter(o=>o.text===t).length!==1)err(q,'target letter must appear exactly once');if(byId[q.answer]?.text!==t)err(q,'answer is not the target letter');}
 }
 // Approved Pashto phrases are used exactly as written.
 for(const [k,v] of Object.entries({start:'سبق شروع کړئ.',whichCorrect:'صحیح جواب کوم یو دی؟',taskDone:'ډېر ښه، تاسو ټاسک پوره کړو'}))if(approved[k]!==v)errors.push(`approved phrase ${k} changed`);
 return errors;
}
