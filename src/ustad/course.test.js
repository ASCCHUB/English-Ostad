import test from 'node:test';
import assert from 'node:assert/strict';
import {words,phonics,alphabet} from './content.js';
import {phonicsSupport} from './curriculum.js';
import {freshProfile,recordWord,skillAccuracy,seededRandom,makePractice,validateSaved} from './engine.js';
test('phonics notes align with all sound lessons and every letter has sound examples',()=>{assert.equal(phonics.length,16);assert.equal(phonicsSupport.length,phonics.length);assert.ok(alphabet.every(a=>a.sound&&a.sound.includes('/')));});
test('daily question set is repeatable for the same learner and day',()=>{const profile=freshProfile();const daily=seed=>makePractice(words,{profile,random:seededRandom(seed)}).map(q=>({id:q.word.id,options:q.options}));assert.deepEqual(daily('2026-10-24:Ali'),daily('2026-10-24:Ali'));assert.notDeepEqual(daily('2026-10-24:Ali'),daily('2026-10-25:Ali'));});
test('spelling accuracy includes wrong and correct typed-word attempts and survives backup',()=>{let p=freshProfile();p=recordWord(p,'word-1',false,1000,'spelling');p=recordWord(p,'word-1',true,1000,'spelling');p=recordWord(p,'word-2',true,1000,'audio');assert.equal(skillAccuracy(p,'spelling'),50);const result=validateSaved({profiles:[p],active:0,language:'ps',goal:3});assert.equal(skillAccuracy(result.profiles[0],'spelling'),50);});
test('resume index accepts later vocabulary and rejects invalid alphabet positions',()=>{const p={...freshProfile(),resume:'vocabulary',resumeIndex:89};const state={profiles:[p],active:0,language:'ps',goal:3};assert.equal(validateSaved(state).profiles[0].resumeIndex,89);p.resume='alphabet';assert.equal(validateSaved(state).profiles[0].resumeIndex,0);});
