const PREFIX='ustad-core-';
// Replaced during build so activation always knows which cache is current.
const BUILD_VERSION='__USTAD_BUILD_VERSION__';
const activeCache=PREFIX+BUILD_VERSION;
// Student profiles and progress are kept in browser storage that this worker never touches; it only
// manages its own 'ustad-core-*' caches (and two retired cache names).
const fresh=url=>typeof Request==='function'?new Request(url,{cache:'reload'}):url;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const response=await fetch('/offline-manifest.json',{cache:'no-store'});
  if(!response.ok)throw Error('Offline manifest unavailable');
  const manifest=await response.json();
  if(manifest.version!==BUILD_VERSION)throw Error('Offline version changed during download; retry the update');
  const cache=await caches.open(activeCache);
  // Installation only succeeds once every core file is available.
  // 'reload' skips the browser's HTTP cache so an update never stores yesterday's copy of a file.
  // Small batches avoid a large parallel download on iPhone. Publish the manifest last;
  // an interrupted download must never be reported as ready for offline use.
  for(let i=0;i<manifest.urls.length;i+=12)await cache.addAll(manifest.urls.slice(i,i+12).map(fresh));
  await cache.put('/offline-manifest.json',new Response(JSON.stringify(manifest),{headers:{'Content-Type':'application/json'}}));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  if(activeCache){const keys=await caches.keys();await Promise.all(keys.filter(k=>(k.startsWith(PREFIX)&&k!==activeCache)||k.startsWith('english-ustad-shell-')||k==='ustad-pack-v1').map(k=>caches.delete(k)));}
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==self.location.origin)return;
 // Open a saved app immediately, even when the phone has a stalled connection. New versions are found by the
 // page's update check (main.jsx); once the new copy is fully saved, the page reloads into it.
 if(request.mode==='navigate'){event.respondWith((async()=>await caches.match('/')||fetch(request))());return;}
 // The lesson list is always checked online first, so the app can tell when a new version exists.
 if(url.pathname==='/offline-manifest.json'){event.respondWith(fetch(request).catch(async()=>await caches.match('/offline-manifest.json')||Response.error()));return;}
 // Everything else (scripts, fonts, pictures, drawings, recordings) comes from the offline copy first, so the
 // whole app works with no internet; anything not in the copy is fetched normally. Built scripts have
 // versioned names, so a new page always asks for its own new files.
 event.respondWith((async()=>await caches.match(request,{ignoreSearch:true})||fetch(request))());
});
