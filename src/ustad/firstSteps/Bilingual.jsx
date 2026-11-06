import {useState} from 'react';
import {useAudio} from '../soundEngine.js';
// English first (left-to-right, on the left); the Pashto line underneath (right-to-left).
// With "English only" chosen, just the English shows.
export function Bi({en,ps,as:Tag='span',className='',...rest}){
 const {language}=useAudio();
 return <Tag className={`fs-bi ${className}`} {...rest}><span className="fs-en" lang="en" dir="ltr">{en}</span>{language!=='en'&&ps&&<span className="fs-ps" lang="ps" dir="rtl">{ps}</span>}</Tag>;
}
// Optional Pashto help for an English question: hidden until tapped, and absent with "English only".
// onPlay is given only when a recorded Pashto clip exists (never a device Pashto voice).
export function PashtoHelp({ps,onPlay}){
 const {language}=useAudio(),[open,setOpen]=useState(false);
 if(language==='en'||!ps)return null;
 return <span className="fs-ps-help">{open?<span className="fs-ps" lang="ps" dir="rtl">{ps}</span>:<button onClick={()=>{setOpen(true);onPlay?.();}}>پښتو مدد</button>}</span>;
}
