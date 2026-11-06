import {writeFile,mkdir} from 'node:fs/promises';
import {words,phrases,readings,phonics,prompts} from '../src/ustad/content.js';
import {grammarLessons,stories,phonicsSupport} from '../src/ustad/curriculum.js';
import {ui} from '../src/ustad/i18n.js';
import {explorerCopy} from '../src/ustad/explorerCopy.js';
import {pashtoLocale} from '../src/ustad/pashtoLocale.js';
import {adventureHelp} from '../src/ustad/adventureContent.js';
import {studyCopy} from '../src/ustad/studyContent.js';
await mkdir('docs',{recursive:true});
await writeFile('docs/english-ustad-language-review.json',JSON.stringify({status:'DRAFT — fluent Swat / Dir / Malakand Pashto and Urdu teacher review required',pashtoLocale,explorerCopy,studyCopy,adventureHelp,instructions:'Review English meaning, natural Khyber Pakhtunkhwa Pashto, Roman Pashto consistency, Urdu and Roman Urdu. Add corrections and reviewer notes. This export is for review; changes must be applied to the source modules and tested before release.',words,phrases,readings,phonics,phonicsSupport,prompts,grammarLessons,stories,ui},null,2));
console.log('Language review pack exported to docs/english-ustad-language-review.json');

