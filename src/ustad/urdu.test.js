import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {urdu,urduGameTemplates,urduHints} from './locales/ur.js';
import {templates} from './games/content/pashto.js';
import {lessons} from './firstSteps/tasks.js';
const arabicScript=/[\u0600-\u06FF]/;
test('every course instruction has an Urdu line',()=>{
 const missing=[...new Set(lessons.flatMap(l=>l.tasks.map(t=>t.instructionEn)).filter(Boolean))].filter(en=>!urdu(en));
 assert.deepEqual(missing,[]);
 for(const l of lessons)for(const t of l.tasks)if(t.hintPs)assert.ok(urduHints[t.hintPs],t.hintPs);
});
test('every game skill and question has Urdu, written in Urdu script',()=>{
 assert.deepEqual(Object.keys(templates).filter(k=>!urduGameTemplates[k]),[]);
 for(const id of ['letter-hunt','sound-safari','feed-animal','number-adventure','fox-apple'])for(const q of JSON.parse(fs.readFileSync(`src/ustad/games/bank/${id}.json`,'utf8')).questions)assert.match(q.instruction.ur.text,arabicScript,q.id);
});
test('Urdu patterns keep numbers and English names',()=>{
 assert.equal(urdu('Level 3 · Round 2'),'لیول 3 · راؤنڈ 2');
 assert.equal(urdu('Which picture starts with sss?'),'کون سی تصویر sss کی آواز سے شروع ہوتی ہے؟');
 assert.equal(urdu('Something with no Urdu yet'),null);
});
