// Pashto for the games, in the approved everyday Malakand / Lower Dir style (polite plural, ګوته کېږدئ, اواز, لفظ, توری).
// "approved" lines are the reviewer's own wording (copied from locales/ps.js). Every other line is a draft:
// status "check" means it waits for the reviewer and must not be presented as reviewed.
// No Pashto here is spoken by a device voice; Pashto audio plays only from recordings in public/audio/ps/.
export const approved={
 start:'سبق شروع کړئ.',
 whichCorrect:'صحیح جواب کوم یو دی؟',
 taskDone:'ډېر ښه، تاسو ټاسک پوره کړو',
 tryAgain:'بیا کوشش وکړئ',
 hint:'لږ مدد',
 takeBreak:'لږ آرام وکړئ',
 greatJob:'شاباش!',
 firstTry:'په اول ځل مو صحیح کړو!',
 keptTrying:'تاسو کوشش جاري وساتلو او صحیح جواب مو پیدا کړو!',
 listen:'واورئ',
 next:'بل',
 play:'لوبې',
 whatLearned:'تاسو څه زده کړل',
 pashtoHelp:'په پښتو کې مدد',
 back:'واپس',
 continueLearning:'سبق جاري وساتئ',
 placeSaved:'ستاسو ځای محفوظ دی.',
 newBadge:'نوی بیج'
};
// Drafts for the game screens (waiting for review).
export const ui={
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
};
// Instruction templates per skill. {x} = an English word, kept in English inside the Pashto line.
export const templates={
 'find-upper':'په لوی توري {x} ګوته کېږدئ.',
 'find-lower':'په وړوکي توري {x} ګوته کېږدئ.',
 'match-upper-lower':'د لوی توري {x} وړوکی توری کوم یو دی؟',
 'match-lower-upper':'د وړوکي توري {x} لوی توری کوم یو دی؟',
 'first-letter':'لفظ {x} په کوم توري شروع کېږي؟',
 'letter-in-word':'په لفظ {x} کې دا توری پیدا کړئ.',
 'sequence':'کوم توری ورک دی؟ الفبې ته ترتیب سره وګورئ.',
 'after':'د {x} نه پس کوم توری راځي؟',
 'before':'د {x} نه مخکې کوم توری راځي؟',
 'sound-letter':'دا اواز واورئ. کوم توری دا اواز ورکوي؟',
 'initial-sound':'لفظ {x} په کوم اواز شروع کېږي؟',
 'sound-picture':'کوم تصویر په دې اواز شروع کېږي؟',
 'final-sound':'د لفظ {x} په آخر کې کوم اواز دی؟',
 'vowel':'د لفظ {x} په مینځ کې کوم اواز دی؟',
 'blend':'اوازونه یو ځای کړئ. کوم لفظ جوړ شو؟',
 'food-name':'په {x} ګوته کېږدئ.',
 'animal-name':'{x} پیدا کړئ.',
 'feed':'انګرېزي هدایت واورئ او ځناور ته صحیح خوراک ورکړئ.',
 'feed-color':'د رنګ لفظ ته غوږ ونیسئ، بیا صحیح خوراک ورکړئ.',
 'feed-count':'شمېر ته غوږ ونیسئ، بیا هغه پلېټ ورکړئ چې صحیح شمېر پکې دی.',
 'who-eats':'کوم ځناور دا خوراک خوري؟',
 'action':'د کار لفظ واورئ او په هغه تصویر ګوته کېږدئ.',
 'two-step':'اول اول کار وکړئ، بیا دویم کار وکړئ.',
 'count':'وشمېرئ. څو دي؟',
 'match-quantity':'هغه ډله پیدا کړئ چې دا شمېر پکې دی.',
 'number-word':'د شمېر لفظ واورئ او شمېر پیدا کړئ.',
 'number-name':'دا شمېر په انګرېزي کې څنګه لیکل کېږي؟',
 'number-spell':'کوم توری ورک دی؟',
 'more':'په کومه ډله کې زیات دي؟',
 'fewer':'په کومه ډله کې لږ دي؟',
 'equal':'کومه ډله برابره ده؟',
 'number-sequence':'کوم شمېر ورک دی؟',
 'add':'دواړه یو ځای کړئ. ټول څو شول؟',
 'find-object':'ګیدړ ته {x} پیدا کړئ.',
 'find-color':'ګیدړ ته د صحیح رنګ شی پیدا کړئ.',
 'size':'لوی او وړوکی وګورئ، بیا صحیح شی پیدا کړئ.',
 'position':'وګورئ چې شی چېرته دی: لاندې، څنګ ته، شاته، باندې یا دننه.',
 'color-position':'رنګ او ځای دواړه وګورئ.',
 'true-sentence':'کومه جمله صحیح ده؟ تصویر وګورئ.',
 'build-sentence':'لفظونه په ترتیب سره کېږدئ او جمله جوړه کړئ.'
};
// Word meanings the app's Pashto list does not have yet (drafts, waiting for review).
export const newMeanings={
 under:'لاندې',beside:'څنګ ته',behind:'شاته',on:'باندې',in:'کې / دننه','in front of':'مخې ته',
 big:'لوی',small:'وړوکی',more:'زیات',fewer:'لږ',same:'برابر',
 uppercase:'لوی توری',lowercase:'وړوکی توری',letter:'توری',sound:'اواز',
 table:'مېز',basket:'ټوکرۍ',bone:'هډوکی',seed:'دانه',insect:'چینجی',cheese:'پنیر',nut:'غوزان',
 orange:'نارنجي',purple:'بنفش',pink:'ګلابي',white:'سپین',
 eleven:'یوولس',twelve:'دولس',thirteen:'دیارلس',fourteen:'څوارلس',fifteen:'پنځلس',sixteen:'شپاړس',seventeen:'اوولس',eighteen:'اتلس',nineteen:'نولس',twenty:'شل'
};
