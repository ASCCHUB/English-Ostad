import {useEffect,useId,useRef,useState} from 'react';
import {Icon} from './ExplorerArt.jsx';
import {support,ariaText} from './supportCopy.js';
import {radioKeys,radioProps} from './radioGroup.js';
import {withPashto,pashtoAudioStatus} from './pashto.js';
import {useAudio,speak,celebrate,clearIssue,previewVoice} from './soundEngine.js';
import {canInstallVoices,installVoices} from '../nativeSpeech.js';
import './sound.css';
// Word taps say the English word; the sentence button says the whole sentence; Pashto help is a
// separate, optional button. Everything stays readable when sound is off or unavailable.
const spoken=word=>String(word).replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g,'');
function useSpeaking(owner){const audio=useAudio();return audio.speaking?.owner===owner;}
function useFlash(){const [flash,setFlash]=useState(false);useEffect(()=>{if(!flash)return;const t=setTimeout(()=>setFlash(false),700);return()=>clearTimeout(t);},[flash]);return [flash,()=>setFlash(true)];}
export function HearWord({word,className='',slow=false,onTap,children}){
 const owner=useId(),speaking=useSpeaking(owner),[flash,start]=useFlash(),say=spoken(word);
 if(!say)return <span className={className}>{children??word}</span>;
 return <button type="button" dir="ltr" className={`hear-word ${speaking||flash?'word-speaking':''} ${className}`} aria-label={`Hear ${say}`} onClick={()=>{start();onTap?.();speak(say,{owner,rate:slow?.65:.85});}}>{children??word}<Icon name="sound" size={15} className="hear-word-icon"/></button>;
}
export function TapWords({text,className=''}){return <span className={`tap-words ${className}`} dir="ltr">{String(text).split(/\s+/).filter(Boolean).map((word,i)=><HearWord key={i} word={word}/>)}</span>;}
export function HearSentence({text,label='Hear the sentence',slow=false}){
 const owner=useId(),speaking=useSpeaking(owner);
 return <button type="button" className={`secondary hear-sentence ${speaking?'sentence-speaking':''}`} onClick={()=>speak(text,{owner,kind:'sentence',rate:slow?.65:.85})}><Icon name="sound" size={18}/> {label}</button>;
}
export function TapSentence({text,className=''}){return <div className={`tap-sentence ${className}`}><TapWords text={text}/><HearSentence text={text}/></div>;}
// Notes under Pashto help when its audio cannot play: no recording yet, or the Pashto channel is off.
const NOTES={pending:withPashto(support('Pashto audio is not ready yet. Please read the text.')),off:withPashto(support('Pashto audio is turned off. Turn it on in Sounds and voice.'))};
// Speaker beside a Pashto line: plays its Lower Dir recording, or shows that the audio is pending.
// It appears only where it is not inside another control (a card button, link or label).
export function PashtoSpeaker({en,text}){
 const owner=useId(),speaking=useSpeaking(owner),ready=pashtoAudioStatus(en)==='ready',spot=useRef(null),[free,setFree]=useState(false);
 useEffect(()=>{setFree(!spot.current?.closest('button,a,label,summary,[role=button]'));},[]);
 // No play icon until a Lower Dir recording exists for this line.
 if(!free||!ready)return <span ref={spot} hidden/>;
 return <button type="button" className={`ps-speaker ${ready?'':'ps-speaker-pending'} ${speaking?'sentence-speaking':''}`} data-no-support aria-label={ready?'Hear in Pashto':'Pashto audio pending'} title={ready?'Hear in Pashto':'Pashto audio pending'} onClick={()=>speak(text,{lang:'ps',owner,kind:'help',clipKey:en})}><Icon name="sound" size={15}/></button>;
}
// Optional help in Lower Dir Pashto. English pronunciation stays the word-tap action.
export function PashtoHelp({text,item,language}){
 const owner=useId(),speaking=useSpeaking(owner),[open,setOpen]=useState(false),[note,setNote]=useState(null);
 if(!['ps','rps','all'].includes(language))return null;
 const help=withPashto(item?.ps?item:support(text));if(!help?.ps)return null;
 const key=help.en||text,label=withPashto(support('Pashto help'));
 const recorded=pashtoAudioStatus(key)==='ready';
 // Opens the Pashto meaning; it also plays only when a recording exists.
 async function listen(){setOpen(true);setNote(null);if(!recorded)return;const result=await speak(help.ps,{lang:'ps',owner,kind:'help',clipKey:key,quiet:true});if(result==='off')setNote('off');else if(result==='error')setNote('pending');}
 return <span className="pashto-help" data-no-support><button type="button" className={`pashto-help-button ${speaking?'sentence-speaking':''}`} aria-expanded={open} onClick={listen}>{recorded?<Icon name="sound" size={16}/>:<Icon name="globe" size={16}/>}<small>Pashto help</small><span lang="ps" dir="rtl">{label?.ps||'پښتو مدد'}</span></button>{open&&<span className="pashto-help-text"><bdi lang="ps" dir="rtl">{help.ps}</bdi>{help.rps&&<small dir="ltr">{help.rps}</small>}{note&&<small className="pashto-help-note"><bdi lang="ps" dir="rtl">{NOTES[note]?.ps}</bdi> · {NOTES[note]?.en}</small>}</span>}</span>;
}
// "Automatically play instructions": in Pashto mode the Lower Dir recording plays when it exists;
// in English mode the English instruction is spoken. Nothing plays for other languages yet.
export function useAutoInstruction(text){
 const {autoInstructions,language}=useAudio();
 useEffect(()=>{
  if(!autoInstructions||!text)return;
  const t=setTimeout(()=>{if(['ps','rps','all'].includes(language))speak(withPashto(support(text))?.ps||text,{lang:'ps',kind:'instruction',clipKey:text,quiet:true});else if(language==='en')speak(text,{kind:'instruction',quiet:true});},450);
  return()=>clearTimeout(t);
 },[text,autoInstructions,language]);
}
const PRAISE=['Well done, you completed the task!','Great job!','Brilliant!','You did it!'];
// Shown once when a task is finished: chime, confetti and spoken praise, also written on screen.
export function CelebrationBurst({id,phrase}){
 const [text]=useState(()=>phrase||PRAISE[Math.floor(Math.random()*PRAISE.length)]);
 useEffect(()=>celebrate(id,text),[id,text]);
 return <div className="celebration-burst" role="status"><div className="pw-confetti" aria-hidden="true">{Array.from({length:12},(_,i)=><span key={i} style={{'--i':i}}>{['🎉','⭐','🌟','✨','🎈'][i%5]}</span>)}</div><p className="celebration-phrase"><span aria-hidden="true">🎉 </span>{text}</p></div>;
}
export function AudioNotice({go}){
 const {issue,language}=useAudio();
 useEffect(()=>{if(!issue)return;const t=setTimeout(clearIssue,9000);return()=>clearTimeout(t);},[issue]);
 if(!issue)return null;
 return <div className="audio-status audio-notice" role="status"><Icon name={issue.type==='off'?'mute':'sound'} size={19}/><span>{issue.message}</span>{issue.retry&&<button className="secondary" onClick={()=>{clearIssue();issue.retry();}}>Try again</button>}{issue.type==='off'&&<button className="secondary" onClick={()=>{clearIssue();go('appearance');}}>Open sound settings</button>}<button aria-label={ariaText('Dismiss audio message',language)} onClick={clearIssue}><Icon name="close" size={18}/></button></div>;
}
export function SoundToggle({settings,onChange,language}){
 const muted=!!settings.muted;
 return <button className="circle-button sound-toggle" aria-label={ariaText(muted?'Turn sound back on':'Pause all sound',language)} aria-pressed={muted} onClick={()=>onChange({muted:!muted})}><Icon name={muted?'mute':'sound'} size={21}/></button>;
}
// Accent shown on each voice card, from the voice's language code.
const ACCENTS=[[/^en[-_]PK/i,'🇵🇰','Pakistani English'],[/^en[-_]IN/i,'🇮🇳','Indian English'],[/^en[-_]GB/i,'🇬🇧','British English'],[/^en[-_]US/i,'🇺🇸','American English'],[/^en[-_]AU/i,'🇦🇺','Australian English']];
const accentOf=v=>ACCENTS.find(([re])=>re.test(v.lang))||[null,'🌐','English'];
const shortName=name=>name.replace(/^(Microsoft|Google)\s+/,'').replace(/\s+Online \(Natural\)/,'').replace(/\s+-\s+English.*$/,'').trim();
// Every English voice on this device as a card: tap to choose, ▶ to hear it first. "Recommended" follows
// the app's own order (Pakistani, then Indian, then other English). Speed applies to all English speech.
function VoiceChooser({voices,settings,onChange,language}){
 const off=!settings.audio||settings.muted,chosen=settings.voiceName||'',speed=settings.voiceSpeed||'normal';
 // The accent and the device voice name are separate, so the accent is translated and the name is left as it is.
 const card=(name,label,flag,accent,voiceName)=><div key={name||'auto'} className={`voice-card ${chosen===name?'voice-chosen':''}`}><button className="voice-pick" {...radioProps(chosen===name)} onClick={()=>onChange({voiceName:name})}><span className="voice-flag" aria-hidden="true">{flag}</span><span className="voice-text"><strong data-no-support={name?'':undefined}>{label}</strong><small><span>{accent}</span>{voiceName&&<> · <span data-no-support lang="en">{voiceName}</span></>}</small></span>{chosen===name&&<Icon name="check" size={18}/>}</button><button className="voice-try" disabled={off} aria-label={`${ariaText('Try',language)}: ${name?label:ariaText('Recommended',language)}`} onClick={()=>previewVoice(name)}>▶ Try</button></div>;
 return <div className="voice-chooser"><h3>English voice</h3><div className="voice-cards" role="radiogroup" aria-label={ariaText('English voice',language)} onKeyDown={radioKeys}>
  {card('','Recommended',voices[0]?accentOf(voices[0])[1]:'⭐',voices[0]?accentOf(voices[0])[2]:'Best voice on this device',voices[0]&&shortName(voices[0].name))}
  {voices.map(v=>{const [,flag,accent]=accentOf(v);return card(v.name,shortName(v.name),flag,accent,null);})}
 </div>
 <div className="voice-speed" role="radiogroup" aria-labelledby="voice-speed-label" onKeyDown={radioKeys}><span id="voice-speed-label">Voice speed</span>{[['normal','Normal'],['slow','Slow'],['very-slow','Very slow']].map(([id,label])=><button key={id} {...radioProps(speed===id)} className={speed===id?'appearance-selected':''} onClick={()=>onChange({voiceSpeed:id})}>{label}</button>)}</div>
 {canInstallVoices()&&<p className="voice-install">{voices.some(v=>/^en[-_](PK|IN)/i.test(v.lang))?null:<>No Pakistani or Indian English voice is on this phone yet. </>}<button className="text-button" onClick={installVoices}>Get more English voices</button> <small>In the phone settings, choose English (India) and download it, then come back.</small></p>}
 </div>;
}
export function SoundSettings({settings,onChange,language}){
 const {voices}=useAudio();
 const options=[['audio','sound','English audio','English words, sentences and praise'],['pashtoAudio','globe','Pashto audio','Pashto help and instructions'],['autoInstructions','book','Automatically play instructions','Hear each instruction when it appears'],['effects','sparkle','Sound effects','Happy chimes when you finish'],['music','music','Background music','Soft music while you learn']];
 return <section className="appearance-section sound-settings"><div className="appearance-section-title"><Icon name="sound"/><div><h2>Sounds and voice</h2><p>Choose what you hear. Your choices save for this learner.</p></div></div>
  {settings.muted&&<p className="sound-muted-note"><Icon name="mute" size={18}/> All sound is paused. <button className="text-button" onClick={()=>onChange({muted:false})}>Turn sound back on</button></p>}
  {/* Each sound option is an on/off switch. */}
  <div className="mode-options sound-options" role="group" aria-label={ariaText('Sound choices',language)}>{options.map(([key,icon,title,detail])=><button key={key} role="switch" aria-checked={!!settings[key]} className={settings[key]?'appearance-selected':''} onClick={()=>onChange({[key]:!settings[key]})}><Icon name={icon} size={27}/><strong>{title}</strong><small>{detail}</small><span className="sound-state" aria-hidden="true">{settings[key]?'On':'Off'}</span>{settings[key]&&<span className="appearance-check"><Icon name="check" size={15}/></span>}</button>)}</div>
  <VoiceChooser voices={voices} settings={settings} onChange={onChange} language={language}/>
  {!voices.length&&<p className="muted">This device has no English voice yet. Words and sentences are always shown as text.</p>}
 </section>;
}
