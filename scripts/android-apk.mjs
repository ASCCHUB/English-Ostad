// Builds the installable Android app: web build → copy into the Android project → Gradle → output/English-Ustad.apk.
// Any failing step stops the script with an error (so an old APK is never mistaken for a new one).
// Usage: npm run android:apk
import {execSync} from 'node:child_process';
import {copyFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const run=(cmd,cwd='.')=>execSync(cmd,{cwd,stdio:'inherit'});
run('npm run build');
run('node scripts/verify-android-css.mjs');
run('npx cap sync android');
// Full path: Windows may refuse to run programs from the current folder.
run(`"${resolve('android',process.platform==='win32'?'gradlew.bat':'gradlew')}" assembleDebug`,'android');
mkdirSync('output',{recursive:true});
copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk','output/English-Ustad.apk');
console.log('Android app ready: output/English-Ustad.apk');
