// End-to-end check of the GitHub Pages build (output/github-pages) served under /English-Ostad/.
// Covers: offline pack ("Lessons saved" only once complete), offline reopen with pictures, lesson 59 "shop"
// retry after one and two mistakes (tap the yellow box and tap ✕), the Back button, and a published update
// that appears without touching student profiles or progress.
// Usage: node scripts/check-pages-offline-retry.mjs [chromium|webkit]
import {createServer} from 'node:http';
import fs from 'node:fs';
import {join,extname} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const playwright=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const mode=process.argv[2]||'chromium',engine=mode,browserName=mode==='iphone'?'chromium':mode,base='/English-Ostad/',root='output/github-pages',v2root='output/github-pages-v2',out='output/pages-offline-retry';
fs.mkdirSync(out,{recursive:true});
// Version 2: same files with one visible change, a new manifest version and a matching worker.
fs.rmSync(v2root,{recursive:true,force:true});fs.cpSync(root,v2root,{recursive:true});
{const index=join(v2root,'index.html');fs.writeFileSync(index,fs.readFileSync(index,'utf8').replace('</head>','<meta name="ustad-test-build" content="v2"></head>'));
 const manifest=JSON.parse(fs.readFileSync(join(root,'offline-manifest.json'),'utf8')),old=manifest.version,version=createHash('sha256').update(old+'v2').digest('hex').slice(0,16);
 fs.writeFileSync(join(v2root,'offline-manifest.json'),JSON.stringify({...manifest,version}));
 const sw=join(v2root,'sw.js');fs.writeFileSync(sw,fs.readFileSync(sw,'utf8').replace(`'${old}'`,`'${version}'`));}
let live=root,offline=false;const missing=[],types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2','.woff':'font/woff','.mp3':'audio/mpeg'};
const server=createServer((req,res)=>{const url=decodeURIComponent(req.url.split('?')[0]);if(offline){req.socket.destroy();return;}
 if(!url.startsWith(base)){missing.push(url);res.writeHead(404);res.end();return;}
 const file=join(live,url.slice(base.length)||'index.html');
 // Same caching headers as GitHub Pages, so stale HTTP-cache copies would show up here.
 try{const body=fs.readFileSync(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'max-age=600'});res.end(body);}catch{missing.push(url);res.writeHead(404);res.end();}});
await new Promise(r=>server.listen(5195,'127.0.0.1',r));
const origin='http://127.0.0.1:5195',browser=await playwright[browserName].launch({headless:true});
const {freshProfile}=await import('../src/ustad/engine.js');const {freshCourse,freshSession,outlineLessons}=await import('../src/ustad/firstSteps/state.js');const {lessons}=await import('../src/ustad/firstSteps/tasks.js');
const lesson=lessons[59],meta=outlineLessons[59];
const shop=lesson.tasks.map((t,i)=>[t,i]).filter(([t])=>t.mode==='build'&&t.tokens.join('')==='shop');assert.equal(shop.length,2,'lesson 59 has a practice and a check "shop" question');
const sessionAt=cursor=>({...freshSession(),cursor,solved:meta.tasks.slice(0,cursor).map(t=>t.id),first:Object.fromEntries(meta.tasks.slice(0,cursor).filter(t=>t.stage==='check').map(t=>[t.id,true]))});
const learner={...freshProfile('Ali'),firstSteps:{...freshCourse(),startIndex:59,resume:lesson.id,placement:{source:'parent',startIndex:59,level:lesson.level,date:'2026-11-01T00:00:00.000Z'},lessons:{[lesson.id]:sessionAt(shop[0][1]-1)}}};
const sibling={...freshProfile('Sara'),xp:420};
const results=[];const pass=m=>{results.push(m);console.log('  ✓ '+m);};
try{
 const context=await browser.newContext(engine!=='chromium'?{...(playwright.devices||playwright.default.devices)['iPhone 15 Pro'],serviceWorkers:'allow'}:{viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'allow'});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Seed two students once, before the app starts (later reloads keep whatever the app saved).
 await context.addInitScript(({learner,sibling})=>{if(localStorage.getItem('ustad-test-seeded'))return;localStorage.setItem('ustad-test-seeded','1');localStorage.setItem('english-ustad-v1',JSON.stringify({profiles:[learner,sibling],active:0,language:'ps',goal:3}));for(const p of [learner,sibling])localStorage.setItem('english-ustad-guide-2-'+p.id,'done');localStorage.setItem('little-explorers-welcomed','yes');},{learner,sibling});
 await page.goto(origin+base);
 // 1. Offline pack: the "saved" message must only appear once every listed file is in the cache.
 await page.getByRole('button',{name:'Learn as Ali',exact:true}).click();
 const saved=page.getByText('Lessons saved for offline use',{exact:false}).first();
 const packComplete=()=>page.evaluate(async base=>{for(const name of await caches.keys()){const c=await caches.open(name),m=await c.match(base+'offline-manifest.json');if(!m)continue;const {urls}=await m.json();const have=await Promise.all(urls.map(u=>c.match(u)));if(have.every(Boolean))return urls.length;}return 0;},base);
 if(!await saved.isVisible().catch(()=>false)){const button=page.getByRole('button',{name:/Save lessons offline/});if(await button.isVisible().catch(()=>false))await button.click();}
 await saved.waitFor({timeout:120000});const count=await packComplete();assert.ok(count>300,'every offline file is cached when "saved" shows');pass(`"Lessons saved for offline use" shown with all ${count} files cached`);
 await page.screenshot({path:`${out}/${engine}-saved.png`});
 // 2. Lesson 59, practice "shop": retry after one and two mistakes.
 const task=page.locator('.fs-task'),strip=page.locator('.fs-feedback-strip');
 async function openLesson(){await page.getByRole('button',{name:/Continue: Level/}).click();await task.waitFor();}
 async function build(letters){const tiles=page.locator('.fs-tiles .fs-word-tile>button:first-child');const labels=await tiles.allTextContents();const used=new Set();for(const l of letters){const i=labels.findIndex((x,j)=>x===l&&!used.has(j));used.add(i);await tiles.nth(i).click();}await page.getByRole('button',{name:/Check my answer/}).click();}
 async function cleared(where){assert.equal(await strip.count(),0,where+': feedback hidden');assert.equal(await page.locator('.fs-answer button').count(),0,where+': attempt cleared');assert.equal(await page.locator('.fs-tiles .fs-word-tile>button:first-child:disabled').count(),0,where+': every tile can be tapped again');assert.ok(await page.locator('.fs-next button').isDisabled(),where+': still on the same question');}
 async function retryTwice(label,id){
  assert.equal(await task.getAttribute('data-task'),id);
  await build(['o','sh','p']);await strip.waitFor();assert.match(await strip.innerText(),/Good try/);await page.screenshot({path:`${out}/${engine}-${label}-mistake1.png`});
  const box=await strip.boundingBox();await page.mouse.click(box.x+box.width*0.3,box.y+box.height/2);// a plain spot on the yellow box
  await cleared(label+' after 1 mistake');assert.equal(await task.getAttribute('data-task'),id);pass(`${label}: 1st mistake → tapping the yellow box hides it, clears the attempt, same question`);
  await build(['p','o','sh']);await strip.waitFor();assert.match(await strip.innerText(),/glowing answer/);await page.screenshot({path:`${out}/${engine}-${label}-mistake2.png`});
  await strip.locator('[aria-hidden="true"]').last().click();// the ✕
  await cleared(label+' after 2 mistakes');assert.equal(await page.locator('.fs-answer-hint').innerText(),'sh','after 2 mistakes the first letter glows');assert.equal(await task.getAttribute('data-task'),id);pass(`${label}: 2nd mistake → tapping ✕ hides it, clears the attempt, same question`);
  await build(['sh','o','p']);await page.locator('.fs-success').waitFor();pass(`${label}: the same question can then be answered correctly`);
 }
 await openLesson();
 // The question before "shop" is "ship". If nobody taps, the box hides by itself and the attempt is cleared too.
 assert.deepEqual(lesson.tasks[shop[0][1]-1].tokens,['sh','i','p']);
 await build(['i','sh','p']);await strip.waitFor();await strip.waitFor({state:'detached',timeout:9000});await cleared('automatic hide');pass('ship: when the yellow box hides by itself, the attempt is cleared as well');
 await build(['sh','i','p']);await page.locator('.fs-success').waitFor();await page.waitForFunction(id=>document.querySelector('.fs-task')?.dataset.task===id,shop[0][0].id,{timeout:4000}).catch(()=>page.locator('.fs-next button').click());
 await retryTwice('practice shop',shop[0][0].id);
 // 3. Visible Back button opens the previous question.
 const shopId=shop[0][0].id;await page.waitForFunction(id=>document.querySelector('.fs-task')?.dataset.task!==id,shopId,{timeout:4000}).catch(()=>page.locator('.fs-next button').click());await page.waitForFunction(id=>document.querySelector('.fs-task')?.dataset.task!==id,shopId);
 const here=await task.getAttribute('data-task'),back=page.getByRole('button',{name:'Previous page',exact:true});
 assert.ok(await back.isVisible());assert.match(await back.innerText(),/←\s*Back/);
 const idx=lesson.tasks.findIndex(t=>t.id===here);await back.click();await page.waitForTimeout(150);assert.equal(await task.getAttribute('data-task'),lesson.tasks[idx-1].id);assert.equal(lesson.tasks[idx-1].id,shopId);await page.screenshot({path:`${out}/${engine}-back.png`});pass('after moving on, visible "← Back" reopens the previous (shop) question');
 assert.equal(await strip.count(),0,'reopening with Back shows no old "try again" message');
 await page.locator('.fs-tiles .fs-word-tile>button:first-child',{hasText:/^sh$/}).click();await page.waitForTimeout(6500);assert.equal(await page.locator('.fs-answer button').count(),1,'a letter placed on the reopened question is kept');await page.getByRole('button',{name:/Remove the last letter/}).click();
 pass('the reopened question shows no old message and keeps letters the learner places');
 // 4. Offline reopen, then the check "shop" question offline.
 await page.evaluate(({base,cursor,id})=>{const s=JSON.parse(localStorage.getItem('english-ustad-v1'));const p=s.profiles[0],l=p.firstSteps.lessons[id];p.firstSteps.lessons[id]={...l,cursor,solved:[],first:{},tries:{},placed:[],currentSolved:false};localStorage.setItem('english-ustad-v1',JSON.stringify(s));},{base,cursor:shop[1][1],id:lesson.id});
 // Fill earlier steps as solved so the check question opens directly.
 await page.evaluate(({cursor,id,solved,first})=>{const s=JSON.parse(localStorage.getItem('english-ustad-v1'));Object.assign(s.profiles[0].firstSteps.lessons[id],{cursor,solved,first});localStorage.setItem('english-ustad-v1',JSON.stringify(s));},{cursor:shop[1][1],id:lesson.id,solved:meta.tasks.slice(0,shop[1][1]).map(t=>t.id),first:Object.fromEntries(meta.tasks.slice(0,shop[1][1]).filter(t=>t.stage==='check').map(t=>[t.id,true]))});
 offline=true;await context.setOffline(true);
 await page.goto(origin+base);await page.getByRole('button',{name:'Learn as Ali',exact:true}).click();await openLesson();
 const pictures=await page.evaluate(()=>[...document.images].filter(i=>i.complete).map(i=>i.naturalWidth>0));assert.ok(pictures.length&&pictures.every(Boolean),'pictures load offline');
 pass(`reopened with no internet; ${pictures.length} pictures loaded from the offline copy`);
 await retryTwice('check shop (offline)',shop[1][0].id);await page.screenshot({path:`${out}/${engine}-offline-check.png`});
 // 5. A published update appears without touching profiles or progress.
 const before=await page.evaluate(()=>localStorage.getItem('english-ustad-v1'));
 offline=false;await context.setOffline(false);live=v2root;
 await page.goto(origin+base);// back to the start screen
 await page.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();await r.update();});
 await page.waitForFunction(()=>document.querySelector('meta[name="ustad-test-build"]'),null,{timeout:120000}).catch(async()=>{await page.reload();await page.waitForFunction(()=>document.querySelector('meta[name="ustad-test-build"]'),null,{timeout:20000});});
 const after=await page.evaluate(()=>localStorage.getItem('english-ustad-v1'));
 assert.equal(after,before,'student profiles and progress unchanged by the update');
 const names=await page.evaluate(()=>JSON.parse(localStorage.getItem('english-ustad-v1')).profiles.map(p=>p.name+':'+(p.xp||0)));
 const caches=await page.evaluate(()=>caches.keys());assert.equal(caches.filter(n=>n.startsWith('ustad-core-')).length,1,'old offline copy removed');
 pass(`update appeared automatically; profiles kept (${names.join(', ')}); one current offline copy`);
 await page.getByRole('button',{name:'Learn as Sara',exact:true}).waitFor();
 assert.deepEqual(errors,[]);assert.deepEqual(missing.filter(u=>!u.endsWith('favicon.ico')),[]);pass('no page errors or missing files');
 console.log(`PASS (${engine}): ${results.length} checks`);
}finally{await browser.close();server.closeAllConnections();server.close();}
