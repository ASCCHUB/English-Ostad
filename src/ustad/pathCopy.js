// Every English line the learning path shows to beginners, so tests can check its support-language copy.
import {pathLessons} from './pathModel.js';
export const pathUiText=['Continue My Adventure','My adventure map','What have I learned?','My badges','Extra practice','Completed','Continue here','Up next','Ready to explore','Unlocks later','Remember this from before?','Tap the tiles to build your answer.','Check my answer','Let’s make it easier. Try again with fewer choices.','You kept trying and found it!','You got it on the first try!','Listen, then tap the picture.','Tap a word, then its picture.','Say the word aloud, then look for its picture.','Trace the letter with your finger.','Listen, then say it aloud. Say it to a grown-up or a toy friend!','I said it!','Key ideas','Listen and repeat','Take a break','This adventure unlocks later','Lesson complete!','What you learned','Next adventure','Watch and listen','Learn the ideas','Listen and tap','Match the pairs','Trace the letter','Say it aloud'];
export function beginnerPathText(){
 const out=new Set();
 for(const l of pathLessons.filter(x=>x.classIndex<=4)){
  out.add(l.title);out.add(l.learned);if(l.next)out.add(`Next, help ${l.next.friend} with “${l.next.title}”!`);
  for(const a of l.activities){
   if(a.title)out.add(a.title);if(a.text)out.add(a.text);
   for(const q of a.questions||[]){out.add(q.prompt);out.add(q.hint);if(!a.tiles)for(const o of q.options)if(!/^[A-Za-z]$/.test(o))out.add(o);}
   for(const en of a.choices||[])out.add(en);
  }
 }
 return [...out].filter(Boolean);
}
