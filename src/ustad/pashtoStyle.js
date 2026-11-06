// Lower Dir (Malakand) Pashto house style, approved by the user on 2026-10-26:
// polite plural (تاسو، وکړئ), ګوته کېږدئ for "tap", اواز, د پاره, مدد, قیصه, English digits.
// convertPashto() applies only these word-level rules. Anything a rule cannot settle safely
// (ته as "you" vs "to", the clitic دې, "are you" endings) is reported in `checks`, not guessed.
// Letters and marks only, so Arabic punctuation (، ؟ ؛) still ends a word.
const L='\\p{L}\\p{M}';
const word=w=>new RegExp(`(^|[^${L}])${w}(?=$|[^${L}])`,'gu');
const rword=w=>new RegExp(`\\b(?:${w})\\b`,'gi');
// Singular command → polite plural, with the Roman Pashto spelling of each.
export const pluralVerbs=[
 ['وکړه','وکړئ','wakra','wakrai'],['ورکړه','ورکړئ','warkra','warkrai'],['کړه','کړئ','kra','krai'],
 ['واوره','واورئ','waawra','waawrai'],['وګوره','وګورئ','wagora','wagorai'],['ګوره','ګورئ','gora','gorai'],
 ['ووایه','ووایئ','wawaaya','wawaayai'],['کېږده','کېږدئ','kegda','kegdai'],['راځه','راځئ','raaza','raazai'],
 ['ولوله','ولولئ','walwala','walwalai'],['وپېژنه','وپېژنئ','wapezhana','wapezhanai'],['وټاکه','وټاکئ','wataaka','wataakai'],
 ['شه','شئ','sha','shai'],['وکاروه','وکاروئ','wakaarawa','wakaarawai'],['ولیکه','ولیکئ','walika','walikai'],['لیکه','لیکئ','lika','likai'],
 ['ونیسه','ونیسئ','wanisa','wanisai'],['وکاږه','وکاږئ','wakaaga','wakaagai'],['وغواړه','وغواړئ','waghwaara','waghwaarai'],
 ['واخله','واخلئ','waakhla','waakhlai'],['وساته','وساتئ','wasaata','wasaatai'],['ساته','ساتئ','saata','saatai'],
 ['وشمېره','وشمېرئ','washmera','washmerai'],['وباسه','وباسئ','wabaasa','wabaasai'],['ومومه','ومومئ','wamoma','wamomai'],
 ['وپلټه','وپلټئ','waplata','waplatai'],['وښیه','وښیئ','wakhaya','wakhayai'],['وخوځوه','وخوځوئ','wakhozawa','wakhozawai'],
 ['واړوه','واړوئ','waarawa','waarawai'],['ومنه','ومنئ','wamana','wamanai'],['ومینځه','ومینځئ','waminza','waminzai'],
 ['ودروه','ودروئ','wadrawa','wadrawai'],['وازمویه','وازمویئ','waazmoya','waazmoyai'],['کېږه','کېږئ','kega','kegai'],
 ['واغونده','واغوندئ','waaghonda','waaghondai'],['وواهه','وواهئ','wawaha','wawahai'],['ورسوه','ورسوئ','warasawa','warasawai'],
 ['ولټوه','ولټوئ','walatawa','walatawai'],['کېنه','کېنئ','kena','kenai'],
 ['راشه','راشئ','raasha','raashai'],['راکړه','راکړئ','raakra','raakrai'],
 ['کوه','کوئ','kawa','kawai'],['کاروه','کاروئ','kaarawa','kaarawai'],['لګوه','لګوئ','lagawa','lagawai'],
 // "You" verb endings (-ې → -ئ); these forms only ever mean "you".
 ['کوې','کوئ','kawe','kawai'],['واورې','واورئ','waawre','waawrai'],['وینې','وینئ','wine','winai'],['لرې','لرئ','lare','larai'],
 ['شې','شئ','she','shai'],['غواړې','غواړئ','ghwaare','ghwaarai'],['وایې','وایئ','waaye','waayai'],['پوهېږې','پوهېږئ','pohege','pohegai'],['لولې','لولئ','lwale','lwalai'],
 ['ووایې','ووایئ','wawaaye','wawaayai'],['ووینې','ووینئ','wawine','wawinai']
];
// Approved vocabulary and spelling choices.
export const vocabulary=[
 ['مرسته','مدد','marasta','madad'],['مرستې','مدد','maraste','madad'],
 ['لپاره','د پاره','lapara','da para'],
 ['کیسه','قیصه','kisa','qisa'],['کیسې','قیصې','kise|kisay','qise'],['کیسو','قیصو','kiso','qiso'],
 ['آواز','اواز','aawaz','aawaz'],['آوازونه','اوازونه','aawazuna','aawazuna'],
 ['دمه','آرام','dama','aaraam'],
 ['ستا','ستاسو','sta','staaso'],
 // Approved later: letter = ټکی (not توری), sound = اواز (not غږ).
 ['توری','ټکی','toray','takay'],['توري','ټکي','tori','taki'],['تورو','ټکو','toro','tako'],
 ['غږونه','اوازونه','ghagona|ghaguna','aawazuna'],['غږونو','اوازونو','ghagono','aawazuno'],['غږ','اواز','ghag','aawaz']
];
const DIGITS='۰۱۲۳۴۵۶۷۸۹',ARABIC_DIGITS='٠١٢٣٤٥٦٧٨٩';
const PREPOSITIONS='په|د|له|پر|تر|لکه|هم|نو|چې|کله';
// These forms are also past tense (وکړه "did", وکاږه "traced") or a noun (واوره "snow"),
// so they change only when the English line is an instruction.
const AMBIGUOUS=new Set(['کړه','وکړه','ورکړه','راکړه','وکاږه','واوره','وواهه']);
const INSTRUCTION=/(^|[.!?:;]\s+|[“"]|·\s*)(please|let[’']?s|don[’']?t|listen|tap|choose|look|say|find|write|read|try|put|build|use|make|ask|tell|draw|trace|match|count|show|point|watch|pick|spell|type|fill|complete|practi[cs]e|repeat|check|start|take|keep|stay|open|close|give|help|wash|add|change|join|turn|come|go|remember|think|imagine|cover|hide|play|learn|sing|move|touch|copy|describe|compare|notice|explore|discover|see|hear|be|sit|stand|wait|stop|clap|jump|smile|wear|bring|eat|drink|share|finish|save|continue)\b/i;
const PAST_ENGLISH=/\b(\w{3,}ed|did|made|had|was|were|found|went|saw|ate|wrote|got|took|came|gave|won|bought|built|been)\b/i;
// A past-tense subject in the same Pashto clause (ما وکړه "I did") means it is not a command.
const PAST_AGENT=/(^|[\s(])(ما|موږ|مونږ|هغه|هغې|هغوی|دوی|پرون|تا)(?=\s)/u;
const NOUN_LEARNING=/(په |د )زده کړه|زده کړه(?= جاري)/gu;
// Rewrites one Pashto line (and its Roman form) in the approved style. `english` is the line's
// English text, used to tell instructions from past-tense sentences.
// Returns {ps, rps, changed, checks:[reasons]} — checks are for the user's review.
export function convertPashto(ps='',rps='',english=''){
 let p=String(ps),r=String(rps);const checks=[];const before=p;
 const instruction=!english||INSTRUCTION.test(english),pastEnglish=!instruction&&PAST_ENGLISH.test(english);
 // Shield the noun زده کړه ("learning") from the verb rules.
 const nouns=[];p=p.replace(NOUN_LEARNING,m=>{nouns.push(m);return `${nouns.length-1}`;});
 const swap=(sg,pl,rsg,rpl,verb=false)=>{
  if(!word(sg).test(p))return;
  const ambiguous=verb&&AMBIGUOUS.has(sg);
  if(ambiguous&&(sg==='واوره'?!instruction:pastEnglish))return;
  // A command is changed only when the Roman Pashto confirms the same word.
  if(verb&&r&&!rword(rsg).test(r)){checks.push(`Kept ${sg}: the Roman Pashto shows a different word, so it may not be a command`);return;}
  let changedHere=false;
  p=p.replace(word(sg),(m,pre,offset,all)=>{if(ambiguous){const clause=all.slice(0,offset).split(/[.!؟?،;:]/).pop();if(PAST_AGENT.test(clause))return m;}changedHere=true;return pre+pl;});
  if(!changedHere)return;
  if(r){if(rword(rsg).test(r))r=r.replace(rword(rsg),m=>m[0]===m[0].toUpperCase()?rpl[0].toUpperCase()+rpl.slice(1):rpl);else checks.push(`Roman Pashto for ${pl} not found`);}
 };
 for(const row of pluralVerbs)swap(...row,true);
 // A verb ending in ېږه (ځلېږه, پوهېږه) is a singular command: ېږئ, Roman -ega → -egai.
 // Two or more letters before ېږه, so the noun مېږه (sheep) is left alone.
 const ezha=new RegExp(`((?<![${L}])[${L}]{2,}ېږ)ه(?=$|[^${L}])`,'gu');
 if(ezha.test(p)){p=p.replace(new RegExp(ezha.source,'gu'),'$1ئ');if(r){if(/\b[a-z]+ega\b/i.test(r))r=r.replace(/\b([a-z]+eg)a\b/gi,'$1ai');else checks.push('Roman Pashto for the -ېږئ verb not found');}}
 for(const row of vocabulary)swap(...row);
 // تا (you, past) → تاسو. Roman "ta" also means "to", so only change it when no ته is present.
 if(word('تا').test(p)){p=p.replace(word('تا'),'$1تاسو');if(r&&!word('ته').test(p)&&rword('ta').test(r))r=r.replace(rword('ta'),m=>m[0]==='T'?'Taaso':'taaso');else if(r)checks.push('Roman Pashto for تاسو needs checking');}
 // ته at the start of a sentence is "you" and needs the verb changed too: flag, don't guess.
 if(new RegExp(`(^|[.!؟?،]\\s*)ته(?=\\s)`).test(p))checks.push('Starts with ته ("you"): needs rewriting in the plural');
 // The clitic دې ("your", "by you") becomes مو; دې after a preposition means "this" and stays.
 if(new RegExp(`(^|[^${L}])(?<!(?:${PREPOSITIONS}) )دې(?=$|[^${L}])`,'u').test(p))checks.push('Contains دې: if it means "your/by you", change it to مو');
 if(/یې؟\s*$/.test(p))checks.push('Ends with یې؟: if it means "are you", use یئ؟');
 p=p.replace(/[۰-۹]/g,d=>String(DIGITS.indexOf(d))).replace(/[٠-٩]/g,d=>String(ARABIC_DIGITS.indexOf(d)));
 p=p.replace(/(\d+)/g,(_,i)=>nouns[i]);
 return {ps:p,rps:r,changed:p!==before,checks};
}
