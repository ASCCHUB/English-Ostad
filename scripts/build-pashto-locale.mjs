// One-time builder for src/ustad/locales/ps.js, the single home of the app's Pashto.
// It takes every Pashto line in the app, applies the approved Lower Dir style rules
// (src/ustad/pashtoStyle.js) and the user's approved review wording, and marks lines the
// rules cannot settle as "check". After that, edit ps.js by hand; rerun only with --force.
// Usage: node scripts/build-pashto-locale.mjs [--force]
import {existsSync} from 'node:fs';
import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const src=name=>import(new URL(`../src/ustad/${name}`,import.meta.url));
const out=new URL('../src/ustad/locales/ps.js',import.meta.url);
if(existsSync(out)&&!process.argv.includes('--force')){console.error('src/ustad/locales/ps.js already exists and may hold hand edits. Use --force to rebuild it.');process.exit(1);}
const {convertPashto}=await src('pashtoStyle.js');
const {supportRows}=await src('supportCopy.js'),{screenRows}=await src('supportScreens.js'),{advancedRows}=await src('supportAdvanced.js'),{soundRows}=await src('supportSound.js');
const content=await src('content.js'),curriculum=await src('curriculum.js'),study=await src('studyContent.js'),{explorerCopy}=await src('explorerCopy.js'),{ui}=await src('i18n.js'),{adventureHelp}=await src('adventureContent.js'),{foxLessons}=await src('foxLessonModel.js');
// The user's review of 2026-10-26. Keys are the English text the app shows.
const approved={
 'Let’s start learning':['سبق شروع کړئ.','Sabaq shuru krai.'],
 'Choose the correct answer':['صحیح جواب کوم یو دی؟','Sahih jawaab kum yaw day?'],
 'Well done, you completed the task!':['ډېر ښه، تاسو ټاسک پوره کړو','Der kha, taaso task pura kro'],
 'Home':['کور','Kor'],'Classes':['کلاسونه','Klasuna'],'Play':['لوبې','Lobe'],'My Stars':['زما ستوري','Zama stori'],
 'Story corner':['قیصې','Qise'],'For parents':['د مور پلار د پاره','Da mor plaar da para'],'Themes & display':['سیټنګز','Settings'],
 'Next':['بل','Bal'],'Back':['واپس','Waapas'],'Check my answer':['جواب چیک کړئ','Jawaab check krai'],'Try again':['بیا کوشش وکړئ','Bya koshish wakrai'],
 'Listen':['واورئ','Waawrai'],'Hear the sentence':['ټوله جمله واورئ','Tola jumla waawrai'],'Pashto help':['په پښتو کې مدد','Pa Pakhto ke madad'],
 'Take a break':['لږ آرام وکړئ','Lag aaraam wakrai'],
 'Listen, then tap the picture.':['واورئ، بیا په صحیح تصویر ګوته کېږدئ.','Waawrai, bya pa sahih tasweer gwata kegdai.'],
 'Tap a word, then its picture.':['لومړی په لفظ ګوته کېږدئ، بیا د هغې په تصویر.','Lumray pa lafz gwata kegdai, bya da haghe pa tasweer.'],
 'Listen, then say it aloud. Say it to a grown-up or a toy friend!':['واورئ، بیا یې په اوچت اواز ووایئ. مشر ته یا خپلې ګوډۍ ته یې ووایئ!','Waawrai, bya ye pa uchat aawaz wawaayai. Mashar ta ya khpale gudai ta ye wawaayai!'],
 'Which word did you hear?':['تاسو کوم لفظ واورېدو؟','Taaso kum lafz awredo?'],
 'A little hint':['لږ مدد','Lag madad'],
 'Let’s make it easier. Try again with fewer choices.':['راځئ چې آسان یې کړو. اوس لږ جوابونه دي، بیا کوشش وکړئ.','Raazai che aasaan ye kro. Os lag jawaabuna di, bya koshish wakrai.'],
 'You got it on the first try!':['په اول ځل مو صحیح کړو!','Pa awal zal mo sahih kro!'],
 'You kept trying and found it!':['تاسو کوشش جاري وساتلو او صحیح جواب مو پیدا کړو!','Taaso koshish jaari wasaatalo aw sahih jawaab mo paida kro!'],
 'Great job!':['شاباش!','Shabaash!'],'Brilliant!':['زبردست!','Zabardast!'],'Lesson complete!':['سبق پوره شو!','Sabaq pura sho!'],
 'What you learned':['تاسو څه زده کړل','Taaso sa zda kral'],
 'Step # of #':['سټیپ # / #','Step # / #'],'# of # lessons done':['#2 سبقونو کې #1 پوره شول','#2 sabaqono ke #1 pura shwal'],
 'Your place is saved.':['ستاسو ځای محفوظ دی.','Staaso zaay mehfooz day.'],
 'Sounds and voice':['اوازونه','Aawazuna'],'Automatically play instructions':['هدایات په خپله واورول شي','Hidaayaat pa khpala waawrawal shi'],
 'Background music':['نرمه موسیقي','Narma museeqi'],'Explanation language':['د مطلب ژبه','Da matlab zhaba'],
 'Pashto audio is not ready yet. Please read the text.':['د پښتو اواز لا تیار نه دی. مهرباني وکړئ ولولئ.','Da Pakhto aawaz la tayaar na day. Mehrabaani wakrai walwalai.']
};
// Reviewed but not settled: keep the rule-converted wording and ask again.
const reopened={
 'Trace the letter with your finger.':'You chose "Change" but no new wording was saved.',
 'Not yet. Look at the hint and try again.':'You chose "Change" but no new wording was saved.',
 'New badge':'Your wording was نوی پیج (page). Did you mean نوی بیج (badge)?',
 'Continue':'Not reviewed yet.'
};
const sources=[];
const add=(en,ps,rps,from)=>{if(en&&ps)sources.push({en,ps,rps:rps||'',from});};
for(const row of Object.values(ui))add(row[0],row[1],row[2],'menus and buttons');
for(const [name,rows] of [['instructions',supportRows],['screens',screenRows],['advanced lessons',advancedRows],['sound',soundRows]])for(const [en,ps,rps] of rows)add(en,ps,rps,name);
for(const item of Object.values(content.prompts))add(item.en,item.ps,item.rps,'instructions');
for(const item of [...Object.values(study.studyCopy),...Object.values(explorerCopy)])add(item.en,item.ps,item.rps,'screens');
for(const [name,items] of [['word meanings',content.words],['phrases',content.phrases],['readings',content.readings],['grammar',curriculum.grammarLessons],['stories',curriculum.stories.flatMap(s=>s.lines)],['phonics',curriculum.phonicsSupport],['sentence lessons',study.sentenceLessons],['reading lessons',study.readingLessons]])for(const item of items)add(item.en,item.ps,item.rps,name);
add(adventureHelp.en,adventureHelp.ps,adventureHelp.rps,'instructions');
for(const lesson of foxLessons)add(`Fox help: ${lesson.id}`,lesson.ps,'','fox game');
const entries={};let conflicts=0;
for(const s of sources){
 if(entries[s.en]){if(entries[s.en].source!==s.ps)conflicts++;continue;}
 const id='ps-'+createHash('sha1').update(s.en).digest('hex').slice(0,8);
 if(approved[s.en]){const [ps,rps]=approved[s.en];entries[s.en]={id,ps,rps,status:'approved',from:s.from,audio:'pending',source:s.ps};continue;}
 const c=convertPashto(s.ps,s.rps,s.en);
 const checks=[...(reopened[s.en]?[reopened[s.en]]:[]),...c.checks];
 entries[s.en]={id,ps:c.ps,rps:c.rps,status:checks.length?'check':c.changed?'converted':'kept',...(checks.length?{checks}:{}),from:s.from,audio:'pending',source:s.ps};
}
// Approved lines that are new to the app.
for(const [en,[ps,rps]] of Object.entries(approved))entries[en]??={id:'ps-'+createHash('sha1').update(en).digest('hex').slice(0,8),ps,rps,status:'approved',from:'review',audio:'pending',source:''};
for(const e of Object.values(entries))delete e.source;
const counts=Object.values(entries).reduce((n,e)=>(n[e.status]=(n[e.status]||0)+1,n),{});
const header=`// Lower Dir (Malakand) Pashto for the whole app: the single place to change Pashto wording.
// Key: the English text the app shows. Fields: ps (Pashto), rps (Roman Pashto),
// status: approved (by the reviewer) · converted (style rules applied) · check (needs review, see checks)
// · kept (no change needed); audio: pending until /audio/ps/<id>.mp3 is recorded, then ready.
// Built by scripts/build-pashto-locale.mjs on ${new Date().toISOString().slice(0,10)}; edit by hand from now on.
`;
await writeFile(out,header+'export default '+JSON.stringify({region:'Lower Dir, Malakand Division',entries},null,1)+';\n');
// Recording list for the speaker, most-heard lines first.
const priority=e=>e.status==='approved'||e.from==='menus and buttons'?1:['instructions','screens','sound','fox game'].includes(e.from)?2:e.from==='word meanings'?3:4;
const rows=Object.entries(entries).map(([en,e])=>({en,...e,priority:priority(e)})).sort((a,b)=>a.priority-b.priority||a.en.localeCompare(b.en));
const csv=v=>`"${String(v).replaceAll('"','""')}"`;
await writeFile(new URL('../docs/pashto-recording-list.csv',import.meta.url),'﻿'+['file,priority,pashto,english,status',...rows.map(r=>[r.id+'.mp3',r.priority,r.ps,r.en,r.status].map(csv).join(','))].join('\r\n')+'\r\n');
console.log(`ps.js: ${Object.keys(entries).length} lines`,counts,`· ${conflicts} English lines had more than one Pashto source (first kept)`);
