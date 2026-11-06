// Lists English text a learner sees that has no support-language translation: every screen,
// plus every step of every lesson on the adventure path.
// A line counts as covered when Urdu/Pashto follows it in the markup, or when the support
// dictionary has it (the support layer then shows it under the English on screen).
// Usage: node scripts/audit-support-language.mjs [ur|ps|rur|rps] [--all] [--list] [--max=N]
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const language=process.argv[2]||'ur',showAll=process.argv.includes('--all'),list=process.argv.includes('--list');
const max=Number(process.argv.find(a=>a.startsWith('--max='))?.slice(6)??Infinity);
const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
const script=language==='ur'||language==='ps'?/[؀-ۿ]/:null;
// English practice lists (cat · bat · hat, -at: cat, bat, st / bl / tr) are the learning target and stay English.
const practiceList=/^[-a-z/ ·,:;]+$/;
// Answer choices and tiles stay English on purpose, so the layer skips them too.
const answerAreas=/<(div|section)[^>]*class="[^"]*(quiz-options|pw-options|pw-tiles|train-tiles|train-answer|memory-grid|path-match|story-caption|unit-examples|adventure-options)[^"]*"[\s\S]*?<\/\1>/g;
let exitCode=0;
try{
 const {default:App}=await server.ssrLoadModule('/src/ustad/App.jsx');
 const {ROUTES}=await server.ssrLoadModule('/src/ustad/explorerModel.js');
 const {freshProfile}=await server.ssrLoadModule('/src/ustad/engine.js');
 const {support}=await server.ssrLoadModule('/src/ustad/supportCopy.js');
 const path=await server.ssrLoadModule('/src/ustad/PathScreens.jsx');
 const {pathLessons}=await server.ssrLoadModule('/src/ustad/pathModel.js');
 const {defaultAdventure}=await server.ssrLoadModule('/src/ustad/adventureEngine.js');
 const profile=freshProfile('Sara');
 globalThis.localStorage={getItem:k=>k==='english-ustad-v1'?JSON.stringify({profiles:[profile],active:0,language,goal:3}):k==='little-explorers-welcomed'?'yes':null,setItem(){},removeItem(){}};
 function missingIn(html){
  const start=html.indexOf('<main');
  // English quoted inside a Pashto or Urdu line (isolated in <bdi lang="en">) is part of that translation.
  const main=html.slice(start>=0?start:0).replace(/<footer[\s\S]*?<\/footer>/,'').replace(/<nav[\s\S]*?<\/nav>/g,'').replace(answerAreas,'').replace(/<bdi lang="en" dir="ltr">[^<]*<\/bdi>/g,'').replace(/(<[a-z]+ [^>]*lang="(?:ps|ur)-Latn"[^>]*>)[^<]*/g,'$1')
   // A First Steps two-line label: the English is followed by its own Pashto line.
   .replace(/(<span class="fs-en"[^>]*>)[^<]*(<\/span><span class="fs-ps")/g,'$1$2');
  const nodes=[...main.matchAll(/>([^<>]+)</g)].map(m=>({text:m[1].replace(/&#x27;|&#39;/g,"'").replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim(),at:m.index})).filter(n=>n.text);
  const english=nodes.filter(n=>/[A-Za-z]{2,}/.test(n.text)&&!(script&&script.test(n.text))&&n.text.split(/\s+/).filter(w=>/[A-Za-z]{2,}/.test(w)).length>=2&&!practiceList.test(n.text)&&!/^\/.+\/ as in /.test(n.text));
  return english.filter((n,i)=>{const end=english[i+1]?.at??main.length,between=main.slice(n.at,end);return !support(n.text)&&!(script?script.test(between):/translation/.test(between));}).map(n=>n.text);
 }
 const report=[];
 const skip=new Set(['quiz','parent','downloads','appearance','adult-spelling','adult-lesson']);
 for(const page of ROUTES.filter(r=>!skip.has(r))){
  try{const missing=missingIn(renderToStaticMarkup(createElement(App,{initialPage:page})));if(missing.length)report.push([page,[...new Set(missing)]]);}catch(e){report.push([page,['RENDER ERROR '+e.message]]);}
 }
 const noop=()=>{};
 for(const lesson of pathLessons)for(let step=0;step<lesson.activities.length;step++){
  const learner={...profile,adventure:{...defaultAdventure,unlockAll:true,events:{},pathResume:{lesson:lesson.id,step}}};
  const missing=missingIn('<main>'+renderToStaticMarkup(createElement(path.PathLesson,{index:lesson.index,profile:learner,language,onEvent:noop,onSettings:noop,onBreak:noop,go:noop})));
  if(missing.length)report.push([`path ${lesson.id} step ${step+1}`,[...new Set(missing)]]);
 }
 const unique=[...new Set(report.flatMap(([,l])=>l))];
 if(list)console.log(unique.join('\n'));
 else for(const [page,lines] of report){console.log(`\n## ${page} (${lines.length})`);for(const t of showAll?lines:lines.slice(0,12))console.log('  - '+t.slice(0,110));}
 console.log(`\nUntranslated English lines: ${unique.length} unique`);
 if(unique.length>max)exitCode=1;
}finally{await server.close();}
process.exit(exitCode);
