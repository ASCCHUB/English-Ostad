// Collects the English lines the app speaks, so they can be pre-recorded with a Pakistani English voice.
// Used by scripts/make-pk-voice.mjs. Run alone to see counts: node scripts/speech-texts.mjs
// Never includes pure letter sounds (phonemes): those must be human recordings (docs/AUDIO.md).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {speechKey} from '../src/ustad/speechKey.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export async function collectSpeech(){
 const texts=new Map();// key → {text, source}
 const add=(text,source)=>{if(typeof text!=='string')return;const t=text.replace(/\s+/g,' ').trim();if(!t||t.length>400||/\/[a-zæɪɒʌʃθðŋ:ː]+\//i.test(t))return;
  for(const part of splitSentences(t)){const k=speechKey(part);if(k&&!texts.has(k))texts.set(k,{text:part,source});}
  const k=speechKey(t);if(k&&!texts.has(k))texts.set(k,{text:t,source});};
 // 1. Course (First Steps): words, sentences, instructions and letter names spoken by the device voice.
 const {recordings}=await import('../src/ustad/firstSteps/tasks.js');
 for(const r of Object.values(recordings))if(r.language==='en-GB'&&['speech','letter_name'].includes(r.kind))add(r.text,'course');
 // 2. Word library, phrases and readings.
 const content=await import('../src/ustad/content.js');
 for(const w of content.words)add(w.en,'words');
 for(const p of content.phrases||[])add(p.en,'phrases');
 for(const r of content.readings||[]){add(r.en,'readings');for(const s of r.sentences||[])add(s.en||s,'readings');}
 // 3. Games: instructions, hints, feedback and every English learning word.
 for(const id of ['letter-hunt','sound-safari','feed-animal','number-adventure','fox-apple']){
  const bank=JSON.parse(fs.readFileSync(path.join(root,'src/ustad/games/bank',id+'.json'),'utf8'));
  for(const q of bank.questions){add(q.say,'games');add(q.hint,'games');add(q.feedback,'games');add(q.prompt?.word,'games');add(q.prompt?.wordAudio,'games');add(q.prompt?.sound?.example,'games');add(q.prompt?.food?.label,'games');add(q.blendWord,'games');
   for(const o of q.options){if(o.label&&!o.sound)add(o.label,'games');if(o.text&&!o.sound&&o.text.length>1)add(o.text.replace(/\.$/,''),'games');}
   for(const a of q.prompt?.animals||[])add(a.id,'games');}
 }
 // Fixed lines the games and app say.
 for(const t of ["Let's try together.",'Watch:','Hello! Let’s learn English together. A, B, C. Apple, ball, cat.',...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>'The letter '+l)])add(t,'app');
 // 4. Manual additions (one line each).
 const extra=path.join(root,'scripts/speech-extra.txt');
 if(fs.existsSync(extra))for(const line of fs.readFileSync(extra,'utf8').split(/\r?\n/))if(line.trim()&&!line.startsWith('#'))add(line,'extra');
 return [...texts.entries()].map(([key,v])=>({key,...v}));
}
// "Let's try together. A has two lines." → two clips, so lines built from parts still find recordings.
export function splitSentences(t){return t.split(/(?<=[.!?])\s+(?=[A-Z“"'‘(])/).map(s=>s.trim()).filter(Boolean);}

if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const list=await collectSpeech(),by={};for(const t of list)by[t.source]=(by[t.source]||0)+1;
 console.log(`${list.length} lines, ${list.reduce((n,t)=>n+t.text.length,0)} characters`,by);
}
