import {wordPhoto} from '../wordPhotos.js';
import course from './course.json' with {type:'json'};
import uiContent from './uiContent.json' with {type:'json'};
export {course};
export const words=Object.fromEntries(course.words.map(w=>[w.id,w]));
export const gpcs=Object.fromEntries(course.gpcs.map(g=>[g.id,g]));
export const recordings=Object.fromEntries([...course.audio,...uiContent.audio].map(a=>[a.id,a]));
const pictures={apple:'🍎',apples:'🍎',ball:'⚽',book:'📕',sun:'☀️',cat:'🐈',dog:'🐕',mat:'🧺',map:'🗺️',tap:'🚰',pat:'🖐️',sat:'🧎',sit:'🧎',pin:'📌',tin:'🥫',pan:'🍳',pot:'🍲',pet:'🐈',bag:'🎒',jam:'🍯',log:'🪵',leg:'🦵',hen:'🐔',pen:'🖊️',cup:'☕',bed:'🛏️',red:'🔴',van:'🚐',web:'🕸️',ship:'🚢',shop:'🏪',fish:'🐟',dish:'🍽️',chip:'🍟',chin:'🙂',sock:'🧦',duck:'🦆',neck:'🧣',back:'🧍',ring:'💍',king:'👑',wing:'🪽',bell:'🔔',seed:'🌱',feet:'🦶',sheep:'🐑',moon:'🌙',food:'🍱',roof:'🏠',book:'📕',cook:'🧑‍🍳',foot:'🦶',rain:'🌧️',tail:'🐈',mail:'✉️',nail:'🔩',boat:'⛵',goat:'🐐',road:'🛣️',coat:'🧥',car:'🚗',farm:'🏡',arm:'💪',park:'🌳',milk:'🥛',hand:'🖐️',hands:'🖐️',lamp:'💡',nest:'🪺',frog:'🐸',flag:'🚩',cake:'🍰',game:'🎲',bike:'🚲',kite:'🪁',bread:'🍞',water:'💧',school:'🏫',rice:'🍚',mum:'👩',dad:'👨',happy:'😊',sad:'😢',box:'📦',desk:'🪑',ali:'🧒',ayesha:'👧',queen:'👑',egg:'🥚',insect:'🐞',umbrella:'☂️',jug:'🫗',orange:'🍊',yoghurt:'🥣',zip:'🤐'};
pictures.hat='🧢';
// A word has a picture when there is a photo or a drawing for it (wordPhotos.js); the emoji above only name it.
export const pictureFor=text=>{const key=String(text).toLowerCase();return wordPhoto(key)?pictures[key]||key:null;};
export const photoFor=text=>wordPhoto(text)?.src;
// Look-alike letters, used as wrong answers before any other letters (never shapes).
const lookAlike={s:'zc',a:'od',t:'fl',p:'qb',i:'lj',n:'mh',m:'nw',d:'bp',g:'qj',o:'ac',c:'oe',k:'hx',e:'co',u:'nv',r:'nh',h:'nb',b:'dp',f:'tl',l:'it',j:'ig',v:'wy',w:'vm',x:'ky',y:'vj',z:'sx',q:'pg'};
const lookAlikeCapital={S:'ZC',A:'HV',T:'FI',P:'RB',I:'LT',N:'MH',M:'NW',D:'BO',G:'CO',O:'QC',C:'OG',K:'XR',E:'FB',U:'VJ',R:'PB',H:'NA',B:'DP',F:'ET',L:'IJ',J:'IU',V:'WU',W:'VM',X:'KY',Y:'VX',Z:'SN',Q:'OG'};
export const similarLetters=c=>[...(lookAlike[c]||lookAlikeCapital[c]||'')];
// Each letter's picture words (from its letter lesson), for picture games and their wrong answers.
export const letterPictures=Object.fromEntries(course.lessons.filter(l=>l.content.letters.length&&l.content.pictureWordIds).map(l=>[l.content.newGpcIds[0],l.content.pictureWordIds]));
export function seeded(seed){let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.charCodeAt(0),16777619);return()=>{n=(Math.imul(n,1664525)+1013904223)|0;return(n>>>0)/4294967296;};}
export function shuffled(values,seed){const out=[...values],random=seeded(seed);for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
const unique=a=>[...new Set(a)];
// A lesson's place in the course by id (compileLesson receives a copy, so indexOf would not find it).
const lessonIndex=l=>course.lessons.findIndex(x=>x.id===l.id);
const textFor=id=>words[id]?.text||id;
// A word may be printed once it is listed in a lesson so far, or all of its sounds have been taught.
function readable(l,id){const at=lessonIndex(l),w=words[id],seen=x=>{const i=course.lessons.findIndex(y=>y.id===x);return i>=0&&i<=at;};return !!w&&(seen(w.introducedAt)&&w.category!=='oral_picture'||w.category==='decodable'&&w.segments.every(s=>seen(gpcs[s]?.introducedAt)));}
export function tokensFor(answer){return Array.isArray(answer)?answer:String(answer).includes(' ')?String(answer).match(/[A-Za-z]+|[.,?!"]/g)||[]:[...String(answer)];}
const englishClip=text=>course.audio.find(a=>a.language==='en-GB'&&a.text===text&&a.kind==='speech')?.id;
function base(l,a,n,mode,answer,cue={}){return {id:`${a.id}-task-${n}`,activityId:a.id,activityType:a.type,mode,answer,cue,instructionPs:a.instruction.ps,instructionEn:a.instruction.enEditorialGloss,instructionAudio:a.instruction.psAudioId,stage:a.type==='IndependentCheck'?'check':a.type==='Celebration'?'celebration':'practice',constructed:mode==='build',domain:'meaning'};}
// Listening tasks never use a letter that sounds the same or nearly the same as the answer (s/z/c, b/p, m/n …).
// Wrong answers are taught letters first (most recent first), then untaught letters with a clearly different sound.
// They are only shown: their names and sounds are never played.
const nearSounds=[['s','z','c','x'],['c','k','qu','x','g'],['b','p'],['d','t'],['f','v'],['v','w'],['m','n'],['i','e','a'],['o','u','a'],['j','g'],['y','i','j']];
const confusable=(a,b)=>a===b||nearSounds.some(set=>set.includes(a)&&set.includes(b));
const distinctOrder='m t o b l f a d h r n p s u e i g k j w v y z c x qu'.split(' ');
const toGpc=c=>c==='q'?'qu':c;
function soundFoils(l,c){const g=toGpc(c),at=lessonIndex(l);
 const taught=Object.values(gpcs).filter(x=>distinctOrder.includes(x.id)&&course.lessons.findIndex(y=>y.id===x.introducedAt)<=at).sort((x,y)=>course.lessons.findIndex(z=>z.id===y.introducedAt)-course.lessons.findIndex(z=>z.id===x.introducedAt)).map(x=>x.id);
 return unique([...taught,...distinctOrder]).filter(x=>!confusable(g,x));}
function letterTask(l,a,n,c,kind='find'){
 const previous=course.alphabet.filter(x=>course.lessons.findIndex(y=>y.id===x.picture.firstOralLesson)<=lessonIndex(l)).map(x=>x.lower);
 const letter=c.toLowerCase(),gpc=gpcs[letter==='q'?'qu':letter],target=kind==='sound'&&letter==='q'?'qu':kind==='case'?letter:letter.toUpperCase();
 const shape=x=>kind==='case'?x:x.toUpperCase(),distractors=kind==='sound'?soundFoils(l,letter).slice(0,2).map(x=>shape(x==='qu'?'q':x)).filter(x=>x!==target):unique([...similarLetters(letter).map(shape),...previous.filter(x=>x!==letter).map(shape).reverse()]).filter(x=>x!==target).slice(0,3);
 return {...base(l,a,n,'choice',target,{text:kind==='find'?target:kind==='case'?letter.toUpperCase():'',audioId:kind==='name'?course.alphabet.find(x=>x.lower===letter).letterNameAudioId:kind==='sound'?gpc.recordingId:null,requiresDelivery:kind==='name'||kind==='sound',parentText:kind==='sound'?`${gpc.spelling}: ${gpc.ipa}`:letter.toUpperCase()}),options:[target,...distractors].map(text=>({id:text,text})),domain:kind==='name'?'letter_name':kind==='sound'?'letter_sound':'letter_form'};
}
function wordBuild(l,a,n,id){const w=words[id]||{text:id};return {wordId:id,...base(l,a,n,'build',w.text,{text:'',audioId:w.audioId||englishClip(w.text),audioText:w.text,requiresDelivery:true,parentText:w.text,picture:pictureFor(id),pictureWord:pictureFor(id)?id:null}),tokens:w.segments&&!w.segments.some(s=>s.includes('_'))?w.segments.map(s=>gpcs[s]?.spelling||s):tokensFor(w.text),domain:'spelling'};}
function sentenceBuild(l,a,n,text){const autoPunctuation=l.level===4&&Number(l.id.slice(3))<5;const tokens=tokensFor(text).filter(t=>!['"',','].includes(t)&&(!autoPunctuation||t!=='.'));return {...base(l,a,n,'build',tokens,{text:'',sceneText:text}),tokens,autoPunctuation:autoPunctuation?'.':null,domain:'sentence'};}
function conventions(l,a,q,i){const sets=[['This is a cat.','this is a cat.','this is a Cat.'],['I like apples.','I likeapples.','Ilike apples.'],['This is a cat.','This is a cat','This is a cat..']];if(i===3){const t=sentenceBuild(l,a,i,'This is a cat.');t.id=q.id;t.pool=[...t.tokens,'this'];return t;}const options=sets[i%3];return {...base(l,a,i,'choice',options[0],{text:''}),id:q.id,options:options.map(text=>({id:text,text,noAudio:true})),domain:'sentence_conventions'};}
// Words the child can already read by this lesson (used as wrong answers and extra tiles).
function candidates(l,target){const index=lessonIndex(l);return course.words.filter(w=>course.lessons.findIndex(x=>x.id===w.introducedAt)<=index&&w.id!==String(target).toLowerCase()&&readable(l,w.id)).map(w=>w.id);}
// Closest words first (same length, same letters in the same places): cat → mat, hat before sun.
const likeness=(a,b)=>(a.length===b.length?2:0)+[...a].filter((c,i)=>b[i]===c).length;
function wordChoice(l,a,n,id){const answer=textFor(id);
return {wordId:id,...wordChoiceTask(l,a,n,id,answer)};}
function wordChoiceTask(l,a,n,id,answer){const options=unique([id,...candidates(l,id).filter(w=>Math.abs(w.length-id.length)<2).sort((x,y)=>likeness(y,id)-likeness(x,id))]).slice(0,3);return {...base(l,a,n,'choice',answer,{audioId:words[id]?.audioId,audioText:answer,requiresDelivery:true,parentText:answer}),options:options.map(w=>({id:textFor(w),text:textFor(w)})),domain:'reading'};}
function pictureChoice(l,a,n,id,bySound=false){const letter=toGpc(l.content.newGpcIds[0]||l.content.reviewOf[0]),seen=new Set();
 // Picture sound games: wrong pictures start with a clearly different sound (no sock/zip/zebra).
 const others=bySound?soundFoils(l,letter).flatMap(g=>letterPictures[g]||[]):[...l.content.wordIds,...candidates(l,id)];
 const pool=[id,...others].filter(w=>{if(!pictureFor(w)||seen.has(w))return false;seen.add(w);return true;}).slice(0,3),options=pool.map(w=>({id:w,text:'',picture:pictureFor(w),pictureWord:w,audioText:w,audioId:englishClip(w)}));return {...base(l,a,n,'choice',id,bySound?{audioId:gpcs[letter]?.recordingId,requiresDelivery:true,parentText:gpcs[letter]?.ipa}:{text:textFor(id)}),options,preClips:bySound?options.map(o=>o.audioId).filter(Boolean):[],domain:bySound?'letter_sound':'meaning'};}
function checkTask(l,a,q,i){
 if(l.assessmentKind==='sentence_conventions')return conventions(l,a,q,i);
 let task;const target=l.content.letters[1]||q.target||l.content.wordIds[i%Math.max(1,l.content.wordIds.length)]||l.content.trickyWordIds[0];
 if(['NameToLetter','LetterRecognition','CaseMatch','SoundToLetter','SoundMatch'].includes(q.type)){task=letterTask(l,a,i,target||String(q.answer).toLowerCase(),q.type==='NameToLetter'?'name':['SoundToLetter','SoundMatch'].includes(q.type)?'sound':q.type==='CaseMatch'?'case':'find');}
 else if(q.type==='ConstructCasePair'){task={...base(l,a,i,'build',q.answer,{text:'',parentText:'Match the upper- and lowercase letter.'}),tokens:q.answer,domain:'letter_form'};}
 else if(q.type==='SoundPicture'){task=pictureChoice(l,a,i,q.answer,true);}
 else if(['BuildFromAudio','IndependentBuild'].includes(q.type)){task=wordBuild(l,a,i,target||q.answer);}
 else if(['SentenceOrder','SentenceBuild'].includes(q.type)){task=sentenceBuild(l,a,i,Array.isArray(q.answer)?q.answer.join(' '):q.answer);}
 else if(q.type==='StorySequence'){task={...base(l,a,i,'build',q.answer,{text:''}),tokens:q.answer,sequence:true};}
 else if(q.type==='LiteralMeaning'){
  const alternatives=unique([q.answer,...l.content.story.questions.map(x=>x.answer),...(l.content.story.sentences||[])]).slice(0,3);
  // The question is asked in English (text and audio); its Pashto is an optional help.
  task={...base(l,a,i,'choice',q.answer,{text:'',questionEn:q.question||q.questionEditorialOnly,questionPs:q.psQuestion,questionPsAudioId:q.psAudioId,audioId:q.questionAudioId||null}),options:alternatives.map(text=>({id:text,text}))};
 }else if(q.type==='MeaningChoice'&&l.content.sentences.length){const sentence=String(q.answer),foils=unique([sentence,...l.content.sentences]).slice(0,3);task={...base(l,a,i,'choice',sentence,{text:'',sceneText:sentence}),options:foils.map(text=>({id:text,text}))};if(foils.length<2)task=sentenceBuild(l,a,i,sentence);}
 else task=wordChoice(l,a,i,target||q.answer);
 task.id=q.id;task.stage='check';task.domain=q.domain||task.domain;return task;
}
export function compileLesson(l){
 const tasks=[];const entries=unique([...l.content.wordIds,...l.content.trickyWordIds]);
 for(const a of l.activities){
  let block=[];
  switch(a.type){
   case 'CharacterExample':case 'GuidedListen':case 'TrickyWordMap':block=[{...base(l,a,0,a.type==='GuidedListen'?'vocab':'observe',null),model:true,letters:l.content.letters,newGpcs:l.content.newGpcIds,words:entries,requiredClips:a.type==='GuidedListen'?entries.map(id=>words[id].audioId):[],sentences:l.content.sentences,oralPicture:l.content.letters.length?course.alphabet.find(x=>x.lower===l.content.letters[1]).picture:null,reviewLetters:l.content.reviewOf}];if(a.type==='GuidedListen'&&!entries.length)block[0].mode='observe';break;
   case 'LetterTap':{const letters=l.content.letters.length?[l.content.letters[1]]:l.content.reviewOf;block=letters.slice(0,3).map((c,i)=>({...base(l,a,i,'listen',null),letter:c,requiredClips:[course.alphabet.find(x=>x.lower===c).letterNameAudioId,gpcs[c==='q'?'qu':c].recordingId]}));break;}
   case 'MatchPairs':{const pair=l.content.letters.length?l.content.letters:[l.content.reviewOf[0]?.toUpperCase(),l.content.reviewOf[0]];block=[{...base(l,a,0,'build',pair,{text:''}),tokens:pair,domain:'letter_form'}];break;}
   case 'FindLetter':{const c=l.content.letters[1]||l.content.reviewOf[0];block=[letterTask(l,a,0,c,'find'),letterTask(l,a,1,c,'case')];break;}
   case 'TraceLetter':block=[{...base(l,a,0,'trace',null),letter:l.content.letters[1]||l.content.reviewOf[0]}];break;
   case 'InitialSoundPicture':{const letter=l.content.letters[1],id=a.content?.cue?.text||course.alphabet.find(x=>x.lower===letter).picture.text;block=[pictureChoice(l,a,0,id,true)];break;}
   case 'SoundMatch':block=(a.content?.letters||l.content.reviewOf).slice(-3).slice(0,2).map((c,i)=>letterTask(l,a,i,c,'sound'));break;
   // Picture words for a letter: picture, English audio, Pashto meaning; the word is printed only once it is decodable.
   case 'PictureWords':block=[{...base(l,a,0,'vocab',null),cards:a.content.wordIds.map(id=>({id,audioId:words[id].audioId,ps:words[id].psMeaning||'',label:readable(l,id)?words[id].text:null})),requiredClips:a.content.wordIds.map(id=>words[id].audioId)}];break;
   // One say-it step per word (initial clusters list several: stop, spot, spin ...).
   case 'SayIt':block=(a.content.wordIds||[a.content.wordId]).map((id,i)=>{const w=words[id];return {...base(l,a,i,'observe',null),wordId:w.id,audioId:w.audioId,ps:w.psMeaning||'',noVowelBefore:!!a.content.noVowelBefore};});break;
   // English is read left to right: shown once, early in Level 1.
   case 'ReadingDirection':block=[{...base(l,a,0,'observe',null),pictures:a.content.pictures}];break;
   case 'Chant':block=[{...base(l,a,0,'observe',null),chant:a.content.text,audioId:a.content.audioId,actionEn:a.content.actionEn,actionPs:a.content.actionPs}];break;
   // Hear one word of a sound pair (pan / pen) and choose it.
   case 'SoundContrast':block=a.content.pairs.slice(0,3).map((pair,i)=>{const answer=pair[i%2];return {...base(l,a,i,'choice',answer,{audioId:words[answer].audioId,audioText:answer,requiresDelivery:true,parentText:answer}),options:pair.map(w=>({id:w,text:w})),domain:'reading'};});break;
   // Every word is blended in practice before any check uses it.
   case 'BlendWord':{block=(a.content.wordIds||entries).map((id,i)=>({...base(l,a,i,'blend',null),wordId:id,requiredClips:(words[id]?.segments||[]).map(s=>gpcs[s].recordingId),graphemes:words[id]?.segments?.map(s=>gpcs[s].spelling)||[...textFor(id)]}));break;}
   case 'TileBuilder':case 'IndependentBuild':block=(entries.length?entries:['cat']).slice(0,2).map((id,i)=>wordBuild(l,a,i,id));break;
   case 'MissingLetter':block=entries.slice(0,2).map((id,i)=>{const w=words[id],parts=w.segments?.filter(s=>!s.includes('_')).map(s=>gpcs[s].spelling)||[...w.text],answer=parts[0];return {...base(l,a,i,'choice',answer,{text:'',mask:['_',...parts.slice(1)].join(''),audioId:w.audioId,audioText:w.text,requiresDelivery:true,parentText:w.text}),options:unique([answer,'s','a','t']).slice(0,3).map(text=>({id:text,text}))};});break;
   case 'SentenceOrder':case 'SentenceBuild':block=(l.content.sentences.length?l.content.sentences:l.content.story?.sentences||[]).slice(0,2).map((s,i)=>sentenceBuild(l,a,i,s));break;
   case 'WordPictureMatch':case 'PictureSentenceMatch':{const id=entries.find(w=>pictureFor(w));block=id?[pictureChoice(l,a,0,id)]:l.content.sentences.length?[sentenceBuild(l,a,0,l.content.sentences[0])]:[wordChoice(l,a,0,entries[0])];
    // No picture to match: the instruction must fit what the child actually does.
    if(!id){const other=course.lessons.flatMap(x=>x.activities).find(x=>x.type===(l.content.sentences.length?'SentenceBuild':'SoundContrast')).instruction;for(const t of block)Object.assign(t,{instructionPs:other.ps,instructionEn:other.enEditorialGloss,instructionAudio:other.psAudioId});}break;}
   case 'ChangeOneLetter':block=a.content.chain.slice(1).map((id,i)=>({...wordBuild(l,a,i,id),previousWord:a.content.chain[i]}));break;
   case 'ReadAlong':block=[{...base(l,a,0,'read',null),sentences:l.content.story?.sentences||l.content.sentences}];break;
   case 'StorySequence':{const lines=(l.content.story?.sentences||[]).slice(0,3);block=[{...base(l,a,0,'build',lines,{text:''}),tokens:lines,sequence:true}];break;}
   case 'ConversationFill':{const lines=l.content.dialogue[0]||l.content.sentences;block=[{...base(l,a,0,'choice',lines[1],{text:lines[0]}),options:unique([lines[1],...course.lessons.filter(x=>course.lessons.indexOf(x)<=lessonIndex(l)).flatMap(x=>x.content.sentences)]).filter(Boolean).slice(0,3).map(text=>({id:text,text}))}];break;}
   case 'IndependentCheck':block=l.assessment.items.map((q,i)=>checkTask(l,a,q,i));break;
   case 'Celebration':block=[{...base(l,a,0,'celebrate',null),achievement:l.achievement,enTarget:l.content.letters[0]||l.content.sentences[0]||l.content.story?.sentences[0]||textFor(entries[0]||'')}];break;
   default:throw Error('Unsupported course activity '+a.type);
  }
  for(const task of block){task.hintPs=task.domain==='spelling'?'لفظ بیا واورئ. د هر اواز لپاره سم ټکی غوره کړئ.':task.domain?.startsWith('letter')?'د ټکي شکل او اواز بیا وګورئ.':task.domain==='sentence'||task.domain==='sentence_conventions'?'د جملې اول، د لفظونو ترمنځ ځایونه او د اخر ټکی وګورئ.':'تصویر او د قیصې خبره بیا په یاد کړئ.';task.hintAudioId=Object.values(recordings).find(a=>a.language==='ps-PK'&&a.text===task.hintPs)?.id;if(task.model&&l.assessmentKind==='sentence_conventions')task.conventions=true;if(task.mode==='build'&&!task.pool){const foils=l.level===1?(task.tokens.length===2?similarLetters(task.tokens[1]).slice(0,2):['○','△']):task.sequence?[]:task.tokens.some(s=>s.length>2||/[.,?!]/.test(s))?candidates(l,'').slice(0,2).map(textFor):['s','a','n'];task.pool=[...task.tokens,...foils.filter(s=>!task.tokens.includes(s)).slice(0,2)];}}
  tasks.push(...block);
 }
 const invalid=tasks.filter(t=>t.mode==='build'&&(!t.tokens?.length)||t.mode==='choice'&&(!t.options?.length||!t.options.some(o=>o.id===t.answer))||t.answer===undefined);
 if(invalid.length)throw Error(`Invalid task configuration in ${l.id}: ${invalid.map(t=>t.id).join(', ')}`);
 return {...l,assessment:{...l.assessment,requiredCorrectDomains:l.level===1&&!l.content.letters.length?['letter_sound']:l.assessment.requiredCorrectDomains||[]},tasks,checkStart:tasks.findIndex(t=>t.stage==='check')};
}
export const lessons=course.lessons.map(l=>compileLesson({...l,assessmentKind:uiContent.assessmentKinds[l.id]||null}));
export function taskOptions(task,seed){return shuffled(task.options||[],seed+task.id);}
export function taskTiles(task,seed){return shuffled((task.pool||task.tokens||[]).map((text,i)=>({id:String(i),text})),seed+task.id);}
export function sameAnswer(task,value){if(task.mode==='build'){const expected=task.sequence?task.tokens:task.tokens;return Array.isArray(value)&&value.length===expected.length&&value.every((v,i)=>v===expected[i]);}return value===task.answer;}
