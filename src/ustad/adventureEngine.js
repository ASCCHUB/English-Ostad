import {completeActivity} from './engine.js';
import {validateAdventure,CLASS_COUNT} from './adventureSettings.js';
export {CLASS_COUNT,defaultAdventure,validateAdventure} from './adventureSettings.js';
export function logAdventure(profile,id,{kind='demonstrated',attempts=1,needsReview=false}={},now=new Date()){
 const adventure=validateAdventure(profile.adventure),old=adventure.events[id];
 const next={...profile,adventure:{...adventure,events:{...adventure.events,[id]:{kind,attempts:Math.min(100000,(old?.attempts||0)+attempts),needsReview,date:now.toISOString()}}}};
 return kind==='demonstrated'?completeActivity(next,id,now):next;
}
export function suggestedClass(answers){let consecutive=0;for(const correct of answers){if(!correct)break;consecutive++;}return Math.min(CLASS_COUNT-1,consecutive);}
export function unitProgress(profile,id){const events=profile.adventure?.events||{};return {watched:!!events['watch-'+id],joined:!!events['join-'+id],played:!!events['play-'+id],reviewed:!!events['review-'+id]};}
