// Builds the question banks for the five original games from structured data:
//   src/ustad/games/content/words.js   (letters, sounds, animals and food, numbers, Fox objects)
//   src/ustad/games/content/pashto.js  (Pashto instructions and new word meanings, flagged for review)
// Writes src/ustad/games/bank/<game>.json and bank/index.json. Safe to rerun: the output is deterministic.
// Then run: node scripts/check-game-bank.mjs   (validation; also part of npm test)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as W from '../src/ustad/games/content/words.js';
import {templates,newMeanings} from '../src/ustad/games/content/pashto.js';
import {urduGameTemplates} from '../src/ustad/locales/ur.js';
import {wordPhoto} from '../src/ustad/wordPhotos.js';
import {hasArt} from '../src/ustad/games/art.js';
import psLocale from '../src/ustad/locales/ps.js';
import {gpcs} from '../src/ustad/firstSteps/tasks.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'src/ustad/games/bank');
const LEVELS=20,PER_LEVEL=10,PER_GAME=LEVELS*PER_LEVEL;

// ---------- helpers ----------
function rng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
let rand=rng(1);
const shuffle=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pickOther=(pool,n,exclude=[])=>shuffle(pool.filter(x=>!exclude.includes(x))).slice(0,n);
const cap=s=>s[0].toUpperCase()+s.slice(1);
function photo(word){
 const record=wordPhoto(word);
 if(!record)throw Error(`No picture for "${word}"`);
 if(!fs.existsSync(path.join(root,'public',record.src)))throw Error(`Picture file missing for "${word}": ${record.src}`);
 return 'photo:'+word;
}
function art(ref){if(!hasArt(ref))throw Error('No art for '+ref);return 'art:'+ref;}
const entries=psLocale.entries;
// Pashto meaning of an English word: the app's word list first (reviewed or style-checked), then a draft.
function gloss(words){
 return words.filter(Boolean).map(en=>{
  const key=en.replace(/ \(colour\)$/,'');
  const entry=!/ \(colour\)$/.test(en)&&(entries[cap(key)]||entries[key]);
  if(entry&&entry.status!=='check')return {en:key,ps:entry.ps,status:entry.status==='approved'?'approved':'reviewed-list'};
  const draft=newMeanings[en]||newMeanings[key];
  if(draft)return {en:key,ps:draft,status:'check'};
  if(entry)return {en:key,ps:entry.ps,status:'check'};
  return null;
 }).filter(Boolean);
}
// tpl and x let the assembler add the matching Urdu line (locales/ur.js) next to the Pashto one.
const ps=(skill,x)=>({text:templates[skill].replace('{x}',x??''),status:'check',tpl:skill,x:x??''});
const tts=text=>({kind:'tts',text});

// Sounds: the course's sound ids, their spelling and recording slot (a phoneme plays only from a real recording).
// example: a picture word that starts with the sound, offered while the phoneme recording is missing.
const sound=id=>{const g=gpcs[id];if(!g)throw Error('Unknown sound '+id);const example=(W.initialSoundWords[id]||[])[0];return {id,grapheme:g.spelling,ipa:g.ipa,recording:g.recordingId,...(example?{example,examplePicture:photo(example)}:{})};};
const soundOption=id=>({id:'snd-'+id,sound:sound(id),label:'/'+gpcs[id].spelling+'/'});
const sameSound=(a,b)=>gpcs[a].ipa===gpcs[b].ipa;
const SINGLE_SOUNDS=['s','a','t','p','i','n','m','d','g','o','c','k','e','u','r','h','b','f','l','j','v','w','y','z'];
const VOWELS=['a','e','i','o','u'];
const vowelExample={a:'apple',e:'egg',i:'ink',o:'ox',u:'up'};
const otherSounds=(target,n,pool=SINGLE_SOUNDS,avoid=[])=>shuffle(pool.filter(s=>!sameSound(s,target)&&!avoid.some(a=>sameSound(a,s)))).filter((s,i,arr)=>arr.findIndex(x=>sameSound(x,s))===i).slice(0,n);
const firstSoundOf=word=>Object.entries(W.initialSoundWords).find(([,list])=>list.includes(word))?.[0]||(word[0]==='c'?'c':word[0]);

const textOption=(t,extra={})=>({id:'t-'+t.replace(/\s+/g,'_'),text:t,...extra});
const pictureOption=(word,extra={})=>({id:'w-'+word,picture:photo(word),label:word,...extra});

// ---------- 1. Letter Hunt ----------
function letterHunt(){
 rand=rng(101);const Q=[];const AZ=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],az=AZ.map(l=>l.toLowerCase());
 const fill=(target,looks,pool,n)=>{const set=[target,...[...looks].filter(l=>l!==target&&pool.includes(l))].slice(0,n);return shuffle([...set,...pickOther(pool,n-set.length,set)]);};
 AZ.forEach((X,i)=>{const n=i<20?4:6;Q.push({skill:'uppercase',skillLabel:'Uppercase letters',activity:'letter-grid',key:'find-upper:'+X,
  instruction:{en:`Find the uppercase letter ${X}.`,ps:ps('find-upper',X)},say:`Find the uppercase letter ${X}.`,
  prompt:{letterName:X},options:fill(X,W.lookAlikeUpper[X],AZ,n).map(l=>textOption(l)),answer:'t-'+X,
  hint:W.upperShape[X],feedback:`Yes! This is uppercase ${X}. Its name is “${W.letterName[X]}”.`,gloss:gloss(['uppercase','letter']),practiced:'uppercase letters'});});
 az.forEach((x,i)=>{Q.push({skill:'lowercase',skillLabel:'Lowercase letters',activity:'letter-grid',key:'find-lower:'+x,
  instruction:{en:`Find the lowercase letter ${x}.`,ps:ps('find-lower',x)},say:`Find the lowercase letter ${x.toUpperCase()}.`,
  prompt:{letterName:x},options:fill(x,W.lookAlikeLower[x],az,i<10?4:6).map(l=>textOption(l)),answer:'t-'+x,
  hint:W.lowerShape[x],feedback:`Yes! This is lowercase ${x}. Its name is “${W.letterName[x.toUpperCase()]}”, like big ${x.toUpperCase()}.`,gloss:gloss(['lowercase','letter']),practiced:'lowercase letters'});});
 AZ.forEach(X=>{const x=X.toLowerCase();Q.push({skill:'match-case',skillLabel:'Big and small partners',activity:'choice',key:'upper-lower:'+X,
  instruction:{en:`Find the lowercase partner of ${X}.`,ps:ps('match-upper-lower',X)},say:`Find the lowercase partner of ${X}.`,
  prompt:{big:X},options:fill(x,W.lookAlikeLower[x],az,4).map(l=>textOption(l)),answer:'t-'+x,
  hint:`Big ${X} and small ${x} have the same name. ${W.lowerShape[x]}`,feedback:`${X} and ${x} are partners. They are both the letter “${W.letterName[X]}”.`,gloss:gloss(['uppercase','lowercase']),practiced:'big and small letter partners'});});
 az.forEach(x=>{const X=x.toUpperCase();Q.push({skill:'match-case',skillLabel:'Big and small partners',activity:'choice',key:'lower-upper:'+x,
  instruction:{en:`Find the uppercase partner of ${x}.`,ps:ps('match-lower-upper',x)},say:`Find the uppercase partner of small ${X}.`,
  prompt:{big:x},options:fill(X,W.lookAlikeUpper[X],AZ,4).map(l=>textOption('U'+l,{text:l})).map(o=>({...o,id:'t-'+o.text})),answer:'t-'+X,
  hint:`Small ${x} grows up into big ${X}. ${W.upperShape[X]}`,feedback:`${x} and ${X} are partners: the letter “${W.letterName[X]}”.`,gloss:gloss(['uppercase','lowercase']),practiced:'big and small letter partners'});});
 W.firstLetterWords.forEach(word=>{const f=word[0];Q.push({skill:'letters-in-words',skillLabel:'Letters in words',activity:'choice',key:'first-letter:'+word,
  instruction:{en:`Look at the word “${word}”. Which letter does it start with?`,ps:ps('first-letter',word)},say:`${word}. Which letter does ${word} start with?`,
  prompt:{picture:photo(word),word},options:shuffle([f,...pickOther(az,2,[...new Set(word)])]).map(l=>textOption(l)),answer:'t-'+f,
  hint:`Look at the first letter on the left of “${word}”.`,feedback:`“${word}” starts with the letter ${f}.`,gloss:gloss([word]),practiced:'first letters in words'});});
 W.letterInWord.forEach(([word,t])=>{if([...word].filter(c=>c===t).length!==1)throw Error('letter-in-word needs one '+t+' in '+word);
  Q.push({skill:'letters-in-words',skillLabel:'Letters in words',activity:'word-tap',key:'in-word:'+word+':'+t,
  instruction:{en:`Find the letter ${t} in the word “${word}”.`,ps:ps('letter-in-word',word)},say:`Find the letter ${t.toUpperCase()} in ${word}.`,
  prompt:{picture:photo(word),target:t},options:[...word].map((c,i)=>({id:'p'+i,text:c})),answer:'p'+word.indexOf(t),
  hint:`${W.lowerShape[t]} Look at each letter of “${word}”.`,feedback:`There it is: ${t} in “${word}”.`,gloss:gloss([word]),practiced:'letters inside words'});});
 for(let i=0;i<16;i++){const start=i+(i>=8?2:0),run=AZ.slice(start,start+4),gap=(i%3)+1,target=run[gap];
  Q.push({skill:'alphabet-order',skillLabel:'Missing letters',activity:'choice',key:'sequence:'+run.join(''),
  instruction:{en:`Which letter is missing? ${run.map((l,j)=>j===gap?'_':l).join(' ')}`,ps:ps('sequence')},say:`Which letter is missing? ${run.map((l,j)=>j===gap?'blank':l).join(', ')}.`,
  prompt:{sequence:run.map((l,j)=>j===gap?null:l)},options:shuffle([target,...pickOther(AZ,2,run)]).map(l=>textOption(l)),answer:'t-'+target,
  hint:`Sing the alphabet from ${run[0]}: ${run.slice(0,gap).join(', ')}, …`,feedback:`${run.join(', ')}. ${target} comes after ${run[gap-1]}.`,gloss:gloss(['letter']),practiced:'the order of the alphabet'});}
 [...'BDFHKMPRTW'].forEach(X=>{const i=AZ.indexOf(X),next=AZ[i+1],prev=AZ[i-1];
  Q.push({skill:'alphabet-order',skillLabel:'Missing letters',activity:'choice',key:'after:'+X,
  instruction:{en:`Which letter comes just after ${X}?`,ps:ps('after',X)},say:`Which letter comes just after ${X}?`,prompt:{big:X+' → ?'},
  options:shuffle([next,prev,pickOther(AZ,1,[next,prev,X])[0]]).map(l=>textOption(l)),answer:'t-'+next,
  hint:`Say the alphabet: …${prev}, ${X}, and then?`,feedback:`${X}, ${next}. ${next} comes just after ${X}.`,gloss:gloss(['letter']),practiced:'the order of the alphabet'});});
 [...'cegjlnqsvy'].forEach(x=>{const i=az.indexOf(x),prev=az[i-1],next=az[i+1];
  Q.push({skill:'alphabet-order',skillLabel:'Missing letters',activity:'choice',key:'before:'+x,
  instruction:{en:`Which letter comes just before ${x}?`,ps:ps('before',x)},say:`Which letter comes just before ${x.toUpperCase()}?`,prompt:{big:'? → '+x},
  options:shuffle([prev,next,pickOther(az,1,[prev,next,x])[0]]).map(l=>textOption(l)),answer:'t-'+prev,
  hint:`Say the alphabet up to ${x}. Which letter did you say just before it?`,feedback:`${prev}, ${x}. ${prev} comes just before ${x}.`,gloss:gloss(['letter']),practiced:'the order of the alphabet'});});
 return Q;
}

// ---------- 2. Sound Safari ----------
function soundSafari(){
 rand=rng(202);const Q=[];
 const example=id=>(W.initialSoundWords[id]||[])[0];
 ['s','a','t','p','i','n','m','d','g','o','c','e','u','r','h','b','f','l','j','v'].forEach(id=>{const letter=gpcs[id].spelling,name=W.letterName[letter.toUpperCase()];
  Q.push({skill:'sound-letter',skillLabel:'Sounds and letters',activity:'choice',key:'sound-letter:'+id,
  instruction:{en:'Listen to the sound. Which letter makes this sound?',ps:ps('sound-letter')},say:'Listen to the sound. Which letter makes this sound?',
  prompt:{sound:sound(id),hideGrapheme:true},options:shuffle([id,...otherSounds(id,2)]).map(s=>textOption(gpcs[s].spelling)),answer:'t-'+letter,
  hint:W.soundHint[id],feedback:`The letter ${letter} is called “${name}”, but its sound is /${letter}/, as in ${example(id)}.`,gloss:gloss(['sound','letter']),practiced:'letter sounds'});});
 // Initial sounds: 40 words picture → sound, then 30 other words sound → picture.
 const groups=Object.entries(W.initialSoundWords),order=[];
 for(let round=0;order.length<groups.reduce((n,[,l])=>n+l.length,0);round++)for(const [id,list] of groups)if(list[round])order.push([id,list[round]]);
 order.slice(0,40).forEach(([id,word])=>{
  Q.push({skill:'initial-sound',skillLabel:'First sounds',activity:'choice',key:'initial:'+word,
  instruction:{en:`Say “${word}”. Which sound does it start with?`,ps:ps('initial-sound',word)},say:`${word}. Which sound does ${word} start with?`,
  prompt:{picture:photo(word),wordAudio:word},options:shuffle([id,...otherSounds(id,2)]).map(soundOption),answer:'snd-'+id,
  hint:`Say “${word}” slowly. Listen to the very first sound. ${W.soundHint[id]}`,feedback:`“${word}” starts with the sound /${gpcs[id].spelling}/.`,gloss:gloss([word]),practiced:'first sounds in words',revealWord:true});});
 const allWords=Object.values(W.initialSoundWords).flat();
 order.slice(40,70).forEach(([id,word])=>{const others=shuffle(allWords.filter(w=>!sameSound(firstSoundOf(w),id))).slice(0,2);
  Q.push({skill:'initial-sound',skillLabel:'First sounds',activity:'choice',key:'sound-picture:'+word,
  instruction:{en:'Listen to the sound. Which picture starts with this sound?',ps:ps('sound-picture')},say:'Listen to the sound. Which picture starts with this sound?',
  prompt:{sound:sound(id)},options:shuffle([word,...others]).map(w=>pictureOption(w)),answer:'w-'+word,
  hint:`Say each picture's name. Which one starts like this? ${W.soundHint[id]}`,feedback:`“${word}” starts with /${gpcs[id].spelling}/.`,gloss:gloss([word,...others]),practiced:'first sounds in words'});});
 W.finalSoundWords.forEach(([word,id])=>{const first=firstSoundOf(word),avoid=sameSound(first,id)?[]:[first];
  const opts=[id,...avoid,...otherSounds(id,2-avoid.length,SINGLE_SOUNDS,avoid)].slice(0,3);
  Q.push({skill:'final-sound',skillLabel:'Last sounds',activity:'choice',key:'final:'+word,
  instruction:{en:`Say “${word}”. Which sound do you hear at the end?`,ps:ps('final-sound',word)},say:`${word}. Which sound do you hear at the end of ${word}?`,
  prompt:{picture:photo(word),wordAudio:word},options:shuffle(opts).map(soundOption),answer:'snd-'+id,
  hint:`Say “${word}” slowly and stop at the end. ${W.soundHint[id]}`,feedback:`“${word}” ends with the sound /${gpcs[id].spelling}/.`,gloss:gloss([word]),practiced:'last sounds in words',revealWord:true});});
 [...W.vowelWords,['jug','u']].forEach(([word,v])=>{
  Q.push({skill:'vowel',skillLabel:'Middle vowel sounds',activity:'choice',key:'vowel:'+word,
  instruction:{en:`Say “${word}”. Which sound is in the middle?`,ps:ps('vowel',word)},say:`${word}. Which sound is in the middle of ${word}?`,
  prompt:{picture:photo(word),wordAudio:word},options:shuffle([v,...pickOther(VOWELS,2,[v])]).map(soundOption),answer:'snd-'+v,
  hint:`The middle sound is a vowel: a, e, i, o or u. ${W.soundHint[v]}`,feedback:`The middle sound of “${word}” is /${v}/, as in ${vowelExample[v]}.`,gloss:gloss([word]),practiced:'short vowel sounds',revealWord:true});});
 W.blendWords.slice(0,40).forEach(word=>{const parts=[...word];
  const near=shuffle(W.blendWords.filter(w=>w!==word&&(w[1]===word[1]||w[0]===word[0]))),far=shuffle(W.blendWords.filter(w=>w!==word&&!near.includes(w)));
  const others=[...near.slice(0,1),...far].slice(0,2);
  Q.push({skill:'blend',skillLabel:'Blending sounds',activity:'choice',key:'blend:'+word,
  instruction:{en:`Blend the sounds: ${parts.join(' – ')}. Which picture is it?`,ps:ps('blend')},say:'Listen to each sound, then blend them together. Which picture is it?',
  prompt:{sounds:parts.map(sound)},options:shuffle([word,...others]).map(w=>pictureOption(w)),answer:'w-'+word,
  hint:`Say the sounds faster and faster: ${parts.join('… ')}…`,feedback:`${parts.join(' – ')} makes “${word}”.`,gloss:gloss([word]),practiced:'blending sounds into words',blendWord:word});});
 return Q;
}

// ---------- 3. Feed the Animal ----------
function feedAnimal(){
 rand=rng(303);const Q=[];const A=W.animals;
 const confusable=[['orange','lemon','peach','mango'],['rice','seed','corn'],['cake','bread','cheese'],['juice','milk'],['apple','cherry','tomato','peach']];
 const clash=(a,b)=>confusable.some(g=>g.includes(a)&&g.includes(b));
 const notEaten=(animal,n,also=[])=>shuffle(W.foods.filter(f=>![...A[animal].eats,...also].includes(f)&&!clash(f,also[0]||''))).slice(0,n);
 const giveText=(animal,food)=>`Give the ${animal} ${W.article[food]||'a'} ${food}.`;
 W.foods.slice(0,24).forEach(food=>{const others=shuffle(W.foods.filter(f=>f!==food&&!clash(f,food))).slice(0,2);
  Q.push({skill:'food-words',skillLabel:'Food words',activity:'choice',key:'food:'+food,
  instruction:{en:`Find the ${food}.`,ps:ps('food-name',food)},say:`Find the ${food}.`,prompt:{word:food},
  options:shuffle([food,...others]).map(w=>pictureOption(w)),answer:'w-'+food,
  hint:`Listen again: ${food}. Look at each picture.`,feedback:`This is ${W.article[food]==='some'?'':W.article[food]||'a'} ${food}.`.replace('is  ','is '),gloss:gloss([food,...others]),practiced:'food words'});});
 const animalList=[...Object.keys(A),'cow'];
 animalList.slice(0,20).forEach(animal=>{const others=pickOther(animalList,2,[animal]);
  Q.push({skill:'animal-words',skillLabel:'Animal names',activity:'choice',key:'animal:'+animal,
  instruction:{en:`Who is hungry? Find the ${animal}.`,ps:ps('animal-name',animal)},say:`Who is hungry? Find the ${animal}.`,prompt:{word:animal},
  options:shuffle([animal,...others]).map(w=>pictureOption(w)),answer:'w-'+animal,
  hint:`Listen again: ${animal}.`,feedback:`Yes, this is the ${animal}.`,gloss:gloss([animal,...others]),practiced:'animal names'});});
 for(const [animal,{serve}] of Object.entries(A))for(const food of serve){const others=notEaten(animal,2,[food]);
  Q.push({skill:'follow-instructions',skillLabel:'Follow an instruction',activity:'feed',key:'feed:'+animal+':'+food,
  instruction:{en:giveText(animal,food),ps:ps('feed')},say:giveText(animal,food),prompt:{animals:[{id:animal,picture:photo(animal)}]},
  options:shuffle([food,...others]).map(w=>pictureOption(w)),answer:[{food:'w-'+food,animal}],
  hint:`Listen for the food word: ${food}.`,feedback:`The ${animal} likes ${W.plural[food]||food}. Yum!`,gloss:gloss([animal,food,...others]),practiced:'following feeding instructions',instructionCount:1});}
 const colorTasks=[...['horse','elephant','monkey','rabbit'].flatMap(a=>['red','green','yellow'].map(c=>[a,'apple',c])),...['bee','butterfly'].flatMap(a=>['red','yellow','pink','purple','blue','white'].map(c=>[a,'flower',c]))];
 colorTasks.forEach(([animal,item,color])=>{const palette=item==='apple'?['red','green','yellow']:['red','yellow','pink','purple','blue','white'];const others=pickOther(palette,2,[color]);
  Q.push({skill:'colors',skillLabel:'Colours',activity:'feed',key:'feed-color:'+animal+':'+item+':'+color,
  instruction:{en:`Give the ${animal} the ${color} ${item}.`,ps:ps('feed-color')},say:`Give the ${animal} the ${color} ${item}.`,prompt:{animals:[{id:animal,picture:photo(animal)}]},
  options:shuffle([color,...others]).map(c=>({id:'c-'+c,picture:art(item+'-'+c),label:`${c} ${item}`})),answer:[{food:'c-'+color,animal}],
  hint:`Look for the colour ${color}.`,feedback:`You gave the ${animal} the ${color} ${item}.`,gloss:gloss([animal,item,color==='orange'?'orange (colour)':color]),practiced:'colour words',instructionCount:1});});
 const countPairs=Object.entries(A).flatMap(([a,{serve,eats}])=>[...new Set([...serve,...eats])].filter(f=>W.countableFoods.includes(f)&&serve.concat(eats.slice(0,3)).includes(f)).map(f=>[a,f]));
 const seenCount=new Set();let made=0;
 for(let i=0;made<40&&i<400;i++){const [animal,food]=countPairs[(i*7)%countPairs.length],n=(i%5)+1,key=animal+':'+food+':'+n;if(seenCount.has(key))continue;seenCount.add(key);made++;
  const counts=shuffle([n,...pickOther([1,2,3,4,5,6].filter(x=>Math.abs(x-n)<=2),2,[n])]);
  const word=W.numberWords[n],what=n===1?`one ${food}`:`${word} ${W.plural[food]}`;
  Q.push({skill:'quantities',skillLabel:'How many?',activity:'feed',key:'feed-count:'+key,
  instruction:{en:`Give the ${animal} ${what}.`,ps:ps('feed-count')},say:`Give the ${animal} ${what}.`,prompt:{animals:[{id:animal,picture:photo(animal)}]},
  options:counts.map(c=>({id:'n-'+c,group:{picture:photo(food),count:c},label:c===1?`one ${food}`:`${W.numberWords[c]} ${W.plural[food]}`})),answer:[{food:'n-'+n,animal}],
  hint:`Count each plate: one, two, three… Find ${word}.`,feedback:`${cap(word)} ${n===1?food:W.plural[food]} for the ${animal}!`,gloss:gloss([animal,food,word]),practiced:'counting food for animals',instructionCount:1});}
 W.animalActions.forEach(([animal,action])=>{const others=pickOther(W.actions,2,[action]);
  Q.push({skill:'actions',skillLabel:'Action words',activity:'choice',key:'action:'+animal+':'+action,
  instruction:{en:`The ${animal} wants to ${action}. Find “${action}”.`,ps:ps('action')},say:`The ${animal} wants to ${action}. Find ${action}.`,prompt:{picture:photo(animal),word:animal},
  options:shuffle([action,...others]).map(w=>pictureOption(w)),answer:'w-'+action,
  hint:`Act it out: ${action}!`,feedback:`${cap(action)}! The ${animal} can ${action}.`,gloss:gloss([animal,action,...others]),practiced:'action words',instructionCount:1});});
 const whoEats=Object.entries(A).flatMap(([a,{serve}])=>serve.map(f=>[f,a]));
 const seenWho=new Set();
 for(const [food,animal] of shuffle(whoEats)){if(Q.filter(q=>q.skill==='which-animal').length>=20)break;if(seenWho.has(food))continue;
  const others=shuffle(Object.keys(A).filter(a=>a!==animal&&!A[a].eats.includes(food))).slice(0,2);if(others.length<2)continue;seenWho.add(food);
  const things=W.plural[food]||food;
  Q.push({skill:'which-animal',skillLabel:'Who eats what?',activity:'feed-to',key:'who-eats:'+food+':'+animal,
  instruction:{en:`Who likes ${things}? Give the ${food} to that animal.`,ps:ps('who-eats')},say:`Who likes ${things}? Give the ${food} to that animal.`,prompt:{food:{id:food,picture:photo(food),label:food}},
  options:shuffle([animal,...others]).map(w=>pictureOption(w)),answer:'w-'+animal,
  hint:`Think: which animal eats ${things}? The others do not.`,feedback:`The ${animal} eats ${things}.`,gloss:gloss([food,animal,...others]),practiced:'which animals eat which food'});}
 for(const [food,animal] of shuffle(whoEats)){if(Q.filter(q=>q.skill==='which-animal').length>=20)break;const key='who-eats:'+food+':'+animal;if(Q.some(q=>q.key===key))continue;
  const others=shuffle(Object.keys(A).filter(a=>a!==animal&&!A[a].eats.includes(food))).slice(0,2);if(others.length<2)continue;const things=W.plural[food]||food;
  Q.push({skill:'which-animal',skillLabel:'Who eats what?',activity:'feed-to',key,instruction:{en:`Who likes ${things}? Give the ${food} to that animal.`,ps:ps('who-eats')},say:`Who likes ${things}? Give the ${food} to that animal.`,prompt:{food:{id:food,picture:photo(food),label:food}},
  options:shuffle([animal,...others]).map(w=>pictureOption(w)),answer:'w-'+animal,hint:`Think: which animal eats ${things}? The others do not.`,feedback:`The ${animal} eats ${things}.`,gloss:gloss([food,animal,...others]),practiced:'which animals eat which food'});}
 const pairs=Object.entries(A).flatMap(([a,{serve}])=>serve.map(f=>[a,f]));const seenTwo=new Set();
 for(let i=0;Q.filter(q=>q.skill==='two-steps').length<20&&i<500;i++){const [a1,f1]=pairs[(i*5)%pairs.length],[a2,f2]=pairs[(i*11+3)%pairs.length];
  if(a1===a2||f1===f2||A[a1].eats.includes(f2)||A[a2].eats.includes(f1))continue;const key=[a1,f1,a2,f2].join(':');if(seenTwo.has(key))continue;seenTwo.add(key);
  const others=shuffle(W.foods.filter(f=>![...A[a1].eats,...A[a2].eats].includes(f)&&f!==f1&&f!==f2)).slice(0,2);
  const text=`First give the ${a1} ${W.article[f1]||'a'} ${f1}. Then give the ${a2} ${W.article[f2]||'a'} ${f2}.`;
  Q.push({skill:'two-steps',skillLabel:'Two-step instructions',activity:'feed',key:'two-step:'+key,
  instruction:{en:text,ps:ps('two-step')},say:text,prompt:{animals:[{id:a1,picture:photo(a1)},{id:a2,picture:photo(a2)}]},
  options:shuffle([f1,f2,...others]).map(w=>pictureOption(w)),answer:[{food:'w-'+f1,animal:a1},{food:'w-'+f2,animal:a2}],
  hint:`Do one part at a time. First: the ${a1} and the ${f1}.`,feedback:`The ${a1} got the ${f1}, then the ${a2} got the ${f2}.`,gloss:gloss([a1,f1,a2,f2]),practiced:'two-step English instructions',instructionCount:2});}
 // Order for learning: names first, then instructions, colours, counting, actions, who-eats, two steps.
 const order=['food-words','animal-words','follow-instructions','colors','quantities','actions','which-animal','two-steps'];
 return order.flatMap(s=>Q.filter(q=>q.skill===s));
}

// ---------- 4. Number Adventure ----------
function numberAdventure(){
 rand=rng(404);const Q=[];const N=W.numberWords;
 const pl={fish:'fish',bus:'buses',sock:'socks',butterfly:'butterflies',strawberry:'strawberries',mango:'mangoes',leaf:'leaves',...Object.fromEntries(W.countObjects.filter(o=>!['fish','bus','sock','butterfly','mango','leaf'].includes(o)).map(o=>[o,o+'s']))};
 const art3=new Set(['star','ball','apple','flower','balloon']);
 const pic=o=>art3.has(o)?art(o+'-'+({star:'yellow',ball:'blue',apple:'red',flower:'pink',balloon:'orange'}[o])):photo(o);
 const near=(n,lo=1,hi=10)=>shuffle([n-1,n+1,n-2,n+2].filter(x=>x>=lo&&x<=hi)).slice(0,2);
 const numOpts=(n,lo,hi)=>shuffle([n,...near(n,lo,hi)]).map(x=>textOption(String(x)));
 let k=0;const obj=()=>W.countObjects[(k++)%W.countObjects.length];
 for(let i=0;i<30;i++){const n=Math.floor(i/3)+1,o=obj();
  Q.push({skill:'counting',skillLabel:'Counting',activity:'choice',key:'count:'+o+':'+n,instruction:{en:`How many ${n===1?o:pl[o]}? Count them.`,ps:ps('count')},say:`How many ${pl[o]}? Count them.`,
  prompt:{group:{picture:pic(o),count:n}},options:numOpts(n,1,10),answer:'t-'+n,hint:'Touch each one as you count: one, two, three…',feedback:`There ${n===1?'is':'are'} ${N[n]} ${n===1?o:pl[o]}. ${cap(N[n])}!`,gloss:gloss([o,N[n]]),practiced:'counting objects'});}
 for(let i=0;i<25;i++){const n=Math.floor(i*10/25)+1,o=obj();const counts=shuffle([n,...near(n)]);
  Q.push({skill:'match-quantity',skillLabel:'Numbers and groups',activity:'choice',key:'match-qty:'+o+':'+n,instruction:{en:`Find the group with ${N[n]} ${n===1?o:pl[o]}.`,ps:ps('match-quantity')},say:`Find the group with ${N[n]} ${n===1?o:pl[o]}.`,
  prompt:{big:String(n),word:N[n]},options:counts.map(c=>({id:'n-'+c,group:{picture:pic(o),count:c},label:`${N[c]} ${c===1?o:pl[o]}`})),answer:'n-'+n,
  hint:`Count each group. Find ${N[n]}: ${n}.`,feedback:`This group has ${N[n]}: ${n}.`,gloss:gloss([o,N[n]]),practiced:'matching numbers to groups'});}
 for(let n=1;n<=20;n++){const opts=shuffle([n,...(n>10?[n-10,n===20?19:n+1]:[n+10,n===1?2:n-1])]);
  Q.push({skill:'number-names',skillLabel:'Number names',activity:'choice',key:'word-num:'+n,instruction:{en:`Find the number ${N[n]}.`,ps:ps('number-word')},say:`Find the number ${N[n]}.`,prompt:{word:N[n]},
  options:opts.map(x=>textOption(String(x))),answer:'t-'+n,hint:n>10&&n<20?`${cap(N[n])} is ten and ${N[n-10]}: 1 and ${n-10}.`:`Listen again: ${N[n]}.`,feedback:`${n} is “${N[n]}”.`,gloss:gloss([N[n]]),practiced:'number names'});}
 const wordConfuse=n=>[n<10?N[n+10]:N[n-10],N[n===20?19:n+1],N[n-1]||N[n+2]].filter(Boolean);
 for(let n=1;n<=20;n++){const others=shuffle([...new Set(wordConfuse(n))].filter(w=>w!==N[n])).slice(0,2);
  Q.push({skill:'number-names',skillLabel:'Number names',activity:'choice',key:'num-word:'+n,instruction:{en:`Which word says ${n}?`,ps:ps('number-name')},say:`Which word says ${N[n]}?`,prompt:{big:String(n)},
  options:shuffle([N[n],...others]).map(w=>textOption(w)),answer:'t-'+N[n],hint:`Read each word aloud. Which one is ${n}?`,feedback:`${n} is written “${N[n]}”.`,gloss:gloss([N[n]]),practiced:'reading number words'});}
 const allWords=new Set(N);
 for(let n=1;n<=20;n++){const w=N[n];let pick=null;
  for(const i of shuffle([...[...w].keys()])){const others=shuffle([...'aeioutnrsvhlwfgx'].filter(c=>c!==w[i]&&!allWords.has(w.slice(0,i)+c+w.slice(i+1)))).slice(0,2);if(others.length===2){pick={i,others};break;}}
  const masked=w.slice(0,pick.i)+'_'+w.slice(pick.i+1);
  Q.push({skill:'number-spelling',skillLabel:'Spelling number words',activity:'choice',key:'spell:'+w,instruction:{en:`Fill the gap to spell ${n}: ${masked}`,ps:ps('number-spell')},say:`Spell ${N[n]}. Which letter is missing?`,prompt:{big:masked,sub:String(n)},
  options:shuffle([w[pick.i],...pick.others]).map(c=>textOption(c)),answer:'t-'+w[pick.i],hint:`Say “${w}” slowly and listen for each sound.`,feedback:`${n} is spelled ${[...w].join('-')}: “${w}”.`,gloss:gloss([w]),practiced:'spelling number words'});}
 const compare=(kind,i)=>{const o=obj();let a=(i*3)%9+1,b=(i*5+2)%10+1;if(a===b)b=b===10?1:b+1;
  const word=kind==='more'?'more':'fewer',right=kind==='more'?(a>b?'L':'R'):(a<b?'L':'R');
  Q.push({skill:'compare',skillLabel:'More, fewer, same',activity:'choice',key:`${kind}:${o}:${a}:${b}`,instruction:{en:`Which group has ${word} ${pl[o]}?`,ps:ps(kind)},say:`Which group has ${word} ${pl[o]}?`,prompt:{},
  options:[{id:'L',group:{picture:pic(o),count:a},label:`${N[a]} ${a===1?o:pl[o]}`},{id:'R',group:{picture:pic(o),count:b},label:`${N[b]} ${b===1?o:pl[o]}`}],answer:right,
  hint:`Count both groups. ${kind==='more'?'More means the bigger number.':'Fewer means the smaller number.'}`,feedback:`${cap(N[Math.max(a,b)])} is more than ${N[Math.min(a,b)]}. The group with ${N[kind==='more'?Math.max(a,b):Math.min(a,b)]} has ${word}.`,gloss:gloss([kind==='more'?'more':'fewer',o]),practiced:'more and fewer'});};
 for(let i=0;i<12;i++)compare('more',i);for(let i=0;i<12;i++)compare('fewer',i+12);
 for(let i=0;i<6;i++){const o=obj(),n=i+3,counts=shuffle([n,...near(n)]);
  Q.push({skill:'compare',skillLabel:'More, fewer, same',activity:'choice',key:`equal:${o}:${n}`,instruction:{en:`Which group has the same number of ${pl[o]} as the top group?`,ps:ps('equal')},say:`Which group has the same number of ${pl[o]} as the top group?`,
  prompt:{group:{picture:pic(o),count:n}},options:counts.map(c=>({id:'n-'+c,group:{picture:pic(o),count:c},label:`${N[c]} ${pl[o]}`})),answer:'n-'+n,
  hint:'Count the top group first. Then find a group with the same number.',feedback:`${cap(N[n])} and ${N[n]} are the same. They are equal.`,gloss:gloss(['same',o]),practiced:'finding equal groups'});}
 const seqs=[];for(let s=1;s<=10;s++)seqs.push({kind:'gap',run:[s,s+1,s+2,s+3],gap:(s%3)+1});
 for(const s of [4,9,12,15,17])seqs.push({kind:'next',run:[s,s+1,s+2,s+3],gap:3});
 for(const s of [10,8,14,20,6])seqs.push({kind:'back',run:[s,s-1,s-2,s-3],gap:3});
 for(const s of [2,4,6,10,12])seqs.push({kind:'twos',run:[s,s+2,s+4,s+6],gap:3});
 seqs.forEach(({kind,run,gap})=>{const t=run[gap],step=run[1]-run[0];const opts=shuffle([t,...[...new Set([t+step,t+1,t-1,t+2,t-2,t+3])].filter(x=>x>=0&&x<=24&&x!==t&&!run.includes(x)).slice(0,2)]);
  const shown=run.map((x,j)=>j===gap?'_':x).join(', ');
  Q.push({skill:'sequences',skillLabel:'Number patterns',activity:'choice',key:`seq:${kind}:${run.join('-')}`,instruction:{en:`Which number is missing? ${shown}`,ps:ps('number-sequence')},say:`Which number is missing? ${run.map((x,j)=>j===gap?'blank':N[x]||x).join(', ')}.`,
  prompt:{sequence:run.map((x,j)=>j===gap?null:String(x))},options:opts.map(x=>textOption(String(x))),answer:'t-'+t,
  hint:kind==='back'?'These numbers count backwards, one less each time.':kind==='twos'?'These numbers jump by two: skip one number each time.':'Count up: one more each time.',feedback:`${run.join(', ')}. The missing number is ${t}.`,gloss:gloss([N[t]]),practiced:'number patterns'});});
 const sums=[];for(let a=1;a<=9;a++)for(let b=1;a+b<=10;b++)sums.push([a,b]);
 shuffle(sums).slice(0,30).sort((x,y)=>(x[0]+x[1])-(y[0]+y[1])).forEach(([a,b])=>{const o=obj(),t=a+b;
  Q.push({skill:'addition',skillLabel:'Adding',activity:'choice',key:`add:${a}+${b}`,instruction:{en:`${cap(N[a])} ${a===1?o:pl[o]} and ${N[b]} more. How many altogether?`,ps:ps('add')},say:`${N[a]} ${a===1?o:pl[o]} and ${N[b]} more. How many altogether?`,
  prompt:{groups:[{picture:pic(o),count:a},{picture:pic(o),count:b}]},options:numOpts(t,1,12),answer:'t-'+t,hint:`Start at ${a} and count on ${b} more.`,feedback:`${a} and ${b} make ${t}: ${N[a]} plus ${N[b]} is ${N[t]}.`,gloss:gloss([o,N[t]]),practiced:'adding small numbers'});});
 return Q;
}

// ---------- 5. Help Fox Find the Apple ----------
function foxGame(){
 rand=rng(505);const Q=[];
 const confusable=[['orange','lemon','peach','mango'],['pen','pencil'],['watch','clock'],['shoes','socks'],['apple','cherry','peach'],['box','bag']];
 const clash=(a,b)=>confusable.some(g=>g.includes(a)&&g.includes(b));
 const sceneOf={tree:'garden',chair:'kitchen',table:'kitchen',bed:'bedroom',box:'bedroom',house:'street',car:'street',basket:'picnic'};
 const pos={tree:['under','beside','behind'],chair:['on','under','beside','behind'],table:['on','under','beside'],bed:['on','under','beside'],box:['in','on','beside','behind'],house:['behind','beside','in front of'],car:['beside','behind','in front of']};
 const conflict={in:'behind',behind:'in'};
 const posHint={under:'Under means below it.',beside:'Beside means next to it.',behind:'Behind means at the back of it. You can only see part of it.',on:'On means on top of it.',in:'In means inside it.','in front of':'In front of means at the front, nearer to you.'};
 const otherPositions=(lm,p,n)=>shuffle(pos[lm].filter(x=>x!==p&&conflict[p]!==x)).slice(0,n);
 const scene=(item,color,lm,p,size)=>({item:art(item+'-'+color),itemWord:item,landmark:art(lm),landmarkWord:lm,position:p,...(size?{size}:{})});
 const sentence=(item,lm,p,color)=>`The ${color?color+' ':''}${item} is ${p} the ${lm}.`;
 const items=['apple','ball','cup','star','flower','balloon'],itemColor={apple:'red',ball:'blue',cup:'green',star:'yellow',flower:'pink',balloon:'orange'};
 W.foxObjects.forEach(o=>{const others=shuffle(W.foxObjects.filter(x=>x!==o&&!clash(x,o))).slice(0,2);
  Q.push({skill:'objects',skillLabel:'Fruits and things',activity:'choice',scene:'garden',key:'object:'+o,instruction:{en:`Fox needs the ${o}. Find the ${o}.`,ps:ps('find-object',o)},say:`Fox needs the ${o}. Find the ${o}.`,prompt:{word:o},
  options:shuffle([o,...others]).map(w=>pictureOption(w)),answer:'w-'+o,hint:`Listen again: ${o}. Look at each picture.`,feedback:`You found the ${o} for Fox!`,gloss:gloss([o,...others]),practiced:'names of fruits and things'});});
 const palettes={ball:['red','blue','green','yellow','purple','orange'],balloon:['red','blue','green','yellow','pink','orange'],flower:['red','yellow','pink','purple','blue','white'],cup:['red','blue','green','yellow'],apple:['red','green','yellow']};
 const colorCombos=Object.entries(palettes).flatMap(([it,cs])=>cs.map(c=>[it,c]));
 shuffle(colorCombos).slice(0,25).forEach(([it,c])=>{const others=pickOther(palettes[it],2,[c]);
  Q.push({skill:'colors',skillLabel:'Colours',activity:'choice',scene:'garden',key:'color:'+it+':'+c,instruction:{en:`Find the ${c} ${it}.`,ps:ps('find-color')},say:`Find the ${c} ${it}.`,prompt:{},
  options:shuffle([c,...others]).map(x=>({id:'c-'+x,picture:art(it+'-'+x),label:`${x} ${it}`})),answer:'c-'+c,hint:`Look for the colour ${c}.`,feedback:`Yes, the ${c} ${it}!`,gloss:gloss([c==='orange'?'orange (colour)':c,it]),practiced:'colour words'});});
 const sizeItems=['apple','ball','cup','star','flower','balloon','book','hat','key','kite'];
 sizeItems.forEach((it,i)=>['big','small'].forEach(sz=>{const other=sizeItems[(i+3)%sizeItems.length],opp=sz==='big'?'small':'big';
  const ref=x=>items.includes(x)?art(x+'-'+itemColor[x]):photo(x);
  const opts=shuffle([{id:sz+'-'+it,picture:ref(it),size:sz,label:`${sz} ${it}`},{id:opp+'-'+it,picture:ref(it),size:opp,label:`${opp} ${it}`},{id:sz+'-'+other,picture:ref(other),size:sz,label:`${sz} ${other}`}]);
  Q.push({skill:'describing',skillLabel:'Big and small',activity:'choice',scene:'garden',key:'size:'+it+':'+sz,instruction:{en:`Find the ${sz} ${it}.`,ps:ps('size')},say:`Find the ${sz} ${it}.`,prompt:{},
  options:opts,answer:sz+'-'+it,hint:`First find the ${it}s. Then look for the ${sz} one.`,feedback:`This is the ${sz} ${it}.`,gloss:gloss([sz,it]),practiced:'describing words: big and small'});}));
 const combos=shuffle(items.flatMap(it=>Object.entries(pos).flatMap(([lm,ps])=>ps.map(p=>[it,lm,p]))));
 let ci=0;const nextCombo=()=>combos[(ci++)%combos.length];
 for(let i=0;i<50;i++){const [it,lm,p]=nextCombo(),c=itemColor[it];
  Q.push({skill:'positions',skillLabel:'Where is it?',activity:'choice',scene:sceneOf[lm],key:`pos:${it}:${lm}:${p}`,instruction:{en:`Find the ${it} ${p} the ${lm}.`,ps:{text:`${templates.position} (${p} the ${lm})`,status:'check',tpl:'position',x:'',suffix:` (${p} the ${lm})`}},say:`Find the ${it} ${p} the ${lm}.`,prompt:{},
  options:shuffle([p,...otherPositions(lm,p,2)]).map(x=>({id:'s-'+x,scene:scene(it,c,lm,x),label:sentence(it,lm,x)})),answer:'s-'+p,hint:posHint[p],feedback:sentence(it,lm,p),gloss:gloss([it,p,lm]),practiced:'position words',instructionCount:1});}
 const colored=shuffle(Object.entries(palettes).filter(([it])=>items.includes(it)).flatMap(([it,cs])=>cs.flatMap(c=>Object.entries(pos).flatMap(([lm,ps])=>ps.map(p=>[it,c,lm,p])))));
 colored.slice(0,35).forEach(([it,c,lm,p])=>{const c2=pickOther(palettes[it],1,[c])[0],p2=otherPositions(lm,p,1)[0];
  Q.push({skill:'color-position',skillLabel:'Colour and place',activity:'choice',scene:sceneOf[lm],key:`colpos:${it}:${c}:${lm}:${p}`,instruction:{en:`Find the ${c} ${it} ${p} the ${lm}.`,ps:ps('color-position')},say:`Find the ${c} ${it} ${p} the ${lm}.`,prompt:{},
  options:shuffle([{id:'s-a',scene:scene(it,c,lm,p),label:sentence(it,lm,p,c)},{id:'s-b',scene:scene(it,c2,lm,p),label:sentence(it,lm,p,c2)},{id:'s-c',scene:scene(it,c,lm,p2),label:sentence(it,lm,p2,c)}]),answer:'s-a',
  hint:`Two clues: the colour ${c} and the place “${p}”. ${posHint[p]}`,feedback:sentence(it,lm,p,c),gloss:gloss([c==='orange'?'orange (colour)':c,it,p,lm]),practiced:'colour and position together',instructionCount:2});});
 for(let i=0;i<25;i++){const [it,lm,p]=nextCombo(),c=itemColor[it],p2=otherPositions(lm,p,1)[0],it2=items[(items.indexOf(it)+2)%items.length];
  Q.push({skill:'sentences',skillLabel:'Short sentences',activity:'choice',scene:sceneOf[lm],key:`true:${it}:${lm}:${p}`,instruction:{en:'Look at the picture. Which sentence is true?',ps:ps('true-sentence')},say:'Look at the picture. Which sentence is true?',
  prompt:{scene:scene(it,c,lm,p)},options:shuffle([sentence(it,lm,p),sentence(it,lm,p2),sentence(it2,lm,p)]).map((s,j)=>({id:'t'+j,text:s,sentence:true})).map(o=>({...o,id:'t-'+o.text.replace(/\W+/g,'_')})),answer:'t-'+sentence(it,lm,p).replace(/\W+/g,'_'),
  hint:`Check two things: what is it, and where is it? ${posHint[p]}`,feedback:sentence(it,lm,p),gloss:gloss([it,p,lm]),practiced:'reading short sentences'});}
 for(let i=0;i<15;i++){const [it,lm,p]=nextCombo(),c=itemColor[it],s=sentence(it,lm,p),words=s.split(' ');
  Q.push({skill:'sentences',skillLabel:'Short sentences',activity:'order',scene:sceneOf[lm],key:`build:${it}:${lm}:${p}`,instruction:{en:'Put the words in order to tell Fox where it is.',ps:ps('build-sentence')},say:'Put the words in order to tell Fox where it is.',
  prompt:{scene:scene(it,c,lm,p)},options:shuffle(words.map((w,j)=>({id:'w'+j,text:w}))),answer:words,hint:`Start with “The”. Then say what it is: ${it}.`,feedback:s,gloss:gloss([it,p,lm]),practiced:'building short sentences'});}
 return Q;
}

// ---------- assemble ----------
const games=[
 {id:'letter-hunt',prefix:'LH',title:'Letter Hunt',build:letterHunt,classes:[[1,12,1],[13,20,2]]},
 {id:'sound-safari',prefix:'SS',title:'Sound Safari',build:soundSafari,classes:[[1,10,1],[11,20,2]]},
 {id:'feed-animal',prefix:'FA',title:'Feed the Animal',build:feedAnimal,classes:[[1,8,1],[9,16,2],[17,20,3]]},
 {id:'number-adventure',prefix:'NA',title:'Number Adventure',build:numberAdventure,classes:[[1,10,1],[11,20,2]]},
 {id:'fox-apple',prefix:'FX',title:'Help Fox Find the Apple',build:foxGame,classes:[[1,8,2],[9,16,3],[17,20,4]]}
];
fs.mkdirSync(out,{recursive:true});
const index={version:1,levels:LEVELS,perLevel:PER_LEVEL,roundSize:5,games:{}};
for(const g of games){
 const list=g.build();
 if(list.length!==PER_GAME)throw Error(`${g.id}: ${list.length} questions, expected ${PER_GAME}`);
 const questions=list.map((q,i)=>{const level=Math.floor(i/PER_LEVEL)+1,n=i%PER_LEVEL;const cls=g.classes.find(([a,b])=>level>=a&&level<=b)[2];
  const {tpl,x,suffix,...psLine}=q.instruction.ps;
  const ur={text:urduGameTemplates[tpl].replace('{x}',x)+(suffix||''),status:'check'};
  return {id:`${g.prefix}-${String(level).padStart(2,'0')}-${String(n+1).padStart(2,'0')}`,game:g.id,class:cls,level,round:n<5?1:2,...q,instruction:{...q.instruction,ps:psLine,ur}};});
 const levels=Array.from({length:LEVELS},(_,i)=>{const qs=questions.filter(q=>q.level===i+1),labels=[...new Set(qs.map(q=>q.skillLabel))];
  return {level:i+1,class:qs[0].class,title:labels.join(' · '),skills:[...new Set(qs.map(q=>q.skill))],questions:qs.length};});
 fs.writeFileSync(path.join(out,g.id+'.json'),JSON.stringify({game:g.id,title:g.title,levels,questions},null,0)+'\n');
 index.games[g.id]={title:g.title,questions:questions.length,levels:levels.map(({level,class:c,title,questions:n})=>({level,class:c,title,questions:n}))};
 console.log(`${g.id}: ${questions.length} questions in ${LEVELS} levels`);
}
fs.writeFileSync(path.join(out,'index.json'),JSON.stringify(index,null,1)+'\n');
