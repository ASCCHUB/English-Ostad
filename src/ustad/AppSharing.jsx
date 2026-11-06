import {useEffect,useRef,useState} from 'react';
import {Capacitor,registerPlugin} from '@capacitor/core';
import {APP_SHARE_TITLE,SHARE_LINK_KEY,publicDownloadUrl,savedShareUrl,shareMessage,shareLinks} from './appSharing.js';
import './appSharing.css';
const NativeAppShare=registerPlugin('AppShare');
export function ShareSymbol(){return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></svg>;}
export function AppShareButton({onClick,language}){return <button type="button" className="app-share-button" onClick={onClick}><ShareSymbol/><span>Share app{['ps','rps','all'].includes(language)&&<small lang="ps" dir="rtl">اېپ شریک کړئ</small>}</span></button>;}
export default function AppSharing({onClose,language='ps',colorMode='light',platform=Capacitor.getPlatform()}){
 const android=platform==='android',panel=useRef(null),first=useRef(null),[mode,setMode]=useState(android?'apk':'link'),[url,setUrl]=useState(savedShareUrl),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[size,setSize]=useState(null);
 const safe=publicDownloadUrl(url),ps=['ps','rps','all'].includes(language);
 useEffect(()=>{const before=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';first.current?.focus();if(android)NativeAppShare.getInfo().then(info=>setSize(Math.round(info.sizeBytes/1048576))).catch(()=>{});return()=>{document.body.style.overflow=overflow;before?.focus?.();};},[]);
 function keydown(e){if(e.key==='Escape'&&!busy){onClose();return;}if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not(:disabled),input,a[href]')],a=items[0],b=items[items.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b?.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a?.focus();}}}
 function saveUrl(value){setUrl(value);setMessage('');const next=publicDownloadUrl(value);try{if(next)localStorage.setItem(SHARE_LINK_KEY,next);else localStorage.removeItem(SHARE_LINK_KEY);}catch{/* The current link can still be shared without storage. */}}
 async function share(channel='system'){
  if(busy)return;if(mode==='link'&&!safe){setMessage('Add a public HTTPS download link. A localhost address will not work for other people.');return;}
  setBusy(true);setMessage('');try{
   if(channel==='copy'){if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(safe);else{const input=document.createElement('textarea');input.value=safe;document.body.appendChild(input);input.select();const copied=document.execCommand('copy');input.remove();if(!copied)throw Error('Copy is unavailable. Select and copy the link above.');}setMessage('Download link copied.');}
   else if(android){if(mode==='apk')await NativeAppShare.shareApk();else await NativeAppShare.shareLink({url:safe,channel});setMessage('Choose a recipient and finish sharing in the selected app.');}
   else if(channel==='system'&&navigator.share){await navigator.share({title:APP_SHARE_TITLE,text:shareMessage(safe),url:safe});}
   else{const links=shareLinks(safe);if(channel==='email')window.location.href=links.email;else window.open(links.whatsapp,'_blank','noopener,noreferrer');}
  }catch(error){if(error?.name!=='AbortError')setMessage(error?.message||'Sharing could not open. Please try another option.');}finally{setBusy(false);}
 }
 return <div className="app-share-backdrop" onKeyDown={keydown} onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><section ref={panel} className="app-share-dialog" data-color-mode={colorMode} role="dialog" aria-modal="true" aria-labelledby="app-share-title" data-no-support>
  <div className="app-share-heading"><h2 id="app-share-title">Share this app</h2><button ref={first} type="button" aria-label="Close share options" disabled={busy} onClick={onClose}>×</button></div>
  {ps&&<p lang="ps" dir="rtl">دا اېپ د واټس اېپ یا ایمېل له لارې شریک کړئ.</p>}
  <p>Android phones can use the APK. For iPhone, share the app website link; open it in Safari and choose Share &gt; Add to Home Screen.</p>
  {android&&<div className="app-share-modes" role="group" aria-label="What to share"><button type="button" aria-pressed={mode==='apk'} disabled={busy} onClick={()=>{setMode('apk');setMessage('');}}>APK file{size?' · '+size+' MB':''}</button><button type="button" aria-pressed={mode==='link'} disabled={busy} onClick={()=>{setMode('link');setMessage('');}}>Download link</button></div>}
  {mode==='apk'?<><p>An Android recipient can install this APK. APK files cannot install on iPhone. Use the phone’s share menu to choose WhatsApp, email, or another app.</p><button className="primary" type="button" disabled={busy} onClick={()=>share()}><ShareSymbol/>{busy?'Preparing APK…':'Share APK file'}</button><p className="app-share-note">For email, a download link may work better than a large attachment.</p></>:<><label className="app-share-link-label">Public download link<input type="url" inputMode="url" autoComplete="url" placeholder="https://your-website.com/download" value={url} disabled={busy} onChange={e=>saveUrl(e.target.value)}/></label>{!safe&&<p className="app-share-note">No public download link is configured yet. For iPhone, use the hosted app website URL, not an APK file.{android?' You can share the APK file now.':''}</p>}<div className="app-share-actions"><button className="primary" type="button" disabled={busy||!safe} onClick={()=>share('whatsapp')}>WhatsApp</button><button className="secondary" type="button" disabled={busy||!safe} onClick={()=>share('email')}>Email</button>{(android||typeof navigator!=='undefined'&&navigator.share)&&<button className="secondary" type="button" disabled={busy||!safe} onClick={()=>share('system')}>More apps</button>}<button className="text-button" type="button" disabled={busy||!safe} onClick={()=>share('copy')}>Copy link</button></div></>}
  {message&&<p role="status" className="app-share-message">{message}</p>}
 </section></div>;
}
