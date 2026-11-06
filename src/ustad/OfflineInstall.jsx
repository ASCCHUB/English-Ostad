import {useEffect,useState} from 'react';
import {Capacitor} from '@capacitor/core';
import {packStatus,savePack} from './offline.js';
import {Bi} from './firstSteps/Bilingual.jsx';
import './offlineInstall.css';
export default function OfflineInstall(){
 const native=Capacitor.isNativePlatform();
 const [state,setState]=useState(native?'ready':'checking'),[error,setError]=useState('');
 const apple=typeof navigator!=='undefined'&&/iPhone|iPad|iPod/.test(navigator.userAgent);
 const standalone=typeof window!=='undefined'&&(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone);
 useEffect(()=>{if(native)return;let alive=true;const refresh=async()=>{const ready=await packStatus();if(alive)setState(ready?'ready':'waiting');};refresh();const worker=navigator.serviceWorker;worker?.ready.then(refresh).catch(()=>{});worker?.addEventListener('controllerchange',refresh);return()=>{alive=false;worker?.removeEventListener('controllerchange',refresh);};},[native]);
 async function save(){setState('saving');setError('');try{await navigator.storage?.persist?.().catch(()=>false);await savePack({production:import.meta.env.PROD});setState('ready');}catch(e){setState('waiting');setError(e.message);}}
 return <section className="offline-install" data-no-support aria-label="Installation and offline lessons">
  <Bi as="strong" role="status" en={state==='ready'?'✓ Lessons saved for offline use':state==='saving'?'Saving lessons… Keep the app open.':'Save lessons for offline use'} ps={state==='ready'?'سبقونه بې له انټرنېټه کارولو لپاره محفوظ دي':state==='saving'?'سبقونه محفوظېږي. اېپ خلاص پرېږدئ.':'سبقونه بې له انټرنېټه کارولو لپاره محفوظ کړئ'}/>
  <Bi as="p" en={native?'Lessons, pictures and progress are stored on this phone.':'Connect once to save the lessons and pictures. When this says “saved”, you can reopen and learn without internet.'} ps="یو ځل انټرنېټ سره وصل شئ او سبقونه محفوظ کړئ. بیا بې له انټرنېټه سبق لوستلی شئ."/>
  {!native&&state!=='ready'&&<button className="secondary" disabled={state==='saving'} onClick={save}><Bi en={state==='saving'?'Saving…':'Save lessons offline'} ps="سبقونه محفوظ کړئ"/></button>}
  {error&&<p role="alert">{error}</p>}
  {!native&&<details open={apple&&!standalone}><summary><Bi en="Install on iPhone" ps="په آیفون کې اېپ نصب کړئ"/></summary><Bi as="p" en="Open the app’s website link in Safari. Tap Share, then Add to Home Screen, then Add. If you came from WhatsApp, open the link in Safari first." ps="د اېپ لینک په سفاري کې پرانیزئ. شریکول، بیا کورنۍ پردې ته اضافه کول او بیا اضافه کول کېکاږئ. د واټس اېپ لینک هم لومړی په سفاري کې پرانیزئ."/><Bi as="p" en="An Android APK cannot install on iPhone. Share the website link with iPhone users." ps="د انډرایډ APK په آیفون کې نه نصبېږي. د آیفون لپاره د ویبپاڼې لینک شریک کړئ."/></details>}
  <small>Text and pictures work offline once saved. Audio depends on available recordings and an English voice installed on the phone.</small>
 </section>;
}
