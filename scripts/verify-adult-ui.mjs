import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {AdultSpellingHome,AdultSpellingLesson}=await server.ssrLoadModule('/src/ustad/AdultSpelling.jsx');
 const {default:App}=await server.ssrLoadModule('/src/ustad/App.jsx');
 const {adultWords}=await server.ssrLoadModule('/src/ustad/adultContent.js');
 const {freshProfile,validateSaved}=await server.ssrLoadModule('/src/ustad/engine.js');
 const noop=()=>{};
 function lesson(index,stage,language='en',colorMode='light'){
  const keys=['missing','dictation','context'].slice(0,Math.max(0,stage-2)),finished=stage===5;
  const state={itemId:adultWords[index].id,step:Math.min(stage,4),unlocked:Math.min(stage,4),answers:keys.map(key=>({key,correct:true})),passed:keys,finished};
  const profile=validateSaved({profiles:[{...freshProfile('Adult learner'),adventure:{colorMode},learning:{adult:state}}],active:0,language,goal:3}).profiles[0];
  const html=renderToStaticMarkup(createElement(AdultSpellingLesson,{index,profile,language,onCheckpoint:noop,onComplete:noop,onAttempt:noop,go:noop}));
  assert.ok(html.includes(finished?'LESSON COMPLETE':`STEP ${stage+1} OF 5`),adultWords[index].en+': '+stage);
  if(stage===3)assert.ok(html.includes('<h1>Listen and spell</h1>'));
  return html;
 }
 for(let index=0;index<adultWords.length;index++)for(let stage=0;stage<=5;stage++)lesson(index,stage);
 for(const language of ['en','ps','rps','ur','rur','all'])for(const colorMode of ['light','dark']){
  const profile={...freshProfile('Adult learner'),adventure:{colorMode}};
  globalThis.localStorage={getItem:()=>JSON.stringify({profiles:[profile],active:0,language,goal:3})};
  const home=renderToStaticMarkup(createElement(AdultSpellingHome,{profile,go:noop}));assert.ok(home.includes('360'));assert.ok(home.includes('Your vocabulary library'));
  for(const page of ['home','adult-spelling','adult-lesson','spelling']){const html=renderToStaticMarkup(createElement(App,{initialPage:page}));assert.ok(html.includes('Adult spelling')||html.includes('ADULT SPELLING')||html.includes('ADULT ENGLISH'));assert.ok(html.includes(`data-color-mode="${colorMode}"`));}
  for(const index of [0,60,120,180,240,359])for(let stage=0;stage<=5;stage++)lesson(index,stage,language,colorMode);
 }
 console.log('PASS: every adult word renders in all five lesson stages and completion; home, course routes, all languages and light/dark settings render without errors.');
}finally{delete globalThis.localStorage;await server.close();}
