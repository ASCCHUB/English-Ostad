import test from 'node:test';
import assert from 'node:assert/strict';
import {foxLessons,newFoxSession,foxTransition,foxCheckpoint,restoreFoxSession,validateFoxLessons,foxLessonUnlocked,foxCharacterState} from './foxLessonModel.js';
import {freshProfile,validateSaved} from './engine.js';
import {saveFoxSession,completeFoxSession} from './foxProgress.js';
import {parseExplorerRoute} from './explorerModel.js';
import {makeFox} from './foxScene3d.js';
const lesson=foxLessons[0];
const advance=s=>foxTransition(s,{type:'ADVANCE',phase:s.phase,epoch:s.epoch},lesson);
function waiting(){return advance(advance(foxTransition(newFoxSession(),{type:'START'},lesson)));}
test('Fox waits for a real answer, encourages mistakes, and blocks double taps',()=>{
 let s=waiting();assert.equal(s.phase,'waiting');assert.equal(advance(s),s);
 assert.equal(foxTransition(s,{type:'PICK',id:'not-a-choice'},lesson),s);
 s=foxTransition(s,{type:'PICK',id:'ball'},lesson);assert.equal(s.phase,'encouraging');assert.equal(s.mistakes,1);
 assert.equal(foxTransition(s,{type:'PICK',id:'apple'},lesson),s);
 s=advance(s);s=foxTransition(s,{type:'PICK',id:'apple'},lesson);assert.equal(s.phase,'celebrating');assert.equal(s.attempts,2);
 assert.equal(foxTransition(s,{type:'PICK',id:'apple'},lesson),s);s=advance(s);assert.equal(s.phase,'review');assert.equal(foxCharacterState(s.phase),'celebrating');
 s=foxTransition(s,{type:'COMPLETE'},lesson);assert.equal(s.phase,'completed');
});
test('Pause and replay invalidate old asynchronous events',()=>{
 let s=foxTransition(newFoxSession(),{type:'START'},lesson);const event={type:'ADVANCE',phase:s.phase,epoch:s.epoch};
 s=foxTransition(s,{type:'PAUSE'},lesson);assert.equal(foxTransition(s,event,lesson),s);
 s=foxTransition(s,{type:'RESUME'},lesson);assert.equal(foxTransition(s,event,lesson),s);
 const before=s;s=foxTransition(s,{type:'INVALIDATE'},lesson);assert.equal(foxTransition(s,{...event,epoch:before.epoch},lesson),s);
 s=foxTransition(s,{type:'RESTART'},lesson);assert.equal(s.phase,'introducing');assert.equal(s.found,false);
});
test('Interrupted lessons resume at safe boundaries without awarding completion',()=>{
 let s=waiting();assert.equal(restoreFoxSession(foxCheckpoint(s)).phase,'waiting');s=foxTransition(s,{type:'PICK',id:'apple'},lesson);
 const restored=restoreFoxSession(foxCheckpoint(s));assert.equal(restored.phase,'review');assert.equal(restored.paused,false);
 const p=saveFoxSession(freshProfile(),lesson.id,s);assert.equal(p.xp,0);assert.equal(foxLessonUnlocked(p,1),false);
 assert.throws(()=>completeFoxSession(p,lesson.id,s));
 s=foxTransition(restored,{type:'COMPLETE'},lesson);const completed=completeFoxSession(p,lesson.id,s);assert.equal(completed.xp,10);assert.equal(foxLessonUnlocked(completed,1),true);
 const repeated=completeFoxSession(completed,lesson.id,s);assert.equal(repeated.xp,10);assert.equal(repeated.activityLog.length,1);
 assert.equal(freshProfile().foxLessons,undefined);
});
test('Saved Fox progress validates alongside existing profiles and rejects malformed checkpoints',()=>{
 const p=saveFoxSession(freshProfile(),lesson.id,waiting());const saved=validateSaved({profiles:[p],active:0,language:'ps',goal:3});assert.equal(saved.profiles[0].foxLessons.apple.phase,'waiting');
 for(const invalid of [{phase:'waiting',found:true},{attempts:-1},{mistakes:10},{phase:'completed',found:true,attempts:0}])assert.throws(()=>validateFoxLessons({apple:{...foxCheckpoint(waiting()),...invalid}}));
 assert.throws(()=>validateFoxLessons({unknown:foxCheckpoint(waiting())}));assert.deepEqual(validateFoxLessons(undefined),{});
});
test('Each reusable lesson can complete with its own target and route bounds are safe',()=>{
 for(const l of foxLessons){let s=newFoxSession();s=foxTransition(s,{type:'START'},l);for(let i=0;i<2;i++)s=foxTransition(s,{type:'ADVANCE',phase:s.phase,epoch:s.epoch},l);s=foxTransition(s,{type:'PICK',id:l.target},l);s=foxTransition(s,{type:'ADVANCE',phase:s.phase,epoch:s.epoch},l);s=foxTransition(s,{type:'COMPLETE'},l);assert.equal(s.phase,'completed');assert.doesNotThrow(()=>validateFoxLessons({[l.id]:foxCheckpoint(s)}));}
 assert.deepEqual(parseExplorerRoute('#/fox-game/4'),{page:'fox-game',index:4});assert.equal(parseExplorerRoute('#/fox-game/5').index,0);
});
test('Fox rig has an articulated face, limbs, tail, and renderable finite geometry',()=>{
 const f=makeFox();assert.equal(f.eyes.length,2);assert.equal(f.legs.length,2);assert.equal(f.arms.length,2);let meshes=0;f.root.updateMatrixWorld();f.root.traverse(o=>{assert.ok(o.matrixWorld.elements.every(Number.isFinite));if(o.isMesh){meshes++;o.geometry.computeBoundingSphere();assert.ok(Number.isFinite(o.geometry.boundingSphere.radius));o.geometry.dispose();o.material.dispose();}});assert.ok(meshes>20);
});
