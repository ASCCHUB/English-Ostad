import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {words} from './content.js';
import {wordPhoto,photoLibrary} from './wordPhotos.js';
test('Every vocabulary picture and course picture has a local image',()=>{
 for(const word of words)assert.ok(wordPhoto(word.en),word.en);
 for(const key of Object.keys(photoLibrary.words)){
  const photo=wordPhoto(key);assert.ok(photo,key);
  assert.match(photo.src,/^\/(learning-photos|explorers|drawings)\/[a-z0-9-]+\.(jpg|png|svg)$/);
  assert.ok(existsSync('public'+photo.src),`${key}: ${photo.src}`);
 }
 const source=readFileSync('src/ustad/firstSteps/tasks.js','utf8');
 const pictureKeys=[...source.match(/const pictures=\{([^\n]+)\};/)[1].matchAll(/(?:^|,)([a-z]+):/g)].map(m=>m[1]);
 for(const key of pictureKeys)assert.ok(wordPhoto(key),key);
 assert.equal(wordPhoto('Pen').src,'/learning-photos/pen.png');
 assert.equal(wordPhoto('Mum'),wordPhoto('Mother'));
 assert.equal(wordPhoto('SAT'),wordPhoto('sit'));
});
test('Quantity pictures preserve exact counts and color pictures retain their colors',()=>{
 ['one','two','three','four','five','six','seven','eight','nine','ten'].forEach((w,i)=>assert.equal(wordPhoto(w).count,i+1));
 // Drawn in the exact colour (a CSS colour filter is ignored by some phones and showed a "red" ball blue).
 for(const c of ['red','blue','green','yellow','purple','brown','pink','grey','black','white'])assert.equal(wordPhoto(c).src,`/drawings/ball-${c}.svg`);
 assert.equal(wordPhoto('not-a-word'),null);
 const credits=JSON.parse(readFileSync('public/learning-photos/credits.json'));
 for(const [word,p] of Object.entries(photoLibrary.words).filter(([,p])=>p.src?.startsWith('/learning-photos/')))assert.ok(credits.images.some(c=>c.src===p.src),word);
});
