import test from 'node:test';
import assert from 'node:assert/strict';
import {collectSpeech,splitSentences} from '../../scripts/speech-texts.mjs';
import {speechKey} from './speechKey.js';
test('the Pakistani voice list covers game instructions and never includes letter sounds',async()=>{
 const list=await collectSpeech(),keys=new Set(list.map(l=>l.key));
 assert.ok(list.length>3000);
 for(const t of ['Find the uppercase letter A.','Give the rabbit a carrot.',"Let's try together."])assert.ok(keys.has(speechKey(t)),t);
 assert.ok(list.every(l=>!/\/[a-z]+\//i.test(l.text)));
 assert.equal(new Set(list.map(l=>l.key)).size,list.length);
});
test('lines match clips regardless of case and punctuation; long lines split into sentences',()=>{
 assert.equal(speechKey('Find the cat.'),speechKey('find  the CAT'));
 assert.equal(speechKey('Let’s go!'),speechKey("let's go"));
 assert.deepEqual(splitSentences("Let's try together. A has two lines."),["Let's try together.",'A has two lines.']);
});
