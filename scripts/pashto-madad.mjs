// One-time wording change (approved 2026-10-27): مرسته / مرستې → مدد in every Pashto string (Roman: marasta → madad).
// مدد is masculine, so the one past-tense verb that agreed with مرسته changes too: زما مرسته یې وکړه → زما مدد یې وکړ.
// Usage: node scripts/pashto-madad.mjs          print every string that would change
//        node scripts/pashto-madad.mjs --write  change the files and write docs/pashto-madad-changes.md
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const files=['src/ustad/adventureContent.js','src/ustad/firstSteps/FirstSteps.jsx','src/ustad/SoundKit.jsx','src/ustad/supportAdvanced.js','src/ustad/supportCopy.js','src/ustad/supportScreens.js','src/ustad/supportSound.js',
 'docs/beginner-course-phase1/curriculum.json','docs/beginner-course-phase1/curriculum.md','docs/beginner-course-phase1/audio-manifest.json','docs/beginner-course-phase1/audio-recording-list.csv','docs/beginner-course-phase2/audio-recording-list.csv','docs/english-ustad-language-review.json'];
const swap=s=>s.replaceAll('زما مرسته یې وکړه','زما مدد یې وکړ').replaceAll('zama marasta ye wakra','zama madad ye wakr')
 .replaceAll('مرستې','مدد').replaceAll('مرسته','مدد').replaceAll('Marasta','Madad').replaceAll('maraste','madad').replaceAll('marasta','madad');
// A "string" here is a run of text between quotes, tags or line breaks.
const strings=s=>[...new Set(s.match(/[^"'`<>\n\\]*(مرست|[Mm]arast)[^"'`<>\n\\]*/g)||[])].map(x=>x.trim());
const write=process.argv.includes('--write'),report=[];
for(const f of files){
 const url=new URL(f,root),before=await readFile(url,'utf8'),changed=strings(before);if(!changed.length)continue;
 report.push(`\n## ${f}\n`,...changed.map(x=>`- ${x}\n  → ${swap(x)}`));
 if(write)await writeFile(url,swap(before));
}
console.log(report.join('\n'));
if(write)await writeFile(new URL('docs/pashto-madad-changes.md',root),`# مرسته → مدد (2026-10-27)\n\nEvery Pashto and Roman Pashto string changed by scripts/pashto-madad.mjs. Course text in curriculum.json also flows into the app's course.json and the audio scripts.\nOne grammar change needs review: in supportAdvanced.js, "زما مرسته یې وکړه" became "زما مدد یې وکړ" (masculine past).\n${report.join('\n')}\n`);
