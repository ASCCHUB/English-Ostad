// Course enrichment approved 2026-10-27: richer 8–10 minute lessons for Levels 1 and 2.
//  Level 1: every letter lesson gets 3–4 picture words (English audio + Pashto meaning), a "say it" step,
//           a chant with an action, a mixed review of earlier letters, a blending step from the third
//           sound, and checks with look-alike letters. LetterTap and MatchPairs (repeats) are removed.
//           Reviews come after every 4 letters (same sound order): 7 reviews.
//  Level 2: 21 lessons + 5 reviews (was 8). "a" is taught second; pig → bin; tiny decodable phrases;
//           sound-pair lessons (a/e in Review 3, v/w, b/d, p/f).
// Levels 3–5 are unchanged until their lists are approved.
// New Pashto (meanings, chant actions, instructions) is marked pending review.
// Usage: node scripts/enrich-course.mjs   (refuses to run twice)   then
//        node scripts/extend-audio-manifest.mjs && npm run first-steps:build
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../',import.meta.url),cUrl=new URL('docs/beginner-course-phase1/curriculum.json',root),mUrl=new URL('docs/beginner-course-phase1/audio-manifest.json',root);
const course=JSON.parse(await readFile(cUrl,'utf8')),manifest=JSON.parse(await readFile(mUrl,'utf8'));
const MARK='2026-10-27-enrichment';
if(course.enrichment?.id===MARK){console.log('Already applied.');process.exit(0);}
const review=()=>({status:'pending_review',english:{reviewer:null,signedAt:null},pashto:{reviewer:null,signedAt:null},phonics:{reviewer:null,signedAt:null}});
const hash=s=>createHash('sha1').update(s).digest('hex').slice(0,12);
// An audio entry for a text (reused when the same text and kind already exist).
function clip(text,{language='en-GB',kind='speech',notes=''}={}){
 let r=manifest.recordings.find(x=>x.language===language&&x.kind===kind&&x.text===text);
 if(!r){r={id:`${language}-${hash(kind+':'+text)}`,language,text,kind,recordingNotes:notes||(language==='ps-PK'?'Lower Dir Pashto, polite plural; calm, slow and warm.':'Clear, warm, unhurried.'),file:null,alignmentFile:null,recordingStatus:'pending_recording',review:review()};manifest.recordings.push(r);}
 return r.id;
}
const instruction=(en,ps)=>({enEditorialGloss:en,ps,psAudioId:clip(ps,{language:'ps-PK'}),review:review()});
const lexicon=new Map(course.lexicon.map(w=>[w.id,w])),gpcs=new Map(course.graphemePhonemeCorrespondences.map(g=>[g.id,g]));
const lessonsById=new Map(course.lessons.map(l=>[l.id,l]));
// ---------- Pashto meanings: from the app's word list where it has one, otherwise new (pending review) ----------
const appWords=Object.fromEntries((await import(new URL('src/ustad/content.js',root))).words.map(w=>[w.en.toLowerCase(),w.ps]));
const newMeanings={sock:'جوراب',tap:'نل',pot:'دېګ',insect:'حشره',ink:'سیاهي',igloo:'د واورې کور',neck:'غاړه',desk:'مېز',gift:'تحفه',ox:'غوایی',octopus:'اکټوپس (سمندري ځناور)',king:'باچا',elbow:'څنګل',up:'پورته',ring:'ګوته',jug:'جګ',jam:'مربا',vase:'ګلدان',vest:'واسکټ',web:'د غڼې جال',yoghurt:'مستې','yo-yo':'یویو (لوبه)',zip:'زِپ',zero:'صفر',quilt:'بړستن',mat:'ټغر',pat:'په نرمۍ ټکول',fat:'چاغ',man:'سړی',can:'ډبه',cap:'ټوپۍ',bat:'بیټ',dig:'کنستل',hot:'ګرم',mop:'پوچه',log:'لرګی',bin:'ډسټبین',net:'جال',bug:'چینجی',mug:'مګ',nut:'مغز',vet:'د څارویو ډاکټر',wet:'لوند',win:'ګټل',wig:'مصنوعي وېښته',bad:'بد',big:'لوی',fan:'پکه',fin:'د کب وزر',pin:'پن',tin:'ټین',pan:'تاوه',quiz:'کوئز (پوښتنې)',yes:'هو',men:'سړي',kid:'ماشوم',pet:'کورنی ځناور',jet:'جیټ الوتکه',sat:'کېناست',sit:'کېناستل',in:'کې',on:'باندې',run:'منډه وهل'};
const meaning=id=>newMeanings[id]?{ps:newMeanings[id],source:'new'}:appWords[id]?{ps:appWords[id],source:'app_vocabulary'}:null;
// ---------- Words ----------
function segmentsFor(text){const out=[];for(let i=0;i<text.length;i++){if(text[i]==='q'&&text[i+1]==='u'){out.push('qu');i++;}else out.push(text[i]);}return out.every(s=>gpcs.has(s))?out:null;}
// Adds a word if missing. A word that is read (decodable: all single-letter sounds) gets segments; a word
// used only as a letter's picture is picture-only (heard and seen, not read) until a lesson reads it.
function word(id,{oral=false}={}){
 const segments=/^[a-z]+$/.test(id)?segmentsFor(id):null;
 if(!lexicon.has(id))lexicon.set(id,{id,text:id,introducedAt:null,category:'oral_picture',segments:null,notes:'Picture word for a letter sound; heard and seen, not read.',audioId:clip(id),review:review()});
 const w=lexicon.get(id);
 if(!oral&&w.category==='oral_picture'){if(!segments)throw Error(`${id} is read in a lesson but is not decodable`);Object.assign(w,{category:'decodable',segments,notes:''});}
 const m=meaning(id);if(m&&!w.psMeaning){w.psMeaning=m.ps;w.psMeaningSource=m.source;}
 return id;
}
lexicon.delete('pig');
// ---------- Level 1 ----------
const order='s a t p i n m d g o c k e u r h b f l j v w x y z qu'.split(' ');
const picture={s:['sun','sock','six','salt'],a:['apple','ant','angry'],t:['tap','ten','tiger','tooth'],p:['pen','pot','pencil','pear'],i:['insect','ink','igloo'],n:['nest','nose','nine','neck'],m:['mango','monkey','moon','milk'],d:['dog','duck','door','desk'],g:['goat','gift','garlic'],o:['orange','ox','octopus'],c:['cat','cup','cow','carrot'],k:['kite','king','key'],e:['egg','elephant','elbow'],u:['umbrella','uncle','up'],r:['rabbit','ring','rice','river'],h:['hat','hen','horse','house'],b:['ball','bus','banana','baby'],f:['fish','fox','five','foot'],l:['lion','lemon','leaf','lamp'],j:['jug','jam','jacket','juice'],v:['van','vase','vest'],w:['web','watch','window','water'],x:['box','fox','six'],y:['yellow','yoghurt','yo-yo'],z:['zip','zebra','zero'],qu:['queen','quilt']};
// Blending words once enough sounds are known (L1-03 to L1-10 keep their approved words).
const blend={c:['cat','cap'],k:['kid','kit'],e:['pet','ten'],u:['sun','cup'],r:['red','run'],h:['hat','hen'],b:['bat','bed'],f:['fan','fin'],l:['leg','lid'],j:['jam','jet'],v:['van','vet'],w:['web','wet'],x:['box','six'],y:['yes'],z:['zip'],qu:['quiz']};
const chants={s:['S says sss. Sun, sock, sss!','Move your hand like a snake.','لاس د مار په شان کږلېچ وښوروئ.'],a:['A says a. Apple, ant, a!','Open your mouth as if you bite an apple.','خوله پرانیزئ، لکه مڼه چې خورئ.'],t:['T says t. Tap, ten, t!','Tap the table with one finger.','په مېز یوه ګوته وټکوئ.'],p:['P says p. Pen, pot, p!','Hold your hand by your lips and feel the puff.','لاس د شونډو مخې ته ونیسئ او هوا محسوس کړئ.'],i:['I says i. Insect, ink, i!','Wiggle your fingers like an insect.','ګوتې د حشرې په شان وښوروئ.'],n:['N says nnn. Nest, nose, nnn!','Touch your nose.','خپله پوزه لمس کړئ.'],m:['M says mmm. Mango, moon, mmm!','Rub your tummy: yummy!','په ګېډه لاس راکاږئ، لکه خوند چې درکوي.'],d:['D says d. Dog, duck, d!','Beat a drum with your hands.','د ډول په شان لاسونه ووهئ.'],g:['G says g. Goat, gift, g!','Gulp as if you drink water.','لکه اوبه چې څښئ، غړپ وکړئ.'],o:['O says o. Orange, ox, o!','Make your mouth round like O.','خوله ګرده کړئ لکه O.'],c:['C says c. Cat, cup, c!','Make cat claws with your fingers.','ګوتې د پیشو د منګولو په شان کړئ.'],k:['K says k. Kite, king, k!','Fly a kite with your hands.','لاسونه داسې وښوروئ لکه پتنګ چې الوزوئ.'],e:['E says e. Egg, elephant, e!','Swing your arm like an elephant’s trunk.','لاس د فیل د خرطوم په شان وښوروئ.'],u:['U says u. Umbrella, up, u!','Open an umbrella and point up.','لکه چترۍ چې پرانیزئ، لاس پورته کړئ.'],r:['R says rrr. Rabbit, ring, rrr!','Hop like a rabbit.','د سوي په شان ټوپ ووهئ.'],h:['H says h. Hat, hen, h!','Breathe out on your hand: h, h, h.','پر خپل لاس ساه وباسئ: h، h، h.'],b:['B says b. Ball, bus, b!','Bounce a ball.','لکه توپ چې ټکوئ، لاس ښکته پورته کړئ.'],f:['F says fff. Fish, fox, fff!','Swim like a fish.','لاس د کب په شان ولامبوئ.'],l:['L says lll. Lion, lemon, lll!','Lift your tongue up behind your teeth.','ژبه د غاښونو شاته پورته کړئ.'],j:['J says j. Jug, jam, j!','Jump!','ټوپ ووهئ.'],v:['V says vvv. Van, vase, vvv!','Top teeth on your lip, and drive a van.','پورتني غاښونه پر لاندې شونډه کېږدئ او لکه موټر چې چلوئ.'],w:['W says w. Web, window, w!','Make round lips and wave.','شونډې ګردې کړئ او لاس وښوروئ.'],x:['X says ks. Box, fox, ks!','Cross your arms like an X.','لاسونه د X په شان سره تېر کړئ.'],y:['Y says y. Yellow, yo-yo, y!','Play with a yo-yo.','لکه یویو چې لوبوئ، لاس ښکته پورته کړئ.'],z:['Z says zzz. Zip, zebra, zzz!','Zip up a jacket: zzz.','لکه زِپ چې تړئ، لاس پورته کړئ: zzz.'],qu:['Q and u say kw. Queen, quilt, kw!','Put a crown on your head like a queen.','لکه ملکه چې تاج سر ته ږدي، لاسونه سر ته وړئ.']};
const groups=[['s','a','t','p'],['i','n','m','d'],['g','o','c','k'],['e','u','r','h'],['b','f','l','j'],['v','w','x'],['y','z','qu']];
const I={pictures:instruction('Look, listen and learn the words.','تصویرونه وګورئ، لفظونه واورئ او زده یې کړئ.'),say:instruction('Say the word, then hear yourself.','لفظ ووایئ، بیا خپل اواز واورئ.'),chant:instruction('Listen, say it together and do the action.','واورئ، ورسره یې ووایئ او حرکت وکړئ.'),mixed:instruction('Listen. Which letter makes this sound?','غوږ ونیسئ. دا اواز کوم ټکی کوي؟'),contrast:instruction('Listen. Which word did you hear?','غوږ ونیسئ. کوم لفظ مو واورېد؟')};
const L1=course.lessons.filter(l=>l.level===1),letterLessons=Object.fromEntries(L1.filter(l=>l.content.letters.length).map(l=>[l.content.newGpcIds[0],l])),oldReviews=L1.filter(l=>!l.content.letters.length);
const keep=(l,type)=>l.activities.find(a=>a.type===type);
const act=(lessonId,list)=>list.filter(Boolean).map((a,i)=>({id:`${lessonId}-a${i+1}`,...a,englishAudioIds:[],review:review()}));
function letterLesson(gpc,index){
 const l=letterLessons[gpc],pics=picture[gpc].map(id=>word(id,{oral:true})),[text,actionEn,actionPs]=chants[gpc],words=(l.content.wordIds.length?l.content.wordIds:blend[gpc]||[]).map(id=>word(id));
 l.content={...l.content,wordIds:index>=2?words:[],pictureWordIds:pics};
 const cue=lexicon.get(pics[1]),checkPicture=pics[2]||pics[0];
 l.activities=act(l.id,[
  keep(l,'CharacterExample'),
  {type:'PictureWords',instruction:I.pictures,content:{wordIds:pics,printLabelsOnlyWhenDecodable:true}},
  {type:'SayIt',instruction:I.say,content:{wordId:pics[0],recordingOptional:true,neverScored:true}},
  {type:'Chant',instruction:I.chant,content:{text,audioId:clip(text,{notes:'A short rhythmic chant; say the sound clearly each time.'}),actionEn,actionPs,actionPsStatus:'pending_review'}},
  {...keep(l,'InitialSoundPicture'),content:{cue:{text:cue.id,audioId:cue.audioId,meaningContext:'Picture cue only; not independent reading.',printLabelBeforeDecodable:false},position:'initial',foilPolicy:'Pictures for other letters, preferring similar sounds.'}},
  index>0&&{type:'SoundMatch',instruction:I.mixed,content:{letters:l.content.reviewOf.slice(-3)}},
  {...keep(l,'FindLetter'),content:{target:gpc==='qu'?'q':gpc,foilPolicy:'Look-alike letters first (for s: z, c), then earlier letters. No shapes.'}},
  keep(l,'TraceLetter'),
  index>=2&&words.length&&{...(keep(l,'BlendWord')||{type:'BlendWord',instruction:L1.find(x=>keep(x,'BlendWord')).activities.find(a=>a.type==='BlendWord').instruction}),content:{wordIds:words,modelOnly:true,coreLetterGoalStillApplies:true}},
  keep(l,'IndependentCheck'),keep(l,'Celebration')]);
 const sp=l.assessment.items.find(q=>q.type==='SoundPicture');if(sp)sp.answer=checkPicture;
 l.durationMinutes={minimum:8,maximum:10};
 return l;
}
const template=oldReviews[0];
function reviewLesson(n,group,known){
 const id=`L1-R${n}`,l=lessonsById.get(id)||JSON.parse(JSON.stringify({...template,id}));
 const earlier=known.filter(g=>!group.includes(g)),mixed=[...group,...earlier.slice(-2)];
 const blendWords=[...new Set(known.flatMap(g=>blend[g]||letterLessons[g].content.wordIds))].filter(w=>lexicon.get(w)?.segments?.every(s=>known.includes(s))).slice(-6);
 const letters=group.map(g=>g==='qu'?'q':g);
 l.title=`Review ${group.join(', ')}`;l.goal=l.objectives[0]=`Recognise and say ${group.join(', ')} among all the sounds taught so far.`;
 l.content={letters:[],newGpcIds:[],wordIds:blendWords,trickyWordIds:[],sentences:[],story:null,dialogue:[],reviewOf:letters,pictureWordIds:group.map(g=>picture[g][0])};
 l.activities=act(id,[
  {...keep(template,'CharacterExample'),content:{letters}},
  {type:'SoundMatch',instruction:I.mixed,content:{letters:mixed.map(g=>g==='qu'?'q':g)}},
  {type:'PictureWords',instruction:I.pictures,content:{wordIds:l.content.pictureWordIds,printLabelsOnlyWhenDecodable:true}},
  {...keep(template,'FindLetter'),content:{letters}},
  blendWords.length&&{type:'BlendWord',instruction:L1.find(x=>keep(x,'BlendWord')).activities.find(a=>a.type==='BlendWord').instruction,content:{wordIds:blendWords,modelOnly:true}},
  {...keep(template,'TraceLetter'),content:{letters,alternative:'TapDots',motorQualityIsNotAGate:true}},
  {...keep(template,'IndependentCheck'),content:{assessmentId:`${id}-check`}},
  {...keep(template,'Celebration'),content:{...keep(template,'Celebration').content,enEditorialGoal:l.goal}}]);
 const base=template.assessment.items[0],pick=i=>letters[i%letters.length],old=earlier.length?(earlier[earlier.length-1]==='qu'?'q':earlier[earlier.length-1]):pick(1);
 const item=(i,type,target,answer,constructed=false)=>({...base,id:`${id}-check-${i+1}`,type,target,answer,constructed});
 l.assessment={...template.assessment,items:[item(0,'LetterRecognition',pick(0),pick(0).toUpperCase()),item(1,'SoundMatch',pick(1),pick(1).toUpperCase()),item(2,'CaseMatch',pick(2),pick(2)),item(3,'ConstructCasePair',pick(3),[pick(3).toUpperCase(),pick(3)],true),item(4,'SoundMatch',old,old.toUpperCase())]};
 l.durationMinutes={minimum:8,maximum:10};l.unit=null;
 return l;
}
const level1=[],units1=[],known=[];
groups.forEach((group,i)=>{const ids=[];for(const g of group){level1.push(letterLesson(g,order.indexOf(g)));known.push(g);ids.push(letterLessons[g].id);}const r=reviewLesson(i+1,group,[...known]);level1.push(r);ids.push(r.id);units1.push({id:`L1-U${i+1}`,title:`Sounds ${group.join(', ')}`,lessonIds:ids});});
for(const u of units1)for(const id of u.lessonIds)level1.find(l=>l.id===id).unit=u.id;
// ---------- Level 2 ----------
const L2old=Object.fromEntries(course.lessons.filter(l=>l.level===2).map(l=>[l.id,l])),proto=L2old['L2-01'];
const ins=type=>Object.values(L2old).flatMap(l=>l.activities).find(a=>a.type===type)?.instruction;
const anyIns=type=>course.lessons.flatMap(l=>l.activities).find(a=>a.type===type)?.instruction;
L2old['L2-04'].content.wordIds=L2old['L2-04'].content.wordIds.map(w=>w==='pig'?'bin':w);
word('bin');const pigClip=manifest.recordings.find(r=>r.text==='pig')?.id;
for(const a of L2old['L2-04'].activities){if(a.content?.wordIds)a.content.wordIds=a.content.wordIds.map(w=>w==='pig'?'bin':w);if(a.englishAudioIds)a.englishAudioIds=a.englishAudioIds.map(id=>id===pigClip?lexicon.get('bin').audioId:id);}
if(JSON.stringify(L2old['L2-04']).includes('"pig"')||pigClip&&JSON.stringify(course).replace(JSON.stringify(manifest),'').split(pigClip).length>2)console.warn('pig still referenced in L2-04');
for(const q of L2old['L2-04'].assessment.items)for(const k of ['target','answer'])if(q[k]==='pig')q[k]='bin';
for(const s of course.sampleLessons)if(JSON.stringify(s).includes('"pig"'))throw Error('pig in a sample lesson');
function wordLesson(id,title,goal,words,phrases=[],extra={}){
 words.forEach(w=>word(w));(extra.pairs||[]).flat().forEach(w=>word(w));for(const p of phrases){p.match(/[a-z]+/gi).forEach(t=>{const w=t.toLowerCase();if(!['a','the','is','i'].includes(w))word(w);});clip(p,{notes:'Read as a short phrase, naturally, not word by word.'});}
 const l=JSON.parse(JSON.stringify(proto));l.id=id;l.title=title;l.goal=l.objectives[0]=goal;l.durationMinutes={minimum:8,maximum:10};
 l.content={letters:[],newGpcIds:[],wordIds:words,trickyWordIds:[],sentences:phrases,story:null,dialogue:[],reviewOf:[]};
 l.activities=act(id,[
  {type:'CharacterExample',instruction:ins('CharacterExample'),content:{englishText:words[0],newGpcIds:[],focus:null}},
  {type:'GuidedListen',instruction:ins('GuidedListen'),content:{wordIds:words,newGpcIds:[],trickyParts:[],sentences:[],explicitIntroductionBeforeUse:true}},
  {type:'BlendWord',instruction:ins('BlendWord'),content:{wordIds:words}},
  extra.pairs&&{type:'SoundContrast',instruction:I.contrast,content:{pairs:extra.pairs}},
  {type:'WordPictureMatch',instruction:ins('WordPictureMatch'),content:{wordIds:words}},
  {type:'TileBuilder',instruction:ins('IndependentBuild'),content:{wordIds:words}},
  phrases.length&&{type:'ReadAlong',instruction:anyIns('ReadAlong'),content:{sentences:phrases}},
  phrases.length&&{type:'SentenceBuild',instruction:anyIns('SentenceBuild')||anyIns('SentenceOrder'),content:{sentences:phrases}},
  {type:'IndependentCheck',instruction:ins('IndependentCheck'),content:{assessmentId:`${id}-check`}},
  {type:'Celebration',instruction:ins('Celebration'),content:{...proto.activities.find(a=>a.type==='Celebration').content,enEditorialGoal:goal,englishPracticeTarget:phrases[0]||words[0]}}]);
 const base=proto.assessment.items[0],w=i=>words[i%words.length];
 const item=(i,type,target,answer,constructed=false)=>({...base,id:`${id}-check-${i+1}`,type,target,answer,constructed});
 l.assessment={...proto.assessment,items:[item(0,'ListenAndSelect',w(0),w(0)),item(1,'BuildFromAudio',w(1),w(1),true),item(2,'ListenAndSelect',w(2),w(2)),item(3,'BuildFromAudio',w(3),w(3),true),phrases.length?item(4,'SentenceBuild',phrases[0],phrases[0],true):item(4,'ListenAndSelect',w(4),w(4))]};
 l.achievement={...l.achievement,enEditorialGoal:goal};
 return l;
}
const enrich=l=>{l.durationMinutes={minimum:8,maximum:10};return l;};
const level2Units=[
 ['Short a words',[enrich(L2old['L2-01']),enrich(L2old['L2-06']),wordLesson('L2-09','The -at family','Read and build words that end in -at.',['cat','mat','pat','sat','fat'],['a fat cat']),wordLesson('L2-10','-an and -ap words','Read and build words with -an and -ap.',['pan','van','man','can','map','tap'],['a man in a van']),wordLesson('L2-11','More short a words','Read and build more short a words.',['bag','jam','cap','hat','bat'],['a hat in a bag']),wordLesson('L2-R1','Review: short a','Read all the short a words and phrases so far.',['cat','van','map','bag','jam','hat'],['a fat cat','a man in a van'])]],
 ['Short i and o',[enrich(L2old['L2-02']),wordLesson('L2-12','Short i words','Read and build short i words.',['pin','tin','dig','sit','zip','six'],['a big tin']),wordLesson('L2-13','Short o words','Read and build short o words.',['dog','log','pot','hot','box','fox','mop'],['a dog on a log']),enrich(L2old['L2-03']),wordLesson('L2-R2','Review: a, i and o','Read short a, i and o words and phrases.',['map','pin','fox','bag','six','pot'],['a big tin','a dog on a log'])]],
 ['Short e and u',[enrich(L2old['L2-04']),wordLesson('L2-14','Short e words','Read and build short e words.',['hen','pen','ten','bed','red','leg','web','net'],['a red hen']),wordLesson('L2-15','Short u words','Read and build short u words.',['sun','cup','bus','bug','mug','nut','run'],['a bug in a cup']),enrich(L2old['L2-05']),wordLesson('L2-R3','Review: all five vowels','Read words with every short vowel, and hear a from e.',['cat','pin','dog','hen','cup','pen'],['a red hen','a bug in a cup'],{pairs:[['pan','pen'],['man','men'],['bad','bed'],['pat','pet']]})]],
 ['Useful words and phrases',[enrich(L2old['L2-07']),wordLesson('L2-16','Phrases with a and the','Read short phrases with a and the.',['cat','sun','dog','bag'],['a cat','the sun','a big dog','the red bag']),wordLesson('L2-17','Phrases with is','Read short phrases with is.',['cat','sun','dog'],['the cat is fat','the sun is hot','the dog is big']),wordLesson('L2-R4','Review: phrases','Read all the phrases so far.',['fat','hot','big','red'],['a fat cat','the sun is hot','a dog on a log','the red bag'])]],
 ['Sounds that are easy to mix',[wordLesson('L2-18','v or w?','Hear and read v and w words.',['van','vet','wet','web','win','wig'],['a wet web'],{pairs:[['vet','wet'],['van','win'],['vet','web']]}),wordLesson('L2-19','b or d?','Read b and d words without mixing them.',['bed','bad','dad','big','dig'],['a big bed'],{pairs:[['bad','dad'],['big','dig'],['bed','dad']]}),wordLesson('L2-20','p or f?','Hear and read p and f words.',['pan','fan','pin','fin','pat','fat'],['a fan in a van'],{pairs:[['pan','fan'],['pin','fin'],['pat','fat']]}),wordLesson('L2-21','x, y, z and qu','Read words with x, y, z and qu.',['box','fox','six','yes','zip','quiz'],['a fox in a box']),enrich(L2old['L2-08']),wordLesson('L2-R5','Level 2 review','Read every kind of word and phrase from Level 2.',['cat','fox','bed','sun','van','quiz'],['a fox in a box','the dog is big','a red hen'])]]
];
// "a" is now taught second, before any phrase uses it.
const level2=level2Units.flatMap(([,ls])=>ls),units2=level2Units.map(([title,ls],i)=>({id:`L2-U${i+1}`,title,lessonIds:ls.map(l=>l.id)}));
for(const u of units2)for(const id of u.lessonIds)level2.find(l=>l.id===id).unit=u.id;
// ---------- Put it together ----------
const rest=course.lessons.filter(l=>l.level>2);
course.lessons=[...level1,...level2,...rest];
course.levels[0].units=units1;course.levels[1].units=units2;
for(const level of course.levels)level.objectives=course.lessons.filter(l=>l.level===level.number).map(l=>l.goal);
// Each lesson in Levels 1–2 needs the one before it; Level 3 starts after the Level 2 review.
course.lessons.forEach((l,i)=>{if(l.level<=2||l.id==='L3-01')l.prerequisiteLessonIds=i?[course.lessons[i-1].id]:[];});
// A word is introduced in the first lesson that lists it or reads it in a phrase (picture-only words: the
// first lesson that shows them).
const pos=new Map(course.lessons.map((l,i)=>[l.id,i])),read=l=>[...l.content.sentences,...(l.content.story?.sentences||[]),...l.content.dialogue.flat()].flatMap(s=>(s.match(/[A-Za-z]+/g)||[]).map(t=>t.toLowerCase())).concat(l.activities.flatMap(a=>a.content?.pairs?.flat()||[]));
for(const w of lexicon.values()){const first=course.lessons.find(l=>[...l.content.wordIds,...l.content.trickyWordIds].includes(w.id)||w.category==='decodable'&&read(l).includes(w.id))||course.lessons.find(l=>(l.content.pictureWordIds||[]).includes(w.id));if(first&&(!w.introducedAt||w.category==='oral_picture'||pos.get(first.id)<pos.get(w.introducedAt)||!pos.has(w.introducedAt)))w.introducedAt=first.id;if(!w.introducedAt)lexicon.delete(w.id);}
course.lexicon=[...lexicon.values()];
for(const s of course.sampleLessons)s.note='Phase 1 design sample. The live lesson was enriched on 2026-10-27; see curriculum.lessons.';
course.enrichment={id:MARK,approvedBy:'project owner',date:'2026-10-27',pendingReview:['Pashto picture-word meanings marked psMeaningSource:new','Chant action lines (actionPs)','New activity instructions','New phrases and chants (English)']};
manifest.recordings=manifest.recordings.filter(r=>r.text!=='pig');manifest.recordingCount=manifest.recordings.length;
await writeFile(cUrl,JSON.stringify(course,null,2)+'\n');await writeFile(mUrl,JSON.stringify(manifest,null,2)+'\n');
console.log(`Level 1: ${level1.length} lessons. Level 2: ${level2.length} lessons. Words: ${course.lexicon.length}. Audio entries: ${manifest.recordings.length}.`);
