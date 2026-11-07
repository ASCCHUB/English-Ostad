// Pre-records the app's English with a Pakistani English neural voice (Microsoft Azure Speech).
//   1. In .env.local add (never commit or share these):
//        AZURE_SPEECH_KEY=your-key
//        AZURE_SPEECH_REGION=your-region        (for example centralindia or eastus)
//   2. npm run voice:pk -- --dry-run            (counts only, no Azure calls)
//      npm run voice:pk -- --limit=20           (a small test batch)
//      npm run voice:pk                         (everything still missing)
//      npm run voice:pk -- --voice=asad         (male voice; default uzma = female)
//      npm run voice:pk -- --force              (record everything again, e.g. after changing the voice)
//      npm run voice:pk -- --lang=ur            (Urdu help lines with the Pakistani Urdu voice; same key)
// Writes public/audio/en-pk/<id>.mp3 and public/en-pk-voice.json. Lines with no clip keep using the device voice.
// The key is read here only. It is not a VITE_ variable, so it never reaches the app bundle.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {collectSpeech} from './speech-texts.mjs';
// Urdu lines: the Urdu dictionary, course hints, game screen lines and every game question's Urdu instruction.
async function collectUrdu(){
 const {urduLines,urduHints,urduGameUi}=await import('../src/ustad/locales/ur.js');
 const key=t=>String(t||'').replace(/[⁦-⁩]/g,'').replace(/s+/g,' ').trim();
 const texts=new Map(),add=t=>{const k=key(t);if(k&&!texts.has(k))texts.set(k,{key:k,text:k,source:'urdu'});};
 [...Object.values(urduLines),...Object.values(urduHints),...Object.values(urduGameUi)].forEach(add);
 for(const id of ['letter-hunt','sound-safari','feed-animal','number-adventure','fox-apple'])for(const q of JSON.parse(fs.readFileSync(path.join(root,'src/ustad/games/bank',id+'.json'),'utf8')).questions)add(q.instruction.ur?.text);
 return [...texts.values()];
}

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return [k,v??true];}));
const LANG=args.lang==='ur'?'ur':'en';
const VOICES=LANG==='ur'?{uzma:'ur-PK-UzmaNeural',asad:'ur-PK-AsadNeural'}:{uzma:'en-PK-UzmaNeural',asad:'en-PK-AsadNeural'};
const speaker=String(args.voice||'uzma').toLowerCase();
if(!VOICES[speaker])throw Error('Use --voice=uzma or --voice=asad');
const voice=VOICES[speaker],RATE='-8%',FORMAT='audio-16khz-32kbitrate-mono-mp3';
const outDir=path.join(root,LANG==='ur'?'public/audio/ur-pk':'public/audio/en-pk'),manifestPath=path.join(root,LANG==='ur'?'public/ur-pk-voice.json':'public/en-pk-voice.json');

function env(name){
 if(process.env[name])return process.env[name].trim();
 for(const file of ['.env.local','.env']){const p=path.join(root,file);if(!fs.existsSync(p))continue;
  const m=fs.readFileSync(p,'utf8').match(new RegExp(`^\\s*${name}\\s*=\\s*(.+)\\s*$`,'m'));if(m)return m[1].trim().replace(/^["']|["']$/g,'');}
 return '';
}
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
// A single capital letter is a letter name ("A" → "ay", not "uh").
const body=t=>LANG==='en'&&/^[A-Z]$/.test(t)?`<say-as interpret-as="characters">${t}</say-as>`:esc(t);
const ssml=t=>`<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${LANG}-PK"><voice name="${voice}"><prosody rate="${RATE}">${body(t)}</prosody></voice></speak>`;
const fileFor=key=>createHash('sha1').update((LANG==='ur'?'ur|':'')+speaker+'|'+key).digest('hex').slice(0,14)+'.mp3';

const lines=LANG==='ur'?await collectUrdu():await collectSpeech();
const old=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):{clips:{}};
const sameVoice=old.voice===voice&&!args.force;
const clips=sameVoice?{...old.clips}:{};
let todo=lines.filter(l=>!clips[l.key]||!fs.existsSync(path.join(outDir,clips[l.key])));
if(args.limit)todo=todo.slice(0,Number(args.limit));
const chars=todo.reduce((n,l)=>n+l.text.length,0);
console.log(`${lines.length} ${LANG==='ur'?'Urdu':'English'} lines in the app; ${lines.length-todo.length} already recorded; ${todo.length} to record (${chars} characters) with ${voice}.`);
if(args['dry-run'])process.exit(0);

const key=env('AZURE_SPEECH_KEY'),region=env('AZURE_SPEECH_REGION');
if(!key||!region){console.error('Add AZURE_SPEECH_KEY and AZURE_SPEECH_REGION to .env.local first (see the top of this file).');process.exit(1);}
fs.mkdirSync(outDir,{recursive:true});
const save=()=>fs.writeFileSync(manifestPath,JSON.stringify({speaker:speaker==='uzma'?'Uzma':'Asad',voice,rate:RATE,format:FORMAT,made:new Date().toISOString().slice(0,10),clips},null,0)+'\n');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function record(line){
 for(let attempt=0;attempt<6;attempt++){
  const res=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{method:'POST',headers:{'Ocp-Apim-Subscription-Key':key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':FORMAT,'User-Agent':'english-ustad-voice-builder'},body:ssml(line.text)});
  if(res.ok){const data=Buffer.from(await res.arrayBuffer());if(data.length<500)throw Error('Empty audio for: '+line.text);const file=fileFor(line.key);fs.writeFileSync(path.join(outDir,file),data);clips[line.key]=file;return;}
  if(res.status===401||res.status===403)throw Error('Azure refused the key or region (HTTP '+res.status+'). Check AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.');
  if(res.status===429||res.status>=500){await wait(2000*(attempt+1));continue;}
  throw Error(`HTTP ${res.status} for "${line.text}": ${(await res.text()).slice(0,200)}`);
 }
 throw Error('Azure kept refusing: '+line.text);
}
let done=0,failed=0;const queue=[...todo];
async function worker(){while(queue.length){const line=queue.shift();try{await record(line);}catch(e){if(/refused the key/.test(e.message))throw e;failed++;console.error(e.message);}if(++done%100===0){save();console.log(`${done} / ${todo.length}`);}}}
try{await Promise.all(Array.from({length:4},worker));}finally{save();}
console.log(`Done: ${done-failed} recorded, ${failed} failed. Manifest: public/en-pk-voice.json. Rebuild the app to include them.`);
