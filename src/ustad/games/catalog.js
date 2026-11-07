// The games on the Play screen. Question counts come from bank/index.json, which is written from the
// banks themselves, so the screen only ever shows questions that exist and can be played.
import index from './bank/index.json' with {type:'json'};
import {approved,ui} from './content/pashto.js';

// Pashto titles marked with status: 'kept'/'converted' come from locales/ps.js; 'check' are drafts.
export const games=[
 {id:'letter-hunt',icon:'icon-letter-hunt',accent:'sky',title:'Letter Hunt',ps:'د ټکو لټون',filters:['letters'],stage:'letters',
  skill:'Find big and small letters, match partners, spot letters in words and fill alphabet gaps.',skillPs:'لوی او وړوکي توري پیدا کړئ او په لفظونو کې یې وګورئ.'},
 {id:'sound-safari',icon:'icon-sound-safari',accent:'mint',title:'Sound Safari',ps:'د اوازونو سفر',filters:['sounds'],stage:'sounds',
  skill:'Hear first, last and middle sounds, link sounds to letters and blend sounds into words.',skillPs:'اول، آخري او مینځني اوازونه واورئ او اوازونه یو ځای کړئ.'},
 {id:'feed-animal',icon:'icon-feed-animal',accent:'yellow',title:'Feed the Animal',ps:'څاروي ته خوراک ورکړئ',filters:['words','sentences'],stage:'words',
  skill:'Follow short English instructions with animals, food, colours and numbers.',skillPs:'د ځناورو، خوراک، رنګونو او شمېرو سره لنډ انګرېزي هدایات ومنئ.'},
 {id:'number-adventure',icon:'icon-number-adventure',accent:'coral',title:'Number Adventure',ps:'د شمېرو سفر',filters:['numbers','words'],stage:'words',
  skill:'Count, read and spell number words, compare groups, continue patterns and add.',skillPs:'وشمېرئ، د شمېرو لفظونه ولولئ، ډلې پرتله کړئ او جمع کړئ.'},
 {id:'fox-apple',icon:'icon-fox-apple',accent:'coral',title:'Help Fox Find the Apple',ps:'ګیدړ ته مڼه پیدا کړئ',filters:['sentences','words'],stage:'sentences',
  skill:'Find things by name, colour, size and place (under, beside, behind) and read short sentences.',skillPs:'شیان د نوم، رنګ، کچې او ځای په مرسته پیدا کړئ او لنډې جملې ولولئ.'}
].map(g=>({...g,questions:index.games[g.id].questions,levels:index.games[g.id].levels}));

// Planned next on the path. They show as "Coming soon" with no button until they have real content.
export const upcoming=[
 {id:'word-builder',icon:'icon-word-builder',title:'Word Builder',filters:['words'],stage:'blending',skill:'Build short words from their sounds.'},
 {id:'missing-letter',icon:'icon-missing-letter',title:'Missing Letter',filters:['letters','words'],stage:'spelling',skill:'Find the letter that completes a word.'},
 {id:'picture-word',icon:'icon-picture-word',title:'Picture–Word Match',filters:['words'],stage:'words',skill:'Read a word and match it to its picture.'},
 {id:'sentence-builder',icon:'icon-sentence-builder',title:'Sentence Builder',ps:'جمله جوړونکی',filters:['sentences'],stage:'sentences',skill:'Put words in order to make sentences.'},
 {id:'story-detective',icon:'icon-story-detective',title:'Story Detective',ps:'د قیصې جاسوس',filters:['sentences'],stage:'sentences',skill:'Read a short story and find the details.'}
];
// The course sequence the games follow (Pashto drafts).
export const pathStages=[
 {id:'letters',en:'Letters',ps:'توري'},{id:'sounds',en:'Sounds',ps:'اوازونه'},{id:'blending',en:'Blending',ps:'یو ځای کول'},
 {id:'words',en:'Words',ps:'لفظونه'},{id:'spelling',en:'Spelling',ps:'املا'},{id:'sentences',en:'Sentences',ps:'جملې'}
];
export const filters=[
 {id:'recommended',en:'Recommended',ps:'ستاسو د پاره'},{id:'letters',en:'Letters',ps:'توري'},{id:'sounds',en:'Sounds',ps:'اوازونه'},
 {id:'words',en:'Words',ps:'لفظونه'},{id:'sentences',en:'Sentences',ps:'جملې'},{id:'numbers',en:'Numbers',ps:'شمېرې'}
];
export const bankInfo=index;
export {approved,ui};
export const gameIndex=id=>games.findIndex(g=>g.id===id);

const loaders={
 'letter-hunt':()=>import('./bank/letter-hunt.json'),
 'sound-safari':()=>import('./bank/sound-safari.json'),
 'feed-animal':()=>import('./bank/feed-animal.json'),
 'number-adventure':()=>import('./bank/number-adventure.json'),
 'fox-apple':()=>import('./bank/fox-apple.json')
};
const cache={};
export function loadBank(id){return cache[id]||=loaders[id]().then(m=>m.default||m);}
