// Structured word data shared by the game banks. Every word listed here must have a picture
// (src/ustad/wordPhotos.json or public/drawings); scripts/build-game-bank.mjs refuses to build otherwise.

// ---------- Letters ----------
export const upperShape={A:'A has two slanted lines and a bar across the middle.',B:'B is a tall line with two bumps on the right.',C:'C is an open curve, like a moon. It is open on the right.',D:'D is a tall line with one big bump on the right.',E:'E is a tall line with three lines going right.',F:'F is a tall line with two lines at the top and the middle. No line at the bottom.',G:'G looks like C with a little shelf inside.',H:'H is two tall lines joined in the middle.',I:'I is one tall line, often with a hat and a shoe.',J:'J is a hook that curves left at the bottom.',K:'K is a tall line with two arms kicking out.',L:'L is a tall line with a foot going right.',M:'M is two tall lines with a V between them, like two mountains.',N:'N is two tall lines joined by one slanted line.',O:'O is a big round circle.',P:'P is a tall line with one bump at the top.',Q:'Q is a circle with a little tail.',R:'R looks like P with a leg kicking out.',S:'S is a curvy snake.',T:'T is a tall line with a roof across the top.',U:'U is a cup shape.',V:'V is two lines that meet at a point at the bottom.',W:'W looks like two Vs side by side.',X:'X is two lines that cross.',Y:'Y is a small V sitting on a line.',Z:'Z goes across, slants down, then goes across again.'};
export const lowerShape={a:'a is a round shape with a short line on the right.',b:'b has a tall line first, then a round tummy on the right.',c:'c is a small open curve.',d:'d has a round tummy first, then a tall line on the right.',e:'e starts with a little line across, then curves round.',f:'f has a hook at the top and a short line across.',g:'g is a round shape with a tail that hooks below the line.',h:'h is a tall line with one hump.',i:'i is a short line with a dot on top.',j:'j has a hook below the line and a dot on top.',k:'k is a tall line with two little arms.',l:'l is one tall line.',m:'m is a short line with two humps.',n:'n is a short line with one hump.',o:'o is a small circle.',p:'p has a line that goes down below, with a round part at the top on the right.',q:'q has a round part on the left and a line that goes down below.',r:'r is a short line with a little arm.',s:'s is a small curvy snake.',t:'t is a line with a cross near the top.',u:'u is a small cup with a line on the right.',v:'v is a small point at the bottom.',w:'w looks like two small vs.',x:'x is two short lines that cross.',y:'y is a v with a long tail below the line.',z:'z is a small zig-zag.'};
// Letters that are easy to mix up: used as distractors first.
export const lookAlikeUpper={A:'HVM',B:'PDR',C:'GOQ',D:'BOP',E:'FBH',F:'EPT',G:'COQ',H:'NAK',I:'LTJ',J:'IUL',K:'XRH',L:'ITJ',M:'NWV',N:'MHZ',O:'QCD',P:'RBF',Q:'OGC',R:'PBK',S:'ZCG',T:'IFL',U:'VJO',V:'UWY',W:'MVN',X:'KYZ',Y:'VXT',Z:'SNX'};
export const lookAlikeLower={a:'oed',b:'dpq',c:'oea',d:'bqp',e:'coa',f:'tlj',g:'qpy',h:'nbk',i:'lj',j:'iy',k:'hxb',l:'it',m:'nwu',n:'mhu',o:'acb',p:'qbd',q:'pgd',r:'ntf',s:'zc',t:'fli',u:'nvw',v:'uyw',w:'mvu',x:'kyz',y:'vgj',z:'sx'};
export const letterName={A:'ay',B:'bee',C:'see',D:'dee',E:'ee',F:'ef',G:'jee',H:'aitch',I:'eye',J:'jay',K:'kay',L:'el',M:'em',N:'en',O:'oh',P:'pee',Q:'cue',R:'ar',S:'ess',T:'tee',U:'you',V:'vee',W:'double-you',X:'ex',Y:'why',Z:'zed'};

// Picture words for "Which letter does it start with?" (first letter only; no digraph starts).
export const firstLetterWords=['apple','ball','cat','dog','egg','fish','goat','hat','igloo','jam','kite','lion','moon','nest','orange','pen','queen','rabbit','sun','tree','umbrella','van','web','yogurt','zebra','banana','cup','duck','fox','gate','hen','ink','jug','key','leaf','milk','nose','pig','ring','zip'];
// A word and a letter that appears exactly once in it, away from the first position.
export const letterInWord=[['cat','t'],['bed','e'],['fish','s'],['lemon','m'],['tiger','g'],['camel','m'],['mango','g'],['horse','r'],['mouse','u'],['frog','o'],['snake','k'],['plane','l'],['bread','a'],['clock','l'],['bus','u'],['nest','s'],['lamp','p'],['hand','d'],['desk','k'],['jacket','j']];

// ---------- Sounds (ids are the course's sound ids in firstSteps gpcs) ----------
// Words for initial sounds, grouped so a distractor never shares the target's first sound.
export const initialSoundWords={
 s:['sun','sock','seed','soap'],a:['apple','ant'],t:['tree','tiger','tent','tap','tomato','tail'],p:['pen','pig','pan','pot','pear','peas'],i:['igloo','ink','insect'],n:['nest','nose','net','nut','nail','neck'],m:['moon','milk','mango','mouse','map','mop'],d:['dog','duck','door','desk','doll','dish'],g:['goat','gate','grapes','gift'],o:['octopus','ox'],c:['cat','cup','cow','car','cake','camel'],e:['egg','elephant','elbow'],u:['umbrella','up','uncle'],r:['rabbit','ring','rain','rice','rose'],h:['hat','hen','horse','house','hand'],b:['ball','bag','bed','bus','book','banana'],f:['fish','fox','fan','frog','foot'],l:['lion','leaf','lemon','lamp','log','leg'],j:['jam','jug','jet','jar','jacket','juice'],v:['van','vase','vest','vet'],w:['web','wig','window','watch','wing'],y:['yogurt','yo-yo'],z:['zebra','zip','zoo'],k:['kite','key','king','kettle']
};
// Final sounds: word → sound id.
export const finalSoundWords=[['cat','t'],['dog','g'],['sun','n'],['bus','s'],['cup','p'],['bed','d'],['hen','n'],['pig','g'],['jam','m'],['web','b'],['map','p'],['net','t'],['log','g'],['pan','n'],['pot','t'],['ram','m'],['van','n'],['jug','g'],['nut','t'],['hat','t'],['bat','t'],['kid','d'],['lid','d'],['cap','p'],['tap','p'],['bag','g'],['drum','m'],['leaf','f'],['roof','f'],['bell','l'],['seed','d'],['nail','l'],['tail','l'],['mop','p'],['wig','g']];
// Short middle vowel: word → vowel id.
export const vowelWords=[['cat','a'],['hat','a'],['bat','a'],['map','a'],['jam','a'],['pan','a'],['ram','a'],['van','a'],['bag','a'],['fan','a'],['hen','e'],['bed','e'],['pen','e'],['net','e'],['web','e'],['jet','e'],['leg','e'],['pig','i'],['pin','i'],['tin','i'],['kid','i'],['lid','i'],['wig','i'],['zip','i'],['dog','o'],['pot','o'],['log','o'],['mop','o'],['fox','o'],['sun','u'],['bus','u'],['cup','u'],['mug','u'],['nut','u']];
// Blending: picture words made only of single-letter sounds.
export const blendWords=['cat','hat','bat','mat','map','jam','pan','ram','van','bag','cap','tap','fan','can','hen','bed','pen','net','web','jet','leg','vet','pig','pin','tin','kid','lid','sit','fin','wig','zip','dog','pot','log','mop','sun','bus','cup','mug','nut','jug','bug','up'];
export const soundHint={s:'Make a snake sound: sss.',a:'Open your mouth wide: a, like the start of apple.',t:'Tap your tongue behind your teeth: t.',p:'Pop your lips: p.',i:'A short sound: i, like the start of ink.',n:'Hum with your tongue up: nnn.',m:'Close your lips and hum: mmm.',d:'Tap your tongue and use your voice: d.',g:'A sound from the back of your mouth: g.',o:'Make your mouth round: o, like the start of ox.',c:'A quick sound from the back of your mouth: k.',k:'A quick sound from the back of your mouth: k.',e:'A short sound: e, like the start of egg.',u:'A short sound: u, like the start of up.',r:'Growl like a little dog: rrr.',h:'Breathe out like you are tired: h.',b:'Pop your lips with your voice: b.',f:'Bite your lip gently and blow: fff.',l:'Put your tongue up behind your teeth: lll.',j:'A quick sound: j, like the start of jam.',v:'Bite your lip gently and buzz: vvv.',w:'Make your lips round: w.',x:'Two sounds together: k and s, like the end of fox.',y:'A quick sound: y, like the start of yellow.',z:'Buzz like a bee: zzz.'};

// ---------- Animals and food (accurate, age-appropriate pairings) ----------
// serve: foods used as correct answers. eats: everything the animal might eat (never used as a wrong answer for it).
export const animals={
 rabbit:{serve:['carrot','leaf'],eats:['carrot','leaf','apple','peas','cucumber','strawberry']},
 monkey:{serve:['banana','mango','orange'],eats:['banana','mango','orange','apple','grapes','peach','pear','nut','insect','leaf','cherry','strawberry','watermelon']},
 bird:{serve:['seed','corn'],eats:['seed','corn','insect','cherry','grapes','apple','rice','nut']},
 hen:{serve:['corn','seed','rice'],eats:['corn','seed','rice','insect','peas','bread','leaf']},
 dog:{serve:['bone','meat'],eats:['bone','meat','fish','egg','rice','carrot']},
 cat:{serve:['fish','meat'],eats:['fish','meat','egg','milk']},
 goat:{serve:['leaf'],eats:['leaf','carrot','apple','corn','flower','banana']},
 horse:{serve:['apple','carrot'],eats:['apple','carrot','corn','leaf','pear','watermelon']},
 elephant:{serve:['banana','watermelon','leaf'],eats:['banana','watermelon','leaf','apple','carrot','corn','mango']},
 bear:{serve:['honey','fish'],eats:['honey','fish','cherry','nut','apple','insect','meat','grapes']},
 mouse:{serve:['cheese','seed','nut'],eats:['cheese','seed','nut','corn','bread','apple','rice']},
 duck:{serve:['peas','corn'],eats:['peas','corn','insect','leaf','seed','rice']},
 frog:{serve:['insect'],eats:['insect']},
 turtle:{serve:['leaf'],eats:['leaf','strawberry','insect','fish','cucumber']},
 camel:{serve:['leaf'],eats:['leaf','corn','carrot']},
 bee:{serve:['flower'],eats:['flower','honey']},
 butterfly:{serve:['flower'],eats:['flower','watermelon','orange','banana']},
 lion:{serve:['meat'],eats:['meat']},
 tiger:{serve:['meat'],eats:['meat','fish']}
};
// Foods with pictures, used as choices.
export const foods=['carrot','banana','apple','grapes','mango','orange','pear','peach','cherry','lemon','strawberry','watermelon','corn','peas','potato','tomato','onion','cucumber','mushroom','bread','rice','egg','milk','cheese','honey','meat','fish','cake','juice','nut','bone','seed','insect','leaf','flower'];
// Foods that are easy to count in groups.
export const countableFoods=['carrot','banana','mango','orange','apple','bone','fish','corn','nut','leaf','flower','pear','strawberry','cheese'];
export const actions=['run','jump','eat','drink','sleep','swim','walk'];
export const animalActions=[['duck','swim'],['fish','swim'],['frog','jump'],['rabbit','jump'],['horse','run'],['dog','run'],['cat','sleep'],['bear','sleep'],['cow','drink'],['camel','drink'],['elephant','drink'],['monkey','jump'],['turtle','walk'],['hen','walk'],['goat','jump'],['lion','sleep'],['tiger','run'],['sheep','walk']];
export const plural={carrot:'carrots',banana:'bananas',mango:'mangoes',orange:'oranges',apple:'apples',bone:'bones',fish:'fish',corn:'corn cobs',nut:'nuts',leaf:'leaves',flower:'flowers',pear:'pears',strawberry:'strawberries',cheese:'pieces of cheese',seed:'seeds',insect:'insects',peas:'peas',rice:'rice',meat:'meat',honey:'honey',watermelon:'watermelons',grapes:'grapes'};
// "a carrot", "some rice": the article used when giving one of a food.
export const article={apple:'an',orange:'an',insect:'an',egg:'an',onion:'an',seed:'some',corn:'some',rice:'some',peas:'some',meat:'some',honey:'some',cheese:'some',grapes:'some',milk:'some',juice:'some',bread:'some',leaf:'a',flower:'a'};

// ---------- Numbers ----------
export const numberWords=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
export const countObjects=['fish','bird','duck','egg','banana','carrot','leaf','cup','book','pencil','car','kite','hat','key','bee','butterfly','cat','dog','ball','star','apple','flower','balloon','orange','mango','boat','spoon','sock','tree','bus'];

// ---------- Fox: everyday objects, colours, positions ----------
export const foxObjects=['apple','banana','orange','mango','grapes','pear','peach','cherry','lemon','strawberry','watermelon','book','pen','pencil','bag','ball','key','cup','spoon','clock','hat','shoes','socks','umbrella','kite','watch','phone','box','candle','lamp'];
// Positions each landmark can show clearly.
export const landmarkPositions={tree:['under','beside','behind','in'],chair:['on','under','beside','behind'],table:['on','under','beside'],bed:['on','under','beside'],box:['in','on','beside','behind'],basket:['in','beside','behind'],house:['behind','beside','in front of'],car:['in','beside','behind','in front of']};
// Scenes give each Fox level a setting with landmarks that belong there.
export const foxScenes=[
 {id:'garden',title:'The garden',landmarks:['tree','basket','house']},
 {id:'kitchen',title:'The kitchen',landmarks:['table','chair','basket']},
 {id:'bedroom',title:'The bedroom',landmarks:['bed','box','chair']},
 {id:'classroom',title:'The classroom',landmarks:['table','chair','box']},
 {id:'street',title:'The street',landmarks:['car','house','tree']},
 {id:'picnic',title:'The picnic',landmarks:['basket','tree','box']}
];
