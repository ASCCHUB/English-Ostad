// Adds studio/teacher recordings to the app as bundled files (every device, offline).
//  1. Save each file in public/audio/first-steps/ named by its ID from
//     docs/beginner-course-phase2/audio-recording-list.csv, e.g. en-GB-34a3a1506adf.mp3 (.mp3, .ogg or .wav).
//  2. After listening, set that row's "Review status" to approved (and Reviewer, Signed date) in the CSV.
//  3. Run: npm run recordings:add   then build as usual (npm run build caches them for offline use).
// Before a release: npm run release:check (recordings are optional; it fails only on unreviewed or misnamed files).
// Only approved files play; files waiting for review are listed. A grown-up's home recording is used
// only for clips that have no approved bundled file.
import {readdir,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),csvUrl=new URL('docs/beginner-course-phase2/audio-recording-list.csv',root);
export function parseCsv(text){
 const rows=[];let row=[],cell='',quoted=false;text=text.replace(/^﻿/,'');
 for(let i=0;i<text.length;i++){const c=text[i];
  if(quoted){if(c==='"'&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"')quoted=false;else cell+=c;}
  else if(c==='"')quoted=true;else if(c===',' ){row.push(cell);cell='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell='';}else cell+=c;}
 if(cell||row.length){row.push(cell);rows.push(row);}
 const [head,...body]=rows;return {head,rows:body.filter(r=>r.length>1).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])))};
}
export const toCsv=(head,rows)=>'﻿'+[head,...rows.map(r=>head.map(h=>r[h]))].map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
if(process.argv[1]?.endsWith('add-recordings.mjs')){
 const {head,rows}=parseCsv(await readFile(csvUrl,'utf8'));
 const files=new Map((await readdir(new URL('public/audio/first-steps/',root)).catch(()=>[])).filter(n=>/^[A-Za-z0-9_-]+\.(mp3|ogg|wav)$/.test(n)).map(n=>[n.replace(/\.[a-z0-9]+$/,''),n]));
 const ids=new Set(rows.map(r=>r.ID)),unknown=[...files.keys()].filter(id=>!ids.has(id));
 const recordings={},approved=[],waiting=[];
 for(const r of rows){
  const name=files.get(r.ID),file=name?'/audio/first-steps/'+name:null,review=(r['Review status']||'pending_review').trim().toLowerCase();
  r['Recording status']=file?'ready':'pending_recording';r.File=file||'';
  recordings[r.ID]={status:r['Recording status'],reviewStatus:review,file,alignment:null};
  if(file)(review==='approved'?approved:waiting).push(r.ID);
 }
 await writeFile(new URL('public/first-steps-audio.json',root),JSON.stringify({version:1,recordings},null,2)+'\n');
 await writeFile(csvUrl,toCsv(head,rows));
 console.log(`Recordings: ${files.size} files found, ${approved.length} approved and playing, ${waiting.length} waiting for review, ${rows.length-approved.length-waiting.length} clips still to record.`);
 if(waiting.length)console.log('Waiting for review (set Review status to approved in the CSV):\n  '+waiting.join('\n  '));
 if(unknown.length)console.log('Files with no matching ID in the CSV (check the name):\n  '+unknown.map(id=>files.get(id)).join('\n  '));
 // --release: the app ships with the device voice (no studio recordings needed). Only files waiting for review or
 // with an unknown name fail the release, so an unchecked recording never ships. Missing recordings are just counted.
 if(process.argv.includes('--release')){
  const problems=waiting.length+unknown.length;
  console.log(problems?`Release check FAILED: ${waiting.length} recording(s) waiting for review, ${unknown.length} file(s) with an unknown name.`:`Release check passed: device voice is used for every clip without an approved recording (${approved.length} recorded).`);
  if(problems)process.exitCode=1;
 }
}
