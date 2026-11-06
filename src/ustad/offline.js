export const PACK_PREFIX='ustad-core-';
export async function packStatus(storage=globalThis.caches){
 if(!storage)return false;
 try{const names=(await storage.keys()).filter(n=>n.startsWith(PACK_PREFIX));
 for(const name of names){const cache=await storage.open(name),response=await cache.match('/offline-manifest.json');if(!response)continue;const manifest=await response.json();if(!Array.isArray(manifest.urls)||!manifest.urls.length)continue;const entries=await Promise.all(manifest.urls.map(url=>cache.match(url)));if(entries.every(Boolean))return true;}
 }catch{}return false;
}
export async function savePack({production,serviceWorker=globalThis.navigator?.serviceWorker,storage=globalThis.caches,fetcher=globalThis.fetch,timeoutMs=8000}){
 if(!production||!serviceWorker||!storage)throw new Error('Use the production preview on localhost or HTTPS.');
 let timer;
 try{
 await Promise.race([serviceWorker.ready,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('The offline worker is not ready. Reload and try again.')),timeoutMs);})]);
 }finally{clearTimeout(timer);}
 const response=await fetcher('/offline-manifest.json',{cache:'no-store'});
 if(!response.ok)throw new Error('The lesson pack list could not be loaded. Please try again online.');
 const manifest=await response.json();
 if(typeof manifest.version!=='string'||!Array.isArray(manifest.urls)||!manifest.urls.length||!manifest.urls.every(u=>typeof u==='string'&&u.startsWith('/')&&!u.startsWith('//')))throw new Error('Invalid lesson pack list.');
 const cache=await storage.open(PACK_PREFIX+manifest.version);
 for(let i=0;i<manifest.urls.length;i+=12)await cache.addAll(manifest.urls.slice(i,i+12));
 await cache.addAll(['/offline-manifest.json']);
 const entries=await Promise.all(manifest.urls.map(url=>cache.match(url)));
 if(!entries.every(Boolean))throw new Error('The lesson pack is incomplete. Please try again online.');
 return true;
}
