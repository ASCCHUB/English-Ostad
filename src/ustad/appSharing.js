export const APP_SHARE_TITLE='Pashto to English: Learn & Play';
export const APP_SHARE_TEXT='Learn English with Pakistani Pashto help, pictures, listening, spelling, stories and games.';
export const SHARE_LINK_KEY='english-ustad-public-download-url';
export function publicDownloadUrl(value){
 try{const u=new URL(String(value||'').trim()),host=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||!host||host==='localhost'||host==='[::1]'||host.endsWith('.localhost')||host.endsWith('.local')||/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)||/^172\.(1[6-9]|2\d|3[01])\./.test(host))return '';
  u.hash='';return u.href;
 }catch{return '';}
}
export function shareMessage(url){const safe=publicDownloadUrl(url);if(!safe)throw Error('Add a public HTTPS download link first.');return `${APP_SHARE_TITLE}\n${APP_SHARE_TEXT}\n\nDownload: ${safe}`;}
export function shareLinks(url){const text=shareMessage(url);return {whatsapp:'https://wa.me/?text='+encodeURIComponent(text),email:'mailto:?subject='+encodeURIComponent(APP_SHARE_TITLE)+'&body='+encodeURIComponent(text)};}
export function savedShareUrl(){try{return publicDownloadUrl(localStorage.getItem(SHARE_LINK_KEY))||publicDownloadUrl(import.meta.env?.VITE_PUBLIC_APP_URL)||publicDownloadUrl((globalThis.location?.origin||'')+(import.meta.env?.BASE_URL||'/'));}catch{return publicDownloadUrl(import.meta.env?.VITE_PUBLIC_APP_URL);}}
