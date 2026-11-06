// Marks Pashto lines "ready" when their recording exists in public/audio/ps/<id>.mp3,
// and back to "pending" when it is removed. Run after adding recordings:
//   node scripts/pashto-audio-status.mjs
import {readdir,readFile,writeFile} from 'node:fs/promises';
const file=new URL('../src/ustad/locales/ps.js',import.meta.url);
const recordings=new Set((await readdir(new URL('../public/audio/ps/',import.meta.url)).catch(()=>[])).filter(n=>/^ps-[0-9a-f]{8}\.mp3$/.test(n)).map(n=>n.slice(0,-4)));
const source=await readFile(file,'utf8');
const at=source.indexOf('export default ');
const locale=JSON.parse(source.slice(at+'export default '.length).trim().replace(/;$/,''));
let ready=0,changed=0;
for(const entry of Object.values(locale.entries)){const next=recordings.has(entry.id)?'ready':'pending';if(entry.audio!==next){entry.audio=next;changed++;}if(next==='ready')ready++;}
const known=new Set(Object.values(locale.entries).map(e=>e.id));
const unknown=[...recordings].filter(id=>!known.has(id));
await writeFile(file,source.slice(0,at)+'export default '+JSON.stringify(locale,null,1)+';\n');
console.log(`${ready} of ${Object.keys(locale.entries).length} Pashto lines have a recording (${changed} updated).`);
if(unknown.length)console.log(`These files match no line in ps.js: ${unknown.map(id=>id+'.mp3').join(', ')}`);
