import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBank} from './games/validateBank.js';
import {recordings} from './firstSteps/tasks.js';
import {emptyGame,startRound,recordAnswer,advance,finishRound,currentLevel,nextPart,levelDone,reviewCandidates,totalStars,unfinishedRound,withGame,gameState,validateGames,isIndependent} from './games/progress.js';
import {games,upcoming} from './games/catalog.js';
import {freshProfile,validateSaved} from './engine.js';
import {parseExplorerRoute} from './explorerModel.js';
import {sceneMarkup} from './games/art.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const load=id=>JSON.parse(fs.readFileSync(path.join(root,'src/ustad/games/bank',id+'.json'),'utf8'));
const banks=Object.fromEntries(games.map(g=>[g.id,load(g.id)]));

test('each of the five games has 200 valid, distinct questions in 20 levels of 10',()=>{
 let total=0;
 for(const g of games){const bank=banks[g.id];
  const errors=validateBank(bank,{recordings,fileExists:src=>fs.existsSync(path.join(root,'public',src))});
  assert.deepEqual(errors,[],`${g.id}:\n${errors.slice(0,10).join('\n')}`);
  assert.equal(bank.questions.length,200);assert.equal(g.questions,200);
  assert.equal(new Set(bank.questions.map(q=>q.key)).size,200);
  total+=bank.questions.length;}
 assert.ok(total>=1000);
 assert.equal(new Set(Object.values(banks).flatMap(b=>b.questions.map(q=>q.id))).size,total);
});
test('every Fox scene draws its landmark and object',()=>{
 for(const q of banks['fox-apple'].questions)for(const s of [q.prompt.scene,...q.options.map(o=>o.scene)].filter(Boolean)){const svg=sceneMarkup(s);assert.ok(svg.startsWith('<svg')&&[3,4].includes((svg.match(/<svg/g)||[]).length),q.id);}
});
test('sound questions never ask the device voice to say a phoneme',()=>{
 for(const q of banks['sound-safari'].questions){assert.doesNotMatch(q.say,/\/\w+\//);if(q.prompt.sound)assert.ok(recordings[q.prompt.sound.recording],q.id);}
 assert.ok(banks['sound-safari'].questions.filter(q=>q.skill==='sound-letter').every(q=>q.prompt.hideGrapheme&&q.prompt.sound.example));
});
test('upcoming games have no playable entry',()=>{for(const u of upcoming){assert.equal(u.questions,undefined);assert.ok(!games.some(g=>g.id===u.id));}});

// ---------- progress ----------
const bank=banks['letter-hunt'];
function playRound(state,outcome){state=startRound(state,bank,{});for(const id of state.current.ids){const q=bank.questions.find(x=>x.id===id);state=recordAnswer(state,id,typeof outcome==='function'?outcome(id):outcome,q.skill);state=advance(state);}return finishRound(state);}
test('a level is two rounds of five; unseen questions come first and do not repeat within a round',()=>{
 let s=startRound(emptyGame(),bank,{});
 assert.equal(s.current.ids.length,5);assert.equal(new Set(s.current.ids).size,5);
 assert.deepEqual(s.current.ids,bank.questions.filter(q=>q.level===1&&q.round===1).map(q=>q.id));
 const first=playRound(emptyGame(),'first').state;
 assert.equal(nextPart(first,1),2);
 const second=startRound(first,bank,{});
 assert.equal(second.current.ids.filter(id=>first.rounds['1-1'].ids.includes(id)).length,0,'round 2 plays the five unseen questions');
});
test('the next level unlocks once, after both rounds; stars are not awarded twice',()=>{
 let {state,summary}=playRound(emptyGame(),'first');
 assert.equal(state.unlocked,1);assert.equal(summary.stars,3);assert.equal(summary.newStars,3);
 ({state,summary}=playRound(state,'first'));
 assert.equal(state.unlocked,2);assert.equal(summary.unlocked,2);assert.equal(currentLevel(state),2);
 const stars=totalStars(state);
 // Replaying level 1 gives no new stars and no second unlock.
 let replay=startRound(state,bank,{level:1,part:1});for(const id of replay.current.ids){replay=recordAnswer(replay,id,'first','x');replay=advance(replay);}
 const again=finishRound(replay);
 assert.equal(again.summary.newStars,0);assert.equal(again.summary.unlocked,null);assert.equal(totalStars(again.state),stars);
 // Finishing twice does nothing the second time.
 assert.equal(finishRound(again.state).summary,null);
});
test('a replay can add only the improvement in stars',()=>{
 let {state,summary}=playRound(emptyGame(),'shown');assert.equal(summary.stars,1);
 let r=startRound(state,bank,{level:1,part:1});for(const id of r.current.ids){r=recordAnswer(r,id,'first','x');r=advance(r);}
 const out=finishRound(r);assert.equal(out.summary.newStars,2);assert.equal(out.summary.improved,true);assert.equal(totalStars(out.state),3);
});
test('answers shown by the app are not mastered; double taps are ignored; weak rounds offer a review',()=>{
 let s=startRound(emptyGame(),bank,{});const [a,b]=s.current.ids;
 s=recordAnswer(s,a,'shown','uppercase');s=recordAnswer(s,a,'first','uppercase');
 assert.equal(s.current.results[a],'shown');assert.equal(isIndependent(s.answers[a]),false);
 s=recordAnswer(s,b,'hint','uppercase');
 for(const id of s.current.ids.slice(2))s=recordAnswer(s,id,'first','uppercase');
 const {state,summary}=finishRound(s);
 assert.deepEqual(summary.offerReview,[a,b]);assert.equal(summary.first,3);
 assert.deepEqual(new Set(reviewCandidates(state)),new Set([a,b]));
 const review=startRound(state,bank,{review:true});assert.equal(review.current.kind,'review');
});
test('progress is saved per child and per game, and survives closing, reopening and backups',()=>{
 let child=freshProfile('Sara'),other=freshProfile('Ali');
 let s=startRound(gameState(child,'letter-hunt'),bank,{});s=recordAnswer(s,s.current.ids[0],'first','uppercase');s=advance(s);
 child=withGame(child,'letter-hunt',s);
 const restored=validateSaved(JSON.parse(JSON.stringify({profiles:[child,other],active:0,language:'ps',goal:3})));
 const back=gameState(restored.profiles[0],'letter-hunt');
 assert.equal(back.current.index,1);assert.equal(Object.keys(back.answers).length,1);
 assert.equal(gameState(restored.profiles[1],'letter-hunt').current,null);
 assert.equal(gameState(restored.profiles[0],'sound-safari').current,null);
 assert.equal(unfinishedRound(restored.profiles[0]).game,'letter-hunt');
 assert.equal(validateGames({byGame:{'letter-hunt':{unlocked:99,answers:{bad:{best:'x'}},current:{kind:'level',ids:['nope']}}}}).byGame['letter-hunt'].unlocked,1);
});
test('every level is reachable and the game route opens each game',()=>{
 let s=emptyGame();for(let l=1;l<=20;l++){assert.equal(currentLevel(s),l);s=playRound(s,'hint').state;s=playRound(s,'hint').state;assert.ok(levelDone(s,l));}
 assert.equal(s.unlocked,20);
 for(let i=0;i<10;i++)assert.deepEqual(parseExplorerRoute(`#/game-play/${i}`),{page:'game-play',index:i});
});
