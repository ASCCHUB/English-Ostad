// Adds what a human voice artist needs to the approved audio manifest (safe to run again):
//  • a plain-language artistCue for every letter-sound clip ("sss like a snake, not 'suh'"), and
//  • one slow-blend clip per blending word ("sssaaat → sat"), so blending is recorded, not synthesised.
// Device speech (TTS) stays only for whole words and sentences.
// Also rewrites docs/beginner-course-phase2/audio-recording-list.csv (the list to hand a voice artist).
// Usage: node scripts/extend-audio-manifest.mjs   then   npm run first-steps:build
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {parseCsv,toCsv} from './add-recordings.mjs';
const root=new URL('../',import.meta.url),file=new URL('docs/beginner-course-phase1/audio-manifest.json',root);
const manifest=JSON.parse(await readFile(file,'utf8')),curriculum=JSON.parse(await readFile(new URL('docs/beginner-course-phase1/curriculum.json',root),'utf8'));
// IPA in the manifest → what to say, in words a voice artist (or parent) can follow.
const cues={
 '/s/':'sss, like a snake. Not "suh", not "ess".','/æ/':'a as in apple. Short, no extra sound after.','/t/':'t, a tiny tap of the tongue. Not "tuh".',
 '/p/':'p, a small puff of air. Not "puh".','/ɪ/':'i as in it. Short.','/n/':'nnn, hum through the nose. Not "nuh".','/m/':'mmm, lips closed. Not "muh".',
 '/d/':'d, short. Not "duh".','/ɡ/':'g as in go, short. Not "guh".','/ɒ/':'o as in on, hot. Short.','/k/':'k, short. Not "kuh".','/e/':'e as in egg. Short.',
 '/ʌ/':'u as in up. Short.','/r/':'rrr, soft. Not "ruh".','/h/':'h, only breath. Not "huh".','/b/':'b, short. Not "buh".','/f/':'fff, top teeth on lip. Not "fuh".',
 '/l/':'lll, tongue up. Not "luh".','/dʒ/':'j as in jam, short. Not "juh".','/v/':'vvv, teeth on lip with a buzz. Not "vuh". Different from w.',
 '/w/':'w as in wet, lips round, short. Not "wuh". Different from v.','/k/ + /s/':'ks as in fox, short.','/j/':'y as in yes, short. Not "yuh".',
 '/z/':'zzz, like a bee. Not "zuh".','/k/ + /w/':'kw as in queen, short.','/ʃ/':'shhh, finger on lips.','/tʃ/':'ch as in chip, short. Not "chuh".',
 '/θ/':'th as in thin: tongue between teeth, no voice. Not "t" or "s".','/ð/':'th as in this: tongue between teeth, with voice. Not "d" or "z".',
 '/ŋ/':'ng as in ring. Hum at the back.','/iː/':'ee as in see. Long.','/uː/':'oo as in moon. Long.','/ʊ/':'oo as in book. Short.','/eɪ/':'ai as in rain.',
 '/əʊ/':'oa as in boat.','/ɑːr/':'ar as in car, with the r sounded (rhotic): car, farm, park.','/aɪ/':'i-e as in bike.','/s/ or /z/':'Say "s" as in cats, then "z" as in dogs, with a short pause between.',
 '/ɪz/':'es as in buses: "iz".','/əl/':'le as in little: "ul", short.'
};
let cued=0;
for(const r of manifest.recordings)if(['pure_phoneme','phoneme_sequence'].includes(r.kind)&&cues[r.text]&&r.artistCue!==cues[r.text]){r.artistCue=cues[r.text];cued++;}
// One rhotic accent throughout: every English clip with an r after a vowel says so (car, farm, here, water).
const RHOTIC='Rhotic accent: sound the r after the vowel (car, farm, park).',rhotic=/[aeiou]r(?![aeiou])|[aeiou]re\b/i;
for(const r of manifest.recordings)if(r.language==='en-GB'&&['speech','blend_stretched'].includes(r.kind)&&rhotic.test(r.text)&&!r.artistCue?.includes(RHOTIC)){r.artistCue=r.artistCue?`${r.artistCue} ${RHOTIC}`:RHOTIC;cued++;}
// bath is read with the short a of cat (b-a-th), not a long "bahth".
const BATH='bath: short a as in "cat" (b-a-th), not a long "bahth".';
for(const r of manifest.recordings)if(r.language==='en-GB'&&(/\bbath\b/i.test(r.text)||r.wordId==='bath')&&!r.artistCue?.includes(BATH)){r.artistCue=r.artistCue?`${r.artistCue} ${BATH}`:BATH;cued++;}
// Slow-blend clips for every word in a BlendWord activity, in course order.
const gpc=Object.fromEntries(curriculum.graphemePhonemeCorrespondences.map(g=>[g.id,g])),lexicon=Object.fromEntries(curriculum.lexicon.map(w=>[w.id,w]));
const blendWords=[...new Set(curriculum.lessons.flatMap(l=>l.activities.filter(a=>a.type==='BlendWord').flatMap(a=>a.content?.wordIds||l.content.wordIds)))].filter(id=>lexicon[id]?.segments?.length);
const stretch=word=>word.segments.map(s=>{const sp=gpc[s]?.spelling||s;return /^[aeiouslmnrfvzh]|sh|th|ee|oo|ai|oa|ar$/.test(sp)?sp+sp.slice(-1).repeat(2):sp;}).join('');
// Slow blends for words that are no longer blended in any lesson are removed.
const blending=new Set(blendWords),stale=manifest.recordings.filter(r=>r.kind==='blend_stretched'&&!blending.has(r.wordId)).length;
manifest.recordings=manifest.recordings.filter(r=>r.kind!=='blend_stretched'||blending.has(r.wordId));
let added=0;
for(const id of blendWords){
 const word=lexicon[id],clipId='en-GB-'+createHash('sha1').update('blend:'+id).digest('hex').slice(0,12);
 if(manifest.recordings.some(r=>r.id===clipId))continue;
 const parts=word.segments.map(s=>gpc[s]?.spelling||s);
 manifest.recordings.push({id:clipId,language:'en-GB',text:`${parts.join('–')} → ${word.text}`,kind:'blend_stretched',
  recordingNotes:'Blend the sounds smoothly in one breath, sliding each into the next, then stop. No added "uh" between sounds. Do not say the whole word at normal speed afterwards; the app plays that separately.',
  artistCue:`Say "${stretch(word)}" slowly and smoothly (${parts.join(' + ')} → ${word.text}). Hold the long sounds; keep stop sounds (t, p, d, b, k, g) short.`,
  wordId:id,file:null,alignmentFile:null,recordingStatus:'pending_recording',
  review:{status:'pending_review',english:{reviewer:null,signedAt:null},pashto:{reviewer:null,signedAt:null},phonics:{reviewer:null,signedAt:null}}});
 added++;
}
manifest.recordingCount=manifest.recordings.length;
await writeFile(file,JSON.stringify(manifest,null,2)+'\n');
// Recording list: course clips, then the app's own UI clips, with the artist cue beside each script.
const ui=JSON.parse(await readFile(new URL('src/ustad/firstSteps/uiContent.json',root),'utf8')).audio||[];
// Review and recording columns already filled in (by a reviewer or npm run recordings:add) are kept.
const csvUrl=new URL('docs/beginner-course-phase2/audio-recording-list.csv',root),kept=Object.fromEntries((await readFile(csvUrl,'utf8').then(t=>parseCsv(t).rows).catch(()=>[])).map(r=>[r.ID,r]));
const head=['ID','Language','Kind','Script','Artist cue','Recording notes','Review status','Recording status','File','Reviewer','Signed date'];
const rows=[...manifest.recordings,...ui].map(r=>{const k=kept[r.id]||{};return {ID:r.id,Language:r.language,Kind:r.kind,Script:r.text,'Artist cue':r.artistCue,'Recording notes':r.recordingNotes,'Review status':k['Review status']||r.review?.status||r.reviewStatus||'pending_review','Recording status':k['Recording status']||r.recordingStatus||r.status||'pending_recording',File:k.File||r.file,Reviewer:k.Reviewer,'Signed date':k['Signed date']};});
await writeFile(csvUrl,toCsv(head,rows));
console.log(`Letter-sound cues updated: ${cued}. Slow-blend clips added: ${added}, removed: ${stale} (${blendWords.length} blending words). Total recordings: ${manifest.recordingCount}.`);
