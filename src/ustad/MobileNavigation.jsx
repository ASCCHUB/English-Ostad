import {languages} from './content.js';
import {useEffect,useRef} from 'react';
import {Bi} from './firstSteps/Bilingual.jsx';
import {Icon} from './ExplorerArt.jsx';
import './mobileNavigation.css';
const links=[['home','home','Home','کور'],['beginner','book','All lessons','ټول سبقونه'],['level-check','check','Quick exam','خپل انګلش امتحان واخلئ'],['topics','sparkle','Topics','موضوعګانې'],['games','game','Play','لوبې'],['progress','star','My Stars','زما ستوري'],['adult-spelling','book','Adult spelling','د لویانو د پاره املا']];
export default function MobileNavigation({onStudents,studentName,open,onOpen,onClose,page,go,onShare,onGuide,onParent,language='ps',onLanguage,colorMode='light',onTheme,muted=false,onMute}){
 const panel=useRef(null),close=useRef(null),trigger=useRef(null);
 useEffect(()=>{if(!open)return;const previous=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.current?.focus();const resize=()=>{if(window.innerWidth>700)onClose();};window.addEventListener('resize',resize);return()=>{document.body.style.overflow=overflow;window.removeEventListener('resize',resize);previous?.focus?.();};},[open]);
 function keydown(e){if(e.key==='Escape'){onClose();return;}if(e.key==='Tab'){const buttons=[...panel.current.querySelectorAll('button:not(:disabled),select:not(:disabled)')],first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}
 const action=fn=>{onClose();fn();};
 return <>
  {page!=='beginner-lesson'&&<button type="button" ref={trigger} className="mobile-menu-toggle" onClick={onOpen} aria-label="Open side menu" aria-controls="mobile-side-menu" aria-expanded={open}><span aria-hidden="true">☰</span></button>}
  {open&&<div className="mobile-menu-backdrop" onKeyDown={keydown} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><aside id="mobile-side-menu" className="mobile-menu-panel" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" ref={panel} data-no-support>
   <div className="mobile-menu-heading"><Bi as="h2" en="Menu" ps="مېنو"/><button ref={close} type="button" className="mobile-menu-close" onClick={onClose} aria-label="Close side menu">×</button></div>
   <button className="secondary" type="button" onClick={()=>action(onStudents)}><Bi en={`Students & competition: ${studentName||''}`} ps="زده کوونکي او سیالي"/></button><nav aria-label="Mobile sections">{links.map(([id,icon,en,ps])=><button type="button" key={id} aria-current={page===id?'page':undefined} className={page===id?'is-active':''} onClick={()=>action(()=>go(id))}><Icon name={icon}/><Bi en={en} ps={ps}/></button>)}</nav>
   <div className="mobile-menu-settings"><label><Bi en="Language" ps="ژبه"/><select aria-label="Explanation language" value={language} onChange={e=>onLanguage?.(e.target.value)}>{Object.entries(languages).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><button type="button" onClick={onTheme}><Icon name={colorMode==='dark'?'sun':'moon'}/><Bi en={colorMode==='dark'?'Switch to light mode':'Switch to dark mode'} ps={colorMode==='dark'?'روښانه رنګونه':'تیاره رنګونه'}/></button><button type="button" onClick={onMute} aria-pressed={muted}><Icon name="sound"/><Bi en={muted?'Turn sound on':'Mute sound'} ps={muted?'اواز چالان کړئ':'اواز بند کړئ'}/></button></div><div className="mobile-menu-tools"><button type="button" onClick={()=>action(onGuide)}><Bi en="How to use" ps="د کارولو لارښود"/></button><button type="button" onClick={()=>action(onShare)}><Bi en="Share app" ps="اېپ شریک کړئ"/></button><button type="button" onClick={()=>action(onParent)}><Icon name="settings"/><Bi en="For parents" ps="د مور او پلار لپاره"/></button></div>
  </aside></div>}
 </>;
}
