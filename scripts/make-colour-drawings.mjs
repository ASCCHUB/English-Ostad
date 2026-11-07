// Coloured drawings drawn in their exact colour (no CSS colour filter, which some Android phones ignore and
// which turned a "red" ball blue). Writes public/drawings/ball-<colour>.svg, the coloured objects that course
// sentences name ("the red bag", "the green kite") and adds them to src/ustad/drawings.json.
// Colour words (red, blue …) show the ball of that colour through drawingAlias in src/ustad/wordPhotos.js.
// Usage: node scripts/make-colour-drawings.mjs
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const ink='#3B3A36',bg='#FFF4DC';
export const COLOURS={red:'#E53935',blue:'#1E88E5',green:'#43A047',yellow:'#FDD835',orange:'#FB8C00',purple:'#8E24AA',pink:'#F06292',brown:'#8D5524',black:'#263238',white:'#FFFFFF',grey:'#9E9E9E'};
const svg=body=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img"><rect width="200" height="200" rx="28" fill="${bg}"/><g stroke="${ink}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>\n`;
const ball=(name,c)=>{const band=name==='white'?'#B0BEC5':name==='yellow'||name==='orange'?'#FFFFFF':'#FFF3D6';
 return `<defs><clipPath id="b"><circle cx="100" cy="104" r="64"/></clipPath></defs><circle cx="100" cy="104" r="64" fill="${c}"/><path d="M30 138Q96 64 172 86" fill="none" stroke="${band}" stroke-width="20" clip-path="url(#b)"/><ellipse cx="76" cy="74" rx="14" ry="9" fill="#FFFFFF" opacity=".45" stroke="none"/><circle cx="100" cy="104" r="64" fill="none"/>`;};
const art={};
for(const [name,c] of Object.entries(COLOURS))art['ball-'+name]=ball(name,c);
art['bag-red']=`<path d="M78 60q0-30 22-30t22 30" fill="none"/><rect x="48" y="58" width="104" height="120" rx="28" fill="${COLOURS.red}"/><rect x="66" y="116" width="68" height="46" rx="12" fill="#B71C1C"/><path d="M66 132H134" fill="none" stroke-width="4"/><path d="M60 84H140" fill="none" stroke-width="4"/>`;
art['coat-red']=`<path d="M72 34H128L162 66L152 180H48L38 66Z" fill="${COLOURS.red}"/><path d="M38 66L20 150L42 156L58 98" fill="${COLOURS.red}"/><path d="M162 66L180 150L158 156L142 98" fill="${COLOURS.red}"/><path d="M80 34L100 80L120 34" fill="#B71C1C"/><path d="M100 80V180" fill="none" stroke-width="4"/><circle cx="112" cy="104" r="5" fill="${ink}" stroke="none"/><circle cx="112" cy="130" r="5" fill="${ink}" stroke="none"/><circle cx="112" cy="156" r="5" fill="${ink}" stroke="none"/>`;
art['kite-green']=`<path d="M100 150q-20 14 0 24t0 22" fill="none" stroke-width="4"/><path d="M90 164l-14 6l14 6zM106 184l14 4l-14 8z" fill="#F7D35C"/><path d="M100 20L156 80L100 150L44 80Z" fill="${COLOURS.green}"/><path d="M100 20V150M44 80H156" fill="none" stroke-width="4"/>`;
art['hen-red']=`<path d="M34 100q-18-20-4-40q14 14 20 30" fill="${COLOURS.red}"/><ellipse cx="96" cy="120" rx="62" ry="46" fill="${COLOURS.red}"/><circle cx="140" cy="70" r="26" fill="${COLOURS.red}"/><path d="M128 46q6-14 12 0q6-14 12 0q4 8-4 10h-18z" fill="#8E1B14"/><path d="M164 70l16 6l-16 6z" fill="#F2A65A"/><circle cx="146" cy="66" r="5" fill="${ink}" stroke="none"/><path d="M70 112q24 20 48 0" fill="none" stroke-width="5"/><path d="M84 166v18M110 166v18" fill="none" stroke="#F2A65A" stroke-width="6"/>`;
art['frog-green']=`<path d="M52 150q-30 10-34 30h44zM148 150q30 10 34 30h-44z" fill="${COLOURS.green}"/><ellipse cx="100" cy="126" rx="64" ry="48" fill="${COLOURS.green}"/><circle cx="70" cy="76" r="22" fill="${COLOURS.green}"/><circle cx="130" cy="76" r="22" fill="${COLOURS.green}"/><circle cx="70" cy="74" r="11" fill="#FFFFFF"/><circle cx="130" cy="74" r="11" fill="#FFFFFF"/><circle cx="72" cy="75" r="5" fill="${ink}" stroke="none"/><circle cx="128" cy="75" r="5" fill="${ink}" stroke="none"/><path d="M70 122q30 22 60 0" fill="none" stroke-width="5"/><ellipse cx="100" cy="150" rx="34" ry="16" fill="#A5D6A7" stroke="none"/>`;
for(const [word,body] of Object.entries(art))await writeFile(new URL(`public/drawings/${word}.svg`,root),svg(body));
const listUrl=new URL('src/ustad/drawings.json',root),list=new Set(JSON.parse(await readFile(listUrl,'utf8')));
Object.keys(art).forEach(w=>list.add(w));
await writeFile(listUrl,JSON.stringify([...list].sort())+'\n');
console.log(`Colour drawings: ${Object.keys(art).length} written to public/drawings/.`);
