// Checks every phrase, sentence, story line, story question, dialogue line and check answer the child reads, in every level:
// each word must be taught by that lesson. A word counts as taught when
//  • it is decodable and every one of its sounds has been introduced by then, or
//  • a lesson at or before this one lists it (wordIds / trickyWordIds).
// Chants and picture words are heard, not read, so they are not checked.
// Usage: node scripts/audit-taught-words.mjs   (exit 1 if anything is used early)
import {readFile} from 'node:fs/promises';
const course=JSON.parse(await readFile(new URL('../docs/beginner-course-phase1/curriculum.json',import.meta.url),'utf8'));
const at=new Map(course.lessons.map((l,i)=>[l.id,i])),words=new Map(course.lexicon.map(w=>[w.id,w])),gpcs=new Map(course.graphemePhonemeCorrespondences.map(g=>[g.id,g]));
const listedAt=new Map();course.lessons.forEach((l,i)=>{for(const id of [...l.content.wordIds,...l.content.trickyWordIds])if(!listedAt.has(id))listedAt.set(id,i);});
function taughtBy(id,i){
 const w=words.get(id);if(!w)return {ok:false,why:'not in the word list'};
 if(listedAt.has(id)&&listedAt.get(id)<=i)return {ok:true};
 if(w.category==='decodable'&&w.segments?.every(s=>at.get(gpcs.get(s)?.introducedAt)<=i))return {ok:true};
 const when=listedAt.has(id)?course.lessons[listedAt.get(id)].id:w.category==='decodable'?'its sounds are taught later':'no lesson teaches it';
 return {ok:false,why:`taught in ${when}`};
}
const problems=[];
course.lessons.forEach((l,i)=>{
 const lines=[...l.content.sentences.map(s=>['phrase/sentence',s]),...(l.content.story?.sentences||[]).map(s=>['story',s]),...l.content.dialogue.flat().map(s=>['dialogue',s]),...(l.content.story?.questions||[]).flatMap(q=>[['story answer',String(q.answer)],...(q.question?[['story question',q.question]]:[])]),...l.assessment.items.filter(q=>typeof q.answer==='string'&&q.answer.includes(' ')||Array.isArray(q.answer)&&q.answer.some(x=>x.length>1)).map(q=>['check answer',[].concat(q.answer).join(' ')])];
 for(const [kind,line] of lines)for(const token of line.match(/[A-Za-z]+/g)||[]){const id=token.toLowerCase(),r=taughtBy(id,i);if(!r.ok)problems.push(`${l.id} (${kind}) "${line}": "${token}" ${r.why}`);}
});
console.log(problems.length?`Words used before they are taught (${problems.length}):\n  `+[...new Set(problems)].join('\n  '):'Every phrase, sentence, story and check answer uses only taught words.');
process.exitCode=problems.length?1:0;
