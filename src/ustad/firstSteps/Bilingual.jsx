import {useState} from 'react';
import {useAudio,canSpeakUrdu,speakUrdu} from '../soundEngine.js';
import {urdu,urduHints as hintUrdu} from '../locales/ur.js';
import {support} from '../supportCopy.js';
import './urdu.css';
// English first (left-to-right, on the left); the help line underneath (right-to-left):
// Pashto by default, Urdu when the learner chose Urdu (both with "All languages"). "English only" shows just English.
// Urdu comes from locales/ur.js (drafts) or the app's support dictionary. speak adds a 🔊 Urdu button:
// use it only where the line is not inside another button (for example instructions).
const URDU=new Set(['ur','rur','all']);
export function urduFor(en,ur){return ur||urdu(en)||support(en)?.ur||null;}
export function Bi({en,ps,ur,speak=false,as:Tag='span',className='',...rest}){
 const {language}=useAudio();
 const showUr=URDU.has(language),showPs=language!=='en'&&!['ur','rur'].includes(language);
 const urText=showUr?urduFor(en,ur):null;
 return <Tag className={`fs-bi ${className}`} {...rest}><span className="fs-en" lang="en" dir="ltr">{en}</span>{showPs&&ps&&<span className="fs-ps" lang="ps" dir="rtl">{ps}</span>}{urText&&<span className="fs-ps fs-ur" lang="ur" dir="rtl">{urText}{speak&&<UrduSpeaker text={urText}/>}</span>}</Tag>;
}
// Speaks an Urdu line: a recorded Pakistani Urdu clip, or the device's Urdu voice. Hidden when neither exists.
export function UrduSpeaker({text}){
 useAudio();// re-render when voices or recordings load
 if(!text||!canSpeakUrdu(text))return null;
 return <button type="button" className="fs-ur-speak" onClick={e=>{e.stopPropagation();speakUrdu(text);}} aria-label="اردو میں سنیں" title="اردو میں سنیں">🔊</button>;
}
// Optional help for an English question: hidden until tapped, and absent with "English only".
// onPlay is given only when a recorded Pashto clip exists (never a device Pashto voice).
export function PashtoHelp({ps,onPlay}){
 const {language}=useAudio(),[open,setOpen]=useState(false);
 if(language==='en'||!ps)return null;
 if(['ur','rur'].includes(language)){const ur=hintUrdu[ps];if(!ur)return null;
  return <span className="fs-ps-help">{open?<span className="fs-ps fs-ur" lang="ur" dir="rtl">{ur}<UrduSpeaker text={ur}/></span>:<button onClick={()=>setOpen(true)}>اردو مدد</button>}</span>;}
 return <span className="fs-ps-help">{open?<span className="fs-ps" lang="ps" dir="rtl">{ps}</span>:<button onClick={()=>{setOpen(true);onPlay?.();}}>پښتو مدد</button>}</span>;
}
