// All support-language copy is draft and must be reviewed by a fluent teacher.
import {withPashto} from './pashto.js';
export const ui = {
 home:['My learning','زما سبقونه','Zama sabaquna','میری تعلیم','Meri taleem'],
 vocabulary:['Word garden','نوي لفظونه','Nawe lafzuna','الفاظ','Alfaaz'],
 games:['Play & practice','لوبې او مشق','Lobey aw mashq','کھیل اور مشق','Khel aur mashq'],
 progress:['My progress','ما څومره زده کړل؟','Ma somra zda kral?','میری پیش رفت','Meri pesh raft'],
 stories:['Story corner','کیسې','Kisey','کہانیاں','Kahaniyan'],
 downloads:['Offline lessons','بې انټرنېټه سبقونه','Be interneta sabaquna','آف لائن سبق','Offline sabaq'],
 parent:['Parent & teacher area','د مور، پلار او استاد برخه','Da mor, plaar aw ustaad barkha','والدین اور اساتذہ','Walidain aur asatiza'],
 alphabet:['Meet the alphabet','انګریزي توري','Angrezi tori','انگریزی حروف','Angrezi huroof'],
 phonics:['Sounds & phonics','د تورو اوازونه','Da toro aawaazuna','حروف کی آوازیں','Huroof ki aawazein'],
 spelling:['Spelling adventure','د لفظونو املا','Da lafzuno imla','ہجے کی مشق','Hijjay ki mashq'],
 reading:['Let’s read together','راځه چې ولولو','Raaza che walolo','آئیں پڑھیں','Aaiye parhein'],
 writing:['Write & trace','لیکل زده کړه','Likal zda kra','لکھنا سیکھیں','Likhna seekhein'],
 speaking:['Let’s talk','راځه خبرې وکړو','Raaza khabare wakro','آئیں بات کریں','Aaiye baat karein'],
 grammar:['Sentence builder','جملې جوړې کړه','Jumley jorey kra','جملے بنائیں','Jumlay banayein'],
 quiz:['Quiz time','د سوالونو وخت','Da sawaaluno wakht','سوالوں کا وقت','Sawalon ka waqt'],
 listen:['Listen','واوره','Waawra','سنیں','Sunein'],
 slow:['Slowly','ورو ورو','Wro wro','آہستہ','Aahista'],
 check:['Check my answer','جواب وګوره','Jawaab wagora','جواب دیکھیں','Jawab dekhein'],
 next:['Next','بل','Bal','اگلا','Agla'],
 retry:['Try again','بیا کوشش وکړه','Bya koshish wakra','دوبارہ کوشش کریں','Dobara koshish karein'],
 choose:['Choose the correct answer','صحیح جواب خوښ کړه','Sahih jawaab khwakh kra','صحیح جواب چنیں','Sahi jawab chunein'],
 order:['Put the letters in order','توري په صحیح ترتیب کېږده','Tori pa sahih tarteeb kegda','حروف ترتیب سے رکھیں','Huroof tarteeb se rakhein'],
 missing:['Which letter is missing?','کوم توری پکې نشته؟','Kum toray pake nishta?','کون سا حرف غائب ہے؟','Kaun sa harf ghaib hai?'],
 picture:['Which word matches the picture?','دا د څه شي تصویر دی؟','Da da sa shay tasweer day?','تصویر کس لفظ کی ہے؟','Tasveer kis lafz ki hai?'],
 audio:['Which word did you hear?','کوم لفظ دې واورېدو؟','Kum lafz de waawredo?','آپ نے کون سا لفظ سنا؟','Aap ne kaun sa lafz suna?'],
 letter:['Choose the letter you hear','کوم توری دې واورېدو؟','Kum toray de waawredo?','سنا ہوا حرف چنیں','Suna hua harf chunein'],
 start:['Let’s start learning','راځه، سبق شروع کړو','Raaza, sabaq shuru kro','سیکھنا شروع کریں','Seekhna shuru karein'],
 continue:['Continue learning','خپل سبق جاري کړه','Khpal sabaq jaari kra','سیکھنا جاری رکھیں','Seekhna jari rakhein']
};
export function localized(key,language){const row=ui[key];if(!row)return key;if(language==='ps'||language==='rps'){const item=withPashto({en:row[0],ps:row[1],rps:row[2]});return language==='ps'?item.ps:item.rps;}return row[{ur:3,rur:4}[language]||0];}
