import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {devOfflineResetWorker} from '../../scripts/dev-offline-reset.mjs';
test('development retires old app caches and reloads the page without clearing student storage',async()=>{
 const handlers={},deleted=[],navigated=[];let unregistered=false;
 const self={addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{},registration:{unregister:async()=>{unregistered=true;}},clients:{matchAll:async()=>[{url:'http://127.0.0.1:5173/#/beginner-lesson/59',navigate:async url=>navigated.push(url)}]}};
 vm.runInNewContext(devOfflineResetWorker,{self,caches:{keys:async()=>['ustad-core-old','english-ustad-shell-old','ustad-pack-v1','another-app'],delete:async name=>deleted.push(name)}});
 let work;handlers.activate({waitUntil:p=>work=p});await work;
 assert.deepEqual(deleted,['ustad-core-old','english-ustad-shell-old','ustad-pack-v1']);assert.ok(unregistered);assert.deepEqual(navigated,['http://127.0.0.1:5173/#/beginner-lesson/59']);
 assert.ok(!devOfflineResetWorker.includes('localStorage'));assert.ok(!devOfflineResetWorker.includes('indexedDB'));
});
