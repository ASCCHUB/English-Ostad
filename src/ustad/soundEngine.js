import {useSyncExternalStore} from 'react';
import {pashtoAudio} from './pashto.js';
// One sound channel for the whole app. A new word stops the last one, background music steps
// aside while anyone is speaking, and celebration sounds wait until narration has finished.
// Chimes and music are synthesised with Web Audio, so no sound files are needed. Pashto plays
// only Lower Dir recordings listed as ready in locales/ps.js: device Pashto voices are never
// used, because they speak other accents. Without a recording the Pashto audio is "pending".
const browser=typeof window!=='undefined';
const synth=()=>browser?window.speechSynthesis:undefined;
// language stays '' until the app reports the learner's choice; '' never hides Pashto.
// Two speech channels: voice (English) and pashtoAudio (Pashto), each switchable; muted silences everything.
const prefs={voice:true,pashtoAudio:true,effects:true,music:false,muted:false,voiceName:'',voiceSpeed:'normal',autoInstructions:false,language:''};
const isPashtoLang=lang=>/^ps(?:[-_]|$)/i.test(String(lang||''));
const channelOn=lang=>!prefs.muted&&(isPashtoLang(lang)?prefs.pashtoAudio:prefs.voice);
let state={speaking:null,paused:false,issue:null,voices:[],canSpeak:false,autoInstructions:false,language:''};
const listeners=new Set();
function emit(patch){state={...state,...patch};state.canSpeak=prefs.voice&&!prefs.muted&&state.voices.length>0;state.autoInstructions=prefs.autoInstructions&&prefs.voice&&!prefs.muted;state.language=prefs.language;listeners.forEach(fn=>fn());}
export function subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function getSnapshot(){return state;}
export function useAudio(){return useSyncExternalStore(subscribe,getSnapshot,getSnapshot);}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

// Voices: the learner's chosen voice first; otherwise a Pakistani English voice (en-PK, e.g. Edge's Uzma or Asad)
// so children hear a familiar accent, then Indian English (en-IN), then natural British and other English voices.
const failedVoices=new Set();
// iPhone: Enhanced/Premium voices sound far better; Apple's novelty voices (Bubbles, Zarvox …) are never chosen.
// The course accent is rhotic, so US English ranks just above British when no Pakistani or Indian voice exists.
const noveltyVoice=/albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy|grandma|grandpa|eddy|flo|reed|rocko|sandy|shelley/i;
const englishRank=v=>(noveltyVoice.test(v.name)?-100:0)+(/^en[-_]PK/i.test(v.lang)||/pakistan/i.test(v.name)?20:0)+(/^en[-_]IN/i.test(v.lang)||/india/i.test(v.name)?12:0)+(/enhanced|premium/i.test(v.name)?6:0)+(/natural|neural|online/i.test(v.name)?4:0)+(/^en[-_]US/i.test(v.lang)?3:/^en[-_]GB/i.test(v.lang)?2:/^en[-_](AU|IE)/i.test(v.lang)?1:0)+(v.localService?.5:0);
const isEnglish=v=>/^en(?:[-_]|$)/i.test(v.lang);
// Fallback: if a device only has novelty voices, use them rather than nothing.
function englishVoices(){const all=(synth()?.getVoices()||[]).filter(isEnglish),good=all.filter(v=>!noveltyVoice.test(v.name));return (good.length?good:all).sort((a,b)=>englishRank(b)-englishRank(a));}
function loadVoices(){emit({voices:englishVoices().map(v=>({name:v.name,lang:v.lang}))});}
function voiceFor(name=prefs.voiceName){const list=englishVoices().filter(v=>!failedVoices.has(v.name));return list.find(v=>v.name===name)||list[0];}
// Voices load late in some browsers; wait briefly only while the list is still empty.
async function waitForVoice(name){for(let i=0;i<15&&synth()&&!synth().getVoices().length;i++)await wait(100);return voiceFor(name);}
// The ranked list the settings page shows; the first one is what "Recommended" plays.
export function rankedVoiceNames(){return englishVoices().map(v=>v.name);}

// Speech. Every request gets a number; anything older than the latest request is dropped.
let seq=0,finishCurrent=null,clip=null,effectUntil=0;
export function stopSpeech(){
 seq++;const finish=finishCurrent;finishCurrent=null;
 if(clip){clip.pause();clip=null;}
 if(synth()?.speaking||synth()?.pending)synth().cancel();
 finish?.('stopped');
 if(state.speaking||state.paused)emit({speaking:null,paused:false});
}
export function pauseSpeech(){if(!state.speaking)return;if(clip)clip.pause();else synth()?.pause();emit({paused:true});}
export function resumeSpeech(){if(!state.paused)return;if(clip)clip.play().catch(()=>{});else synth()?.resume();emit({paused:false});}
const messages={
 off:'Voice is turned off. Turn it on in Sounds and voice.',
 offPashto:'Pashto audio is turned off. Turn it on in Sounds and voice.',
 unavailable:'This device has no English voice yet. Read the word and keep going.',
 pending:'Pashto audio is not ready yet. Please read the text.',
 error:'The sound did not play. Try again, or keep learning by reading.'
};
function issue(type,retry){emit({issue:{type,message:messages[type],retry}});}
export function clearIssue(){if(state.issue)emit({issue:null});}
// Returns a promise of 'ended', 'stopped', 'off', 'unavailable', 'pending' (no Pashto recording) or 'error'.
// quiet: no on-screen notice (used for praise, which is also shown as text).
// voiceName: try a particular English voice (the settings page's "Try" buttons).
export function speak(text,{lang='en',rate=.88,owner='',kind='word',onBoundary,quiet=false,clipKey,voiceName}={}){
 text=String(text??'').trim();
 if(!text||!browser)return Promise.resolve('stopped');
 const again=()=>speak(text,{lang,rate,owner,kind,onBoundary,clipKey});
 if(!channelOn(lang)){if(!quiet)issue(isPashtoLang(lang)&&!prefs.muted?'offPashto':'off');return Promise.resolve('off');}
 const recording=lang==='ps'?pashtoAudio(clipKey||text):null;
 if(lang==='ps'&&!recording){if(!quiet)issue('pending');return Promise.resolve('pending');}
 const busy=!!state.speaking;stopSpeech();const id=seq;
 if(!quiet)clearIssue();
 return (async()=>{
  // Let a chime finish, and give Chrome a moment after cancelling before it speaks again.
  const delay=Math.max(busy?60:0,Math.min(1200,effectUntil-performance.now()));if(delay>0)await wait(delay);
  if(id!==seq)return 'stopped';
  if(recording)return playClip(recording,{id,text,owner,kind,quiet,again});
  const voice=await waitForVoice(voiceName);if(id!==seq)return 'stopped';
  if(!voice){if(!quiet)issue('unavailable',again);return 'unavailable';}
  return utter(text,voice,{id,rate,owner,kind,onBoundary,quiet,again,lang});
 })();
}
function utter(text,voice,{id,rate,owner,kind,onBoundary,quiet,again,lang}){
 return new Promise(resolve=>{
  const u=new SpeechSynthesisUtterance(text);u.voice=voice;u.lang=voice.lang;u.rate=rate*(prefs.voiceSpeed==='slow'?.75:1);u.pitch=1.05;
  let settled=false;
  const settle=result=>{if(settled)return;settled=true;clearTimeout(guard);if(finishCurrent===settle)finishCurrent=null;if(id===seq&&state.speaking)emit({speaking:null,paused:false});resolve(result);};
  finishCurrent=settle;
  // Some browsers never fire onend; stop waiting after a generous limit.
  const guard=setTimeout(()=>{if(id===seq)synth()?.cancel();settle('error');},6000+text.length*160/rate);
  u.onstart=()=>{if(id===seq)emit({speaking:{owner,text,kind,lang},paused:false});};
  u.onboundary=e=>{if(id===seq&&e.name==='word')onBoundary?.(e.charIndex);};
  u.onend=()=>settle('ended');
  u.onerror=e=>{
   if(['canceled','interrupted'].includes(e.error)){settle('stopped');return;}
   // An online voice can fail without internet: try the next voice once.
   if(!voice.localService&&!failedVoices.has(voice.name)&&id===seq){failedVoices.add(voice.name);settled=true;clearTimeout(guard);finishCurrent=null;const next=voiceFor();if(next){utter(text,next,{id,rate,owner,kind,onBoundary,quiet,again,lang}).then(resolve);return;}}
   if(!quiet&&id===seq)issue('error',again);settle('error');
  };
  emit({speaking:{owner,text,kind,lang},paused:false});
  synth().resume();synth().speak(u);
 });
}
function playClip(src,{id,text,owner,kind,quiet,again}){
 return new Promise(resolve=>{
  const audio=mediaElement(src);clip=audio;let settled=false;
  const settle=result=>{if(settled)return;settled=true;if(clip===audio)clip=null;if(finishCurrent===settle)finishCurrent=null;if(id===seq&&state.speaking)emit({speaking:null,paused:false});resolve(result);};
  finishCurrent=settle;
  audio.onended=()=>settle('ended');
  audio.onerror=()=>{if(!quiet&&id===seq)issue('error',again);settle('error');};
  emit({speaking:{owner,text,kind,lang:'ps'},paused:false});
  audio.play().catch(()=>{if(!quiet&&id===seq)issue('error',again);settle('error');});
 });
}
// Reviewed course recordings share the same cancellation/mute owner as speech.
export function playRecording(src,{owner='',text='',lang='en-GB',onTime}={}){
 if(!browser)return Promise.resolve('stopped');
 if(!channelOn(lang))return Promise.resolve('off');
 stopSpeech();const id=seq;
 return new Promise(resolve=>{
  const audio=mediaElement(src);clip=audio;let settled=false;
  const settle=result=>{if(settled)return;settled=true;clearTimeout(guard);if(clip===audio)clip=null;if(finishCurrent===settle)finishCurrent=null;if(id===seq)emit({speaking:null,paused:false});resolve(result);};
  finishCurrent=settle;
  const guard=setTimeout(()=>{audio.pause();settle('error');},120000);
  audio.onplaying=()=>{if(id===seq)emit({speaking:{owner,text,kind:'recording',lang},paused:false});};
  audio.ontimeupdate=()=>{if(id===seq)onTime?.(audio.currentTime*1000);};
  audio.onended=()=>settle('ended');audio.onerror=()=>settle('error');
  audio.play().catch(()=>settle('error'));
 });
}
export function isBusy(){return !!state.speaking||!!synth()?.speaking||!!clip;}

// Web Audio: short chimes and a soft generated lullaby for background music.
let ctx=null,master=null,unlocked=false;
function audioContext(){
 if(!browser)return null;
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
 if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination);}
 if(ctx.state==='suspended')ctx.resume().catch(()=>{});
 return ctx;
}
function tone(freq,start,length,{type='sine',volume=.16,bus=master}={}){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(.0001,start);g.gain.exponentialRampToValueAtTime(volume,start+.02);g.gain.exponentialRampToValueAtTime(.0001,start+length);
 o.connect(g).connect(bus);o.start(start);o.stop(start+length+.05);
}
const effects={
 correct:[.45,t=>{tone(784,t,.18);tone(1047,t+.1,.32);}],
 celebrate:[1.1,t=>{[523,659,784,1047].forEach((f,i)=>{tone(f,t+i*.11,.5,{type:'triangle',volume:.15});tone(f*2,t+i*.11,.25,{volume:.035});});[1568,1760,2093].forEach((f,i)=>tone(f,t+.5+i*.09,.4,{volume:.05}));}]
};
export function playEffect(name){
 if(prefs.muted||!prefs.effects||!effects[name])return false;
 const c=audioContext();if(!c)return false;
 const [length,play]=effects[name];play(c.currentTime+.03);effectUntil=performance.now()+length*1000;
 return true;
}
// Five gentle phrases in C major pentatonic, with a low note every bar.
const NOTES=[262,294,330,392,440,523,587,659];
const PHRASES=[[0,2,4,2,5,4,2,1],[2,4,5,7,5,4,2,4],[4,2,1,0,1,2,4,2],[5,4,2,4,3,1,2,0],[0,4,5,4,2,1,0,0]];
let musicTimer=0,musicBus=null,nextNote=0,step=0;
function scheduleMusic(){
 if(!ctx||!musicBus)return;
 const quiet=isBusy()||document.hidden;
 musicBus.gain.setTargetAtTime(quiet?0:.55,ctx.currentTime,quiet?.06:.8);
 while(nextNote<ctx.currentTime+.6){
  const phrase=PHRASES[Math.floor(step/8)%PHRASES.length],note=NOTES[phrase[step%8]];
  tone(note,nextNote,1.2,{volume:.045,bus:musicBus});
  if(step%4===0)tone(note/2,nextNote,2.4,{type:'triangle',volume:.03,bus:musicBus});
  step++;nextNote+=.6;
 }
}
function startMusic(){
 if(musicTimer||!unlocked)return;const c=audioContext();if(!c)return;
 musicBus=c.createGain();musicBus.gain.value=0;musicBus.connect(master);nextNote=c.currentTime+.2;
 musicTimer=setInterval(scheduleMusic,200);scheduleMusic();
}
function stopMusic(){
 if(!musicTimer)return;clearInterval(musicTimer);musicTimer=0;
 const bus=musicBus;musicBus=null;bus.gain.setTargetAtTime(0,ctx.currentTime,.15);setTimeout(()=>bus.disconnect(),1500);
}
function wantsMusic(){return prefs.music&&!prefs.muted;}

// Browsers only allow sound after the learner interacts with the page.
// iPhone and iPad allow sound only after a tap: the first tap unlocks Web Audio (a silent buffer), one shared
// <audio> element that every clip reuses, and the speech voice (an empty, silent utterance). Later auto-play then works;
// if a device still blocks it, the replay buttons stay on screen.
let media=null,mediaUnlocked=false;
function silentWav(){const b=new ArrayBuffer(46),v=new DataView(b),w=(o,t)=>[...t].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));w(0,'RIFF');v.setUint32(4,38,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,16000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,2,true);return URL.createObjectURL(new Blob([b],{type:'audio/wav'}));}
function mediaElement(src){if(!media){media=new Audio();media.preload='auto';media.setAttribute('playsinline','');}media.onended=media.onerror=media.onplaying=media.ontimeupdate=null;media.pause();media.src=src.startsWith('/audio/')?(import.meta.env?.BASE_URL||'/')+src.slice(1):src;return media;}
function unlock(){unlocked=true;const c=audioContext();
 if(!mediaUnlocked){mediaUnlocked=true;
  try{if(c){const source=c.createBufferSource();source.buffer=c.createBuffer(1,1,22050);source.connect(c.destination);source.start(0);}}catch{/* Web Audio is optional. */}
  try{const a=mediaElement(silentWav());a.play().then(()=>a.pause()).catch(()=>{});}catch{/* Media is optional. */}
  try{if(synth()&&!synth().speaking){const u=new SpeechSynthesisUtterance(' ');u.volume=0;synth().speak(u);}}catch{/* Speech is optional. */}
 }
 if(wantsMusic())startMusic();}
if(browser){
 window.addEventListener('pointerdown',unlock,{passive:true});window.addEventListener('touchend',unlock,{passive:true});window.addEventListener('keydown',unlock);
 if(synth()){loadVoices();synth().addEventListener?.('voiceschanged',loadVoices);}
}
export function configureSound(next){
 Object.assign(prefs,next);
 if(state.speaking&&!channelOn(state.speaking.lang))stopSpeech();
 if(wantsMusic())startMusic();else stopMusic();
 emit({});
}
export function previewVoice(name){return speak('Hello! Let’s learn English together. A, B, C. Apple, ball, cat.',{kind:'sentence',voiceName:name||undefined});}

// A celebration plays once per completion: wait for narration, chime, then say the praise.
const celebrated=new Set();
export function celebrate(key,phrase){
 if(!key||celebrated.has(key))return()=>{};
 let cancelled=false,tries=0,timer;
 const begin=()=>{
  if(cancelled)return;
  if((isBusy()||performance.now()<effectUntil)&&tries++<60){timer=setTimeout(begin,250);return;}
  celebrated.add(key);playEffect('celebrate');speak(phrase,{kind:'praise',rate:.95,quiet:true});
 };
 timer=setTimeout(begin,150);
 return()=>{cancelled=true;clearTimeout(timer);};
}
let completions=0;
export function completionId(){return `done-${Date.now()}-${++completions}`;}
