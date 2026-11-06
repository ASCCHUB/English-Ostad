import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
async function workerHarness({failAsset=false,stalledNavigation=false}={}){
 const source=(await readFile(new URL('../../public/sw.js',import.meta.url),'utf8')).replace('__USTAD_BUILD_VERSION__','test-version');
 const manifest={version:'test-version',urls:['/','/assets/app.js','/assets/style.css','/explorers/welcome.png']};
 const network=new Map([['/',new Response('<h1>English Ustad</h1>')],['/assets/app.js',new Response('app code')],['/assets/style.css',new Response('app style')],['/explorers/welcome.png',new Response('fox illustration')],['/offline-manifest.json',new Response(JSON.stringify(manifest))]]);
 if(failAsset)network.delete('/assets/app.js');
 const stores=new Map(),listeners={};
 const path=value=>typeof value==='string'?value:new URL(value.url).pathname;
 let offline=false;
 const fetcher=async request=>{if(stalledNavigation&&request.mode==='navigate')return new Promise(()=>{});const response=network.get(path(request));if(offline||!response)throw Error('Network unavailable');return response.clone();};
 const storage={async keys(){return [...stores.keys()]},async delete(name){return stores.delete(name)},async open(name){if(!stores.has(name))stores.set(name,{entries:new Map(),async match(request){return this.entries.get(path(request))?.clone()},async addAll(urls){const responses=await Promise.all(urls.map(fetcher));urls.forEach((url,i)=>this.entries.set(url,responses[i]));}});return stores.get(name)},async match(request){for(const cache of stores.values()){const found=await cache.match(request);if(found)return found;}}};
 const self={location:{origin:'http://localhost'},addEventListener(type,fn){listeners[type]=fn},async skipWaiting(){},clients:{async claim(){}}};
 vm.runInNewContext(source,{self,caches:storage,fetch:fetcher,Response,URL,Error,Promise});
 return {storage,setOffline(){offline=true},async lifecycle(type){let work;listeners[type]({waitUntil(p){work=p}});await work},async request(url,mode){let result;listeners.fetch({request:{url:'http://localhost'+url,method:'GET',mode},respondWith(p){result=p}});return await result}};
}
test('service worker installs all assets and serves the app and scripts without network',async()=>{const harness=await workerHarness();await harness.lifecycle('install');await harness.lifecycle('activate');harness.setOffline();assert.match(await (await harness.request('/','navigate')).text(),/English Ustad/);assert.equal(await (await harness.request('/assets/app.js','cors')).text(),'app code');assert.equal(await (await harness.request('/assets/style.css','cors')).text(),'app style');assert.equal(await (await harness.request('/explorers/welcome.png','cors')).text(),'fox illustration');});
test('worker activation cleans its old caches and preserves unrelated applications',async()=>{const h=await workerHarness();await h.storage.open('ustad-core-old');await h.storage.open('other-app');await h.lifecycle('install');await h.lifecycle('activate');assert.deepEqual((await h.storage.keys()).sort(),['other-app','ustad-core-test-version']);});
test('an interrupted worker installation rejects rather than claiming a complete offline course',async()=>{const h=await workerHarness({failAsset:true});await assert.rejects(h.lifecycle('install'),/Network/);const cache=await h.storage.open('ustad-core-test-version');assert.equal(await cache.match('/'),undefined);});

test('saved lessons open immediately even when the connection hangs',async()=>{const h=await workerHarness({stalledNavigation:true});await h.lifecycle('install');const response=await Promise.race([h.request('/','navigate'),new Promise((_,reject)=>setTimeout(()=>reject(Error('Navigation waited for the network')),100))]);assert.match(await response.text(),/English Ustad/);});
