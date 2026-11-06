import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
try{
 const {default:Course,TaskFrame,FirstStepsParent}=await server.ssrLoadModule('/src/ustad/firstSteps/FirstSteps.jsx');
 const {lessons,recordings}=await server.ssrLoadModule('/src/ustad/firstSteps/tasks.js');
 const {freshSession,freshCourse}=await server.ssrLoadModule('/src/ustad/firstSteps/state.js');
 const {freshProfile,validateSaved}=await server.ssrLoadModule('/src/ustad/engine.js');
 const {default:App}=await server.ssrLoadModule('/src/ustad/App.jsx');
 const {parseExplorerRoute}=await server.ssrLoadModule('/src/ustad/explorerModel.js');
 const {playCourseClip,canPlay}=await server.ssrLoadModule('/src/ustad/firstSteps/audio.js');
 const noop=()=>{};let views=0;
 for(const lesson of lessons)for(const task of lesson.tasks){const html=renderToStaticMarkup(createElement(TaskFrame,{lesson,task,session:freshSession(),send:noop,liveReader:true,paused:false,onPause:noop}));assert.ok(html.includes('fs-task'));assert.ok(!html.includes('undefined'),task.id);assert.ok(html.includes('lang="ps"'),task.id);for(const match of html.matchAll(/src="(\/[^"#?]+)"/g))await access('public'+match[1]);views++;}
 const profile=freshProfile('Sara');for(const map of [true,false])assert.ok(renderToStaticMarkup(createElement(Course,{profile,index:0,map,go:noop,onChange:noop})).includes('first-steps'));
 assert.ok(renderToStaticMarkup(createElement(FirstStepsParent,{profile,go:noop,onChange:noop})).includes('Live adult reader'));
 globalThis.localStorage={getItem:()=>JSON.stringify({profiles:[profile],active:0,language:'ps',goal:3})};assert.ok(renderToStaticMarkup(createElement(App,{initialPage:'home'})).includes('fs-entry'));
 const saved=validateSaved({profiles:[{...profile,firstSteps:freshCourse()}],active:0,language:'ps',goal:3});assert.ok(saved.profiles[0].firstSteps);
 {const last=lessons.length-1;assert.equal(parseExplorerRoute(`#/beginner-lesson/${last}`).index,last);assert.equal(parseExplorerRoute(`#/beginner-lesson/${last+1}`).index,0);}
 // Lower Dir Pashto is never synthesised (recordings only). English letter sounds use the device voice when nothing is recorded (approved 2026-10-27).
 for(const recording of Object.values(recordings).filter(r=>r.language==='ps-PK'))assert.equal(await playCourseClip(recording.id),'pending');
 for(const recording of Object.values(recordings).filter(r=>['pure_phoneme','phoneme_sequence','blend_stretched'].includes(r.kind)))assert.ok(canPlay(recording.id),recording.text);
 console.log(`First Steps: ${views} task views, both course routes, parent settings, home entry, asset paths, backup field, route bounds pending Pashto playback and device-voice letter sounds passed. Actual touch, IndexedDB, voice and WebGL behavior require browser/device testing.`);
}finally{await server.close();}
