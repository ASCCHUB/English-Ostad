import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom',logLevel:'error'});
try{
 const {default:WordPicture}=await server.ssrLoadModule('/src/ustad/WordPicture.jsx');
 const {Picture}=await server.ssrLoadModule('/src/ustad/firstSteps/parts.jsx');
 const {photoLibrary}=await server.ssrLoadModule('/src/ustad/wordPhotos.js');
 for(const word of Object.keys(photoLibrary.words)){
  const html=renderToStaticMarkup(createElement(WordPicture,{word}));
  assert.ok(html.includes('<img'),word);assert.ok(!html.includes('undefined'),word);
  if(photoLibrary.words[word].kind==='count')assert.equal([...html.matchAll(/<img /g)].length,photoLibrary.words[word].count,word);
 }
 const pen=renderToStaticMarkup(createElement('button',{'aria-label':'Hear the picture word'},createElement(Picture,{word:'pen'})));
 assert.ok(pen.includes('/learning-photos/pen.png'));assert.ok(!pen.includes('🖊'));assert.ok(!pen.includes('alt="pen"'));
 const css=await readFile('src/ustad/wordPictures.css','utf8');
 const content=['pen','pencil','apple','ball','book','cat','mouse','school','mother','doctor','happy','sad','red','green','one','ten'].map(word=>`<div class="card">${renderToStaticMarkup(createElement(WordPicture,{word,size:120}))}<p>${word}</p></div>`).join('');
 await mkdir('output',{recursive:true});
 await writeFile('output/realistic-picture-review.html',`<!doctype html><meta charset="utf-8"><style>body{font:18px system-ui;margin:0;color:#13283d;background:#fffaf0}section{padding:24px}.grid{display:grid;grid-template-columns:repeat(8,1fr);gap:15px}.card{text-align:center;border:1px solid #b9cfda;border-radius:18px;padding:16px;background:#fff}.dark{background:#1b3044;color:#fff}.dark .card{background:#21374d}${css}</style><section><h1>Realistic learning pictures · Light</h1><div class="grid">${content}</div></section><section class="dark"><h1>Realistic learning pictures · Dark</h1><div class="grid">${content}</div></section>`);
 console.log(`${Object.keys(photoLibrary.words).length} image renderings, exact quantity counts and pen cue passed.`);
}finally{await server.close();}
