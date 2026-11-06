import {support} from './supportCopy.js';
import {ui,localized} from './i18n.js';
import {pashtoLocale} from './pashtoLocale.js';
import {withPashto} from './pashto.js';
import {PashtoSpeaker} from './SoundKit.jsx';
import '@fontsource/noto-naskh-arabic/arabic-400.css';
import '@fontsource/noto-naskh-arabic/arabic-700.css';
import './pashto.css';
const rtl=language=>['ps','ur'].includes(language);
// Roman Pashto and Roman Urdu are tagged as those languages in Latin script, not as English.
const tag=language=>({ps:pashtoLocale.languageTag,ur:'ur',rps:'ps-Latn',rur:'ur-Latn'})[language]||'en';
// Keep English words and numbers (2 / 6, 100°C) left-to-right inside an RTL explanation.
const LTR_RUN=/([A-Za-z][A-Za-z0-9_'’-]*(?:\s+[A-Za-z][A-Za-z0-9_'’-]*)*|\d+(?:\s?[/:.,–-]\s?\d+)*%?)/g;
export function IsolatedText({text,ltr=false}){if(ltr)return String(text??'');return String(text??'').split(LTR_RUN).map((part,i)=>i%2?<bdi key={i} lang={/^[A-Za-z]/.test(part)?'en':undefined} dir="ltr">{part}</bdi>:part);}
// Full Pashto lines (instructions, explanations) get a speaker: it plays the Lower Dir recording,
// or says the audio is pending. Inline lines sit inside buttons and labels, so they get none.
export function Translation({item,language,inline=false}){if(language==='en'||!item)return null;item=withPashto(item);const keys=language==='all'?['ps','rps','ur','rur']:[language];const Container=inline?'span':'div',Line=inline?'span':'p';return <Container className="translations">{keys.map(k=><Line key={k} className={inline?'translation-line':undefined} lang={tag(k)} dir={rtl(k)?'rtl':'ltr'}><IsolatedText text={item[k]} ltr={!rtl(k)}/>{!inline&&(k==='ps'||k==='rps'&&language==='rps')&&item[k]&&<PashtoSpeaker en={item.en} text={item.ps}/>}</Line>)}</Container>;}
export function Label({id,language}){const row=ui[id];if(!row)return id;return <span className="bilingual-label"><span lang="en" dir="ltr">{row[0]}</span>{language==='en'?null:language==='all'?<span className="label-translations">{['ps','rps','ur','rur'].map(k=><small key={k} lang={tag(k)} dir={rtl(k)?'rtl':'ltr'}><IsolatedText text={localized(id,k)} ltr={!rtl(k)}/></small>)}</span>:<small dir={rtl(language)?'rtl':'ltr'} lang={tag(language)}><IsolatedText text={localized(id,language)} ltr={!rtl(language)}/></small>}</span>;}
// Support-language line for an English instruction, question, hint or answer.
export function Explain({text,language,inline=false}){const item=support(text);return item?<Translation item={item} language={language} inline={inline}/>:null;}
// Label for an icon-only control (defined beside the translation lookup it uses).
export {ariaText} from './supportCopy.js';
