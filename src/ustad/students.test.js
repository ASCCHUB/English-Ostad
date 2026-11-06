import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile,validateSaved} from './engine.js';
import {freshCourse,outlineLessons} from './firstSteps/state.js';
import {addStudent,selectStudent,studentStandings,MAX_STUDENTS} from './students.js';
test('students have independent IDs, lessons and saved profiles',()=>{
 let saved={profiles:[{...freshProfile('Ali'),firstSteps:freshCourse()}],active:0,language:'ps',goal:3};
 const first=saved.profiles[0];saved=addStudent(saved,'  Sara  ');saved=addStudent(saved,'Omar');
 assert.equal(saved.profiles.length,3);assert.equal(saved.active,2);assert.equal(saved.profiles[1].name,'Sara');
 assert.equal(new Set(saved.profiles.map(p=>p.id)).size,3);assert.equal(saved.profiles[0],first);
 saved=selectStudent(saved,first.id);assert.equal(saved.active,0);
 assert.equal(validateSaved(JSON.parse(JSON.stringify(saved))).profiles.length,3);
 assert.equal(selectStudent(saved,'unknown'),saved);assert.equal(addStudent(saved,'  '),saved);
 const full={...saved,profiles:Array.from({length:MAX_STUDENTS},(_,i)=>freshProfile('Student '+i))};assert.equal(addStudent(full,'Extra'),full);
});
test('competition counts unique mastered lessons and gives ties the same rank',()=>{
 const lesson=outlineLessons[0].id,second=outlineLessons[1].id;
 const p=(name,ids)=>({...freshProfile(name),firstSteps:{...freshCourse(),mastered:Object.fromEntries(ids.map(id=>[id,{}]))}});
 const rows=studentStandings([p('Ali',[lesson,second]),p('Sara',[lesson,second]),p('Omar',[lesson]),p('New',[])]);
 assert.deepEqual(rows.map(p=>p.rank),[1,1,3,4]);assert.deepEqual(rows.map(p=>p.stars),[2,2,1,0]);
 assert.equal(studentStandings([p('Other',['unknown-lesson'])])[0].stars,0);
});
