// Builds the signed Google Play upload: web build → copy into the Android project → Gradle → output/English-Ustad.aab.
// Needs the signing key described in docs/play-store/RELEASE.md (android/keystore.properties + the .jks file).
// Any failing step stops the script with an error (so an old bundle is never mistaken for a new one).
// Usage: npm run android:aab
import {execSync} from 'node:child_process';
import {copyFileSync,existsSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const run=(cmd,cwd='.')=>execSync(cmd,{cwd,stdio:'inherit'});
const props='android/keystore.properties';
if(!existsSync(props)){console.error(`No signing key set up: ${props} is missing. Follow docs/play-store/RELEASE.md, step 1.`);process.exit(1);}
const store=readFileSync(props,'utf8').match(/^storeFile=(.+)$/m)?.[1]?.trim();
if(!store||!existsSync(resolve('android',store))){console.error(`The key file named in ${props} (storeFile=${store||'?'}) was not found in the android folder.`);process.exit(1);}
run('npm test');
run('npm run release:check');
run('npm run build');
run('node scripts/verify-android-css.mjs');
run('npx cap sync android');
// Full path: Windows may refuse to run programs from the current folder.
run(`"${resolve('android',process.platform==='win32'?'gradlew.bat':'gradlew')}" bundleRelease`,'android');
mkdirSync('output',{recursive:true});
copyFileSync('android/app/build/outputs/bundle/release/app-release.aab','output/English-Ustad.aab');
console.log('Google Play upload ready: output/English-Ustad.aab');
