import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'});
try{
 const {default:Game}=await server.ssrLoadModule('/src/ustad/FoxAppleGame.jsx');
 const {default:App}=await server.ssrLoadModule('/src/ustad/App.jsx');
 const {foxLessons}=await server.ssrLoadModule('/src/ustad/foxLessonModel.js');
 const {freshProfile}=await server.ssrLoadModule('/src/ustad/engine.js');
 const noop=()=>{};let checks=0;
 for(const [index,lesson] of foxLessons.entries())for(const phase of ['idle','introducing','demonstrating','waiting','encouraging','celebrating','review','completed']){
  const found=['celebrating','review','completed'].includes(phase);
  const profile={...freshProfile(),completed:foxLessons.slice(0,index).map(l=>'fox-game-'+l.id),foxLessons:{[lesson.id]:{version:1,phase,attempts:2,mistakes:1,found}}};
  const html=renderToStaticMarkup(createElement(Game,{profile,index,onCheckpoint:noop,onComplete:noop,go:noop}));
  assert.ok(html.includes(lesson.title));assert.equal((html.match(/aria-label="Choose /g)||[]).length,3);assert.ok(html.includes('Reduced motion'));assert.ok(html.includes('Pashto help'));assert.ok(!html.includes('undefined'));
  if(phase==='review'||phase==='celebrating')assert.ok(html.includes('Save and finish'));
  if(phase==='completed'&&index<4)assert.ok(html.includes('Next:'));
  checks++;
 }
 const locked=renderToStaticMarkup(createElement(Game,{profile:freshProfile(),index:1,go:noop}));assert.ok(locked.includes('Finish the previous Fox activity'));assert.ok(!locked.includes('Choose '));
 globalThis.localStorage={getItem:()=>JSON.stringify({profiles:[freshProfile()],active:0,language:'en',goal:3})};
 assert.ok(renderToStaticMarkup(createElement(App,{initialPage:'games'})).includes('Play with Fox'));
 assert.ok(renderToStaticMarkup(createElement(App,{initialPage:'fox-game'})).includes('Help Fox Find the Apple'));
 console.log(`Fox UI: ${checks} lesson/checkpoint combinations, locked entry, Games entry and app route passed. Browser effects, WebGL and speech require device verification.`);
}finally{await server.close();}
