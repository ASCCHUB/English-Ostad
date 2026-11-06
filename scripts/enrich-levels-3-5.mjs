// Levels 3–5 enrichment approved 2026-10-27 (with the owner's changes):
//  Level 3: 5–8 words per pattern, picture words, tiny decodable phrases, sound-pair listening, a review after
//           every unit, ck before th (so th can use thick), a new o_e lesson, and a "no vowel before it"
//           say-it step for initial clusters.
//  Level 4: more sentences per lesson, a tricky-word step wherever exception words are first taught, question
//           words (what, who, where, do, does), two reviews.
//  Level 5: longer stories, two new stories and a final review. Story questions are asked in English (text and
//           audio, taught words only); Pashto is an optional help button.
//  Accent: rhotic r throughout (car, farm, park).
// All new Pashto is marked psStatus:'check' and listed in docs/beginner-course-phase1/pashto-check-levels-3-5.md.
// Usage: node scripts/enrich-levels-3-5.mjs   (refuses to run twice)   then
//        node scripts/extend-audio-manifest.mjs && npm run first-steps:build
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),cUrl=new URL('docs/beginner-course-phase1/curriculum.json',root),mUrl=new URL('docs/beginner-course-phase1/audio-manifest.json',root);
const course=JSON.parse(await readFile(cUrl,'utf8')),manifest=JSON.parse(await readFile(mUrl,'utf8'));
const MARK='2026-10-27-levels-3-5';
if(course.enrichmentLevels3to5?.id===MARK){console.log('Already applied.');process.exit(0);}
const review=()=>({status:'pending_review',english:{reviewer:null,signedAt:null},pashto:{reviewer:null,signedAt:null},phonics:{reviewer:null,signedAt:null}});
const hash=s=>createHash('sha1').update(s).digest('hex').slice(0,12);
const copy=o=>JSON.parse(JSON.stringify(o));
// An audio entry for a text (reused when the same text and kind already exist).
function clip(text,{language='en-GB',kind='speech',notes=''}={}){
 let r=manifest.recordings.find(x=>x.language===language&&x.kind===kind&&x.text===text);
 if(!r){r={id:`${language}-${hash(kind+':'+text)}`,language,text,kind,recordingNotes:notes||(language==='ps-PK'?'Lower Dir Pashto, polite plural; calm, slow and warm.':'Clear, warm, unhurried.'),file:null,alignmentFile:null,recordingStatus:'pending_recording',review:review()};manifest.recordings.push(r);}
 return r.id;
}
// Every new Pashto line is recorded here for the owner's review.
const toCheck=[];
const checkPs=(where,en,ps)=>{toCheck.push({where,en,ps});return ps;};
const instruction=(en,ps,where)=>({enEditorialGloss:en,ps:checkPs(where,en,ps),psAudioId:clip(ps,{language:'ps-PK'}),psStatus:'check',review:review()});
const lexicon=new Map(course.lexicon.map(w=>[w.id,w])),gpcs=new Map(course.graphemePhonemeCorrespondences.map(g=>[g.id,g]));
const lessonsById=new Map(course.lessons.map(l=>[l.id,l]));
const anyIns=type=>course.lessons.flatMap(l=>l.activities).find(a=>a.type===type)?.instruction;
// ---------- Accent: rhotic r ----------
const ar=gpcs.get('ar');Object.assign(ar,{ipa:'/ɑːr/',notes:'Rhotic model: the r is sounded (car, farm, park).'});
const arClip=manifest.recordings.find(r=>r.id===ar.recordingId);Object.assign(arClip,{text:'/ɑːr/',recordingNotes:'Rhotic model: ar with the r sounded, as in car, farm, park.'});
course.audioDesign.englishAccent='One consistent rhotic accent: r after a vowel is always sounded (car, farm, park, water, here, are). bath is read with short a, like cat. Accept intelligible regional variants from children.';
const accentNotes={'a is /ɔː/ and final er is weak /ə/ in the chosen British model.':'a is /ɔː/ and final er is a weak vowel with the r sounded (rhotic).','ere represents /ɪə/ in the selected non-rhotic model; explicitly introduce this familiar reply.':'ere is said like ear, with the r sounded (rhotic); explicitly introduce this familiar reply.','are represents /ɑː/ in the model.':'are is said like ar in car, with the r sounded.'};
// ---------- Words ----------
const voicedTh=new Set(['this','that','then','them','with','feather','mother']),shortOo=new Set(['book','look','cook','foot','hook','wood','good']);
const digraphs=['sh','ch','th','ck','ng','ff','ll','ss','zz','pp','tt','ee','oo','ai','oa','ar','qu'];
function plainSegments(w,word){
 const out=[];let tail=null,le=false;
 const split=w.match(/^(.*)([aio])([^aeiou])e$/);
 if(split&&!/[^aeiou]le$/.test(w)){w=split[1];tail=[`${split[2]}_e`,split[3]];}
 else if(/[^aeiou]le$/.test(w)){w=w.slice(0,-2);le=true;}
 for(let i=0;i<w.length;){const d=digraphs.find(d=>w.startsWith(d,i));const g=d||w[i];i+=g.length;out.push(g==='th'&&voicedTh.has(word)?'th-voiced':g==='oo'?(shortOo.has(word)?'oo-short':'oo-long'):g);}
 if(tail)out.push(tail[0],tail[1]);if(le)out.push('le');
 return out.every(s=>gpcs.has(s))?out:null;
}
function segmentsFor(w){
 let m;if((m=w.match(/^(.+?)es$/))&&/(x|sh|ch|ss|s)$/.test(m[1])){const s=plainSegments(m[1],m[1]);if(s)return [...s,'plural-es'];}
 const plain=plainSegments(w,w);if(plain)return plain;
 if(w.endsWith('s')){const s=plainSegments(w.slice(0,-1),w.slice(0,-1));if(s)return [...s,'plural-s'];}
 return null;
}
// Pashto meanings: the app's word list where it has one, otherwise a new draft (marked check).
const appWords=Object.fromEntries((await import(new URL('src/ustad/content.js',root))).words.map(w=>[w.en.toLowerCase(),w.ps]));
const newMeanings={shed:'کوټګۍ',wish:'ارمان',shoe:'بوټ',shell:'سیپۍ',brush:'برش',chat:'خبرې کول',rich:'مالدار',much:'ډېر',cheese:'پنیر',chick:'چرګوړی',thumb:'غټه ګوته',cloth:'ټوکر',bath:'د غسل ټب',rock:'ګټ',lock:'قلف',truck:'ټرک',chicken:'چرګ',song:'سندره',swing:'ټال',hill:'غونډۍ',doll:'ګوډۍ',teeth:'غاښونه',zoo:'د ځناورو باغ',boot:'موزه',balloon:'غباره',wood:'لرګي',good:'ښه',snail:'حلزون',paint:'رنګ',toast:'ټوسټ',jar:'مرتبان',tent:'خېمه',drum:'ډول',crab:'چنګاښ',plum:'الوچه',gate:'دروازه',plate:'پلېټ',slide:'د ښوېدو لوبه',smile:'موسکا',home:'کور',bone:'هډوکی',rope:'رسۍ',rose:'ګلاب',stone:'کاڼی',bottle:'بوتل',kettle:'چاینکه',coat:'کوټ',moth:'د شپې پتنګ',ship:'جهاز',dish:'لوښی',chip:'چپس',chin:'زنه',back:'شا',wing:'وزر',bell:'زنګ',seed:'تخم',feet:'پښې',food:'خوراک',roof:'چت',cook:'پخلی کوونکی',tail:'لکۍ',mail:'لیک',nail:'مېخ',park:'باغ',flag:'جنډه',game:'لوبه',bike:'بایسکل',sail:'بادبان',feather:'بڼکه',kick:'لغته',hook:'کونډه',toad:'چونګښه',shark:'شارک (لوی سمندري کب)',spot:'داغ',spin:'تاوېدل',tape:'ټیپ',name:'نوم',cups:'پیالې',hens:'چرګې',ducks:'هیلۍ',kites:'پتنګونه',foxes:'ګیدړې',dishes:'لوښي',buses:'بسونه',boxes:'بکسونه',cats:'پیشوګانې',dogs:'سپي',pens:'قلمونه',bags:'بستې',little:'وړوکی',thick:'پنډ',thin:'نری',with:'سره',long:'اوږد',mess:'ګډوډي',buzz:'بنګېدل',puff:'پوکی',see:'لیدل',soon:'ژر',look:'کتل',wait:'انتظار کول',stop:'ودرېدل',like:'خوښول',that:'هغه',this:'دا',then:'بیا',them:'هغوی',shop:'دوکان',candle:'شمع',three:'درې',tree:'ونه',bee:'مچۍ',star:'ستوری',sheep:'مېږه',goat:'وزه',farm:'پټی',road:'سړک',ring:'ګوته',king:'باچا',neck:'غاړه',desk:'مېز',gift:'تحفه'};
function addMeaning(w){if(w.psMeaning)return;if(appWords[w.id]){w.psMeaning=appWords[w.id];w.psMeaningSource='app_vocabulary';}else if(newMeanings[w.id]){w.psMeaning=checkPs(`Picture/word meaning: ${w.id}`,w.id,newMeanings[w.id]);w.psMeaningSource='new';w.psStatus='check';}}
// A word read in a lesson must be decodable (or already an exception word); picture words are heard only.
function word(id,{oral=false}={}){
 if(!lexicon.has(id))lexicon.set(id,{id,text:id,introducedAt:null,category:'oral_picture',segments:null,notes:'Picture word; heard and seen, not read.',audioId:clip(id),review:review()});
 const w=lexicon.get(id);
 if(!oral&&w.category==='oral_picture'){const segments=segmentsFor(id);if(!segments)throw Error(`${id} is read in a lesson but is not decodable`);Object.assign(w,{category:'decodable',segments,notes:''});}
 addMeaning(w);return id;
}
function exception(id,notes,text=id){
 if(!lexicon.has(id))lexicon.set(id,{id,text,introducedAt:null,category:'common_exception',segments:null,notes,audioId:clip(text),review:review()});
 const w=lexicon.get(id);if(w.category!=='explicit_name')w.category='common_exception';
 if(!course.commonExceptionWords.some(x=>x.wordId===id))course.commonExceptionWords.push({wordId:id,introducedAt:null,exceptionFocus:notes,laterDecodableAt:null});
 return id;
}
const sentenceWords=s=>(s.match(/[A-Za-z]+/g)||[]).map(t=>t.toLowerCase());
const readSentence=s=>{for(const t of sentenceWords(s))if(!lexicon.has(t)||lexicon.get(t).category==='oral_picture')word(t);clip(s,{notes:'Read naturally, as a short phrase or sentence, not word by word.'});return s;};
// ---------- Shared activity pieces ----------
const L3proto=lessonsById.get('L3-16'),L4proto=lessonsById.get('L4-03'),L5proto=lessonsById.get('L5-07');
const keep=(l,type)=>l.activities.find(a=>a.type===type);
const act=(lessonId,list)=>list.filter(Boolean).map((a,i)=>({...a,id:`${lessonId}-a${i+1}`,englishAudioIds:[],review:a.review||review()}));
const I={
 pictures:anyIns('PictureWords'),contrast:anyIns('SoundContrast'),blend:anyIns('BlendWord'),readAlong:anyIns('ReadAlong'),sentence:anyIns('SentenceBuild')||anyIns('SentenceOrder'),
 tricky:instruction('Look at these words, listen and remember them. Some letters here do not make their usual sound.','دا لفظونه وګورئ، واورئ او په یاد یې کړئ. په دې لفظونو کې ځینې ټکي خپل عام اواز نه کوي.','Tricky-word step instruction'),
 cluster:instruction('Say each word aloud. Start straight on the first sound: say stop, not istop.','هر لفظ په لوړ اواز ووایئ. سم د اول اواز نه یې شروع کړئ: stop ووایئ، istop نه.','Initial clusters say-it step')
};
const checkItem=(base,lessonId,i,type,target,answer,constructed=false)=>({...copy(base),id:`${lessonId}-check-${i+1}`,type,target,answer,constructed});
// ---------- Level 3 ----------
const L3=[
 {id:'L3-01',words:'ship shop fish dish shed wish',pics:'shoe sheep shell brush',phrases:['a fish in a dish','the ship is big'],pairs:'sip/ship sin/shin'},
 {id:'L3-02',words:'chip chin chop chat rich much',pics:'chair cheese chick cherry',phrases:['a chip on a dish','a big chip'],pairs:'chip/ship chop/shop'},
 {id:'L3-05',words:'sock duck neck back rock lock kick',pics:'clock truck chicken',phrases:['a duck on a rock','a red sock']},
 {id:'L3-03',words:'thin moth thick bath',pics:'three thumb cloth',phrases:['a thin moth','a cat in the bath']},
 {id:'L3-04',words:'this that then them with',pics:'feather mother',phrases:['this is a moth','that is a ship','a cat with a hat'],pairs:'thin/this'},
 {id:'L3-06',words:'sing ring king wing long song',pics:'swing',phrases:['the king can sing','a long song'],pairs:'win/wing ran/rang thin/thing'},
 {id:'L3-07',words:'off bell miss buzz hill doll mess puff',phrases:['a bell on a doll','a hen on a hill']},
 {id:'L3-R1',title:'Review: consonant spellings',goal:'Read and spell sh, ch, ck, th, ng and double-letter words.',words:'ship chip moth this duck king bell',phrases:['a fish in a dish','the king can sing','a duck on a rock'],pairs:'chip/ship chop/shop thin/this'},
 {id:'L3-08',words:'see bee seed feet sheep teeth',pics:'tree green queen',phrases:['I see a bee','a bee on the sheep'],pairs:'fed/feed met/meet'},
 {id:'L3-09',words:'moon zoo food roof boot soon',pics:'spoon balloon',phrases:['I see the moon','a cat on the roof']},
 {id:'L3-10',words:'book look cook foot hook wood good',phrases:['look at the book','a good cook'],pairs:'food/foot moon/book'},
 {id:'L3-11',words:'rain tail nail sail mail wait',pics:'snail train paint',phrases:['a cat in the rain','a long tail'],pairs:'ran/rain pan/pain'},
 {id:'L3-12',words:'boat goat coat road soap toad',pics:'toast',phrases:['a goat in a boat','a red coat'],pairs:'cot/coat got/goat rod/road'},
 {id:'L3-13',words:'car jar farm arm park shark',pics:'star',phrases:['a car in the park','jam in a jar'],pairs:'cat/cart'},
 {id:'L3-R2',title:'Review: vowel patterns',goal:'Read and spell ee, oo, ai, oa and ar words.',words:'sheep moon book rain boat car',phrases:['I see the moon','a goat in a boat','a cat in the rain'],pairs:'moon/book ran/rain got/goat'},
 {id:'L3-14',words:'milk hand lamp nest tent gift desk',phrases:['a lamp on a desk','milk in a cup','a bed and a lamp']},
 {id:'L3-15',words:'stop frog flag swim drum crab tree plum spot spin star cloth',phrases:['a frog on a log','a crab can swim','a flag on a tree'],sayIt:'stop spot spin star smile'},
 {id:'L3-R3',title:'Review: consonant clusters',goal:'Read and spell words with two consonants together.',words:'hand nest frog drum crab spot',phrases:['a frog on a log','a lamp on a desk','a crab can swim']},
 {id:'L3-16',words:'cake gate snake game name tape plate',phrases:['a cake on a plate','a snake at the gate'],pairs:'cap/cape tap/tape can/cane'},
 {id:'L3-17',words:'like bike kite five nine slide smile',phrases:['a kite in a tree','I like the bike'],pairs:'kit/kite pin/pine bit/bite'},
 {id:'L3-23',title:'Spell: o_e',goal:'Read and spell the o_e word set using its taught sound pattern.',gpc:'o_e',words:'home bone nose rope rose stone',phrases:['a dog with a bone','a red rose'],pairs:'hop/hope not/note'},
 {id:'L3-18',words:'cats dogs pens bags cups hens ducks kites',phrases:['six red hens','ten ducks']},
 {id:'L3-19',words:'boxes buses foxes dishes',phrases:['six foxes','ten red buses']},
 {id:'L3-20',words:'apple little bottle kettle candle',phrases:['a little apple','milk in a bottle']},
 {id:'L3-R4',title:'Review: long vowels and endings',goal:'Read and spell a_e, i_e, o_e, plural and -le words.',words:'cake kite bone cats boxes apple',phrases:['a cake on a plate','six foxes','a dog with a bone'],pairs:'cap/cape kit/kite hop/hope'},
 {id:'L3-21',phrases:['a big ball','bread and milk','water in a cup']},
 {id:'L3-22',phrases:['rice, please','a big school']},
 {id:'L3-R5',title:'Level 3 review',goal:'Read every kind of word and phrase from Level 3.',words:'fish king sheep boat frog cake',phrases:['the king can sing','a goat in a boat','a cake on a plate','bread and milk']}
];
const L3units=[['Consonant spellings',['L3-01','L3-02','L3-05','L3-03','L3-04','L3-06','L3-07','L3-R1']],['Common vowel patterns',['L3-08','L3-09','L3-10','L3-11','L3-12','L3-13','L3-R2']],['Adjacent consonants',['L3-14','L3-15','L3-R3']],['Split digraphs and word endings',['L3-16','L3-17','L3-23','L3-18','L3-19','L3-20','L3-R4']],['Familiar print bridge',['L3-21','L3-22','L3-R5']]];
// o_e: one new sound pattern, the same sound as oa.
if(!gpcs.has('o_e')){const g={id:'o_e',spelling:'o_e',ipa:'/oʊ/',introducedAt:'L3-23',recordingId:gpcs.get('oa').recordingId,notes:'Split digraph: the same sound as oa in boat; e is not sounded separately.'};course.graphemePhonemeCorrespondences.push(g);gpcs.set('o_e',g);}
const split=s=>(s||'').split(' ').filter(Boolean);
function level3Lesson(spec){
 const fresh=!lessonsById.has(spec.id),l=fresh?copy(L3proto):lessonsById.get(spec.id);
 const isTricky=l.content.trickyWordIds.length&&!fresh,isReview=spec.id.includes('-R');
 if(fresh){l.id=spec.id;l.title=spec.title;l.goal=l.objectives[0]=spec.goal;l.review=review();l.content={letters:[],newGpcIds:spec.gpc?[spec.gpc]:[],wordIds:[],trickyWordIds:[],sentences:[],story:null,dialogue:[],reviewOf:[]};}
 const words=isTricky?l.content.wordIds:split(spec.words).map(w=>word(w)),pics=split(spec.pics).map(w=>word(w,{oral:true})),pairs=split(spec.pairs).map(p=>p.split('/').map(w=>word(w))),phrases=spec.phrases.map(readSentence),say=split(spec.sayIt).map(w=>word(w,{oral:true}));
 Object.assign(l.content,{wordIds:words,sentences:phrases,...(pics.length?{pictureWordIds:pics}:{})});
 const entries=[...words,...l.content.trickyWordIds];
 const proto=fresh?L3proto:l;
 const example={...copy(keep(proto,'CharacterExample')),content:{englishText:entries[0],newGpcIds:l.content.newGpcIds,focus:isReview?'Review':null}};
 l.activities=act(l.id,[
  example,
  pics.length&&{type:'PictureWords',instruction:I.pictures,content:{wordIds:pics,printLabelsOnlyWhenDecodable:true}},
  {...copy(keep(proto,'GuidedListen')),content:{...keep(proto,'GuidedListen').content,wordIds:entries,newGpcIds:l.content.newGpcIds,trickyParts:isTricky?keep(proto,'GuidedListen').content.trickyParts:[]}},
  isTricky&&{...copy(keep(proto,'TrickyWordMap')),instruction:I.tricky},
  // Two modelled blends per new spelling pattern (each needs a recorded slow blend before release).
  !isTricky&&!isReview&&{type:'BlendWord',instruction:I.blend,content:{wordIds:words.slice(0,2)}},
  pairs.length&&{type:'SoundContrast',instruction:I.contrast,content:{pairs}},
  say.length&&{type:'SayIt',instruction:I.cluster,content:{wordIds:say,noVowelBefore:true,recordingOptional:true,neverScored:true}},
  !isTricky&&{...copy(keep(L3proto,'TileBuilder')),content:{...keep(L3proto,'TileBuilder').content,wordIds:words}},
  {...copy(keep(proto,'MissingLetter')),content:{...keep(proto,'MissingLetter').content,wordIds:entries}},
  isTricky&&copy(keep(proto,'IndependentBuild')),
  {type:'ReadAlong',instruction:I.readAlong,content:{sentences:phrases}},
  {type:'SentenceBuild',instruction:I.sentence,content:{sentences:phrases}},
  copy(keep(proto,'IndependentCheck')),
  {...copy(keep(proto,'Celebration')),content:{...keep(proto,'Celebration').content,enEditorialGoal:l.goal,englishPracticeTarget:phrases[0]||entries[0]}}]);
 const base=L3proto.assessment.items[0],w=i=>entries[i%entries.length];
 if(!isTricky)l.assessment={...copy(L3proto.assessment),items:[checkItem(base,l.id,0,'ListenAndSelect',w(0),w(0)),checkItem(base,l.id,1,'BuildFromAudio',w(1),w(1),true),checkItem(base,l.id,2,'ListenAndSelect',w(2),w(2)),checkItem(base,l.id,3,'BuildFromAudio',w(3),w(3),true),checkItem(base,l.id,4,'SentenceBuild',phrases[0],phrases[0],true)]};
 l.achievement={...copy(L3proto.achievement),enEditorialGoal:l.goal};
 l.durationMinutes={minimum:8,maximum:10};
 return l;
}
const level3=L3.map(level3Lesson);
// thud is replaced by thick, bath and cloth.
const thud=lexicon.get('thud');if(thud){lexicon.delete('thud');manifest.recordings=manifest.recordings.filter(r=>r.id!==thud.audioId&&!r.text.endsWith('→ thud'));}
// ---------- Level 4 ----------
exception('hello','e is short, ll is double l, final o says its name (like go).');
exception('brother','o says u (as in cup); th is voiced; er is a weak vowel with the r sounded.');
exception('sister','er at the end is a weak vowel with the r sounded.');
exception('me','Final e says its name (like he, we).');
exception('what','wh says w; a says o (as in hot).');
exception('who','wh says h; o says oo (as in moon).');
exception('where','wh says w; ere says air, with the r sounded.');
exception('do','o says oo (as in moon), like to.');
exception('does','oe says u (as in cup); s says z.');
const L4=[
 {id:'L4-01',sentences:['a cat','a red ball','a big dog','a little fish','a green frog']},
 {id:'L4-02',tricky:['ali','ayesha','my','hello'],sentences:['I am Ali.','I am Ayesha.','Hello, I am Ali.','My name is Ayesha.','I am six.']},
 {id:'L4-03',sentences:['This is a cat.','This is a red ball.','That is a big dog.','This is my book.']},
 {id:'L4-04',sentences:['I like apples.','I like rice.','I like milk.','I like cats and dogs.','I like the green kite.']},
 {id:'L4-05',sentences:['This is a cat.','I like apples.','Ali is six.','I like cake.','This is my bag.']},
 {id:'L4-06',tricky:['he','she','happy','brother','sister'],sentences:['This is my mum.','This is my dad.','He is happy.','She is sad.','This is my brother.','This is my sister.']},
 {id:'L4-R1',title:'Review: me and my family',goal:'Read and build sentences about yourself and your family.',sentences:['My name is Ali.','I like apples.','This is my mum.','She is happy.']},
 {id:'L4-07',sentences:['I have a pen.','We go to school.','I have a book and a bag.','We sit on a mat.','I like school.']},
 {id:'L4-08',tricky:['are','you','no'],sentences:['Are you sad?','Yes, I am.','No, I am not.','Are you happy?','Is it a cat?','Yes, it is.','No, it is not.']},
 {id:'L4-11',title:'Ask a question',goal:'Read and answer questions with what, who, where and do.',tricky:['what','who','where','do','does'],sentences:['What is this?','It is a frog.','Who is this?','It is Ali.','Where is the cat?','The cat is on the mat.','What do you like?','I like apples.']},
 {id:'L4-09',tricky:['here','thank','me'],sentences:['Milk, please.','Here you are.','Thank you.','Water, please.','Can I have a pen, please?','Can you help me?']},
 {id:'L4-10',sentences:['Ali said, "I like apples."','Ayesha said, "Thank you."','Mum said, "Here you are."','Dad said, "Hello!"']},
 {id:'L4-R2',title:'Level 4 review',goal:'Read and build every kind of sentence from Level 4.',sentences:['Hello, I am Ayesha.','What is this?','It is a red ball.','Can I have a pen, please?','Thank you.']}
];
// my is now taught with names (My name is ...), before the family lesson.
lessonsById.get('L4-06').content.trickyWordIds=lessonsById.get('L4-06').content.trickyWordIds.filter(w=>w!=='my');
function level4Lesson(spec){
 const fresh=!lessonsById.has(spec.id),l=fresh?copy(L4proto):lessonsById.get(spec.id);
 if(fresh){l.id=spec.id;l.title=spec.title;l.goal=l.objectives[0]=spec.goal;l.review=review();l.content={letters:[],newGpcIds:[],wordIds:[],trickyWordIds:[],sentences:[],story:null,dialogue:[],reviewOf:[]};}
 if(spec.tricky)l.content.trickyWordIds=[...new Set([...l.content.trickyWordIds,...spec.tricky])];
 l.content.sentences=spec.sentences.map(readSentence);
 const tricky=l.content.trickyWordIds,entries=[...l.content.wordIds,...tricky],proto=fresh?L4proto:l;
 const list=proto.activities.filter(a=>a.type!=='TrickyWordMap').map(a=>{const b=copy(a);if(b.content?.sentences)b.content.sentences=l.content.sentences;if(b.content?.wordIds)b.content.wordIds=entries;if(b.type==='CharacterExample')b.content.englishText=l.content.sentences[0];if(b.type==='Celebration')b.content={...b.content,enEditorialGoal:l.goal,englishPracticeTarget:l.content.sentences[0]};return b;});
 if(tricky.length)list.splice(list.findIndex(a=>a.type==='GuidedListen')+1,0,{type:'TrickyWordMap',instruction:I.tricky,content:{wordIds:tricky,sentences:l.content.sentences}});
 l.activities=act(l.id,list);
 if(fresh){const base=L4proto.assessment.items[0],s=l.content.sentences;l.assessment={...copy(L4proto.assessment),items:[0,1,2,3,4].map(i=>checkItem(base,l.id,i,i%2?'SentenceOrder':'MeaningChoice',null,s[i%s.length],i%2===1))};}
 l.durationMinutes={minimum:8,maximum:10};
 return l;
}
const level4=L4.map(level4Lesson);
// ---------- Level 5 ----------
// Questions are asked in English with taught words only; psQuestion is the optional Pashto help.
const Q=(question,answer,ps,newPs)=>({question,answer,ps,newPs});
const L5=[
 {id:'L5-01',add:['Dad is happy.'],questions:[Q('Who can help Dad?','Ali'),Q('What does Dad have?','a bag'),Q('Who has the bag at the end?','Ali')]},
 {id:'L5-02',add:['Ali and Ayesha sit at the desk.'],questions:[Q('What does Ali have?','a pen'),Q('Where is the pen?','on the desk'),Q('Who has a book?','Ayesha')]},
 {id:'L5-03',add:['Ayesha said, "Here you are."'],questions:[Q('Who likes apples?','Ali'),Q('What does Ayesha have?','milk'),Q('What does Ali have?','rice and bread')]},
 {id:'L5-04',questions:[Q('Is Ali happy at the start?','No','علي په شروع کې خوشحاله دی؟',true),Q('Where is the ball?','in the box'),Q('Is Ali happy at the end?','Yes','علي په اخر کې خوشحاله دی؟',true)]},
 {id:'L5-05',add:['Then I go home.'],questions:[Q('What does Ali do at the start?','Ali gets up.','علي په شروع کې څه کوي؟',true),Q('What does Ali wash?','hands'),Q('Ali is at school. Then where does Ali go?','the park','علي په سکول کې دی. بیا چرته ځي؟',true)]},
 {id:'L5-06',questions:[Q('What does Ali get?','a pen','علي ته څه ملاو شو؟',true),Q('Who has the pen at the end?','Ali'),Q('Ali said, "A pen, please." Then Ali said ...?','Thank you.','علي ووېل: «A pen, please.» بیا علي څه ووېل؟',true)]},
 {id:'L5-07',questions:[Q('Where do Ali and Ayesha sit?','on a mat'),Q('Who has apples?','Ayesha'),Q('Where is the red ball?','in a bag')]},
 {id:'L5-08',title:'At the farm',goal:'Read a farm story and say where each animal is.',sentences:['We go to the farm.','I see a goat and a sheep.','The hen is in the shed.','The duck can swim.','Dad has milk.','I like the farm.'],questions:[Q('What does Ali see?','a goat and a sheep','علي څه ویني؟',true),Q('Where is the hen?','in the shed','چرګه چرته ده؟',true),Q('What can the duck do?','swim','هیلۍ څه کولی شي؟',true)]},
 {id:'L5-09',title:'Rain in the park',goal:'Read a weather story and say what each child has.',sentences:['We go to the park.','The sun is hot.','Then it rains.','Ali has a coat.','Ayesha has a hat.','We go home.'],questions:[Q('Where do Ali and Ayesha go?','to the park','علي او عایشه چرته ځي؟',true),Q('What does Ali have?','a coat','د علي سره څه دي؟',true),Q('Who has a hat?','Ayesha','خولۍ د چا سره ده؟',true)]},
 {id:'L5-R1',title:'Final review: Ali helps Dad',goal:'Read a new story on your own, answer questions and build a sentence about it.',sentences:['My name is Ali.','I go to the farm with Dad.','I see a goat and a sheep.','The hen is in the shed.','Dad said, "Can you help me?"','I said, "Yes, I can."','Dad is happy.'],questions:[Q('Who is at the farm with Ali?','Dad','په پټي کې د علي سره څوک دی؟',true),Q('Where is the hen?','in the shed','چرګه چرته ده؟',true),Q('Is Dad happy at the end?','Yes','پلار په اخر کې خوشحاله دی؟',true)]}
];
function level5Lesson(spec){
 const fresh=!lessonsById.has(spec.id),l=fresh?copy(L5proto):lessonsById.get(spec.id);
 if(fresh){l.id=spec.id;l.title=spec.title;l.goal=l.objectives[0]=spec.goal;l.review=review();l.content={letters:[],newGpcIds:[],wordIds:[],trickyWordIds:[],sentences:[],story:{id:`${spec.id}-story`,title:spec.title,sentences:[],questions:[],illustrations:[]},dialogue:[],reviewOf:[]};}
 const story=l.content.story;
 story.sentences=(spec.sentences||[...story.sentences,...(spec.add||[])]).map(readSentence);
 story.illustrations=story.sentences.map((s,i)=>story.illustrations.find(x=>x.brief===s)||{id:`${l.id}-scene-${i+1}`,brief:s,asset:null});
 story.questions=spec.questions.map((q,i)=>{
  const old=story.questions[i],sameQuestion=old&&!q.newPs&&old.answer===q.answer;
  sentenceWords(q.question).forEach(t=>{if(!lexicon.has(t))word(t);});sentenceWords(q.answer).forEach(t=>{if(!lexicon.has(t))word(t);});
  const ps=sameQuestion?old.psQuestion:checkPs(`${l.id} story question`,q.question,q.ps);
  return {questionEditorialOnly:q.question,question:q.question,questionAudioId:clip(q.question,{notes:'A friendly question to a child; clear and slow.'}),answer:q.answer,childQuestionLanguage:'en-GB',psHelpQuestion:true,psQuestion:ps,psAudioId:sameQuestion?old.psAudioId:clip(ps,{language:'ps-PK'}),...(sameQuestion?{}:{psStatus:'check'}),review:sameQuestion&&old.review||review()};
 });
 const proto=fresh?L5proto:l;
 l.activities=act(l.id,proto.activities.map(a=>{const b=copy(a);if(b.type==='ReadAlong')b.content.story=copy(story);if(b.type==='StorySequence')b.content.storyId=story.id;if(b.type==='CharacterExample')b.content.englishText=story.sentences[0];if(b.type==='Celebration')b.content={...b.content,enEditorialGoal:l.goal,englishPracticeTarget:story.sentences[0]};return b;}));
 const base=L5proto.assessment.items[0],last=story.sentences[story.sentences.length-1];
 const questionItem=(q,i)=>({...copy(base),id:`${l.id}-check-${i+1}`,type:'LiteralMeaning',question:q.question,questionAudioId:q.questionAudioId,psQuestion:q.psQuestion,psAudioId:q.psAudioId,answer:q.answer,constructed:false});
 const items=l.assessment.items.filter(x=>x.type!=='LiteralMeaning');
 const build=fresh?{...copy(L5proto.assessment.items.find(x=>x.type==='SentenceBuild')),id:`${l.id}-check-4`,scene:last,answer:last}:items.find(x=>x.type==='SentenceBuild');
 const sequence=fresh?{...copy(L5proto.assessment.items.find(x=>x.type==='StorySequence')),id:`${l.id}-check-5`,answer:story.sentences.slice(0,3)}:items.find(x=>x.type==='StorySequence');
 l.assessment={...l.assessment,items:[...story.questions.map(questionItem),build,sequence]};
 l.durationMinutes={minimum:8,maximum:10};
 return l;
}
const level5=L5.map(level5Lesson);
// ---------- Put it together ----------
const unitize=(level,lessons,units)=>{const byId=new Map(lessons.map(l=>[l.id,l]));course.levels[level-1].units=units.map(([title,ids],i)=>{const id=`L${level}-U${i+1}`;ids.forEach(x=>byId.get(x).unit=id);return {id,title,lessonIds:ids};});return units.flatMap(([,ids])=>ids.map(x=>byId.get(x)));};
const ordered3=unitize(3,level3,L3units);
const ordered4=unitize(4,level4,[['Phrases and introductions',['L4-01','L4-02']],['Identify and express likes',['L4-03','L4-04']],['Sentence conventions and family',['L4-05','L4-06','L4-R1']],['School and questions',['L4-07','L4-08','L4-11']],['Polite requests and speech',['L4-09','L4-10','L4-R2']]]);
const ordered5=unitize(5,level5,[['Family',['L5-01']],['School',['L5-02']],['Food',['L5-03']],['Feelings',['L5-04']],['Daily routines',['L5-05']],['Conversation',['L5-06']],['Cumulative reading',['L5-07']],['Animals and weather',['L5-08','L5-09']],['Final review',['L5-R1']]]);
course.lessons=[...course.lessons.filter(l=>l.level<=2),...ordered3,...ordered4,...ordered5];
for(const level of course.levels)level.objectives=course.lessons.filter(l=>l.level===level.number).map(l=>l.goal);
course.lessons.forEach((l,i)=>{if(l.level>=3)l.prerequisiteLessonIds=[course.lessons[i-1].id];});
// A word is introduced in the first lesson that lists it or reads it (picture-only words: the first lesson that shows them).
const read=l=>[...l.content.sentences,...(l.content.story?.sentences||[]),...(l.content.story?.questions||[]).flatMap(q=>[q.question||'',String(q.answer)]),...l.content.dialogue.flat()].flatMap(sentenceWords).concat(l.activities.flatMap(a=>a.content?.pairs?.flat()||[]));
for(const w of lexicon.values()){
 const first=course.lessons.find(l=>[...l.content.wordIds,...l.content.trickyWordIds].includes(w.id)||w.category==='decodable'&&read(l).includes(w.id))||course.lessons.find(l=>(l.content.pictureWordIds||[]).includes(w.id)||l.activities.some(a=>a.type==='SayIt'&&(a.content.wordIds||[a.content.wordId]).includes(w.id)));
 if(first)w.introducedAt=first.id;if(!w.introducedAt)lexicon.delete(w.id);
}
course.lexicon=[...lexicon.values()];
for(const e of course.commonExceptionWords)e.introducedAt=lexicon.get(e.wordId)?.introducedAt||e.introducedAt;
course.commonExceptionWords=course.commonExceptionWords.filter(e=>lexicon.has(e.wordId));
// Rhotic notes everywhere the old non-rhotic wording appears.
let text=JSON.stringify(course);for(const [from,to] of Object.entries(accentNotes))text=text.split(JSON.stringify(from).slice(1,-1)).join(JSON.stringify(to).slice(1,-1));
const out=JSON.parse(text);
out.enrichmentLevels3to5={id:MARK,approvedBy:'project owner',date:'2026-10-27',pendingReview:['Every Pashto line marked psStatus:check (see docs/beginner-course-phase1/pashto-check-levels-3-5.md)','New English phrases, sentences, stories and questions']};
manifest.recordingCount=manifest.recordings.length;
await writeFile(cUrl,JSON.stringify(out,null,2)+'\n');await writeFile(mUrl,JSON.stringify(manifest,null,2)+'\n');
const md=['# New Pashto for review — Levels 3–5','','Every line below is new or changed and is marked `check`. Correct the Pashto on the right; the English is what it should mean.','','| Where | English | Pashto (check) |','|---|---|---|',...toCheck.map(x=>`| ${x.where} | ${x.en} | ${x.ps} |`),''];
await writeFile(new URL('docs/beginner-course-phase1/pashto-check-levels-3-5.md',root),md.join('\n'));
console.log(`Level 3: ${ordered3.length} lessons. Level 4: ${ordered4.length}. Level 5: ${ordered5.length}. Words: ${out.lexicon.length}. Audio entries: ${manifest.recordings.length}. Pashto to check: ${toCheck.length}.`);
