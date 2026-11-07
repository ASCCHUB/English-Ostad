// Game progress for one learner (stored in profile.games, separately for each child and each game).
// Pure functions only, so the rules can be tested.
//
// Each answer ends with one outcome:
//   first  correct on the first try without a hint  → counts as learned independently
//   hint   correct after a hint or a wrong try       → practised with support
//   shown  the app demonstrated the answer            → never counted as mastered
// A level has two rounds of five. Finishing both unlocks the next level (once). Stars are kept per round
// as the best result, so replaying can only add the improvement, never repeat a reward.
export const ROUND_SIZE=5;
export const OUTCOMES=['first','hint','shown'];
const BADGE_EVERY=4;

export function emptyGame(){return {unlocked:1,answers:{},rounds:{},badges:[],current:null};}
export function gameState(profile,gameId){return {...emptyGame(),...profile?.games?.byGame?.[gameId]};}
export function withGame(profile,gameId,state,{touch=true}={}){
 const games=profile.games||{byGame:{},last:null};
 return {...profile,games:{...games,byGame:{...games.byGame,[gameId]:state},last:touch?{game:gameId,at:new Date().toISOString()}:games.last}};
}
const roundKey=(level,part)=>`${level}-${part}`;
export const levelDone=(state,level)=>!!state.rounds[roundKey(level,1)]&&!!state.rounds[roundKey(level,2)];
export const isIndependent=a=>a?.best==='first';

// Which round to play next in a level: the first part not finished yet, else part 1 (replay).
export function nextPart(state,level){return state.rounds[roundKey(level,1)]?(state.rounds[roundKey(level,2)]?1:2):1;}
// The level the learner is working on: the lowest unlocked level not finished.
export function currentLevel(state,levels=20){for(let l=1;l<=Math.min(state.unlocked,levels);l++)if(!levelDone(state,l))return l;return Math.min(state.unlocked,levels);}

// Choose five questions for a round. Unseen questions come first; a fresh level plays its questions
// in their designed order (round 1 = questions 1–5, round 2 = 6–10).
export function pickRound(state,bank,level,part){
 const inLevel=bank.questions.filter(q=>q.level===level);
 const otherPart=state.rounds[roundKey(level,part===1?2:1)]?.ids||[];
 const score=q=>{const a=state.answers[q.id];return (a?(isIndependent(a)?3:1):0)*100+(otherPart.includes(q.id)?50:0)+(q.round===part?0:10)+inLevel.indexOf(q)/100;};
 return [...inLevel].sort((a,b)=>score(a)-score(b)).slice(0,ROUND_SIZE).map(q=>q.id);
}
// A clearly labelled review: questions that needed help, most recent first (only from this game).
export function reviewCandidates(state,limit=ROUND_SIZE,among=null){
 return Object.entries(state.answers).filter(([id,a])=>(!among||among.includes(id))&&a.last!=='first').sort((x,y)=>String(y[1].at).localeCompare(String(x[1].at))).slice(0,limit).map(([id])=>id);
}
export function startRound(state,bank,{level,part,review=false,ids}={}){
 if(review){const list=ids||reviewCandidates(state);if(!list.length)return state;return {...state,current:{kind:'review',level:level||null,part:0,ids:list,index:0,results:{}}};}
 const lv=level||currentLevel(state),pt=part||nextPart(state,lv);
 return {...state,current:{kind:'level',level:lv,part:pt,ids:pickRound(state,bank,lv,pt),index:0,results:{}}};
}
// Record an answer once per question in the round (double taps and repeats are ignored).
export function recordAnswer(state,qid,outcome,skill,now=new Date().toISOString()){
 const c=state.current;if(!c||!c.ids.includes(qid)||c.results[qid]||!OUTCOMES.includes(outcome))return state;
 const prev=state.answers[qid];
 const rank={first:3,hint:2,shown:1};
 const best=prev&&rank[prev.best]>=rank[outcome]?prev.best:outcome;
 return {...state,answers:{...state.answers,[qid]:{best,last:outcome,seen:(prev?.seen||0)+1,at:now,skill}},current:{...c,results:{...c.results,[qid]:outcome}}};
}
export function advance(state){const c=state.current;if(!c)return state;return {...state,current:{...c,index:Math.min(c.index+1,c.ids.length)}};}
export function starsFor(results){const first=Object.values(results).filter(r=>r==='first').length;return 1+(first>=3?1:0)+(first===ROUND_SIZE?1:0);}

// Finish the round: award once, unlock once, offer a supported review when understanding looks weak.
export function finishRound(state,levels=20){
 const c=state.current;if(!c||c.ids.some(id=>!c.results[id]))return {state,summary:null};
 const results=c.results,first=c.ids.filter(id=>results[id]==='first'),helped=c.ids.filter(id=>results[id]!=='first');
 let next={...state,current:null},newStars=0,unlocked=null,badge=null,improved=false;
 if(c.kind==='level'){
  const key=roundKey(c.level,c.part),old=state.rounds[key],stars=starsFor(results);
  newStars=Math.max(0,stars-(old?.stars||0));improved=!!old&&stars>old.stars;
  next.rounds={...state.rounds,[key]:{stars:Math.max(stars,old?.stars||0),ids:c.ids}};
  if(levelDone(next,c.level)&&c.level+1>state.unlocked&&c.level<levels){next.unlocked=c.level+1;unlocked=c.level+1;}
  const finishedLevels=Array.from({length:levels},(_,i)=>i+1).filter(l=>levelDone(next,l)).length,earned=Math.floor(finishedLevels/BADGE_EVERY);
  if(earned>state.badges.length){badge=`badge-${earned}`;next.badges=[...state.badges,badge];}
 }
 return {state:next,summary:{kind:c.kind,level:c.level,part:c.part,ids:c.ids,results,first:first.length,helped:helped.length,shown:c.ids.filter(id=>results[id]==='shown').length,stars:c.kind==='level'?starsFor(results):0,newStars,improved,unlocked,badge,offerReview:helped.length>=2?helped:null}};
}
export function totalStars(state){return Object.values(state.rounds).reduce((n,r)=>n+(r.stars||0),0);}
export function answeredCount(state){return Object.keys(state.answers).length;}
export function independentCount(state){return Object.values(state.answers).filter(isIndependent).length;}
// Skills where at least two answers needed help and fewer than two thirds were independent.
export function skillsToPractise(state){
 const by={};for(const a of Object.values(state.answers)){if(!a.skill)continue;const s=by[a.skill]||={total:0,first:0};s.total++;if(a.last==='first')s.first++;}
 return Object.entries(by).filter(([,s])=>s.total-s.first>=2&&s.first/s.total<2/3).map(([skill])=>skill);
}
// The most recent unfinished round across games, for the "Continue playing" card.
export function unfinishedRound(profile){
 const byGame=profile?.games?.byGame||{},last=profile?.games?.last?.game;
 const order=[last,...Object.keys(byGame).filter(g=>g!==last)].filter(Boolean);
 for(const game of order){const c=byGame[game]?.current;if(c&&c.ids?.length)return {game,...c,done:Object.keys(c.results||{}).length};}
 return null;
}

// ---------- validation for saved progress and backups (drops anything malformed) ----------
const ID=/^[A-Z]{2}-\d{2}-\d{2}$/,GAME=/^[a-z-]{2,40}$/;
export function validateGames(input){
 if(!input||typeof input!=='object'||Array.isArray(input))return undefined;
 const byGame={};
 for(const [game,s] of Object.entries(input.byGame||{})){
  if(!GAME.test(game)||!s||typeof s!=='object')continue;
  const answers={};for(const [id,a] of Object.entries(s.answers||{}).slice(0,5000))if(ID.test(id)&&a&&OUTCOMES.includes(a.best)&&OUTCOMES.includes(a.last))answers[id]={best:a.best,last:a.last,seen:Number.isInteger(a.seen)&&a.seen>0?Math.min(a.seen,100000):1,at:typeof a.at==='string'?a.at.slice(0,40):'',skill:typeof a.skill==='string'?a.skill.slice(0,40):''};
  const rounds={};for(const [k,r] of Object.entries(s.rounds||{}).slice(0,200))if(/^\d{1,2}-[12]$/.test(k)&&r&&Number.isInteger(r.stars)&&r.stars>=1&&r.stars<=3)rounds[k]={stars:r.stars,ids:Array.isArray(r.ids)?r.ids.filter(x=>ID.test(x)).slice(0,ROUND_SIZE):[]};
  const c=s.current;let current=null;
  if(c&&['level','review'].includes(c.kind)&&Array.isArray(c.ids)&&c.ids.length&&c.ids.length<=10&&c.ids.every(x=>ID.test(x))){const results={};for(const [id,r] of Object.entries(c.results||{}))if(c.ids.includes(id)&&OUTCOMES.includes(r))results[id]=r;current={kind:c.kind,level:Number.isInteger(c.level)?c.level:null,part:[0,1,2].includes(c.part)?c.part:0,ids:[...c.ids],index:Number.isInteger(c.index)?Math.max(0,Math.min(c.index,c.ids.length)):0,results};}
  byGame[game]={unlocked:Number.isInteger(s.unlocked)&&s.unlocked>=1&&s.unlocked<=20?s.unlocked:1,answers,rounds,badges:Array.isArray(s.badges)?s.badges.filter(b=>/^badge-\d{1,2}$/.test(b)).slice(0,10):[],current};
 }
 const last=input.last&&GAME.test(input.last.game)?{game:input.last.game,at:String(input.last.at||'').slice(0,40)}:null;
 return {byGame,last};
}
