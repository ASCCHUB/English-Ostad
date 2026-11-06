import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {course,gpcs,recordings} from './tasks.js';
import {playRecording,stopSpeech} from '../soundEngine.js';
import {readyRecording,loadRecordingManifest,playCourseClip} from './audio.js';
import './firstSteps.css';
import './homeRecorder.css';
import {loadHomeRecordings,homeRecording,saveHomeRecording,deleteHomeRecording,subscribeHomeRecordings,homeRecordingsVersion} from './homeRecordings.js';
// Letter sounds and slow blends: bundled (studio or teacher) files come first and work
// on every device and offline; a grown-up's home recording fills in only where no bundled one exists.
// One row per sound, labelled with every spelling the course uses for it (s, ss).
const soundClips=Object.values(Object.values(gpcs).filter(g=>recordings[g.recordingId]).reduce((rows,g)=>{const row=rows[g.recordingId]||={id:g.recordingId,spellings:[],clip:recordings[g.recordingId]};if(!row.spellings.includes(g.spelling))row.spellings.push(g.spelling);return rows;},{})).map(r=>({...r,label:r.spellings.sort((a,b)=>a.length-b.length).join(', ')}));
const allBlends=Object.values(recordings).filter(r=>r.kind==='blend_stretched').map(r=>({id:r.id,label:r.text,clip:r}));
// Levels 1–2 slow blends are required before release; Levels 3–5 are optional (without one, Blend slowly is hidden).
const earlyWords=new Set(course.lessons.filter(l=>l.level<=2).flatMap(l=>l.activities.filter(a=>a.type==='BlendWord').flatMap(a=>a.content.wordIds||[])));
const blendClips=allBlends.filter(x=>earlyWords.has(x.clip.wordId)),optionalBlends=allBlends.filter(x=>!earlyWords.has(x.clip.wordId));
const recorded=id=>readyRecording(id)||!!homeRecording(id),done=list=>list.filter(x=>recorded(x.id)).length;
function useRecordings(){useSyncExternalStore(subscribeHomeRecordings,homeRecordingsVersion,homeRecordingsVersion);useEffect(()=>{loadRecordingManifest();loadHomeRecordings();},[]);}
function ClipRow({item,busy,setBusy}){
 const [error,setError]=useState(''),live=useRef(null),bundled=readyRecording(item.id),has=!!homeRecording(item.id),recording=busy===item.id;
 useEffect(()=>()=>{const r=live.current;if(r?.recorder.state==='recording')r.recorder.stop();},[]);
 async function record(){
  setError('');stopSpeech();
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:true}),recorder=new MediaRecorder(stream),chunks=[];
   live.current={recorder,timer:setTimeout(()=>recorder.state==='recording'&&recorder.stop(),item.clip.kind==='blend_stretched'?8000:4000)};
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onstop=async()=>{clearTimeout(live.current?.timer);stream.getTracks().forEach(t=>t.stop());setBusy('');if(chunks.length)try{await saveHomeRecording(item.id,new Blob(chunks,{type:recorder.mimeType}));}catch{setError('Could not save on this device.');}};
   recorder.start();setBusy(item.id);
  }catch{setError('Microphone is unavailable or permission was declined.');setBusy('');}
 }
 // A bundled recording always wins, so recording over it would never be heard.
 if(bundled)return <li className="home-recorder-row"><strong dir="ltr">{item.label}</strong><span>Built-in recording ✓</span><span className="button-row"><button className="secondary" onClick={()=>playCourseClip(item.id)}>▶ Play</button></span></li>;
 return <li className="home-recorder-row"><strong dir="ltr">{item.label}</strong><span>{item.clip.artistCue||item.clip.recordingNotes}</span><span className="button-row">
  <button className="secondary" disabled={!!busy&&!recording} onClick={recording?()=>live.current?.recorder.stop():record}>{recording?'■ Stop':has?'● Record again':'● Record'}</button>
  {has&&<><button className="secondary" disabled={!!busy} onClick={()=>playRecording(homeRecording(item.id),{owner:'home-recorder',lang:item.clip.language})}>▶ Play</button><button className="text-button" disabled={!!busy} onClick={()=>deleteHomeRecording(item.id)}>Delete</button></>}
 </span>{error&&<small role="alert">{error}</small>}</li>;
}
export default function HomeRecorder(){
 useRecordings();const [busy,setBusy]=useState('');
 const supported=typeof navigator!=='undefined'&&!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined';
 const recordedCount=done(soundClips)+done(blendClips),total=soundClips.length+blendClips.length;
 // Small status line: the device voice is only a stand-in until recordings exist (required before release).
 return <><p className="home-recorder-status" role="status">Letter sounds: {recordedCount} of {total} recorded.{recordedCount<total&&' Until then the device voice stands in. Recordings are required before release.'}</p><details className="home-recorder"><summary>Record the letter sounds yourself ({done(soundClips)+done(blendClips)} of {soundClips.length+blendClips.length} recorded)</summary>
  <p>Optional. The device voice already says every letter sound: held sounds are stretched (“sss”, “mmm”) and the others are said through a word that starts with the sound (“tap”, “apple”). A real voice is clearer, so you can record any sound here: once, in a quiet room, following the hint. Built-in (studio or teacher) recordings, when added, come first and work offline on every device. Say the sound only: “sss”, not “suh” or “ess”. Your clips stay on this device. They are not uploaded and not included in backups. A built-in recording always replaces yours.</p>
  {supported?<><h3>Letter sounds ({done(soundClips)} of {soundClips.length})</h3><ul>{soundClips.map(item=><ClipRow key={item.id} item={item} busy={busy} setBusy={setBusy}/>)}</ul>
   <h3>Slow blends, Levels 1–2 ({done(blendClips)} of {blendClips.length})</h3><p>Slide the sounds together slowly in one breath, then stop. The app says the whole word separately.</p><ul>{blendClips.map(item=><ClipRow key={item.id} item={item} busy={busy} setBusy={setBusy}/>)}</ul>
   <h3>Slow blends, Levels 3–5 (optional: {done(optionalBlends)} of {optionalBlends.length})</h3><p>Not needed before release. Each one adds a Blend slowly button for that word.</p><ul>{optionalBlends.map(item=><ClipRow key={item.id} item={item} busy={busy} setBusy={setBusy}/>)}</ul></>
  :<p>This browser cannot record. Try Chrome or Edge.</p>}
 </details></>;
}
