import {useEffect,useState} from 'react';
import {resolveColorMode} from './appearanceModel.js';
export function useColorMode(mode){
 const [systemDark,setSystemDark]=useState(()=>typeof window!=='undefined'&&!!window.matchMedia?.('(prefers-color-scheme: dark)').matches);
 useEffect(()=>{const media=window.matchMedia?.('(prefers-color-scheme: dark)');if(!media)return;const update=()=>setSystemDark(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 const resolved=resolveColorMode(mode,systemDark);
 useEffect(()=>{const root=document.documentElement;root.dataset.colorMode=resolved;root.style.colorScheme=resolved;return()=>{delete root.dataset.colorMode;root.style.removeProperty('color-scheme');};},[resolved]);
 return resolved;
}
