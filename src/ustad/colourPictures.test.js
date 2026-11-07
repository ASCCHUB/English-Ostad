import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {course} from './firstSteps/tasks.js';
import {sceneFor,COLOURS} from './firstSteps/scenes.js';
import {wordPhoto} from './wordPhotos.js';
import drawings from './drawings.json' with {type:'json'};

// A child must see the colour the sentence says ("a red ball" is red), on every phone.
test('every course sentence that names a colour shows an object drawn in that colour',()=>{
 const texts=new Set(),walk=o=>{if(typeof o==='string')texts.add(o);else if(o&&typeof o==='object')Object.values(o).forEach(walk);};walk(course.lessons);
 let checked=0;
 for(const text of texts){const scene=sceneFor(text);if(!scene.object)continue;
  const base=scene.object.replace(/-.*/,''),said=String(text).toLowerCase().match(new RegExp(String.raw`\b(${COLOURS.join('|')})\s+${base}s?\b`))?.[1];
  if(!said)continue;checked++;
  assert.equal(scene.object,base+'-'+said,`"${text}" needs a ${said} ${base} drawing`);
  const picture=wordPhoto(scene.object);assert.equal(picture?.kind,'drawing',text);
  assert.ok(!picture.color,`"${text}" must not rely on a colour filter`);
 }
 assert.ok(checked>=10,'the course colour phrases were found: '+checked);
});

test('colour words show a ball drawn in that exact colour, never a filtered photo',()=>{
 for(const c of ['red','blue','green','yellow','purple','pink','brown','black','white','grey']){const p=wordPhoto(c);assert.equal(p?.src,`/drawings/ball-${c}.svg`,c);assert.ok(!p.color,c);}
 assert.equal(wordPhoto('orange')?.src,'/learning-photos/orange.jpg','orange stays the fruit');
 const red=readFileSync(new URL('../../public/drawings/ball-red.svg',import.meta.url),'utf8'),blue=readFileSync(new URL('../../public/drawings/ball-blue.svg',import.meta.url),'utf8');
 assert.match(red,/fill="#E53935"/);assert.doesNotMatch(red,/#1E88E5/);assert.match(blue,/fill="#1E88E5"/);
});

test('every listed drawing file exists and no picture uses a hue-rotate filter',()=>{
 for(const d of drawings)assert.ok(existsSync(new URL(`../../public/drawings/${d}.svg`,import.meta.url)),d);
 for(const f of ['./firstSteps/parts.jsx','./WordPicture.jsx'])assert.doesNotMatch(readFileSync(new URL(f,import.meta.url),'utf8'),/hue-rotate\(150/,f);
});
