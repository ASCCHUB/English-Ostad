import {readdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const files=(await readdir('dist/assets')).filter(n=>/\.(js|css|woff2?)$/.test(n)).map(n=>'/assets/'+n);
const illustrations=(await readdir('dist/explorers')).filter(n=>/\.(png|webp|svg)$/.test(n)).map(n=>'/explorers/'+n);
// Pashto recordings are cached too, so Pashto audio works offline.
const recordings=(await readdir('dist/audio/ps').catch(()=>[])).filter(n=>/^ps-[0-9a-f]{8}\.mp3$/.test(n)).map(n=>'/audio/ps/'+n);
// Pre-recorded Pakistani English voice (scripts/make-pk-voice.mjs), when present.
const pkVoice=(await readdir('dist/audio/en-pk').catch(()=>[])).filter(n=>/^[0-9a-f]{14}\.mp3$/.test(n)).map(n=>'/audio/en-pk/'+n);
const urVoice=(await readdir('dist/audio/ur-pk').catch(()=>[])).filter(n=>/^[0-9a-f]{14}\.mp3$/.test(n)).map(n=>'/audio/ur-pk/'+n);
const learningPhotos=(await readdir('dist/learning-photos')).filter(n=>/\.(jpg|png|webp|json|html)$/.test(n)).map(n=>'/learning-photos/'+n);
// Simple drawings for course words that have no photo.
const drawings=(await readdir('dist/drawings').catch(()=>[])).filter(n=>n.endsWith('.svg')).map(n=>'/drawings/'+n);
const urls=[...learningPhotos,...drawings,'/first-steps-audio.json','/','/manifest.json','/ustad-icon.svg','/favicon-32.png','/apple-touch-icon.png','/ustad-icon-192.png','/ustad-icon-512.png','/ustad-icon-maskable-512.png',...files,...illustrations,...recordings,...pkVoice,...urVoice,'/en-pk-voice.json','/ur-pk-voice.json'];
const firstStepsRecordings=JSON.parse(await readFile('public/first-steps-audio.json','utf8'));
for(const recording of Object.values(firstStepsRecordings.recordings||{}))if(recording.status==='ready'&&recording.reviewStatus==='approved'&&recording.file){if(!/^\/audio\/first-steps\/[A-Za-z0-9/_-]+\.(mp3|ogg|wav)$/.test(recording.file))throw Error('Unsafe course recording path');urls.push(recording.file);}
const hash=createHash('sha256');
for(const url of urls)hash.update(url).update(await readFile(url==='/'?'dist/index.html':'dist'+url));
const version=hash.digest('hex').slice(0,16);
await writeFile('dist/offline-manifest.json',JSON.stringify({version,urls}));
const worker=await readFile('public/sw.js','utf8');
await writeFile('dist/sw.js',worker.replace('__USTAD_BUILD_VERSION__',version));
console.log(`Offline manifest: ${urls.length} core files, version ${version}`);
