# Games: Pashto waiting for review

Written for: the Pashto reviewer (Lower Dir / Malakand style).

Everything below is a **draft** (status `check`). It is shown as optional Pashto help in the games, never spoken by a device voice. Approved lines (`سبق شروع کړئ.`, `صحیح جواب کوم یو دی؟`, `ډېر ښه، تاسو ټاسک پوره کړو` and the other approved app lines) are used unchanged.

Edit wording in `src/ustad/games/content/pashto.js`, then run `npm run games:build && npm run games:check`.

**Question for you:** approved lines use both **توری** ("Choose the letter you hear") and **ټکی** ("Trace the letter", class names, "Letter Hunt" = د ټکو لټون). The game drafts use توری. Which should the games use?

## Instruction lines (40)

| Pashto draft ({x} = English word kept in English) | Questions |
|---|---|
| وګورئ چې شی چېرته دی: لاندې، څنګ ته، شاته، باندې یا دننه. ({x}) | 50 |
| لفظ {x} په کوم توري شروع کېږي؟ | 40 |
| لفظ {x} په کوم اواز شروع کېږي؟ | 40 |
| اوازونه یو ځای کړئ. کوم لفظ جوړ شو؟ | 40 |
| شمېر ته غوږ ونیسئ، بیا هغه پلېټ ورکړئ چې صحیح شمېر پکې دی. | 40 |
| د لفظ {x} په آخر کې کوم اواز دی؟ | 35 |
| د لفظ {x} په مینځ کې کوم اواز دی؟ | 35 |
| رنګ او ځای دواړه وګورئ. | 35 |
| انګرېزي هدایت واورئ او ځناور ته صحیح خوراک ورکړئ. | 34 |
| کوم تصویر په دې اواز شروع کېږي؟ | 30 |
| وشمېرئ. څو دي؟ | 30 |
| دواړه یو ځای کړئ. ټول څو شول؟ | 30 |
| ګیدړ ته {x} پیدا کړئ. | 30 |
| په لوی توري {x} ګوته کېږدئ. | 26 |
| په وړوکي توري {x} ګوته کېږدئ. | 26 |
| د لوی توري {x} وړوکی توری کوم یو دی؟ | 26 |
| د وړوکي توري {x} لوی توری کوم یو دی؟ | 26 |
| هغه ډله پیدا کړئ چې دا شمېر پکې دی. | 25 |
| کوم شمېر ورک دی؟ | 25 |
| ګیدړ ته د صحیح رنګ شی پیدا کړئ. | 25 |
| کومه جمله صحیح ده؟ تصویر وګورئ. | 25 |
| په {x} ګوته کېږدئ. | 24 |
| د رنګ لفظ ته غوږ ونیسئ، بیا صحیح خوراک ورکړئ. | 24 |
| په لفظ {x} کې دا توری پیدا کړئ. | 20 |
| دا اواز واورئ. کوم توری دا اواز ورکوي؟ | 20 |
| {x} پیدا کړئ. | 20 |
| کوم ځناور دا خوراک خوري؟ | 20 |
| اول اول کار وکړئ، بیا دویم کار وکړئ. | 20 |
| د شمېر لفظ واورئ او شمېر پیدا کړئ. | 20 |
| دا شمېر په انګرېزي کې څنګه لیکل کېږي؟ | 20 |
| کوم توری ورک دی؟ | 20 |
| لوی او وړوکی وګورئ، بیا صحیح شی پیدا کړئ. | 20 |
| د کار لفظ واورئ او په هغه تصویر ګوته کېږدئ. | 18 |
| کوم توری ورک دی؟ الفبې ته ترتیب سره وګورئ. | 16 |
| لفظونه په ترتیب سره کېږدئ او جمله جوړه کړئ. | 15 |
| په کومه ډله کې زیات دي؟ | 12 |
| په کومه ډله کې لږ دي؟ | 12 |
| د {x} نه پس کوم توری راځي؟ | 10 |
| د {x} نه مخکې کوم توری راځي؟ | 10 |
| کومه ډله برابره ده؟ | 6 |

## New word meanings (32)

| English | Pashto draft |
|---|---|
| uppercase | لوی توری |
| letter | توری |
| lowercase | وړوکی توری |
| sound | اواز |
| seed | دانه |
| insect | چینجی |
| nut | غوزان |
| cheese | پنیر |
| bone | هډوکی |
| eleven | یوولس |
| twelve | دولس |
| thirteen | دیارلس |
| fourteen | څوارلس |
| fifteen | پنځلس |
| sixteen | شپاړس |
| seventeen | اوولس |
| eighteen | اتلس |
| nineteen | نولس |
| twenty | شل |
| more | زیات |
| fewer | لږ |
| same | برابر |
| orange | نارنجي |
| big | لوی |
| small | وړوکی |
| under | لاندې |
| behind | شاته |
| on | باندې |
| in front of | مخې ته |
| beside | څنګ ته |
| table | مېز |
| in | کې / دننه |

## Screen labels (drafts)

```
learnThroughPlay:'د لوبې سره زده کړه',
 tryTogether:'راځئ چې یو ځای کوشش وکړو.',
 watchMe:'وګورئ، صحیح جواب دا دی.',
 continuePlaying:'لوبه جاري وساتئ',
 review:'تکرار',
 reviewNote:'دا هغه سوالونه دي چې ګران وو. یو ځل بیا یې وګورئ.',
 upcoming:'ژر راځي',
 roundDone:'دا پړاو پوره شو!',
 breakTime:'دا ښه وخت دی چې لږ آرام وکړئ.',
 paused:'لوبه ودرول شوه.',
 feed:'ورکړئ',
 levelLocked:'دا درجه لا تړلې ده.'
```

Also drafted in `src/ustad/games/catalog.js`: game descriptions, filter names (توري، اوازونه، لفظونه، جملې، شمېرې، ستاسو د پاره) and path stage names.
