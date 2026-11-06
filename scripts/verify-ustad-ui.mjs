import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {default:App}=await server.ssrLoadModule('/src/ustad/App.jsx');
 const {Translation,Label}=await server.ssrLoadModule('/src/ustad/shared.jsx');
 const {default:PracticeQuiz}=await server.ssrLoadModule('/src/ustad/PracticeQuiz.jsx');
 const {GrammarLibrary,StoryLibrary}=await server.ssrLoadModule('/src/ustad/LessonLibraries.jsx');
 const {words}=await server.ssrLoadModule('/src/ustad/content.js');
 const {phonicsSupport}=await server.ssrLoadModule('/src/ustad/curriculum.js');
 const {freshProfile,makePractice}=await server.ssrLoadModule('/src/ustad/engine.js');
 const courses=await server.ssrLoadModule('/src/ustad/StudyCourses.jsx');
 const {spellingWords,sentenceLessons,readingLessons,wordFamilies}=await server.ssrLoadModule('/src/ustad/studyContent.js');
 const adventure=await server.ssrLoadModule('/src/ustad/AdventureScreens.jsx');
 const {ExtraTools}=await server.ssrLoadModule('/src/ustad/ExplorerScreens.jsx');
 const {units,adventureGames,discoverTopics}=await server.ssrLoadModule('/src/ustad/adventureContent.js');
 const {defaultAdventure}=await server.ssrLoadModule('/src/ustad/adventureEngine.js');
 const {default:Appearance}=await server.ssrLoadModule('/src/ustad/Appearance.jsx');
 for(const backgroundTheme of ['clouds','forest','sunrise','stars'])for(const colorMode of ['light','dark','system']){
  const profile={...freshProfile('Sara'),adventure:{...defaultAdventure,backgroundTheme,colorMode}};
  globalThis.localStorage={getItem:()=>JSON.stringify({profiles:[profile],active:0,language:'en',goal:3})};
  for(const page of ['home','classes','class-map','adventure-lesson','games','story-player','discover','progress','appearance','spelling','sentences','speaking','parent']){
   const html=renderToStaticMarkup(createElement(App,{initialPage:page}));
   assert.ok(html.includes(`data-background="${backgroundTheme}"`));assert.ok(html.includes(`data-color-mode="${colorMode==='dark'?'dark':'light'}"`));
   assert.ok(html.includes(colorMode==='dark'?'Switch to light mode':'Switch to dark mode'));
  }
  const picker=renderToStaticMarkup(createElement(Appearance,{settings:profile.adventure,onChange:()=>{}}));
  // One colour mode and one background are chosen; the sound section starts with English audio, Pashto audio and effects on.
  const sound=picker.match(/<section class="appearance-section sound-settings"[\s\S]*?<\/section>/)?.[0]||'';assert.ok(sound);
  // Colour mode and background are radio groups; sound options are switches; voice and speed are radio groups.
  assert.equal((picker.replace(sound,'').match(/role="radio" aria-checked="true"/g)||[]).length,2);
  assert.equal((sound.match(/role="switch" aria-checked="true"/g)||[]).length,3);assert.equal((sound.match(/role="radio" aria-checked="true"/g)||[]).length,2);assert.ok(!/aria-pressed/.test(picker));
 }
 const noop=()=>{};
 for(const language of ['en','ps','rps','ur','rur','all']){
  console.log('Checking screens: '+language);
  const store={profiles:[freshProfile('Ali')],active:0,language,goal:3};
  globalThis.localStorage={getItem:()=>JSON.stringify(store)};
  const home=renderToStaticMarkup(createElement(App,{initialPage:'home'}));
  assert.ok(home.includes('Hi, Ali!'));
  // Home: the greeting, one big Continue and the lesson map; the other tools are in the parent area.
  assert.ok(home.includes('fs-continue-big'));
  assert.ok(!home.includes('Your learning studio'));
  const tools=renderToStaticMarkup(createElement(ExtraTools,{profile:store.profiles[0],language,go:noop,onCategory:noop,goal:3,todayCount:0,due:0,onStory:noop,onReview:noop}));
  // Parent area: Adult mode only; the old children's sections are class practice and Topics.
  assert.ok(tools.includes('Adult mode'));
  // One learning path: the home shows the 10-class map; Topics and Play have their own pages.
  assert.ok(home.includes('lp-map')&&home.includes('Class 10'));
  assert.ok(renderToStaticMarkup(createElement(App,{initialPage:'topics'})).includes('lp-topic-grid'));
  assert.ok(renderToStaticMarkup(createElement(App,{initialPage:'games'})).includes('Letter Hunt'));
  for(const [page,expected] of [['journey','My adventure map'],['path-lesson','Meet your new friends'],['setup','Play as a guest'],['classes','lp-map'],['class-map','Watch → Listen → Join in → Play → Review'],['adventure-lesson','A little apple adventure'],['adventure-game','Letter Hunt'],['play-game','Letter Hunt'],['discover','What will you discover?'],['discover-lesson','Count &amp; add'],['level-check','Quick exam'],['story-library','Story corner'],['story-player','Ali and the apples']])assert.ok(renderToStaticMarkup(createElement(App,{initialPage:page})).includes(expected),page);
  const props={profile:store.profiles[0],language,onEvent:noop,onSettings:noop,go:noop};
  for(const avatar of ['fox','bunny','turtle']){
   const picker=renderToStaticMarkup(createElement(adventure.AvatarGarden,{profile:{...props.profile,adventure:{avatar}},onSettings:noop}));
   for(const id of ['fox','bunny','turtle'])assert.ok(picker.includes(`/explorers/avatar-${id}.png`));
   assert.equal((picker.match(/aria-pressed="true"/g)||[]).length,1);
   assert.ok(!/[\u{1F98A}\u{1F407}\u{1F422}]/u.test(picker),'Avatar picker still contains emoji');
  }
  for(let i=0;i<5;i++)assert.ok(renderToStaticMarkup(createElement(adventure.ClassMap,{...props,index:i})).includes('map-unit'));
  for(const unit of units)for(const prefix of ['','watch-','join-','play-','review-']){
   const events=Object.fromEntries(['watch-','join-','play-','review-'].slice(0,['','watch-','join-','play-','review-'].indexOf(prefix)).map(p=>[p+unit.id,{kind:p==='watch-'?'watched':'demonstrated',attempts:1,needsReview:false,date:new Date().toISOString()}]));
   const profile={...props.profile,adventure:{...defaultAdventure,events}};
   const html=renderToStaticMarkup(createElement(adventure.AdventureLesson,{...props,profile,index:unit.globalIndex}));
   assert.ok(html.includes(unit.title.replaceAll('&','&amp;')),unit.id+': '+prefix);
   if(prefix==='review-')assert.ok(html.includes('UNIT COMPLETE'));
  }
  for(let i=0;i<adventureGames.length;i++){
   const game=adventureGames[i];assert.ok(renderToStaticMarkup(createElement(adventure.AdventureGame,{...props,index:i,standalone:true})).includes(game.title));
   for(const question of game.questions){const html=renderToStaticMarkup(createElement(adventure.QuestionCard,{question,language,tiles:game.tiles,join:game.join,scene:game.id==='letter-hunt',onSuccess:noop}));assert.ok(html.includes('Check my answer'));assert.ok(!html.includes('You found it!'));assert.ok(!html.includes('adventure-hint'));if(game.id==='letter-hunt')assert.ok(html.includes('scene-answers'));}
  }
  for(let i=0;i<discoverTopics.length;i++)assert.ok(renderToStaticMarkup(createElement(adventure.DiscoverLesson,{...props,index:i})).includes('Let me try'));
  for(let i=0;i<6;i++)assert.ok(renderToStaticMarkup(createElement(adventure.AnimatedStory,{...props,index:i})).includes('SCENE 1 OF 3'));
  const parent=renderToStaticMarkup(createElement(adventure.AdventureParent,props));assert.ok(parent.includes('activities demonstrated'));assert.ok(parent.includes('Allow optional record-and-play-back'));
  console.log('Adventure screens passed: '+language);
  if(!process.argv.includes('--adventure-only'))for(const [name,type,items,steps,keys] of [
   ['SpellingSchool','spelling',spellingWords,6,['missing','build','dictation']],
   ['SentenceWorkshop','sentences',sentenceLessons,6,['gap','order','write']],
   ['GuidedReader','reading',readingLessons,4,['meaning']],
   ['WordFamilySchool','families',wordFamilies,3,['family-choice','family-write']]
  ]) { console.log('Checking '+name+': '+language); for(let index=0;index<items.length;index++)for(let step=0;step<=steps;step++){
   const finished=step===steps;
   const checkpoint={itemId:items[index].id,step:Math.min(step,steps-1),unlocked:steps-1,answers:keys.map(key=>({key,correct:true})),passed:keys,finished};
   const profile={...store.profiles[0],learning:{[type]:checkpoint}};
   const html=renderToStaticMarkup(createElement(courses[name],{index,language,profile,speak:noop,onCheckpoint:noop,onComplete:noop,onWord:noop,go:noop}));
   assert.ok(html.includes(finished?'LESSON COMPLETE':`STEP ${step+1} OF ${steps}`),`${name} ${index} stage ${step}`);
   assert.ok(!html.includes('<span class="explorer-text"><div'));
   if(!finished&&step===4&&['spelling','sentences'].includes(type))assert.ok(!html.includes('<select'));
  }
  }
  for(const [page,expected] of [['welcome','Your next adventure starts here.'],['journey','My adventure map'],['alphabet','Meet the letter A'],['games','lp-game-grid'],['progress','Look how you’re growing!'],['memory','Match pairs'],['star-story','He helps the star find its way home.'],['parent','A little grown-up check'],['downloads','offline backpack']]){
   const screen=renderToStaticMarkup(createElement(App,{initialPage:page}));
   assert.ok(screen.includes(expected),page+': missing '+expected);
   assert.ok(!screen.includes('<span class="explorer-text"><div'),page+': invalid inline translation');
  }
  const card=renderToStaticMarkup(createElement(Translation,{item:words[0],language}));
  for(const code of language==='all'?['ps','rps','ur','rur']:language==='en'?[]:[language])assert.ok(card.includes(words[0][code]));
  if(language==='en')assert.equal(card,'');
  if(['ps','ur','all'].includes(language))assert.ok(card.includes('dir="rtl"'));
  if(['ps','all'].includes(language))assert.ok(card.includes('lang="ps-PK"'));
  const mixedNote=renderToStaticMarkup(createElement(Translation,{item:phonicsSupport[6],language:'ps'}));
  assert.ok(mixedNote.includes('<bdi lang="en" dir="ltr">ship</bdi>'));
  assert.ok(mixedNote.includes('<bdi lang="en" dir="ltr">sheep</bdi>'));
  for(const Component of [GrammarLibrary,StoryLibrary])assert.ok(renderToStaticMarkup(createElement(Component,{language,speak:noop,complete:noop})).length>1000);
  assert.ok(renderToStaticMarkup(createElement(Label,{id:'alphabet',language})).includes('dir="ltr"'));
  for(const mode of ['picture','audio','letter','missing','order']){
   const questions=makePractice(words,{profile:store.profiles[0],mode});
   const quiz=renderToStaticMarkup(createElement(PracticeQuiz,{questions,language,speak:noop,onWord:noop,onFinish:noop,onRetry:noop,onExit:noop}));
   assert.ok(quiz.includes('QUESTION 1 OF 5'));
   assert.ok(!quiz.includes('The correct answer is'));
  }
 }
 const {default:PictureWords}=await server.ssrLoadModule('/src/ustad/PictureWords.jsx');
 const groups=new Set(words.map(w=>w.category)).size+1;
 for(const language of ['en','ps','ur','all'])for(let index=0;index<groups;index++)for(const initialMode of [null,'learn','name','find','puzzle']){
  const html=renderToStaticMarkup(createElement(PictureWords,{index,language,initialMode,speak:()=>{},onWord:()=>{},complete:()=>{},go:()=>{}}));
  assert.ok(html.includes('Picture words'));
  if(initialMode&&initialMode!=='learn')assert.ok(html.includes('1 OF')||html.includes('No words for this game'),`${initialMode} ${index}`);
  if(language==='ps'&&initialMode==='name')assert.ok(html.includes('تصویر ته وګورئ'));
 }
 console.log('Picture words: every group and game mode renders.');
 // Every learning-path lesson and each of its activity steps renders, for a fresh and an unlock-all learner.
 const path=await server.ssrLoadModule('/src/ustad/PathScreens.jsx');
 const {pathLessons}=await server.ssrLoadModule('/src/ustad/pathModel.js');
 const {freshProfile:fresh}=await server.ssrLoadModule('/src/ustad/engine.js');
 const {defaultAdventure:base}=await server.ssrLoadModule('/src/ustad/adventureEngine.js');
 for(const language of ['en','ps','all']){
  const learner={...fresh('Sara'),adventure:{...base,unlockAll:true,events:{}}};
  assert.ok(renderToStaticMarkup(createElement(path.AdventureMap,{profile:learner,language,go:noop})).includes('Continue here'));
  // A fresh learner's trail: every lesson is a node; reveal classes are added only in the browser.
  const newcomer={...learner,adventure:{...base,events:{}}},trail=renderToStaticMarkup(createElement(path.AdventureMap,{profile:newcomer,language,go:noop}));
  assert.equal((trail.match(/class="trail-node /g)||[]).length,pathLessons.length);
  // One learning path: old Class 1–4 lessons are open extra practice; Class 5 onward waits for the 110-lesson course.
  assert.ok((trail.match(/node-current/g)||[]).length<=1);assert.equal((trail.match(/class="trail-node status-later/g)||[]).length,pathLessons.filter(l=>l.classIndex>=4).length);
  assert.ok(trail.includes('class="trail-line"')&&!trail.includes('reveal-ready')&&!trail.includes('node-unlocking'));
  for(const lesson of pathLessons)for(let step=0;step<lesson.activities.length;step++){
   const profile={...learner,adventure:{...learner.adventure,pathResume:{lesson:lesson.id,step}}};
   const html=renderToStaticMarkup(createElement(path.PathLesson,{index:lesson.index,profile,language,onEvent:noop,onSettings:noop,onBreak:noop,go:noop}));
   assert.ok(html.includes(`STEP ${step+1} OF ${lesson.activities.length}`),`${lesson.id} step ${step}`);
  }
  const locked=renderToStaticMarkup(createElement(path.PathLesson,{index:pathLessons.findIndex(l=>l.classIndex>=4)+1,profile:{...learner,adventure:{...base,events:{}}},language,onEvent:noop,onSettings:noop,onBreak:noop,go:noop}));
  assert.ok(locked.includes('This adventure unlocks later'));
 }
 console.log(`Learning path: ${pathLessons.length} lessons and every activity step render; locked lessons stay locked.`);
 console.log('PASS: '+(process.argv.includes('--adventure-only')?'adventure and retained screen checks':'all adventure screens and every guided course stage')+' in all six language settings. Answers and hints stay hidden before submission.');
}finally{delete globalThis.localStorage;await server.close();}
