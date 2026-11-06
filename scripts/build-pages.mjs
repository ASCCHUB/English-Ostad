import {build} from 'vite';
import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
const repo=(process.env.GITHUB_REPOSITORY||'ASCCHUB/English-Ostad').split('/').at(-1);
if(!/^[A-Za-z0-9._-]+$/.test(repo))throw Error('Invalid repository name');
const base=repo.toLowerCase().endsWith('.github.io')?'/':`/${repo}/`;
const outDir='output/github-pages';
await build({base,build:{outDir},logLevel:'error'});
// Public pictures and generated course data use root paths in the native app.
// Relocate these in this separate Pages build; leave native/root builds unchanged.
const prefixes=['assets/','audio/','drawings/','explorers/','learning-photos/','payments/','first-steps-audio.json','offline-manifest.json','manifest.json','sw.js','favicon-32.png','favicon.svg','apple-touch-icon.png','ustad-icon.svg','ustad-icon-192.png','ustad-icon-512.png','ustad-icon-maskable-512.png'];
async function walk(dir){const files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())files.push(...await walk(p));else files.push(p);}return files;}
for(const path of await walk(outDir))if(/\.(?:js|css|html)$/.test(path)&&!path.endsWith('sw.js')){
 let text=await readFile(path,'utf8');
 for(const prefix of prefixes)text=text.replaceAll('"/'+prefix,'"'+base+prefix).replaceAll("'/"+prefix,"'"+base+prefix).replaceAll('`/'+prefix,'`'+base+prefix).replaceAll('url(/'+prefix,'url('+base+prefix);
 await writeFile(path,text);
}
const manifest=JSON.parse(await readFile(join(outDir,'manifest.json'),'utf8'));
manifest.start_url=base;manifest.scope=base;manifest.id=base;
for(const icon of manifest.icons)icon.src=base+icon.src.replace(/^\//,'');
await writeFile(join(outDir,'manifest.json'),JSON.stringify(manifest));
await writeFile(join(outDir,'.nojekyll'),'');
const urls=[base];
for(const path of await walk(outDir)){
 const relative=path.slice(outDir.length+1).replaceAll('\\','/');
 if(relative==='index.html'||relative==='sw.js'||relative==='offline-manifest.json'||relative==='.nojekyll')continue;
 if(/\.(?:js|css|woff2?|png|jpg|webp|svg|json|mp3|ogg|wav)$/.test(relative))urls.push(base+relative);
}
const hash=createHash('sha256');for(const url of urls)hash.update(url).update(await readFile(join(outDir,url===base?'index.html':url.slice(base.length))));
const version=hash.digest('hex').slice(0,16);
await writeFile(join(outDir,'offline-manifest.json'),JSON.stringify({version,urls}));
let worker=await readFile('public/sw.js','utf8');worker=worker.replace('__USTAD_BUILD_VERSION__',version).replaceAll("'/offline-manifest.json'","'"+base+"offline-manifest.json'").replaceAll("caches.match('/')","caches.match('"+base+"')");
await writeFile(join(outDir,'sw.js'),worker);
console.log(`GitHub Pages build ready: ${outDir}, base ${base}, ${urls.length} offline files.`);
