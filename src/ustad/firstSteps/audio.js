import {recordings,gpcs,words,course} from './tasks.js';
import {speak,stopSpeech,playRecording} from '../soundEngine.js';
import {homeRecording,changed} from './homeRecordings.js';
let available={};
let manifestLoad;
// Bundled recordings (public/first-steps-audio.json, written by npm run recordings:add). Loaded once.
export function loadRecordingManifest(){return manifestLoad||=fetch('/first-steps-audio.json').then(response=>response.ok?response.json():null).then(data=>{if(data){available=data.recordings||{};changed();}}).catch(()=>{/* The core lesson remains usable with text or a live adult reader. */});}
export function readyRecording(id){const r=available[id];return !!r&&r.status==='ready'&&r.reviewStatus==='approved'&&typeof r.file==='string'&&/^\/audio\/first-steps\/[A-Za-z0-9/_-]+\.(mp3|ogg|wav)$/.test(r.file);}
export async function playCourseClip(id,{onBoundary,onTime}={}){
 const record=recordings[id];if(!record)return 'pending';
 if(readyRecording(id)){const ready=available[id];return playRecording(ready.file,{owner:'first-steps',text:record.text,lang:record.language,onTime:time=>{onTime?.(time);if(Array.isArray(ready.alignment)){const row=ready.alignment.find(x=>time>=x.startMs&&time<x.endMs);if(row)onBoundary?.(row.charIndex);}}});}
 // Next best: a grown-up's own recording on this device (parent area).
 if(homeRecording(id))return playRecording(homeRecording(id),{owner:'first-steps',text:record.text,lang:record.language,onTime});
 // Otherwise the device's English voice (Pakistani or Indian English when installed). Words and letter names are
 // said as written; a letter sound is said the way spoken() gives it. Lower Dir Pashto is never synthesised.
 const said=spoken(record);if(said)return speak(said.text,{owner:'first-steps',kind:record.kind,onBoundary:said.text===record.text?onBoundary:undefined,rate:said.rate});
 stopSpeech();return 'pending';
}
export function sayWord(text){return speak(text,{owner:'first-steps',kind:'word',rate:.8});}
// Device speech is used for words and letter names only. A phoneme must never
// silently turn into its example word (b -> ball) or into its letter name.
export function spoken(r){
 if(r.language!=='en-GB'||!['speech','letter_name'].includes(r.kind))return null;
 return {text:r.text,rate:.8};
}
// When a sound recording is missing, a tile may explicitly offer its letter name.
// Doubled spellings such as ll use the name L; digraphs retain separate names.
export function letterNamesForSound(id){const spelling=Object.values(gpcs).find(g=>g.recordingId===id)?.spelling||'';const letters=[...spelling.toLowerCase()].filter(c=>/[a-z]/.test(c));const unique=letters.length&&letters.every(c=>c===letters[0])?[letters[0]]:letters;return unique.map(c=>course.alphabet.find(a=>a.lower===c)?.letterNameAudioId).filter(Boolean);}
// Device speech supports ordinary English words and letter names, never substitute phonemes.
// Pashto clips still need recordings, so their buttons stay hidden until those exist.
// A real recording (approved built-in file or a grown-up's home recording), not the device-voice stand-in.
export function hasRecording(id){return readyRecording(id)||!!homeRecording(id);}
export function canPlay(id){const r=recordings[id];return !!r&&(readyRecording(id)||!!homeRecording(id)||!!spoken(r));}
// The letters a pure-sound clip stands for (shown instead of a silent button).
const soundSpelling=Object.fromEntries(Object.values(gpcs).map(g=>[g.recordingId,g.spelling]));
export function soundLetters(id){return soundSpelling[id]||null;}
// The slow-blend clip for a word (s–a–t → sat).
const slowBlends=Object.fromEntries(Object.values(recordings).filter(r=>r.kind==='blend_stretched').map(r=>[r.wordId,r.id]));
export function slowBlend(wordId){return slowBlends[wordId]||null;}
