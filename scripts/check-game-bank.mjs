// Validates every game bank: npm run games:check (also run by npm test).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateBank} from '../src/ustad/games/validateBank.js';
import {recordings} from '../src/ustad/firstSteps/tasks.js';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'src/ustad/games/bank');
const index=JSON.parse(fs.readFileSync(path.join(dir,'index.json'),'utf8'));
let failed=0,total=0;const pashto={check:0,approved:0},meanings={};
for(const id of Object.keys(index.games)){
 const bank=JSON.parse(fs.readFileSync(path.join(dir,id+'.json'),'utf8'));
 const errors=validateBank(bank,{recordings,fileExists:src=>fs.existsSync(path.join(root,'public',src))});
 if(index.games[id].questions!==bank.questions.length)errors.push(`${id}: index says ${index.games[id].questions}, bank has ${bank.questions.length}`);
 total+=bank.questions.length;
 for(const q of bank.questions){pashto[q.instruction.ps.status]++;for(const g of q.gloss)meanings[g.status]=(meanings[g.status]||0)+1;}
 console.log(`${errors.length?'✗':'✓'} ${id}: ${bank.questions.length} questions, ${new Set(bank.questions.map(q=>q.skill)).size} skills`);
 errors.slice(0,30).forEach(e=>console.log('   '+e));failed+=errors.length;
}
console.log(`${total} questions. Pashto instructions: ${pashto.approved} approved, ${pashto.check} waiting for review. Word meanings by status:`,meanings);
if(failed){console.error(`${failed} problems`);process.exit(1);}
