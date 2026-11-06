import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import postcss from 'postcss';
const names=(await readdir('dist/assets')).filter(n=>n.endsWith('.css'));
const styles=await Promise.all(names.map(async name=>{
 const text=await readFile('dist/assets/'+name,'utf8');
 assert.ok(!/@media[^{}]*(?:width|height)\s*[<>]=?/.test(text),`${name}: media-query ranges break older Android WebViews`);
 return postcss.parse(text);
}));
function mediaMatches(query,width,height){return query.split(',').some(part=>{
 if(/prefers-|hover|pointer|print|not all/.test(part))return false;
 for(const m of part.matchAll(/\((min|max)-(width|height):\s*([\d.]+)px\)/g)){
  const actual=m[2]==='width'?width:height,limit=Number(m[3]);
  if(m[1]==='max'?actual>limit:actual<limit)return false;
 }
 if(/orientation:landscape/.test(part)&&width<=height)return false;
 if(/orientation:portrait/.test(part)&&width>height)return false;
 return true;
});}
function valueFor(selector,property,width,height){let found;
 for(const sheet of styles)sheet.walkRules(rule=>{
  if(!rule.selector.split(',').some(s=>s.trim()===selector))return;
  for(let p=rule.parent;p;p=p.parent)if(p.type==='atrule'&&p.name==='media'&&!mediaMatches(p.params,width,height))return;
  rule.walkDecls(property,decl=>{found=decl.value;});
 });
 return found;
}
for(const width of [320,360,375,390,412,480,600]){
 assert.equal(valueFor('.explorer-sidebar','display',width,740),'none',`Sidebar must be hidden at ${width}px`);
 assert.equal(valueFor('.explorer-main','margin-left',width,740),'0',`Lesson must use the full width at ${width}px`);
 assert.equal(valueFor('.explorer-app .explorer-header','display',width,740),'none',`Header must be hidden at ${width}px`);
}
console.log('Android CSS verified: compatible media queries; sidebar hidden and lesson margin removed at 320–600px.');
