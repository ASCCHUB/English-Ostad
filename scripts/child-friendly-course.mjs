// Child-friendly course wording (approved 2026-10-27). Safe to run again.
//  • Every activity instruction the child sees says plainly what to do ("Which picture starts with sss?"),
//    not editor wording ("Choose a picture for the modeled sound"). Pashto stays the same where it already
//    says the right thing; new or corrected Pashto is marked psStatus:'check'.
//  • L1-01 gets a "English reads left to right" step.
//  • Review lessons get a Pashto name (titlePs) for the lesson map.
// New Pashto is listed in docs/beginner-course-phase1/pashto-check-wording.md.
// Usage: node scripts/child-friendly-course.mjs   then   node scripts/extend-audio-manifest.mjs && npm run first-steps:build
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),cUrl=new URL('docs/beginner-course-phase1/curriculum.json',root),mUrl=new URL('docs/beginner-course-phase1/audio-manifest.json',root);
const course=JSON.parse(await readFile(cUrl,'utf8')),manifest=JSON.parse(await readFile(mUrl,'utf8'));
const review=()=>({status:'pending_review',english:{reviewer:null,signedAt:null},pashto:{reviewer:null,signedAt:null},phonics:{reviewer:null,signedAt:null}});
const hash=s=>createHash('sha1').update(s).digest('hex').slice(0,12);
function clip(text,language='ps-PK'){
 let r=manifest.recordings.find(x=>x.language===language&&x.kind==='speech'&&x.text===text);
 if(!r){r={id:`${language}-${hash('speech:'+text)}`,language,text,kind:'speech',recordingNotes:language==='ps-PK'?'Lower Dir Pashto, polite plural; calm, slow and warm.':'Read naturally, as a short phrase, not word by word.',file:null,alignmentFile:null,recordingStatus:'pending_recording',review:review()};manifest.recordings.push(r);}
 return r.id;
}
const toCheck=new Map();
// Pashto lines the owner has approved anywhere in the course.
const approvedPs=new Set();JSON.stringify(course,(k,v)=>{if(v&&v.psStatus==='approved'&&typeof v.ps==='string')approvedPs.add(v.ps);return v;});
for(const p of ['وګورئ او غوږ ونیسئ.','کوم تصویر په دې اواز شروع کېږي؟','شاباش!','راځئ، دا ټکي بیا په یاد کړو.','کوم تصویر په اخر کې دا اواز لري؟','لفظ ولولئ. کوم تصویر یې ښيي؟','واورئ. بیا یې پخپله ولولئ.','د قیصې جملې په سم ترتیب کېږدئ.','انګلیزي له کیڼ اړخ نه ښي اړخ ته لوستل کېږي. پښتو له ښي اړخ نه کیڼ اړخ ته لوستل کېږي.','تکرار'])approvedPs.add(p);// approved in review round 3
// ps given → that Pashto (new ones are marked check); ps omitted → keep the activity's current Pashto.
const say=(en,ps,isNew)=>({en,ps,isNew});
const wording={
 CharacterExample:say('Watch and listen.','وګورئ او غوږ ونیسئ.',true),
 GuidedListen:say('Listen to each word.'),
 BlendWord:say('Listen to each sound. Then say them together as one word.'),
 Celebration:say('Well done!','شاباش!',true),
 ChangeOneLetter:say('Change one letter to make a new word.'),
 ConversationFill:say('Listen. Choose the right answer.'),
 FindLetter:say('Find the letter and tap it.'),
 IndependentBuild:say('Listen. Then build the word with letters.'),
 TileBuilder:say('Listen. Then build the word with letters.'),
 IndependentCheck:say('Now try it on your own. Tap Help if you need it.'),
 MissingLetter:say('Which letter is missing? Put it in its place.'),
 WordPictureMatch:say('Read the word. Which picture shows it?','لفظ ولولئ. کوم تصویر یې ښيي؟',true),
 PictureSentenceMatch:say('Read the word. Which picture shows it?','لفظ ولولئ. کوم تصویر یې ښيي؟',true),
 SentenceBuild:say('Put the words in order to make the sentence.'),
 SentenceOrder:say('Put the words in order to make the sentence.'),
 StorySequence:say('Put the story sentences in order.','د قیصې جملې په سم ترتیب کېږدئ.',true),
 TraceLetter:say('Trace the letter with your finger. Or tap the dots in order.'),
 SoundContrast:say('Listen. Which word did you hear?'),
 SoundMatch:say('Listen. Which letter makes this sound?'),
 PictureWords:say('Look, listen and learn the words.'),
 Chant:say('Listen, say it together and do the action.')
};
const reviewIntro=say('Let’s remember these letters.','راځئ، دا ټکي بیا په یاد کړو.',true);
const readAlong={story:say('Listen to the story. Then read it yourself.'),phrase:say('Listen. Then read it yourself.','واورئ. بیا یې پخپله ولولئ.',true)};
const tricky=course.lessons.flatMap(l=>l.activities).find(a=>a.type==='TrickyWordMap'&&a.instruction.ps.startsWith('دا لفظونه وګورئ، واورئ')).instruction;
// Which picture starts with ...? The sound is written the way a child would say it.
const longSounds=new Set(['s','m','n','f','v','z','l','r','sh']);
// c and k make the same sound, so both say k-k-k.
const soundSaid=g=>g==='qu'?'kw':g==='x'?'ks':g==='c'?'k-k-k':longSounds.has(g)?g.repeat(3):`${g}-${g}-${g}`;
function instruction(type,{en,ps,isNew},old,where){
 const next={...old,enEditorialGloss:en};
 if(ps!==undefined&&ps!==old?.ps){next.ps=ps;next.psAudioId=clip(ps);}
 // A line the owner already approved stays approved (rerunning never downgrades it).
 if(isNew&&ps!==undefined&&approvedPs.has(ps))next.psStatus='approved';
 if(isNew&&ps!==undefined&&!approvedPs.has(ps)){next.psStatus='check';toCheck.set(ps,{where,en:where==='Picture sound game'&&!en.includes('ks')?'Which picture starts with this sound? (the English shows the sound, e.g. sss, t-t-t)':en,ps});}
 return next;
}
for(const l of course.lessons)for(const a of l.activities){
 if(!a.instruction)continue;
 const isReview=/-R\d/.test(l.id);
 if(a.type==='TrickyWordMap'){a.instruction=tricky;continue;}
 if(a.type==='InitialSoundPicture'){
  const g=l.content.newGpcIds[0],x=g==='x';
  a.instruction=instruction(a.type,x?say('Which picture has ks at the end?','کوم تصویر په اخر کې دا اواز لري؟',true):say(`Which picture starts with ${soundSaid(g)}?`,'کوم تصویر په دې اواز شروع کېږي؟',true),a.instruction,'Picture sound game');
  continue;
 }
 if(a.type==='ReadAlong'){a.instruction=instruction(a.type,l.content.story?readAlong.story:readAlong.phrase,a.instruction,'Read along');continue;}
 // C and K: a short note that two letters can make the same sound.
 if(a.type==='CharacterExample'&&['c','k'].includes(l.content.newGpcIds[0])){a.instruction=instruction(a.type,say('Watch and listen. C and K make the same sound: k-k-k.','وګورئ او غوږ ونیسئ. دوه ټکي یو شان اواز کولی شي: C او K دواړه k-k-k وايي.',true),a.instruction,'C and K lessons');continue;}
 if(a.type==='CharacterExample'&&isReview&&l.level===1){a.instruction=instruction(a.type,reviewIntro,a.instruction,'Review lesson start');continue;}
 if(wording[a.type])a.instruction=instruction(a.type,wording[a.type],a.instruction,`${a.type} step`);
}
// Every lesson word is blended in practice before a check uses it.
for(const l of course.lessons)for(const a of l.activities)if(a.type==='BlendWord'){const all=l.content.wordIds.filter(id=>course.lexicon.find(w=>w.id===id)?.segments);if(all.length)a.content.wordIds=all;}
// Level 1: practise building the big and small letter (S s) before the check asks for it.
const pairIns=say('Put the big letter and the small letter together.','لوی ټکی د هغه له وړوکي ټکي سره یو ځای کړئ.',true);
for(const l of course.lessons.filter(x=>x.level===1)){
 const existing=l.activities.find(a=>a.type==='MatchPairs');
 if(existing){existing.instruction=instruction('MatchPairs',pairIns,existing.instruction,'Build the big and small letter');continue;}
 const step={id:l.id+'-pair',type:'MatchPairs',instruction:instruction('MatchPairs',pairIns,{},'Build the big and small letter'),content:{},englishAudioIds:[],review:review()};
 l.activities.splice(l.activities.findIndex(a=>a.type==='IndependentCheck'),0,step);
}
// English reads left to right: an early step in the first lesson.
const first=course.lessons.find(l=>l.id==='L1-01');
// Only one reading-direction step (an earlier run added it twice).
first.activities=first.activities.filter((a,i,all)=>a.type!=='ReadingDirection'||all.findIndex(b=>b.type==='ReadingDirection')===i);
const direction=first.activities.find(a=>a.type==='ReadingDirection');
if(direction){if(approvedPs.has(direction.instruction.ps))direction.instruction.psStatus='approved';else toCheck.set(direction.instruction.ps,{where:'L1-01 reading direction',en:direction.instruction.enEditorialGloss,ps:direction.instruction.ps});}
else{
 const ps='انګلیزي له کیڼ اړخ نه ښي اړخ ته لوستل کېږي. پښتو له ښي اړخ نه کیڼ اړخ ته لوستل کېږي.';
 toCheck.set(ps,{where:'L1-01 reading direction',en:'English is read from left to right. Pashto is read from right to left.',ps});
 const step={id:'L1-01-direction',type:'ReadingDirection',instruction:{enEditorialGloss:'English is read from left to right. Pashto is read from right to left.',ps,psAudioId:clip(ps),psStatus:'check',review:review()},content:{pictures:['sun','apple','ball']},englishAudioIds:[],review:review()};
 first.activities.splice(first.activities.findIndex(a=>a.type==='CharacterExample')+1,0,step);
}
// Pashto names for review lessons on the lesson map.
for(const l of course.lessons)if(/-R\d/.test(l.id)){
 const letters=l.level===1?l.content.reviewOf.join(', '):'';
 l.titlePs=letters?`تکرار: ${letters}`:'تکرار';
 if(!approvedPs.has('تکرار'))toCheck.set('تکرار',{where:'Review lesson name on the lesson map',en:'Review',ps:'تکرار'});
}
// Lesson length: 8–10 activities per lesson. The closing celebration is not counted, and a check (five questions)
// is one activity. Level 1 letter lessons move "Say it" to the reviews; short lessons get a fitting extra step.
const {wordPhoto}=await import(new URL('src/ustad/wordPhotos.js',root));
const insOf=type=>course.lessons.flatMap(x=>x.activities).find(a=>a.type===type&&a.instruction)?.instruction;
const lexiconById=new Map(course.lexicon.map(w=>[w.id,w]));
const countSteps=l=>l.activities.filter(a=>a.type!=='Celebration').length;
const has=(l,type)=>l.activities.some(a=>a.type===type);
const beforeCheck=(l,step)=>l.activities.splice(l.activities.findIndex(a=>a.type==='IndependentCheck'),0,{...step,englishAudioIds:[],review:review()});
const sayStep=(l,wordId)=>({id:`${l.id}-say`,type:'SayIt',instruction:insOf('SayIt'),content:{wordId,recordingOptional:true,neverScored:true}});
// A word to say aloud: one with a picture and a recording, from the lesson's words or sentences.
const sayWord=l=>[...l.content.wordIds,...[...l.content.sentences,...(l.content.story?.sentences||[])].flatMap(s=>(s.match(/[A-Za-z]+/g)||[]).map(t=>t.toLowerCase()))].find(id=>lexiconById.get(id)?.audioId&&wordPhoto(id));
for(const l of course.lessons){
 const letterLesson=l.level===1&&l.content.letters.length>0;
 if(letterLesson)l.activities=l.activities.filter(a=>a.type!=='SayIt');
 if(l.level===1&&!letterLesson&&!has(l,'SayIt')&&l.content.pictureWordIds?.[0])beforeCheck(l,sayStep(l,l.content.pictureWordIds[0]));
 // The tricky-word lessons read their new words straight away, in tiny phrases of words already taught.
 const firstPhrases={'L2-06':['a cat','a mat','I sat'],'L2-07':['the cat','the mat','the cat sat']}[l.id];
 if(firstPhrases&&!l.content.sentences.length){l.content.sentences=firstPhrases;for(const p of firstPhrases)clip(p,'en-GB');}
 const reading=l.content.sentences.length>0||!!l.content.story,decodable=l.content.wordIds.filter(id=>lexiconById.get(id)?.segments);
 const extras=[
  ()=>reading&&!has(l,'ReadAlong')&&{id:`${l.id}-read`,type:'ReadAlong',instruction:insOf('ReadAlong'),content:{sentences:l.content.sentences}},
  ()=>reading&&!has(l,'SentenceBuild')&&{id:`${l.id}-build`,type:'SentenceBuild',instruction:insOf('SentenceBuild'),content:{sentences:l.content.sentences}},
  ()=>decodable.length&&!has(l,'MissingLetter')&&{id:`${l.id}-missing`,type:'MissingLetter',instruction:insOf('MissingLetter'),content:{wordIds:decodable}},
  ()=>!has(l,'SayIt')&&sayWord(l)&&sayStep(l,sayWord(l)),
  ()=>l.id==='L2-06'&&!has(l,'SoundContrast')&&{id:`${l.id}-contrast`,type:'SoundContrast',instruction:insOf('SoundContrast'),content:{pairs:[['i','a'],['a','i']]}}
 ];
 for(const extra of extras){if(countSteps(l)>=8)break;const step=extra();if(step)beforeCheck(l,step);}
}
// Every step in a lesson needs its own id: progress is saved by step and task id. A duplicate gets the next free
// number; a check step keeps its id (so lessons a child has already passed stay passed).
for(const l of course.lessons){
 const used=new Set(l.activities.map(a=>a.id)),seen=new Set();let next=l.activities.length+1;
 const fresh=()=>{while(used.has(`${l.id}-a${next}`))next++;const id=`${l.id}-a${next}`;used.add(id);return id;};
 for(const a of l.activities){
  if(!seen.has(a.id)){seen.add(a.id);continue;}
  const other=l.activities.find(b=>b.id===a.id&&b!==a);
  if(a.type==='IndependentCheck'&&other.type!=='IndependentCheck')other.id=fresh();else a.id=fresh();
 }
}
manifest.recordingCount=manifest.recordings.length;
await writeFile(cUrl,JSON.stringify(course,null,2)+'\n');await writeFile(mUrl,JSON.stringify(manifest,null,2)+'\n');
const md=['# New Pashto for review — child-friendly wording','','Every line below is new or corrected and is marked `check`.','','| Where | English | Pashto (check) |','|---|---|---|',...[...toCheck.values()].map(x=>`| ${x.where} | ${x.en} | ${x.ps} |`),''];
await writeFile(new URL('docs/beginner-course-phase1/pashto-check-wording.md',root),md.join('\n'));
console.log(`Instructions updated. Pashto to check: ${toCheck.size}.`);
