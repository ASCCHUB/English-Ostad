export const PACK_PREFIX='ustad-core-';
// In the browser, 'reload' requests skip the HTTP cache so a saved pack never holds an outdated copy.
const fresh=url=>globalThis.location&&typeof Request==='function'?new Request(url,{cache:'reload'}):url;
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
 // Only download what the offline worker has not already saved; fresh copies skip the browser's HTTP cache.
 const missing=[];for(const url of manifest.urls)if(!await cache.match(url))missing.push(url);
 for(let i=0;i<missing.length;i+=12)await cache.addAll(missing.slice(i,i+12).map(fresh));
 await cache.put('/offline-manifest.json',new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
 const entries=await Promise.all(manifest.urls.map(url=>cache.match(url)));
 if(!entries.every(Boolean))throw new Error('The lesson pack is incomplete. Please try again online.');
 return true;
}
