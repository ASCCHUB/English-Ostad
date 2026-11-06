import test from 'node:test';
import assert from 'node:assert/strict';
import {words,phrases} from './content.js';
import {localized} from './i18n.js';
import {support} from './supportCopy.js';
import {pashtoLocale} from './pashtoLocale.js';
import locale from './locales/ps.js';
import {withPashto,pashtoAudio,pashtoAudioStatus} from './pashto.js';
import {convertPashto} from './pashtoStyle.js';
const entries=Object.entries(locale.entries);
const singular=/(^|[^\p{L}\p{M}])(وکړه|کړه|واوره|وګوره|ووایه|کېږده|ولوله|ولیکه|راځه)(?=$|[^\p{L}\p{M}])/u;
test('the Pashto option targets everyday Lower Dir (Malakand) speech',()=>{assert.deepEqual(pashtoLocale.regions,['Lower Dir','Malakand Division']);assert.equal(pashtoLocale.languageTag,'ps-PK');assert.equal(locale.region,'Lower Dir, Malakand Division');});
test('the three approved style phrases appear exactly as approved',()=>{
 assert.equal(support('Let’s start learning').ps,'سبق شروع کړئ.');
 assert.equal(localized('choose','ps'),'صحیح جواب کوم یو دی؟');
 assert.equal(support('Well done, you completed the task!').ps,'ډېر ښه، تاسو ټاسک پوره کړو');
});
test('reviewed wording is used across menus, buttons, feedback and settings',()=>{
 for(const [en,ps] of [['Story corner','قیصې'],['Back','واپس'],['Check my answer','جواب چیک کړئ'],['Pashto help','په پښتو کې مدد'],['A little hint','لږ مدد'],['Automatically play instructions','هدایات په خپله واورول شي']])assert.equal(support(en).ps,ps,en);
 assert.equal(localized('stories','ps'),'قیصې');
 assert.equal(support('Step 2 of 6').ps,'سټیپ 2 / 6');
 assert.equal(support('3 of 10 lessons done').ps,'10 سبقونو کې 3 پوره شول');
});
test('learner-facing labels use the polite plural, not singular commands',()=>{for(const key of ['listen','check','retry','choose','order','start','continue','grammar','writing'])assert.doesNotMatch(localized(key,'ps'),singular,key);assert.equal(localized('listen','ps'),'واورئ');});
test('every Pashto line follows the approved spelling and vocabulary choices',()=>{
 for(const [en,e] of entries){
  assert.doesNotMatch(e.ps,/آواز|لپاره|مرست[هې]|کیس[هېو]|[۰-۹٠-٩]/u,en);
  if(e.status!=='approved'&&e.status!=='check')assert.equal(convertPashto(e.ps,e.rps,en).changed,false,`style rules would still change: ${en}`);
 }
});
test('text built on the fly gets the same style',()=>{assert.equal(support('Find Apple.').ps,'مڼه پیدا کړئ.');assert.equal(support('Listen again. Look for 🍎.').ps,'بیا واورئ. 🍎 پیدا کړئ.');assert.equal(withPashto(phrases.find(p=>p.en==='Please sit down.')).ps,'مهرباني وکړئ، کېنئ.');});
test('words that only look like commands are left alone',()=>{
 assert.equal(locale.entries.Snow.ps,'واوره');assert.equal(locale.entries.Sheep.ps,'مېږه');
 assert.equal(locale.entries['I traced it'].ps,'ما وکاږه');
 assert.match(locale.entries['Today I play. Yesterday I played. Some verbs change: go → went, eat → ate.'].ps,/پرون ما لوبه وکړه/);
 assert.match(locale.entries['The sound did not play. Try again, or keep learning by reading.'].ps,/زده کړه جاري/);
});
test('regional vocabulary is kept and English answer keys are unchanged',()=>{for(const [english,meaning] of [['School','سکول'],['Milk','پۍ'],['Potato','الو'],['Spoon','چمچ']]){const word=words.find(w=>w.en===english);assert.equal(withPashto(word).ps,meaning);assert.match(word.id,/^word-\d+$/);}});
test('every line has a unique audio id and stays pending until recorded',()=>{
 const ids=new Set(entries.map(([,e])=>e.id));assert.equal(ids.size,entries.length);
 for(const [en,e] of entries){assert.match(e.id,/^ps-[0-9a-f]{8}$/);assert.ok(['pending','ready'].includes(e.audio),en);}
 assert.equal(pashtoAudio('Check my answer'),null);assert.equal(pashtoAudioStatus('Check my answer'),'pending');
});
test('lines the rules could not settle are marked for review with a reason',()=>{const checks=entries.filter(([,e])=>e.status==='check');assert.ok(checks.length>0);for(const [en,e] of checks)assert.ok(e.checks?.length,en);assert.equal(locale.entries['New badge'].status,'approved');});
