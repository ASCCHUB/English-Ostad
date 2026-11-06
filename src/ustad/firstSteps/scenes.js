// A reusable scene vocabulary, not a switch on lesson IDs. New authored scenes
// can supply the same roles without changing the activity components.
export function sceneFor(text){
 const s=String(text).toLowerCase(),people=[];
 if(s.includes('ayesha')||s.startsWith('she '))people.push({id:'ayesha',label:'Ayesha',emoji:'👧'});
 if(s.includes('ali')||s.startsWith('i ')||s.startsWith('we ')||s.startsWith('he '))people.unshift({id:'ali',label:'Ali',emoji:'🧒'});
 if(s.includes('mum'))people.push({id:'mum',label:null,emoji:'👩'});if(s.includes('dad'))people.push({id:'dad',label:null,emoji:'👨'});
 if(s.startsWith('we ')&&!people.some(p=>p.id==='ayesha'))people.push({id:'ayesha',label:'Ayesha',emoji:'👧'});
 const objects=['apples','apple','red ball','ball','book','pen','bag','bread','rice','milk','cat','hands','mat','goat','sheep','hen','duck','coat','hat','rain','sun','frog','kite','dog','cake','box'];
 const object=objects.find(w=>new RegExp('\\b'+w+'s?\\b').test(s))||null;
 const place=/in (the|a) box/.test(s)?'box':/in (the|a) bag/.test(s)?'bag':/on (the|a) desk/.test(s)?'desk':/on (the|a) mat/.test(s)?'mat':/in (the|a) shed/.test(s)?'shed':s.includes('school')?'school':s.includes('park')?'park':s.includes('farm')?'farm':/\bhome\b/.test(s)?'home':null;
 return {people,object:object==='red ball'?'ball':object,red:object==='red ball',place,relation:s.includes(' in ')?'in':s.includes(' on ')?'on':null,action:s.includes(' like ')?'like':s.includes(' go ')?'go':s.includes('wash')?'wash':s.includes('get up')?'get_up':s.includes('here you are')?'give':null,feeling:s.includes('happy')?'happy':s.includes('sad')?'sad':null};
}
