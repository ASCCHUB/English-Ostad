# مرسته → مدد (2026-10-27)

Every Pashto and Roman Pashto string changed by scripts/pashto-madad.mjs. Course text in curriculum.json also flows into the app's course.json and the audio scripts.
One grammar change needs review: in supportAdvanced.js, "زما مرسته یې وکړه" became "زما مدد یې وکړ" (masculine past).

## src/ustad/adventureContent.js

- وګوره او واوره. بیا په جواب ګوته کېږده. که نه پوهېږې، مرسته وغواړه او بیا کوشش وکړه.
  → وګوره او واوره. بیا په جواب ګوته کېږده. که نه پوهېږې، مدد وغواړه او بیا کوشش وکړه.
- Wagora aw waawra. Bya pa jawaab gwata kegda. Ka na pohege, marasta waghwaara aw bya koshish wakra.
  → Wagora aw waawra. Bya pa jawaab gwata kegda. Ka na pohege, madad waghwaara aw bya koshish wakra.

## src/ustad/firstSteps/FirstSteps.jsx

- اواز ونه چلېد. بیا کوشش وکړئ، یا له یو مشر نه مرسته وغواړئ.
  → اواز ونه چلېد. بیا کوشش وکړئ، یا له یو مشر نه مدد وغواړئ.
- دا د مرستې مشق دی. بل کوشش به پخپله کوئ.
  → دا د مدد مشق دی. بل کوشش به پخپله کوئ.
- د مشر مرسته او د اوازونو معلومات
  → د مشر مدد او د اوازونو معلومات

## src/ustad/SoundKit.jsx

- پښتو مرسته
  → پښتو مدد

## src/ustad/supportAdvanced.js

- ژمنه یا اټکل: زه به درسره مرسته وکړم. لمر به وي.
  → ژمنه یا اټکل: زه به درسره مدد وکړم. لمر به وي.
- Zhmana ya atkal: Za ba darsara marasta wakram. Lmar ba wi.
  → Zhmana ya atkal: Za ba darsara madad wakram. Lmar ba wi.
- مه خفه کېږه. زه به درسره مرسته وکړم.
  → مه خفه کېږه. زه به درسره مدد وکړم.
- Ma khapa kega. Za ba darsara marasta wakram.
  → Ma khapa kega. Za ba darsara madad wakram.
- who → خلک: هغه استاذ چې زما مرسته یې وکړه مهربان دی.
  → who → خلک: هغه استاذ چې زما مدد یې وکړ مهربان دی.
- who → khalak: Hagha ustaaz che zama marasta ye wakra mehrabaan day.
  → who → khalak: Hagha ustaaz che zama madad ye wakr mehrabaan day.
- ډاکټر هغه کس دی چې له ناروغانو سره مرسته کوي. پېښور هغه ښار دی چې زه پکې زېږېدلی یم.
  → ډاکټر هغه کس دی چې له ناروغانو سره مدد کوي. پېښور هغه ښار دی چې زه پکې زېږېدلی یم.
- Daktar hagha kas day che la naaroghaano sara marasta kawi. Pekhawar hagha khaar day che za pake zezedalay yam.
  → Daktar hagha kas day che la naaroghaano sara madad kawi. Pekhawar hagha khaar day che za pake zezedalay yam.
- مهرباني وکړه، په دې پوښتنه کې زما مرسته کولی شې؟
  → مهرباني وکړه، په دې پوښتنه کې زما مدد کولی شې؟
- Mehrabani wakra, pa de pukhtana ke zama marasta kawalay she?
  → Mehrabani wakra, pa de pukhtana ke zama madad kawalay she?
- ستاسو د مرستې مننه. په درناوي، علي.
  → ستاسو د مدد مننه. په درناوي، علي.
- Staaso da maraste manana. Pa dranaawi, Ali.
  → Staaso da madad manana. Pa dranaawi, Ali.
- “زه به مرسته وکړم.” → هغه وویل چې مرسته به وکړي.
  → “زه به مدد وکړم.” → هغه وویل چې مدد به وکړي.
- “Za ba marasta wakram.” → Hagha wawayal che marasta ba wakri.
  → “Za ba madad wakram.” → Hagha wawayal che madad ba wakri.

## src/ustad/supportCopy.js

- لږ مرسته
  → لږ مدد
- Lag marasta
  → Lag madad
- لا نه. مرسته وګوره او بیا کوشش وکړه.
  → لا نه. مدد وګوره او بیا کوشش وکړه.
- La na. Marasta wagora aw bya koshish wakra.
  → La na. Madad wagora aw bya koshish wakra.
- ګیدړ یو ورک ستوری پیدا کوي. هغه ورسره کور ته د تللو مرسته کوي. واوره، بیا خبرې پیدا کړه.
  → ګیدړ یو ورک ستوری پیدا کوي. هغه ورسره کور ته د تللو مدد کوي. واوره، بیا خبرې پیدا کړه.
- Gidar yaw wrak storay paida kawi. Hagha warsara kor ta da tlalo marasta kawi. Waawra, bya khabare paida kra.
  → Gidar yaw wrak storay paida kawi. Hagha warsara kor ta da tlalo madad kawi. Waawra, bya khabare paida kra.
- سوی له ګیدړ سره مرسته کوي. څوک مرسته کوي؟
  → سوی له ګیدړ سره مدد کوي. څوک مدد کوي؟
- Soy la gidar sara marasta kawi. Sok marasta kawi?
  → Soy la gidar sara madad kawi. Sok madad kawi?
- چې څوک درسره مرسته وکړي، ووایه “Thank you” (مننه).
  → چې څوک درسره مدد وکړي، ووایه “Thank you” (مننه).
- Che sok darsara marasta wakri, wawaaya “Thank you” (manana).
  → Che sok darsara madad wakri, wawaaya “Thank you” (manana).
- له کارکوونکي یا بل باوري مشر نه مرسته وغواړه.
  → له کارکوونکي یا بل باوري مشر نه مدد وغواړه.
- La kaarkawunkee ya bal baawari mashar na marasta waghwaara.
  → La kaarkawunkee ya bal baawari mashar na madad waghwaara.
- مهرباني وکړه، زما د کور مشر په پیدا کولو کې مرسته راسره وکړه.
  → مهرباني وکړه، زما د کور مشر په پیدا کولو کې مدد راسره وکړه.
- Mehrabani wakra, zama da kor mashar pa paida kawalo ke marasta raasara wakra.
  → Mehrabani wakra, zama da kor mashar pa paida kawalo ke madad raasara wakra.
- خوشاله، خفه، اندېښمن او ډېر خوشاله احساسات دي. موږ خپل احساس نومولی شو او باوري مشر ته یې ویلی شو. ښه خبرې له ملګري سره مرسته کوي.
  → خوشاله، خفه، اندېښمن او ډېر خوشاله احساسات دي. موږ خپل احساس نومولی شو او باوري مشر ته یې ویلی شو. ښه خبرې له ملګري سره مدد کوي.
- Khushala, khapa, andekhman aw der khushala ehsaasaat di. Mung khpal ehsaas noomawalay shoo aw baawari mashar ta ye wayalay shoo. Kha khabare la malgaree sara marasta kawi.
  → Khushala, khapa, andekhman aw der khushala ehsaasaat di. Mung khpal ehsaas noomawalay shoo aw baawari mashar ta ye wayalay shoo. Kha khabare la malgaree sara madad kawi.
- پاملرنه او مرسته وړاندې کړه.
  → پاملرنه او مدد وړاندې کړه.
- Paamlarana aw marasta wraande kra.
  → Paamlarana aw madad wraande kra.
- مرسته درسره وکړم؟
  → مدد درسره وکړم؟
- Marasta darsara wakram?
  → Madad darsara wakram?
- د خوړو نه مخکې او د تشناب نه وروسته لاسونه په صابون او اوبو ومینځه. د ورځني پاملرنې لپاره له مشر نه مرسته وغواړه.
  → د خوړو نه مخکې او د تشناب نه وروسته لاسونه په صابون او اوبو ومینځه. د ورځني پاملرنې لپاره له مشر نه مدد وغواړه.
- Da khwaro na makhke aw da tashnaab na wroosta laasona pa saboon aw obo wamenza. Da wrazanee paamlarane lapara la mashar na marasta waghwaara.
  → Da khwaro na makhke aw da tashnaab na wroosta laasona pa saboon aw obo wamenza. Da wrazanee paamlarane lapara la mashar na madad waghwaara.
- له کارکوونکي نه مرسته وغواړه
  → له کارکوونکي نه مدد وغواړه
- La kaarkawunkee na marasta waghwaara
  → La kaarkawunkee na madad waghwaara
- په دوکان کې مرسته غواړې. ته څه ویلی شې؟
  → په دوکان کې مدد غواړې. ته څه ویلی شې؟
- Pa dukaan ke marasta ghwaare. Ta sa wayalay she?
  → Pa dukaan ke madad ghwaare. Ta sa wayalay she?
- مهرباني وکړه، زما مرسته کولی شې؟
  → مهرباني وکړه، زما مدد کولی شې؟
- Mehrabani wakra, zama marasta kawalay she?
  → Mehrabani wakra, zama madad kawalay she?
- د کورنۍ، خوړو، لوبو، جامو او بدن لفظونه د کور په اړه خبرو کې مرسته کوي. This is my book. (دا زما کتاب دی.)
  → د کورنۍ، خوړو، لوبو، جامو او بدن لفظونه د کور په اړه خبرو کې مدد کوي. This is my book. (دا زما کتاب دی.)
- Da kornai, khwaro, lobo, jaamo aw badan lafzuna da kor pa ara khabaro ke marasta kawi. This is my book. (Da zama kitaab day.)
  → Da kornai, khwaro, lobo, jaamo aw badan lafzuna da kor pa ara khabaro ke madad kawi. This is my book. (Da zama kitaab day.)
- ګیدړ یو ورک ستوری پیدا کوي. سوی او کشپ مرسته کوي. ملګري یو ځای کار کولی شي.
  → ګیدړ یو ورک ستوری پیدا کوي. سوی او کشپ مدد کوي. ملګري یو ځای کار کولی شي.
- Gidar yaw wrak storay paida kawi. Soy aw kashap marasta kawi. Malgari yaw zaay kaar kawalay shi.
  → Gidar yaw wrak storay paida kawi. Soy aw kashap madad kawi. Malgari yaw zaay kaar kawalay shi.
- “An apple, please.” (یوه مڼه، مهرباني.) “Thank you.” (مننه.) “Please help me find my grown-up.” (زما د مشر په پیدا کولو کې مرسته وکړه.) ګټور او ښه لفظونه تمرین کړه.
  → “An apple, please.” (یوه مڼه، مهرباني.) “Thank you.” (مننه.) “Please help me find my grown-up.” (زما د مشر په پیدا کولو کې مدد وکړه.) ګټور او ښه لفظونه تمرین کړه.
- “An apple, please.” (Yawa mana, mehrabani.) “Thank you.” (Manana.) “Please help me find my grown-up.” (Zama da mashar pa paida kawalo ke marasta wakra.) Gatawar aw kha lafzuna tamreen kra.
  → “An apple, please.” (Yawa mana, mehrabani.) “Thank you.” (Manana.) “Please help me find my grown-up.” (Zama da mashar pa paida kawalo ke madad wakra.) Gatawar aw kha lafzuna tamreen kra.
- اوس له ${n[0]} سره په “${m?.ps||x}” کې مرسته وکړه!
  → اوس له ${n[0]} سره په “${m?.ps||x}” کې مدد وکړه!
- Os la ${n[1]} sara pa “${m?.rps||x}” ke marasta wakra!
  → Os la ${n[1]} sara pa “${m?.rps||x}” ke madad wakra!

## src/ustad/supportScreens.js

- یو مهربان ګیدړ له وړوکي ستوري سره د کور لارې په موندلو کې مرسته کوي.
  → یو مهربان ګیدړ له وړوکي ستوري سره د کور لارې په موندلو کې مدد کوي.
- Yaw mehrabaan gidar la warokee stori sara da kor laare pa moondalo ke marasta kawi.
  → Yaw mehrabaan gidar la warokee stori sara da kor laare pa moondalo ke madad kawi.
- دا سبقونه لږ ګران وو. بیا یې لوبول په یادولو کې مرسته کوي.
  → دا سبقونه لږ ګران وو. بیا یې لوبول په یادولو کې مدد کوي.
- Da sabaquna lag graan wo. Bya ye lobawal pa yaadawalo ke marasta kawi.
  → Da sabaquna lag graan wo. Bya ye lobawal pa yaadawalo ke madad kawi.
- پای همداسې پرېږده. لومړی اواز بدل کړه چې بل لفظ جوړ شي. بېلګې واوره او که مرسته غواړې له مشر سره اوازونه یو ځای کړه.
  → پای همداسې پرېږده. لومړی اواز بدل کړه چې بل لفظ جوړ شي. بېلګې واوره او که مدد غواړې له مشر سره اوازونه یو ځای کړه.
- Paay hamdaase pregda. Lumray aawaz badal kra che bal lafz jor shi. Belge waawra aw ke marasta ghwaare la mashar sara aawaazuna yaw zaay kra.
  → Paay hamdaase pregda. Lumray aawaz badal kra che bal lafz jor shi. Belge waawra aw ke madad ghwaare la mashar sara aawaazuna yaw zaay kra.
- د پوهېدو مرسته راسره وکړه
  → د پوهېدو مدد راسره وکړه
- Da pohedo marasta raasara wakra
  → Da pohedo madad raasara wakra

## src/ustad/supportSound.js

- پښتو مرسته
  → پښتو مدد
- Pakhto marasta
  → Pakhto madad

## docs/beginner-course-phase1/curriculum.json

- اوس یې پخپله وکړئ. که مرسته پکار وي، د مرستې بټن ووهئ.
  → اوس یې پخپله وکړئ. که مدد پکار وي، د مدد بټن ووهئ.
- د پلار سره څوک مرسته کولی شي؟
  → د پلار سره څوک مدد کولی شي؟

## docs/beginner-course-phase1/curriculum.md

- **Pashto instruction:** اوس یې پخپله وکړئ. که مرسته پکار وي، د مرستې بټن ووهئ.
  → **Pashto instruction:** اوس یې پخپله وکړئ. که مدد پکار وي، د مدد بټن ووهئ.

## docs/beginner-course-phase1/audio-manifest.json

- اوس یې پخپله وکړئ. که مرسته پکار وي، د مرستې بټن ووهئ.
  → اوس یې پخپله وکړئ. که مدد پکار وي، د مدد بټن ووهئ.
- د پلار سره څوک مرسته کولی شي؟
  → د پلار سره څوک مدد کولی شي؟

## docs/beginner-course-phase1/audio-recording-list.csv

- اوس یې پخپله وکړئ. که مرسته پکار وي، د مرستې بټن ووهئ.
  → اوس یې پخپله وکړئ. که مدد پکار وي، د مدد بټن ووهئ.
- د پلار سره څوک مرسته کولی شي؟
  → د پلار سره څوک مدد کولی شي؟

## docs/beginner-course-phase2/audio-recording-list.csv

- اوس یې پخپله وکړئ. که مرسته پکار وي، د مرستې بټن ووهئ.
  → اوس یې پخپله وکړئ. که مدد پکار وي، د مدد بټن ووهئ.
- د پلار سره څوک مرسته کولی شي؟
  → د پلار سره څوک مدد کولی شي؟

## docs/english-ustad-language-review.json

- وګوره او واوره. بیا په جواب ګوته کېږده. که نه پوهېږې، مرسته وغواړه او بیا کوشش وکړه.
  → وګوره او واوره. بیا په جواب ګوته کېږده. که نه پوهېږې، مدد وغواړه او بیا کوشش وکړه.
- Wagora aw waawra. Bya pa jawaab gwata kegda. Ka na pohege, marasta waghwaara aw bya koshish wakra.
  → Wagora aw waawra. Bya pa jawaab gwata kegda. Ka na pohege, madad waghwaara aw bya koshish wakra.
