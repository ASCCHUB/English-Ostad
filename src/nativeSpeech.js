// Inside the Android app the WebView has no speechSynthesis, so English words would be silent.
// This gives the app the same small speechSynthesis API, spoken by the phone's own text-to-speech
// (Capacitor plugin). It must be the first import in main.jsx. In a browser it does nothing.
// Pashto is never spoken by a device voice: the app only plays Lower Dir recordings for Pashto.
import {Capacitor} from '@capacitor/core';
import {TextToSpeech} from '@capacitor-community/text-to-speech';

if(typeof window!=='undefined'&&Capacitor.isNativePlatform()&&!('speechSynthesis' in window)){
 // One rhotic English voice (the course's chosen accent), spoken by the phone.
 const voices=[{name:'Phone English voice',lang:'en-US',localService:true,default:true,voiceURI:'native-en-US'}];
 const listeners={};
 let current=null;
 const done=(u,event,detail={})=>{if(current!==u)return;current=null;synth.speaking=false;u[event]?.(detail);};
 const synth={
  speaking:false,pending:false,paused:false,onvoiceschanged:null,
  getVoices:()=>voices,
  speak(u){
   if(current)synth.cancel();
   current=u;synth.speaking=true;u.onstart?.({});
   TextToSpeech.speak({text:u.text,lang:'en-US',rate:u.rate||1,pitch:u.pitch||1,volume:1,category:'playback'})
    .then(()=>done(u,'onend'),()=>done(u,'onerror',{error:'synthesis-failed'}));
  },
  cancel(){const u=current;if(!u)return;current=null;synth.speaking=false;TextToSpeech.stop().catch(()=>{});u.onerror?.({error:'canceled'});},
  pause(){},resume(){},
  addEventListener(type,fn){(listeners[type]||=[]).push(fn);},
  removeEventListener(type,fn){listeners[type]=(listeners[type]||[]).filter(f=>f!==fn);}
 };
 window.speechSynthesis=synth;
 window.SpeechSynthesisUtterance=class{constructor(text=''){Object.assign(this,{text,lang:'en-US',rate:1,pitch:1,volume:1,voice:null});}};
}
