// Letter sounds and slow blends a grown-up records on this device (parent area → "Record the sounds").
// They play in place of a missing studio recording, only on this device. Clips stay in IndexedDB:
// never uploaded and not part of backups.
let database,urls={},version=0;const listeners=new Set();
function db(){if(!globalThis.indexedDB)return Promise.reject(Error('IndexedDB unavailable'));return database||=new Promise((resolve,reject)=>{const request=indexedDB.open('english-ostad-home-recordings',1);request.onupgradeneeded=()=>request.result.createObjectStore('clips',{keyPath:'id'});request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});}
function run(mode,work){return db().then(d=>new Promise((resolve,reject)=>{const tx=d.transaction('clips',mode),request=work(tx.objectStore('clips'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);}));}
// Also called when the bundled recordings list loads, so counts and sound buttons update.
export function changed(){version++;listeners.forEach(fn=>fn());}
let loading;
export function loadHomeRecordings(){return loading||=run('readonly',s=>s.getAll()).then(rows=>{for(const row of rows)urls[row.id]=URL.createObjectURL(row.blob);changed();}).catch(()=>{/* Without IndexedDB the course simply has no home recordings. */});}
export function homeRecording(id){return urls[id]||null;}
export async function saveHomeRecording(id,blob){await run('readwrite',s=>s.put({id,blob,savedAt:new Date().toISOString()}));if(urls[id])URL.revokeObjectURL(urls[id]);urls[id]=URL.createObjectURL(blob);changed();}
export async function deleteHomeRecording(id){await run('readwrite',s=>s.delete(id));if(urls[id])URL.revokeObjectURL(urls[id]);delete urls[id];changed();}
export function subscribeHomeRecordings(fn){listeners.add(fn);return()=>listeners.delete(fn);}
export function homeRecordingsVersion(){return version;}
