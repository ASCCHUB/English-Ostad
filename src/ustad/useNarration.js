import {useEffect,useId,useState} from 'react';
import {speak,stopSpeech,pauseSpeech,resumeSpeech,useAudio,getSnapshot} from './soundEngine.js';
// Narration for one screen, played through the shared sound channel so it never overlaps other audio.
export function useNarration({enabled=true}={}){
 const owner=useId(),audio=useAudio(),[word,setWord]=useState(-1),[error,setError]=useState(''),[currentText,setCurrentText]=useState('');
 const mine=audio.speaking?.owner===owner,status=mine?(audio.paused?'paused':'playing'):'idle';
 useEffect(()=>()=>{if(getSnapshot().speaking?.owner===owner)stopSpeech();},[owner]);
 useEffect(()=>{if(!enabled&&getSnapshot().speaking?.owner===owner)stopSpeech();},[enabled,owner]);
 useEffect(()=>{if(!mine)setWord(-1);},[mine]);
 function play(text){
  if(!enabled)return;
  setError('');setWord(-1);setCurrentText(text);
  const starts=[...text.matchAll(/\S+/g)].map(m=>m.index);
  speak(text,{owner,kind:'narration',rate:.85,onBoundary:i=>setWord(starts.findLastIndex(s=>s<=i))}).then(result=>{if(result==='error')setError('Audio could not play. You can read the captions and continue.');});
 }
 function stop(){if(getSnapshot().speaking?.owner===owner)stopSpeech();setWord(-1);}
 function pause(){if(status==='playing')pauseSpeech();else if(status==='paused')resumeSpeech();}
 return {play,pause,stop,status,word,error,currentText,available:enabled&&audio.canSpeak};
}
