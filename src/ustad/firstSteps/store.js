import {validateCourse,freshCourse} from './state.js';
const prefix='first-steps-checkpoint:';
let database;
function db(){if(!globalThis.indexedDB)return Promise.reject(Error('IndexedDB unavailable'));return database||=new Promise((resolve,reject)=>{const request=indexedDB.open('little-explorers-first-steps',1);request.onupgradeneeded=()=>{request.result.createObjectStore('checkpoints',{keyPath:'learnerId'});request.result.createObjectStore('outbox',{keyPath:'learnerId'});};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function transaction(store,mode,run){return db().then(database=>new Promise((resolve,reject)=>{const tx=database.transaction(store,mode);const request=run(tx.objectStore(store));let result;request.onsuccess=()=>{result=request.result;};tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}));}
export function hydrateCourse(profile){const base=validateCourse(profile.firstSteps);try{const raw=localStorage.getItem(prefix+profile.id);if(raw){const snapshot=validateCourse(JSON.parse(raw));if(snapshot.revision>base.revision)return snapshot;}}catch{}return base;}
export function persistCourse(learnerId,progress){
 const clean=validateCourse(progress);const serialized=JSON.stringify(clean);
 // This synchronous write must succeed before the UI advances. IndexedDB mirrors
 // it and keeps a coalesced local recovery journal. No progress is uploaded.
 localStorage.setItem(prefix+learnerId,serialized);
 const record={learnerId,revision:clean.revision,contentVersion:clean.version,progress:clean,updatedAt:new Date().toISOString()};
 return Promise.all([transaction('checkpoints','readwrite',s=>s.put(record)),transaction('outbox','readwrite',s=>s.put(record))]);
}
export async function clearRecoveryCheckpoints(){for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k?.startsWith(prefix))localStorage.removeItem(k);}try{await Promise.all([transaction('checkpoints','readwrite',s=>s.clear()),transaction('outbox','readwrite',s=>s.clear())]);}catch{/* A validated imported backup remains authoritative without IndexedDB. */}}
export {freshCourse};
