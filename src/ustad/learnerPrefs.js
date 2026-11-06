import {useEffect,useRef,useSyncExternalStore} from 'react';
import {isBusy} from './soundEngine.js';
// Learner preferences that many screens need without passing props through every level.
// The app sets them from the saved learner settings.
let prefs={autoNext:true};
const listeners=new Set();
export function setLearnerPrefs(next){prefs={...prefs,...next};listeners.forEach(fn=>fn());}
const subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn);},snapshot=()=>prefs;
export function useLearnerPrefs(){return useSyncExternalStore(subscribe,snapshot,snapshot);}
// After a right answer, move on by itself: show the success for a moment, let any spoken
// word finish (up to a few seconds), then call next() once. Tapping Next first still works.
export function useAutoNext(ready,next,delay=1500){
 const {autoNext}=useLearnerPrefs(),latest=useRef(next);latest.current=next;
 useEffect(()=>{
  if(!autoNext||!ready)return;
  let timer,waited=0,done=false;
  const go=()=>{if(done)return;if(isBusy()&&waited<4000){waited+=250;timer=setTimeout(go,250);return;}done=true;latest.current();};
  timer=setTimeout(go,delay);
  return()=>{done=true;clearTimeout(timer);};
 },[autoNext,ready,delay]);
}
