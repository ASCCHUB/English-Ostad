import test from 'node:test';
import assert from 'node:assert/strict';
import {classes,units,adventureGames,discoverTopics,placementQuestions} from './adventureContent.js';
import {CLASS_COUNT,defaultAdventure,validateAdventure,logAdventure,suggestedClass,unitProgress} from './adventureEngine.js';
import {freshProfile,validateSaved} from './engine.js';
import {parseExplorerRoute,ROUTES} from './explorerModel.js';
test('ten ability classes run from beginner to advanced with unique units and valid destinations',()=>{
 assert.equal(classes.length,CLASS_COUNT);assert.equal(units.length,30);assert.equal(new Set(units.map(u=>u.id)).size,30);
 assert.deepEqual([...new Set(classes.map(c=>c.stage))],['Beginner','Elementary','Intermediate','Advanced']);for(const c of classes)assert.ok(c.cefr&&c.goal&&c.units.length===3);
 for(const u of units.filter(u=>u.check)){assert.equal(u.check.options.filter(o=>o===u.check.answer).length,1);assert.ok(u.check.hint);assert.ok(u.points.length>=3&&u.examples.length>=3);}
 for(const u of units)assert.ok(/^[-a-z0-9]+$/.test(u.id));
 for(const [i,u] of units.entries()){assert.equal(u.globalIndex,i);assert.ok(adventureGames[u.game]);assert.ok(ROUTES.includes(u.route));assert.equal(u.objects.length,3);assert.equal(new Set(u.objects).size,3);assert.ok(u.concept&&u.title);}
});
test('all game answer keys and repeatable tile answers are valid',()=>{
 assert.equal(adventureGames.length,24);assert.equal(new Set(adventureGames.map(g=>g.id)).size,24);
 for(const game of adventureGames){assert.ok(game.questions.length>=3);for(const q of game.questions){assert.ok(q.hint);if(game.tiles){assert.deepEqual(q.options.join(game.join||'').split('').sort(),q.answer.split('').sort());}else{assert.equal(q.options.filter(o=>o===q.answer).length,1);assert.equal(new Set(q.options).size,q.options.length);}}}
});
test('all Discover topics and starting questions have exactly one correct answer',()=>{
 assert.equal(discoverTopics.length,12);for(const q of [...discoverTopics.map(d=>d.question),...placementQuestions])assert.equal(q.options.filter(o=>o===q.answer).length,1);
});
test('starting suggestions follow prerequisite skills rather than total lucky answers',()=>{
 assert.equal(suggestedClass([false,true,true,true,true]),0);assert.equal(suggestedClass([true,true,false,true,true]),2);assert.equal(suggestedClass([true,true,true,true,true]),5);assert.equal(placementQuestions.length,CLASS_COUNT);assert.equal(suggestedClass(placementQuestions.map(()=>true)),CLASS_COUNT-1);
});
test('viewing a scene is separate from demonstrating understanding and earns no lesson points',()=>{
 const initial=freshProfile('Sara'),watched=logAdventure(initial,'watch-apple',{kind:'watched',attempts:0});assert.equal(watched.xp,0);assert.deepEqual(watched.completed,[]);assert.equal(unitProgress(watched,'apple').watched,true);assert.equal(unitProgress(watched,'apple').joined,false);
 const joined=logAdventure(watched,'join-apple',{attempts:2,needsReview:true});assert.equal(joined.xp,10);assert.equal(unitProgress(joined,'apple').joined,true);assert.equal(joined.adventure.events['join-apple'].needsReview,true);
});
test('revisiting preserves unique points, adds real attempts and clears resolved revision',()=>{
 let p=logAdventure(freshProfile(),'review-apple',{attempts:3,needsReview:true});p=logAdventure(p,'review-apple',{attempts:1,needsReview:false});assert.equal(p.xp,10);assert.equal(p.completed.length,1);assert.equal(p.adventure.events['review-apple'].attempts,4);assert.equal(p.adventure.events['review-apple'].needsReview,false);
});
test('adventure preferences, events and optional English-only support survive progress backups',()=>{
 let p=logAdventure(freshProfile('Sara'),'discover-count',{attempts:1});p={...p,adventure:{...p.adventure,classIndex:3,avatar:'turtle',reducedMotion:true,captions:false,sessionLength:5,recording:true,placement:2}};
 const restored=validateSaved(JSON.parse(JSON.stringify({profiles:[p],active:0,language:'en',goal:3})));assert.deepEqual(restored.profiles[0].adventure,p.adventure);assert.equal(restored.language,'en');assert.equal(restored.profiles[0].completed[0],'discover-count');
});
test('old progress gets safe adventure defaults without changing existing learning records',()=>{
 const p=freshProfile('Ali');p.completed=['alphabet-A'];const restored=validateSaved({profiles:[p],active:0,language:'ps',goal:3}).profiles[0];assert.equal(restored.adventure.recording,false);assert.equal(restored.adventure.classIndex,0);assert.equal(restored.completed[0],'alphabet-A');
});
test('malformed adventure backups cannot inject preferences or event records',()=>{
 for(const patch of [{classIndex:CLASS_COUNT},{avatar:'stranger'},{recording:'yes'},{sessionLength:-1},{events:[]},{placement:CLASS_COUNT},{events:{bad:{kind:'watched',attempts:-1,date:new Date().toISOString(),needsReview:false}}},{events:{bad:{kind:'mastered',attempts:1,date:new Date().toISOString(),needsReview:false}}}])assert.throws(()=>validateAdventure({...defaultAdventure,...patch}));
 assert.equal(validateAdventure({...defaultAdventure,extra:'ignored'}).extra,undefined);
});
test('profiles keep their own class, avatar and demonstrated activities',()=>{
 const one=logAdventure(freshProfile('A'),'join-apple'),two=freshProfile('B');assert.ok(one.adventure.events['join-apple']);assert.equal(two.adventure,undefined);
});
test('new route indices are bounded by the actual game, class, unit and topic counts',()=>{
 for(const [route,size] of [['class-map',classes.length],['adventure-lesson',units.length],['adventure-game',units.length],['play-game',adventureGames.length],['discover-lesson',discoverTopics.length],['story-player',6]]){assert.deepEqual(parseExplorerRoute(`#/${route}/${size-1}`),{page:route,index:size-1});assert.equal(parseExplorerRoute(`#/${route}/${size}`).index,0);}
});
