import library from './wordPhotos.json' with {type:'json'};
// Course words with no photo have a simple drawing instead (scripts/make-drawings.mjs).
import drawings from './drawings.json' with {type:'json'};
const drawn=new Set(drawings);
// A drawing comes first: it replaces photos a young child could not name at a glance (dark, distant or confusing).
// Some words share one drawing (house → home). The same word always returns the same picture object.
const drawingAlias={house:'home'},drawingCache=new Map();
function drawing(key){key=drawingAlias[key]||key;if(!drawn.has(key))return null;if(!drawingCache.has(key))drawingCache.set(key,{src:`/drawings/${key}.svg`,kind:'drawing',...(key==='yellow'?{color:'yellow'}:{})});return drawingCache.get(key);}
export function wordPhoto(text){let key=String(text?.en||text||'').toLowerCase().trim().replace(/^[^a-z]+|[^a-z]+$/g,'');for(let i=0;i<5;i++){const picture=drawing(key);if(picture)return picture;const item=library.words[key];if(!item)return null;if(item.alias){key=item.alias;continue;}return item;}return null;}
export function pictureWord(emoji){return library.emojiWords[emoji]||null;}
export const photoLibrary=library;
