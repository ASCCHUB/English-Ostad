// Shows the chosen support language under English headings, buttons, instructions and labels
// that do not already render their own translation. The text comes from the support dictionary;
// CSS draws it from data-support. Answer choices stay English so practice is not given away.
import {support} from './supportCopy.js';
const TEXT_ELEMENTS='h1,h2,h3,h4,p,button,a,label,summary,small,strong,em,li,span,b,th,td,legend';
const SKIP='.explorer-brand,.translations,.translation-line,.bilingual-label,[data-no-support],select,option,textarea,input,.quiz-options,.pw-options,.pw-tiles,.train-tiles,.train-answer,.memory-grid,.path-match,.story-caption,.unit-examples,.trace,.spelling-chunks,.hear-word,.tap-words';
const rtl=new Set(['ps','ur']);
// Text split by <br> or inline icons still reads as one sentence.
function ownText(el){const parts=[];for(const node of el.childNodes)if(node.nodeType===3)parts.push(node.textContent);return parts.join(' ').replace(/\s+/g,' ').trim();}
function clear(el){delete el.dataset.support;delete el.dataset.supportDir;delete el.dataset.supportLang;}
// English words and numbers inside an RTL line are isolated (LRI … PDI) so they never reverse.
const isolate=line=>line.replace(/[A-Za-z][A-Za-z0-9_'’-]*(?:\s+[A-Za-z][A-Za-z0-9_'’-]*)*|\d+(?:\s?[/:.,–-]\s?\d+)*%?/g,run=>'⁦'+run+'⁩');
export function supportLine(text,language){
 if(language==='en'||!/[A-Za-z]{2,}/.test(text))return null;
 const item=support(text);if(!item)return null;
 const keys=language==='all'?['ps','ur']:[language];
 const lines=keys.map(k=>item[k]&&(rtl.has(k)?isolate(item[k]):item[k])).filter(Boolean);
 return lines.length?{text:lines.join('\n'),dir:keys.every(k=>rtl.has(k))?'rtl':keys.some(k=>rtl.has(k))?'auto':'ltr',lang:keys.length===1&&keys[0]==='ps'?'ps':keys.includes('ps')?'mixed':''}:null;
}
export function applySupport(root,language){
 if(!root)return;
 for(const el of root.querySelectorAll(TEXT_ELEMENTS)){
  const text=ownText(el);
  const line=text&&!el.closest(SKIP)&&!el.querySelector(':scope > .translations, :scope > .translation-line')&&!el.nextElementSibling?.classList.contains('translations')&&supportLine(text,language);
  // Skip when the same meaning is already printed beside it (for example a word card's own translation).
  if(!line||el.parentElement?.textContent.includes(line.text.split('\n')[0].replace(/[⁦⁩]/g,''))){if(el.dataset.support)clear(el);continue;}
  if(el.dataset.support!==line.text){el.dataset.support=line.text;el.dataset.supportDir=line.dir;if(line.lang)el.dataset.supportLang=line.lang;else delete el.dataset.supportLang;}
 }
}
export function watchSupport(root,language){
 if(!root||typeof MutationObserver==='undefined')return()=>{};
 let frame=0;
 const run=()=>{frame=0;applySupport(root,language);};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(run);};
 run();
 const observer=new MutationObserver(schedule);
 observer.observe(root,{childList:true,subtree:true,characterData:true});
 return()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame);for(const el of root.querySelectorAll('[data-support]'))clear(el);};
}
