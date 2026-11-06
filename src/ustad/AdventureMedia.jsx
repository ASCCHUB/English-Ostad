import {useEffect,useRef,useState} from 'react';
export function NarrationControls({narration,text}){return <div className="adventure-narration">{narration.available?<><button className="secondary" onClick={()=>narration.play(text)}>{narration.status==='idle'?'▶ Listen':'↻ Replay'}</button><button className="secondary" disabled={narration.status==='idle'} onClick={narration.pause}>{narration.status==='paused'?'▶ Resume':'Ⅱ Pause'}</button><button className="text-button" disabled={narration.status==='idle'} onClick={narration.stop}>Stop audio</button></>:<p className="muted">{!narration.available?'Read the captions to join in. English audio needs an enabled, installed device voice.':''}</p>}{narration.error&&<p role="status">{narration.error}</p>}</div>;}
export function VoiceRecorder({allowed=false}){
 const [status,setStatus]=useState('idle'),[url,setUrl]=useState(''),[error,setError]=useState('');
 const resources=useRef({stream:null,recorder:null,url:'',timer:null,alive:true});
 useEffect(()=>{const r=resources.current;r.alive=true;return()=>{r.alive=false;clearTimeout(r.timer);if(r.recorder?.state==='recording')r.recorder.stop();r.stream?.getTracks().forEach(t=>t.stop());if(r.url)URL.revokeObjectURL(r.url);};},[]);
 function stop(){const r=resources.current;if(r.recorder?.state==='recording')r.recorder.stop();clearTimeout(r.timer);r.stream?.getTracks().forEach(t=>t.stop());}
 async function record(){
  const r=resources.current;if(status==='requesting'||status==='recording')return;setError('');setStatus('requesting');
  try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});if(!r.alive){stream.getTracks().forEach(t=>t.stop());return;}r.stream=stream;const chunks=[];const recorder=new MediaRecorder(stream);r.recorder=recorder;
   recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(!r.alive)return;const next=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType}));if(r.url)URL.revokeObjectURL(r.url);r.url=next;setUrl(next);setStatus('idle');};
   recorder.onerror=()=>{stream.getTracks().forEach(t=>t.stop());if(r.alive){setError('Recording stopped. You can skip and repeat aloud.');setStatus('idle');}};
   recorder.start();setStatus('recording');r.timer=setTimeout(stop,30000);
  }catch{r.stream?.getTracks().forEach(t=>t.stop());if(r.alive){setError('Microphone is unavailable or permission was declined. You can still listen and repeat.');setStatus('idle');}}
 }
 function discard(){stop();if(resources.current.url)URL.revokeObjectURL(resources.current.url);resources.current.url='';setUrl('');}
 const supported=typeof navigator!=='undefined'&&!!navigator.mediaDevices?.getUserMedia&&typeof MediaRecorder!=='undefined';
 return <section className="voice-recorder"><h3>Listen, repeat, hear yourself</h3><p>Say the sentence aloud. Recording is optional and is never scored.</p>{allowed&&supported?<><p>Ask your grown-up before allowing the microphone. A clip lasts up to 30 seconds, stays in this page and is discarded when you leave.</p><div className="button-row"><button className="secondary" disabled={status==='requesting'} onClick={status==='recording'?stop:record}>{status==='recording'?'■ Stop recording':status==='requesting'?'Waiting for permission…':'● Record my voice'}</button><button className="text-button" disabled={status==='requesting'} onClick={()=>{discard();setError('You can continue without recording.');}}>Skip / discard</button></div>{url&&<audio controls src={url} aria-label="Play my voice recording"/>}</>:<p className="muted">{!allowed?'A grown-up can enable optional recording in parent settings. For now, repeat aloud.':'This browser does not support recording. Repeat aloud and continue.'}</p>}{error&&<p role="status">{error}</p>}</section>;
}
