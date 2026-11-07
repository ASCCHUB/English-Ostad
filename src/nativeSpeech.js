// Inside the Android app the WebView has no speechSynthesis, so English words would be silent.
// This gives the app the same small speechSynthesis API, spoken by the phone's own text-to-speech
// (Capacitor plugin). It must be the first import in main.jsx. In a browser it does nothing.
// The phone's installed English voices are listed, so soundEngine.js can choose the clearest one for
// learners in Pakistan: Pakistani English (en-PK) first, then Indian English (en-IN), then others.
// Pashto is never spoken by a device voice: the app only plays Lower Dir recordings for Pashto.
import {Capacitor} from '@capacitor/core';
import {TextToSpeech} from '@capacitor-community/text-to-speech';

const regionName={PK:'Pakistan',IN:'India',GB:'UK',US:'US',AU:'Australia',NG:'Nigeria',ZA:'South Africa',IE:'Ireland',CA:'Canada'};
// Android names voices like "en-in-x-ena-local"; show "English (India) 1 · offline" instead.
function friendly(list){
 const count={};
 return list.map(v=>{const region=(v.lang.split(/[-_]/)[1]||'').toUpperCase(),n=(count[v.lang]=(count[v.lang]||0)+1);
  const where=/network/i.test(v.name)?'online':'offline';
  const language=/^ur/i.test(v.lang)?'Urdu':'English';
  return {...v,name:`${language} (${regionName[region]||region||'other'}) ${n} · ${where}`,nativeName:v.name};});
}

if(typeof window!=='undefined'&&Capacitor.isNativePlatform()&&!('speechSynthesis' in window)){
 let voices=[{name:'Phone English voice',lang:'en-US',localService:true,default:true,voiceURI:'native-en-US',index:undefined}];
 let fallbackLang='en-US';
 const listeners={};
 let current=null;
 const done=(u,event,detail={})=>{if(current!==u)return;current=null;synth.speaking=false;u[event]?.(detail);};
 const synth={
  speaking:false,pending:false,paused:false,onvoiceschanged:null,
  getVoices:()=>voices,
  speak(u){
   if(current)synth.cancel();
   current=u;synth.speaking=true;u.onstart?.({});
   const v=u.voice&&voices.find(x=>x.name===u.voice.name);
   const options={text:u.text,lang:v?.lang||fallbackLang,rate:u.rate||1,pitch:u.pitch||1,volume:1,category:'playback'};
   if(Number.isInteger(v?.index))options.voice=v.index;
   TextToSpeech.speak(options).then(()=>done(u,'onend'),()=>done(u,'onerror',{error:'synthesis-failed'}));
  },
  cancel(){const u=current;if(!u)return;current=null;synth.speaking=false;TextToSpeech.stop().catch(()=>{});u.onerror?.({error:'canceled'});},
  pause(){},resume(){},
  addEventListener(type,fn){(listeners[type]||=[]).push(fn);},
  removeEventListener(type,fn){listeners[type]=(listeners[type]||[]).filter(f=>f!==fn);}
 };
 window.speechSynthesis=synth;
 window.SpeechSynthesisUtterance=class{constructor(text=''){Object.assign(this,{text,lang:'en-US',rate:1,pitch:1,volume:1,voice:null});}};
 // Load the phone's real voices. "voice" in TextToSpeech.speak is the index in this full list.
 (async()=>{
  try{
   for(const lang of ['en-PK','en-IN']){const {supported}=await TextToSpeech.isLanguageSupported({lang});if(supported){fallbackLang=lang;break;}}
   const {voices:all}=await TextToSpeech.getSupportedVoices();
   const english=(all||[]).map((v,index)=>({...v,index,lang:String(v.lang||'').replace('_','-')})).filter(v=>/^(en|ur)(-|$)/i.test(v.lang));// English, and Urdu for Urdu help
   if(english.length)voices=friendly(english);// soundEngine keeps English for English and uses Urdu voices only for Urdu
   else voices=[{...voices[0],lang:fallbackLang}];
  }catch{/* Keep the single default voice. */}
  synth.onvoiceschanged?.();(listeners.voiceschanged||[]).forEach(fn=>fn());
 })();
}
// Opens the phone's settings to download more voices (for example English (India)). Only in the Android app.
export function canInstallVoices(){return typeof window!=='undefined'&&Capacitor.isNativePlatform();}
export function installVoices(){return TextToSpeech.openInstall().catch(()=>{});}
