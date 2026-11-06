import locale from './locales/ps.js';
import {convertPashto} from './pashtoStyle.js';
// All Pashto the app shows comes from locales/ps.js, keyed by the English text.
// Text built on the fly (names, numbers, words in a sentence) gets the same style rules.
const entries=locale.entries,styled=new Map();
export function pashtoEntry(en){return en?entries[en]:undefined;}
export function withPashto(item){
 if(!item?.ps)return item;
 const entry=entries[item.en];
 if(entry)return {...item,ps:entry.ps,rps:entry.rps||item.rps};
 const key=item.ps+'\u0000'+(item.rps||'')+'\u0000'+(item.en||'');
 if(!styled.has(key))styled.set(key,convertPashto(item.ps,item.rps,item.en));
 const {ps,rps}=styled.get(key);
 return {...item,ps,rps};
}
// A recording plays only once it is marked ready; device Pashto voices are never used.
export function pashtoAudio(en){const entry=entries[en];return entry?.audio==='ready'?`/audio/ps/${entry.id}.mp3`:null;}
export function pashtoAudioStatus(en){const entry=entries[en];return entry?(entry.audio==='ready'?'ready':'pending'):'pending';}
