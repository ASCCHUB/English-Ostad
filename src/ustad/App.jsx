import OfflineInstall from './OfflineInstall.jsx';
import Students from './Students.jsx';
import {addStudent,selectStudent} from './students.js';
import MobileNavigation from './MobileNavigation.jsx';
import {Bi} from './firstSteps/Bilingual.jsx';
import AppSharing,{AppShareButton} from './AppSharing.jsx';
import GettingStarted,{needsGuide} from './GettingStarted.jsx';
import StartingAssessment,{StartingAssessmentEntry} from './StartingAssessment.jsx';
import {validateAssessment,assessmentRecommendation,assessmentPlacement} from './startingAssessment.js';
import WordPicture from './WordPicture.jsx';
import {useEffect,useRef,useState,lazy,Suspense} from 'react';
import {words,languages,prompts,alphabet,lessons,phonics} from './content';
import {freshProfile,recordWord,wordStage,streak,validateSaved,completeActivity,makePractice,accuracy,seededRandom,skillAccuracy} from './engine';
import {Translation,ariaText} from './shared.jsx';
import PracticeQuiz from './PracticeQuiz.jsx';
import {GrammarLibrary,StoryLibrary} from './LessonLibraries.jsx';
import {phonicsSupport} from './curriculum.js';
import {savePack,packStatus} from './offline.js';
import {Icon} from './ExplorerArt.jsx';
import {ExplorerBrand,ExplorerSidebar,WelcomeScreen,HomeScreen,ExtraTools,LetterLibrary,FocusedLetterLesson,RewardsScreen} from './ExplorerScreens.jsx';
import {parseExplorerRoute,ROUTES} from './explorerModel.js';
import {SpellingSchool,SentenceWorkshop,GuidedReader,WordFamilySchool} from './StudyCourses.jsx';
import {saveCheckpoint,finishStudy} from './studyEngine.js';
import {AdventureSetup,ClassMap,AdventureLesson,AdventureGame,Discover,DiscoverLesson,StoryCorner,AnimatedStory,AdventureParent,AvatarGarden,SpeakingStudio} from './AdventureScreens.jsx';
import {defaultAdventure,logAdventure} from './adventureEngine.js';
import Appearance from './Appearance.jsx';
import PictureWords from './PictureWords.jsx';
import {AdventureMap,PathLesson} from './PathScreens.jsx';
import {watchSupport} from './supportLayer.js';
import {useColorMode} from './useColorMode.js';
import {AdultEntry,AdultSpellingHome,AdultSpellingLesson} from './AdultSpelling.jsx';
import {recordAdultAttempt} from './adultPractice.js';
import FoxAppleGame from './FoxAppleGame.jsx';
import {saveFoxSession,completeFoxSession} from './foxProgress.js';
import {setLearnerPrefs} from './learnerPrefs.js';
import {configureSound,speak as speakAudio,stopSpeech,playEffect,completionId,useAudio} from './soundEngine.js';
import {AudioNotice,SoundToggle,HearWord,PashtoHelp,CelebrationBurst} from './SoundKit.jsx';
import {FirstStepsEntry} from './firstSteps/Entry.jsx';
import {LearnMap,TopicsScreen,TopicScreen,TopicUnitScreen} from './LearnPath.jsx';
import GamesHome from './games/GamesHome.jsx';
import GameScreen from './games/GameScreen.jsx';
import {games as fullGames} from './games/catalog.js';
import {gameState,withGame} from './games/progress.js';
import {mergeCourseProfile} from './firstSteps/profile.js';
import {clearRecoveryCheckpoints,hydrateCourse} from './firstSteps/store.js';
const FirstStepsCourse=lazy(()=>import('./firstSteps/FirstSteps.jsx'));
const FirstStepsParent=lazy(()=>import('./firstSteps/FirstSteps.jsx').then(module=>({default:module.FirstStepsParent})));
const KEY='english-ustad-v1';
let recoveredData=false;
function readSaved(){try{const raw=localStorage.getItem(KEY);if(raw){try{const value=validateSaved(JSON.parse(raw));return {...value,profiles:value.profiles.map(p=>({...p,firstSteps:hydrateCourse(p)}))};}catch{localStorage.setItem(KEY+'-recovery',raw);recoveredData=true;}}}catch{}return {profiles:[freshProfile()],active:0,language:'ps',goal:3};}
function Trace({letter}){const canvas=useRef();const drawing=useRef(false);function draw(e){const c=canvas.current,r=c.getBoundingClientRect(),ctx=c.getContext('2d'),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;if(e.type==='pointerdown'){drawing.current=true;c.setPointerCapture(e.pointerId);ctx.beginPath();ctx.moveTo(x,y);}else if(drawing.current){ctx.strokeStyle='#1685e8';ctx.lineWidth=7;ctx.lineCap='round';ctx.lineTo(x,y);ctx.stroke();}}useEffect(()=>{canvas.current.getContext('2d').clearRect(0,0,600,260)},[letter]);return <><div className="trace"><span>{letter} {letter.toLowerCase()}</span><canvas width="600" height="260" ref={canvas} aria-label={`Drawing area for ${letter}`} onPointerDown={draw} onPointerMove={draw} onPointerUp={()=>drawing.current=false} onPointerCancel={()=>drawing.current=false}/></div><p className="muted">Trace with your finger or mouse. Compare your shape with the guide.</p><button className="secondary" onClick={()=>canvas.current.getContext('2d').clearRect(0,0,600,260)}>↻ Clear & try again</button></>;}
function initialRoute(initialPage){
 if(initialPage&&ROUTES.includes(initialPage))return {page:initialPage,index:0};
 if(typeof window!=='undefined'){const route=parseExplorerRoute(window.location.hash);if(route)return route.page==='quiz'?{page:'games',index:0}:route;}
 try{if(localStorage.getItem('little-explorers-welcomed')==='yes')return {page:'home',index:0};}catch{}
 return {page:'welcome',index:0};
}
export default function App({initialPage}={}){
const lastInteraction=useRef(Date.now());
const memoryTimer=useRef();
const [saved,setSaved]=useState(readSaved),[page,setPage]=useState(()=>initialRoute(initialPage).page),[index,setIndex]=useState(()=>initialRoute(initialPage).index),[category,setCategory]=useState('All'),[query,setQuery]=useState(''),[memoryDone,setMemoryDone]=useState(''),[notice,setNotice]=useState(recoveredData?'Saved progress could not be read. The original data was preserved in a recovery copy on this browser. Start fresh or restore a valid backup in the parent area.':''),[quiz,setQuiz]=useState(null),[feedback,setFeedback]=useState(''),[gate,setGate]=useState(''),[adult,setAdult]=useState(false),[name,setName]=useState(''),[pack,setPack]=useState(false),[memory,setMemory]=useState([]),[matched,setMatched]=useState([]);
const [studentsOpen,setStudentsOpen]=useState(()=>!initialPage);
const [shareOpen,setShareOpen]=useState(false),[guideOpen,setGuideOpen]=useState(false),[menuOpen,setMenuOpen]=useState(false);
useEffect(()=>()=>clearTimeout(memoryTimer.current),[page]);
useEffect(()=>{if(page!=='parent'){setAdult(false);setGate('');}},[page]);
const profile=saved.profiles[saved.active]||saved.profiles[0], language=saved.language;
const settings={...defaultAdventure,...profile.adventure};
const colorMode=useColorMode(settings.colorMode);
const sessionStart=useRef(profile.minutes||0);
const [breakDismissed,setBreakDismissed]=useState(0);
const sessionProfile=useRef(profile.id);
useEffect(()=>{if(sessionProfile.current!==profile.id){sessionProfile.current=profile.id;sessionStart.current=profile.minutes||0;setBreakDismissed(0);}},[profile.id,profile.minutes]);
const filtered=words.filter(w=>(category==='All'||w.category===category)&&w.en.toLowerCase().includes(query.toLowerCase()));
const word=filtered[index%Math.max(1,filtered.length)]||words[0];
function updateProfile(fn){setSaved(s=>({...s,profiles:s.profiles.map(p=>p.id===profile.id?fn(p):p)}));}
useEffect(()=>watchSupport(document.querySelector('.explorer-app'),language),[language,page]);
useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(saved));}catch{setNotice('Your browser could not save progress. Export a backup in the parent area.');}},[saved]);
const {voices}=useAudio();
useEffect(()=>setLearnerPrefs({autoNext:settings.autoNext}),[settings.autoNext]);
useEffect(()=>configureSound({voice:settings.audio,pashtoAudio:settings.pashtoAudio,effects:settings.effects,music:settings.music,muted:settings.muted,voiceName:settings.voiceName,voiceSpeed:settings.voiceSpeed,autoInstructions:settings.autoInstructions,language}),[settings.audio,settings.pashtoAudio,settings.effects,settings.music,settings.muted,settings.voiceName,settings.voiceSpeed,settings.autoInstructions,language]);
useEffect(()=>()=>stopSpeech(),[]);
function speak(text,slow=false){speakAudio(text,{rate:slow?.65:.88,kind:/\s/.test(text.trim())?'sentence':'word'});}
function go(id,nextIndex=0){setMenuOpen(false);if(!ROUTES.includes(id))id='home';setPage(id);setIndex(nextIndex);if(typeof window!=='undefined')window.history.pushState(null,'','#/'+id+(nextIndex?'/'+nextIndex:''));if(id==='vocabulary'){setCategory('All');setQuery('');}setFeedback('');setQuiz(null);stopSpeech();window.scrollTo({top:0,behavior:'instant'});}
function openParent(){go('parent');setAdult(false);setGate('');}
function enterStudent(id){const student=saved.profiles.find(p=>p.id===id);if(!student)return;stopSpeech();clearTimeout(memoryTimer.current);setMemory([]);setMatched([]);setMemoryDone('');setSaved(s=>selectStudent(s,id));setStudentsOpen(false);setGuideOpen(needsGuide(id));try{localStorage.setItem('little-explorers-welcomed','yes');}catch{}go('home');}
function createStudent(studentName){const next=addStudent(saved,studentName);if(next===saved)return;stopSpeech();setSaved(next);setStudentsOpen(false);setGuideOpen(true);try{localStorage.setItem('little-explorers-welcomed','yes');}catch{}go('home');}
function beginAdventure(){try{localStorage.setItem('little-explorers-welcomed','yes');}catch{}go('home');if(needsGuide(profile.id))setGuideOpen(true);}
function adventureSettings(patch){updateProfile(p=>({...p,adventure:{...defaultAdventure,...p.adventure,...patch}}));}
function adventureEvent(id,result){updateProfile(p=>logAdventure(p,id,result));}
function saveStartingAssessment(next){const clean=validateAssessment(next);updateProfile(p=>({...p,startingAssessment:clean}));}
function finishStartingAssessment(next){
 const clean=validateAssessment(next),result=assessmentRecommendation(clean);
 updateProfile(p=>{const progress=hydrateCourse(p),placed={...progress,revision:progress.revision+1,startIndex:result.startIndex,resume:result.lessonId,placement:assessmentPlacement(clean)};return mergeCourseProfile({...p,startingAssessment:clean,level:result.level===1?'Little Learner':result.level<=3?'Beginner':'Young Explorer'},placed);});
 // The result screen (level-check) shows where the child starts; the child opens the lesson from there.
 go('level-check');
}
function firstStepsChange(progress){updateProfile(p=>mergeCourseProfile(p,progress));}
function openCategory(value){go('vocabulary');setCategory(value);}
useEffect(()=>{
 const sync=()=>{const route=parseExplorerRoute(window.location.hash);if(route){setPage(route.page==='quiz'?'games':route.page);setIndex(route.index);setQuiz(null);setFeedback('');stopSpeech();}};
 window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
 return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
},[]);
function studyCheckpoint(type,checkpoint){updateProfile(p=>saveCheckpoint(p,type,checkpoint));}
function studyComplete(type,checkpoint,label){updateProfile(p=>finishStudy(p,type,checkpoint,label));setNotice('Your lesson is complete. Your practice and progress are saved.');}
// Activities that show their own celebration pass chime=false so the sounds do not double up.
function complete(id,chime=true){if(chime)playEffect('correct');updateProfile(p=>completeActivity(p,id));setNotice('A little step forward! Your practice is saved.');}
function startQuiz(mode='picture',review=false){
 const daily=mode==='daily';const actualMode=daily?'picture':mode;
 const questions=makePractice(words,{mode:actualMode,profile,count:profile.level==='Young Explorer'?10:5,review,random:daily?seededRandom(new Date().toLocaleDateString('en-CA')+profile.id):Math.random});
 setQuiz({questions,mode,review,id:crypto.randomUUID()});setPage('quiz');window.history.pushState(null,'','#/quiz');window.scrollTo({top:0,behavior:'instant'});
}
function finishQuiz(result){updateProfile(p=>({...completeActivity(p,'quiz-'+quiz.id),xp:p.xp+result.total*2,results:[...p.results,result]}));}
useEffect(()=>{
 if(!lessons.some(l=>l.id===page)&&!['sentences','word-families'].includes(page))return;
 const resumeIndex=page==='vocabulary'?words.findIndex(w=>w.id===word.id):index;
 updateProfile(p=>p.resume===page&&p.resumeIndex===resumeIndex?p:{...p,resume:page,resumeIndex});
},[page,index,profile.id,category,query,word.id]);
useEffect(()=>{
 const touch=()=>{lastInteraction.current=Date.now();};
 window.addEventListener('pointerdown',touch);window.addEventListener('keydown',touch);
 const timer=setInterval(()=>{if(document.visibilityState==='visible'&&Date.now()-lastInteraction.current<90000)updateProfile(p=>({...p,minutes:(p.minutes||0)+0.5}));},30000);
 return()=>{clearInterval(timer);window.removeEventListener('pointerdown',touch);window.removeEventListener('keydown',touch);};
},[saved.active]);

async function download(){setNotice('Checking and saving all core lesson files…');try{await savePack({production:import.meta.env.PROD});setPack(true);setNotice('All core lesson files are saved and verified in this browser. Device voices may still need internet.');}catch(error){setNotice('Offline saving: '+error.message);}}
useEffect(()=>{packStatus().then(setPack);},[]);
const todayKey=new Date().toLocaleDateString('en-CA');
const todayCount=(profile.activityLog||[]).filter(a=>a.date===todayKey).length;
const learned=Object.values(profile.words).filter(w=>w.correct>=2).length;
const due=Object.values(profile.words).filter(w=>w.due<=Date.now()).length;
return <div data-color-mode={colorMode} data-background={settings.backgroundTheme} className={`explorer-app explorer-page-${page} ${settings.reducedMotion?'reduce-motion':''}`}>
<a className="skip-link" href="#explorer-content">Skip to lesson</a>
{studentsOpen&&<Students key={profile.id} profiles={saved.profiles.map(p=>({...p,firstSteps:hydrateCourse(p)}))} active={saved.active} onSelect={enterStudent} onAdd={createStudent} onRename={studentName=>updateProfile(p=>({...p,name:studentName}))} onClose={()=>setStudentsOpen(false)}/>}
{page!=='welcome'&&<ExplorerSidebar share={()=>setShareOpen(true)} page={page} go={go} parent={openParent} language={language}/>}
<div className="explorer-main"><header className="explorer-header"><ExplorerBrand onClick={()=>go('home')} compact language={language}/><div className="explorer-header-controls"><label className="explorer-language"><Icon name="globe" size={19}/><select aria-label={ariaText('Explanation language',language)} value={language} onChange={e=>setSaved(s=>({...s,language:e.target.value}))}>{Object.entries(languages).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><button className="circle-button theme-toggle" aria-label={ariaText(colorMode==='dark'?'Switch to light mode':'Switch to dark mode',language)} aria-pressed={colorMode==='dark'} onClick={()=>adventureSettings({colorMode:colorMode==='dark'?'light':'dark'})}><Icon name={colorMode==='dark'?'sun':'moon'} size={21}/></button><SoundToggle settings={settings} onChange={adventureSettings} language={language}/><button className="profile-button" title={profile.name} aria-label={ariaText('Parent and teacher settings',language)} onClick={openParent}><Icon name="settings" size={20}/></button></div></header>
<main id="explorer-content" className={`explorer-content content-${page}`}>
{['classes','beginner'].includes(page)&&<><FirstStepsEntry profile={profile} go={go} big/><LearnMap profile={profile} go={go}/></>}
{page==='beginner-lesson'&&<Suspense fallback={<p>Opening the lesson…</p>}><FirstStepsCourse onMenu={()=>{stopSpeech();setMenuOpen(true);}} key={profile.id+':'+page+':'+index} profile={profile} index={index} settings={settings} go={go} onChange={firstStepsChange}/></Suspense>}
{page==='fox-game'&&<FoxAppleGame key={profile.id+'-'+index} profile={profile} index={index} settings={settings} go={go} onCheckpoint={(id,state)=>updateProfile(p=>saveFoxSession(p,id,state))} onComplete={(id,state)=>updateProfile(p=>completeFoxSession(p,id,state))}/>}
{page==='games'&&<GamesHome profile={profile} go={go}/>}
{page==='game-play'&&<GameScreen key={profile.id+':'+(index%5)} gameId={fullGames[index%5].id} startNow={index>=5} profile={profile} settings={settings} onSettings={adventureSettings} onSave={(id,fn)=>updateProfile(p=>withGame(p,id,fn(gameState(p,id))))} go={go}/>}
{notice&&<div className="notice" role="status">{notice}<button aria-label={ariaText('Dismiss message',language)} onClick={()=>setNotice('')}><Icon name="close" size={18}/></button></div>}
{page==='welcome'&&<WelcomeScreen language={language} onStart={beginAdventure} onParent={openParent}/>}
{settings.sessionLength>0&&(profile.minutes||0)-sessionStart.current>=settings.sessionLength*(breakDismissed+1)&&page!=='parent'&&<aside className="session-reminder" role="status"><span>🌿 A lovely time for a little break. Stretch, look away from the screen, or tell a grown-up what you learned.</span><button className="secondary" onClick={()=>setBreakDismissed(n=>n+1)}>Thanks, I’ll take a moment</button></aside>}
{page==='adult-spelling'&&<AdultSpellingHome profile={profile} go={go}/>}
{page==='adult-lesson'&&<AdultSpellingLesson key={profile.id+':'+index} index={index} profile={profile} language={language} go={go} onCheckpoint={studyCheckpoint} onComplete={studyComplete} onAttempt={(id,correct)=>updateProfile(p=>recordAdultAttempt(p,id,correct))}/>}
{page==='appearance'&&<Appearance settings={settings} onChange={adventureSettings} language={language}/>}
{page==='setup'&&<AdventureSetup go={go} onGuest={()=>go(profile.startingAssessment&&['completed','skipped'].includes(profile.startingAssessment.status)?'home':'level-check')}/>}

{page==='class-map'&&<ClassMap index={index} profile={profile} language={language} go={go}/>}
{page==='adventure-lesson'&&<AdventureLesson key={profile.id+':'+index} index={index} profile={profile} language={language} onEvent={adventureEvent} go={go}/>}
{['adventure-game','play-game'].includes(page)&&<AdventureGame key={profile.id+':'+page+':'+index} index={index} standalone={page==='play-game'} profile={profile} language={language} onEvent={adventureEvent} go={go}/>}
{page==='discover'&&<Discover language={language} go={go}/>}
{page==='discover-lesson'&&<DiscoverLesson key={profile.id+':'+index} index={index} profile={profile} language={language} onEvent={adventureEvent} go={go}/>}
{page==='level-check'&&<StartingAssessment key={profile.id} profile={profile} onSave={saveStartingAssessment} onFinish={finishStartingAssessment} language={language} go={go}/>}
{page==='story-library'&&<StoryCorner profile={profile} go={go}/>}
{page==='story-player'&&<AnimatedStory key={profile.id+':'+index} index={index} profile={profile} language={language} onEvent={adventureEvent} go={go}/>}
{page==='home'&&<HomeScreen profile={profile} speak={speak}><div className="simple-home-content"><div className="home-students"><b>{profile.name}</b><button className="secondary" onClick={()=>{stopSpeech();setStudentsOpen(true);}}><Bi en="Students &amp; competition" ps="زده کوونکي او سیالي"/></button></div><OfflineInstall/><FirstStepsEntry profile={profile} go={go} big/><StartingAssessmentEntry profile={profile} language={language} go={go}/><button className="secondary home-all-lessons" onClick={()=>go('beginner')}><Bi en="All lessons" ps="ټول سبقونه"/></button></div></HomeScreen>}
{page==='topics'&&<TopicsScreen profile={profile} go={go}/>}
{page==='topic'&&<TopicScreen key={index} index={index} profile={profile} go={go} complete={id=>complete(id)}/>}
{page==='topic-unit'&&<TopicUnitScreen key={index} index={index} profile={profile} go={go} complete={id=>complete(id)}/>}
{page==='journey'&&<AdventureMap profile={profile} language={language} go={go}/>}
{page==='path-lesson'&&<PathLesson key={profile.id+':'+index} index={index} profile={profile} language={language} onEvent={adventureEvent} onSettings={adventureSettings} onBreak={()=>{setNotice('Great work! Your place is saved. Come back any time to continue your adventure.');go('home');}} go={go}/>}
{page==='letters'&&<LetterLibrary profile={profile} language={language} go={go} complete={complete}/>}
{page==='alphabet'&&<FocusedLetterLesson index={index} language={language} speak={speak} complete={complete} go={go}/>}
{!['beginner','beginner-lesson','topics','topic','topic-unit','fox-game','welcome','home','journey','letters','alphabet','games','progress','setup','classes','class-map','adventure-lesson','adventure-game','play-game','discover','discover-lesson','level-check','story-library','story-player','appearance','picture-words','path-lesson','game-play'].includes(page)&&<><button className="back" onClick={()=>go(['quiz','memory'].includes(page)?'games':'home')}><Icon name="back" size={17}/> Back to {['quiz','memory'].includes(page)?'games':'my learning'}</button><div className="page-heading"><p className="section-kicker">BIG ADVENTURES. LITTLE STEPS.</p><h1>{lessons.find(l=>l.id===page)?.title||({quiz:'A little challenge',memory:'Match pairs',parent:'Parent & teacher area',downloads:'Your offline backpack','star-story':'The Lost Star',sentences:'Sentence workshop','word-families':'Word families'}[page])}</h1></div></>}
{page==='writing'&&<><div className="guided-lesson-link"><button className="secondary" onClick={()=>go('spelling')}>Write a whole word</button><button className="secondary" onClick={()=>go('sentences')}>Write a whole sentence</button></div><div className="alphabet-grid">{alphabet.map((a,i)=><button className={index===i?'chosen':''} key={a.letter} onClick={()=>{setIndex(i);setFeedback('')}}>{a.letter}<small>{a.letter.toLowerCase()}</small></button>)}</div><section className="activity"><div className="letter-display">{alphabet[index].letter}<span>{alphabet[index].letter.toLowerCase()}</span></div><div className="picture" role="img" aria-label={alphabet[index].word.en}><WordPicture word={alphabet[index].word.en}/></div><h2><HearWord word={alphabet[index].word.en}/></h2><Translation item={alphabet[index].word} language={language}/><PashtoHelp item={alphabet[index].word} language={language}/><div className="button-row"><button className="primary" onClick={()=>speak('The letter '+alphabet[index].letter)}>◖ Letter name</button><button className="secondary" onClick={()=>speak(alphabet[index].word.en)}>◖ Example word</button></div><p className="phonics-letter-note" dir="ltr"><strong>Common sounds:</strong> {alphabet[index].sound}</p><p className="muted">A letter’s name is different from its sounds. X appears at the end of fox. The sound examples use British English; other accents can differ.</p><Trace letter={alphabet[index].letter}/><button className="primary" onClick={()=>complete(`${page}-${alphabet[index].letter}`)}>I practiced this letter ✓</button></section></>}
{page==='vocabulary'&&<><div className="filters"><input aria-label="Search words" placeholder="Find a little word…" value={query} onChange={e=>{setQuery(e.target.value);setIndex(0)}}/>{['All',...new Set(words.map(w=>w.category))].map(c=><button key={c} className={category===c?'chosen':''} onClick={()=>{setCategory(c);setIndex(0)}}>{c}</button>)}</div>{filtered.length?<section className="activity word-card"><span className="pill">{word.category} · {index%filtered.length+1} of {filtered.length}</span><div className="picture" role="img" aria-label={word.en}><WordPicture word={word.en}/></div><h2><HearWord word={word.en}/></h2><p className="pron">{word.pron}</p><Translation item={word} language={language}/><PashtoHelp item={word} language={language}/><div className="button-row"><button className="primary" onClick={()=>speak(word.en)}>◖ Hear the word</button><button className="secondary" onClick={()=>speak(word.en,true)}>◖ Slowly</button></div><Translation item={prompts.listen} language={language}/><p className="muted">{wordStage(profile.words[word.id])} · Say it out loud, then try spelling it.</p><div className="button-row"><button className="secondary" onClick={()=>setIndex(i=>(i-1+filtered.length)%filtered.length)}>← Previous</button><button className="primary" onClick={()=>{complete(`vocabulary-${word.id}`);setIndex(i=>(i+1)%filtered.length)}}>Practiced · Next →</button></div><button className="text-button" onClick={()=>{go('spelling');setIndex(words.findIndex(w=>w.id===word.id))}}>Practice spelling this word ↗</button></section>:<p>No words found. Try another search.</p>}</>}
{page==='phonics'&&<div className="content-grid">{phonics.map(([sound,examples,tip],i)=><section className="activity phonics" key={sound+i}><span className="sound">{sound}</span><h3>{examples}</h3><p>{tip}</p><Translation item={phonicsSupport[i]} language={language}/><button className="secondary" onClick={()=>speak(examples.replaceAll('·',', ').replace('→',', '),true)}>◖ Listen to examples</button><button className="text-button" onClick={()=>complete(`phonics-${i}`)}>I practiced ✓</button></section>)}</div>}
{page==='spelling'&&<AdultEntry go={go}/>}
{page==='spelling'&&<SpellingSchool key={profile.id+":"+index} index={index} language={language} profile={profile} speak={speak} onCheckpoint={studyCheckpoint} onComplete={studyComplete} go={go} onWord={(id,correct)=>updateProfile(p=>recordWord(p,id,correct,Date.now(),'spelling'))}/>}
{page==='sentences'&&<SentenceWorkshop key={profile.id+":"+index} index={index} language={language} profile={profile} speak={speak} onCheckpoint={studyCheckpoint} onComplete={studyComplete} go={go}/>}
{page==='word-families'&&<WordFamilySchool key={profile.id+":"+index} index={index} language={language} profile={profile} speak={speak} onCheckpoint={studyCheckpoint} onComplete={studyComplete} go={go}/>}
{page==='reading'&&<GuidedReader key={profile.id+":"+index} index={index} language={language} profile={profile} speak={speak} onCheckpoint={studyCheckpoint} onComplete={studyComplete} go={go}/>}
{page==='speaking'&&<SpeakingStudio key={profile.id} profile={profile} language={language} onEvent={adventureEvent}/>}
{page==='grammar'&&<><div className="guided-lesson-link"><p>Want to practice each sentence step by step?</p><button className="secondary" onClick={()=>go('sentences')}>Open Sentence workshop <Icon name="arrow" size={18}/></button></div><GrammarLibrary language={language} speak={speak} complete={complete}/></>}
{page==='stories'&&<StoryLibrary language={language} speak={speak} complete={complete}/>}
{page==='star-story'&&<StoryLibrary initialStory='lost-star' language={language} speak={speak} complete={complete}/>}
{page==='picture-words'&&<PictureWords key={profile.id} index={index} language={language} speak={speak} onWord={(id,correct)=>updateProfile(p=>recordWord(p,id,correct,Date.now(),'picture'))} complete={complete} go={go} reducedMotion={settings.reducedMotion}/>}

{page==='memory'&&<section className="activity"><h2>Match pairs</h2><p>Find each word and its matching picture.</p><div className="memory-grid">{['Apple','🐈','Book','🍎','Cat','📕'].map((v,i)=><button className={matched.includes(i)?'matched':''} key={i} disabled={matched.includes(i)||memory.includes(i)} onClick={()=>{if(memory.length===2)return;const next=[...memory,i];setMemory(next);if(next.length===2){const pairs=[[0,3],[1,4],[2,5]];if(pairs.some(pair=>next.every(n=>pair.includes(n)))){setMatched(m=>[...m,...next]);setMemory([]);if(matched.length===4){complete('games-memory',false);setMemoryDone(completionId());}else playEffect('correct');}else memoryTimer.current=setTimeout(()=>setMemory([]),1100);}}}>{matched.includes(i)||memory.includes(i)?v:'🌱'}</button>)}</div>{matched.length===6&&memoryDone&&<CelebrationBurst id={memoryDone}/>}<p aria-live="polite">{matched.length===6?'All matched! What a wonderful little explorer.':`${matched.length/2} of 3 pairs found`}</p><button className="secondary" onClick={()=>{clearTimeout(memoryTimer.current);setMatched([]);setMemory([]);setMemoryDone('')}}>Play again ↻</button></section>}
{page==='quiz'&&quiz&&<PracticeQuiz key={quiz.id} questions={quiz.questions} language={language} speak={speak} onWord={(id,correct,mode)=>updateProfile(p=>recordWord(p,id,correct,Date.now(),mode))} onFinish={finishQuiz} onRetry={()=>startQuiz(quiz.mode,true)} onExit={()=>go('vocabulary')}/>}
{page==='progress'&&<RewardsScreen profile={profile} language={language} onContinue={()=>go('home')} onReview={()=>startQuiz('picture',true)}>
<AvatarGarden profile={profile} onSettings={adventureSettings}/><section className="activity progress-details"><h2>Your word garden</h2><p>Guided spelling: {profile.completed.filter(id=>id.startsWith('study-spelling-')).length} lessons · Sentence workshop: {profile.completed.filter(id=>id.startsWith('study-sentences-')).length} lessons · Guided reading: {profile.completed.filter(id=>id.startsWith('study-reading-')).length} lessons</p><p>Spelling accuracy: {skillAccuracy(profile,'spelling')===null?'Not practiced yet':skillAccuracy(profile,'spelling')+'%'} · Listening accuracy: {accuracy(profile.results,'audio')===null?'Not practiced yet':accuracy(profile.results,'audio')+'%'}</p><p>{learned} words practiced at least twice · {Math.floor(profile.minutes||0)} active minutes · {streak(profile.days)} day streak</p><div className="word-status">{Object.entries(profile.words).length?Object.entries(profile.words).map(([id,w])=><span key={id}>{words.find(x=>x.id===id)?.en} · {wordStage(w)}</span>):<p>Your first little word is waiting for you.</p>}</div></section><section className="activity progress-details"><h2>Your practice memories</h2>{profile.results.length?profile.results.slice(-10).reverse().map((r,i)=><p key={i}>{new Date(r.date).toLocaleDateString()} · {r.mode} · {r.score}/{r.total} · Review: {r.review.join(', ')||'Well remembered!'}</p>):<p>Your quizzes will appear here after you play.</p>}</section></RewardsScreen>}
{page==='downloads'&&<section className="activity"><div className="picture">🎒</div><h2>Take your little world with you.</h2><p>The core pack includes all {words.length} picture words, alphabet, phonics, reading, activities, and stories. Progress stays on this device.</p><p><strong>{pack?'✓ Core lesson files saved':'Core lesson pack · not yet saved'}</strong></p><button className="primary" onClick={download}>{pack?'Refresh offline pack':'Save lessons for offline use'} ↓</button><p className="muted">Requires a production build on localhost or HTTPS. English speech is provided by your device; some voices need internet. No audio recordings are downloaded. Clearing browser data removes lessons and progress.</p></section>}
{page==='parent'&&(!adult?<section className="activity"><h2>A little grown-up check</h2><p>To continue, type the answer to seventeen multiplied by four.</p><form onSubmit={e=>{e.preventDefault();if(gate.trim()==='68'){setAdult(true);setFeedback('')}else setFeedback('That answer isn’t right. Please ask a grown-up for help.')}}><input aria-label="Adult gate answer" inputMode="numeric" value={gate} onChange={e=>setGate(e.target.value)}/><button className="primary">Continue</button></form><p role="status">{feedback}</p><p className="muted">This is a child deterrent, not an account password or security boundary.</p></section>:<section className="activity parent-panel"><Suspense fallback={<p>Loading beginner course settings…</p>}><FirstStepsParent key={profile.id} profile={profile} onChange={firstStepsChange} go={go}/></Suspense><AdventureParent profile={profile} onSettings={adventureSettings} go={go}/><ExtraTools profile={profile} language={language} go={go} onCategory={openCategory} goal={saved.goal} todayCount={todayCount} due={due} onStory={()=>go('story-player',5)} onReview={()=>startQuiz('picture',true)}/><h2>Make room for every learner</h2><label>Current learner<select value={saved.active} onChange={e=>setSaved(s=>({...s,active:Number(e.target.value)}))}>{saved.profiles.map((p,i)=><option key={p.id} value={i}>{p.name}</option>)}</select></label><form onSubmit={e=>{e.preventDefault();if(name.trim()&&saved.profiles.length<20){setSaved(s=>({...s,profiles:[...s.profiles,freshProfile(name.trim().slice(0,30))],active:s.profiles.length}));setName('');setGuideOpen(true);go('level-check')}}}><label>New learner’s nickname<input maxLength="30" value={name} onChange={e=>setName(e.target.value)} placeholder="No full name needed"/></label><button className="secondary" disabled={!name.trim()||saved.profiles.length>=20}>Add learner +</button></form><label>Learning level<select value={profile.level} onChange={e=>updateProfile(p=>({...p,level:e.target.value}))}>{['Little Learner','Beginner','Young Explorer'].map(l=><option key={l}>{l}</option>)}</select></label><p className="muted">Little Learner quizzes use words up to 4 letters; Beginner uses up to 6. Young Explorer quizzes include all words and 10 questions. All lessons remain available.</p><label>Daily activity goal<select value={saved.goal} onChange={e=>setSaved(s=>({...s,goal:Number(e.target.value)}))}>{[2,3,5,7].map(n=><option key={n} value={n}>{n} activities</option>)}</select></label><button className="secondary" onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(saved,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='little-explorers-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}}>↓ Export progress backup</button><label>Restore a backup<input type="file" accept="application/json" onChange={async e=>{try{const file=e.target.files?.[0];if(!file)return;if(file.size>2*1024*1024)throw Error();const s=validateSaved(JSON.parse(await file.text()));await clearRecoveryCheckpoints();setSaved(s);
setNotice('Backup restored.');}catch{setNotice('That backup could not be read. Existing progress was kept.');}}}/></label><h3>Privacy & content notes</h3><p>No accounts, ads or tracking. Nicknames and results are stored only on this device. Optional microphone practice is disabled by default; a parent can enable it above. Recordings stay on this device and are never uploaded. Export a backup before clearing the app's data.</p><p>Pashto and Roman Pashto follow everyday Swat / Dir / Malakand speech.</p><p>English audio: {voices.length?`${voices.length} English device voices available`:'No English voice detected'}.</p></section>)}
<AudioNotice go={go}/>
{shareOpen&&<AppSharing language={language} colorMode={colorMode} onClose={()=>setShareOpen(false)}/>}
{guideOpen&&<GettingStarted onListen={text=>speak(text)} onStop={stopSpeech} key={profile.id} profileId={profile.id} language={language} colorMode={colorMode} onLanguage={value=>setSaved(s=>({...s,language:value}))} onClose={()=>setGuideOpen(false)} onLesson={()=>{setGuideOpen(false);go('beginner-lesson',0);}} onStart={()=>{setGuideOpen(false);go('level-check');}}/>}
{page!=='welcome'&&<footer className="explorer-footer"><button onClick={()=>setShareOpen(true)}>Share app</button><button onClick={()=>setGuideOpen(true)}>How to use</button><a href="/learning-photos/credits.html" target="_blank" rel="noreferrer">Photo credits</a><span>Big adventures. Little steps.</span><button onClick={()=>go('appearance')}>Themes & display</button><button onClick={()=>go('downloads')}>Offline lessons</button><button onClick={openParent}>For parents</button><button onClick={()=>go('welcome')}>About Learn & Play</button></footer>}
</main>{page!=='welcome'&&<MobileNavigation onStudents={()=>setStudentsOpen(true)} studentName={profile.name} language={language} onLanguage={value=>setSaved(s=>({...s,language:value}))} colorMode={colorMode} onTheme={()=>adventureSettings({colorMode:colorMode==='dark'?'light':'dark'})} muted={settings.muted} onMute={()=>adventureSettings({muted:!settings.muted})} open={menuOpen} onOpen={()=>{stopSpeech();setMenuOpen(true);}} onClose={()=>setMenuOpen(false)} page={page} go={go} onShare={()=>setShareOpen(true)} onGuide={()=>setGuideOpen(true)} onParent={openParent}/>}</div></div>;
}
