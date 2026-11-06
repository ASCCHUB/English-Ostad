// Replaces an old production worker when the same origin is reused for Vite.
// Student checkpoints are in localStorage/IndexedDB and are never touched here.
export const devOfflineResetWorker=`
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 const names=await caches.keys();
 await Promise.all(names.filter(name=>name.startsWith('ustad-core-')||name.startsWith('english-ustad-shell-')||name==='ustad-pack-v1').map(name=>caches.delete(name)));
 await self.registration.unregister();
 const windows=await self.clients.matchAll({type:'window'});
 await Promise.all(windows.map(client=>client.navigate(client.url).catch(()=>{})));
})()));
`;
