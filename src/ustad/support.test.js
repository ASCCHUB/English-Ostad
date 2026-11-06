import test from 'node:test';
import assert from 'node:assert/strict';
import {support,supportRows} from './supportCopy.js';
import {classes,adventureGames,discoverTopics,placementQuestions} from './adventureContent.js';
import {stories} from './curriculum.js';
import {words} from './content.js';
import {parseExplorerRoute} from './explorerModel.js';
const langs=['ps','rps','ur','rur'];
const complete=(text)=>{const item=support(text);assert.ok(item,`missing support copy: ${text}`);for(const k of langs)assert.ok(item[k]&&item[k].trim(),`${text}: ${k}`);};
const skip=s=>/^[A-Za-z0-9]$/.test(s);
test('every beginner instruction, question, hint and answer has all support languages',()=>{
 for(const game of adventureGames.slice(0,9)){for(const s of [game.title,game.goal,game.example])complete(s);for(const q of game.questions){complete(q.prompt);complete(q.hint);if(!game.tiles)for(const o of q.options)if(!skip(o))complete(o);}}
 for(const d of discoverTopics){for(const s of [d.title,d.text,d.question.prompt,d.question.hint])complete(s);for(const o of d.question.options)if(!skip(o))complete(o);}
 for(const q of placementQuestions)complete(q.prompt);
 for(const c of classes){complete(c.subtitle);complete(c.goal);for(const u of c.units){complete(u.title);complete(u.concept);}}
 for(const s of stories)for(const q of s.questions){complete(q.prompt);for(const o of q.options)if(!skip(o))complete(o);}
 for(const c of new Set(words.map(w=>w.category)))complete(c);
});
test('support copy addresses one child and keeps regional school wording',()=>{
 const keys=new Set();for(const row of supportRows){assert.equal(row.length,5,row[0]);assert.ok(!keys.has(row[0]),`duplicate ${row[0]}`);keys.add(row[0]);assert.ok(!/وکړئ|کړئ|وټاکئ|ووایئ|ښوونځ/.test(row[1]),row[0]);}
});
test('picture answers reuse word meanings and lesson find prompts are translated',()=>{
 const dog=words.find(w=>w.en==='Dog');assert.equal(support('🐕 Dog').ps,'🐕 '+dog.ps);assert.match(support('Find apple.').ps,/مڼه/);assert.ok(support('Build “I am happy.”').ur.includes('I am happy.'));
});
test('expanded vocabulary has unique pictures and the picture-words route is bounded',()=>{
 assert.equal(new Set(words.map(w=>w.emoji)).size,words.length);assert.ok(words.every(w=>/^[A-Za-z]+$/.test(w.en)));
 const groups=new Set(words.map(w=>w.category)).size+1;assert.equal(parseExplorerRoute(`#/picture-words/${groups-1}`).index,groups-1);assert.equal(parseExplorerRoute(`#/picture-words/${groups}`).index,0);
});
